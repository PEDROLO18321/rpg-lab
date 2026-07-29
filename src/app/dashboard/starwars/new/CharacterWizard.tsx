"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SPECIES_BY_ID } from "@/lib/starwars/species";
import { CLASS_BY_ID } from "@/lib/starwars/classes";
import { attrPointsRemaining, type AttrKey, type StarWarsAttrs, type Path } from "@/lib/starwars/data";
import { finalAttrs, trainedSkillCount, planetSkillNeedsChoice } from "@/lib/starwars/creation";
import { getClassAbilities } from "@/lib/starwars/powers/registry";
import { SW, PrimaryButton, GhostButton } from "../ui";
import { StepSpecies } from "./steps/StepSpecies";
import { StepPlanet } from "./steps/StepPlanet";
import { StepPath } from "./steps/StepPath";
import { StepClass } from "./steps/StepClass";
import { StepAttrs } from "./steps/StepAttrs";
import { StepSkills } from "./steps/StepSkills";
import { StepDesc } from "./steps/StepDesc";
import { StepReview } from "./steps/StepReview";

export const ACCENT       = SW.accent;
export const ACCENT_LIGHT = SW.accentLight;
export const ACCENT_DIM   = SW.accentDim;
export const ACCENT_BORD  = SW.accentBord;

const STEPS = [
  { id: "species", label: "Espécie",  num: "01" },
  { id: "planet",  label: "Planeta",  num: "02" },
  { id: "path",    label: "Caminho",  num: "03" },
  { id: "class",   label: "Classe",   num: "04" },
  { id: "attrs",   label: "Atributos", num: "05" },
  { id: "skills",  label: "Perícias", num: "06" },
  { id: "desc",    label: "Descrição", num: "07" },
  { id: "review",  label: "Revisão",  num: "08" },
];

export interface DescData {
  organization: string;
  appearance:   string;
  personality:  string;
  history:      string;
  objective:    string;
}

export interface WizardData {
  charName:      string;
  speciesId:     string;
  humanChoice:   { plus2: AttrKey[]; plus1: AttrKey[]; minus1: AttrKey[] };
  planetId:      string;
  planetSkillChoice: string;
  pathId:        Path;
  classId:       string;
  classAbilityChoice: string; // habilidade de nível 1 escolhida (quando a classe oferece mais de uma opção)
  attrBases:     StarWarsAttrs;
  skillChoices:  string[]; // ids das perícias que viram Iniciante
  desc:          Partial<DescData>;
}

const DEFAULT_ATTRS: StarWarsAttrs = { agi: 0, int: 0, forca: 0, vig: 0, pre: 0, sen: 0 };
const DEFAULT_HUMAN_CHOICE = { plus2: [] as AttrKey[], plus1: [] as AttrKey[], minus1: [] as AttrKey[] };

interface Props { userId: string; systemId: string }

export function CharacterWizard({ userId, systemId }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<WizardData>>({ attrBases: DEFAULT_ATTRS, humanChoice: DEFAULT_HUMAN_CHOICE });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function patch(partial: Partial<WizardData>) {
    setData((prev) => ({
      ...prev,
      ...partial,
      ...(partial.desc ? { desc: { ...prev.desc, ...partial.desc } } : {}),
    }));
  }

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [step]);

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  const species = data.speciesId ? SPECIES_BY_ID[data.speciesId] : undefined;
  const cls = data.classId ? CLASS_BY_ID[data.classId] : undefined;

  const attrsFinal = useMemo(() => {
    if (!data.speciesId) return data.attrBases ?? DEFAULT_ATTRS;
    return finalAttrs(data.attrBases ?? DEFAULT_ATTRS, data.speciesId, data.humanChoice ?? DEFAULT_HUMAN_CHOICE);
  }, [data.attrBases, data.speciesId, data.humanChoice]);

  const skillCount = useMemo(() => {
    if (!data.classId) return 0;
    return trainedSkillCount(data.classId, attrsFinal.int);
  }, [data.classId, attrsFinal]);

  const canAdvance = useMemo(() => {
    if (step === 0) {
      if (!data.charName?.trim() || !species) return false;
      if (species.attrFreeChoice) {
        const hc = data.humanChoice ?? DEFAULT_HUMAN_CHOICE;
        if (hc.plus2.length !== species.attrFreeChoice.plus2) return false;
        if (hc.plus1.length !== species.attrFreeChoice.plus1) return false;
        if (hc.minus1.length !== species.attrFreeChoice.minus1) return false;
      }
      return true;
    }
    if (step === 1) return !!data.planetId && (!planetSkillNeedsChoice(data.planetId) || !!data.planetSkillChoice);
    if (step === 2) return !!data.pathId;
    if (step === 3) {
      if (!cls) return false;
      const firstAbilities = getClassAbilities(cls.id).filter((a) => a.level === 1);
      if (firstAbilities.length > 1) return !!data.classAbilityChoice;
      return true;
    }
    if (step === 4) return attrPointsRemaining(data.attrBases ?? DEFAULT_ATTRS) === 0;
    if (step === 5) return (data.skillChoices?.length ?? 0) === skillCount;
    return true;
  }, [step, data, species, cls, skillCount]);

  async function finish() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/starwars/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId, systemId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar");
      router.push(`/dashboard/starwars/${json.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
      setSaving(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: `1px solid ${SW.panelBorder}`, background: "rgba(5,7,13,0.92)", backdropFilter: "blur(20px)" }}>
        <div className="sw-wizard-header-inner" style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: SW.textMuted, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: 0 }}>
            ← Cancelar
          </button>
          <span className="sw-wizard-header-title" style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.86rem", fontWeight: 700, color: "var(--text)", letterSpacing: "0.03em" }}>
            <span style={{ color: SW.accentLight }}>NOVO PERSONAGEM</span> · Star Wars: Além da Fronteira
          </span>
          <span style={{ fontSize: "0.74rem", color: SW.textMuted, fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.05em" }}>{STEPS[step].num}/08</span>
        </div>
        <div style={{ height: 2, background: "rgba(255,255,255,0.05)" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${SW.accent}, ${SW.accentBright})`, boxShadow: `0 0 8px ${SW.glow}`, transition: "width 0.4s ease" }} />
        </div>
      </header>

      <div style={{ borderBottom: `1px solid ${SW.panelBorder}`, background: "rgba(255,255,255,0.015)", overflowX: "auto" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0 }}>
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <button key={s.id} onClick={() => i < step && setStep(i)} disabled={i > step}
                style={{ padding: "13px 16px", background: "none", border: "none", borderBottom: current ? `2px solid ${SW.accentBright}` : "2px solid transparent", color: current ? SW.accentBright : done ? SW.textMuted : SW.textSubtle, fontSize: "0.76rem", fontWeight: current ? 800 : 500, cursor: i <= step ? "pointer" : "default", whiteSpace: "nowrap", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 7, letterSpacing: "0.02em" }}>
                <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.62rem", opacity: 0.7 }}>{done ? "✓" : s.num}</span>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <main style={{ flex: 1, maxWidth: 960, width: "100%", margin: "0 auto", padding: "44px 24px 110px" }}>
        {step === 0 && (
          <StepSpecies
            charName={data.charName ?? ""}
            speciesId={data.speciesId ?? null}
            humanChoice={data.humanChoice ?? DEFAULT_HUMAN_CHOICE}
            onChange={patch}
          />
        )}
        {step === 1 && (
          <StepPlanet planetId={data.planetId ?? null} planetSkillChoice={data.planetSkillChoice ?? null} onChange={patch} />
        )}
        {step === 2 && (
          <StepPath pathId={data.pathId ?? null} onChange={patch} />
        )}
        {step === 3 && (
          <StepClass classId={data.classId ?? null} classAbilityChoice={data.classAbilityChoice ?? null} onChange={patch} />
        )}
        {step === 4 && (
          <StepAttrs attrBases={data.attrBases ?? DEFAULT_ATTRS} attrsFinal={attrsFinal} speciesId={data.speciesId ?? null} onChange={patch} />
        )}
        {step === 5 && (
          <StepSkills
            classId={data.classId ?? null}
            speciesId={data.speciesId ?? null}
            planetId={data.planetId ?? null}
            planetSkillChoice={data.planetSkillChoice ?? null}
            skillCount={skillCount}
            skillChoices={data.skillChoices ?? []}
            onChange={patch}
          />
        )}
        {step === 6 && (
          <StepDesc desc={data.desc ?? {}} onChange={patch} />
        )}
        {step === 7 && (
          <StepReview data={data} attrsFinal={attrsFinal} skillCount={skillCount} />
        )}
      </main>

      <div className="sw-wizard-footer" style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: `1px solid ${SW.panelBorder}`, background: "rgba(5,7,13,0.95)", backdropFilter: "blur(20px)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 40 }}>
        <GhostButton onClick={back} disabled={step === 0}>← Anterior</GhostButton>

        {step < STEPS.length - 1 ? (
          <PrimaryButton onClick={next} disabled={!canAdvance}>Próximo →</PrimaryButton>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {saveError && <p style={{ fontSize: "0.75rem", color: SW.danger, margin: 0 }}>{saveError}</p>}
            <PrimaryButton onClick={finish} disabled={saving}>{saving ? "Salvando…" : "Criar Personagem"}</PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
