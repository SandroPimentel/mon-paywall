import type { NextApiRequest, NextApiResponse } from "next";

type CoingeckoPrice = {
  bitcoin: {
    usd: number;
  };
};

// Optionnel : simple cache mémoire (1 minute)
let lastFetch: number = 0;
let lastPrice: CoingeckoPrice | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const now = Date.now();
  if (lastPrice && now - lastFetch < 60 * 1000) {
    return res.status(200).json(lastPrice);
  }

  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
    const coingecko = await fetch(url);
    if (!coingecko.ok) {
      return res.status(502).json({ error: "CoinGecko error" });
    }
    const data: CoingeckoPrice = await coingecko.json();
    lastFetch = now;
    lastPrice = data;
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: "fetch_failed" });
  }
}
