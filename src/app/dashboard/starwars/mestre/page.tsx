"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import {
  listCampaigns, createCampaign, deleteCampaign,
  type StarWarsCampaignSummary,
} from "@/lib/starwars/starwarsCampaignClient";

const ACCENT = "#3b82c4";
const ACCENT_LIGHT = "#69a8e0";
const ACCENT_DIM = "rgba(59,130,196,0.12)";
const ACCENT_BORD = "rgba(59,130,196,0.28)";

export default function StarWarsMestrePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<StarWarsCampaignSummary[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  useEffect(() => { if (status === "authenticated") listCampaigns().then(setCampaigns).catch(() => setCampaigns([])); }, [status]);

  const userName = session?.user?.name ?? session?.user?.email ?? "Mestre";

  async function handleCreate() {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const id = await createCampaign(name);
      setNewName("");
      setCreating(false);
      router.push(`/dashboard/starwars/mestre/campanha/${id}`);
    } finally { setBusy(false); }
  }

  async function handleDelete(id: string) {
    await deleteCampaign(id);
    setCampaigns(await listCampaigns());
    setConfirmDelete(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 50% -10%, rgba(59,130,196,0.07), transparent 60%), #05070d` }}>
      <DashboardNav userName={userName} systemName="Star Wars: Além da Fronteira" systemHref="/dashboard/starwars" backLabel="Star Wars" />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <span className="section-label" style={{ display: "block", marginBottom: 8, color: ACCENT }}>Star Wars · Mestre</span>
            <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 700, color: "var(--text)" }}>
              Minhas <span style={{ color: ACCENT }}>Campanhas</span>
            </h1>
          </div>
          <button onClick={() => setCreating(true)} style={{ padding: "10px 20px", background: `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`, color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: "pointer" }}>
            + Nova campanha
          </button>
        </div>

        {creating && (
          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome da campanha" autoFocus
              style={{ flex: 1, minWidth: 0, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)" }} />
            <button onClick={handleCreate} disabled={busy} style={{ padding: "10px 18px", background: ACCENT, color: "#fff", border: "none", borderRadius: "var(--radius)", cursor: "pointer" }}>Criar</button>
            <button onClick={() => setCreating(false)} style={{ padding: "10px 18px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", cursor: "pointer" }}>Cancelar</button>
          </div>
        )}

        {campaigns.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhuma campanha ainda. Crie a primeira acima.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {campaigns.map((c) => (
              <div key={c.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                <h3 onClick={() => router.push(`/dashboard/starwars/mestre/campanha/${c.id}`)} style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", cursor: "pointer" }}>{c.name}</h3>
                <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                  {c._count.starWarsNpcs} NPCs · {c._count.starWarsCombatants} combatentes · {c._count.starWarsSessions} sessões
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => router.push(`/dashboard/starwars/mestre/campanha/${c.id}`)} style={{ flex: 1, padding: "8px 12px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: ACCENT_LIGHT, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>Abrir</button>
                  <button onClick={() => confirmDelete === c.id ? handleDelete(c.id) : setConfirmDelete(c.id)} style={{ padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: confirmDelete === c.id ? "#e06c6c" : "var(--text-muted)", fontSize: "0.78rem", cursor: "pointer" }}>
                    {confirmDelete === c.id ? "Confirmar?" : "Excluir"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
