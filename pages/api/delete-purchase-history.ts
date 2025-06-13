import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prisma";

type AdminSession = { user?: { isAdmin?: boolean } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = (await getServerSession(req, res, authOptions as any)) as AdminSession;
  if (!session?.user?.isAdmin) return res.status(401).json({ error: "unauthorized" });

  await prisma.guestPurchase.deleteMany({});
  res.status(200).json({ ok: true });
}
