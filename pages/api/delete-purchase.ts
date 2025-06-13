import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });

  try {
    await prisma.guestPurchase.delete({ where: { id } });
    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
}
