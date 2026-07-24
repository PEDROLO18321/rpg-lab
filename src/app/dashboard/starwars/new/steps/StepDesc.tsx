"use client";

import type { DescData, WizardData } from "../CharacterWizard";
import { SW, SectionTitle } from "../../ui";

interface Props { desc: Partial<DescData>; onChange: (p: Partial<WizardData>) => void }

function Field({ label, value, onChange, area }: { label: string; value: string; onChange: (v: string) => void; area?: boolean }) {
  const style: React.CSSProperties = { display: "block", marginTop: 8, width: "100%", padding: "11px 15px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.86rem", fontFamily: "inherit", boxSizing: "border-box" };
  return (
    <div>
      <label style={{ fontSize: "0.68rem", fontWeight: 800, color: SW.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</label>
      {area ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} style={{ ...style, resize: "vertical" }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={style} />
      )}
    </div>
  );
}

export function StepDesc({ desc, onChange }: Props) {
  function set(k: keyof DescData, v: string) {
    onChange({ desc: { ...desc, [k]: v } });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle eyebrow="Etapa 7 de 8" title="Descrição" desc="Organização, aparência, personalidade, história e objetivo do personagem — opcional, mas ajuda o mestre e o grupo." />
      <Field label="Organização (facção, ordem, tripulação)" value={desc.organization ?? ""} onChange={(v) => set("organization", v)} />
      <Field label="Aparência" value={desc.appearance ?? ""} onChange={(v) => set("appearance", v)} area />
      <Field label="Personalidade" value={desc.personality ?? ""} onChange={(v) => set("personality", v)} area />
      <Field label="História" value={desc.history ?? ""} onChange={(v) => set("history", v)} area />
      <Field label="Objetivo" value={desc.objective ?? ""} onChange={(v) => set("objective", v)} area />
    </div>
  );
}
