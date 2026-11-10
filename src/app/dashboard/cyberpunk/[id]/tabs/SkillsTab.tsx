"use client";

import { useState } from "react";
import {
  SKILLS, SKILL_CATEGORIES, STATS, getSkillDef, type SkillCategory,
} from "@/lib/cyberpunk/data";
import { ipCost } from "@/lib/cyberpunk/rules";
import { SheetShell } from "@/components/sheet/SheetShell";
import { SheetSection } from "@/components/sheet/SheetSection";
import { Field } from "@/components/ui/Field";
import { CP, PrimaryButton, inputStyle, labelStyle, pillBtn } from "../../ui";
import { autoModifier, clamp, skillLabel, type TabProps } from "../sheetModel";

const STAT_SHORT = Object.fromEntries(STATS.map((s) => [s.key, s.short]));
const SPECIALISED = SKILLS.filter((s) => s.specialised);

export function SkillsTab({ sh, patch, roll }: TabProps) {
  const [showAll, setShowAll] = useState(false);
  const [manual, setManual] = useState(0);
  const [dv, setDv] = useState<string>("");
  const [spBase, setSpBase] = useState(SPECIALISED[0].key);
  const [spName, setSpName] = useState("");

  const dvNum = dv.trim() === "" ? null : Number(dv);

  function setLevel(key: string, level: number) {
    const next = { ...sh.skills };
    if (level <= 0) delete next[key]; else next[key] = clamp(level, 1, 10);
    patch({ skills: next });
  }

  function improve(key: string) {
    const def = getSkillDef(key);
    const level = sh.skills[key] ?? 0;
    if (level >= 10) return;
    const cost = ipCost(level + 1, !!def?.x2);
    if (sh.improvementPoints < cost) return;
    patch({ skills: { ...sh.skills, [key]: level + 1 }, improvementPoints: sh.improvementPoints - cost });
  }

  function addSpecialised() {
    const label = spName.trim().toLowerCase().replace(/[:\s]+/g, "");
    if (!label) return;
    patch({ skills: { ...sh.skills, [`${spBase}:${label}`]: 2 } });
    setSpName("");
  }

  const groups = (Object.keys(SKILL_CATEGORIES) as SkillCategory[]).map((cat) => {
    const keys = [
      ...SKILLS.filter((s) => s.category === cat && !s.specialised).map((s) => s.key),
      ...Object.keys(sh.skills).filter((k) => k.includes(":") && getSkillDef(k)?.category === cat),
    ].filter((k) => showAll || (sh.skills[k] ?? 0) > 0);
    return { cat, keys };
  }).filter((g) => g.keys.length > 0);

  const left = (
    <>
      <SheetSection
        title="Perícias" accent
        action={<button type="button" onClick={() => setShowAll((v) => !v)} aria-pressed={showAll} style={pillBtn}>{showAll ? "Só as treinadas" : "Mostrar todas"}</button>}
      >
        <p style={{ fontSize: "0.74rem", color: CP.textMuted, lineHeight: 1.5 }}>
          Teste = ATRIBUTO + nível + 1d10 (um 10 soma outro d10; um 1 subtrai). Toque numa perícia para rolar. ▲ gasta IP para subir um nível.
        </p>
        {groups.length === 0 && <p style={{ fontSize: "0.82rem", color: CP.textSubtle }}>Nenhuma perícia treinada. Use “Mostrar todas”.</p>}
        {groups.map((g) => (
          <div key={g.cat}>
            <p style={{ fontSize: "0.66rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.08em", margin: "6px 0" }}>{SKILL_CATEGORIES[g.cat]}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))", gap: 5 }}>
              {g.keys.map((key) => {
                const def = getSkillDef(key)!;
                const level = sh.skills[key] ?? 0;
                const statVal = sh[def.stat];
                const cost = level < 10 ? ipCost(level + 1, def.x2) : 0;
                const auto = autoModifier(sh, def.stat);
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 4px 2px 2px", background: level > 0 ? CP.accentDim : "transparent", border: `1px solid ${level > 0 ? CP.accentBord : "var(--border)"}`, borderRadius: "var(--radius-xs)", minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => roll(skillLabel(key), statVal, level, { modifier: auto + manual, dv: dvNum })}
                      title={`Rolar ${skillLabel(key)}`}
                      style={{ flex: 1, minWidth: 0, minHeight: 30, display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "var(--text)", fontFamily: "inherit", textAlign: "left", padding: "2px 6px" }}
                    >
                      <span style={{ flex: 1, minWidth: 0, fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {skillLabel(key)}{def.x2 && <b style={{ color: CP.warn }}> ×2</b>}
                      </span>
                      <span style={{ fontSize: "0.62rem", color: CP.textSubtle }}>{STAT_SHORT[def.stat]}</span>
                      <b style={{ fontSize: "0.8rem", color: level > 0 ? CP.accentLight : CP.textSubtle }}>{level}</b>
                      <span style={{ fontSize: "0.7rem", color: CP.textMuted, minWidth: 24, textAlign: "right" }}>={statVal + level}</span>
                    </button>
                    {level < 10 && (
                      <button
                        type="button" onClick={() => improve(key)} disabled={sh.improvementPoints < cost}
                        title={`Subir para ${level + 1}: ${cost} IP`} aria-label={`Subir ${skillLabel(key)} por ${cost} IP`}
                        style={{ ...pillBtn, padding: "0 8px", opacity: sh.improvementPoints < cost ? 0.4 : 1 }}
                      >
                        ▲
                      </button>
                    )}
                    {key.includes(":") && (
                      <button type="button" onClick={() => setLevel(key, 0)} aria-label={`Remover ${skillLabel(key)}`} style={{ ...pillBtn, padding: "0 8px" }}>×</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </SheetSection>
    </>
  );

  const right = (
    <>
      <SheetSection title="Modificadores do teste">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <Field label="Modificador" style={labelStyle}>
              <input type="number" value={manual} onChange={(e) => setManual(parseInt(e.target.value) || 0)} style={inputStyle} />
            </Field>
          </div>
          <div>
            <Field label="DV do alvo" style={labelStyle}>
              <input type="number" value={dv} placeholder="opcional" onChange={(e) => setDv(e.target.value)} style={inputStyle} />
            </Field>
          </div>
        </div>
        <p style={{ fontSize: "0.72rem", color: CP.textMuted, lineHeight: 1.5 }}>
          Com DV preenchida, o histórico diz se o total superou a dificuldade (empate é da DV). Ferimento e armadura já são somados sozinhos.
        </p>
      </SheetSection>

      <SheetSection title="Perícia com especialidade">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field label="Perícia" style={labelStyle}>
            <select value={spBase} onChange={(e) => setSpBase(e.target.value)} style={inputStyle}>
              {SPECIALISED.map((s) => <option key={s.key} value={s.key}>{s.name.replace(/ \(especificar\)/, "")}</option>)}
            </select>
          </Field>
          <Field label="Especialidade" style={labelStyle}>
            <input value={spName} maxLength={30} placeholder="Ex.: japonês, violino" onChange={(e) => setSpName(e.target.value)} style={inputStyle} />
          </Field>
          <div><PrimaryButton onClick={addSpecialised} disabled={!spName.trim()}>Adicionar no nível 2</PrimaryButton></div>
        </div>
      </SheetSection>
    </>
  );

  return <SheetShell system="cyberpunk" left={left} right={right} />;
}
