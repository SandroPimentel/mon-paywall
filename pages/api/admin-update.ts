import type { NextApiRequest, NextApiResponse, GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prisma";
import { hash } from "bcryptjs";

type AdminSession = { user?: { email?: string; isAdmin?: boolean } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(
    req as GetServerSidePropsContext["req"],
    res as GetServerSidePropsContext["res"],
    authOptions
  ) as AdminSession;

  if (!session?.user?.isAdmin) return res.status(401).json({ error: "unauthorized" });

  const { email, password } = req.body as { email: string; password?: string };

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "email manquant" });
  }

  const dataToUpdate: { email: string; password?: string } = { email };
  if (password && password.length > 3) {
    dataToUpdate.password = await hash(password, 10);
  }

  await prisma.user.updateMany({
    where: { isAdmin: true },
    data: dataToUpdate,
  });

  res.status(200).json({ ok: true });
}
