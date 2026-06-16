"use client";

import { useState } from "react";
import type { WizardData, BackgroundData } from "../CthulhuWizard";

const ACCENT      = "#7d9c3e";
const ACCENT_BORD = "rgba(125,156,62,0.28)";

const FIELDS: { key: keyof BackgroundData; label: string; hint: string; rows?: number }[] = [
  { key: "personalDescription", label: "Descrição Pessoal", hint: "Como seu investigador parece fisicamente? Qual sua personalidade?", rows: 2 },
  { key: "ideology",            label: "Ideologia / Crenças", hint: "O que seu investigador acredita profundamente? Religião, política, filosofia?" },
  { key: "significantPeople",   label: "Pessoas Significativas", hint: "Quem é mais importante para seu investigador e por quê?" },
  { key: "meaningfulLocations", label: "Locais Importantes", hint: "Onde seu investigador se sente em paz, ou tem memórias marcantes?" },
  { key: "treasuredPossessions",label: "Pertences Queridos", hint: "Que objeto seu investigador nunca abandonaria?" },
  { key: "traits",              label: "Características", hint: "Um traço de personalidade marcante — maneirismo, hábito ou quirk." },
  { key: "backstory",           label: "História", hint: "Brevemente: como chegou a ser investigador? O que o motiva?", rows: 4 },
  { key: "injuries",            label: "Ferimentos e Cicatrizes", hint: "Feridas físicas ou traumas passados (opcional)." },
];

interface Props {
  data: Partial<WizardData>;
  onChange: (p: Partial<WizardData>) => void;
}

export function StepBackground({ data, onChange }: Props) {
  const [bg, setBg] = useState<Partial<BackgroundData>>(data.background ?? {});

  function set(key: keyof BackgroundData, val: string) {
    const next = { ...bg, [key]: val };
    setBg(next);
    onChange({ background: next });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 8, color: ACCENT }}>Etapa 3</span>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.3rem, 3vw, 1.7rem)", fontWeight: 700, color: "var(--text)" }}>
          <span style={{ color: ACCENT }}>Antecedentes</span>
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 6, lineHeight: 1.7 }}>
          Dê vida ao seu investigador. Todos os campos são opcionais, mas quanto mais você preencher, mais vivo o personagem ficará.
        </p>
      </div>

      {FIELDS.map(({ key, label, hint, rows }) => (
        <label key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-cinzel), serif" }}>
            {label}
          </span>
          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{hint}</span>
          <textarea
            value={bg[key] ?? ""}
            onChange={(e) => set(key, e.target.value)}
            rows={rows ?? 2}
            placeholder={hint}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "10px 12px",
              color: "var(--text)", fontSize: "0.88rem", resize: "vertical",
              outline: "none", lineHeight: 1.6,
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = ACCENT_BORD)}
            onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
          />
        </label>
      ))}

    </div>
  );
}
