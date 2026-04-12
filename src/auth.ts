import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { getAuthEnvRequired } from "@/config/env/server-env";
import { createMongoAuthAdapter } from "@/lib/auth/mongo-adapter";
import { getUserAccessSnapshot, type AccessSnapshot } from "@/lib/auth/access";
import { verifyPassword } from "@/lib/auth/password";
import { SYSTEM_ROLE } from "@/lib/auth/constants";
import { normalizeIdentifier } from "@/lib/auth/code";
import {
  assignRoleToUserBySlug,
  findUserByEmail,
  findUserById,
  findUserByIdentifier,
  markUserEmailVerified,
} from "@/server/modules/users/repositories/user-auth.repository";
import { credentialsSignInSchema } from "@/server/modules/users/validators/auth.schemas";
import { serverLogger } from "@/server/common/logging/server-logger";

const env = getAuthEnvRequired(process.env);
const emptyAccessSnapshot: AccessSnapshot = {
  roles: [],
  permissions: [],
};

const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      identifier: {
        label: "Email or phone",
        type: "text",
      },
      password: {
        label: "Password",
        type: "password",
      },
    },
    async authorize(rawCredentials) {
      const parsed = credentialsSignInSchema.safeParse(rawCredentials);
      if (!parsed.success) {
        return null;
      }

      const identifier = parsed.data.identifier.includes("@")
        ? normalizeIdentifier(parsed.data.identifier)
        : parsed.data.identifier.trim();

      const user = await findUserByIdentifier(identifier);
      if (!user || !user.passwordHash || !user.isActive) {
        return null;
      }

      const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);
      if (!isValidPassword) {
        return null;
      }

      if (user.email && !user.emailVerified) {
        throw new Error("EMAIL_NOT_VERIFIED");
      }

      await assignRoleToUserBySlug(user.id, SYSTEM_ROLE.USER);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: env.GOOGLE_ALLOW_EMAIL_ACCOUNT_LINKING ?? false,
    }),
  );

  serverLogger.debug("Google OAuth provider is enabled.");
} else {
  serverLogger.warn("Google OAuth provider is disabled because credentials are not configured.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  trustHost: env.AUTH_TRUST_HOST ?? (env.NODE_ENV === "development"),
  adapter: createMongoAuthAdapter(),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      const normalizedEmail = user.email ? normalizeIdentifier(user.email) : undefined;

      if (account?.provider === "google" && !normalizedEmail) {
        serverLogger.warn("Google sign-in rejected because provider did not return an email.", {
          provider: account.provider,
        });
        return false;
      }

      const dbUser = user.id
        ? await findUserById(user.id)
        : (normalizedEmail ? await findUserByEmail(normalizedEmail) : null);

      if (!dbUser) {
        return account?.provider === "google";
      }

      if (!dbUser.isActive) {
        return false;
      }

      if (dbUser.email && !dbUser.emailVerified) {
        if (account?.provider === "credentials") {
          return false;
        }

        // OAuth providers (Google) are trusted by provider verification.
        if (account?.provider) {
          await markUserEmailVerified(dbUser.id);
        } else {
          return false;
        }
      }

      await assignRoleToUserBySlug(dbUser.id, SYSTEM_ROLE.USER);
      return true;
    },
    async jwt({ token }) {
      if (!token.sub) {
        return token;
      }

      const user = await findUserById(token.sub);

      if (!user || !user.isActive) {
        return {
          ...token,
          sub: undefined,
          roles: [],
          permissions: [],
          mustChangePassword: false,
        };
      }

      let access = emptyAccessSnapshot;

      try {
        access = await getUserAccessSnapshot(user.id);
      } catch (error) {
        serverLogger.error("Unable to resolve access snapshot for jwt callback.", {
          userId: user.id,
          error,
        });
      }

      token.roles = access.roles;
      token.permissions = access.permissions;
      token.mustChangePassword = user.mustChangePassword;

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = {
          name: typeof token.name === "string" ? token.name : null,
          email: typeof token.email === "string" ? token.email : null,
          image: typeof token.picture === "string" ? token.picture : null,
        };
      }

      session.user.id = token.sub ?? "";
      session.user.roles = (token.roles as string[] | undefined) ?? [];
      session.user.permissions = (token.permissions as string[] | undefined) ?? [];
      session.user.mustChangePassword = Boolean(token.mustChangePassword);

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        if (url === "/" || url === "/home") return `${baseUrl}/browse`;
        return `${baseUrl}${url}`;
      }

      try {
        const parsedUrl = new URL(url);
        return parsedUrl.origin === baseUrl ? url : `${baseUrl}/browse`;
      } catch {
        return `${baseUrl}/browse`;
      }
    },
  },
});
