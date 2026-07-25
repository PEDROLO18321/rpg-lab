"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { MasterDiceRoller } from "./MasterDiceRoller";
import {
  listCampaigns,
  createCampaign,
  deleteCampaign,
  type TormentaCampaignSummary,
} from "@/lib/tormenta/tormentaCampaignClient";

const ACCENT = "#a01818";
const ACCENT_LIGHT = "#c94040";
const ACCENT_DIM = "rgba(160,24,24,0.12)";
const ACCENT_BORD = "rgba(160,24,24,0.28)";

export default function MestrePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<TormentaCampaignSummary[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") listCampaigns().then(setCampaigns).catch(() => setCampaigns([]));
  }, [status]);

  const userName = session?.user?.name ?? session?.user?.email ?? "Mestre";

  async function handleCreate() {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const id = await createCampaign(name);
      setNewName("");
      setCreating(false);
      router.push(`/dashboard/tormenta/mestre/campanha/${id}`);
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
      <MasterDiceRoller />
      <DashboardNav
        userName={userName}
        systemName="Tormenta 20"
        systemHref="/dashboard/tormenta"
        backLabel="Tormenta 20"
        accentColor="#a01818"
      />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span className="section-label" style={{ display: "block", marginBottom: 8, color: ACCENT }}>
            Tormenta 20 · Arton
          </span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <h1
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.2,
              }}
            >
              Painel do <span style={{ color: ACCENT_LIGHT }}>Mestre</span>
            </h1>
            <button
              onClick={() => { setCreating(true); setNewName(""); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                background: ACCENT_DIM,
                color: ACCENT_LIGHT,
                border: `1px solid ${ACCENT_BORD}`,
                borderRadius: "var(--radius)",
                fontSize: "0.86rem",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(160,24,24,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT_DIM)}
            >
              + Nova Campanha
            </button>
          </div>
        </div>

        {/* Create campaign inline form */}
        {creating && (
          <div
            style={{
              marginBottom: 32,
              padding: "24px 28px",
              background: "var(--surface)",
              border: `1px solid ${ACCENT_BORD}`,
              borderRadius: "var(--radius-xl)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <label
                style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}
              >
                Nome da Campanha
              </label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                placeholder="Ex: A Fúria da Tormenta"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--surface-2)",
                  border: `1px solid ${ACCENT_BORD}`,
                  borderRadius: "var(--radius)",
                  color: "var(--text)",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, alignSelf: "flex-end" }}>
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                style={{
                  padding: "10px 20px",
                  background: newName.trim() ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)` : "var(--surface-2)",
                  color: newName.trim() ? "#06090f" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: "0.86rem",
                  fontWeight: 700,
                  cursor: newName.trim() ? "pointer" : "not-allowed",
                  transition: "opacity 0.2s",
                }}
              >
                Criar
              </button>
              <button
                onClick={() => setCreating(false)}
                style={{
                  padding: "10px 16px",
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: "0.86rem",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Campaigns list */}
        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <h2
              style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.92rem",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "0.04em",
              }}
            >
              Minhas Campanhas
            </h2>
            {campaigns.length > 0 && (
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: ACCENT_LIGHT,
                  background: ACCENT_DIM,
                  border: `1px solid ${ACCENT_BORD}`,
                  borderRadius: "var(--radius-full)",
                  padding: "2px 8px",
                }}
              >
                {campaigns.length}
              </span>
            )}
          </div>

          {campaigns.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "60px 24px",
                background: "var(--surface)",
                border: `1px dashed ${ACCENT_BORD}`,
                borderRadius: "var(--radius-xl)",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 52, height: 52,
                  borderRadius: "var(--radius-lg)",
                  background: ACCENT_DIM,
                  border: `1px solid ${ACCENT_BORD}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: ACCENT_LIGHT, marginBottom: 4,
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
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", maxWidth: 340, lineHeight: 1.65 }}>
                Crie sua primeira campanha para acessar as ferramentas do Mestre — NPCs, iniciativa, notas e bestiário.
              </p>
              <button
                onClick={() => setCreating(true)}
                style={{
                  marginTop: 8,
                  padding: "9px 20px",
                  background: ACCENT_DIM,
                  color: ACCENT_LIGHT,
                  border: `1px solid ${ACCENT_BORD}`,
                  borderRadius: "var(--radius)",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(160,24,24,0.22)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT_DIM)}
              >
                + Criar campanha
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "18px 24px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-xl)",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = ACCENT_BORD)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                    <div
                      style={{
                        width: 40, height: 40, flexShrink: 0,
                        borderRadius: "var(--radius)",
                        background: ACCENT_DIM,
                        border: `1px solid ${ACCENT_BORD}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: ACCENT_LIGHT,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.name}
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {c._count.tormentaNpcs} NPC{c._count.tormentaNpcs !== 1 ? "s" : ""} · {c._count.tormentaCombatants} combatente{c._count.tormentaCombatants !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <Link
                      href={`/dashboard/tormenta/mestre/campanha/${c.id}`}
                      style={{
                        padding: "8px 16px",
                        background: ACCENT_DIM,
                        color: ACCENT_LIGHT,
                        border: `1px solid ${ACCENT_BORD}`,
                        borderRadius: "var(--radius)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        textDecoration: "none",
                        transition: "background 0.2s",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(160,24,24,0.22)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT_DIM)}
                    >
                      Abrir →
                    </Link>
                    {confirmDelete === c.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleDelete(c.id)}
                          style={{ padding: "8px 12px", background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          style={{ padding: "8px 10px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.78rem", cursor: "pointer" }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(c.id)}
                        title="Excluir campanha"
                        style={{ padding: "8px 10px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.78rem", cursor: "pointer", lineHeight: 1 }}
                      >
                        🗑
                      </button>
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
