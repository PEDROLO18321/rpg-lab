"use client";

import { useState } from "react";
import type { CyberpunkApi } from "@/lib/cyberpunk/useCyberpunkCampaign";
import type { CyberpunkNpc, Threat } from "@/lib/cyberpunk/cyberpunkCampaignClient";
import { THREAT_LABEL } from "@/lib/cyberpunk/bestiary";
import { ROLES, STATS, type StatKey } from "@/lib/cyberpunk/data";
import { Field } from "@/components/ui/Field";
import { CP, PrimaryButton, SectionTitle, areaStyle, dangerBtn, inputStyle, labelStyle, pillBtn } from "../../../ui";
import "../../../cyberpunk-responsive.css";

const THREATS = Object.keys(THREAT_LABEL) as Threat[];

interface Draft {
  name: string; role: string; threat: Threat; trait: string; appearance: string; notes: string;
  hp: number; spHead: number; spBody: number;
  stats: Record<StatKey, number>;
  weaponsText: string;
}

const blank = (): Draft => ({
  name: "", role: "", threat: "mook", trait: "", appearance: "", notes: "", hp: 20, spHead: 7, spBody: 7,
  stats: { int: 5, ref: 5, dex: 5, tech: 4, cool: 5, will: 5, luck: 0, move: 5, body: 5, emp: 4 },
  weaponsText: "",
});

/** "Pistola|3d6" por linha → lista de armas do NPC. */
function parseWeapons(t: string) {
  return t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [name, damage] = l.split("|").map((x) => x.trim());
    return { name, damage: damage ?? "" };
  });
}

export function NpcCreator({ api }: { api: CyberpunkApi }) {
  const npcs = api.campaign.npcs;
  const [d, setD] = useState<Draft>(blank());
  const [open, setOpen] = useState<string | null>(null);

  async function create() {
    if (!d.name.trim()) return;
    await api.addChild("npcs", {
      name: d.name.trim(), role: d.role, threat: d.threat, trait: d.trait, appearance: d.appearance, notes: d.notes,
      hp: d.hp, hpMax: d.hp, spHead: d.spHead, spBody: d.spBody, ...d.stats, weapons: parseWeapons(d.weaponsText),
    });
    setD(blank());
  }

  const num = (v: string) => parseInt(v) || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle eyebrow="NPCs" title="Criador de NPCs" desc="Capangas e chefes têm HP fixo no livro; ajuste à vontade. Para um NPC pronto, use o Bestiário." />

      <div style={{ background: CP.panel, border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius-xl)", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="cp-npc-form-row" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
          <div><Field label="Nome" style={labelStyle}><input value={d.name} maxLength={60} onChange={(e) => setD({ ...d, name: e.target.value })} style={inputStyle} /></Field></div>
          <div>
            <Field label="Papel" style={labelStyle}>
              <select value={d.role} onChange={(e) => setD({ ...d, role: e.target.value })} style={inputStyle}>
                <option value="">—</option>
                {ROLES.map((r) => <option key={r.key} value={r.name}>{r.name}</option>)}
              </select>
            </Field>
          </div>
          <div>
            <Field label="Ameaça" style={labelStyle}>
              <select value={d.threat} onChange={(e) => setD({ ...d, threat: e.target.value as Threat })} style={inputStyle}>
                {THREATS.map((t) => <option key={t} value={t}>{THREAT_LABEL[t]}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="cp-npc-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
          {STATS.map((s) => (
            <div key={s.key}>
              <Field label={s.short} style={{ ...labelStyle, textAlign: "center" }}>
                <input type="number" min={0} max={10} value={d.stats[s.key]} onChange={(e) => setD({ ...d, stats: { ...d.stats, [s.key]: num(e.target.value) } })} style={{ ...inputStyle, padding: "9px 4px", textAlign: "center" }} />
              </Field>
            </div>
          ))}
        </div>

        <div className="cp-npc-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <div><Field label="HP" style={labelStyle}><input type="number" min={1} value={d.hp} onChange={(e) => setD({ ...d, hp: num(e.target.value) })} style={inputStyle} /></Field></div>
          <div><Field label="PA cabeça" style={labelStyle}><input type="number" min={0} value={d.spHead} onChange={(e) => setD({ ...d, spHead: num(e.target.value) })} style={inputStyle} /></Field></div>
          <div><Field label="PA corpo" style={labelStyle}><input type="number" min={0} value={d.spBody} onChange={(e) => setD({ ...d, spBody: num(e.target.value) })} style={inputStyle} /></Field></div>
        </div>

        <div className="cp-npc-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><Field label="Traço de personalidade" style={labelStyle}><input value={d.trait} onChange={(e) => setD({ ...d, trait: e.target.value })} style={inputStyle} /></Field></div>
          <div><Field label="Aparência" style={labelStyle}><input value={d.appearance} onChange={(e) => setD({ ...d, appearance: e.target.value })} style={inputStyle} /></Field></div>
        </div>
        <Field label="Armas (uma por linha: nome|dano)" style={labelStyle}>
          <textarea value={d.weaponsText} placeholder={"Pistola Pesada|3d6\nFaca|1d6"} onChange={(e) => setD({ ...d, weaponsText: e.target.value })} style={{ ...areaStyle, minHeight: 60 }} />
        </Field>
        <Field label="Notas" style={labelStyle}>
          <textarea value={d.notes} onChange={(e) => setD({ ...d, notes: e.target.value })} style={{ ...areaStyle, minHeight: 60 }} />
        </Field>
        <div><PrimaryButton onClick={create} disabled={!d.name.trim()}>+ Criar NPC</PrimaryButton></div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {npcs.length === 0 && <p style={{ fontSize: "0.86rem", color: CP.textSubtle }}>Nenhum NPC ainda.</p>}
        {npcs.map((n) => <NpcCard key={n.id} npc={n} api={api} open={open === n.id} onToggle={() => setOpen(open === n.id ? null : n.id)} />)}
      </div>
    </div>
  );
}

function NpcCard({ npc, api, open, onToggle }: { npc: CyberpunkNpc; api: CyberpunkApi; open: boolean; onToggle: () => void }) {
  const [notes, setNotes] = useState(npc.notes);
  const weapons = (npc.weapons as { name?: string; damage?: string }[]).filter((w) => w && w.name);
  return (
    <div style={{ background: CP.panel, border: `1px solid ${open ? CP.accentBord : CP.panelBorder}`, borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
      <button type="button" onClick={onToggle} aria-expanded={open} style={{ width: "100%", minHeight: 48, display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", color: "var(--text)", fontFamily: "inherit" }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <b>{npc.name}</b>
          <span style={{ display: "block", fontSize: "0.72rem", color: CP.textMuted }}>{[npc.role, THREAT_LABEL[npc.threat]].filter(Boolean).join(" · ")} · HP {npc.hp ?? "?"} · PA {npc.spHead}/{npc.spBody}</span>
        </span>
        <span aria-hidden style={{ transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div className="cp-npc-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
            {STATS.map((s) => (
              <div key={s.key} style={{ textAlign: "center", padding: "6px 2px", background: CP.accentDim, borderRadius: "var(--radius)" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 800, color: CP.accentLight }}>{s.short}</div>
                <b>{npc[s.key] ?? "—"}</b>
              </div>
            ))}
          </div>
          {npc.trait && <p style={{ fontSize: "0.8rem" }}><b>Traço:</b> {npc.trait}</p>}
          {npc.appearance && <p style={{ fontSize: "0.8rem" }}><b>Aparência:</b> {npc.appearance}</p>}
          {weapons.length > 0 && <p style={{ fontSize: "0.8rem" }}><b>Armas:</b> {weapons.map((w) => `${w.name} ${w.damage ?? ""}`.trim()).join(" · ")}</p>}
          <Field label="Notas" style={labelStyle}>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => { if (notes !== npc.notes) api.editChild("npcs", npc.id, { notes }); }} style={{ ...areaStyle, minHeight: 60 }} />
          </Field>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={pillBtn} onClick={() => api.addChild("combatants", { name: npc.name, initiative: 0, hp: npc.hp ?? npc.hpMax ?? 0, maxHp: npc.hpMax ?? npc.hp ?? 0, spHead: npc.spHead, spBody: npc.spBody, isPlayer: false, conditions: [], order: api.campaign.combatants.length })}>Levar à iniciativa</button>
            <button type="button" style={dangerBtn} onClick={() => api.removeChild("npcs", npc.id)}>Excluir</button>
          </div>
        </div>
      )}
    </div>
  );
}
