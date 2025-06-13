import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prisma";

type AdminSession = { user?: { email?: string; isAdmin?: boolean; }; };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getServerSession(req, res, authOptions) as AdminSession;
  if (!session?.user?.isAdmin) return res.status(401).json({ error: "unauthorized" });

  const { title, description, price } = req.body as { title: string; description?: string; price: string };
  if (!title || !price) return res.status(400).json({ error: "missing" });

  const dossier = await prisma.dossier.create({
    data: { title, description, price: parseFloat(price), files: "[]" },
  });

  res.status(200).json({ dossier });
}
