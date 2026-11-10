"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { CyberpunkMasterDiceRoller } from "./CyberpunkMasterDiceRoller";
import { CP, Panel, SectionTitle, PrimaryButton, GhostButton, gridAutoFill, inputStyle } from "../ui";
import {
  listCampaigns, createCampaign, deleteCampaign,
  type CyberpunkCampaignSummary,
} from "@/lib/cyberpunk/cyberpunkCampaignClient";
import "../cyberpunk-responsive.css";

export default function CyberpunkMestrePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<CyberpunkCampaignSummary[]>([]);
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
      router.push(`/dashboard/cyberpunk/mestre/campanha/${id}`);
    } finally { setBusy(false); }
  }

  async function handleDelete(id: string) {
    await deleteCampaign(id);
    setCampaigns(await listCampaigns());
    setConfirmDelete(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <CyberpunkMasterDiceRoller />
      <DashboardNav userName={userName} systemName="Cyberpunk RED" systemHref="/dashboard/cyberpunk" backLabel="Cyberpunk RED" accentColor={CP.accent} />

      <main id="conteudo" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <SectionTitle eyebrow="Cyberpunk RED · Mestre" title="Minhas Campanhas" />
          <PrimaryButton onClick={() => setCreating(true)}>+ Nova campanha</PrimaryButton>
        </div>

        {creating && (
          <Panel style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", padding: 16 }}>
            <input
              aria-label="Nome da campanha" value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder="Nome da campanha" autoFocus maxLength={80}
              style={{ ...inputStyle, flex: "1 1 200px", width: "auto", padding: "10px 14px" }}
            />
            <PrimaryButton onClick={handleCreate} disabled={busy}>Criar</PrimaryButton>
            <GhostButton onClick={() => setCreating(false)}>Cancelar</GhostButton>
          </Panel>
        )}

        {campaigns.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "60px 24px", background: CP.panel, border: `1px dashed ${CP.accentBord}`, borderRadius: "var(--radius-xl)", gap: 12 }}>
            <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>Nenhuma campanha ainda</h3>
            <p style={{ fontSize: "0.84rem", color: CP.textMuted, maxWidth: 360, lineHeight: 1.65 }}>
              Crie sua primeira campanha para acessar as ferramentas do Mestre: NPCs, bestiário, iniciativa, pistas, relógios e notas.
            </p>
            <PrimaryButton onClick={() => setCreating(true)} style={{ marginTop: 8 }}>+ Criar campanha</PrimaryButton>
          </div>
        ) : (
          <div style={gridAutoFill(240)}>
            {campaigns.map((c) => (
              <Panel key={c.id} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700 }}>
                  <Link href={`/dashboard/cyberpunk/mestre/campanha/${c.id}`} style={{ color: "var(--text)", textDecoration: "none" }}>{c.name}</Link>
                </h3>
                <p style={{ fontSize: "0.76rem", color: CP.textMuted }}>
                  {c.counts.npcs} NPCs · {c.counts.combatants} combatentes · {c.counts.sessions} sessões
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => router.push(`/dashboard/cyberpunk/mestre/campanha/${c.id}`)} style={{ flex: 1, padding: "8px 12px", minHeight: 36, background: CP.accentDim, border: `1px solid ${CP.accentBord}`, borderRadius: 6, color: CP.accentLight, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Abrir</button>
                  <button onClick={() => (confirmDelete === c.id ? handleDelete(c.id) : setConfirmDelete(c.id))} style={{ padding: "8px 12px", minHeight: 36, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 6, color: confirmDelete === c.id ? CP.danger : CP.textMuted, fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit" }}>
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
