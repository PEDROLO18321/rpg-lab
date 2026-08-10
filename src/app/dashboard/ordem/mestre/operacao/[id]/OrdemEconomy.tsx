"use client";

import { useState, useMemo } from "react";
import type { OperacaoApi } from "@/lib/ordem/useOperacao";
import type { OrdemReward } from "@/lib/ordem/ordemCampaignClient";
import { PATENTES, patenteForPP } from "@/lib/ordem/data";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

const inputStyle: React.CSSProperties = {
  padding: "9px 12px", background: "var(--surface-2)", border: `1px solid ${AB}`, borderRadius: "var(--radius)",
  color: "var(--text)", fontSize: "0.86rem", width: "100%", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.68rem", fontWeight: 700, color: A, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4,
};

export function OrdemEconomy({ api }: { api: OperacaoApi }) {
  const rewards = api.campaign.ordemRewards;
  const players = api.campaign.ordemCombatants.filter((c) => c.isPlayer);

  const [agentName, setAgentName] = useState("");
  const [prestige, setPrestige] = useState("");
  const [reason, setReason] = useState("");

  // Totais de Prestígio por agente.
  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rewards) {
      const key = r.agentName || "—";
      map.set(key, (map.get(key) ?? 0) + r.prestige);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [rewards]);

  async function addReward() {
    const n = Number(prestige);
    if (!agentName.trim() || !Number.isFinite(n) || n === 0) return;
    await api.addChild("rewards", { agentName: agentName.trim(), prestige: n, reason: reason.trim() });
    setPrestige(""); setReason("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: AL }}>🎖</span> Prestígio & Patente
        </h2>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
          Pontos de Prestígio definem a Patente e o limite de Crédito do agente na Ordem.
        </p>
      </div>

      {/* Totais por agente */}
      {totals.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {totals.map(([name, pp]) => {
            const pat = patenteForPP(pp);
            return (
              <div key={name} style={{ padding: "14px 16px", background: "var(--surface)", border: `1px solid ${AB}`, borderRadius: "var(--radius-xl)" }}>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: AL, fontFamily: "var(--font-cinzel), serif", marginTop: 4 }}>{pp} <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>PP</span></p>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: AL, background: AD, border: `1px solid ${AB}`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>{pat.name}</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#7dd3a8", background: "rgba(125,211,168,0.1)", border: "1px solid rgba(125,211,168,0.28)", borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>Crédito {pat.credit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add reward */}
      <div style={{ padding: "18px 20px", background: "var(--surface)", border: `1px solid ${AB}`, borderRadius: "var(--radius-xl)" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: A, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Conceder / Remover Prestígio</p>
        <div className="op-economy-reward-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 3fr auto", gap: 10, alignItems: "end" }}>
          <div>
            <label style={labelStyle}>Agente</label>
            {players.length > 0 ? (
              <input list="player-names" value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Nome do agente" style={inputStyle} />
            ) : (
              <input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Nome do agente" style={inputStyle} />
            )}
            <datalist id="player-names">{players.map((p) => <option key={p.id} value={p.name} />)}</datalist>
          </div>
          <div>
            <label style={labelStyle}>Prestígio</label>
            <input type="number" value={prestige} onChange={(e) => setPrestige(e.target.value)} placeholder="+10 / -5" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Motivo</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addReward()} placeholder="Missão concluída, falha, conduta..." style={inputStyle} />
          </div>
          <button onClick={addReward} disabled={!agentName.trim() || !prestige} style={{ padding: "9px 18px", background: agentName.trim() && prestige ? `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)` : "var(--surface-2)", color: agentName.trim() && prestige ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.84rem", fontWeight: 700, cursor: agentName.trim() && prestige ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>Registrar</button>
        </div>
      </div>

      {/* Ledger */}
      <div>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10 }}>Histórico ({rewards.length})</p>
        {rewards.length === 0 ? (
          <p style={{ fontSize: "0.84rem", color: "var(--text-subtle)", textAlign: "center", padding: "24px 0" }}>Nenhum registro de prestígio ainda.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rewards.map((r: OrdemReward) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: r.prestige >= 0 ? "#4ade80" : "#f87171", minWidth: 44, fontFamily: "var(--font-cinzel), serif" }}>{r.prestige >= 0 ? "+" : ""}{r.prestige}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>{r.agentName}</p>
                  {r.reason && <p style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{r.reason}</p>}
                </div>
                <button onClick={() => api.removeChild("rewards", r.id)} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reference */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "18px 22px" }}>
        <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.82rem", fontWeight: 700, color: AL, marginBottom: 12 }}>Patentes da Ordem</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {PATENTES.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <span style={{ minWidth: 56, fontWeight: 700, color: AL }}>{p.minPP} PP</span>
              <span style={{ flex: 1, color: "var(--text)" }}>{p.name}</span>
              <span style={{ color: "#7dd3a8" }}>Crédito {p.credit}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
