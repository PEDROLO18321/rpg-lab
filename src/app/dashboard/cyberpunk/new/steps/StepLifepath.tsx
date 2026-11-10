"use client";

import { useState } from "react";
import {
  AFFECTATIONS, CHILDHOOD_ENVIRONMENTS, CLOTHING_STYLES, CULTURAL_ORIGINS, FAMILY_BACKGROUNDS, FAMILY_CRISES,
  FEELINGS_ABOUT_PEOPLE, HAIRSTYLES, LIFE_GOALS, PERSONALITIES, VALUED_PERSON, VALUED_POSSESSION, VALUES,
  customRelation, describeEnemy, rollEnemy, rollFriend, rollLifepath, rollLove, type Lifepath, type LifepathEnemy,
} from "@/lib/cyberpunk/lifepath";
import { rollD } from "@/lib/cyberpunk/rules";
import { Field } from "@/components/ui/Field";
import { CP, PrimaryButton, SectionTitle, areaStyle, dangerBtn, inputStyle, labelStyle, pillBtn } from "../../ui";
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
    set({ [key]: table[rollD(10) - 1] } as Partial<Lifepath>);
  }

  function rollOrigin() {
    const o = CULTURAL_ORIGINS[Math.floor(Math.random() * CULTURAL_ORIGINS.length)];
    set({ origin: o.region, language: o.languages[Math.floor(Math.random() * o.languages.length)] });
  }

  // "Lista" repete o livro: d10 − 7 define a quantidade e cada item é rolado.
  function rollList(key: "friends" | "enemies" | "loves") {
    const fresh = rollLifepath();
    set({ [key]: fresh[key] } as Partial<Lifepath>);
  }

  const friends = lp.friends ?? [];
  const enemies = lp.enemies ?? [];
  const loves = lp.loves ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle
        eyebrow="Passo 4" title="Caminho de vida"
        desc="Em cada item você pode rolar, escolher uma opção da tabela ou escrever o seu. A origem cultural só aceita rolar ou escolher, porque o idioma dela dá nível 4 grátis. Nada aqui altera números além disso."
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
          <LifeField
            key={f.key} label={f.label} table={f.table} value={lp[f.key] ?? ""}
            onChange={(v) => set({ [f.key]: v } as Partial<Lifepath>)}
            onRoll={() => rollOne(f.key, f.table)}
          />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 14 }}>
        <Relations
          title="Amigos" items={friends}
          onRollList={() => rollList("friends")}
          onRollOne={() => set({ friends: [...friends, rollFriend()] })}
          onAddCustom={(n, d) => set({ friends: [...friends, customRelation(n, d)] })}
          onRemove={(i) => set({ friends: friends.filter((_, j) => j !== i) })}
        />
        <Relations
          title="Inimigos" items={enemies.map(describeEnemy)}
          onRollList={() => rollList("enemies")}
          onRollOne={() => set({ enemies: [...enemies, rollEnemy()] })}
          onAddCustom={(n, d) => set({ enemies: [...enemies, { who: n.trim() || "Sem nome", cause: d.trim(), threat: "", revenge: "", custom: true } satisfies LifepathEnemy] })}
          onRemove={(i) => set({ enemies: enemies.filter((_, j) => j !== i) })}
        />
        <Relations
          title="Amores trágicos" items={loves}
          onRollList={() => rollList("loves")}
          onRollOne={() => set({ loves: [...loves, rollLove()] })}
          onAddCustom={(n, d) => set({ loves: [...loves, customRelation(n, d)] })}
          onRemove={(i) => set({ loves: loves.filter((_, j) => j !== i) })}
        />
      </div>

      <div>
        <Field label="Aparência (texto livre)" style={labelStyle}>
          <textarea value={data.appearance} onChange={(e) => onChange({ appearance: e.target.value })} placeholder="Altura, cicatrizes, estilo, o que as pessoas notam primeiro…" style={areaStyle} />
        </Field>
      </div>
    </div>
  );
}

/** Um campo do caminho de vida: escolher na tabela, rolar ou escrever o próprio texto. */
function LifeField({ label, table, value, onChange, onRoll }: {
  label: string; table: readonly string[]; value: string; onChange: (v: string) => void; onRoll: () => void;
}) {
  const options = Array.from(new Set(table));
  const inTable = options.includes(value);
  return (
    <div style={{ minWidth: 0 }}>
      <span style={labelStyle}>{label}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <select aria-label={label} value={inTable ? value : ""} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
          <option value="">{value && !inTable ? "— texto próprio —" : "—"}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <button type="button" onClick={onRoll} aria-label={`Sortear ${label}`} style={pillBtn}>🎲</button>
      </div>
      <input
        aria-label={`${label}: escrever o meu`} placeholder="Escrever o meu…" maxLength={120}
        value={inTable ? "" : value} onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, marginTop: 6 }}
      />
    </div>
  );
}

/** Lista de amigos, inimigos ou amores: sortear, escrever à mão e remover. */
function Relations({ title, items, onRollList, onRollOne, onAddCustom, onRemove }: {
  title: string; items: string[];
  onRollList: () => void; onRollOne: () => void;
  onAddCustom: (name: string, description: string) => void; onRemove: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const canAdd = name.trim().length > 0 || desc.trim().length > 0;

  return (
    <div style={{ padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" onClick={onRollList} aria-label={`Sortear lista de ${title}`} title="d10 − 7 define quantos; sorteia cada um" style={pillBtn}>🎲 Lista</button>
        <button type="button" onClick={onRollOne} aria-label={`Sortear mais um em ${title}`} style={pillBtn}>🎲 +1</button>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} style={pillBtn}>✎ Escrever o meu</button>
      </div>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input aria-label={`${title}: nome`} placeholder="Nome" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          <input aria-label={`${title}: descrição`} placeholder="Descrição" maxLength={200} value={desc} onChange={(e) => setDesc(e.target.value)} style={inputStyle} />
          <div>
            <PrimaryButton
              disabled={!canAdd} style={{ padding: "6px 16px", minHeight: 32 }}
              onClick={() => { onAddCustom(name, desc); setName(""); setDesc(""); }}
            >
              Adicionar
            </PrimaryButton>
          </div>
        </div>
      )}

      {items.length === 0
        ? <p style={{ fontSize: "0.76rem", color: CP.textSubtle }}>Nenhum por enquanto.</p>
        : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((t, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{t}</span>
                <button type="button" onClick={() => onRemove(i)} aria-label={`Remover ${t}`} style={{ ...dangerBtn, minHeight: 28, padding: "0 10px" }}>×</button>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
