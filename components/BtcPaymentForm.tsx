"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dossier } from "@/types/dossier";

const BTC_ADDRESS = "bc1qaukltdwvanelgy66y486f7ahz222tkxqjk76ua";

export default function BtcPaymentForm({
  dossier,
  onSuccess,
}: {
  dossier: Dossier;
  onSuccess?: () => void;
}) {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [priceBtc, setPriceBtc] = useState<string>("");
  const [btcPriceFetchedAt, setBtcPriceFetchedAt] = useState<number>(Date.now());
  const [copyMsg, setCopyMsg] = useState<string>("");

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
        btcUsdRate: btcPrice,
      }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setStatus("");
      if (onSuccess) onSuccess();
    } else {
      setStatus(data.error ? "❌ " + data.error : "❌ Une erreur est survenue.");
    }
  }

  // Copie l'adresse
  function handleCopyAddress() {
    navigator.clipboard.writeText(BTC_ADDRESS);
    setCopyMsg("Adresse copiée !");
    setTimeout(() => setCopyMsg(""), 1600);
  }

  // Calcul du temps de validité (60min)
  const validityDuration = 60 * 60 * 1000; // 1 heure en ms
  const timeLeft = btcPriceFetchedAt + validityDuration - Date.now();
  const isPriceExpired = timeLeft < 0;
  const minWarning = Math.max(1, Math.floor(timeLeft / 60000));

  return (
    <form className="btc-pay-form" onSubmit={handleAchat} autoComplete="off">
      <h3 className="btc-pay-title">Payer ce dossier par Bitcoin</h3>
      <div className="btc-pay-pricebox">
        <span>Prix :</span>
        <b>{dossier.price}$</b>
        {btcPrice !== null ? (
          <>
            &nbsp;(~<b className="btc-amount">{priceBtc} BTC</b>)
            <span className="btc-rate">1 BTC = {btcPrice}$ (maj auto)</span>
          </>
        ) : (
          <span className="btc-pay-error">
            Impossible de récupérer le taux BTC/USD pour le moment.
          </span>
        )}
      </div>

      <div className="btc-pay-qrcode">
        <QRCodeSVG value={BTC_ADDRESS} size={190} />
        <div className="btc-address-block">
          <div className="btc-network-label">
            Envoyez sur <b>cette adresse Bitcoin</b> (réseau BTC seulement)&nbsp;:
          </div>
          <div className="btc-address">{BTC_ADDRESS}</div>
          <button type="button" className="btc-copy-btn" onClick={handleCopyAddress}>
            {copyMsg ? copyMsg : "Copier l'adresse"}
          </button>
        </div>
      </div>

<div className="btc-pay-warning">
  <span className="btc-pay-icon">⚠️</span>
  <div>
    <b>
      Envoyez <span className="btc-amount big">{priceBtc} BTC</span> exactement.<br />
      Votre mail Google est <u>obligatoire</u> pour recevoir le dossier (partage Google Drive).
    </b>
    <div>
      Si le montant est inférieur, <u>vous ne recevrez pas le dossier</u>.<br />
      Aucun remboursement d’excédent. Les frais sont à votre charge.
    </div>
    <div className={isPriceExpired ? "btc-pay-expired" : "btc-pay-timer"}>
      {isPriceExpired
        ? "⏰ Le taux BTC/USD affiché est expiré. Veuillez rafraîchir la page pour actualiser le montant à payer."
        : <>Ce montant en BTC est valable encore <b>{minWarning} minute(s)</b>. Après, il faudra rafraîchir la page.</>
      }
    </div>
  </div>
</div>



      <div className="btc-pay-fields">
        <div className="btc-pay-field">
          <label>
            Votre mail Google <span className="btc-pay-required">*</span>
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre.email@gmail.com"
              autoComplete="off"
            />
          </label>
        </div>
        <div className="btc-pay-field">
          <label>
            ID de transaction (TXID) <span className="btc-pay-required">*</span>
            <input
              required
              value={txid}
              onChange={e => setTxid(e.target.value)}
              placeholder="Collez ici le TXID Bitcoin"
              autoComplete="off"
            />
          </label>
        </div>
      </div>
      <button
        type="submit"
        className="btn-primary btc-pay-btn"
        disabled={isPriceExpired}
      >
        Vérifier le paiement
      </button>
      {status && (
        <div
          className={
            status.startsWith("✅")
              ? "btc-pay-status-success"
              : "btc-pay-status-error"
          }
        >
          {status}
        </div>
      )}
    </form>
  );
}
