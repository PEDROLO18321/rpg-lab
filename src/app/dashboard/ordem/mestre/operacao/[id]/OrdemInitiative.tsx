"use client";

import { useState } from "react";
import type { OperacaoApi } from "@/lib/ordem/useOperacao";
import type { OrdemCombatant } from "@/lib/ordem/ordemCampaignClient";
import { CONDITIONS, CONDITION_BY_ID, CATEGORY_COLOR } from "@/lib/ordem/conditions";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

const btnBase: React.CSSProperties = {
  height: 26, background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius)",
  cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, lineHeight: 1, display: "flex",
  alignItems: "center", justifyContent: "center", padding: "0 5px", color: "var(--text-muted)", transition: "all 0.15s",
};
const inputStyle: React.CSSProperties = {
  padding: "9px 12px", background: "var(--surface-2)", border: `1px solid ${AB}`, borderRadius: "var(--radius)",
  color: "var(--text)", fontSize: "0.86rem", width: "100%", boxSizing: "border-box",
};

function parseConditions(json: string): string[] {
  try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; }
}

export function OrdemInitiative({ api }: { api: OperacaoApi }) {
  const combatants = api.campaign.ordemCombatants;
  const [name, setName] = useState("");
  const [initVal, setInitVal] = useState("");
  const [pv, setPv] = useState("");
  const [pe, setPe] = useState("");
  const [san, setSan] = useState("");
  const [rd, setRd] = useState("");
  const [isPlayer, setIsPlayer] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [token, setToken] = useState("");
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [condFor, setCondFor] = useState<string | null>(null);

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const init = initVal !== "" ? Number(initVal) : Math.floor(Math.random() * 20) + 1;
    const pvNum = pv !== "" ? Number(pv) : null;
    const peNum = pe !== "" ? Number(pe) : null;
    const sanNum = san !== "" ? Number(san) : null;
    await api.addChild("combatants", {
      name: trimmed, init, pv: pvNum, maxPv: pvNum, pe: peNum, maxPe: peNum,
      san: sanNum, maxSan: sanNum, rd: rd !== "" ? Number(rd) : 0, isPlayer,
      conditions: "[]", order: combatants.length,
    });
    setName(""); setInitVal(""); setPv(""); setPe(""); setSan(""); setRd(""); setIsPlayer(false);
  }

  async function doImport() {
    const t = token.trim(); if (!t) return;
    try {
      const agentName = await api.importAgent(t);
      setToken(""); setImportMsg(`✓ ${agentName} importado.`);
      setTimeout(() => setImportMsg(null), 4000);
    } catch (e) {
      setImportMsg(`✗ ${(e as Error).message}`);
      setTimeout(() => setImportMsg(null), 4000);
    }
  }

  async function sortByInit() {
    const sorted = [...combatants].sort((a, b) => b.init - a.init);
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].order !== i) await api.editChild("combatants", sorted[i].id, { order: i });
    }
  }

  function nextTurn() {
    if (combatants.length === 0) return;
    if (activeId === null) { setActiveId(combatants[0].id); return; }
    const idx = combatants.findIndex((c) => c.id === activeId);
    const nextIdx = (idx + 1) % combatants.length;
    if (nextIdx === 0) setRound((r) => r + 1);
    setActiveId(combatants[nextIdx].id);
  }

  function adjust(c: OrdemCombatant, field: "pv" | "pe" | "san", delta: number) {
    if (c[field] === null) return;
    const max = field === "pv" ? c.maxPv : field === "pe" ? c.maxPe : c.maxSan;
    let next = (c[field] as number) + delta;
    next = Math.max(0, next);
    if (max !== null) next = Math.min(max, next);
    api.editChild("combatants", c.id, { [field]: next });
  }

  function applyDamage(c: OrdemCombatant, raw: number, ignoreRd: boolean) {
    if (c.pv === null) return;
    const dmg = ignoreRd ? raw : Math.max(0, raw - c.rd);
    api.editChild("combatants", c.id, { pv: Math.max(0, c.pv - dmg) });
  }

  function toggleCondition(c: OrdemCombatant, condId: string) {
    const cur = parseConditions(c.conditions);
    const next = cur.includes(condId) ? cur.filter((x) => x !== condId) : [...cur, condId];
    api.editChild("combatants", c.id, { conditions: JSON.stringify(next) });
  }

  function vital(c: OrdemCombatant, field: "pv" | "pe" | "san", label: string, color: string) {
    const cur = c[field];
    const max = field === "pv" ? c.maxPv : field === "pe" ? c.maxPe : c.maxSan;
    if (cur === null || max === null) return null;
    const pct = max > 0 ? Math.max(0, cur / max) : 0;
    const barColor = field === "pv" ? (pct < 0.3 ? "#f87171" : pct < 0.6 ? "#fbbf24" : "#4ade80") : color;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
        <span style={{ fontSize: "0.6rem", color: "var(--text-subtle)", marginRight: 2 }}>{label}</span>
        <button onClick={() => adjust(c, field, -1)} style={{ ...btnBase, color: barColor, borderColor: `${barColor}44`, background: `${barColor}14`, width: 24 }}>−</button>
        <div style={{ minWidth: 46, textAlign: "center" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: barColor }}>{cur}/{max}</p>
          <div style={{ height: 3, background: "var(--surface-2)", borderRadius: 2, marginTop: 2 }}>
            <div style={{ height: "100%", width: `${pct * 100}%`, background: barColor, borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        </div>
        <button onClick={() => adjust(c, field, 1)} style={{ ...btnBase, color: barColor, borderColor: `${barColor}44`, background: `${barColor}14`, width: 24 }}>+</button>
      </div>
    );
  }

  return (
    <div>
      {/* Import + add forms */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", padding: "16px 20px", background: "var(--surface)", border: `1px solid ${AB}`, borderRadius: "var(--radius-xl)" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: A, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Importar Ficha de Agente</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={token} onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doImport()} placeholder="Código de compartilhamento da ficha" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={doImport} disabled={!token.trim()} style={{ padding: "9px 16px", background: token.trim() ? AD : "var(--surface-2)", color: token.trim() ? AL : "var(--text-subtle)", border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: token.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>Importar</button>
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginTop: 8, lineHeight: 1.5 }}>
            O jogador encontra o código na ficha dele. Importa PV/PE/SAN reais e adiciona à ordem e ao rastreador de Sanidade.
          </p>
          {importMsg && <p style={{ fontSize: "0.76rem", marginTop: 8, color: importMsg.startsWith("✓") ? "#4ade80" : "#f87171" }}>{importMsg}</p>}
        </div>

        <div style={{ flex: "2 1 420px", padding: "16px 20px", background: "var(--surface)", border: `1px solid ${AB}`, borderRadius: "var(--radius-xl)" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: A, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Adicionar à Ordem de Ação</p>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Nome" style={inputStyle} />
            <input type="number" value={initVal} onChange={(e) => setInitVal(e.target.value)} placeholder="Inic" title="Iniciativa (vazio = d20)" style={inputStyle} />
            <input type="number" value={pv} onChange={(e) => setPv(e.target.value)} placeholder="PV" style={inputStyle} />
            <input type="number" value={pe} onChange={(e) => setPe(e.target.value)} placeholder="PE" style={inputStyle} />
            <input type="number" value={san} onChange={(e) => setSan(e.target.value)} placeholder="SAN" style={inputStyle} />
            <input type="number" value={rd} onChange={(e) => setRd(e.target.value)} placeholder="RD" title="Redução de Dano" style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--text-muted)", cursor: "pointer" }}>
              <input type="checkbox" checked={isPlayer} onChange={(e) => setIsPlayer(e.target.checked)} /> Agente (PC)
            </label>
            <button onClick={add} disabled={!name.trim()} style={{ padding: "9px 20px", background: name.trim() ? `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)` : "var(--surface-2)", color: name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed" }}>+ Adicionar</button>
          </div>
        </div>
      </div>

      {/* Controls */}
      {combatants.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={sortByInit} style={{ padding: "8px 16px", background: AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>↕ Ordenar por Iniciativa</button>
          <button onClick={nextTurn} style={{ padding: "8px 16px", background: AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>▶ Próxima Ação</button>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>Rodada {round}</span>
          <button onClick={() => { setActiveId(null); setRound(1); }} style={{ padding: "8px 14px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.82rem", cursor: "pointer", marginLeft: "auto" }}>Reiniciar rodadas</button>
        </div>
      )}

      {/* List */}
      {combatants.length === 0 ? (
        <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "40px 0" }}>Ninguém na ordem de ação. Importe agentes ou adicione criaturas/NPCs acima.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {combatants.map((c) => {
            const isActive = c.id === activeId;
            const conds = parseConditions(c.conditions);
            return (
              <div key={c.id} style={{ background: isActive ? AD : "var(--surface)", border: `1px solid ${isActive ? AB : "var(--border)"}`, borderRadius: "var(--radius-xl)", transition: "all 0.2s", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", flexWrap: "wrap" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? A : "transparent", border: `2px solid ${isActive ? A : "var(--border)"}`, flexShrink: 0 }} />
                  <div style={{ minWidth: 40, height: 36, borderRadius: "var(--radius)", background: isActive ? AD : c.isPlayer ? "rgba(99,179,237,0.1)" : "var(--surface-2)", border: `1px solid ${isActive ? AB : c.isPlayer ? "rgba(99,179,237,0.25)" : "var(--border)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "0.66rem", fontWeight: 700, color: isActive ? AL : c.isPlayer ? "#63b3ed" : "var(--text-muted)", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.46rem", letterSpacing: "0.04em", opacity: 0.7 }}>INIC</span><span>{c.init}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 100 }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: isActive ? AL : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>{c.isPlayer ? "Agente" : "Criatura/NPC"}{c.rd > 0 ? ` · RD ${c.rd}` : ""}</p>
                  </div>
                  {vital(c, "pv", "PV", "#4ade80")}
                  {vital(c, "pe", "PE", "#60a5fa")}
                  {vital(c, "san", "SAN", "#a78bfa")}
                  <button onClick={() => setCondFor(condFor === c.id ? null : c.id)} title="Condições" style={{ ...btnBase, height: 30, padding: "0 10px", color: conds.length ? "#fbbf24" : "var(--text-muted)", borderColor: conds.length ? "#fbbf2444" : "var(--border)" }}>⚑ {conds.length || ""}</button>
                  <DamageBox onApply={(raw, ig) => applyDamage(c, raw, ig)} hasRd={c.rd > 0} />
                  <button onClick={() => api.removeChild("combatants", c.id)} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem", flexShrink: 0 }}>✕</button>
                </div>

                {/* Conditions chips */}
                {conds.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "0 14px 10px 30px" }}>
                    {conds.map((id) => {
                      const cd = CONDITION_BY_ID[id];
                      if (!cd) return null;
                      const col = CATEGORY_COLOR[cd.category];
                      return (
                        <span key={id} title={cd.desc} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", background: `${col}1a`, border: `1px solid ${col}55`, borderRadius: "var(--radius-xs)", fontSize: "0.7rem", color: col, fontWeight: 700 }}>
                          {cd.name}<button onClick={() => toggleCondition(c, id)} style={{ background: "transparent", border: "none", color: col, cursor: "pointer", fontSize: "0.75rem", lineHeight: 1, padding: 0 }}>×</button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Condition picker */}
                {condFor === c.id && (
                  <div style={{ padding: "10px 14px 14px 30px", borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Aplicar / remover condição</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {CONDITIONS.map((cd) => {
                        const on = conds.includes(cd.id);
                        const col = CATEGORY_COLOR[cd.category];
                        return (
                          <button key={cd.id} title={cd.desc} onClick={() => toggleCondition(c, cd.id)}
                            style={{ padding: "3px 9px", borderRadius: "var(--radius-xs)", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", background: on ? `${col}2a` : "var(--surface-2)", border: `1px solid ${on ? col : "var(--border)"}`, color: on ? col : "var(--text-muted)" }}>
                            {cd.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DamageBox({ onApply, hasRd }: { onApply: (raw: number, ignoreRd: boolean) => void; hasRd: boolean }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  if (!open) {
    return <button onClick={() => setOpen(true)} title="Aplicar dano" style={{ ...btnBase, height: 30, padding: "0 10px", color: "#f87171", borderColor: "#f8717144" }}>⚔ Dano</button>;
  }
  const apply = (ignoreRd: boolean) => { const n = Number(val); if (Number.isFinite(n) && n > 0) onApply(n, ignoreRd); setVal(""); setOpen(false); };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
      <input type="number" autoFocus value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") apply(false); if (e.key === "Escape") setOpen(false); }} placeholder="dano" style={{ width: 56, padding: "5px 6px", background: "var(--surface-2)", border: `1px solid ${AB}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.78rem" }} />
      <button onClick={() => apply(false)} title={hasRd ? "Aplicar (subtrai RD)" : "Aplicar"} style={{ ...btnBase, height: 28, color: "#f87171", borderColor: "#f8717144" }}>−RD</button>
      <button onClick={() => apply(true)} title="Ignorar RD (dano que ignora resistência)" style={{ ...btnBase, height: 28, color: "var(--text-muted)" }}>cru</button>
      <button onClick={() => setOpen(false)} style={{ ...btnBase, height: 28, width: 22 }}>×</button>
    </div>
  );
}
