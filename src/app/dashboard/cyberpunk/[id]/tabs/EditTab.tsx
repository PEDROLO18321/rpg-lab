"use client";

import { useState, type ReactNode } from "react";
import {
  ROLES, SKILLS, SKILL_CATEGORIES, STATS, getSkillDef, type SkillCategory,
} from "@/lib/cyberpunk/data";
import { RANGES } from "@/lib/cyberpunk/sheetInput";
import { SheetShell } from "@/components/sheet/SheetShell";
import { SheetSection } from "@/components/sheet/SheetSection";
import { Stepper } from "@/components/ui/Stepper";
import { Field } from "@/components/ui/Field";
import { CP, PrimaryButton, inputStyle, labelStyle } from "../../ui";
import { skillLabel, type ArmorSlot, type TabProps } from "../sheetModel";

// Cada passo do Stepper chama `patch` com debounce: a tela muda a cada toque e
// o servidor recebe um PATCH só quando a mão para.
const DEB = { debounce: true } as const;

/** Rótulo em cima, controle embaixo: serve do campo de texto ao Stepper. */
function EditField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", minWidth: 0 }}>
      <span style={{ ...labelStyle, marginBottom: 0 }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: "0.66rem", color: CP.textSubtle, lineHeight: 1.4 }}>{hint}</span>}
    </div>
  );
}

const grid = (min: number) => ({
  display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`, gap: 10,
}) as const;

export function EditTab({ sh, patch }: TabProps) {
  // Nome em cópia local: gravar a cada tecla mandaria nome parcial e, apagado,
  // um nome vazio que o servidor recusa.
  const [name, setName] = useState(sh.name);
  const [query, setQuery] = useState("");

  function commitName() {
    const n = name.trim();
    if (!n) { setName(sh.name); return; }
    if (n !== sh.name) patch({ name: n });
  }

  function setSkill(key: string, level: number) {
    const next = { ...sh.skills };
    if (level <= 0) delete next[key]; else next[key] = level;
    patch({ skills: next }, DEB);
  }

  function setArmor(slot: "head" | "body", p: Partial<ArmorSlot>) {
    const cur = sh.armor[slot];
    if (!cur) return;
    const merged = { ...cur, ...p };
    // O atual nunca passa do máximo, mesmo quando o máximo é que baixou.
    merged.sp = Math.min(merged.sp, merged.spMax);
    patch({ armor: { ...sh.armor, [slot]: merged } }, DEB);
  }

  function addArmor(slot: "head" | "body") {
    patch({ armor: { ...sh.armor, [slot]: { name: "Armadura", sp: 0, spMax: 0, penalty: 0 } } });
  }

  const q = query.trim().toLowerCase();
  const groups = (Object.keys(SKILL_CATEGORIES) as SkillCategory[]).map((cat) => {
    const keys = [
      ...SKILLS.filter((s) => s.category === cat && !s.specialised).map((s) => s.key),
      ...Object.keys(sh.skills).filter((k) => k.includes(":") && getSkillDef(k)?.category === cat),
    ].filter((k) => !q || skillLabel(k).toLowerCase().includes(q));
    return { cat, keys };
  }).filter((g) => g.keys.length > 0);

  const left = (
    <>
      <SheetSection title="Identidade" accent>
        <div style={grid(220)}>
          <div style={{ minWidth: 0 }}>
            <Field label="Nome" style={labelStyle}>
              <input
                value={name} maxLength={60} style={inputStyle}
                onChange={(e) => setName(e.target.value)} onBlur={commitName}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              />
            </Field>
          </div>
          <div style={{ minWidth: 0 }}>
            <Field label="Papel" style={labelStyle}>
              <select value={sh.role} onChange={(e) => patch({ role: e.target.value })} style={inputStyle}>
                {ROLES.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
              </select>
            </Field>
          </div>
          <EditField label="Grau do papel">
            <Stepper label="Grau do papel" value={sh.roleRank} min={RANGES.roleRank[0]} max={RANGES.roleRank[1]} onChange={(v) => patch({ roleRank: v }, DEB)} />
          </EditField>
        </div>
      </SheetSection>

      <SheetSection title="Atributos">
        <p style={{ fontSize: "0.72rem", color: CP.textMuted, lineHeight: 1.5 }}>
          Mudar um atributo não recalcula PV nem Humanidade: ajuste os máximos ao lado se for o caso.
        </p>
        <div style={grid(150)}>
          {STATS.map((s) => (
            <EditField key={s.key} label={`${s.short} · ${s.name}`}>
              <Stepper label={s.name} value={sh[s.key]} min={RANGES.stat[0]} max={RANGES.stat[1]} onChange={(v) => patch({ [s.key]: v }, DEB)} />
            </EditField>
          ))}
        </div>
      </SheetSection>

      <SheetSection title="Perícias">
        <input
          type="search" aria-label="Buscar perícia" placeholder="Buscar perícia…" value={query}
          onChange={(e) => setQuery(e.target.value)} style={inputStyle}
        />
        {groups.map((g) => (
          <div key={g.cat} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: "0.66rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.08em" }}>{SKILL_CATEGORIES[g.cat]}</p>
            <div style={grid(250)}>
              {g.keys.map((key) => (
                <EditField key={key} label={skillLabel(key)}>
                  <Stepper
                    label={skillLabel(key)} value={sh.skills[key] ?? 0}
                    min={RANGES.skillLevel[0]} max={RANGES.skillLevel[1]} onChange={(v) => setSkill(key, v)}
                  />
                </EditField>
              ))}
            </div>
          </div>
        ))}
      </SheetSection>
    </>
  );

  const right = (
    <>
      <SheetSection title="Vitais" accent>
        <EditField label="PV atuais">
          <Stepper label="PV atuais" value={sh.hpCurrent} min={RANGES.hpCurrent[0]} max={Math.max(sh.hpMax, 0)} onChange={(v) => patch({ hpCurrent: v }, DEB)} />
        </EditField>
        <EditField label="PV máximos">
          <Stepper label="PV máximos" value={sh.hpMax} min={1} max={RANGES.hpMax[1]} onChange={(v) => patch({ hpMax: v, hpCurrent: Math.min(sh.hpCurrent, v) }, DEB)} />
        </EditField>
        <EditField label="Humanidade atual" hint="Abaixo de zero é ciberpsicose.">
          <Stepper label="Humanidade atual" value={sh.humanity} min={RANGES.humanity[0]} max={Math.max(sh.humanityMax, 0)} steps={[1, 5, 10]} onChange={(v) => patch({ humanity: v }, DEB)} />
        </EditField>
        <EditField label="Humanidade máxima">
          <Stepper label="Humanidade máxima" value={sh.humanityMax} min={RANGES.humanityMax[0]} max={RANGES.humanityMax[1]} steps={[1, 5, 10]} onChange={(v) => patch({ humanityMax: v, humanity: Math.min(sh.humanity, v) }, DEB)} />
        </EditField>
        <EditField label="Sorte atual">
          <Stepper label="Sorte atual" value={sh.luckCurrent} min={RANGES.luckCurrent[0]} max={RANGES.luckCurrent[1]} onChange={(v) => patch({ luckCurrent: v }, DEB)} />
        </EditField>
        <EditField label="Penalidade de salvaguarda" hint="Sobe 1 a cada vez que um ferimento mortal leva mais dano.">
          <Stepper label="Penalidade de salvaguarda" value={sh.deathSavePenalty} min={RANGES.deathSavePenalty[0]} max={RANGES.deathSavePenalty[1]} onChange={(v) => patch({ deathSavePenalty: v }, DEB)} />
        </EditField>
      </SheetSection>

      <SheetSection title="Recursos">
        <EditField label="Eurodólares (eb)">
          <Stepper label="Eurodólares" value={sh.eurobucks} min={RANGES.eurobucks[0]} max={RANGES.eurobucks[1]} steps={[10, 100, 1000]} onChange={(v) => patch({ eurobucks: v }, DEB)} />
        </EditField>
        <EditField label="Pontos de melhoria (IP)">
          <Stepper label="Pontos de melhoria" value={sh.improvementPoints} min={RANGES.improvementPoints[0]} max={RANGES.improvementPoints[1]} steps={[1, 10, 100]} onChange={(v) => patch({ improvementPoints: v }, DEB)} />
        </EditField>
        <EditField label="Reputação">
          <Stepper label="Reputação" value={sh.reputation} min={RANGES.reputation[0]} max={RANGES.reputation[1]} onChange={(v) => patch({ reputation: v }, DEB)} />
        </EditField>
      </SheetSection>

      <SheetSection title="Armadura (PA)">
        {(["head", "body"] as const).map((slot) => {
          const a = sh.armor[slot];
          const word = slot === "head" ? "cabeça" : "corpo";
          if (!a) {
            return (
              <EditField key={slot} label={`PA ${word}`}>
                <p style={{ fontSize: "0.76rem", color: CP.textSubtle }}>Sem armadura neste local.</p>
                <div><PrimaryButton onClick={() => addArmor(slot)} style={{ padding: "6px 16px", minHeight: 32 }}>Adicionar</PrimaryButton></div>
              </EditField>
            );
          }
          return (
            <div key={slot} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <EditField label={`PA atual · ${word} (${a.name})`}>
                <Stepper label={`PA atual ${word}`} value={a.sp} min={0} max={a.spMax} steps={[1]} onChange={(v) => setArmor(slot, { sp: v })} />
              </EditField>
              <EditField label={`PA máxima · ${word}`}>
                <Stepper label={`PA máxima ${word}`} value={a.spMax} min={0} max={20} steps={[1]} onChange={(v) => setArmor(slot, { spMax: v })} />
              </EditField>
            </div>
          );
        })}
      </SheetSection>
    </>
  );

  return <SheetShell system="cyberpunk" left={left} right={right} />;
}
