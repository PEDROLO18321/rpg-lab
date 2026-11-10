"use client";

import { useState } from "react";
import type { CyberpunkApi } from "@/lib/cyberpunk/useCyberpunkCampaign";
import type { CyberpunkCombatant, CyberpunkNpc } from "@/lib/cyberpunk/cyberpunkCampaignClient";
import { rollInitiative, seriousThreshold, woundState } from "@/lib/cyberpunk/rules";
import { Field } from "@/components/ui/Field";
import { CP, PrimaryButton, SectionTitle, dangerBtn, inputStyle, labelStyle, pillBtn } from "../../../ui";
import "../../../cyberpunk-responsive.css";

const WOUND_COLOR = { ok: CP.accentLight, leve: CP.accentLight, grave: CP.warn, mortal: CP.danger } as const;
const WOUND_LABEL = { ok: "Ileso", leve: "Leve", grave: "Grave", mortal: "Mortal" } as const;

export function InitiativeTracker({ api }: { api: CyberpunkApi }) {
  const { combatants, npcs } = api.campaign;
  const [name, setName] = useState("");
  const [ref, setRef] = useState(6);
  const [hp, setHp] = useState(35);
  const [spHead, setSpHead] = useState(7);
  const [spBody, setSpBody] = useState(7);
  const [isPlayer, setIsPlayer] = useState(false);
  const [npcPick, setNpcPick] = useState("");
  const [turn, setTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [cond, setCond] = useState<Record<string, string>>({});
  const [dmg, setDmg] = useState<Record<string, string>>({});
  // O banco guarda só a iniciativa final; o REF de cada um fica na tela para o botão de rolar de novo.
  const [refs, setRefs] = useState<Record<string, number>>({});

  const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);
  const current = sorted.length ? sorted[turn % sorted.length] : null;

  async function add() {
    if (!name.trim()) return;
    const c = await api.addChild<CyberpunkCombatant>("combatants", {
      name: name.trim(), initiative: rollInitiative(ref), hp, maxHp: hp, spHead, spBody, isPlayer, conditions: [], order: combatants.length,
    });
    setRefs((r) => ({ ...r, [c.id]: ref }));
    setName("");
  }

  async function addNpc() {
    const n: CyberpunkNpc | undefined = npcs.find((x) => x.id === npcPick);
    if (!n) return;
    const c = await api.addChild<CyberpunkCombatant>("combatants", {
      name: n.name, initiative: rollInitiative(n.ref ?? 0), hp: n.hp ?? n.hpMax ?? 0, maxHp: n.hpMax ?? n.hp ?? 0,
      spHead: n.spHead, spBody: n.spBody, isPlayer: false, conditions: [], order: combatants.length,
    });
    setRefs((r) => ({ ...r, [c.id]: n.ref ?? 0 }));
    setNpcPick("");
  }

  function reroll(c: CyberpunkCombatant) {
    api.editChild("combatants", c.id, { initiative: rollInitiative(refs[c.id] ?? 0) });
  }

  function hit(c: CyberpunkCombatant, sign: 1 | -1) {
    const n = Math.max(0, parseInt(dmg[c.id] ?? "") || 0) * sign;
    if (!n) return;
    const max = c.maxHp ?? Number.MAX_SAFE_INTEGER;
    api.editChild("combatants", c.id, { hp: Math.max(0, Math.min(max, (c.hp ?? 0) + n)) });
    setDmg((d) => ({ ...d, [c.id]: "" }));
  }

  function addCondition(c: CyberpunkCombatant) {
    const t = (cond[c.id] ?? "").trim();
    if (!t || c.conditions.includes(t)) return;
    api.editChild("combatants", c.id, { conditions: [...c.conditions, t] });
    setCond((m) => ({ ...m, [c.id]: "" }));
  }

  function nextTurn() {
    if (!sorted.length) return;
    const next = (turn + 1) % sorted.length;
    if (next === 0) setRound((r) => r + 1);
    setTurn(next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle eyebrow="Combate" title="Iniciativa" desc="Iniciativa = REF + 1d10. Quem tem o maior total age primeiro; o HP cai com o dano que passa da armadura." />

      <div style={{ background: CP.panel, border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius-xl)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="cp-init-add-grid" style={{ display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)", gap: 10 }}>
          <div><Field label="Nome" style={labelStyle}><input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} style={inputStyle} /></Field></div>
          <div><Field label="REF" style={labelStyle}><input type="number" value={ref} onChange={(e) => setRef(parseInt(e.target.value) || 0)} style={inputStyle} /></Field></div>
          <div><Field label="HP" style={labelStyle}><input type="number" min={1} value={hp} onChange={(e) => setHp(parseInt(e.target.value) || 1)} style={inputStyle} /></Field></div>
          <div><Field label="PA cabeça" style={labelStyle}><input type="number" min={0} value={spHead} onChange={(e) => setSpHead(parseInt(e.target.value) || 0)} style={inputStyle} /></Field></div>
          <div><Field label="PA corpo" style={labelStyle}><input type="number" min={0} value={spBody} onChange={(e) => setSpBody(parseInt(e.target.value) || 0)} style={inputStyle} /></Field></div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: "0.8rem", minHeight: 28 }}><input type="checkbox" checked={isPlayer} onChange={(e) => setIsPlayer(e.target.checked)} /> É jogador</label>
          <PrimaryButton onClick={add} disabled={!name.trim()}>+ Adicionar</PrimaryButton>
          {npcs.length > 0 && (
            <>
              <select aria-label="Adicionar NPC da campanha" value={npcPick} onChange={(e) => setNpcPick(e.target.value)} style={{ ...inputStyle, width: "auto", flex: "1 1 180px" }}>
                <option value="">NPC da campanha…</option>
                {npcs.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
              <button type="button" onClick={addNpc} disabled={!npcPick} style={{ ...pillBtn, minHeight: 40, opacity: npcPick ? 1 : 0.5 }}>+ NPC</button>
            </>
          )}
        </div>
      </div>

      {sorted.length > 0 && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.84rem" }}>Rodada <b>{round}</b> · vez de <b style={{ color: CP.accentLight }}>{current?.name}</b></span>
          <PrimaryButton onClick={nextTurn}>Próximo turno →</PrimaryButton>
          <button type="button" onClick={() => { setTurn(0); setRound(1); }} style={{ ...pillBtn, minHeight: 36 }}>Reiniciar</button>
        </div>
      )}

      {sorted.length === 0 && <p style={{ fontSize: "0.86rem", color: CP.textSubtle }}>Ninguém na cena ainda.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((c) => {
          const w = woundState(c.hp ?? 0, c.maxHp ?? c.hp ?? 1);
          const active = current?.id === c.id;
          return (
            <div key={c.id} style={{ background: CP.panel, border: `1px solid ${active ? CP.accent : CP.panelBorder}`, borderRadius: "var(--radius-xl)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, boxShadow: active ? `0 0 18px ${CP.glow}` : "none" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ minWidth: 38, textAlign: "center", fontFamily: "var(--font-cinzel), serif", fontWeight: 800, fontSize: "1.2rem", color: CP.accentLight }}>{c.initiative}</span>
                <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                  <p style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name} {c.isPlayer && <span style={{ fontSize: "0.62rem", color: CP.neon }}>JOGADOR</span>}</p>
                  <p style={{ fontSize: "0.7rem", color: WOUND_COLOR[w.state], fontWeight: 700 }}>
                    {WOUND_LABEL[w.state]} · grave abaixo de {seriousThreshold(c.maxHp ?? c.hp ?? 0)} · PA {c.spHead}/{c.spBody}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <b style={{ fontSize: "1.05rem", color: WOUND_COLOR[w.state] }}>{c.hp ?? 0}<span style={{ color: CP.textSubtle, fontWeight: 400, fontSize: "0.8rem" }}>/{c.maxHp ?? "?"}</span></b>
                </div>
                <input type="number" min={0} aria-label={`Valor para ${c.name}`} value={dmg[c.id] ?? ""} placeholder="valor" onChange={(e) => setDmg((d) => ({ ...d, [c.id]: e.target.value }))} style={{ ...inputStyle, width: 70, minHeight: 32, padding: "4px 8px" }} />
                <button type="button" onClick={() => hit(c, -1)} style={{ ...dangerBtn, minHeight: 32 }}>Dano</button>
                <button type="button" onClick={() => hit(c, 1)} style={{ ...pillBtn, minHeight: 32, color: CP.success }}>Cura</button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ display: "flex", gap: 4, alignItems: "center", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  REF
                  <input type="number" value={refs[c.id] ?? 0} onChange={(e) => setRefs((r) => ({ ...r, [c.id]: parseInt(e.target.value) || 0 }))} style={{ ...inputStyle, width: 56, minHeight: 28, padding: "2px 6px" }} />
                </label>
                <button type="button" onClick={() => reroll(c)} style={pillBtn}>🎲 Rolar iniciativa</button>
                {c.conditions.map((t) => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 4px 2px 8px", background: "rgba(239,107,107,0.1)", border: "1px solid rgba(239,107,107,0.3)", borderRadius: "var(--radius-full)", fontSize: "0.72rem", color: "#f4a3a3" }}>
                    {t}
                    <button type="button" onClick={() => api.editChild("combatants", c.id, { conditions: c.conditions.filter((x) => x !== t) })} aria-label={`Remover ${t}`} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", minWidth: 24, minHeight: 24 }}>×</button>
                  </span>
                ))}
                <input aria-label={`Condição de ${c.name}`} value={cond[c.id] ?? ""} placeholder="+ condição" onChange={(e) => setCond((m) => ({ ...m, [c.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addCondition(c); }} style={{ ...inputStyle, width: 120, minHeight: 28, padding: "2px 8px" }} />
                <button type="button" onClick={() => api.removeChild("combatants", c.id)} aria-label={`Remover ${c.name}`} style={{ ...dangerBtn, marginLeft: "auto" }}>Remover</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
