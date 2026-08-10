"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { StarWarsMasterDiceRoller } from "./StarWarsMasterDiceRoller";
import { SW, Panel, SectionTitle, PrimaryButton, GhostButton, gridAutoFill } from "../ui";
import {
  listCampaigns, createCampaign, deleteCampaign,
  type StarWarsCampaignSummary,
} from "@/lib/starwars/starwarsCampaignClient";

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
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <StarWarsMasterDiceRoller />
      <DashboardNav userName={userName} systemName="Star Wars: Além da Fronteira" systemHref="/dashboard/starwars" backLabel="Star Wars" accentColor={SW.accent} />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <SectionTitle eyebrow="Star Wars · Mestre" title="Minhas Campanhas" />
          <PrimaryButton onClick={() => setCreating(true)}>+ Nova campanha</PrimaryButton>
        </div>

        {creating && (
          <Panel style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", padding: 16 }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome da campanha" autoFocus
              style={{ flex: 1, minWidth: 0, padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.86rem" }} />
            <PrimaryButton onClick={handleCreate} disabled={busy}>Criar</PrimaryButton>
            <GhostButton onClick={() => setCreating(false)}>Cancelar</GhostButton>
          </Panel>
        )}

        {campaigns.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "60px 24px",
              background: SW.panel,
              border: `1px dashed ${SW.accentBord}`,
              borderRadius: "var(--radius-xl)",
              boxShadow: `0 0 24px ${SW.glow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
              gap: 12,
            }}
          >
            <div
              style={{
                width: 52, height: 52,
                borderRadius: "var(--radius-lg)",
                background: SW.accentDim,
                border: `1px solid ${SW.accentBord}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: SW.accentLight, marginBottom: 4,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
              Nenhuma campanha ainda
            </h3>
            <p style={{ fontSize: "0.84rem", color: SW.textMuted, maxWidth: 340, lineHeight: 1.65 }}>
              Crie sua primeira campanha para acessar as ferramentas do Mestre — NPCs, bestiário, iniciativa, pistas, relógios e notas.
            </p>
            <button
              onClick={() => setCreating(true)}
              style={{
                marginTop: 8,
                padding: "9px 20px",
                background: SW.accentDim,
                color: SW.accentLight,
                border: `1px solid ${SW.accentBord}`,
                borderRadius: "var(--radius)",
                fontSize: "0.84rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,196,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = SW.accentDim)}
            >
              + Criar campanha
            </button>
          </div>
        ) : (
          <div style={gridAutoFill(240)}>
            {campaigns.map((c) => (
              <Panel key={c.id} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                <h3 onClick={() => router.push(`/dashboard/starwars/mestre/campanha/${c.id}`)} style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", cursor: "pointer" }}>{c.name}</h3>
                <p style={{ fontSize: "0.76rem", color: SW.textMuted }}>
                  {c._count.starWarsNpcs} NPCs · {c._count.starWarsCombatants} combatentes · {c._count.starWarsSessions} sessões
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => router.push(`/dashboard/starwars/mestre/campanha/${c.id}`)} style={{ flex: 1, padding: "8px 12px", background: SW.accentDim, border: `1px solid ${SW.accentBord}`, borderRadius: 6, color: SW.accentLight, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>Abrir</button>
                  <button onClick={() => confirmDelete === c.id ? handleDelete(c.id) : setConfirmDelete(c.id)} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 6, color: confirmDelete === c.id ? SW.danger : SW.textMuted, fontSize: "0.78rem", cursor: "pointer" }}>
                    {confirmDelete === c.id ? "Confirmar?" : "Excluir"}
                  </button>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
