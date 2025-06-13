import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prisma";

type AdminSession = { user?: { email?: string; isAdmin?: boolean; }; };

interface EditDossierBody {
  id: string;
  title: string;
  description?: string;
  price: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions) as AdminSession;
  if (!session?.user?.isAdmin) return res.status(401).json({ error: "unauthorized" });

  const { id, title, description, price } = req.body as EditDossierBody;
  if (!id || !title || !price) return res.status(400).json({ error: "missing" });

  await prisma.dossier.update({
    where: { id },
    data: { title, description, price: parseFloat(price) },
  });

  res.status(200).json({ ok: true });
}
