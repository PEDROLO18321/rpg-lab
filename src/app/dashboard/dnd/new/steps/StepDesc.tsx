"use client";

import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import { RACES } from "@/lib/dnd/races";
import { randomPhysical, pick } from "@/lib/dnd/physicalTraits";
import type { WizardData, DescData } from "../CharacterWizard";

const STANDARD_LANGUAGES = [
  "Anão", "Élfico", "Gnômico", "Halfling", "Orc", "Goblin", "Gigante",
];
const EXOTIC_LANGUAGES = [
  "Abissal", "Celestial", "Dracônico", "Infernal", "Dialeto Subterrâneo", "Primordial", "Silvestre", "Subcomum",
];

const ALIGNMENTS = [
  { id: "lg", label: "Leal e Bom",      abbr: "LB" },
  { id: "ng", label: "Neutro e Bom",    abbr: "NB" },
  { id: "cg", label: "Caótico e Bom",   abbr: "CB" },
  { id: "ln", label: "Leal e Neutro",   abbr: "LN" },
  { id: "nn", label: "Neutro",          abbr: "N"  },
  { id: "cn", label: "Caótico e Neutro",abbr: "CN" },
  { id: "le", label: "Leal e Mau",      abbr: "LM" },
  { id: "ne", label: "Neutro e Mau",    abbr: "NM" },
  { id: "ce", label: "Caótico e Mau",   abbr: "CM" },
];

interface Props {
  backgroundId:      string | null;
  raceId:            string | null;
  subraceId:         string | null;
  desc:              Partial<DescData>;
  selectedLanguages: string[];
  onChange:          (partial: Partial<WizardData>) => void;
}

export function StepDesc({ backgroundId, raceId, subraceId, desc, selectedLanguages, onChange }: Props) {
  const bg      = BACKGROUNDS.find((b) => b.id === backgroundId);
  const race    = raceId ? RACES.find((r) => r.id === raceId) : null;
  const subrace = subraceId ? race?.subraces.find((s) => s.id === subraceId) : null;
  const totalLanguages = (bg?.languages ?? 0) + (subrace?.languages ?? 0) + (race?.languageBonus ?? 0);

  function set(key: keyof DescData, value: string) {
    onChange({ desc: { ...desc, [key]: value } } as Partial<WizardData>);
  }

  function randomizePhysical() {
    const r = randomPhysical(raceId);
    if (!r) return;
    onChange({
      desc: {
        ...desc,
        age:    r.age,
        height: r.height,
        weight: r.weight,
        eyes:   r.eyes,
        skin:   r.skin,
        hair:   r.hair,
      },
    } as Partial<WizardData>);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {/* Heading */}
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 6 }}>
          Passo 5 · Descrição
        </span>
        <h2
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
            fontWeight: 700,
            color: "var(--text)",
            lineHeight: 1.2,
          }}
        >
          Descreva o seu <span className="text-gold">Personagem</span>
        </h2>
        <p style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Alinhamento é obrigatório. Os demais campos são opcionais — você pode preencher depois.
        </p>
      </div>

      {/* Alignment */}
      <Section label="Alinhamento" required>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          {ALIGNMENTS.map((a) => {
            const sel = desc.alignment === a.id;
            return (
              <button
                key={a.id}
                onClick={() => set("alignment", sel ? "" : a.id)}
                style={{
                  background: sel ? "var(--accent-dim)" : "var(--surface-2)",
                  border: `1px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "12px 10px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: sel ? "var(--accent-light)" : "var(--text)",
                    marginBottom: 2,
                  }}
                >
                  {a.abbr}
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{a.label}</p>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Physical appearance */}
      <Section label="Aparência Física">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <RandomButton
            onClick={randomizePhysical}
            disabled={!raceId}
            title={raceId ? "Gerar aparência aleatória baseada na raça" : "Selecione uma raça primeiro"}
            label="Gerar tudo"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          <FieldWithRandom
            label="Idade"
            placeholder="Ex: 27 anos"
            value={desc.age ?? ""}
            onChange={(v) => set("age", v)}
            onRandom={raceId ? () => {
              const r = randomPhysical(raceId);
              if (r) set("age", r.age);
            } : undefined}
          />
          <FieldWithRandom
            label="Altura"
            placeholder="Ex: 1,75 m"
            value={desc.height ?? ""}
            onChange={(v) => set("height", v)}
            onRandom={raceId ? () => {
              const r = randomPhysical(raceId);
              if (r) set("height", r.height);
            } : undefined}
          />
          <FieldWithRandom
            label="Peso"
            placeholder="Ex: 70 kg"
            value={desc.weight ?? ""}
            onChange={(v) => set("weight", v)}
            onRandom={raceId ? () => {
              const r = randomPhysical(raceId);
              if (r) set("weight", r.weight);
            } : undefined}
          />
          <FieldWithRandom
            label="Olhos"
            placeholder="Ex: Castanhos"
            value={desc.eyes ?? ""}
            onChange={(v) => set("eyes", v)}
            onRandom={raceId ? () => {
              const r = randomPhysical(raceId);
              if (r) set("eyes", r.eyes);
            } : undefined}
          />
          <FieldWithRandom
            label="Pele"
            placeholder="Ex: Bronzeada"
            value={desc.skin ?? ""}
            onChange={(v) => set("skin", v)}
            onRandom={raceId ? () => {
              const r = randomPhysical(raceId);
              if (r) set("skin", r.skin);
            } : undefined}
          />
          <FieldWithRandom
            label="Cabelo"
            placeholder="Ex: Preto longo"
            value={desc.hair ?? ""}
            onChange={(v) => set("hair", v)}
            onRandom={raceId ? () => {
              const r = randomPhysical(raceId);
              if (r) set("hair", r.hair);
            } : undefined}
          />
        </div>
      </Section>

      {/* Personality */}
      <Section label="Personalidade">
        {bg && (
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.5 }}>
            Sugestões do antecedente <strong style={{ color: "var(--accent-light)" }}>{bg.name}</strong> aparecem
            abaixo — clique para usar ou escreva livremente.
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <PersonalityField
            label="Traço de Personalidade"
            placeholder="Como as pessoas ao redor percebem você?"
            value={desc.personalityTrait ?? ""}
            suggestions={bg?.personalityTraits ?? []}
            onChange={(v) => set("personalityTrait", v)}
          />
          <PersonalityField
            label="Ideal"
            placeholder="O que guia suas ações e decisões?"
            value={desc.ideal ?? ""}
            suggestions={bg?.ideals ?? []}
            onChange={(v) => set("ideal", v)}
          />
          <PersonalityField
            label="Vínculo"
            placeholder="O que ou quem você protege acima de tudo?"
            value={desc.bond ?? ""}
            suggestions={bg?.bonds ?? []}
            onChange={(v) => set("bond", v)}
          />
          <PersonalityField
            label="Fraqueza"
            placeholder="Qual é o seu ponto fraco ou vício?"
            value={desc.flaw ?? ""}
            suggestions={bg?.flaws ?? []}
            onChange={(v) => set("flaw", v)}
          />
        </div>
      </Section>

      {/* Languages */}
      {totalLanguages > 0 && (
        <Section label={`Línguas Adicionais — escolha ${totalLanguages}`}>
          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
            {bg && (bg.languages ?? 0) > 0 && (
              <>Antecedente <strong style={{ color: "var(--accent-light)" }}>{bg.name}</strong>: {bg.languages} língua{bg.languages > 1 ? "s" : ""}.{" "}</>
            )}
            {(subrace?.languages ?? 0) > 0 && (
              <>Sub-raça <strong style={{ color: "var(--accent-light)" }}>{subrace!.name}</strong>: {subrace!.languages} língua adicional.{" "}</>
            )}
            {(race?.languageBonus ?? 0) > 0 && (
              <>Raça <strong style={{ color: "var(--accent-light)" }}>{race!.name}</strong>: {race!.languageBonus} língua adicional.</>
            )}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <LangGroup
              label="Línguas Padrão"
              langs={STANDARD_LANGUAGES}
              selected={selectedLanguages}
              max={totalLanguages}
              onChange={(l) => onChange({ selectedLanguages: l })}
            />
            <LangGroup
              label="Línguas Exóticas"
              langs={EXOTIC_LANGUAGES}
              selected={selectedLanguages}
              max={totalLanguages}
              onChange={(l) => onChange({ selectedLanguages: l })}
            />
          </div>
        </Section>
      )}

      {/* Backstory */}
      <Section label="História do Personagem">
        <textarea
          value={desc.backstory ?? ""}
          onChange={(e) => set("backstory", e.target.value)}
          placeholder="Escreva a história de origem do seu personagem…"
          rows={5}
          style={{
            width: "100%",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "12px 14px",
            color: "var(--text)",
            fontSize: "0.84rem",
            lineHeight: 1.7,
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      </Section>
    </div>
  );
}

/* ── helpers ── */

function Section({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 12,
        }}
      >
        {label}
        {required && <span style={{ color: "var(--accent)", marginLeft: 4 }}>*</span>}
      </p>
      {children}
    </div>
  );
}

function RandomButton({ onClick, disabled, title, label }: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: "6px 12px",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        color: disabled ? "var(--text-subtle)" : "var(--text-muted)",
        fontSize: "0.76rem",
        cursor: disabled ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
        transition: "border-color 0.2s, color 0.2s",
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = "var(--border-accent)";
          e.currentTarget.style.color = "var(--accent-light)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.color = disabled ? "var(--text-subtle)" : "var(--text-muted)";
      }}
    >
      {label}
    </button>
  );
}

function FieldWithRandom({
  label,
  placeholder,
  value,
  onChange,
  onRandom,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onRandom?: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </label>
        {onRandom && (
          <button
            type="button"
            onClick={onRandom}
            title={`Gerar ${label} aleatório`}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-subtle)",
              fontSize: "0.7rem",
              cursor: "pointer",
              padding: "0 2px",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-light)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-subtle)")}
          >
            Gerar
          </button>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "8px 12px",
          color: "var(--text)",
          fontSize: "0.84rem",
          outline: "none",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

function LangGroup({
  label, langs, selected, max, onChange,
}: {
  label:    string;
  langs:    string[];
  selected: string[];
  max:      number;
  onChange: (l: string[]) => void;
}) {
  function toggle(lang: string) {
    if (selected.includes(lang)) {
      onChange(selected.filter((x) => x !== lang));
    } else if (selected.length < max) {
      onChange([...selected, lang]);
    }
  }
  return (
    <div>
      <p style={{ fontSize: "0.66rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        {label}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {langs.map((lang) => {
          const sel = selected.includes(lang);
          const disabled = !sel && selected.length >= max;
          return (
            <button
              key={lang}
              onClick={() => toggle(lang)}
              disabled={disabled}
              style={{
                padding: "5px 12px",
                background: sel ? "var(--accent-dim)" : "var(--surface-2)",
                border: `1px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                color: sel ? "var(--accent-light)" : disabled ? "var(--text-subtle)" : "var(--text-muted)",
                fontSize: "0.78rem",
                fontWeight: sel ? 700 : 400,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.4 : 1,
                transition: "all 0.15s",
              }}
            >
              {lang}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PersonalityField({
  label,
  placeholder,
  value,
  suggestions,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  suggestions: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </label>
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => onChange(pick(suggestions))}
            title={`Gerar ${label} aleatório`}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-subtle)",
              fontSize: "0.7rem",
              cursor: "pointer",
              padding: "0 2px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-light)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-subtle)")}
          >
            Aleatório
          </button>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "10px 12px",
          color: "var(--text)",
          fontSize: "0.84rem",
          lineHeight: 1.6,
          resize: "vertical",
          outline: "none",
          fontFamily: "inherit",
          boxSizing: "border-box",
          width: "100%",
        }}
      />
      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ fontSize: "0.65rem", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Sugestões
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onChange(s)}
                style={{
                  background: value === s ? "var(--accent-dim)" : "var(--surface)",
                  border: `1px solid ${value === s ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  padding: "6px 12px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.76rem",
                  color: value === s ? "var(--accent-light)" : "var(--text-muted)",
                  lineHeight: 1.5,
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
