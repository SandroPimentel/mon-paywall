import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "../../lib/prisma";

type AdminSession = { user?: { isAdmin?: boolean } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as AdminSession;
  if (!session?.user?.isAdmin) return res.status(401).end();

  const purchases = await prisma.guestPurchase.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(purchases);
}
