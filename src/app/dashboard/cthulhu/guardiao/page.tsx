"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { GuardianDiceRoller } from "./GuardianDiceRoller";
import {
  listCampaigns,
  createCampaign,
  deleteCampaign,
  type CthulhuCampaignSummary,
  type Era,
} from "@/lib/cthulhu/cthulhuCampaignClient";

const ERA_OPTIONS: { value: Era; label: string }[] = [
  { value: "1920s", label: "Anos 1920" },
  { value: "modern", label: "Moderno" },
  { value: "outro", label: "Era Personalizada" },
];

export default function GuardiaoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<CthulhuCampaignSummary[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEra, setNewEra] = useState<Era>("1920s");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") listCampaigns().then(setCampaigns).catch(() => setCampaigns([]));
  }, [status]);

  const userName = session?.user?.name ?? session?.user?.email ?? "Guardião";

  async function handleCreate() {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const id = await createCampaign(name, newEra);
      setNewName("");
      setCreating(false);
      router.push(`/dashboard/cthulhu/guardiao/cenario/${id}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteCampaign(id);
    setCampaigns(await listCampaigns());
    setConfirmDelete(null);
  }

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <GuardianDiceRoller />
      <DashboardNav
        userName={userName}
        systemName="Call of Cthulhu"
        systemHref="/dashboard/cthulhu"
        backLabel="Call of Cthulhu"
      />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span className="section-label" style={{ display: "block", marginBottom: 8, color: "#7d9c3e" }}>
            Call of Cthulhu · 7ª Edição
          </span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
              Painel do <span style={{ color: "#7d9c3e" }}>Guardião</span>
            </h1>
            <button
              onClick={() => { setCreating(true); setNewName(""); setNewEra("1920s"); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "rgba(125,156,62,0.14)", color: "#a3b86c", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(125,156,62,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(125,156,62,0.14)")}
            >
              + Novo Cenário
            </button>
          </div>
        </div>

        {/* Create form */}
        {creating && (
          <div style={{ marginBottom: 32, padding: "24px 28px", background: "var(--surface)", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#7d9c3e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Nome do Cenário
              </label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                placeholder="Ex: A Sombra Sobre Innsmouth"
                style={{ width: "100%", padding: "10px 14px", background: "var(--surface-2)", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ minWidth: 160 }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#7d9c3e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Era
              </label>
              <select
                value={newEra}
                onChange={(e) => setNewEra(e.target.value as Era)}
                style={{ width: "100%", padding: "10px 14px", background: "var(--surface-2)", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.9rem", cursor: "pointer" }}
              >
                {ERA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCreate} disabled={!newName.trim()} style={{ padding: "10px 20px", background: newName.trim() ? "linear-gradient(135deg, #a3b86c 0%, #7d9c3e 100%)" : "var(--surface-2)", color: newName.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: newName.trim() ? "pointer" : "not-allowed" }}>
                Criar
              </button>
              <button onClick={() => setCreating(false)} style={{ padding: "10px 16px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.86rem", cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Campaign list */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", letterSpacing: "0.04em" }}>
              Meus Cenários
            </h2>
            {campaigns.length > 0 && (
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#a3b86c", background: "rgba(125,156,62,0.14)", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius-full)", padding: "2px 8px" }}>
                {campaigns.length}
              </span>
            )}
          </div>

          {campaigns.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "60px 24px", background: "var(--surface)", border: "1px dashed rgba(125,156,62,0.32)", borderRadius: "var(--radius-xl)", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: "var(--radius-lg)", background: "rgba(125,156,62,0.14)", border: "1px solid rgba(125,156,62,0.32)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a3b86c", marginBottom: 4 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
                Nenhum cenário ainda
              </h3>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", maxWidth: 360, lineHeight: 1.65 }}>
                Crie seu primeiro cenário para acessar as ferramentas do Guardião — NPCs, ordem de ação, notas, artefatos e bestiário do Mythos.
              </p>
              <button onClick={() => setCreating(true)} style={{ marginTop: 8, padding: "9px 20px", background: "rgba(125,156,62,0.14)", color: "#a3b86c", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius)", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(125,156,62,0.22)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(125,156,62,0.14)")}>
                + Criar cenário
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {campaigns.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", transition: "border-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(125,156,62,0.32)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                    <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "var(--radius)", background: "rgba(125,156,62,0.14)", border: "1px solid rgba(125,156,62,0.32)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a3b86c" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#a3b86c", background: "rgba(125,156,62,0.14)", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius-xs)", padding: "1px 6px", flexShrink: 0 }}>
                          {ERA_OPTIONS.find((e) => e.value === c.era)?.label ?? c.era}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {c._count.cthulhuNpcs} NPC{c._count.cthulhuNpcs !== 1 ? "s" : ""} · {c._count.cthulhuCombatants} na ordem
                        {c._count.cthulhuSessions ? ` · ${c._count.cthulhuSessions} sessão${c._count.cthulhuSessions !== 1 ? "ões" : ""}` : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <Link href={`/dashboard/cthulhu/guardiao/cenario/${c.id}`} style={{ padding: "8px 16px", background: "rgba(125,156,62,0.14)", color: "#a3b86c", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none", transition: "background 0.2s", whiteSpace: "nowrap" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(125,156,62,0.22)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(125,156,62,0.14)")}>
                      Abrir →
                    </Link>
                    {confirmDelete === c.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleDelete(c.id)} style={{ padding: "8px 12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>Confirmar</button>
                        <button onClick={() => setConfirmDelete(null)} style={{ padding: "8px 10px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.78rem", cursor: "pointer" }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(c.id)} title="Excluir cenário" style={{ padding: "8px 10px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.78rem", cursor: "pointer", lineHeight: 1 }}>🗑</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
