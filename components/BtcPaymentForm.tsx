"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dossier } from "@/types/dossier";

const BTC_ADDRESS = "bc1qaukltdwvanelgy66y486f7ahz222tkxqjk76ua";

export default function BtcPaymentForm({ dossier }: { dossier: Dossier }) {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [priceBtc, setPriceBtc] = useState<string>("");
  const [btcPriceFetchedAt, setBtcPriceFetchedAt] = useState<number>(Date.now());

  useEffect(() => {
    async function fetchBtcPrice() {
      try {
        const res = await fetch("/api/coingecko");
        const data = await res.json();
        if (data && data.bitcoin && typeof data.bitcoin.usd === "number") {
          setBtcPrice(data.bitcoin.usd);
          setBtcPriceFetchedAt(Date.now());
        } else {
          setBtcPrice(null);
        }
      } catch {
        setBtcPrice(null);
      }
    }
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (btcPrice) {
      setPriceBtc((dossier.price / btcPrice).toFixed(8));
    } else {
      setPriceBtc("");
    }
  }, [btcPrice, dossier.price]);

  const [email, setEmail] = useState("");
  const [txid, setTxid] = useState("");
  const [status, setStatus] = useState("");

  async function handleAchat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Envoi de la commande...");
    const res = await fetch("/api/guest-buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dossierId: dossier.id,
        email,
        txid,
        amountBtc: Number(priceBtc),
        btcUsdRate: btcPrice
      }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setStatus("✅ Commande enregistrée ! Vous recevrez l'accès prochainement.");
    } else {
      setStatus(data.error ? "❌ " + data.error : "❌ Une erreur est survenue.");
    }
  }

  // Calcul du temps de validité (60min)
  const validityDuration = 60 * 60 * 1000; // 1 heure en ms
  const timeLeft = btcPriceFetchedAt + validityDuration - Date.now();
  const isPriceExpired = timeLeft < 0;
  const minWarning = Math.max(1, Math.floor(timeLeft / 60000));

  return (
    <form onSubmit={handleAchat}>
      <h3>Payer ce dossier par Bitcoin</h3>
      <p>
        Prix&nbsp;: <b>{dossier.price}$</b>&nbsp;
        {btcPrice !== null ? (
          <>
            (~<b>{priceBtc} BTC</b>)
            <br />
            <small style={{ color: "var(--txt-soft)" }}>
              1 BTC = {btcPrice}$ (maj auto)
            </small>
          </>
        ) : (
          <span style={{ color: "var(--danger)" }}>Impossible de récupérer le taux BTC/USD pour le moment.</span>
        )}
      </p>
      <div style={{ display: "flex", gap: 28, alignItems: "center", margin: "18px 0" }}>
        <QRCodeSVG value={BTC_ADDRESS} size={128} />
        <div>
          <div style={{
            fontFamily: "monospace",
            fontSize: 20,
            background: "#222325",
            padding: 12,
            borderRadius: 10,
            wordBreak: "break-all",
            color: "var(--accent2)"
          }}>
            {BTC_ADDRESS}
          </div>
          <a href={`https://blockstream.info/address/${BTC_ADDRESS}`}
             target="_blank"
             rel="noopener noreferrer"
             style={{ fontSize: 15, color: "var(--accent)" }}>
            Voir sur Blockstream
          </a>
        </div>
      </div>
      <div style={{
        background: "#232528",
        color: "var(--danger)",
        padding: 14,
        borderRadius: 10,
        fontSize: 17,
        margin: "18px 0"
      }}>
        ⚠️ Envoyez le montant exact en BTC.<br />
        <b>Si le montant est inférieur, vous ne recevrez pas le dossier.</b><br />
        Aucun remboursement si excédent. Les frais sont à votre charge.
        <div style={{ color: isPriceExpired ? "#ff6565" : "#fab005", marginTop: 7, fontSize: 16 }}>
          {isPriceExpired
            ? "⏰ Le taux BTC/USD affiché est expiré. Veuillez rafraîchir la page pour actualiser le montant à payer."
            : `Ce montant en BTC est valable encore ${minWarning} minute(s). Après, il faudra rafraîchir la page.`}
        </div>
      </div>
      <label style={{ fontSize: "1.12em" }}>
        Votre mail Google
        <input
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="votre.email@gmail.com"
        />
      </label>
      <label style={{ fontSize: "1.12em" }}>
        ID de transaction (TXID)
        <input
          required
          value={txid}
          onChange={e => setTxid(e.target.value)}
          placeholder="Collez ici le TXID Bitcoin"
        />
      </label>
      <button
        type="submit"
        style={{ fontSize: "1.15em", padding: "14px 38px" }}
        disabled={isPriceExpired}
      >
        Vérifier le paiement
      </button>
      {status && <div style={{ marginTop: 20, color: status.startsWith("✅") ? "var(--accent)" : "var(--danger)" }}>{status}</div>}
    </form>
  );
}
