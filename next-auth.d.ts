// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      isAdmin?: boolean;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    }
  }
}
