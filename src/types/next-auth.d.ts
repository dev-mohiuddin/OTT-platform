import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: string[];
      permissions: string[];
      mustChangePassword: boolean;
    } & Session["user"];
  }

  interface User {
    roles?: string[];
    permissions?: string[];
    mustChangePassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: string[];
    permissions?: string[];
    mustChangePassword?: boolean;
  }
}
