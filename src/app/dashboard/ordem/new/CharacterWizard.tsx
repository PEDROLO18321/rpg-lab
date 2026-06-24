"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  attrsValid, computeSkillPlan, buildTrainedSkills,
  type OrdemWizardData,
} from "@/lib/ordem/creation";
import { CLASS_BY_ID } from "@/lib/ordem/data";
import { ORIGIN_BY_ID } from "@/lib/ordem/origins";
import { StepAttrs }       from "./steps/StepAttrs";
import { StepOrigin }      from "./steps/StepOrigin";
import { StepClass }       from "./steps/StepClass";
import { StepRituals }     from "./steps/StepRituals";
import { StepSkills }      from "./steps/StepSkills";
import { StepEquipment }   from "./steps/StepEquipment";
import { StepBackground }  from "./steps/StepBackground";
import { StepReview }      from "./steps/StepReview";

const ACCENT       = "#ffffff";
const ACCENT_LIGHT = "#ffffff";
const ACCENT_GLOW  = "rgba(255,255,255,0.3)";

type StepDef = { id: string; label: string };

const STEPS_BASE: StepDef[] = [
  { id: "attrs",      label: "Atributos"    },
  { id: "origin",     label: "Origem"       },
  { id: "class",      label: "Classe"       },
  { id: "skills",     label: "Perícias"     },
  { id: "equipment",  label: "Equipamento"  },
  { id: "background", label: "Conceito"     },
  { id: "review",     label: "Revisão"      },
];

const STEP_RITUAIS: StepDef = { id: "rituais", label: "Rituais" };

export type { OrdemWizardData };

const EMPTY_ATTRS: OrdemWizardData["attrs"] = { agi: 1, for: 1, int: 1, pre: 1, vig: 1 };

interface Props { systemId: string; }

export function CharacterWizard({ systemId }: Props) {
  const router = useRouter();
  const [step,      setStep]      = useState(0);
  const [data,      setData]      = useState<OrdemWizardData>({
    name: "",
    attrs: { ...EMPTY_ATTRS },
    originId: "",
    originSkills: [],
    paranormalPowerId: "",
    classId: "",
    fixedChoices: {},
    trainedSkills: [],
    startingRituals: [],
    weapons: [],
    protections: [],
    generalItems: [],
    background: { appearance: "", personality: "", history: "", objective: "" },
  });
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function patch(partial: Partial<OrdemWizardData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  // Dynamic steps: insert "Rituais" after "Classe" for ocultistas
  const steps = useMemo<StepDef[]>(() => {
    if (data.classId === "ocultista") {
      return [
        ...STEPS_BASE.slice(0, 3),
        STEP_RITUAIS,
        ...STEPS_BASE.slice(3),
      ];
    }
    return STEPS_BASE;
  }, [data.classId]);

  // Clamp step when steps array length changes (class change removes/adds rituais step)
  const prevStepsLen = useRef(steps.length);
  useEffect(() => {
    if (steps.length !== prevStepsLen.current) {
      setStep((s) => Math.min(s, steps.length - 1));
      prevStepsLen.current = steps.length;
    }
  }, [steps.length]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  const currentId = steps[step]?.id ?? "";

  const canAdvance = useMemo(() => {
    if (currentId === "attrs") {
      return !!data.name.trim() && attrsValid(data.attrs);
    }
    if (currentId === "origin") {
      const o = ORIGIN_BY_ID[data.originId];
      if (!o) return false;
      if (o.chooseAny && data.originSkills.length !== o.chooseAny) return false;
      if (o.id === "cultista-arrependido" && !data.paranormalPowerId) return false;
      return true;
    }
    if (currentId === "class") {
      if (!data.classId) return false;
      const c = CLASS_BY_ID[data.classId];
      return c.fixedSkills
        .filter((f) => f.includes("|"))
        .every((f) => !!data.fixedChoices[f]);
    }
    if (currentId === "rituais") {
      return data.startingRituals.length === 3;
    }
    if (currentId === "skills") {
      if (!data.classId) return false;
      return data.trainedSkills.length === computeSkillPlan(data).need;
    }
    return true;
  }, [currentId, data]);

  function next() { setStep((s) => Math.min(s + 1, steps.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  async function finish() {
    if (!data.name.trim() || !data.classId) return;
    setSaving(true);
    setSaveError(null);

    try {
      const inventory = [
        ...data.protections.map((c) => ({ kind: "protection", id: c.id, mods: c.mods, curses: c.curses })),
        ...data.generalItems.map((c) => ({ kind: "general", id: c.id, mods: c.mods, curses: c.curses })),
      ];

      const res = await fetch("/api/ordem/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId,
          name:      data.name.trim(),
          origin:    data.originId || null,
          className: data.classId,
          nex:       5,
          attrs:     data.attrs,
          skills:    buildTrainedSkills(data),
          weapons:   data.weapons, // ConfiguredItem[] { id, mods, curses }
          inventory,
          rituals:   data.classId === "ocultista" && data.startingRituals.length
                       ? data.startingRituals
                       : null,
          paranormalPower: data.paranormalPowerId || null,
          background: data.background,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar.");
      router.push(`/dashboard/ordem/${json.id}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro ao salvar.");
      setSaving(false);
    }
  }

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 50,
          borderBottom: "1px solid var(--border)",
          background: "rgba(7,9,15,0.90)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 900, margin: "0 auto", padding: "0 24px",
            height: 56,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              background: "none", border: "none",
              color: "var(--text-muted)", fontSize: "0.82rem",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: 0,
            }}
          >
            ← Cancelar
          </button>
          <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>
            Novo Agente · Ordem Paranormal
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {step + 1}/{steps.length}
          </span>
        </div>

        <div style={{ height: 2, background: "var(--border)" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT_LIGHT}, ${ACCENT})`, transition: "width 0.4s ease" }} />
        </div>
      </header>

      {/* Step tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", overflowX: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0 }}>
          {steps.map((s, i) => {
            const done    = i < step;
            const current = i === step;
            return (
              <button
                key={s.id}
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                style={{
                  padding: "12px 16px",
                  background: "none", border: "none",
                  borderBottom: current ? `2px solid ${ACCENT}` : "2px solid transparent",
                  color: current ? ACCENT_LIGHT : done ? "var(--text-muted)" : "var(--text-subtle)",
                  fontSize: "0.78rem",
                  fontWeight: current ? 700 : 500,
                  cursor: i <= step ? "pointer" : "default",
                  whiteSpace: "nowrap",
                  transition: "color 0.2s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {done && <span style={{ color: ACCENT, fontSize: "0.7rem" }}>✓</span>}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "40px 24px 100px" }}>
        {currentId === "attrs"      && <StepAttrs      data={data} onChange={patch} />}
        {currentId === "origin"     && <StepOrigin     data={data} onChange={patch} />}
        {currentId === "class"      && <StepClass      data={data} onChange={patch} />}
        {currentId === "rituais"    && <StepRituals    data={data} onChange={patch} />}
        {currentId === "skills"     && <StepSkills     data={data} onChange={patch} />}
        {currentId === "equipment"  && <StepEquipment  data={data} onChange={patch} />}
        {currentId === "background" && <StepBackground data={data} onChange={patch} />}
        {currentId === "review"     && <StepReview     data={data} />}
      </main>

      {/* Fixed bottom nav */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          borderTop: "1px solid var(--border)",
          background: "rgba(7,9,15,0.95)",
          backdropFilter: "blur(20px)",
          padding: "16px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
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
            fontSize: "0.86rem", fontWeight: 600,
            cursor: step === 0 ? "default" : "pointer",
          }}
        >
          ← Anterior
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={next}
            disabled={!canAdvance}
            style={{
              padding: "10px 28px",
              background: canAdvance ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)` : "var(--surface-2)",
              border: "none",
              borderRadius: "var(--radius)",
              color: canAdvance ? "#06090f" : "var(--text-subtle)",
              fontSize: "0.86rem", fontWeight: 700,
              cursor: canAdvance ? "pointer" : "default",
              boxShadow: canAdvance ? `0 0 20px ${ACCENT_GLOW}` : "none",
              transition: "all 0.18s",
            }}
          >
            Próximo →
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {saveError && <p style={{ fontSize: "0.75rem", color: "#f87171", margin: 0 }}>{saveError}</p>}
            <button
              onClick={finish}
              disabled={saving}
              style={{
                padding: "10px 28px",
                background: `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`,
                border: "none", borderRadius: "var(--radius)",
                color: "#06090f", fontSize: "0.86rem", fontWeight: 700,
                cursor: saving ? "wait" : "pointer",
                boxShadow: `0 0 20px ${ACCENT_GLOW}`,
              }}
            >
              {saving ? "Recrutando…" : "Recrutar Agente"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
