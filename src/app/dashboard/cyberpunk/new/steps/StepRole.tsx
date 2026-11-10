"use client";

import { ROLES, type RoleKey } from "@/lib/cyberpunk/data";
import { Field } from "@/components/ui/Field";
import { CP, SectionTitle, SelectCard, inputStyle, labelStyle } from "../../ui";
import { ROLL_RESET, type WizardData } from "../wizardModel";

interface Props {
  data: WizardData;
  onChange: (p: Partial<WizardData>) => void;
}

export function StepRole({ data, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <SectionTitle
        eyebrow="Passo 1"
        title="Nome e papel"
        desc="O papel define o que seu edgerunner faz melhor e dá uma habilidade exclusiva. Todo personagem inicial começa com Grau 4 nela."
      />

      <div style={{ maxWidth: 420 }}>
        <Field label="Nome do edgerunner" style={labelStyle}>
          <input
            value={data.name} maxLength={60} placeholder="Ex.: Ravi Okafor"
            onChange={(e) => onChange({ name: e.target.value })} style={inputStyle}
          />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))", gap: 10 }}>
        {ROLES.map((r) => (
          <SelectCard
            key={r.key} label={r.name} sublabel={r.abilityName}
            selected={data.role === r.key}
            onClick={() => onChange({ role: r.key as RoleKey, skills: data.method === "complete" ? data.skills : {}, choices: {}, kitSel: {}, ...ROLL_RESET, stats: data.method === "complete" ? data.stats : null })}
          >
            <span style={{ fontSize: "0.74rem", color: CP.textMuted, lineHeight: 1.5 }}>{r.abilityShort}</span>
          </SelectCard>
        ))}
      </div>
    </div>
  );
}
