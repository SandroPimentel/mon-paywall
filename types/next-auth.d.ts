import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email?: string;
      isAdmin?: boolean;
      [key: string]: any;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
  }
}
