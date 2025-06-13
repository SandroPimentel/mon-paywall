"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

type GuestPurchase = {
  id: string;
  email: string;
  dossierId: string;
  createdAt: string;
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

  useEffect(() => {
    if (status === "authenticated" && session.user?.isAdmin) {
      fetch("/api/guest-purchases").then(res => res.json()).then(setPurchases);
      fetch("/api/dossiers").then(res => res.json()).then(setDossiers);
    }
  }, [status, session, msg]);

  if (status !== "authenticated" || !session.user?.isAdmin) {
    return <div style={{ margin: "5rem auto", textAlign: "center" }}>Accès refusé</div>;
  }

  // Add or Edit dossier
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

  // Pre-fill form for edit
  function handleEdit(d: Dossier) {
    setTitle(d.title);
    setDescription(d.description || "");
    setPrice(d.price.toString());
    setEditId(d.id);
  }

  // Delete dossier
  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce dossier ?")) return;
    const res = await fetch("/api/delete-dossier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMsg("Dossier supprimé !");
    } else {
      setMsg("Erreur à la suppression");
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: "2rem auto" }}>
      <h2>Admin Dashboard</h2>
      <button onClick={() => signOut()} style={{ float: "right" }}>Déconnexion</button>
      <h3>Achats clients</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Email</th>
            <th>Dossier</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map(a => (
            <tr key={a.id}>
              <td>{new Date(a.createdAt).toLocaleString()}</td>
              <td>{a.email}</td>
              <td>{dossiers.find(d => d.id === a.dossierId)?.title || a.dossierId}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 30 }}>Dossiers</h3>
      <table style={{ width: "100%", marginBottom: 30, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Prix ($)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dossiers.map(d => (
            <tr key={d.id}>
              <td>{d.title}</td>
              <td>{d.description}</td>
              <td>{d.price}</td>
              <td>
                <button onClick={() => handleEdit(d)} style={{ marginRight: 8 }}>Modifier</button>
                <button onClick={() => handleDelete(d.id)} style={{ background: "#c22", color: "#fff" }}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{editId ? "Modifier un dossier" : "Ajouter un dossier"}</h3>
      <form onSubmit={handleSubmit} style={{ marginTop: "1rem", maxWidth: 500, background: "#fff", borderRadius: 6, padding: "2rem", boxShadow: "0 2px 8px #0001" }}>
        <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre" style={{ width: "100%", margin: "8px 0", padding: 8 }} />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" style={{ width: "100%", margin: "8px 0", padding: 8 }} />
        <input required type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Prix en dollars (USD)" style={{ width: "100%", margin: "8px 0", padding: 8 }} />
        <button type="submit" style={{ padding: "10px 22px", background: "#189", color: "#fff", border: "none", borderRadius: 4 }}>
          {editId ? "Modifier" : "Ajouter"}
        </button>
        {editId && (
          <button onClick={() => { setEditId(null); setTitle(""); setDescription(""); setPrice(""); }} type="button" style={{ marginLeft: 10 }}>
            Annuler
          </button>
        )}
        {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
      </form>
    </main>
  );
}
