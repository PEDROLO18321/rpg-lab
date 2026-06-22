"use client";

import type { OrdemWizardData } from "../CharacterWizard";
import { Intro } from "./StepAttrs";

interface Props {
  data: OrdemWizardData;
  onChange: (p: Partial<OrdemWizardData>) => void;
}

const FIELDS: {
  key: keyof OrdemWizardData["background"];
  label: string;
  placeholder: string;
  rows: number;
}[] = [
  {
    key: "appearance",
    label: "Aparência",
    placeholder: "Como seu agente se veste, aparência física, traços marcantes…",
    rows: 3,
  },
  {
    key: "personality",
    label: "Personalidade",
    placeholder: "Como age sob pressão, relação com aliados, medos e virtudes…",
    rows: 3,
  },
  {
    key: "history",
    label: "História",
    placeholder: "Passado, como entrou para a Ordem, experiências que moldaram o agente…",
    rows: 4,
  },
  {
    key: "objective",
    label: "Objetivo",
    placeholder: "O que o agente busca? Vingança, proteção, conhecimento, redenção…",
    rows: 2,
  },
];

export function StepBackground({ data, onChange }: Props) {
  function set(key: keyof OrdemWizardData["background"], value: string) {
    onChange({ background: { ...data.background, [key]: value } });
  }

  const filled = Object.values(data.background).filter((v) => v.trim()).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro
        title="Conceito do Agente"
        text="Campos opcionais — quanto mais detalhes, mais vivo o personagem. Podem ser editados depois na ficha."
      />

      {filled > 0 && (
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(125,200,100,0.06)",
            border: "1px solid rgba(125,200,100,0.25)",
            borderRadius: "var(--radius-lg)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          {filled} de {FIELDS.length} campos preenchidos
        </div>
      )}

      {FIELDS.map(({ key, label, placeholder, rows }) => (
        <div key={key}>
          <label
            style={{
              display: "block",
              fontSize: "0.76rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              marginBottom: 8,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </label>
          <textarea
            value={data.background[key]}
            onChange={(e) => set(key, e.target.value)}
            placeholder={placeholder}
            rows={rows}
            style={{
              width: "100%",
              padding: "11px 14px",
              background: "var(--surface)",
              border: `1px solid ${data.background[key].trim() ? "rgba(255,255,255,0.28)" : "var(--border)"}`,
              borderRadius: "var(--radius)",
              color: "var(--text)",
              fontSize: "0.88rem",
              lineHeight: 1.6,
              resize: "vertical",
              fontFamily: "inherit",
              transition: "border-color 0.15s",
              boxSizing: "border-box",
            }}
          />
        </div>
      ))}
    </div>
  );
}
