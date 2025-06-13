"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import BtcPaymentForm from "@/components/BtcPaymentForm";
import { Dossier } from "@/types/dossier";

type ModalType = null | { mode: "desc"; dossier: Dossier } | { mode: "pay"; dossier: Dossier };

export default function Home() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [modal, setModal] = useState<ModalType>(null);

  useEffect(() => {
    fetch("/api/dossiers")
      .then(res => res.json())
      .then((data: Dossier[]) =>
        setDossiers(
          data.map((d: Dossier) => ({
            ...d,
            files: Array.isArray(d.files) ? d.files : JSON.parse(d.files ?? "[]")
          }))
        )
      );
  }, []);

  return (
    <main>
      <div style={{marginTop: "30px"}}>
        <div className="site-title">Bienvenue sur Mon Paywall Dossiers</div>
        <div className="site-desc">
          Payez en Bitcoin pour accéder à des ressources premium et confidentielles. Chaque dossier est validé manuellement pour garantir la qualité.
        </div>
      </div>
      <div className="dossier-grid">
        {dossiers.map(d => (
          <div
            key={d.id}
            className="dossier-card"
            onClick={() => setModal({ mode: "desc", dossier: d })}
            style={{ cursor: "pointer" }}
            tabIndex={0}
            role="button"
          >
            <Image src="/dossier.png" alt="Dossier" className="dossier-image" width={62} height={62} />
            <h3 className="card-title">{d.title}</h3>
            <div className="card-prix"><strong>Prix :</strong> {d.price} $</div>
          </div>
        ))}
      </div>

      {/* MODAL DESCRIPTION */}
      {modal && modal.mode === "desc" && (
        <div className="overlay-btc-form" onClick={() => setModal(null)}>
          <div className="overlay-inner" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <button className="overlay-close" onClick={() => setModal(null)} title="Fermer">&times;</button>
            <Image src="/dossier.png" alt="Dossier" width={80} height={80} style={{ borderRadius: 20, margin: "0 auto 18px auto", display: "block", objectFit: "contain" }} />
            <h2 style={{ marginBottom: 16 }}>{modal.dossier.title}</h2>
            <div style={{ color: "var(--txt-soft)", fontSize: "1.17em", marginBottom: 26 }}>
              {modal.dossier.description || "Pas de description."}
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 28, color: "var(--accent)" }}>
              Prix : {modal.dossier.price} $
            </div>
            <button style={{ width: "100%", fontSize: "1.25em" }} onClick={() => setModal({ mode: "pay", dossier: modal.dossier })}>
              Acheter ce dossier
            </button>
          </div>
        </div>
      )}

      {/* MODAL PAIEMENT */}
      {modal && modal.mode === "pay" && (
        <div className="overlay-btc-form" onClick={() => setModal(null)}>
          <div className="overlay-inner" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
            <button className="overlay-close" onClick={() => setModal(null)} title="Fermer">&times;</button>
            <BtcPaymentForm dossier={modal.dossier} />
          </div>
        </div>
      )}
    </main>
  );
}
