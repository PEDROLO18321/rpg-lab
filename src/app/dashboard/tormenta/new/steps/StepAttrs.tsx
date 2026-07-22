"use client";

import { ATTR_KEYS, ATTR_LABEL, ATTR_ABBR, attrMod, pointBuyCost, POINT_BUY_TOTAL, POINT_BUY_MIN, POINT_BUY_MAX, SKILL_BY_ID, type AttrKey, type TormentaAttrs } from "@/lib/tormenta/data";
import { CLASS_BY_ID } from "@/lib/tormenta/classes";
import { ORIGIN_BY_ID } from "@/lib/tormenta/origins";
import type { WizardData } from "../CharacterWizard";
import { ACCENT, ACCENT_LIGHT, ACCENT_DIM, ACCENT_BORD } from "../CharacterWizard";
import { Intro } from "./Intro";

interface Props {
  attrBases: TormentaAttrs;
  classId: string | null;
  originId: string | null;
  classFixedChoice: Record<string, string>;
  classSkillChoices: string[];
  originSkillChoices: string[];
  intBonusSkillChoices: string[];
  resolvedClassFixed: string[];
  onChange: (p: Partial<WizardData>) => void;
}

export function StepAttrs({ attrBases, classId, originId, classFixedChoice, classSkillChoices, originSkillChoices, intBonusSkillChoices, resolvedClassFixed, onChange }: Props) {
  const cls = classId ? CLASS_BY_ID[classId] : undefined;
  const origin = originId ? ORIGIN_BY_ID[originId] : undefined;
  const remaining = POINT_BUY_TOTAL - pointBuyCost(attrBases);
  const intMod = Math.max(0, attrMod(attrBases.int));

  function setAttr(key: AttrKey, delta: number) {
    const v = attrBases[key] + delta;
    if (v < POINT_BUY_MIN || v > POINT_BUY_MAX) return;
    const next = { ...attrBases, [key]: v };
    if (delta > 0 && pointBuyCost(next) > POINT_BUY_TOTAL) return;
    onChange({ attrBases: next });
  }

  const lockedIds = new Set([...resolvedClassFixed, ...originSkillChoices]);

  function toggleClassSkill(id: string) {
    if (!cls) return;
    const chosen = classSkillChoices.includes(id);
    if (chosen) onChange({ classSkillChoices: classSkillChoices.filter((s) => s !== id) });
    else if (classSkillChoices.length < cls.skillChoiceCount) onChange({ classSkillChoices: [...classSkillChoices, id] });
  }

  function toggleIntSkill(id: string) {
    const chosen = intBonusSkillChoices.includes(id);
    if (chosen) onChange({ intBonusSkillChoices: intBonusSkillChoices.filter((s) => s !== id) });
    else if (intBonusSkillChoices.length < intMod) onChange({ intBonusSkillChoices: [...intBonusSkillChoices, id] });
  }

  const allSelected = new Set([...lockedIds, ...classSkillChoices, ...intBonusSkillChoices]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Intro title="Atributos & Perícias" text={`Compre seus atributos com ${POINT_BUY_TOTAL} pontos (Tabela 1-2). Depois, escolha as perícias treinadas de sua classe e — se tiver bônus de Inteligência — perícias extra livres.`} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: remaining === 0 ? "rgba(125,200,100,0.08)" : ACCENT_DIM, border: `1px solid ${remaining === 0 ? "rgba(125,200,100,0.3)" : ACCENT_BORD}`, borderRadius: "var(--radius-lg)" }}>
        <span style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>Pontos restantes</span>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: remaining === 0 ? "#7dc864" : ACCENT_LIGHT }}>{remaining}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {ATTR_KEYS.map((key) => {
          const val = attrBases[key];
          const mod = attrMod(val);
          return (
            <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)" }}>{ATTR_LABEL[key]}</p>
                <p style={{ fontSize: "0.66rem", color: "var(--text-subtle)", letterSpacing: "0.08em" }}>{ATTR_ABBR[key]}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StepBtn label="−" onClick={() => setAttr(key, -1)} disabled={val <= POINT_BUY_MIN} />
                <span style={{ minWidth: 60, textAlign: "center", fontSize: "1.4rem", fontWeight: 800, color: ACCENT_LIGHT, fontFamily: "var(--font-cinzel), serif" }}>
                  {val} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>({mod >= 0 ? "+" : ""}{mod})</span>
                </span>
                <StepBtn label="+" onClick={() => setAttr(key, 1)} disabled={val >= POINT_BUY_MAX} />
              </div>
            </div>
          );
        })}
      </div>

      {cls && (
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Perícia fixa com escolha
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cls.skillsFixed.filter((f) => f.includes("|")).map((f) => {
              const opts = f.split("|");
              const chosen = classFixedChoice[f];
              return (
                <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Escolha:</span>
                  {opts.map((opt) => {
                    const on = chosen === opt;
                    return (
                      <button key={opt} onClick={() => onChange({ classFixedChoice: { [f]: opt } })}
                        style={{ padding: "5px 12px", fontSize: "0.78rem", fontWeight: 600, background: on ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${on ? ACCENT : "var(--border)"}`, borderRadius: "var(--radius-full)", color: on ? ACCENT_LIGHT : "var(--text)", cursor: "pointer" }}>
                        {SKILL_BY_ID[opt]?.name ?? opt}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {cls && (
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Perícias de classe — escolha {cls.skillChoiceCount} ({classSkillChoices.length}/{cls.skillChoiceCount})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cls.skillChoices.map((id) => {
              const sel = classSkillChoices.includes(id);
              const locked = allSelected.has(id) && !sel;
              const maxed = !sel && classSkillChoices.length >= cls.skillChoiceCount;
              return (
                <button key={id} onClick={() => toggleClassSkill(id)} disabled={maxed || locked}
                  style={{ padding: "5px 12px", background: sel ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${sel ? ACCENT : "var(--border)"}`, borderRadius: "var(--radius-full)", color: sel ? ACCENT_LIGHT : locked ? "var(--text-subtle)" : "var(--text)", fontSize: "0.78rem", fontWeight: 600, cursor: maxed || locked ? "not-allowed" : "pointer", opacity: maxed || locked ? 0.4 : 1 }}>
                  {SKILL_BY_ID[id]?.name ?? id}{locked ? " (origem)" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {intMod > 0 && (
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Perícias extra por Inteligência — escolha {intMod} ({intBonusSkillChoices.length}/{intMod})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.values(SKILL_BY_ID).map((s) => {
              const sel = intBonusSkillChoices.includes(s.id);
              const locked = allSelected.has(s.id) && !sel;
              const maxed = !sel && intBonusSkillChoices.length >= intMod;
              return (
                <button key={s.id} onClick={() => toggleIntSkill(s.id)} disabled={maxed || locked}
                  style={{ padding: "5px 12px", background: sel ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${sel ? ACCENT : "var(--border)"}`, borderRadius: "var(--radius-full)", color: sel ? ACCENT_LIGHT : locked ? "var(--text-subtle)" : "var(--text)", fontSize: "0.78rem", fontWeight: 600, cursor: maxed || locked ? "not-allowed" : "pointer", opacity: maxed || locked ? 0.4 : 1 }}>
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {origin && (
        <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)" }}>
          Perícias já garantidas pela origem ({origin.name}): {originSkillChoices.map((id) => SKILL_BY_ID[id]?.name ?? id).join(", ") || "nenhuma escolhida ainda"}.
        </p>
      )}
    </div>
  );
}

function StepBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: 30, height: 30, borderRadius: "50%", background: disabled ? "var(--surface-2)" : ACCENT_DIM, border: `1px solid ${disabled ? "var(--border)" : ACCENT_BORD}`, color: disabled ? "var(--text-subtle)" : ACCENT_LIGHT, fontSize: "1.05rem", fontWeight: 700, cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {label}
    </button>
  );
}
