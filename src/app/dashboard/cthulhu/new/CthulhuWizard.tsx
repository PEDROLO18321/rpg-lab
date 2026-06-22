"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OCCUPATIONS, calcOccupationPoints } from "@/lib/cthulhu/data";
import type { CthulhuAttrs } from "@/lib/cthulhu/data";
import { StepAttrs }      from "./steps/StepAttrs";
import { StepSkills }     from "./steps/StepSkills";
import { StepBackground } from "./steps/StepBackground";
import { StepEquipment }  from "./steps/StepEquipment";
import { StepReview }     from "./steps/StepReview";

const ACCENT       = "#7d9c3e";
const ACCENT_LIGHT  = "#a3b86c";
const ACCENT_GLOW  = "rgba(125,156,62,0.3)";

const STEPS = [
  { id: "attrs",      label: "Atributos"    },
  { id: "skills",     label: "Perícias"     },
  { id: "background", label: "Antecedentes" },
  { id: "equipment",  label: "Equipamento"  },
  { id: "review",     label: "Revisão"      },
];

export interface BackgroundData {
  personalDescription:  string;
  ideology:             string;
  significantPeople:    string;
  meaningfulLocations:  string;
  treasuredPossessions: string;
  traits:               string;
  backstory:            string;
  injuries:             string;
}

export interface WizardData {
  name:             string;
  era:              "1920s" | "modern";
  age:              number;
  attrs:            CthulhuAttrs;
  occupationId:     string;
  occupationSkills: Record<string, number>;
  interestSkills:   Record<string, number>;
  background:       Partial<BackgroundData>;
  equipment:        string;
  weapons:          string[];
}

interface Props { userId: string; systemId: string; }

export function CthulhuWizard({ userId, systemId }: Props) {
  const router = useRouter();
  const [step,      setStep]      = useState(0);
  const [data,      setData]      = useState<Partial<WizardData>>({});
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function patch(partial: Partial<WizardData>) {
    setData((prev) => ({
      ...prev, ...partial,
      ...(partial.background      ? { background:      { ...prev.background,      ...partial.background      } } : {}),
      ...(partial.occupationSkills ? { occupationSkills: { ...prev.occupationSkills, ...partial.occupationSkills } } : {}),
      ...(partial.interestSkills   ? { interestSkills:   { ...prev.interestSkills,   ...partial.interestSkills   } } : {}),
    }));
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  const canAdvance = useMemo(() => {
    if (step === 0) return !!data.name?.trim() && !!data.attrs && (data.age ?? 0) >= 15;
    if (step === 1) {
      if (!data.occupationId || !data.attrs) return false;
      const occ = OCCUPATIONS.find((o) => o.id === data.occupationId);
      if (!occ) return false;
      const credit = data.occupationSkills?.nivel_credito ?? 0;
      if (credit < occ.creditRange[0] || credit > occ.creditRange[1]) return false;
      const totalOcc = calcOccupationPoints(occ.formula, data.attrs);
      const usedOcc  = Object.values(data.occupationSkills ?? {}).reduce((a, b) => a + b, 0);
      if (usedOcc < totalOcc) return false;
      const totalInt = data.attrs.int * 2;
      const usedInt  = Object.values(data.interestSkills ?? {}).reduce((a, b) => a + b, 0);
      if (usedInt < totalInt) return false;
      return true;
    }
    return true;
  }, [step, data]);

  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  async function finish() {
    if (!data.attrs || !data.name?.trim()) return;
    setSaving(true);
    setSaveError(null);

    try {
      const { calcPV, calcPM, calcMOV } = await import("@/lib/cthulhu/data");
      const a   = data.attrs;
      const age = data.age ?? 25;

      const merged: Record<string, number> = {};
      for (const [k, v] of Object.entries(data.occupationSkills ?? {})) merged[k] = (merged[k] ?? 0) + v;
      for (const [k, v] of Object.entries(data.interestSkills   ?? {})) merged[k] = (merged[k] ?? 0) + v;

      const pvMax = calcPV(a);

      const res = await fetch("/api/cthulhu/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId,
          name:       data.name.trim(),
          era:        data.era ?? "1920s",
          age,
          occupation: data.occupationId ?? "",
          atribFor:   a.for,  atribCon: a.con, atribTam: a.tam, atribDes: a.des,
          atribApa:   a.apa,  atribInt: a.int, atribPod: a.pod, atribEdu: a.edu,
          sanCurrent: a.pod,
          sanMax:     99,
          pvMax,
          pvCurrent:  pvMax,
          luck:       a.sorte,
          mov:        calcMOV(a, age),
          pmCurrent:  calcPM(a),
          skills:     merged,
          background: data.background ?? {},
          weapons:    data.weapons ?? [],
          equipment:  data.equipment?.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar.");
      router.push(`/dashboard/cthulhu/${json.id}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro ao salvar.");
      setSaving(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

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
          <span
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.88rem", fontWeight: 700, color: "var(--text)",
            }}
          >
            Novo Investigador · Call of Cthulhu
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {step + 1}/{STEPS.length}
          </span>
        </div>

        {/* Thin progress bar */}
        <div style={{ height: 2, background: "var(--border)" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${ACCENT_LIGHT}, ${ACCENT})`,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </header>

      {/* Step tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", overflowX: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0 }}>
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
        {step === 0 && <StepAttrs data={data} onChange={patch} />}
        {step === 1 && <StepSkills data={data} onChange={patch} />}
        {step === 2 && <StepBackground data={data} onChange={patch} />}
        {step === 3 && <StepEquipment data={data} onChange={patch} />}
        {step === 4 && <StepReview data={data} />}
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

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            disabled={!canAdvance}
            style={{
              padding: "10px 28px",
              background: canAdvance
                ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`
                : "var(--surface-2)",
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
            {saveError && (
              <p style={{ fontSize: "0.75rem", color: "#f87171", margin: 0 }}>{saveError}</p>
            )}
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
              {saving ? "Salvando…" : "Criar Investigador"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
