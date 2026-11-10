"use client";

import { useState } from "react";
import {
  COMPLETE_SKILL_POINTS, ROLE_SKILL_CHOICES, ROLE_SKILL_PACKAGES, SKILLS, SKILLS_MAP, SKILL_CATEGORIES,
  SKILL_MAX_AT_CREATION, getSkillDef, skillPointCost, type SkillCategory,
} from "@/lib/cyberpunk/data";
import { validateCompletePackage } from "@/lib/cyberpunk/creation";
import { Field } from "@/components/ui/Field";
import { CP, SectionTitle, GhostButton, PrimaryButton, inputStyle, labelStyle, pillBtn } from "../../ui";
import { defaultCompleteSkills, type WizardData } from "../wizardModel";

interface Props {
  data: WizardData;
  onChange: (p: Partial<WizardData>) => void;
}

/** Rótulo legível de uma chave com especialidade: "language:streetslang" → "Idioma: streetslang". */
function skillLabel(key: string): string {
  const def = getSkillDef(key);
  const base = def ? def.name.replace(/ \(especificar\)/, "") : key;
  const i = key.indexOf(":");
  return i < 0 ? base : `${base}: ${key.slice(i + 1)}`;
}

export function skillsStepValid(data: WizardData): boolean {
  if (data.method !== "complete") {
    return ROLE_SKILL_CHOICES[data.role].every((c) => !!data.choices[c.skill]?.trim());
  }
  if (!data.stats) return false;
  return validateCompletePackage({ stats: data.stats, skills: data.skills }).complete;
}

const SPECIALISED = SKILLS.filter((s) => s.specialised);

export function StepSkills({ data, onChange }: Props) {
  if (data.method !== "complete") return <PackageView data={data} onChange={onChange} />;
  return <CustomView data={data} onChange={onChange} />;
}

function PackageView({ data, onChange }: Props) {
  const pkg = ROLE_SKILL_PACKAGES[data.role];
  const choices = ROLE_SKILL_CHOICES[data.role];
  const entries = Object.entries(pkg).sort((a, b) => skillLabel(a[0]).localeCompare(skillLabel(b[0]), "pt"));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle
        eyebrow="Passo 3" title="Perícias"
        desc="Nos métodos Streetrat e Edgerunner o papel já vem com um pacote fixo de 20 perícias (86 pontos). O idioma da sua origem cultural, que você define no passo do Caminho de Vida, entra de graça no nível 4."
      />

      {choices.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 12 }}>
          {choices.map((c) => (
            <Field key={c.skill} label={`${SKILLS_MAP[c.skill].name.replace(/ \(especificar\)/, "")} (nível ${c.level})`} style={labelStyle}>
              <input
                value={data.choices[c.skill] ?? ""} maxLength={30} placeholder={c.hint}
                onChange={(e) => onChange({ choices: { ...data.choices, [c.skill]: e.target.value } })}
                style={inputStyle}
              />
            </Field>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))", gap: 6 }}>
        {entries.map(([key, lvl]) => {
          const def = getSkillDef(key)!;
          const base = data.stats ? data.stats[def.stat] + lvl : null;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)" }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{skillLabel(key)}</span>
              <b style={{ fontSize: "0.8rem", color: CP.accentLight }}>{lvl}</b>
              {base !== null && <span style={{ fontSize: "0.68rem", color: CP.textSubtle }}>({base})</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomView({ data, onChange }: Props) {
  const [spBase, setSpBase] = useState(SPECIALISED[0].key);
  const [spName, setSpName] = useState("");
  const skills = data.skills;
  const check = data.stats ? validateCompletePackage({ stats: data.stats, skills }) : null;
  const presets = defaultCompleteSkills();

  function setLevel(key: string, level: number) {
    if (level < 0 || level > SKILL_MAX_AT_CREATION) return;
    const min = presets[key] ?? 0;
    if (level < min) return;
    const next = { ...skills };
    if (level === 0) delete next[key]; else next[key] = level;
    onChange({ skills: next });
  }

  function addSpecialised() {
    const label = spName.trim().toLowerCase().replace(/[:\s]+/g, "");
    if (!label) return;
    const key = `${spBase}:${label}`;
    if (skills[key] !== undefined) return;
    onChange({ skills: { ...skills, [key]: 2 } });
    setSpName("");
  }

  const groups = (Object.keys(SKILL_CATEGORIES) as SkillCategory[]).map((cat) => ({
    cat,
    keys: [
      ...SKILLS.filter((s) => s.category === cat && !s.specialised).map((s) => s.key),
      ...Object.keys(skills).filter((k) => k.includes(":") && getSkillDef(k)?.category === cat),
    ],
  })).filter((g) => g.keys.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle
        eyebrow="Passo 3" title="Perícias"
        desc={`Pacote Completo: gaste ${COMPLETE_SKILL_POINTS} pontos. Nível máximo ${SKILL_MAX_AT_CREATION} na criação; perícias ×2 custam o dobro por nível. As 13 básicas começam em 2 de graça.`}
      />

      {check && (
        <div style={{ position: "sticky", top: 108, zIndex: 5, padding: "10px 14px", background: "var(--surface)", border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius)" }}>
          <b style={{ color: check.skillPointsLeft === 0 && check.valid ? CP.success : CP.warn }}>
            {check.skillPointsUsed}/{COMPLETE_SKILL_POINTS} pontos
          </b>
          <span style={{ fontSize: "0.78rem", color: CP.textMuted }}> — restam {check.skillPointsLeft}</span>
          {check.errors.length > 0 && (
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: "0.74rem", color: CP.danger }}>
              {check.errors.slice(0, 3).map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {groups.map((g) => (
        <div key={g.cat}>
          <p style={{ fontSize: "0.68rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{SKILL_CATEGORIES[g.cat]}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(250px, 100%), 1fr))", gap: 6 }}>
            {g.keys.map((key) => {
              const def = getSkillDef(key)!;
              const lvl = skills[key] ?? 0;
              const removable = key.includes(":") && presets[key] === undefined;
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", background: lvl > 0 ? CP.accentDim : "var(--surface-2)", border: `1px solid ${lvl > 0 ? CP.accentBord : "var(--border)"}`, borderRadius: "var(--radius-xs)" }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: "0.76rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={skillLabel(key)}>
                    {skillLabel(key)}{def.x2 && <b style={{ color: CP.warn }}> ×2</b>}
                  </span>
                  {removable && <button type="button" onClick={() => { const n = { ...skills }; delete n[key]; onChange({ skills: n }); }} aria-label={`Remover ${skillLabel(key)}`} style={{ ...pillBtn, padding: "0 8px" }}>×</button>}
                  <button type="button" onClick={() => setLevel(key, lvl - 1)} aria-label={`Diminuir ${skillLabel(key)}`} style={{ ...pillBtn, width: 28, padding: 0 }}>−</button>
                  <b style={{ minWidth: 14, textAlign: "center", fontSize: "0.82rem" }}>{lvl}</b>
                  <button type="button" onClick={() => setLevel(key, lvl + 1)} aria-label={`Aumentar ${skillLabel(key)}`} style={{ ...pillBtn, width: 28, padding: 0 }}>+</button>
                  <span style={{ fontSize: "0.62rem", color: CP.textSubtle, minWidth: 18, textAlign: "right" }}>{skillPointCost(key, lvl)}p</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ padding: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Perícia com especialidade</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 180px" }}>
            <Field label="Perícia" style={labelStyle}>
              <select value={spBase} onChange={(e) => setSpBase(e.target.value)} style={inputStyle}>
                {SPECIALISED.map((s) => <option key={s.key} value={s.key}>{s.name.replace(/ \(especificar\)/, "")}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <Field label="Especialidade" style={labelStyle}>
              <input value={spName} maxLength={30} placeholder="Ex.: japonês, violino" onChange={(e) => setSpName(e.target.value)} style={inputStyle} />
            </Field>
          </div>
          <PrimaryButton onClick={addSpecialised} disabled={!spName.trim()}>Adicionar</PrimaryButton>
        </div>
      </div>

      <div><GhostButton onClick={() => onChange({ skills: defaultCompleteSkills() })}>Zerar distribuição</GhostButton></div>
    </div>
  );
}
