import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

const BTC_ADDRESS = "bc1qaukltdwvanelgy66y486f7ahz222tkxqjk76ua"; // Pas utilisé ici mais tu peux garder

type GuestBuyBody = {
  dossierId: string;
  email: string;
  txid: string;
};

async function sendTelegramNotif(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { dossierId, email, txid } = req.body as GuestBuyBody;
  if (!dossierId || !email || !txid) return res.status(400).json({ error: "missing" });

  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
    return res.status(400).json({ error: "invalid_email" });
  }

  const dossier = await prisma.dossier.findUnique({ where: { id: dossierId } });
  if (!dossier) return res.status(404).json({ error: "not found" });

  // Vérifie si déjà acheté
  const already = await prisma.guestPurchase.findFirst({
    where: { dossierId, email }
  });
  if (already) return res.status(200).json({ ok: true });

  await prisma.guestPurchase.create({
    data: { dossierId, email },
  });

  // Notif Telegram avec le TXID
  try {
    await sendTelegramNotif(
      `✅ <b>NOUVEL ACHAT (à vérifier manuellement)</b>\nEmail : <code>${email}</code>\nDossier : <b>${dossier.title}</b>\nTXID : <code>${txid}</code>`
    );
  } catch (err) {
    console.error("Erreur notif Telegram :", err);
  }

  res.status(200).json({ ok: true });
}
