"use client";

import { useState } from "react";
import {
  ATTR_DICE, ATTR_LABELS, ATTR_ABBR,
  rollAttr, rollAll, rollSorteForAge, applyAgeModifiers,
  calcPV, calcPM, calcMOV, calcDamageBonus, calcCorpo,
  half, fifth,
  type AttrKey, type CthulhuAttrs,
} from "@/lib/cthulhu/data";
import type { WizardData } from "../CthulhuWizard";

const ACCENT       = "#7d9c3e";
const ACCENT_LIGHT  = "#a3b86c";
const ACCENT_DIM   = "rgba(125,156,62,0.12)";
const ACCENT_BORD  = "rgba(125,156,62,0.28)";

const ATTR_KEYS: AttrKey[] = ["for", "con", "tam", "des", "apa", "int", "pod", "edu"];

interface Props {
  data: Partial<WizardData>;
  onChange: (p: Partial<WizardData>) => void;
}

export function StepAttrs({ data, onChange }: Props) {
  const [name,    setName]    = useState(data.name ?? "");
  const [era,     setEra]     = useState<"1920s" | "modern">(data.era ?? "1920s");
  const [age,     setAge]     = useState(data.age ?? 25);
  const [raw,     setRaw]     = useState<CthulhuAttrs | null>(data.attrs ?? null);
  const [rolling, setRolling] = useState<AttrKey | "all" | null>(null);

  const attrs = raw ? applyAgeModifiers(raw, age) : null;

  function emit(overrides: { n?: string; e?: "1920s" | "modern"; a?: number; r?: CthulhuAttrs | null }) {
    const n = overrides.n ?? name;
    const e = overrides.e ?? era;
    const a = overrides.a ?? age;
    const r = overrides.r !== undefined ? overrides.r : raw;
    const computed = r ? applyAgeModifiers(r, a) : null;
    onChange({ name: n, era: e, age: a, ...(computed ? { attrs: computed } : {}) });
  }

  function handleName(v: string) { setName(v); emit({ n: v }); }
  function handleEra(v: "1920s" | "modern") { setEra(v); emit({ e: v }); }
  function handleAge(v: number) { setAge(v); emit({ a: v }); }

  function doRollAll() {
    setRolling("all");
    setTimeout(() => {
      const r = rollAll();
      r.sorte = rollSorteForAge(age);
      setRaw(r);
      setRolling(null);
      emit({ r });
    }, 260);
  }

  function doRollOne(key: AttrKey) {
    setRolling(key);
    setTimeout(() => {
      const next = raw ? { ...raw } : rollAll();
      next[key] = rollAttr(key);
      setRaw(next);
      emit({ r: next });
      setRolling(null);
    }, 220);
  }

  function doRollSorte() {
    if (!raw) return;
    const next = { ...raw, sorte: rollSorteForAge(age) };
    setRaw(next);
    emit({ r: next });
  }

  const diceLabel = (key: AttrKey) => {
    const { count, sides, add } = ATTR_DICE[key];
    return add > 0 ? `(${count}D${sides}+${add})×5` : `${count}D${sides}×5`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.3rem, 3vw, 1.7rem)", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
          Gerar <span style={{ color: ACCENT }}>Atributos</span>
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          Role os dados para determinar os valores base do investigador. Modificadores de idade são aplicados automaticamente.
        </p>
      </div>

      {/* Name + Era + Age */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Nome do Investigador *
          </span>
          <input
            value={name}
            onChange={(e) => handleName(e.target.value)}
            placeholder="Ex.: Henry Armitage"
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "9px 12px",
              color: "var(--text)", fontSize: "0.9rem", outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = ACCENT_BORD)}
            onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Era</span>
          <select
            value={era}
            onChange={(e) => handleEra(e.target.value as "1920s" | "modern")}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "9px 12px",
              color: "var(--text)", fontSize: "0.88rem", cursor: "pointer",
            }}
          >
            <option value="1920s">Anos 1920</option>
            <option value="modern">Moderno</option>
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Idade</span>
          <input
            type="number" min={15} max={90}
            value={age}
            onChange={(e) => handleAge(Math.max(15, Math.min(90, parseInt(e.target.value) || 25)))}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "9px 12px",
              color: "var(--text)", fontSize: "0.9rem", width: 80, textAlign: "center",
            }}
          />
        </label>
      </div>

      {/* Roll All */}
      <button
        onClick={doRollAll}
        disabled={rolling !== null}
        style={{
          alignSelf: "flex-start",
          padding: "10px 22px",
          background: rolling ? "var(--surface-2)" : `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`,
          color: rolling ? "var(--text-muted)" : "#06090f",
          border: "none", borderRadius: "var(--radius)",
          fontSize: "0.86rem", fontWeight: 700,
          cursor: rolling ? "not-allowed" : "pointer",
          transition: "all 0.18s",
        }}
      >
        {rolling === "all" ? "Rolando…" : "🎲 Rolar Todos os Atributos"}
      </button>

      {/* Attribute rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {ATTR_KEYS.map((key) => {
          const val       = attrs?.[key] ?? null;
          const isRolling = rolling === key || rolling === "all";

          return (
            <div
              key={key}
              style={{
                display: "grid",
                gridTemplateColumns: "130px 1fr 80px 70px 60px 36px",
                alignItems: "center", gap: 10,
                padding: "12px 14px",
                background: val !== null ? ACCENT_DIM : "var(--surface)",
                border: `1px solid ${val !== null ? ACCENT_BORD : "rgba(255,255,255,0.07)"}`,
                borderRadius: "var(--radius)",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: ACCENT_LIGHT }}>{ATTR_ABBR[key]}</span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginLeft: 4 }}>({diceLabel(key)})</span>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{ATTR_LABELS[key]}</span>
              <span
                style={{
                  fontSize: "1.3rem", fontWeight: 800,
                  fontFamily: "var(--font-cinzel), serif",
                  color: val !== null ? "var(--text)" : "var(--text-subtle)",
                  opacity: isRolling ? 0.4 : 1,
                  transition: "opacity 0.15s",
                  textAlign: "right",
                }}
              >
                {val !== null ? val : "—"}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right" }}>
                {val !== null ? `½ ${half(val)}` : ""}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right" }}>
                {val !== null ? `⅕ ${fifth(val)}` : ""}
              </span>
              <button
                onClick={() => doRollOne(key)}
                disabled={rolling !== null}
                style={{
                  width: 30, height: 30, borderRadius: "var(--radius-xs)",
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  color: "var(--text-muted)", cursor: rolling ? "not-allowed" : "pointer",
                  fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center",
                }}
                title="Rerolar este atributo"
              >
                🎲
              </button>
            </div>
          );
        })}

        {/* Sorte */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "130px 1fr 80px 70px 60px 36px",
            alignItems: "center", gap: 10,
            padding: "12px 14px",
            background: raw?.sorte !== undefined ? "rgba(125,156,62,0.06)" : "var(--surface)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "var(--radius)",
          }}
        >
          <div>
            <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-muted)" }}>SORTE</span>
            <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginLeft: 4 }}>{age < 20 ? "(melhor de 2× 3D6×5)" : "(3D6×5)"}</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Sorte</span>
          <span style={{ fontSize: "1.3rem", fontWeight: 800, fontFamily: "var(--font-cinzel), serif", color: "var(--text)", textAlign: "right" }}>
            {raw?.sorte !== undefined ? raw.sorte : "—"}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right" }}>
            {raw?.sorte !== undefined ? `½ ${half(raw.sorte)}` : ""}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right" }}>
            {raw?.sorte !== undefined ? `⅕ ${fifth(raw.sorte)}` : ""}
          </span>
          <button
            onClick={doRollSorte}
            disabled={!raw || rolling !== null}
            style={{
              width: 30, height: 30, borderRadius: "var(--radius-xs)",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              color: "var(--text-muted)", cursor: (!raw || rolling) ? "not-allowed" : "pointer",
              fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            🎲
          </button>
        </div>
      </div>

      {/* Age modifier notice */}
      {raw && (
        <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "var(--radius)", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          {age < 20 && `Investigador jovem (${age} anos): EDU −5, FOR −3, TAM −2. Role a Sorte duas vezes e use o maior valor.`}
          {age >= 20 && age < 40 && `Investigador adulto (${age} anos): 1 verificação de melhoria de EDU aplicada automaticamente.`}
          {age >= 40 && age < 50 && `Investigador maduro (${age} anos): 2 melhorias de EDU, −5 em FOR/CON/DES total, −5 APA.`}
          {age >= 50 && age < 60 && `Investigador experiente (${age} anos): 3 melhorias de EDU, −10 em FOR/CON/DES total, −10 APA.`}
          {age >= 60 && age < 70 && `Investigador idoso (${age} anos): 4 melhorias de EDU, −20 em FOR/CON/DES total, −15 APA.`}
          {age >= 70 && age < 80 && `Investigador veterano (${age} anos): 4 melhorias de EDU, −40 em FOR/CON/DES total, −20 APA.`}
          {age >= 80 && `Investigador ancião (${age} anos): 4 melhorias de EDU, −80 em FOR/CON/DES total, −25 APA.`}
        </div>
      )}

      {/* Derived stats */}
      {attrs && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
          {[
            { label: "PV Máximo",  value: `${calcPV(attrs)}` },
            { label: "PM Máximo",  value: `${calcPM(attrs)}` },
            { label: "Sanidade",   value: `${attrs.pod}` },
            { label: "Sorte",      value: `${raw?.sorte ?? attrs.sorte}` },
            { label: "Movimento",  value: `${calcMOV(attrs, age)}` },
            { label: "Dano Extra", value: calcDamageBonus(attrs) },
            { label: "Corpo",      value: `${calcCorpo(attrs) > 0 ? "+" : ""}${calcCorpo(attrs)}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", textAlign: "center" }}>
              <div style={{ fontSize: "0.66rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-cinzel), serif", color: ACCENT_LIGHT }}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
