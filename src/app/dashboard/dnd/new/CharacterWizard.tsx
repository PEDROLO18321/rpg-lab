"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RACES } from "@/lib/dnd/races";
import { CLASSES } from "@/lib/dnd/classes";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import { parseEquipmentLine, isCurrencyItem } from "@/lib/dnd/equipmentParser";
import type { AbilityKey } from "@/lib/dnd/races";
import { StepRace } from "./steps/StepRace";
import { StepClass } from "./steps/StepClass";
import { StepBackground } from "./steps/StepBackground";
import { StepAttrs } from "./steps/StepAttrs";
import { StepDesc } from "./steps/StepDesc";
import { StepEquipment } from "./steps/StepEquipment";
import { StepSpells } from "./steps/StepSpells";
import { StepReview } from "./steps/StepReview";
import { SPELLCASTING } from "@/lib/dnd/spells";

const STEPS = [
  { id: "race",       label: "Raça"        },
  { id: "class",      label: "Classe"      },
  { id: "background", label: "Antecedente" },
  { id: "attrs",      label: "Atributos"   },
  { id: "desc",       label: "Descrição"   },
  { id: "equipment",  label: "Equipamento" },
  { id: "spells",     label: "Magias"      },
  { id: "review",     label: "Revisão"     },
];

export interface DescData {
  alignment:        string;
  age:              string;
  height:           string;
  weight:           string;
  eyes:             string;
  skin:             string;
  hair:             string;
  personalityTrait: string;
  ideal:            string;
  bond:             string;
  flaw:             string;
  backstory:        string;
}

export interface WizardData {
  raceId:               string;
  subraceId:            string;
  charName:             string;
  classId:              string;
  subclassId:           string;
  backgroundId:         string;
  abilityBases:         Record<AbilityKey, number>;
  selectedSkills:       string[];
  racialAbilityBonuses: Partial<Record<AbilityKey, number>>;
  selectedRacialSkills: string[];
  desc:                 Partial<DescData>;
  equipmentChoices:     Record<string, string>;
  selectedCantrips:     string[];
  selectedSpells:       string[];
  selectedLanguages:    string[];
}

interface Props {
  userId:   string;
  systemId: string;
}

export function CharacterWizard({ userId, systemId }: Props) {
  const router  = useRouter();
  const [step,  setStep]  = useState(0);
  const [data,  setData]  = useState<Partial<WizardData>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function patch(partial: Partial<WizardData>) {
    setData((prev) => ({
      ...prev,
      ...partial,
      // deep-merge nested objects so individual fields don't reset
      ...(partial.desc             ? { desc:             { ...prev.desc,             ...partial.desc             } } : {}),
      ...(partial.equipmentChoices ? { equipmentChoices: { ...prev.equipmentChoices, ...partial.equipmentChoices } } : {}),
    }));
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  // Pré-carrega todos os bundles Three.js assim que o wizard monta,
  // antes de qualquer navegação entre steps, eliminando o flash de carregamento.
  useEffect(() => {
    import("@/components/three/RaceMorphScene");
    import("@/components/three/ClassOrbViews");
    import("@/components/three/BackgroundIconViews");
  }, []);

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  const canAdvance = useMemo(() => {
    if (step === 0) {
      if (!data.charName?.trim()) return false;
      if (!data.raceId) return false;
      const race = RACES.find((r) => r.id === data.raceId);
      if ((race?.subraces.length ?? 0) > 1 && !data.subraceId) return false;
      if (race?.abilityBonusChoices) {
        const chosen = Object.keys(data.racialAbilityBonuses ?? {}).length;
        if (chosen < race.abilityBonusChoices.count) return false;
      }
      if (race?.racialSkills) {
        if ((data.selectedRacialSkills?.length ?? 0) < race.racialSkills.count) return false;
      }
      return true;
    }
    if (step === 1) {
      if (!data.classId) return false;
      const cls = CLASSES.find((c) => c.id === data.classId);
      if ((cls?.subclasses?.length ?? 0) > 0 && !data.subclassId) return false;
      return true;
    }
    if (step === 2) return !!data.backgroundId;
    if (step === 3) {
      const cls = CLASSES.find((c) => c.id === data.classId);
      const skillsDone = (data.selectedSkills?.length ?? 0) >= (cls?.skillCount ?? 1);
      const attrsDone = Object.keys(data.abilityBases ?? {}).length === 6;
      return skillsDone && attrsDone;
    }
    if (step === 4) return !!data.desc?.alignment;
    if (step === 5) {
      // Equipamento inicial obrigatório: toda escolha (e sub-escolha) preenchida
      const choices = data.equipmentChoices ?? {};
      const cls = CLASSES.find((c) => c.id === data.classId);
      const bg  = BACKGROUNDS.find((b) => b.id === data.backgroundId);
      const sources: [string, string[]][] = [
        ["cls", cls?.startingEquipment ?? []],
        ["bg",  bg?.startingEquipment ?? []],
      ];
      for (const [prefix, items] of sources) {
        for (let idx = 0; idx < items.length; idx++) {
          const line = parseEquipmentLine(items[idx]);
          if (line.type !== "choice") continue;
          if (isCurrencyItem(items[idx])) continue;
          const selected = choices[`${prefix}_${idx}`];
          if (!selected) return false;
          const opt = line.choices.find((c) => c.letter === selected);
          if (opt?.sub) {
            for (let k = 0; k < opt.sub.count; k++) {
              if (!choices[`${prefix}_${idx}_${selected}_${k}`]) return false;
            }
          }
        }
      }
      return true;
    }
    if (step === 6) {
      const config = data.classId ? SPELLCASTING[data.classId] : null;
      if (!config) return true; // non-caster, skip
      const cantripsDone = (data.selectedCantrips?.length ?? 0) >= config.cantripsKnown;
      const spellsDone   = (data.selectedSpells?.length   ?? 0) >= config.spellsKnown;
      return cantripsDone && spellsDone;
    }
    return true;
  }, [step, data]);

  async function finish() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/dnd/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId, systemId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar");
      router.push(`/dashboard/dnd/${json.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar");
      setSaving(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--border)",
          background: "rgba(7,9,15,0.90)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: 0,
            }}
          >
            ← Cancelar
          </button>
          <span
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Novo Personagem · D&amp;D 5e
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {step + 1}/{STEPS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: "var(--border)" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--accent-light), var(--accent))",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </header>

      {/* Step tabs */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            gap: 0,
          }}
        >
          {STEPS.map((s, i) => {
            const done    = i < step;
            const current = i === step;
            return (
              <button
                key={s.id}
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                style={{
                  padding: "12px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: current ? "2px solid var(--accent)" : "2px solid transparent",
                  color: current ? "var(--accent-light)" : done ? "var(--text-muted)" : "var(--text-subtle)",
                  fontSize: "0.78rem",
                  fontWeight: current ? 700 : 500,
                  cursor: i <= step ? "pointer" : "default",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {done && <span style={{ color: "var(--accent)", fontSize: "0.7rem" }}>✓</span>}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <main style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "40px 24px 100px" }}>
        {step === 0 && (
          <StepRace
            selected={data.raceId ?? null}
            selectedSubrace={data.subraceId ?? null}
            charName={data.charName ?? ""}
            racialAbilityBonuses={data.racialAbilityBonuses ?? {}}
            selectedRacialSkills={data.selectedRacialSkills ?? []}
            onChange={patch}
          />
        )}
        {step === 1 && (
          <StepClass
            selected={data.classId ?? null}
            subclassId={data.subclassId}
            onChange={patch}
          />
        )}
        {step === 2 && (
          <StepBackground
            selected={data.backgroundId ?? null}
            onChange={patch}
          />
        )}
        {step === 3 && (
          <StepAttrs
            raceId={data.raceId ?? null}
            subraceId={data.subraceId ?? null}
            classId={data.classId ?? null}
            backgroundId={data.backgroundId ?? null}
            bases={data.abilityBases ?? {}}
            selectedSkills={data.selectedSkills ?? []}
            onChange={patch}
          />
        )}
        {step === 4 && (
          <StepDesc
            backgroundId={data.backgroundId ?? null}
            raceId={data.raceId ?? null}
            subraceId={data.subraceId ?? null}
            desc={data.desc ?? {}}
            selectedLanguages={data.selectedLanguages ?? []}
            onChange={patch}
          />
        )}
        {step === 5 && (
          <StepEquipment
            classId={data.classId ?? null}
            backgroundId={data.backgroundId ?? null}
            equipmentChoices={data.equipmentChoices ?? {}}
            onChange={patch}
          />
        )}
        {step === 6 && (
          <StepSpells
            classId={data.classId ?? null}
            selectedCantrips={data.selectedCantrips ?? []}
            selectedSpells={data.selectedSpells ?? []}
            onChange={patch}
          />
        )}
        {step === 7 && (
          <StepReview data={data} />
        )}
        {step > 7 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "80px 24px",
              gap: 12,
              color: "var(--text-muted)",
              fontSize: "0.9rem",
            }}
          >
            <span style={{ fontSize: "1.4rem", color: "var(--text-subtle)" }}>—</span>
            Em construção — {STEPS[step].label}
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: "1px solid var(--border)",
          background: "rgba(7,9,15,0.95)",
          backdropFilter: "blur(20px)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 40,
        }}
      >
        <button
          onClick={back}
          disabled={step === 0}
          style={{
            padding: "10px 24px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: step === 0 ? "var(--text-subtle)" : "var(--text)",
            fontSize: "0.86rem",
            fontWeight: 600,
            cursor: step === 0 ? "default" : "pointer",
          }}
        >
          ← Anterior
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            disabled={!canAdvance}
            style={{
              padding: "10px 28px",
              background: canAdvance
                ? "linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)"
                : "var(--surface-2)",
              border: "none",
              borderRadius: "var(--radius)",
              color: canAdvance ? "#06090f" : "var(--text-subtle)",
              fontSize: "0.86rem",
              fontWeight: 700,
              cursor: canAdvance ? "pointer" : "default",
              boxShadow: canAdvance ? "0 0 20px var(--accent-glow)" : "none",
            }}
          >
            Próximo →
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {saveError && (
              <p style={{ fontSize: "0.75rem", color: "#f87171", margin: 0 }}>{saveError}</p>
            )}
            <button
              onClick={finish}
              disabled={saving}
              style={{
                padding: "10px 28px",
                background: "linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)",
                border: "none",
                borderRadius: "var(--radius)",
                color: "#06090f",
                fontSize: "0.86rem",
                fontWeight: 700,
                cursor: saving ? "wait" : "pointer",
                boxShadow: "0 0 20px var(--accent-glow)",
              }}
            >
              {saving ? "Salvando…" : "Criar Personagem"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
