"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import BtcPaymentForm from "@/components/BtcPaymentForm";

// ⬇️ Copie ce type localement !
type Dossier = {
  id: string;
  title: string;
  description?: string;
  price: number;
  createdAt: string;
  files: string[];
  images?: string; // Ajouté pour le build
};

// AJOUTE ici le nouveau type :
type ModalType =
  | null
  | { mode: "desc"; dossier: Dossier }
  | { mode: "pay"; dossier: Dossier }
  | { mode: "thankyou" };

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
            files: Array.isArray(d.files) ? d.files : JSON.parse(d.files ?? "[]"),
          }))
        )
      );
  }, []);

  return (
    <main>
      <div style={{ marginTop: "30px" }}>
        <div className="site-title">Bienvenue sur Everynudes</div>
        <div className="site-desc">
          Ici, accédez à des contenus exclusifs et confidentiels de modèles populaires, influenceuses et créatrices de contenus. Leaks, photos privées, vidéos premium : retrouvez tous les dossiers inédits issus des plus grandes plateformes (OnlyFans, MYM, etc).
        </div>

        <div className="site-desc">
          🚨 Pour chaque dossier, la confidentialité et l’anonymat de nos utilisateurs sont garantis.
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
          </div>
        ))}
      </div>

      {/* MODAL DESCRIPTION */}
      {modal && modal.mode === "desc" && (
        <div className="overlay-btc-form" onClick={() => setModal(null)}>
          <div className="overlay-inner modal-scroll" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <button className="overlay-close" onClick={() => setModal(null)} title="Fermer">&times;</button>
            <h2 className="modal-title">{modal.dossier.title}</h2>
            <div className="modal-desc">{modal.dossier.description || "Pas de description."}</div>
            {modal.dossier.images && (
              <div className="modal-images">
                {(JSON.parse(modal.dossier.images) as string[]).map((img, i) => (
                  <img key={i} src={img} alt={`Image ${i + 1}`} />
                ))}

              </div>
            )}
            <div className="modal-prix">
              Prix : {modal.dossier.price} $
            </div>
            <button
              className="btn-primary"
              onClick={() => setModal({ mode: "pay", dossier: modal.dossier })}
            >
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
            <BtcPaymentForm
              dossier={modal.dossier}
              onSuccess={() => setModal({ mode: "thankyou" })}
            />
          </div>
        </div>
      )}

      {/* MODAL REMERCIEMENT */}
      {modal && modal.mode === "thankyou" && (
        <div className="overlay-btc-form" onClick={() => setModal(null)}>
          <div className="overlay-inner modal-thankyou" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <button className="overlay-close" onClick={() => setModal(null)} title="Fermer">&times;</button>
            <div className="thankyou-content">
              <div className="thankyou-emoji">🎉</div>
              <h2>Merci pour votre commande&nbsp;!</h2>
              <div className="thankyou-msg">
                <p>
                  Votre demande a bien été prise en compte.<br />
                  <b>Vous recevrez l’accès à votre dossier dans les plus brefs délais (généralement sous 24h).</b>
                </p>
                <p>
                  Un email de Google Drive sera envoyé à l’adresse que vous avez indiquée pour vous donner accès au dossier.
                </p>
              </div>
              <button className="btn-primary thankyou-btn" onClick={() => setModal(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
