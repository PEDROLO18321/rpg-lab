"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CLASSES, CLASS_BY_ID, ARCHETYPE_LABEL } from "@/lib/starwars/classes";
import {
  canCombineClasses, canUnlockPathClass, PATH_CLASS_UNLOCK_LEVEL, CLASS_LEVEL_CAP, BONUS_LEVEL_ID, MAX_LEVEL,
  countExpertSkills, expertSkillsRequiredForNewClass, isFreeMulticlassWindow, isMilestone5, isMilestone10,
  levelUpGain, type MandatoryChoiceKind, POOL_CLASS_IDS, getRemainingPoolAbilities,
} from "@/lib/starwars/leveling";
import { getAvailableAbilities } from "@/lib/starwars/powers/registry";
import { GENERAL_POWERS, GENERAL_POWER_BY_ID } from "@/lib/starwars/powers/generalPowers";
import type { ChosenPower } from "@/lib/starwars/powers/types";
import { ATTR_KEYS, ATTR_LABEL, SKILL_GRADE_LABEL, nextSkillGrade, type AttrKey, type SkillGrade } from "@/lib/starwars/data";
import { SKILLS } from "@/lib/starwars/skills";
import { SW, Dropdown } from "../ui";

interface Props {
  characterId: string;
  sheet: {
    level: number; classes: string; skills: string | null; generalPowers: string | null; unlockedProphecies: string;
    classPowers?: string | null;
  };
  onClose: () => void;
  onDone: () => void;
}

/** Senha (sem acento, sem diferenciar maiúsculas) → classe de Profecia que ela libera. */
const PROPHECY_PASSWORDS: Record<string, string> = {
  luz: "cantico_alvorecer",
  sombra: "litania_queda",
};

/** Remove acentos (via decomposição Unicode) e normaliza caixa, pra comparar a senha digitada. */
function normalizeWord(s: string): string {
  const decomposed = Array.from(s.normalize("NFD"));
  const stripped = decomposed.filter((ch) => {
    const code = ch.codePointAt(0) ?? 0;
    return code < 0x0300 || code > 0x036f; // fora da faixa de marcas de acentuação combinantes
  });
  return stripped.join("").trim().toLowerCase();
}

/** Fade + slide sutil só no instante em que a classe é liberada nesta sessão do modal. */
function AnimatedReveal({ children }: { children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div style={{ opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(-6px)", transition: "opacity 0.45s ease, transform 0.45s ease" }}>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: "0.68rem", fontWeight: 800, color: SW.textMuted, letterSpacing: "0.09em", textTransform: "uppercase" }}>{children}</label>;
}

function AttrGrid({ value, onPick }: { value: AttrKey | null; onPick: (k: AttrKey) => void }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {ATTR_KEYS.map((k) => (
        <button key={k} onClick={() => onPick(k)} style={{ padding: "6px 12px", border: `1px solid ${value === k ? SW.accentBord : "var(--border)"}`, background: value === k ? SW.accentDim : "rgba(255,255,255,0.02)", color: value === k ? SW.accentBright : SW.textMuted, cursor: "pointer", fontSize: "0.78rem", borderRadius: 6 }}>
          {ATTR_LABEL[k]}
        </button>
      ))}
    </div>
  );
}

function AbilityPicker({ abilities, selected, onPick }: { abilities: ReturnType<typeof getAvailableAbilities>; selected: string | null; onPick: (name: string) => void }) {
  return (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      {abilities.map((a) => (
        <button key={a.name} onClick={() => onPick(a.name)}
          style={{ textAlign: "left", padding: "9px 13px", border: `1px solid ${selected === a.name ? SW.accentBord : "var(--border)"}`, background: selected === a.name ? SW.accentDim : "rgba(255,255,255,0.02)", color: "var(--text)", cursor: "pointer", fontSize: "0.78rem", borderRadius: 6 }}>
          <strong style={{ color: selected === a.name ? SW.accentBright : "var(--text)" }}>{a.name}</strong>{a.combat ? <span style={{ color: SW.danger }}> (combate)</span> : null}: {a.description}
          <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
            <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "#5ec8e8" }}>{a.peCost} PE</span>
            {a.weaponDamage === "sabre" && <span style={{ fontSize: "0.66rem", fontWeight: 700, color: SW.danger }}>{a.formTag ? "Sabre: 6d6×atributo+perícia ×2" : "Sabre: 6d6×atributo+perícia"}</span>}
            {a.damageDice && <span style={{ fontSize: "0.66rem", fontWeight: 700, color: SW.danger }}>{a.heal ? "Cura" : "Dano"} {a.damageDice}</span>}
            {a.dt !== undefined && <span style={{ fontSize: "0.66rem", fontWeight: 700, color: SW.gold }}>{a.skillId ? `${SKILLS.find((s) => s.id === a.skillId)?.name} · ` : ""}DT {a.dt}</span>}
          </div>
        </button>
      ))}
    </div>
  );
}

function PowerPicker({ selected, onPick, existingGeneralPowers }: { selected: string | null; onPick: (id: string) => void; existingGeneralPowers: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {(["basico", "avancado"] as const).map((tier) => (
        <div key={tier}>
          <p style={{ fontSize: "0.66rem", fontWeight: 800, color: SW.textSubtle, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            {tier === "basico" ? "Básicos" : "Avançados"}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {GENERAL_POWERS.filter((p) => p.tier === tier && !existingGeneralPowers.includes(p.id)).map((p) => {
              const isSelected = selected === p.id;
              return (
                <button key={p.id} onClick={() => onPick(p.id)}
                  style={{ padding: "6px 12px", border: `1px solid ${isSelected ? SW.accentBord : "var(--border)"}`, background: isSelected ? SW.accentDim : "rgba(255,255,255,0.02)", color: isSelected ? SW.accentBright : "var(--text)", cursor: "pointer", fontSize: "0.78rem", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  {p.name}
                  <span style={{ fontSize: "0.68rem", color: isSelected ? SW.accentBright : SW.gold, fontWeight: 700 }}>{p.cost} PP</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {selected && GENERAL_POWER_BY_ID[selected] && (
        <div style={{ padding: "11px 14px", background: SW.accentDim, border: `1px solid ${SW.accentBord}`, borderRadius: 6 }}>
          <p style={{ fontSize: "0.84rem", color: SW.accentBright, fontWeight: 700, marginBottom: 4 }}>
            {GENERAL_POWER_BY_ID[selected].name}
            <span style={{ fontWeight: 400, color: SW.textMuted, fontSize: "0.74rem" }}> · {GENERAL_POWER_BY_ID[selected].cost} PP · {GENERAL_POWER_BY_ID[selected].sustain === "sustentado" ? "sustentado" : "instantâneo"}</span>
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.6 }}>{GENERAL_POWER_BY_ID[selected].description}</p>
          {GENERAL_POWER_BY_ID[selected].prerequisite && (
            <p style={{ fontSize: "0.72rem", color: SW.gold, marginTop: 6 }}>Pré-requisito: {GENERAL_POWER_BY_ID[selected].prerequisite}</p>
          )}
        </div>
      )}
    </div>
  );
}

const MANDATORY_LABEL: Record<MandatoryChoiceKind, string> = {
  habilidade_classe: "Habilidade de Classe",
  grau_pericia: "Perícia",
  atributo: "+1 Atributo",
};

const STEP_LABEL = ["Classe", "Vitais", "Escolha", "Múltiplo de 5", "Múltiplo de 10", "Finalizar"];
const LAST_STEP = STEP_LABEL.length - 1;

export function LevelUpModal({ characterId, sheet, onClose, onDone }: Props) {
  const router = useRouter();
  const classLevels: Record<string, number> = JSON.parse(sheet.classes || "{}");
  const existingClassIds = Object.keys(classLevels);
  const skills: Record<string, SkillGrade> = JSON.parse(sheet.skills || "{}");
  const existingGeneralPowers: string[] = JSON.parse(sheet.generalPowers || "[]");
  const existingClassPowers: ChosenPower[] = JSON.parse(sheet.classPowers || "[]");
  const expertCount = countExpertSkills(skills);
  const pathReady = canUnlockPathClass(classLevels);

  const [unlockedProphecies, setUnlockedProphecies] = useState<string[]>(() => JSON.parse(sheet.unlockedProphecies || "[]"));
  const [passwordInputs, setPasswordInputs] = useState<Record<string, string>>({});
  const [passwordError, setPasswordError] = useState<Record<string, string | null>>({});
  const [justUnlocked, setJustUnlocked] = useState<Record<string, boolean>>({});

  const fromLevel = sheet.level;
  const toLevel = fromLevel + 1;
  const freeWindow = isFreeMulticlassWindow(fromLevel, existingClassIds.length);
  const expertRequired = expertSkillsRequiredForNewClass(fromLevel, existingClassIds.length);
  const canAddNewClass = expertCount >= expertRequired;
  const milestone5 = isMilestone5(toLevel);
  const milestone10 = isMilestone10(toLevel);

  const [step, setStep] = useState(0);
  const [classId, setClassId] = useState(() => existingClassIds.find((cid) => (classLevels[cid] ?? 0) < CLASS_LEVEL_CAP) ?? BONUS_LEVEL_ID);
  const [specialsOpen, setSpecialsOpen] = useState(false);
  const [classPowerName, setClassPowerName] = useState<string | null>(null);
  const [mandatorySkillId, setMandatorySkillId] = useState<string | null>(null);
  const [mandatoryAttrKey, setMandatoryAttrKey] = useState<AttrKey | null>(null);
  const [milestoneSkillId, setMilestoneSkillId] = useState<string | null>(null);
  const [milestonePowerId, setMilestonePowerId] = useState<string | null>(null);
  const [milestoneAttrKey, setMilestoneAttrKey] = useState<AttrKey | null>(null);
  const [multiclassAttrKey, setMulticlassAttrKey] = useState<AttrKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBonus = classId === BONUS_LEVEL_ID;
  const isNewClass = !isBonus && !existingClassIds.includes(classId);
  const cls = classId && !isBonus ? CLASS_BY_ID[classId] : undefined;
  const toLevelInClass = isBonus ? 0 : (classLevels[classId] ?? 0) + 1;

  // Habilidade de nível 1 da nova classe (fluxo de multiclasse).
  const newClassFirstAbilities = isNewClass ? getAvailableAbilities(classId, 1).filter((a) => a.level === 1) : [];

  // Habilidade de Classe — escolha obrigatória, prioridade 1. Nas 13 classes de Pool, "disponível"
  // é tudo que já abriu (pool 1/6/11/16, nunca fecha) e ainda não foi escolhido nessa classe.
  // Nas classes especiais (sistema antigo), continua sendo match exato do nível.
  const isPoolClass = !isBonus && POOL_CLASS_IDS.has(classId);
  const nextAbilities = !isNewClass && !isBonus && cls
    ? (isPoolClass
        ? getRemainingPoolAbilities(classId, toLevelInClass, existingClassPowers)
        : getAvailableAbilities(classId, toLevelInClass).filter((a) => a.level === toLevelInClass))
    : [];
  const hasHabilidade = nextAbilities.length > 0;
  const nonMaxSkills = SKILLS.filter((s) => nextSkillGrade(skills[s.id] ?? "inexperiente") !== null);
  const hasPoderGeral = GENERAL_POWERS.some((p) => !existingGeneralPowers.includes(p.id));

  const mandatoryKind: MandatoryChoiceKind = hasHabilidade ? "habilidade_classe" : nonMaxSkills.length > 0 ? "grau_pericia" : "atributo";

  const selectableClasses = CLASSES.filter((c) => !existingClassIds.includes(c.id))
    .filter((c) => !c.isPathClass || pathReady)
    .filter((c) => !c.isPropheticClass || unlockedProphecies.includes(c.id))
    .map((c) => {
      const combinable = existingClassIds.every((eid) => canCombineClasses(eid, c.id));
      const special = !!c.isPathClass || !!c.isPropheticClass;
      return {
        id: c.id,
        name: c.name,
        disabled: !combinable || (!special && !canAddNewClass),
        hint: !combinable ? "incompatível" : special ? "grátis — classe especial" : freeWindow ? "grátis" : `precisa ${expertRequired} Expert`,
      };
    });
  const newClassOptions = selectableClasses.filter((c) => !CLASS_BY_ID[c.id]?.isPathClass && !CLASS_BY_ID[c.id]?.isPropheticClass);
  const specialOptions = selectableClasses.filter((c) => CLASS_BY_ID[c.id]?.isPathClass || CLASS_BY_ID[c.id]?.isPropheticClass);
  const lockedProphecyIds = Object.values(PROPHECY_PASSWORDS).filter((id) => !unlockedProphecies.includes(id));

  async function tryUnlockProphecy(prophecyClassId: string) {
    const typed = normalizeWord(passwordInputs[prophecyClassId] ?? "");
    if (PROPHECY_PASSWORDS[typed] !== prophecyClassId) {
      setPasswordError((e) => ({ ...e, [prophecyClassId]: "Senha incorreta." }));
      return;
    }
    setPasswordError((e) => ({ ...e, [prophecyClassId]: null }));
    setJustUnlocked((j) => ({ ...j, [prophecyClassId]: true }));
    const next = [...new Set([...unlockedProphecies, prophecyClassId])];
    setUnlockedProphecies(next);
    await fetch(`/api/starwars/characters/${characterId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ unlockedProphecies: next }),
    });
    router.refresh();
  }

  function pickClass(id: string) {
    setClassId(id);
    setClassPowerName(null); setMandatorySkillId(null); setMandatoryAttrKey(null);
    setMilestoneSkillId(null); setMilestonePowerId(null); setMilestoneAttrKey(null); setMulticlassAttrKey(null);
  }

  function goNext() {
    if (step === 0) { setStep(isNewClass ? LAST_STEP : 1); return; }
    if (step === 1) { setStep(2); return; }
    if (step === 2) { setStep(milestone5 ? 3 : milestone10 ? 4 : LAST_STEP); return; }
    if (step === 3) { setStep(milestone10 ? 4 : LAST_STEP); return; }
    setStep((s) => Math.min(s + 1, LAST_STEP));
  }
  function goBack() {
    if (step === LAST_STEP && isNewClass) { setStep(0); return; }
    if (step === LAST_STEP) { setStep(milestone10 ? 4 : milestone5 ? 3 : 2); return; }
    if (step === 4) { setStep(milestone5 ? 3 : 2); return; }
    if (step === 3) { setStep(2); return; }
    setStep((s) => Math.max(s - 1, 0));
  }

  const mandatoryReady = mandatoryKind === "habilidade_classe" ? !!classPowerName
    : mandatoryKind === "grau_pericia" ? !!mandatorySkillId
    : !!mandatoryAttrKey;
  const milestone5Ready = !milestone5 || ((nonMaxSkills.length === 0 || !!milestoneSkillId) && (!hasPoderGeral || !!milestonePowerId));
  const milestone10Ready = !milestone10 || !!milestoneAttrKey;

  const canSubmit = isNewClass
    ? !!classPowerName && !!multiclassAttrKey
    : mandatoryReady && milestone5Ready && milestone10Ready;

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const body = isNewClass
        ? { classId, classPowerId: classPowerName, multiclassAttrKey }
        : {
            classId,
            classPowerId: mandatoryKind === "habilidade_classe" ? classPowerName : undefined,
            mandatorySkillId: mandatoryKind === "grau_pericia" ? mandatorySkillId : undefined,
            mandatoryAttrKey: mandatoryKind === "atributo" ? mandatoryAttrKey : undefined,
            milestoneSkillId: milestone5 ? milestoneSkillId : undefined,
            milestonePowerId: milestone5 ? milestonePowerId : undefined,
            milestoneAttrKey: milestone10 ? milestoneAttrKey : undefined,
          };
      const res = await fetch(`/api/starwars/characters/${characterId}/levelup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  function skillDropdownOptions(pool: typeof SKILLS) {
    return pool.map((s) => {
      const grade: SkillGrade = skills[s.id] ?? "inexperiente";
      const next = nextSkillGrade(grade);
      return { value: s.id, label: `${s.name} — ${SKILL_GRADE_LABEL[grade]} → ${next ? SKILL_GRADE_LABEL[next] : "máximo"}`, disabled: !next };
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,4,8,0.78)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: SW.panel, border: `1px solid ${SW.accentBord}`, boxShadow: `0 0 40px ${SW.glow}`, padding: 30, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <p style={{ fontSize: "0.68rem", fontWeight: 800, color: SW.accentLight, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
            Progressão · Etapa {step + 1} de {STEP_LABEL.length} — {STEP_LABEL[step]}
          </p>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--text)" }}>
            Nível <span style={{ color: SW.textSubtle }}>{fromLevel}</span> → <span style={{ color: SW.accentBright }}>{toLevel}</span>
          </h2>
        </div>

        {step === 0 && (
          <div>
            <FieldLabel>Classe que recebe este nível</FieldLabel>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {existingClassIds.map((cid) => {
                const atCap = (classLevels[cid] ?? 0) >= CLASS_LEVEL_CAP;
                return (
                  <button key={cid} disabled={atCap} onClick={() => { pickClass(cid); setSpecialsOpen(false); }}
                    title={atCap ? `Nível máximo por classe (${CLASS_LEVEL_CAP}) já atingido — escolha outra classe ou Bônus.` : undefined}
                    style={{ padding: "8px 14px", border: `1px solid ${classId === cid ? SW.accentBord : "var(--border)"}`, background: classId === cid ? SW.accentDim : "rgba(255,255,255,0.02)", color: atCap ? SW.textSubtle : classId === cid ? SW.accentBright : "var(--text)", cursor: atCap ? "not-allowed" : "pointer", opacity: atCap ? 0.5 : 1, fontSize: "0.8rem", fontWeight: 700, borderRadius: 6 }}>
                    {CLASS_BY_ID[cid]?.name} <span style={{ color: SW.textSubtle, fontWeight: 400 }}>nv. {classLevels[cid]}{atCap ? " (máx)" : ""}</span>
                  </button>
                );
              })}
              <button onClick={() => {
                if (specialsOpen) { setSpecialsOpen(false); pickClass(existingClassIds.find((cid) => (classLevels[cid] ?? 0) < CLASS_LEVEL_CAP) ?? ""); }
                else { setSpecialsOpen(true); pickClass(BONUS_LEVEL_ID); }
              }}
                title="Nível que conta pro total mas não pertence a nenhuma classe — sem PV/PE, sem habilidade de classe. Também é aqui que aparecem as classes Especiais (Caminho e Profecia)."
                style={{ padding: "8px 14px", border: `1px dashed ${specialsOpen ? SW.gold : "var(--border)"}`, background: specialsOpen ? "rgba(201,148,31,0.14)" : "rgba(255,255,255,0.02)", color: specialsOpen ? SW.gold : "var(--text)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, borderRadius: 6 }}>
                ✦ Bônus <span style={{ color: SW.textSubtle, fontWeight: 400 }}>(sem classe)</span>
              </button>
            </div>

            {!specialsOpen && newClassOptions.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <p style={{ fontSize: "0.66rem", color: SW.textSubtle, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                  Multiclasse {freeWindow
                    ? <span style={{ color: SW.gold }}>· janela grátis neste nível!</span>
                    : <span style={{ color: canAddNewClass ? SW.textSubtle : SW.danger }}>· exige {expertRequired} Expert (você tem {expertCount})</span>}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {newClassOptions.map((c) => (
                    <button key={c.id} disabled={c.disabled} onClick={() => pickClass(c.id)}
                      title={c.hint}
                      style={{ padding: "8px 14px", border: `1px solid ${classId === c.id ? SW.accentBord : "var(--border)"}`, background: classId === c.id ? SW.accentDim : "rgba(255,255,255,0.02)", color: c.disabled ? SW.textSubtle : classId === c.id ? SW.accentBright : "var(--text)", cursor: c.disabled ? "not-allowed" : "pointer", opacity: c.disabled ? 0.5 : 1, fontSize: "0.8rem", fontWeight: 700, borderRadius: 6 }}>
                      + {c.name} <span style={{ fontWeight: 400, color: SW.textSubtle }}>({c.hint})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {specialsOpen && (
              <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(201,148,31,0.05)", border: `1px solid ${SW.gold}44`, borderRadius: 8 }}>
                <p style={{ fontSize: "0.66rem", color: SW.gold, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                  Especiais — Caminho e Profecia
                </p>

                {specialOptions.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: lockedProphecyIds.length > 0 ? 12 : 0 }}>
                    {specialOptions.map((c) => {
                      const button = (
                        <button key={c.id} disabled={c.disabled} onClick={() => pickClass(c.id)}
                          title={c.hint}
                          style={{ padding: "8px 14px", border: `1px solid ${classId === c.id ? SW.gold : "var(--border)"}`, background: classId === c.id ? "rgba(201,148,31,0.14)" : "rgba(255,255,255,0.02)", color: c.disabled ? SW.textSubtle : classId === c.id ? SW.gold : "var(--text)", cursor: c.disabled ? "not-allowed" : "pointer", opacity: c.disabled ? 0.5 : 1, fontSize: "0.8rem", fontWeight: 700, borderRadius: 6 }}>
                          + {c.name} <span style={{ fontWeight: 400, color: SW.textSubtle }}>({c.hint})</span>
                        </button>
                      );
                      return justUnlocked[c.id] ? <AnimatedReveal key={c.id}>{button}</AnimatedReveal> : button;
                    })}
                  </div>
                )}

                {!pathReady && (
                  <p style={{ fontSize: "0.72rem", color: SW.textSubtle, marginBottom: lockedProphecyIds.length > 0 ? 10 : 0 }}>
                    O Lado da Luz, O Equilíbrio e O Lado Negro liberam com nível {PATH_CLASS_UNLOCK_LEVEL} em Padawan Jedi, Acólito Sith ou Andarilho da Força.
                  </p>
                )}

                {lockedProphecyIds.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {lockedProphecyIds.map((id) => (
                      <div key={id}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <input
                            value={passwordInputs[id] ?? ""}
                            onChange={(e) => setPasswordInputs((p) => ({ ...p, [id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") tryUnlockProphecy(id); }}
                            placeholder={`Senha — ${CLASS_BY_ID[id]?.name ?? id}`}
                            style={{ flex: 1, padding: "7px 10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.8rem", borderRadius: 6 }}
                          />
                          <button onClick={() => tryUnlockProphecy(id)} style={{ padding: "7px 14px", background: "rgba(201,148,31,0.12)", border: `1px solid ${SW.gold}66`, color: SW.gold, cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, borderRadius: 6, whiteSpace: "nowrap" }}>
                            Revelar
                          </button>
                        </div>
                        {passwordError[id] && <p style={{ fontSize: "0.7rem", color: SW.danger, marginTop: 4 }}>{passwordError[id]}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isNewClass && cls && (
              <p style={{ fontSize: "0.76rem", color: SW.gold, marginTop: 8 }}>
                Nova classe: {cls.name} ({ARCHETYPE_LABEL[cls.archetype]}) começa no nível 1 dela — ganha o PV/PE base da classe, a habilidade de nível 1 e +1 atributo. Evento isolado, ignora as regras normais de subida desse nível.
              </p>
            )}
            {isBonus && (
              <p style={{ fontSize: "0.76rem", color: SW.textSubtle, marginTop: 8 }}>
                Nível Bônus: soma no nível total (até {MAX_LEVEL}), mas não pertence a nenhuma classe — sem PV/PE nem Habilidade de Classe, só PP e a evolução de perícia/atributo.
              </p>
            )}
          </div>
        )}

        {step === 1 && !isNewClass && (
          <div>
            <FieldLabel>O que sobe neste nível</FieldLabel>
            <p style={{ fontSize: "0.78rem", color: SW.textMuted, marginTop: 8, marginBottom: 12 }}>
              Todo nível sobe Vida, Energia da Força e Pontos de Poder.
              {milestone5 && " Este também é múltiplo de 5."}
              {milestone10 && " E múltiplo de 10."}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {!isBonus && <span style={{ padding: "8px 14px", background: SW.accentDim, border: `1px solid ${SW.accentBord}`, borderRadius: 6, color: SW.accentBright, fontSize: "0.82rem", fontWeight: 700 }}>Vida sobe {levelUpGain(classId, 0, 0, toLevelInClass).pv}+Vig</span>}
              {!isBonus && <span style={{ padding: "8px 14px", background: SW.accentDim, border: `1px solid ${SW.accentBord}`, borderRadius: 6, color: SW.accentBright, fontSize: "0.82rem", fontWeight: 700 }}>Energia da Força sobe</span>}
              <span style={{ padding: "8px 14px", background: "rgba(201,148,31,0.12)", border: `1px solid ${SW.gold}66`, borderRadius: 6, color: SW.gold, fontSize: "0.82rem", fontWeight: 700 }}>Pontos de Poder sobe</span>
              {isBonus && <span style={{ fontSize: "0.78rem", color: SW.textSubtle }}>Nível Bônus: sem Vida/Energia da Força, só PP.</span>}
            </div>
          </div>
        )}

        {step === 2 && !isNewClass && (
          <div>
            <FieldLabel>Escolha obrigatória: {MANDATORY_LABEL[mandatoryKind]}</FieldLabel>
            <div style={{ marginTop: 10 }}>
              {mandatoryKind === "habilidade_classe" && (
                <AbilityPicker abilities={nextAbilities} selected={classPowerName} onPick={setClassPowerName} />
              )}
              {mandatoryKind === "grau_pericia" && (
                <Dropdown value={mandatorySkillId ?? ""} onChange={(v) => setMandatorySkillId(v || null)} options={skillDropdownOptions(SKILLS)} />
              )}
              {mandatoryKind === "atributo" && (
                <>
                  <p style={{ fontSize: "0.74rem", color: SW.textMuted, marginBottom: 8 }}>Nenhuma Habilidade de Classe nem perícia disponível neste nível (todas em grau Mestre) — sobra atributo.</p>
                  <AttrGrid value={mandatoryAttrKey} onPick={setMandatoryAttrKey} />
                </>
              )}
            </div>
          </div>
        )}

        {step === 3 && !isNewClass && milestone5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <FieldLabel>Múltiplo de 5 — mais uma Perícia</FieldLabel>
              <div style={{ marginTop: 10 }}>
                {nonMaxSkills.length > 0
                  ? <Dropdown value={milestoneSkillId ?? ""} onChange={(v) => setMilestoneSkillId(v || null)} options={skillDropdownOptions(SKILLS)} />
                  : <p style={{ fontSize: "0.76rem", color: SW.textSubtle }}>Todas as perícias já estão no grau máximo.</p>}
              </div>
            </div>
            <div>
              <FieldLabel>Múltiplo de 5 — Poder Geral</FieldLabel>
              <div style={{ marginTop: 10 }}>
                {hasPoderGeral
                  ? <PowerPicker selected={milestonePowerId} onPick={setMilestonePowerId} existingGeneralPowers={existingGeneralPowers} />
                  : <p style={{ fontSize: "0.76rem", color: SW.textSubtle }}>Todos os 50 Poderes Gerais já foram aprendidos.</p>}
              </div>
            </div>
          </div>
        )}

        {step === 4 && !isNewClass && milestone10 && (
          <div>
            <FieldLabel>Múltiplo de 10 — mais +1 Atributo</FieldLabel>
            <div style={{ marginTop: 10 }}>
              <AttrGrid value={milestoneAttrKey} onPick={setMilestoneAttrKey} />
            </div>
          </div>
        )}

        {step === LAST_STEP && (
          <div>
            {isNewClass ? (
              <>
                <FieldLabel>Habilidade de nível 1 — {cls?.name}</FieldLabel>
                <AbilityPicker abilities={newClassFirstAbilities} selected={classPowerName} onPick={setClassPowerName} />
                <FieldLabel>+1 Atributo (bônus de multiclasse)</FieldLabel>
                <div style={{ marginTop: 10 }}>
                  <AttrGrid value={multiclassAttrKey} onPick={setMulticlassAttrKey} />
                </div>
              </>
            ) : (
              <>
                <FieldLabel>Resumo</FieldLabel>
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6, fontSize: "0.82rem", color: "var(--text)" }}>
                  <p>Classe: <strong>{isBonus ? "Bônus (sem classe)" : cls?.name}</strong></p>
                  <p>Sobe: {[!isBonus && "Vida", !isBonus && "Energia da Força", "Pontos de Poder"].filter(Boolean).join(", ")}</p>
                  <p>{MANDATORY_LABEL[mandatoryKind]}: {
                    mandatoryKind === "habilidade_classe" ? classPowerName ?? "—"
                    : mandatoryKind === "grau_pericia" ? SKILLS.find((s) => s.id === mandatorySkillId)?.name ?? "—"
                    : mandatoryAttrKey ? ATTR_LABEL[mandatoryAttrKey] : "—"
                  }</p>
                  {milestone5 && (
                    <p>Múltiplo de 5: {SKILLS.find((s) => s.id === milestoneSkillId)?.name ?? "—"} + {GENERAL_POWER_BY_ID[milestonePowerId ?? ""]?.name ?? "—"}</p>
                  )}
                  {milestone10 && (
                    <p>Múltiplo de 10: {milestoneAttrKey ? ATTR_LABEL[milestoneAttrKey] : "—"}</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {error && <p style={{ fontSize: "0.78rem", color: SW.danger }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <button onClick={step === 0 ? onClose : goBack} style={{ padding: "9px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", fontSize: "0.84rem", borderRadius: 6 }}>
            {step === 0 ? "Cancelar" : "← Voltar"}
          </button>
          {step < LAST_STEP ? (
            <button onClick={goNext} style={{ padding: "9px 22px", background: `linear-gradient(135deg, ${SW.accentLight} 0%, ${SW.accent} 100%)`, border: "none", color: "#04070c", fontWeight: 800, cursor: "pointer", fontSize: "0.84rem", borderRadius: 6, boxShadow: `0 0 18px ${SW.glow}` }}>
              Próximo →
            </button>
          ) : (
            <button onClick={submit} disabled={saving || !canSubmit} style={{ padding: "9px 22px", background: `linear-gradient(135deg, ${SW.accentLight} 0%, ${SW.accent} 100%)`, border: "none", color: "#04070c", fontWeight: 800, cursor: saving ? "wait" : "pointer", fontSize: "0.84rem", borderRadius: 6, boxShadow: `0 0 18px ${SW.glow}`, opacity: canSubmit ? 1 : 0.5 }}>
              {saving ? "Salvando…" : "Confirmar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
