"use client";

import {
  AFFECTATIONS, CHILDHOOD_ENVIRONMENTS, CLOTHING_STYLES, CULTURAL_ORIGINS, FAMILY_BACKGROUNDS, FAMILY_CRISES,
  FEELINGS_ABOUT_PEOPLE, HAIRSTYLES, LIFE_GOALS, PERSONALITIES, VALUED_PERSON, VALUED_POSSESSION, VALUES,
  rollLifepath, type Lifepath,
} from "@/lib/cyberpunk/lifepath";
import { Field } from "@/components/ui/Field";
import { CP, PrimaryButton, SectionTitle, areaStyle, inputStyle, labelStyle, pillBtn } from "../../ui";
import type { WizardData } from "../wizardModel";

interface Props {
  data: WizardData;
  onChange: (p: Partial<WizardData>) => void;
}

type TextKey = "personality" | "clothing" | "hairstyle" | "affectation" | "value" | "feelings" | "person"
  | "possession" | "family" | "childhood" | "crisis" | "goal";

const FIELDS: { key: TextKey; label: string; table: readonly string[] }[] = [
  { key: "personality", label: "Personalidade", table: PERSONALITIES },
  { key: "clothing", label: "Estilo de roupa", table: CLOTHING_STYLES },
  { key: "hairstyle", label: "Cabelo", table: HAIRSTYLES },
  { key: "affectation", label: "Marca pessoal", table: AFFECTATIONS },
  { key: "value", label: "O que mais valoriza", table: VALUES },
  { key: "feelings", label: "Sentimento sobre as pessoas", table: FEELINGS_ABOUT_PEOPLE },
  { key: "person", label: "Pessoa mais valorizada", table: VALUED_PERSON },
  { key: "possession", label: "Posse mais valorizada", table: VALUED_POSSESSION },
  { key: "family", label: "Origem familiar", table: FAMILY_BACKGROUNDS },
  { key: "childhood", label: "Infância", table: CHILDHOOD_ENVIRONMENTS },
  { key: "crisis", label: "Crise na família", table: FAMILY_CRISES },
  { key: "goal", label: "Objetivo de vida", table: LIFE_GOALS },
];

export function StepLifepath({ data, onChange }: Props) {
  const lp = data.lifepath;
  const set = (p: Partial<Lifepath>) => onChange({ lifepath: { ...lp, ...p } });
  const origin = CULTURAL_ORIGINS.find((o) => o.region === lp.origin);

  function rollOne(key: TextKey, table: readonly string[]) {
    set({ [key]: table[Math.floor(Math.random() * table.length)] } as Partial<Lifepath>);
  }

  function rollOrigin() {
    const o = CULTURAL_ORIGINS[Math.floor(Math.random() * CULTURAL_ORIGINS.length)];
    set({ origin: o.region, language: o.languages[Math.floor(Math.random() * o.languages.length)] });
  }

  function rollRelations(key: "friends" | "enemies" | "loves") {
    const fresh = rollLifepath();
    set({ [key]: fresh[key] } as Partial<Lifepath>);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle
        eyebrow="Passo 4" title="Caminho de vida"
        desc="Role nas tabelas ou escolha o que combina com o personagem. Nada aqui altera números, exceto o idioma da origem, que dá nível 4 grátis."
      />

      <div><PrimaryButton onClick={() => onChange({ lifepath: rollLifepath() })}>🎲 Rolar tudo</PrimaryButton></div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 14 }}>
        <div>
          <span style={labelStyle}>Origem cultural</span>
          <div style={{ display: "flex", gap: 6 }}>
            <select aria-label="Origem cultural" value={lp.origin ?? ""} onChange={(e) => {
              const o = CULTURAL_ORIGINS.find((x) => x.region === e.target.value);
              set({ origin: e.target.value, language: o?.languages[0] });
            }} style={inputStyle}>
              <option value="">—</option>
              {CULTURAL_ORIGINS.map((o) => <option key={o.region} value={o.region}>{o.region}</option>)}
            </select>
            <button type="button" onClick={rollOrigin} aria-label="Sortear origem" style={pillBtn}>🎲</button>
          </div>
        </div>
        <div>
          <Field label="Idioma da origem (+4 grátis)" style={labelStyle}>
            <select value={lp.language ?? ""} disabled={!origin} onChange={(e) => set({ language: e.target.value })} style={inputStyle}>
              <option value="">—</option>
              {origin?.languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
        </div>

        {FIELDS.map((f) => (
          <div key={f.key}>
            <span style={labelStyle}>{f.label}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <select aria-label={f.label} value={lp[f.key] ?? ""} onChange={(e) => set({ [f.key]: e.target.value } as Partial<Lifepath>)} style={inputStyle}>
                <option value="">—</option>
                {Array.from(new Set(f.table)).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <button type="button" onClick={() => rollOne(f.key, f.table)} aria-label={`Sortear ${f.label}`} style={pillBtn}>🎲</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 14 }}>
        <Relations title="Amigos" items={lp.friends ?? []} onRoll={() => rollRelations("friends")} />
        <Relations title="Inimigos" items={(lp.enemies ?? []).map((e) => `${e.who} — ${e.cause}. Ameaça: ${e.threat}. Se for vingar: ${e.revenge}`)} onRoll={() => rollRelations("enemies")} />
        <Relations title="Amores trágicos" items={lp.loves ?? []} onRoll={() => rollRelations("loves")} />
      </div>

      <div>
        <Field label="Aparência (texto livre)" style={labelStyle}>
          <textarea value={data.appearance} onChange={(e) => onChange({ appearance: e.target.value })} placeholder="Altura, cicatrizes, estilo, o que as pessoas notam primeiro…" style={areaStyle} />
        </Field>
      </div>
    </div>
  );
}

function Relations({ title, items, onRoll }: { title: string; items: string[]; onRoll: () => void }) {
  return (
    <div style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8 }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</span>
        <button type="button" onClick={onRoll} aria-label={`Sortear ${title}`} style={pillBtn}>🎲</button>
      </div>
      {items.length === 0
        ? <p style={{ fontSize: "0.76rem", color: CP.textSubtle }}>Nenhum (o d10 − 7 deu zero).</p>
        : <ul style={{ margin: 0, paddingLeft: 16, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>}
    </div>
  );
}
