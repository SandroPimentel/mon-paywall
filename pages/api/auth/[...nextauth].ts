import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import { compare } from "bcryptjs";
import { User } from "@/types/user";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });
        if (user && user.password) {
          const valid = await compare(credentials!.password, user.password);
          if (valid) return user as User;
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // user peut être User | AdapterUser | undefined
      if (user && typeof user === "object" && "isAdmin" in user) {
        token.isAdmin = (user as User).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      // session: Session, token: JWT
      if (token && session.user) {
        session.user.isAdmin = token.isAdmin as boolean | undefined;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
