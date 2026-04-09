import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { getAuthEnvRequired } from "@/config/env/server-env";
import { getUserAccessSnapshot } from "@/lib/auth/access";
import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db/client";
import { SYSTEM_ROLE } from "@/lib/auth/constants";
import { normalizeIdentifier } from "@/lib/auth/code";
import {
  assignRoleToUserBySlug,
  findUserByIdentifier,
} from "@/server/modules/users/repositories/user-auth.repository";
import { credentialsSignInSchema } from "@/server/modules/users/validators/auth.schemas";

const env = getAuthEnvRequired(process.env);

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
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),
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
      const resolvedUserId = user.id
        ?? (
          user.email
            ? (
              await db.user.findUnique({
                where: { email: user.email },
                select: { id: true },
              })
            )?.id
            : undefined
        );

      if (!resolvedUserId) {
        return false;
      }

      const dbUser = await db.user.findUnique({
        where: {
          id: resolvedUserId,
        },
        select: {
          id: true,
          isActive: true,
          email: true,
          emailVerified: true,
        },
      });

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
          await db.user.update({
            where: { id: dbUser.id },
            data: { emailVerified: new Date() },
          });
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

      const [access, user] = await Promise.all([
        getUserAccessSnapshot(token.sub),
        db.user.findUnique({
          where: {
            id: token.sub,
          },
          select: {
            mustChangePassword: true,
          },
        }),
      ]);

      token.roles = access.roles;
      token.permissions = access.permissions;
      token.mustChangePassword = user?.mustChangePassword ?? false;

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      session.user.id = token.sub ?? "";
      session.user.roles = (token.roles as string[] | undefined) ?? [];
      session.user.permissions = (token.permissions as string[] | undefined) ?? [];
      session.user.mustChangePassword = Boolean(token.mustChangePassword);

      return session;
    },
  },
});
