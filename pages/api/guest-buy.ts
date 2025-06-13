import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

type GuestBuyBody = {
  dossierId: string;
  email: string;
  txid: string;
  amountBtc: number;     // montant payé en BTC
  btcUsdRate: number;    // taux BTC/USD au moment du paiement
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
  const { dossierId, email, txid, amountBtc, btcUsdRate } = req.body as GuestBuyBody;
  if (!dossierId || !email || !txid || !amountBtc || !btcUsdRate) return res.status(400).json({ error: "missing" });

  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
    return res.status(400).json({ error: "invalid_email" });
  }

  const dossier = await prisma.dossier.findUnique({ where: { id: dossierId } });
  if (!dossier) return res.status(404).json({ error: "not found" });

  // Empêche d'acheter 2x le même dossier avec le même mail
  const already = await prisma.guestPurchase.findFirst({
    where: { dossierId, email }
  });
  if (already) return res.status(200).json({ ok: true });

  // Enregistre l'achat (et montant/taux)
  await prisma.guestPurchase.create({
    data: { dossierId, email, txid, amountBtc, btcUsdRate }
  });

  // Notif Telegram
  try {
    await sendTelegramNotif(
      `✅ <b>NOUVEL ACHAT (non vérifié)</b>\nEmail : <code>${email}</code>\nDossier : <b>${dossier.title}</b>\nTXID : <code>${txid}</code>\nMontant : <b>${amountBtc} BTC</b>\nTaux BTC/USD : <b>${btcUsdRate}$</b>`
    );
  } catch (err) {
    console.error("Erreur notif Telegram :", err);
  }

  res.status(200).json({ ok: true });
}
