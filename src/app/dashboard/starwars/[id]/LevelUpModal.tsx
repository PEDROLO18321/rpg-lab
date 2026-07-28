"use client";

import { useState } from "react";
import { CLASSES, CLASS_BY_ID, ARCHETYPE_LABEL } from "@/lib/starwars/classes";
import { availableChoiceKinds, isSkillGradeMandatory, canCombineClasses, countExpertSkills, expertSkillsRequiredForNewClass, isFreeMulticlassWindow, type LevelUpChoiceKind } from "@/lib/starwars/leveling";
import { getAvailableAbilities } from "@/lib/starwars/powers/registry";
import { GENERAL_POWERS, GENERAL_POWER_BY_ID } from "@/lib/starwars/powers/generalPowers";
import { ATTR_KEYS, ATTR_LABEL, SKILL_GRADE_LABEL, nextSkillGrade, type AttrKey, type SkillGrade } from "@/lib/starwars/data";
import { SKILLS } from "@/lib/starwars/skills";
import { SW, Dropdown } from "../ui";

type ChoiceKind = "atributo" | "habilidade_classe" | "poder_geral" | "grau_pericia";

interface Props {
  characterId: string;
  sheet: {
    level: number; classes: string; skills: string | null;
  };
  onClose: () => void;
  onDone: () => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: "0.68rem", fontWeight: 800, color: SW.textMuted, letterSpacing: "0.09em", textTransform: "uppercase" }}>{children}</label>;
}

export function LevelUpModal({ characterId, sheet, onClose, onDone }: Props) {
  const classLevels: Record<string, number> = JSON.parse(sheet.classes || "{}");
  const existingClassIds = Object.keys(classLevels);
  const skills: Record<string, SkillGrade> = JSON.parse(sheet.skills || "{}");
  const expertCount = countExpertSkills(skills);

  const fromLevel = sheet.level;
  const toLevel = fromLevel + 1;
  const freeWindow = isFreeMulticlassWindow(fromLevel, existingClassIds.length);
  // Custo cumulativo: 2 Expert pra 1ª multiclasse paga, 4 pra 2ª, 6 pra 3ª...
  const expertRequired = expertSkillsRequiredForNewClass(fromLevel, existingClassIds.length);
  const canAddNewClass = expertCount >= expertRequired;

  const [classId, setClassId] = useState(existingClassIds[0] ?? "");
  const [attrKey, setAttrKey] = useState<AttrKey | null>(null);
  const [classPowerName, setClassPowerName] = useState<string | null>(null);
  const [generalPowerId, setGeneralPowerId] = useState<string | null>(null);
  const [skillGradeUpId, setSkillGradeUpId] = useState<string | null>(null);
  const [choiceKind, setChoiceKind] = useState<ChoiceKind | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kinds: LevelUpChoiceKind[] = availableChoiceKinds(fromLevel, toLevel);
  const mandatorySkill = isSkillGradeMandatory(toLevel);
  const effectiveKind: ChoiceKind | null = mandatorySkill ? "grau_pericia" : choiceKind;
  const cls = classId ? CLASS_BY_ID[classId] : undefined;
  const isNewClass = !!classId && !existingClassIds.includes(classId);
  const nextAbilities = classId ? getAvailableAbilities(classId, (classLevels[classId] ?? 0) + 1).filter((a) => a.level === (classLevels[classId] ?? 0) + 1) : [];

  const newClassOptions = CLASSES.filter((c) => !c.isAdvanced && !existingClassIds.includes(c.id)).map((c) => {
    const combinable = existingClassIds.every((eid) => canCombineClasses(eid, c.id));
    return {
      id: c.id,
      name: c.name,
      disabled: !combinable || !canAddNewClass,
      hint: !combinable ? "incompatível" : freeWindow ? "grátis" : `precisa ${expertRequired} Expert`,
    };
  });

  function selectChoiceKind(kind: ChoiceKind) {
    setChoiceKind(kind);
    setAttrKey(null);
    setClassPowerName(null);
    setGeneralPowerId(null);
    setSkillGradeUpId(null);
  }

  const canSubmit =
    !!classId &&
    (mandatorySkill
      ? !!skillGradeUpId
      : effectiveKind === "atributo"
      ? !!attrKey
      : effectiveKind === "habilidade_classe"
      ? !!classPowerName
      : effectiveKind === "poder_geral"
      ? !!generalPowerId
      : effectiveKind === "grau_pericia"
      ? !!skillGradeUpId
      : false);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/starwars/characters/${characterId}/levelup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          attrKey: effectiveKind === "atributo" ? attrKey : undefined,
          classPowerId: effectiveKind === "habilidade_classe" ? classPowerName : undefined,
          generalPowerId: effectiveKind === "poder_geral" ? generalPowerId : undefined,
          skillGradeUpId: effectiveKind === "grau_pericia" ? skillGradeUpId : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao subir de nível");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao subir de nível");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,4,8,0.78)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: SW.panel, border: `1px solid ${SW.accentBord}`, boxShadow: `0 0 40px ${SW.glow}`, padding: 30, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <p style={{ fontSize: "0.68rem", fontWeight: 800, color: SW.accentLight, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>Progressão</p>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--text)" }}>
            Nível <span style={{ color: SW.textSubtle }}>{fromLevel}</span> → <span style={{ color: SW.accentBright }}>{toLevel}</span>
          </h2>
        </div>

        <p style={{ fontSize: "0.8rem", color: SW.textMuted, padding: "10px 14px", background: "rgba(59,130,196,0.06)", borderLeft: `2px solid ${SW.accentBord}` }}>
          PV, PE e PP sobem automaticamente. Abaixo: 1️⃣ escolha em qual classe o nível entra, 2️⃣ escolha <strong style={{ color: "var(--text)" }}>uma única</strong> evolução para este nível.
        </p>

        <div>
          <FieldLabel>1. Classe que recebe este nível</FieldLabel>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {existingClassIds.map((cid) => (
              <button key={cid} onClick={() => setClassId(cid)}
                style={{ padding: "8px 14px", border: `1px solid ${classId === cid ? SW.accentBord : "var(--border)"}`, background: classId === cid ? SW.accentDim : "rgba(255,255,255,0.02)", color: classId === cid ? SW.accentBright : "var(--text)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, borderRadius: 6 }}>
                {CLASS_BY_ID[cid]?.name} <span style={{ color: SW.textSubtle, fontWeight: 400 }}>nv. {classLevels[cid]}</span>
              </button>
            ))}
          </div>

          {newClassOptions.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: "0.66rem", color: SW.textSubtle, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                Multiclasse {freeWindow
                  ? <span style={{ color: SW.gold }}>· janela grátis neste nível!</span>
                  : <span style={{ color: canAddNewClass ? SW.textSubtle : SW.danger }}>· exige {expertRequired} Expert (você tem {expertCount})</span>}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {newClassOptions.map((c) => (
                  <button key={c.id} disabled={c.disabled} onClick={() => setClassId(c.id)}
                    title={c.hint}
                    style={{ padding: "8px 14px", border: `1px solid ${classId === c.id ? SW.accentBord : "var(--border)"}`, background: classId === c.id ? SW.accentDim : "rgba(255,255,255,0.02)", color: c.disabled ? SW.textSubtle : classId === c.id ? SW.accentBright : "var(--text)", cursor: c.disabled ? "not-allowed" : "pointer", opacity: c.disabled ? 0.5 : 1, fontSize: "0.8rem", fontWeight: 700, borderRadius: 6 }}>
                    + {c.name} <span style={{ fontWeight: 400, color: SW.textSubtle }}>({c.hint})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isNewClass && cls && (
            <p style={{ fontSize: "0.76rem", color: SW.gold, marginTop: 8 }}>
              Nova classe: {cls.name} ({ARCHETYPE_LABEL[cls.archetype]}) começa no nível 1 dela — ganha o PV/PE base da classe, não o incremento por nível.
            </p>
          )}
        </div>

        <div>
          <FieldLabel>2. Evolução deste nível {mandatorySkill && <span style={{ color: SW.gold, textTransform: "none", fontWeight: 700 }}> · nível múltiplo de 5: só perícia</span>}</FieldLabel>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {kinds.includes("atributo") && (
              <button disabled={mandatorySkill} onClick={() => selectChoiceKind("atributo")} style={tabStyle(effectiveKind === "atributo", mandatorySkill)}>+1 Atributo</button>
            )}
            {kinds.includes("habilidade_classe") && nextAbilities.length > 0 && (
              <button disabled={mandatorySkill} onClick={() => selectChoiceKind("habilidade_classe")} style={tabStyle(effectiveKind === "habilidade_classe", mandatorySkill)}>Habilidade de Classe</button>
            )}
            {kinds.includes("poder_geral") && (
              <button disabled={mandatorySkill} onClick={() => selectChoiceKind("poder_geral")} style={tabStyle(effectiveKind === "poder_geral", mandatorySkill)}>Poder Geral</button>
            )}
            <button onClick={() => selectChoiceKind("grau_pericia")} style={tabStyle(effectiveKind === "grau_pericia", false)}>Subir Perícia{mandatorySkill ? " (obrigatório)" : ""}</button>
          </div>

          <div style={{ marginTop: 12 }}>
            {effectiveKind === "atributo" && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ATTR_KEYS.map((k) => (
                  <button key={k} onClick={() => setAttrKey(k)} style={{ padding: "6px 12px", border: `1px solid ${attrKey === k ? SW.accentBord : "var(--border)"}`, background: attrKey === k ? SW.accentDim : "rgba(255,255,255,0.02)", color: attrKey === k ? SW.accentBright : SW.textMuted, cursor: "pointer", fontSize: "0.78rem", borderRadius: 6 }}>
                    {ATTR_LABEL[k]}
                  </button>
                ))}
              </div>
            )}

            {effectiveKind === "habilidade_classe" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {nextAbilities.map((a) => (
                  <button key={a.name} onClick={() => setClassPowerName(a.name)}
                    style={{ textAlign: "left", padding: "9px 13px", border: `1px solid ${classPowerName === a.name ? SW.accentBord : "var(--border)"}`, background: classPowerName === a.name ? SW.accentDim : "rgba(255,255,255,0.02)", color: "var(--text)", cursor: "pointer", fontSize: "0.78rem", borderRadius: 6 }}>
                    <strong style={{ color: classPowerName === a.name ? SW.accentBright : "var(--text)" }}>{a.name}</strong>{a.combat ? <span style={{ color: SW.danger }}> (combate)</span> : null}: {a.description}
                    <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
                      <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "#5ec8e8" }}>{a.combat ? 0 : a.peCost} PE</span>
                      {a.weaponDamage === "sabre" && <span style={{ fontSize: "0.66rem", fontWeight: 700, color: SW.danger }}>{a.formTag ? "Forma: Nd20+1d12+perícia" : "Sabre: 6d6×atributo+perícia"}</span>}
                      {a.damageDice && <span style={{ fontSize: "0.66rem", fontWeight: 700, color: SW.danger }}>{a.heal ? "Cura" : "Dano"} {a.damageDice}</span>}
                      {a.dt !== undefined && <span style={{ fontSize: "0.66rem", fontWeight: 700, color: SW.gold }}>DT {a.dt}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {effectiveKind === "poder_geral" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {(["basico", "avancado"] as const).map((tier) => (
                  <div key={tier}>
                    <p style={{ fontSize: "0.66rem", fontWeight: 800, color: SW.textSubtle, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                      {tier === "basico" ? "Básicos" : "Avançados"}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {GENERAL_POWERS.filter((p) => p.tier === tier).map((p) => {
                        const selected = generalPowerId === p.id;
                        return (
                          <button key={p.id} onClick={() => setGeneralPowerId(p.id)}
                            style={{ padding: "6px 12px", border: `1px solid ${selected ? SW.accentBord : "var(--border)"}`, background: selected ? SW.accentDim : "rgba(255,255,255,0.02)", color: selected ? SW.accentBright : "var(--text)", cursor: "pointer", fontSize: "0.78rem", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            {p.name}
                            <span style={{ fontSize: "0.68rem", color: selected ? SW.accentBright : SW.gold, fontWeight: 700 }}>{p.cost} PP</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {generalPowerId && GENERAL_POWER_BY_ID[generalPowerId] && (
                  <div style={{ padding: "11px 14px", background: SW.accentDim, border: `1px solid ${SW.accentBord}`, borderRadius: 6 }}>
                    <p style={{ fontSize: "0.84rem", color: SW.accentBright, fontWeight: 700, marginBottom: 4 }}>
                      {GENERAL_POWER_BY_ID[generalPowerId].name}
                      <span style={{ fontWeight: 400, color: SW.textMuted, fontSize: "0.74rem" }}> · {GENERAL_POWER_BY_ID[generalPowerId].cost} PP · {GENERAL_POWER_BY_ID[generalPowerId].sustain === "sustentado" ? "sustentado" : "instantâneo"}</span>
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.6 }}>{GENERAL_POWER_BY_ID[generalPowerId].description}</p>
                    {GENERAL_POWER_BY_ID[generalPowerId].prerequisite && (
                      <p style={{ fontSize: "0.72rem", color: SW.gold, marginTop: 6 }}>Pré-requisito: {GENERAL_POWER_BY_ID[generalPowerId].prerequisite}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {effectiveKind === "grau_pericia" && (
              <Dropdown value={skillGradeUpId ?? ""} onChange={(v) => setSkillGradeUpId(v || null)}
                options={SKILLS.map((s) => {
                  const grade: SkillGrade = skills[s.id] ?? "inexperiente";
                  const next = nextSkillGrade(grade);
                  return { value: s.id, label: `${s.name} — ${SKILL_GRADE_LABEL[grade]} → ${next ? SKILL_GRADE_LABEL[next] : "máximo"}`, disabled: !next };
                })} />
            )}

            {!effectiveKind && <p style={{ fontSize: "0.78rem", color: SW.textSubtle }}>Escolha uma opção acima.</p>}
          </div>
        </div>

        {error && <p style={{ fontSize: "0.78rem", color: SW.danger }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", fontSize: "0.84rem", borderRadius: 6 }}>Cancelar</button>
          <button onClick={submit} disabled={saving || !canSubmit} style={{ padding: "9px 22px", background: `linear-gradient(135deg, ${SW.accentLight} 0%, ${SW.accent} 100%)`, border: "none", color: "#04070c", fontWeight: 800, cursor: saving ? "wait" : "pointer", fontSize: "0.84rem", borderRadius: 6, boxShadow: `0 0 18px ${SW.glow}`, opacity: canSubmit ? 1 : 0.5 }}>
            {saving ? "Salvando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function tabStyle(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    padding: "8px 14px",
    border: `1px solid ${active ? SW.accentBord : "var(--border)"}`,
    background: active ? SW.accentDim : "rgba(255,255,255,0.02)",
    color: disabled ? SW.textSubtle : active ? SW.accentBright : "var(--text)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    fontSize: "0.8rem",
    fontWeight: 700,
    borderRadius: 6,
  };
}
