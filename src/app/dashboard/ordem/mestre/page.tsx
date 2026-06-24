"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { OrdemMasterDiceRoller } from "./OrdemMasterDiceRoller";
import {
  getOrdemCampaigns,
  createOrdemCampaign,
  deleteOrdemCampaign,
  TIER_LABEL,
  type OrdemCampaign,
} from "@/lib/ordem/ordemCampaignStorage";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

const TIER_OPTIONS: { value: OrdemCampaign["tier"]; label: string }[] = [
  { value: "1", label: "1º Círculo (NEX 5-35%)" },
  { value: "2", label: "2º Círculo (NEX 40-65%)" },
  { value: "3", label: "3º Círculo (NEX 70-95%)" },
  { value: "4", label: "4º Círculo (NEX 99%)" },
];

export default function OrdemMestrePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<OrdemCampaign[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTier, setNewTier] = useState<OrdemCampaign["tier"]>("1");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    setCampaigns(getOrdemCampaigns());
  }, []);

  const userName = session?.user?.name ?? session?.user?.email ?? "Mestre";

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    const c = createOrdemCampaign(name, newTier);
    setNewName("");
    setCreating(false);
    router.push(`/dashboard/ordem/mestre/operacao/${c.id}`);
  }

  function handleDelete(id: string) {
    deleteOrdemCampaign(id);
    setCampaigns(getOrdemCampaigns());
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
      <OrdemMasterDiceRoller />
      <DashboardNav
        userName={userName}
        systemName="Ordem Paranormal"
        systemHref="/dashboard/ordem"
        backLabel="Ordem Paranormal"
      />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span className="section-label" style={{ display: "block", marginBottom: 8, color: A }}>
            Ordem Paranormal · Versão 1.3
          </span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
              Painel do <span style={{ color: A }}>Mestre</span>
            </h1>
            <button
              onClick={() => { setCreating(true); setNewName(""); setNewTier("1"); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = AD)}
            >
              + Nova Operação
            </button>
          </div>
        </div>

        {/* Create form */}
        {creating && (
          <div style={{ marginBottom: 32, padding: "24px 28px", background: "var(--surface)", border: `1px solid ${AB}`, borderRadius: "var(--radius-xl)", display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: A, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Nome da Operação
              </label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                placeholder="Ex: Operação Vão Sangrento"
                style={{ width: "100%", padding: "10px 14px", background: "var(--surface-2)", border: `1px solid ${AB}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ minWidth: 180 }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: A, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                Círculo
              </label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as OrdemCampaign["tier"])}
                style={{ width: "100%", padding: "10px 14px", background: "var(--surface-2)", border: `1px solid ${AB}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.9rem", cursor: "pointer" }}
              >
                {TIER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCreate} disabled={!newName.trim()} style={{ padding: "10px 20px", background: newName.trim() ? `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)` : "var(--surface-2)", color: newName.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: newName.trim() ? "pointer" : "not-allowed" }}>
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
              Minhas Operações
            </h2>
            {campaigns.length > 0 && (
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: AL, background: AD, border: `1px solid ${AB}`, borderRadius: "var(--radius-full)", padding: "2px 8px" }}>
                {campaigns.length}
              </span>
            )}
          </div>

          {campaigns.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "60px 24px", background: "var(--surface)", border: `1px dashed ${AB}`, borderRadius: "var(--radius-xl)", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: "var(--radius-lg)", background: AD, border: `1px solid ${AB}`, display: "flex", alignItems: "center", justifyContent: "center", color: AL, marginBottom: 4 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
                Nenhuma operação ainda
              </h3>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", maxWidth: 360, lineHeight: 1.65 }}>
                Crie sua primeira operação para acessar as ferramentas do Mestre — cena, NPCs, ordem de ação, notas, itens, sanidade e ameaças do Outro Lado.
              </p>
              <button onClick={() => setCreating(true)} style={{ marginTop: 8, padding: "9px 20px", background: AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")} onMouseLeave={(e) => (e.currentTarget.style.background = AD)}>
                + Criar operação
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {campaigns.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", transition: "border-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = AB)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                    <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "var(--radius)", background: AD, border: `1px solid ${AB}`, display: "flex", alignItems: "center", justifyContent: "center", color: AL }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, color: AL, background: AD, border: `1px solid ${AB}`, borderRadius: "var(--radius-xs)", padding: "1px 6px", flexShrink: 0 }}>
                          {TIER_LABEL[c.tier]}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {c.npcs.length} NPC{c.npcs.length !== 1 ? "s" : ""} · {c.combatants.length} na ordem
                        {c.sessions?.length ? ` · ${c.sessions.length} sessão${c.sessions.length !== 1 ? "ões" : ""}` : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <Link href={`/dashboard/ordem/mestre/operacao/${c.id}`} style={{ padding: "8px 16px", background: AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none", transition: "background 0.2s", whiteSpace: "nowrap" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")} onMouseLeave={(e) => (e.currentTarget.style.background = AD)}>
                      Abrir →
                    </Link>
                    {confirmDelete === c.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleDelete(c.id)} style={{ padding: "8px 12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>Confirmar</button>
                        <button onClick={() => setConfirmDelete(null)} style={{ padding: "8px 10px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.78rem", cursor: "pointer" }}>✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(c.id)} title="Excluir operação" style={{ padding: "8px 10px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.78rem", cursor: "pointer", lineHeight: 1 }}>🗑</button>
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
