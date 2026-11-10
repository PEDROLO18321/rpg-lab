"use client";

import { useState } from "react";
import { describeEnemy, rollLifepath, type Lifepath } from "@/lib/cyberpunk/lifepath";
import { SheetShell } from "@/components/sheet/SheetShell";
import { SheetSection } from "@/components/sheet/SheetSection";
import { Field } from "@/components/ui/Field";
import { CP, GhostButton, areaStyle, inputStyle, labelStyle } from "../../ui";
import type { TabProps } from "../sheetModel";

type TextKey = Exclude<keyof Lifepath, "friends" | "enemies" | "loves">;

const FIELDS: { key: TextKey; label: string }[] = [
  { key: "origin", label: "Origem cultural" },
  { key: "language", label: "Idioma de origem" },
  { key: "personality", label: "Personalidade" },
  { key: "clothing", label: "Estilo de roupa" },
  { key: "hairstyle", label: "Cabelo" },
  { key: "affectation", label: "Marca pessoal" },
  { key: "value", label: "O que mais valoriza" },
  { key: "feelings", label: "Sentimento sobre as pessoas" },
  { key: "person", label: "Pessoa mais valorizada" },
  { key: "possession", label: "Posse mais valorizada" },
  { key: "family", label: "Origem familiar" },
  { key: "childhood", label: "Infância" },
  { key: "crisis", label: "Crise na família" },
  { key: "goal", label: "Objetivo de vida" },
];

export function LifepathTab({ sh, patch }: TabProps) {
  const lp = sh.lifepath;
  const [confirm, setConfirm] = useState(false);
  // Cópia local dos campos de texto: grava no servidor só ao sair do campo
  // (onBlur), senão cada tecla seria uma requisição.
  const [draft, setDraft] = useState<Record<string, string>>({});
  const val = (k: TextKey) => draft[k] ?? (lp[k] as string | undefined) ?? "";

  function commit(k: TextKey) {
    if (draft[k] === undefined) return;
    patch({ lifepath: { ...lp, [k]: draft[k] } });
    setDraft((d) => { const n = { ...d }; delete n[k]; return n; });
  }

  function reroll() {
    if (!confirm) { setConfirm(true); return; }
    patch({ lifepath: rollLifepath() });
    setDraft({});
    setConfirm(false);
  }

  const list = (title: string, items: string[]) => (
    <div style={{ padding: 12, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{title}</p>
      {items.length === 0
        ? <p style={{ fontSize: "0.78rem", color: CP.textSubtle }}>Nenhum.</p>
        : <ul style={{ margin: 0, paddingLeft: 16, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>}
    </div>
  );

  const left = (
    <SheetSection
      title="Caminho de vida" accent
      action={<GhostButton onClick={reroll} style={{ padding: "4px 12px", minHeight: 28, fontSize: "0.74rem" }}>{confirm ? "Confirmar: substituir tudo" : "🎲 Rolar de novo"}</GhostButton>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(250px, 100%), 1fr))", gap: 12 }}>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <Field label={f.label} style={labelStyle}>
              <input value={val(f.key)} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} onBlur={() => commit(f.key)} style={inputStyle} />
            </Field>
          </div>
        ))}
      </div>
    </SheetSection>
  );

  const right = (
    <>
      <SheetSection title="Relações">
        {list("Amigos", lp.friends ?? [])}
        {list("Inimigos", (lp.enemies ?? []).map(describeEnemy))}
        {list("Amores trágicos", lp.loves ?? [])}
      </SheetSection>

      <SheetSection title="Aparência e história">
        <BgField sh={sh} patch={patch} field="appearance" label="Aparência" />
        <BgField sh={sh} patch={patch} field="history" label="História" />
      </SheetSection>
    </>
  );

  return <SheetShell system="cyberpunk" left={left} right={right} />;
}

/** Campo de texto longo do `background`; grava ao sair do campo. */
export function BgField({ sh, patch, field, label, rows = 4 }: Pick<TabProps, "sh" | "patch"> & { field: "appearance" | "history" | "notes"; label: string; rows?: number }) {
  const [text, setText] = useState(sh.background[field] ?? "");
  return (
    <Field label={label} style={labelStyle}>
      <textarea
        value={text} rows={rows} style={areaStyle}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => { if (text !== (sh.background[field] ?? "")) patch({ background: { ...sh.background, [field]: text } }); }}
      />
    </Field>
  );
}
