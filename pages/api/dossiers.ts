import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const dossiers = await prisma.dossier.findMany({ orderBy: { createdAt: "desc" } });
  res.status(200).json(dossiers);
}
