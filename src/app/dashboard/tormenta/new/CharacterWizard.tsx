"use client";

import "../tormenta-responsive.css";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RACE_BY_ID } from "@/lib/tormenta/races";
import { CLASS_BY_ID } from "@/lib/tormenta/classes";
import { ORIGIN_BY_ID } from "@/lib/tormenta/origins";
import { attrMod, POINT_BUY_TOTAL, type AttrKey, type TormentaAttrs } from "@/lib/tormenta/data";
import { pointBuyCost } from "@/lib/tormenta/data";
import { resolveClassFixedSkills } from "@/lib/tormenta/creation";
import { StepRace } from "./steps/StepRace";
import { StepClass } from "./steps/StepClass";
import { StepOrigin } from "./steps/StepOrigin";
import { StepAttrs } from "./steps/StepAttrs";
import { StepSpells } from "./steps/StepSpells";
import { StepEquipment } from "./steps/StepEquipment";
import { StepDesc } from "./steps/StepDesc";
import { StepReview } from "./steps/StepReview";

export const ACCENT       = "#a01818";
export const ACCENT_LIGHT = "#c94040";
export const ACCENT_DIM   = "rgba(160,24,24,0.12)";
export const ACCENT_BORD  = "rgba(160,24,24,0.35)";

const STEPS = [
  { id: "race",      label: "Raça"       },
  { id: "class",     label: "Classe"     },
  { id: "origin",    label: "Origem"     },
  { id: "attrs",     label: "Atributos"  },
  { id: "spells",    label: "Magias"     },
  { id: "equipment", label: "Equipamento"},
  { id: "desc",      label: "Descrição"  },
  { id: "review",    label: "Revisão"    },
];

export interface DescData {
  appearance:  string;
  personality: string;
  history:     string;
  objective:   string;
}

export interface WizardData {
  charName:             string;
  raceId:                string;
  raceVariantId:          string;
  racialAttrChoices:      AttrKey[];
  classId:                string;
  pathId:                 string;
  schoolsChosen:          string[];
  godId:                  string | null;
  originId:               string;
  originSkillChoices:     string[];
  classSkillChoices:      string[];
  classFixedChoice:       Record<string, string>;
  intBonusSkillChoices:   string[];
  attrBases:              TormentaAttrs;
  selectedSpells:         string[];
  weaponId:               string;
  armorId:                string;
  shieldId:               string;
  desc:                   Partial<DescData>;
}

const DEFAULT_ATTRS: TormentaAttrs = { for: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 };

interface Props { userId: string; systemId: string }

export function CharacterWizard({ userId, systemId }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<WizardData>>({ attrBases: DEFAULT_ATTRS });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function patch(partial: Partial<WizardData>) {
    setData((prev) => ({
      ...prev,
      ...partial,
      ...(partial.desc ? { desc: { ...prev.desc, ...partial.desc } } : {}),
      ...(partial.classFixedChoice ? { classFixedChoice: { ...prev.classFixedChoice, ...partial.classFixedChoice } } : {}),
    }));
  }

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [step]);

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  const race = data.raceId ? RACE_BY_ID[data.raceId] : undefined;
  const cls  = data.classId ? CLASS_BY_ID[data.classId] : undefined;
  const origin = data.originId ? ORIGIN_BY_ID[data.originId] : undefined;

  const canAdvance = useMemo(() => {
    if (step === 0) {
      if (!data.charName?.trim() || !race) return false;
      if (race.variants && !data.raceVariantId) return false;
      if (race.attrChoiceBonus && (data.racialAttrChoices?.length ?? 0) < race.attrChoiceBonus.count) return false;
      return true;
    }
    if (step === 1) {
      if (!cls) return false;
      if (cls.paths && !data.pathId) return false;
      if (cls.spellcasting?.schoolChoiceCount && (data.schoolsChosen?.length ?? 0) < cls.spellcasting.schoolChoiceCount) return false;
      if (cls.godChoice && !cls.godChoice.allowNone && !data.godId) return false;
      return true;
    }
    if (step === 2) {
      if (!origin) return false;
      return (data.originSkillChoices?.length ?? 0) >= origin.chooseCount;
    }
    if (step === 3) {
      const attrs = data.attrBases ?? DEFAULT_ATTRS;
      if (pointBuyCost(attrs) !== POINT_BUY_TOTAL) return false;
      if (!cls) return false;
      const fixedNeedsChoice = cls.skillsFixed.some((f) => f.includes("|") && !data.classFixedChoice?.[f]);
      if (fixedNeedsChoice) return false;
      if ((data.classSkillChoices?.length ?? 0) < cls.skillChoiceCount) return false;
      const intMod = Math.max(0, attrMod(attrs.int));
      if ((data.intBonusSkillChoices?.length ?? 0) < intMod) return false;
      return true;
    }
    if (step === 4) {
      if (!cls?.spellcasting) return true;
      return (data.selectedSpells?.length ?? 0) >= cls.spellcasting.startingSpells;
    }
    if (step === 5) {
      return !!data.weaponId;
    }
    return true;
  }, [step, data, race, cls, origin]);

  async function finish() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/tormenta/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId, systemId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar");
      router.push(`/dashboard/tormenta/${json.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
      setSaving(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const resolvedClassFixed = cls ? resolveClassFixedSkills(cls.id, data.classFixedChoice ?? {}) : [];

  return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)", background: "rgba(7,9,15,0.90)", backdropFilter: "blur(20px)" }}>
        <div className="tm-wizard-header-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: 0 }}>
            ← Cancelar
          </button>
          <span className="tm-wizard-header-title" style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>
            Novo Herói · Tormenta 20
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{step + 1}/{STEPS.length}</span>
        </div>
        <div style={{ height: 2, background: "var(--border)" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT_LIGHT}, ${ACCENT})`, transition: "width 0.4s ease" }} />
        </div>
      </header>

      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", overflowX: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0 }}>
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <button key={s.id} onClick={() => i < step && setStep(i)} disabled={i > step}
                style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: current ? `2px solid ${ACCENT}` : "2px solid transparent", color: current ? ACCENT_LIGHT : done ? "var(--text-muted)" : "var(--text-subtle)", fontSize: "0.78rem", fontWeight: current ? 700 : 500, cursor: i <= step ? "pointer" : "default", whiteSpace: "nowrap", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
                {done && <span style={{ color: ACCENT, fontSize: "0.7rem" }}>✓</span>}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <main style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "40px 24px 100px" }}>
        {step === 0 && (
          <StepRace
            raceId={data.raceId ?? null}
            raceVariantId={data.raceVariantId ?? null}
            racialAttrChoices={data.racialAttrChoices ?? []}
            charName={data.charName ?? ""}
            onChange={patch}
          />
        )}
        {step === 1 && (
          <StepClass
            classId={data.classId ?? null}
            pathId={data.pathId ?? null}
            schoolsChosen={data.schoolsChosen ?? []}
            godId={data.godId ?? null}
            onChange={patch}
          />
        )}
        {step === 2 && (
          <StepOrigin
            originId={data.originId ?? null}
            originSkillChoices={data.originSkillChoices ?? []}
            onChange={patch}
          />
        )}
        {step === 3 && (
          <StepAttrs
            attrBases={data.attrBases ?? DEFAULT_ATTRS}
            classId={data.classId ?? null}
            originId={data.originId ?? null}
            classFixedChoice={data.classFixedChoice ?? {}}
            classSkillChoices={data.classSkillChoices ?? []}
            originSkillChoices={data.originSkillChoices ?? []}
            intBonusSkillChoices={data.intBonusSkillChoices ?? []}
            resolvedClassFixed={resolvedClassFixed}
            onChange={patch}
          />
        )}
        {step === 4 && (
          <StepSpells
            classId={data.classId ?? null}
            pathId={data.pathId ?? null}
            schoolsChosen={data.schoolsChosen ?? []}
            selectedSpells={data.selectedSpells ?? []}
            onChange={patch}
          />
        )}
        {step === 5 && (
          <StepEquipment
            classId={data.classId ?? null}
            weaponId={data.weaponId ?? null}
            armorId={data.armorId ?? null}
            shieldId={data.shieldId ?? null}
            onChange={patch}
          />
        )}
        {step === 6 && (
          <StepDesc desc={data.desc ?? {}} onChange={patch} />
        )}
        {step === 7 && (
          <StepReview data={data} />
        )}
      </main>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1px solid var(--border)", background: "rgba(7,9,15,0.95)", backdropFilter: "blur(20px)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 40 }}>
        <button onClick={back} disabled={step === 0} style={{ padding: "10px 24px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: step === 0 ? "var(--text-subtle)" : "var(--text)", fontSize: "0.86rem", fontWeight: 600, cursor: step === 0 ? "default" : "pointer" }}>
          ← Anterior
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={next} disabled={!canAdvance} style={{ padding: "10px 28px", background: canAdvance ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)` : "var(--surface-2)", border: "none", borderRadius: "var(--radius)", color: canAdvance ? "#fff" : "var(--text-subtle)", fontSize: "0.86rem", fontWeight: 700, cursor: canAdvance ? "pointer" : "default", boxShadow: canAdvance ? `0 0 20px ${ACCENT_DIM}` : "none" }}>
            Próximo →
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {saveError && <p style={{ fontSize: "0.75rem", color: "#f87171", margin: 0 }}>{saveError}</p>}
            <button onClick={finish} disabled={saving} style={{ padding: "10px 28px", background: `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`, border: "none", borderRadius: "var(--radius)", color: "#fff", fontSize: "0.86rem", fontWeight: 700, cursor: saving ? "wait" : "pointer", boxShadow: `0 0 20px ${ACCENT_DIM}` }}>
              {saving ? "Salvando…" : "Criar Herói"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
