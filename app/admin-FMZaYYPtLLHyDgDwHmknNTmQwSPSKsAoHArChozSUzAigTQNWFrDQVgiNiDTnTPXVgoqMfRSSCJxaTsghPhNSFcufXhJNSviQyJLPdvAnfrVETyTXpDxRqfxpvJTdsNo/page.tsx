"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

type GuestPurchase = {
  id: string;
  email: string;
  dossierId: string;
  createdAt: string;
  txid?: string;
  amountBtc?: number;
  btcUsdRate?: number;
};
type Dossier = {
  id: string;
  title: string;
  description?: string;
  price: number;
  createdAt: string;
};

export default function Admin() {
  const { data: session, status } = useSession();
  const [purchases, setPurchases] = useState<GuestPurchase[]>([]);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [msg, setMsg] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  // Pour modifier email/mdp admin
  const [email, setEmail] = useState(session?.user?.email || "");
  const [password, setPassword] = useState("");
  const [msgAccount, setMsgAccount] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session.user?.isAdmin) {
      fetch("/api/guest-purchases").then(res => res.json()).then(setPurchases);
      fetch("/api/dossiers").then(res => res.json()).then(setDossiers);
      setEmail(session.user?.email || "");
    }
  }, [status, session, msg]);

  if (status !== "authenticated" || !session.user?.isAdmin) {
    return <div style={{ margin: "5rem auto", textAlign: "center" }}>Accès refusé</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const url = editId ? "/api/edit-dossier" : "/api/add-dossier";
    const body = {
      id: editId,
      title,
      description,
      price: Number(price)
    };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setMsg(editId ? "Dossier modifié !" : "Dossier ajouté !");
      setTitle(""); setDescription(""); setPrice(""); setEditId(null);
    } else {
      setMsg("Erreur : " + (await res.text()));
    }
  }

  function handleEdit(d: Dossier) {
    setTitle(d.title);
    setDescription(d.description || "");
    setPrice(d.price.toString());
    setEditId(d.id);
  }

  async function handleDeleteDossier(id: string) {
    if (!confirm("Supprimer ce dossier ?")) return;
    const res = await fetch("/api/delete-dossier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMsg("Dossier supprimé !");
      setDossiers(dossiers => dossiers.filter(d => d.id !== id));
    } else {
      setMsg("Erreur à la suppression");
    }
  }

  // Suppression individuelle d'un achat
  async function handleDeletePurchase(id: string) {
    if (!confirm("Supprimer cet achat ?")) return;
    const res = await fetch("/api/delete-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setPurchases(purchases => purchases.filter(p => p.id !== id));
    } else {
      alert("Erreur lors de la suppression.");
    }
  }

  // Modifier email/mdp admin
  async function handleAccount(e: React.FormEvent) {
    e.preventDefault();
    setMsgAccount("");
    const res = await fetch("/api/admin-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      setMsgAccount("Compte admin modifié !");
      setPassword("");
    } else {
      setMsgAccount("Erreur : " + (await res.text()));
    }
  }

  return (
    <main style={{
      maxWidth: 1000,
      margin: "3rem auto 2rem auto",
      padding: "32px",
      background: "var(--bg-card, #181a21)",
      borderRadius: "1.2rem",
      boxShadow: "0 6px 32px #0006"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
        <h2>Admin Dashboard</h2>
        <button onClick={() => signOut()} style={{ minWidth: 120 }}>Déconnexion</button>
      </div>

      <section style={{ marginBottom: 38 }}>
        <h3>Achats clients</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse", fontSize: 17, background: "#222", borderRadius: 10
          }}>
            <thead>
              <tr style={{ background: "#232a32", color: "#aaa" }}>
                <th style={{ padding: "10px 16px" }}>Date</th>
                <th>Email</th>
                <th>Dossier</th>
                <th>TXID</th>
                <th>Montant BTC</th>
                <th>Taux BTC/USD</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(a => (
                <tr key={a.id} style={{ borderBottom: "1px solid #2b2e3a" }}>
                  <td style={{ padding: "7px 8px" }}>{new Date(a.createdAt).toLocaleString()}</td>
                  <td>{a.email}</td>
                  <td>{dossiers.find(d => d.id === a.dossierId)?.title || a.dossierId}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 14 }}>{a.txid || "-"}</td>
                  <td>{a.amountBtc ? `${a.amountBtc} BTC` : "-"}</td>
                  <td>{a.btcUsdRate ? `${a.btcUsdRate}$` : "-"}</td>
                  <td>
                    <button
                      onClick={() => handleDeletePurchase(a.id)}
                      style={{ background: "#c22", color: "#fff", borderRadius: 6, fontSize: 15, padding: "6px 16px" }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ color: "#888", textAlign: "center", padding: 16 }}>Aucun achat enregistré.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 44 }}>
        <h3>Dossiers</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse", fontSize: 16, background: "#212328", borderRadius: 10
          }}>
            <thead>
              <tr style={{ background: "#232a32", color: "#aaa" }}>
                <th style={{ padding: "10px 16px" }}>Titre</th>
                <th>Description</th>
                <th>Prix ($)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dossiers.map(d => (
                <tr key={d.id} style={{ borderBottom: "1px solid #23262a" }}>
                  <td style={{ padding: "7px 8px" }}>{d.title}</td>
                  <td>{d.description}</td>
                  <td>{d.price}</td>
                  <td>
                    <button onClick={() => handleEdit(d)} style={{ marginRight: 8 }}>Modifier</button>
                    <button onClick={() => handleDeleteDossier(d.id)} style={{ background: "#c22", color: "#fff" }}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {dossiers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ color: "#888", textAlign: "center", padding: 14 }}>Aucun dossier créé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 44 }}>
        <h3>{editId ? "Modifier un dossier" : "Ajouter un dossier"}</h3>
        <form onSubmit={handleSubmit} style={{
          marginTop: "1rem", maxWidth: 540, background: "#191b22", borderRadius: 14, padding: "2rem", boxShadow: "0 2px 16px #0003"
        }}>
          <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre" style={{ width: "100%", margin: "8px 0", padding: 16, fontSize: 17 }} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" style={{ width: "100%", margin: "8px 0", padding: 16, fontSize: 17, minHeight: 70 }} />
          <input required type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Prix en dollars (USD)" style={{ width: "100%", margin: "8px 0", padding: 16, fontSize: 17 }} />
          <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
            <button type="submit" style={{ padding: "10px 32px", background: "#189", color: "#fff", border: "none", borderRadius: 6, fontSize: 17 }}>
              {editId ? "Modifier" : "Ajouter"}
            </button>
            {editId && (
              <button onClick={() => { setEditId(null); setTitle(""); setDescription(""); setPrice(""); }} type="button" style={{ marginLeft: 14 }}>
                Annuler
              </button>
            )}
            {msg && <div style={{ marginLeft: 24, color: "#aaa", fontSize: 15 }}>{msg}</div>}
          </div>
        </form>
      </section>

      <section style={{ marginBottom: 10 }}>
        <h3>Paramètres du compte admin</h3>
        <form onSubmit={handleAccount} style={{
          maxWidth: 520, background: "#222428", borderRadius: 14, padding: "1.3rem 2rem", boxShadow: "0 2px 10px #0003"
        }}>
          <label>
            Email admin
            <input required value={email} onChange={e => setEmail(e.target.value)} type="email" style={{ width: "100%", margin: "8px 0", padding: 14, fontSize: 17 }} />
          </label>
          <label>
            Nouveau mot de passe (laisser vide pour ne pas changer)
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" style={{ width: "100%", margin: "8px 0", padding: 14, fontSize: 17 }} />
          </label>
          <button type="submit" style={{ marginTop: 10, padding: "10px 32px" }}>
            Modifier mon compte
          </button>
          {msgAccount && <div style={{ marginTop: 10, color: "#aaa", fontSize: 15 }}>{msgAccount}</div>}
        </form>
      </section>
    </main>
  );
}
