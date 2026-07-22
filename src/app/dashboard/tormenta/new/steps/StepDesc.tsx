"use client";

import type { WizardData, DescData } from "../CharacterWizard";
import { ACCENT } from "../CharacterWizard";
import { Intro } from "./Intro";

interface Props {
  desc: Partial<DescData>;
  onChange: (p: Partial<WizardData>) => void;
}

const FIELDS: { key: keyof DescData; label: string; placeholder: string }[] = [
  { key: "appearance", label: "Aparência", placeholder: "Como seu herói se parece?" },
  { key: "personality", label: "Personalidade", placeholder: "Traços marcantes, medos, manias..." },
  { key: "history", label: "História", placeholder: "De onde veio, o que o levou à aventura..." },
  { key: "objective", label: "Objetivo", placeholder: "O que seu herói busca em Arton?" },
];

export function StepDesc({ desc, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro title="Descrição" text="Dê vida ao seu herói. Nenhum campo é obrigatório, mas ajuda a interpretar melhor durante o jogo." />

      {FIELDS.map((f) => (
        <div key={f.key}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{f.label}</p>
          <textarea
            value={desc[f.key] ?? ""}
            onChange={(e) => onChange({ desc: { [f.key]: e.target.value } })}
            placeholder={f.placeholder}
            rows={3}
            style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "12px 14px", color: "var(--text)", fontSize: "0.86rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>
      ))}
    </div>
  );
}
