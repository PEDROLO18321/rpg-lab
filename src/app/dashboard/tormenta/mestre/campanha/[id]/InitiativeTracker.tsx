"use client";

import "../../../tormenta-responsive.css";
import { useState } from "react";
import type { TormentaApi } from "@/lib/tormenta/useTormentaCampaign";
import type { TormentaCombatant } from "@/lib/tormenta/tormentaCampaignClient";

const ACCENT = "#a01818";
const ACCENT_LIGHT = "#c94040";
const ACCENT_DIM = "rgba(160,24,24,0.12)";
const ACCENT_BORD = "rgba(160,24,24,0.28)";

interface Condition { id: string; name: string; desc: string }

const TORMENTA_CONDITIONS: Condition[] = [
  { id: "abalado",      name: "Abalado",      desc: "-2 em testes de perícia, ataque, dano e resistência." },
  { id: "apavorado",    name: "Apavorado",    desc: "Abalado e deve fugir da fonte do medo por meios não prejudiciais." },
  { id: "atordoado",    name: "Atordoado",    desc: "Não pode agir, perde a Defesa de Destreza e escudo." },
  { id: "caido",        name: "Caído",        desc: "-2 para atacar; corpo a corpo contra tem +2, à distância tem -2." },
  { id: "cego",         name: "Cego",         desc: "Falha em testes que exijam visão; -5 para atacar; 50% de falha em ataques corpo a corpo." },
  { id: "confuso",      name: "Confuso",      desc: "1d20 a cada rodada determina a ação: atacar aliado, atacar a esmo, fugir ou agir normalmente." },
  { id: "desprevenido", name: "Desprevenido", desc: "Perde a Defesa de Destreza e escudo contra o atacante que o pegou de surpresa." },
  { id: "enjoado",      name: "Enjoado",      desc: "Só pode realizar uma ação padrão ou de movimento por rodada, não ambas." },
  { id: "fatigado",     name: "Fatigado",     desc: "-2 em For e Des; não pode correr ou fazer manobras que exijam essa penalidade em dobro." },
  { id: "pasmo",        name: "Pasmo",        desc: "Perde a próxima ação; não pode realizar ações de reação." },
  { id: "surdo",        name: "Surdo",        desc: "Falha em testes que exijam audição; -4 em Iniciativa." },
];
const CONDITION_BY_ID: Record<string, Condition> = Object.fromEntries(TORMENTA_CONDITIONS.map((c) => [c.id, c]));

function rollD20() { return Math.floor(Math.random() * 20) + 1; }

const btnBase: React.CSSProperties = { height: 26, background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", color: "var(--text-muted)", transition: "all 0.15s" };
const inputStyle: React.CSSProperties = { padding: "9px 12px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", width: "100%", boxSizing: "border-box" };

function parseConditions(json: string): string[] { try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; } }

export function InitiativeTracker({ api }: { api: TormentaApi }) {
  const combatants = api.campaign.tormentaCombatants;
  const [name, setName] = useState("");
  const [initVal, setInitVal] = useState("");
  const [pv, setPv] = useState("");
  const [pm, setPm] = useState("");
  const [defense, setDefense] = useState("");
  const [isPlayer, setIsPlayer] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [condFor, setCondFor] = useState<string | null>(null);

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const initiative = initVal !== "" ? Number(initVal) : rollD20();
    const pvNum = pv !== "" ? Number(pv) : null;
    const pmNum = pm !== "" ? Number(pm) : null;
    await api.addChild("combatants", {
      name: trimmed, initiative, pv: pvNum, maxPv: pvNum, pm: pmNum, maxPm: pmNum,
      defense: defense !== "" ? Number(defense) : null, conditions: "[]", isPlayer, order: combatants.length,
    });
    setName(""); setInitVal(""); setPv(""); setPm(""); setDefense(""); setIsPlayer(false);
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

  function adjust(c: TormentaCombatant, field: "pv" | "pm", delta: number) {
    if (c[field] === null) return;
    const max = field === "pv" ? c.maxPv : c.maxPm;
    let next = (c[field] as number) + delta;
    next = Math.max(0, next);
    if (max !== null) next = Math.min(max, next);
    api.editChild("combatants", c.id, { [field]: next });
  }
  function toggleCondition(c: TormentaCombatant, id: string) {
    const cur = parseConditions(c.conditions);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    api.editChild("combatants", c.id, { conditions: JSON.stringify(next) });
  }

  function vital(c: TormentaCombatant, field: "pv" | "pm", label: string) {
    const cur = c[field];
    const max = field === "pv" ? c.maxPv : c.maxPm;
    if (cur === null || max === null) return null;
    const pct = max > 0 ? Math.max(0, cur / max) : 0;
    const color = field === "pv" ? (pct < 0.3 ? "#f87171" : pct < 0.6 ? "#fbbf24" : "#4ade80") : "#60a5fa";
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
      {/* Add combatant */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 420px", padding: "16px 20px", background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Adicionar Combatente</p>
          <div className="tm-initiative-add-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Ex: Goblin Arqueiro" style={inputStyle} />
            <input type="number" value={initVal} onChange={(e) => setInitVal(e.target.value)} placeholder="Inic" title="Iniciativa (vazio = d20)" style={inputStyle} />
            <input type="number" value={pv} onChange={(e) => setPv(e.target.value)} placeholder="PV" style={inputStyle} />
            <input type="number" value={pm} onChange={(e) => setPm(e.target.value)} placeholder="PM" title="Pontos de Mana" style={inputStyle} />
            <input type="number" value={defense} onChange={(e) => setDefense(e.target.value)} placeholder="Defesa" style={inputStyle} />
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
            return (
              <div key={c.id} style={{ background: isActive ? ACCENT_DIM : "var(--surface)", border: `1px solid ${isActive ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-xl)", transition: "all 0.2s", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", flexWrap: "wrap" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? ACCENT : "transparent", border: `2px solid ${isActive ? ACCENT : "var(--border)"}`, flexShrink: 0 }} />
                  <div style={{ minWidth: 36, height: 36, borderRadius: "var(--radius)", background: isActive ? ACCENT_DIM : c.isPlayer ? "rgba(99,179,237,0.1)" : "var(--surface-2)", border: `1px solid ${isActive ? ACCENT_BORD : c.isPlayer ? "rgba(99,179,237,0.25)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", fontWeight: 700, color: isActive ? ACCENT_LIGHT : c.isPlayer ? "#63b3ed" : "var(--text-muted)", flexShrink: 0 }}>{c.initiative}</div>
                  <div style={{ flex: 1, minWidth: 90 }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: isActive ? ACCENT_LIGHT : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>{c.isPlayer ? "Jogador" : "Monstro/NPC"}{c.defense !== null ? ` · Defesa ${c.defense}` : ""}</p>
                  </div>

                  {vital(c, "pv", "PV")}
                  {vital(c, "pm", "PM")}

                  <button onClick={() => setCondFor(condFor === c.id ? null : c.id)} title="Condições" style={{ ...btnBase, height: 30, padding: "0 10px", color: conds.length ? "#fbbf24" : "var(--text-muted)", borderColor: conds.length ? "#fbbf2444" : "var(--border)" }}>⚑ {conds.length || ""}</button>
                  <button onClick={() => api.removeChild("combatants", c.id)} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem", flexShrink: 0 }}>✕</button>
                </div>

                {conds.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "0 14px 10px 30px" }}>
                    {conds.map((id) => {
                      const cd = CONDITION_BY_ID[id]; if (!cd) return null;
                      return <span key={id} title={cd.desc} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", background: "#fbbf241a", border: "1px solid #fbbf2455", borderRadius: "var(--radius-xs)", fontSize: "0.7rem", color: "#fbbf24", fontWeight: 700 }}>{cd.name}<button onClick={() => toggleCondition(c, id)} style={{ background: "transparent", border: "none", color: "#fbbf24", cursor: "pointer", fontSize: "0.75rem", lineHeight: 1, padding: 0 }}>×</button></span>;
                    })}
                  </div>
                )}

                {condFor === c.id && (
                  <div style={{ padding: "10px 14px 14px 30px", borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Aplicar / remover condição</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {TORMENTA_CONDITIONS.map((cd) => {
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
