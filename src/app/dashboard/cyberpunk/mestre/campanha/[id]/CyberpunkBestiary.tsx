"use client";

import { useState } from "react";
import type { CyberpunkApi } from "@/lib/cyberpunk/useCyberpunkCampaign";
import { BESTIARY, THREAT_LABEL, bestiaryToNpcDraft, type ThreatTier } from "@/lib/cyberpunk/bestiary";
import { STATS } from "@/lib/cyberpunk/data";
import { skillLabel } from "../../../[id]/sheetModel";
import { CP, SectionTitle, inputStyle, pillBtn } from "../../../ui";
import "../../../cyberpunk-responsive.css";

export function CyberpunkBestiary({ api }: { api: CyberpunkApi }) {
  const [tier, setTier] = useState<ThreatTier | "todos">("todos");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const list = BESTIARY.filter((b) => (tier === "todos" || b.tier === tier) && b.name.toLowerCase().includes(q.trim().toLowerCase()));

  async function addNpc(key: string) {
    const e = BESTIARY.find((b) => b.key === key);
    if (!e) return;
    await api.addChild("npcs", { ...bestiaryToNpcDraft(e), notes: [...e.gear, ...e.cyberware, ...(e.programs ?? [])].join(", ") });
    setDone(key);
    setTimeout(() => setDone(null), 2000);
  }

  async function addCombat(key: string) {
    const e = BESTIARY.find((b) => b.key === key);
    if (!e) return;
    await api.addChild("combatants", { name: e.name, initiative: e.stats.ref + Math.floor(Math.random() * 10) + 1, hp: e.hp, maxHp: e.hp, spHead: e.spHead, spBody: e.spBody, isPlayer: false, conditions: [], order: api.campaign.combatants.length });
    setDone(key);
    setTimeout(() => setDone(null), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionTitle eyebrow="Bestiário" title="Capangas e chefes" desc="Fichas rápidas: as perícias já mostram atributo + nível, é só somar 1d10." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input aria-label="Buscar" value={q} placeholder="Buscar…" onChange={(e) => setQ(e.target.value)} style={{ ...inputStyle, flex: "1 1 180px", width: "auto" }} />
        {(["todos", "mook", "lieutenant", "miniboss", "boss"] as const).map((t) => (
          <button key={t} type="button" aria-pressed={tier === t} onClick={() => setTier(t)} style={{ ...pillBtn, minHeight: 36, color: tier === t ? CP.accentLight : "var(--text-muted)", borderColor: tier === t ? CP.accentBord : "var(--border)", background: tier === t ? CP.accentDim : "var(--surface)" }}>
            {t === "todos" ? "Todos" : THREAT_LABEL[t]}
          </button>
        ))}
      </div>

      {list.map((b) => {
        const isOpen = open === b.key;
        return (
          <div key={b.key} style={{ background: CP.panel, border: `1px solid ${isOpen ? CP.accentBord : CP.panelBorder}`, borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
            <button type="button" onClick={() => setOpen(isOpen ? null : b.key)} aria-expanded={isOpen} style={{ width: "100%", minHeight: 48, display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", color: "var(--text)", fontFamily: "inherit" }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b>{b.name}</b>
                <span style={{ display: "block", fontSize: "0.72rem", color: CP.textMuted }}>{THREAT_LABEL[b.tier]} · HP {b.hp} · PA {b.spHead}/{b.spBody}</span>
              </span>
              <span aria-hidden style={{ transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>
            </button>
            {isOpen && (
              <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="cp-bestiary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 6 }}>
                  {STATS.filter((s) => s.key !== "luck").map((s) => (
                    <div key={s.key} style={{ textAlign: "center", padding: "6px 2px", background: CP.accentDim, borderRadius: "var(--radius)" }}>
                      <div style={{ fontSize: "0.6rem", fontWeight: 800, color: CP.accentLight }}>{s.short}</div>
                      <b>{b.stats[s.key as Exclude<typeof s.key, "luck">]}</b>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.8rem" }}>Gravemente ferido abaixo de <b>{b.seriousThreshold}</b> · Salvaguarda <b>{b.deathSave}</b> · {b.armorName}{b.armorPenalty ? ` (${b.armorPenalty} REF/DES/MOV)` : ""}</p>
                <p style={{ fontSize: "0.8rem" }}><b>Armas:</b> {b.weapons.map((w) => `${w.name} ${w.damage}${w.poor ? " (ruim)" : ""}`).join(" · ")}</p>
                {b.roleAbility && <p style={{ fontSize: "0.8rem" }}><b>{b.roleAbility.name}:</b> Grau {b.roleAbility.rank}</p>}
                <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.7 }}><b>Perícias:</b> {Object.entries(b.skillBases).map(([k, v]) => `${skillLabel(k)} ${v}`).join(" · ")}</p>
                {b.gear.length > 0 && <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}><b>Equipamento:</b> {b.gear.join(", ")}</p>}
                {b.cyberware.length > 0 && <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}><b>Ciberware:</b> {b.cyberware.join(", ")}</p>}
                {b.programs && <p style={{ fontSize: "0.76rem", color: CP.neon }}><b>Programas:</b> {b.programs.join(", ")}</p>}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <button type="button" style={pillBtn} onClick={() => addNpc(b.key)}>+ Aos NPCs</button>
                  <button type="button" style={pillBtn} onClick={() => addCombat(b.key)}>+ À iniciativa</button>
                  {done === b.key && <span style={{ fontSize: "0.76rem", color: CP.success }}>✓ Adicionado</span>}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {list.length === 0 && <p style={{ color: CP.textSubtle, fontSize: "0.86rem" }}>Nada encontrado.</p>}
    </div>
  );
}
