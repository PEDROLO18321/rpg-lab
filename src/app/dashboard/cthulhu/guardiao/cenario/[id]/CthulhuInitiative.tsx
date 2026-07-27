"use client";

import { useState } from "react";
import type { CthulhuApi } from "@/lib/cthulhu/useCthulhuCampaign";
import type { CthulhuCombatant } from "@/lib/cthulhu/cthulhuCampaignClient";
import { CTHULHU_STATES, CTHULHU_STATE_BY_ID } from "@/lib/cthulhu/states";
import "../../../cthulhu-responsive.css";

const A = "#a3b86c";
const ADIM = "rgba(125,156,62,0.14)";
const ABORD = "rgba(125,156,62,0.32)";

const btnBase: React.CSSProperties = { height: 26, background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", color: "var(--text-muted)", transition: "all 0.15s" };
const inputStyle: React.CSSProperties = { padding: "9px 12px", background: "var(--surface-2)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", width: "100%", boxSizing: "border-box" };

function parseConditions(json: string): string[] { try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; } }

export function CthulhuInitiative({ api }: { api: CthulhuApi }) {
  const combatants = api.campaign.cthulhuCombatants;
  const [name, setName] = useState("");
  const [dexVal, setDexVal] = useState("");
  const [hp, setHp] = useState("");
  const [san, setSan] = useState("");
  const [mp, setMp] = useState("");
  const [isPlayer, setIsPlayer] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [condFor, setCondFor] = useState<string | null>(null);

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const dex = dexVal !== "" ? Number(dexVal) : Math.floor(Math.random() * 70) + 30;
    const hpNum = hp !== "" ? Number(hp) : null;
    const sanNum = san !== "" ? Number(san) : null;
    const mpNum = mp !== "" ? Number(mp) : null;
    await api.addChild("combatants", { name: trimmed, dex, hp: hpNum, maxHp: hpNum, san: sanNum, maxSan: sanNum, mp: mpNum, maxMp: mpNum, conditions: "[]", isPlayer, order: combatants.length });
    setName(""); setDexVal(""); setHp(""); setSan(""); setMp(""); setIsPlayer(false);
  }

  async function sortByDex() {
    const sorted = [...combatants].sort((a, b) => b.dex - a.dex);
    for (let i = 0; i < sorted.length; i++) if (sorted[i].order !== i) await api.editChild("combatants", sorted[i].id, { order: i });
  }

  function nextTurn() {
    if (combatants.length === 0) return;
    if (activeId === null) { setActiveId(combatants[0].id); return; }
    const idx = combatants.findIndex((c) => c.id === activeId);
    const nextIdx = (idx + 1) % combatants.length;
    if (nextIdx === 0) setRound((r) => r + 1);
    setActiveId(combatants[nextIdx].id);
  }

  function adjust(c: CthulhuCombatant, field: "hp" | "san" | "mp", delta: number) {
    if (c[field] === null) return;
    const max = field === "hp" ? c.maxHp : field === "san" ? c.maxSan : c.maxMp;
    let next = (c[field] as number) + delta;
    next = Math.max(0, next);
    if (max !== null) next = Math.min(max, next);
    api.editChild("combatants", c.id, { [field]: next });
  }
  function toggleCondition(c: CthulhuCombatant, id: string) {
    const cur = parseConditions(c.conditions);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    api.editChild("combatants", c.id, { conditions: JSON.stringify(next) });
  }

  function vital(c: CthulhuCombatant, field: "hp" | "san" | "mp", label: string, baseColor: string) {
    const cur = c[field];
    const max = field === "hp" ? c.maxHp : field === "san" ? c.maxSan : c.maxMp;
    if (cur === null || max === null) return null;
    const pct = max > 0 ? Math.max(0, cur / max) : 0;
    const color = field === "hp" ? (pct < 0.3 ? "#f87171" : pct < 0.6 ? "#fbbf24" : "#4ade80") : baseColor;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
        <span style={{ fontSize: "0.6rem", color: "var(--text-subtle)", marginRight: 2 }}>{label}</span>
        <button onClick={() => adjust(c, field, -1)} style={{ ...btnBase, color, borderColor: `${color}44`, background: `${color}14`, width: 24 }}>−</button>
        <div style={{ minWidth: 46, textAlign: "center" }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color }}>{cur}/{max}</p>
          <div style={{ height: 3, background: "var(--surface-2)", borderRadius: 2, marginTop: 2 }}><div style={{ height: "100%", width: `${pct * 100}%`, background: color, borderRadius: 2, transition: "width 0.3s" }} /></div>
        </div>
        <button onClick={() => adjust(c, field, 1)} style={{ ...btnBase, color, borderColor: `${color}44`, background: `${color}14`, width: 24 }}>+</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 420px", padding: "16px 20px", background: "var(--surface)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius-xl)" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#7d9c3e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Adicionar à Ordem de Ação</p>
          <div className="cth-initiative-add-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Ex: Cultista, Ghoul" style={inputStyle} />
            <input type="number" value={dexVal} onChange={(e) => setDexVal(e.target.value)} placeholder="DEX" title="DEX (vazio = aleatório)" style={inputStyle} />
            <input type="number" value={hp} onChange={(e) => setHp(e.target.value)} placeholder="PV" style={inputStyle} />
            <input type="number" value={san} onChange={(e) => setSan(e.target.value)} placeholder="SAN" style={inputStyle} />
            <input type="number" value={mp} onChange={(e) => setMp(e.target.value)} placeholder="PM" title="Pontos de Magia" style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--text-muted)", cursor: "pointer" }}>
              <input type="checkbox" checked={isPlayer} onChange={(e) => setIsPlayer(e.target.checked)} /> Investigador (PC)
            </label>
            <button onClick={add} disabled={!name.trim()} style={{ padding: "9px 20px", background: name.trim() ? "linear-gradient(135deg, #a3b86c 0%, #7d9c3e 100%)" : "var(--surface-2)", color: name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed" }}>+ Adicionar</button>
          </div>
        </div>
      </div>

      {combatants.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={sortByDex} style={{ padding: "8px 16px", background: ADIM, color: A, border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>↕ Ordenar por DEX</button>
          <button onClick={nextTurn} style={{ padding: "8px 16px", background: ADIM, color: A, border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>▶ Próxima Ação</button>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>Rodada {round}</span>
          <button onClick={() => { setActiveId(null); setRound(1); }} style={{ padding: "8px 14px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.82rem", cursor: "pointer", marginLeft: "auto" }}>Reiniciar rodadas</button>
        </div>
      )}

      {combatants.length === 0 ? (
        <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "40px 0" }}>Nenhum combatente. Adicione investigadores ou criaturas acima.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {combatants.map((c) => {
            const isActive = c.id === activeId;
            const conds = parseConditions(c.conditions);
            return (
              <div key={c.id} style={{ background: isActive ? ADIM : "var(--surface)", border: `1px solid ${isActive ? ABORD : "var(--border)"}`, borderRadius: "var(--radius-xl)", transition: "all 0.2s", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", flexWrap: "wrap" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? "#7d9c3e" : "transparent", border: `2px solid ${isActive ? "#7d9c3e" : "var(--border)"}`, flexShrink: 0 }} />
                  <div style={{ minWidth: 36, height: 36, borderRadius: "var(--radius)", background: isActive ? ADIM : c.isPlayer ? "rgba(99,179,237,0.1)" : "var(--surface-2)", border: `1px solid ${isActive ? ABORD : c.isPlayer ? "rgba(99,179,237,0.25)" : "var(--border)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "0.66rem", fontWeight: 700, color: isActive ? A : c.isPlayer ? "#63b3ed" : "var(--text-muted)", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.5rem", letterSpacing: "0.04em", opacity: 0.7 }}>DEX</span><span>{c.dex}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 90 }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: isActive ? A : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>{c.isPlayer ? "Investigador" : "Criatura/NPC"}</p>
                  </div>
                  {vital(c, "hp", "PV", "#4ade80")}
                  {vital(c, "san", "SAN", "#a78bfa")}
                  {vital(c, "mp", "PM", "#60a5fa")}
                  <button onClick={() => setCondFor(condFor === c.id ? null : c.id)} title="Estados" style={{ ...btnBase, height: 30, padding: "0 10px", color: conds.length ? "#fbbf24" : "var(--text-muted)", borderColor: conds.length ? "#fbbf2444" : "var(--border)" }}>⚑ {conds.length || ""}</button>
                  <button onClick={() => api.removeChild("combatants", c.id)} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem", flexShrink: 0 }}>✕</button>
                </div>

                {conds.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "0 14px 10px 30px" }}>
                    {conds.map((id) => {
                      const st = CTHULHU_STATE_BY_ID[id]; if (!st) return null;
                      return <span key={id} title={st.desc} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#fbbf241a", border: "1px solid #fbbf2455", borderRadius: "var(--radius-xs)", fontSize: "0.7rem", color: "#fbbf24", fontWeight: 700 }}>{st.name}<button onClick={() => toggleCondition(c, id)} style={{ background: "transparent", border: "none", color: "#fbbf24", cursor: "pointer", fontSize: "0.75rem", lineHeight: 1, padding: 0 }}>×</button></span>;
                    })}
                  </div>
                )}

                {condFor === c.id && (
                  <div style={{ padding: "10px 14px 14px 30px", borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Aplicar / remover estado</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {CTHULHU_STATES.map((st) => {
                        const on = conds.includes(st.id);
                        return <button key={st.id} title={st.desc} onClick={() => toggleCondition(c, st.id)} style={{ padding: "3px 9px", borderRadius: "var(--radius-xs)", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", background: on ? "#fbbf242a" : "var(--surface-2)", border: `1px solid ${on ? "#fbbf24" : "var(--border)"}`, color: on ? "#fbbf24" : "var(--text-muted)" }}>{st.name}</button>;
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
