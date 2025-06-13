"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.ok) {
      router.push("/admin-FMZaYYPtLLHyDgDwHmknNTmQwSPSKsAoHArChozSUzAigTQNWFrDQVgiNiDTnTPXVgoqMfRSSCJxaTsghPhNSFcufXhJNSviQyJLPdvAnfrVETyTXpDxRqfxpvJTdsNo");
    } else {
      setError("Identifiants invalides");
    }
  }

  return (
    <form onSubmit={handleLogin} style={{ margin: "5rem auto", maxWidth: 350 }}>
      <h2>Connexion admin</h2>
      <input
        required
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: "100%", margin: "8px 0", padding: 8 }}
      />
      <input
        required
        placeholder="Mot de passe"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", margin: "8px 0", padding: 8 }}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit" style={{ width: "100%" }}>Se connecter</button>
    </form>
  );
}
