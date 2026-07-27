"use client";

import { useState } from "react";
import type { DndApi } from "@/lib/dnd/useDndCampaign";
import type { DndCombatant } from "@/lib/dnd/dndCampaignClient";
import { DND_CONDITIONS, DND_CONDITION_BY_ID } from "@/lib/dnd/conditions";
import "../../../dnd-responsive.css";

const ACCENT = "var(--accent)";
const ACCENT_LIGHT = "var(--accent-light)";
const ACCENT_DIM = "var(--accent-dim)";
const ACCENT_BORD = "var(--border-accent)";

function rollD20() { return Math.floor(Math.random() * 20) + 1; }

const btnBase: React.CSSProperties = { height: 26, background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", color: "var(--text-muted)", transition: "all 0.15s" };
const inputStyle: React.CSSProperties = { padding: "9px 12px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", width: "100%", boxSizing: "border-box" };

function parseConditions(json: string): string[] { try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; } }

export function InitiativeTracker({ api }: { api: DndApi }) {
  const combatants = api.campaign.dndCombatants;
  const [name, setName] = useState("");
  const [initVal, setInitVal] = useState("");
  const [hp, setHp] = useState("");
  const [ac, setAc] = useState("");
  const [isPlayer, setIsPlayer] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [condFor, setCondFor] = useState<string | null>(null);

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const initiative = initVal !== "" ? Number(initVal) : rollD20();
    const hpNum = hp !== "" ? Number(hp) : null;
    await api.addChild("combatants", {
      name: trimmed, initiative, hp: hpNum, maxHp: hpNum, tempHp: 0,
      ac: ac !== "" ? Number(ac) : null, conditions: "[]", concentration: false, isPlayer, order: combatants.length,
    });
    setName(""); setInitVal(""); setHp(""); setAc(""); setIsPlayer(false);
  }

  async function sortByInit() {
    const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);
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

  function heal(c: DndCombatant, amount: number) {
    if (c.hp === null) return;
    const max = c.maxHp ?? c.hp + amount;
    api.editChild("combatants", c.id, { hp: Math.min(max, c.hp + amount) });
  }
  function damage(c: DndCombatant, raw: number) {
    if (c.hp === null) return;
    let dmg = raw, temp = c.tempHp;
    if (temp > 0) { const absorbed = Math.min(temp, dmg); temp -= absorbed; dmg -= absorbed; }
    api.editChild("combatants", c.id, { hp: Math.max(0, c.hp - dmg), tempHp: temp });
  }
  function toggleCondition(c: DndCombatant, id: string) {
    const cur = parseConditions(c.conditions);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    api.editChild("combatants", c.id, { conditions: JSON.stringify(next) });
  }

  return (
    <div>
      {/* Add combatant */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 420px", padding: "16px 20px", background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Adicionar Combatente</p>
          <div className="dnd-initiative-form-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Ex: Goblin Arqueiro" style={inputStyle} />
            <input type="number" value={initVal} onChange={(e) => setInitVal(e.target.value)} placeholder="Inic" title="Iniciativa (vazio = d20)" style={inputStyle} />
            <input type="number" value={hp} onChange={(e) => setHp(e.target.value)} placeholder="PV" style={inputStyle} />
            <input type="number" value={ac} onChange={(e) => setAc(e.target.value)} placeholder="CA" title="Classe de Armadura" style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--text-muted)", cursor: "pointer" }}>
              <input type="checkbox" checked={isPlayer} onChange={(e) => setIsPlayer(e.target.checked)} /> Jogador (PC)
            </label>
            <button onClick={add} disabled={!name.trim()} style={{ padding: "9px 20px", background: name.trim() ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)` : "var(--surface-2)", color: name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed" }}>+ Adicionar</button>
          </div>
        </div>
      </div>

      {combatants.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={sortByInit} style={{ padding: "8px 16px", background: ACCENT_DIM, color: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>↕ Ordenar por Iniciativa</button>
          <button onClick={nextTurn} style={{ padding: "8px 16px", background: ACCENT_DIM, color: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>▶ Próximo Turno</button>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>Rodada {round}</span>
          <button onClick={() => { setActiveId(null); setRound(1); }} style={{ padding: "8px 14px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.82rem", cursor: "pointer", marginLeft: "auto" }}>Reiniciar rodadas</button>
        </div>
      )}

      {combatants.length === 0 ? (
        <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "40px 0" }}>Nenhum combatente. Adicione personagens, monstros ou NPCs acima.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {combatants.map((c) => {
            const isActive = c.id === activeId;
            const conds = parseConditions(c.conditions);
            const hpPct = c.hp !== null && c.maxHp ? Math.max(0, c.hp / c.maxHp) : null;
            const hpColor = hpPct !== null && hpPct < 0.3 ? "#f87171" : hpPct !== null && hpPct < 0.6 ? "#fbbf24" : "#4ade80";
            return (
              <div key={c.id} style={{ background: isActive ? ACCENT_DIM : "var(--surface)", border: `1px solid ${isActive ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-xl)", transition: "all 0.2s", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", flexWrap: "wrap" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? ACCENT : "transparent", border: `2px solid ${isActive ? ACCENT : "var(--border)"}`, flexShrink: 0 }} />
                  <div style={{ minWidth: 36, height: 36, borderRadius: "var(--radius)", background: isActive ? ACCENT_DIM : c.isPlayer ? "rgba(99,179,237,0.1)" : "var(--surface-2)", border: `1px solid ${isActive ? ACCENT_BORD : c.isPlayer ? "rgba(99,179,237,0.25)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", fontWeight: 700, color: isActive ? ACCENT_LIGHT : c.isPlayer ? "#63b3ed" : "var(--text-muted)", flexShrink: 0 }}>{c.initiative}</div>
                  <div style={{ flex: 1, minWidth: 90 }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: isActive ? ACCENT_LIGHT : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}{c.concentration && <span title="Concentrando" style={{ color: "#a78bfa", marginLeft: 6, fontSize: "0.72rem" }}>◈ conc.</span>}</p>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>{c.isPlayer ? "Jogador" : "Monstro/NPC"}{c.ac !== null ? ` · CA ${c.ac}` : ""}{c.tempHp > 0 ? ` · PV temp ${c.tempHp}` : ""}</p>
                  </div>

                  {c.hp !== null && c.maxHp !== null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => damage(c, 5)} title="−5 PV" style={{ ...btnBase, color: "#f87171", borderColor: "rgba(239,68,68,0.2)", width: 24 }}>{"<"}</button>
                      <button onClick={() => damage(c, 1)} title="−1 PV" style={{ ...btnBase, color: "#f87171", borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)", width: 24 }}>−</button>
                      <div style={{ minWidth: 56, textAlign: "center" }}>
                        <p style={{ fontSize: "0.82rem", fontWeight: 700, color: hpColor }}>{c.hp}/{c.maxHp}</p>
                        <div style={{ height: 3, background: "var(--surface-2)", borderRadius: 2, marginTop: 2 }}><div style={{ height: "100%", width: `${(hpPct ?? 1) * 100}%`, background: hpColor, borderRadius: 2, transition: "width 0.3s" }} /></div>
                      </div>
                      <button onClick={() => heal(c, 1)} title="+1 PV" style={{ ...btnBase, color: "#4ade80", borderColor: "rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.08)", width: 24 }}>+</button>
                      <button onClick={() => heal(c, 5)} title="+5 PV" style={{ ...btnBase, color: "#4ade80", borderColor: "rgba(74,222,128,0.2)", width: 24 }}>{">"}</button>
                      <DamageBox onApply={(n) => damage(c, n)} />
                    </div>
                  )}

                  <button onClick={() => api.editChild("combatants", c.id, { concentration: !c.concentration })} title="Concentração" style={{ ...btnBase, height: 30, padding: "0 8px", color: c.concentration ? "#a78bfa" : "var(--text-muted)", borderColor: c.concentration ? "#a78bfa55" : "var(--border)" }}>◈</button>
                  <button onClick={() => setCondFor(condFor === c.id ? null : c.id)} title="Condições" style={{ ...btnBase, height: 30, padding: "0 10px", color: conds.length ? "#fbbf24" : "var(--text-muted)", borderColor: conds.length ? "#fbbf2444" : "var(--border)" }}>⚑ {conds.length || ""}</button>
                  <button onClick={() => api.removeChild("combatants", c.id)} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem", flexShrink: 0 }}>✕</button>
                </div>

                {conds.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "0 14px 10px 30px" }}>
                    {conds.map((id) => {
                      const cd = DND_CONDITION_BY_ID[id]; if (!cd) return null;
                      return <span key={id} title={cd.desc} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#fbbf241a", border: "1px solid #fbbf2455", borderRadius: "var(--radius-xs)", fontSize: "0.7rem", color: "#fbbf24", fontWeight: 700 }}>{cd.name}<button onClick={() => toggleCondition(c, id)} style={{ background: "transparent", border: "none", color: "#fbbf24", cursor: "pointer", fontSize: "0.75rem", lineHeight: 1, padding: 0 }}>×</button></span>;
                    })}
                  </div>
                )}

                {condFor === c.id && (
                  <div style={{ padding: "10px 14px 14px 30px", borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Aplicar / remover condição</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {DND_CONDITIONS.map((cd) => {
                        const on = conds.includes(cd.id);
                        return <button key={cd.id} title={cd.desc} onClick={() => toggleCondition(c, cd.id)} style={{ padding: "3px 9px", borderRadius: "var(--radius-xs)", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", background: on ? "#fbbf242a" : "var(--surface-2)", border: `1px solid ${on ? "#fbbf24" : "var(--border)"}`, color: on ? "#fbbf24" : "var(--text-muted)" }}>{cd.name}</button>;
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

function DamageBox({ onApply }: { onApply: (n: number) => void }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");
  if (!open) return <button onClick={() => setOpen(true)} title="Aplicar dano" style={{ ...btnBase, height: 28, padding: "0 8px", color: "#f87171", borderColor: "#f8717144" }}>⚔</button>;
  const apply = () => { const n = Number(val); if (Number.isFinite(n) && n > 0) onApply(n); setVal(""); setOpen(false); };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <input type="number" autoFocus value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") apply(); if (e.key === "Escape") setOpen(false); }} placeholder="dano" style={{ width: 54, padding: "5px 6px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.78rem" }} />
      <button onClick={apply} style={{ ...btnBase, height: 28, color: "#f87171", borderColor: "#f8717144" }}>ok</button>
      <button onClick={() => setOpen(false)} style={{ ...btnBase, height: 28, width: 22 }}>×</button>
    </div>
  );
}
