"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import "../cyberpunk-responsive.css";
import { CP } from "../ui";
import { INITIAL, buildPayload, type WizardData } from "./wizardModel";
import { StepRole } from "./steps/StepRole";
import { StepStats, sumStats } from "./steps/StepStats";
import { StepSkills, skillsStepValid } from "./steps/StepSkills";
import { StepLifepath } from "./steps/StepLifepath";
import { StepEquipment } from "./steps/StepEquipment";
import { StepReview, reviewProblems } from "./steps/StepReview";
import { COMPLETE_STAT_POINTS } from "@/lib/cyberpunk/data";

const STEPS = [
  { id: "role", label: "Papel" },
  { id: "stats", label: "Atributos" },
  { id: "skills", label: "Perícias" },
  { id: "lifepath", label: "Caminho de Vida" },
  { id: "equipment", label: "Equipamento" },
  { id: "review", label: "Revisão" },
];

export function CharacterWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function patch(partial: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [step]);

  const canAdvance = useMemo(() => {
    if (step === 0) return data.name.trim().length > 0;
    if (step === 1) {
      if (!data.stats) return false;
      return data.method !== "complete" || sumStats(data.stats) === COMPLETE_STAT_POINTS;
    }
    if (step === 2) return skillsStepValid(data);
    return true;
  }, [step, data]);

  async function finish() {
    if (reviewProblems(data).length > 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/cyberpunk/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(data)),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao salvar.");
      router.push(`/dashboard/cyberpunk/${json.id}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Erro ao salvar.");
      setSaving(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const last = step === STEPS.length - 1;
  const blocked = last && reviewProblems(data).length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)", background: "rgba(7,9,15,0.90)", backdropFilter: "blur(20px)" }}>
        <div
          className="cp-wizard-header-inner"
          style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <button
            onClick={() => router.back()}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.82rem", cursor: "pointer", padding: "4px 0", minHeight: 28 }}
          >
            ← Cancelar
          </button>
          <span className="cp-wizard-header-title" style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>
            Novo Edgerunner · Cyberpunk RED
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{step + 1}/{STEPS.length}</span>
        </div>
        <div style={{ height: 2, background: "var(--border)" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${CP.accentLight}, ${CP.accent})`, transition: "width 0.4s ease" }} />
        </div>
      </header>

      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)", overflowX: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", display: "flex" }}>
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <button
                key={s.id}
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                aria-current={current ? "step" : undefined}
                style={{
                  padding: "12px 16px", minHeight: 44, background: "none", border: "none",
                  borderBottom: current ? `2px solid ${CP.accent}` : "2px solid transparent",
                  color: current ? CP.accentLight : done ? "var(--text-muted)" : "var(--text-subtle)",
                  fontSize: "0.78rem", fontWeight: current ? 700 : 500, cursor: i <= step ? "pointer" : "default",
                  whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
                }}
              >
                {done && <span style={{ color: CP.accent, fontSize: "0.7rem" }}>✓</span>}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <main id="conteudo" style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "40px 24px 110px", boxSizing: "border-box" }}>
        {step === 0 && <StepRole data={data} onChange={patch} />}
        {step === 1 && <StepStats data={data} onChange={patch} />}
        {step === 2 && <StepSkills data={data} onChange={patch} />}
        {step === 3 && <StepLifepath data={data} onChange={patch} />}
        {step === 4 && <StepEquipment data={data} onChange={patch} />}
        {step === 5 && <StepReview data={data} />}
      </main>

      <div
        className="cp-wizard-footer"
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1px solid var(--border)", background: "rgba(7,9,15,0.95)", backdropFilter: "blur(20px)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, zIndex: 40 }}
      >
        <button
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          disabled={step === 0}
          style={{ padding: "10px 24px", minHeight: 40, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: step === 0 ? "var(--text-subtle)" : "var(--text)", fontSize: "0.86rem", fontWeight: 600, cursor: step === 0 ? "default" : "pointer", fontFamily: "inherit" }}
        >
          ← Anterior
        </button>

        {!last ? (
          <button
            onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
            disabled={!canAdvance}
            style={{ padding: "10px 28px", minHeight: 40, background: canAdvance ? `linear-gradient(135deg, ${CP.accentLight} 0%, ${CP.accent} 100%)` : "var(--surface-2)", border: "none", borderRadius: "var(--radius)", color: canAdvance ? "#0b0614" : "var(--text-subtle)", fontSize: "0.86rem", fontWeight: 700, cursor: canAdvance ? "pointer" : "default", boxShadow: canAdvance ? `0 0 20px ${CP.glow}` : "none", fontFamily: "inherit" }}
          >
            Próximo →
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            {saveError && <p style={{ fontSize: "0.75rem", color: "#f87171", margin: 0 }}>{saveError}</p>}
            <button
              onClick={finish}
              disabled={saving || blocked}
              style={{ padding: "10px 28px", minHeight: 40, background: blocked ? "var(--surface-2)" : `linear-gradient(135deg, ${CP.accentLight} 0%, ${CP.accent} 100%)`, border: "none", borderRadius: "var(--radius)", color: blocked ? "var(--text-subtle)" : "#0b0614", fontSize: "0.86rem", fontWeight: 700, cursor: saving ? "wait" : blocked ? "default" : "pointer", boxShadow: blocked ? "none" : `0 0 20px ${CP.glow}`, fontFamily: "inherit" }}
            >
              {saving ? "Salvando…" : "Criar Edgerunner"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
