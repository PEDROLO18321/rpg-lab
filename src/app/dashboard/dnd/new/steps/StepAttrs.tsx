"use client";

import { useState, useMemo } from "react";
import { RACES, ABILITY_LABELS } from "@/lib/dnd/races";
import { CLASSES } from "@/lib/dnd/classes";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import type { AbilityKey } from "@/lib/dnd/races";
import type { WizardData } from "../CharacterWizard";
import "../../dnd-responsive.css";

/* ── constants ──────────────────────────────────────────────────────── */

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

const ABILITY_SHORT: Record<AbilityKey, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};

// Descrição de cada atributo conforme o livro base
const ABILITY_DESC: Record<AbilityKey, string> = {
  str: "Poder físico, atletismo e força bruta",
  dex: "Agilidade, reflexos, equilíbrio e furtividade",
  con: "Saúde, resistência e pontos de vida",
  int: "Raciocínio, memória e conhecimento arcano",
  wis: "Percepção, intuição e sintonia com o mundo",
  cha: "Força de personalidade, eloquência e liderança",
};

// Perícias que Constituição NÃO possui (regra explícita do livro base)
// Mapa completo das 18 perícias → atributo governante
const SKILL_MAP: Record<string, AbilityKey> = {
  // Força
  "Atletismo":          "str",
  // Destreza
  "Acrobacia":          "dex",
  "Furtividade":        "dex",
  "Prestidigitação":    "dex",
  // Inteligência
  "Arcanismo":          "int",
  "História":           "int",
  "Investigação":       "int",
  "Natureza":           "int",
  "Religião":           "int",
  // Sabedoria
  "Adestrar Animais":   "wis",
  "Intuição":           "wis",
  "Medicina":           "wis",
  "Percepção":          "wis",
  "Sobrevivência":      "wis",
  // Carisma
  "Atuação":            "cha",
  "Enganação":          "cha",
  "Intimidação":        "cha",
  "Persuasão":          "cha",
  // Constituição: nenhuma perícia (regra oficial)
};

// Custo de compra de pontos (base 8, máximo 15 antes dos bônus raciais)
// Valores altos custam proporcionalmente mais — regra oficial
const POINT_COST: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const TOTAL_POINTS   = 27;
const PROF_BONUS     = 2; // bônus de proficiência fixo no nível 1

type Method = "pointbuy" | "standard";

/* ── helpers ────────────────────────────────────────────────────────── */

function mod(score: number) {
  return Math.floor((score - 10) / 2);
}
function signed(n: number) {
  return n >= 0 ? `+${n}` : `${n}`;
}
function pointsSpent(bases: Record<AbilityKey, number>) {
  return ABILITIES.reduce((acc, k) => acc + (POINT_COST[bases[k]] ?? 0), 0);
}

/* ── component ──────────────────────────────────────────────────────── */

interface Props {
  raceId:         string | null;
  subraceId:      string | null;
  classId:        string | null;
  backgroundId:   string | null;
  bases:          Partial<Record<AbilityKey, number>>;
  selectedSkills: string[];
  onChange:       (partial: Partial<WizardData>) => void;
}

export function StepAttrs({ raceId, subraceId, classId, backgroundId, bases, selectedSkills, onChange }: Props) {
  const [method, setMethod] = useState<Method>("pointbuy");
  const [stdAssign, setStdAssign] = useState<Record<number, AbilityKey | "">>(() =>
    STANDARD_ARRAY.reduce((acc, _, i) => ({ ...acc, [i]: "" }), {} as Record<number, AbilityKey | "">)
  );

  const race    = RACES.find((r) => r.id === raceId);
  const subrace = race?.subraces.find((s) => s.id === subraceId);
  const cls     = CLASSES.find((c) => c.id === classId);
  const bg      = BACKGROUNDS.find((b) => b.id === backgroundId);
  const bgSkills = bg?.skills ?? [];

  // Bônus raciais mesclados (raça + sub-raça)
  const racialBonus = useMemo<Partial<Record<AbilityKey, number>>>(() => {
    const bonus: Partial<Record<AbilityKey, number>> = {};
    if (race)    for (const [k, v] of Object.entries(race.baseBonus)    as [AbilityKey, number][]) bonus[k] = (bonus[k] ?? 0) + v;
    if (subrace) for (const [k, v] of Object.entries(subrace.bonus)     as [AbilityKey, number][]) bonus[k] = (bonus[k] ?? 0) + v;
    return bonus;
  }, [race, subrace]);

  // Valores base efetivos (padrão 8)
  const effectiveBases = useMemo<Record<AbilityKey, number>>(() => ({
    str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8,
    ...bases,
  }), [bases]);

  function getStdBases(): Record<AbilityKey, number> {
    const result: Record<AbilityKey, number> = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
    for (const [slotStr, ability] of Object.entries(stdAssign)) {
      if (ability) result[ability] = STANDARD_ARRAY[Number(slotStr)];
    }
    return result;
  }

  const displayBases = method === "standard" ? getStdBases() : effectiveBases;
  const spent        = pointsSpent(effectiveBases);
  const remaining    = TOTAL_POINTS - spent;

  // Valores finais = base + bônus racial
  const finalScores = useMemo<Record<AbilityKey, number>>(() =>
    ABILITIES.reduce((acc, k) => ({
      ...acc,
      [k]: displayBases[k] + (racialBonus[k] ?? 0),
    }), {} as Record<AbilityKey, number>),
    [displayBases, racialBonus]
  );

  // Percepção Passiva = 10 + mod SAB + (2 se proficiente em Percepção)
  const passivePerception = 10 + mod(finalScores.wis) + (selectedSkills.includes("Percepção") ? PROF_BONUS : 0);

  function setBase(key: AbilityKey, val: number) {
    onChange({ abilityBases: { ...effectiveBases, [key]: val } });
  }

  function changeMethod(m: Method) {
    setMethod(m);
    setStdAssign(STANDARD_ARRAY.reduce((acc, _, i) => ({ ...acc, [i]: "" }), {} as Record<number, AbilityKey | "">));
    onChange({ abilityBases: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 } });
  }

  function assignStdSlot(slotIdx: number, ability: AbilityKey | "") {
    const newAssign = { ...stdAssign };
    if (ability) for (const k of Object.keys(newAssign)) if (newAssign[Number(k)] === ability) newAssign[Number(k)] = "";
    newAssign[slotIdx] = ability;
    setStdAssign(newAssign);
    const newBases: Record<AbilityKey, number> = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
    for (const [sStr, ab] of Object.entries(newAssign)) if (ab) newBases[ab] = STANDARD_ARRAY[Number(sStr)];
    onChange({ abilityBases: newBases });
  }

  function toggleSkill(skill: string) {
    const has = selectedSkills.includes(skill);
    if (has) {
      onChange({ selectedSkills: selectedSkills.filter((s) => s !== skill) });
    } else {
      if (selectedSkills.length >= (cls?.skillCount ?? 2)) return;
      onChange({ selectedSkills: [...selectedSkills, skill] });
    }
  }

  // Saves com bônus calculados
  const saveBonus = (saveName: string): number => {
    const map: Record<string, AbilityKey> = {
      "Força": "str", "Destreza": "dex", "Constituição": "con",
      "Inteligência": "int", "Sabedoria": "wis", "Carisma": "cha",
    };
    const key = map[saveName];
    if (!key) return 0;
    const isProficient = cls?.savingThrows.includes(saveName) ?? false;
    return mod(finalScores[key]) + (isProficient ? PROF_BONUS : 0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Heading */}
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 6 }}>
          Passo 3 · Atributos & Perícias
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
          Distribua os <span className="text-gold">Atributos</span>
        </h2>
        <p style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Os seis atributos definem as capacidades físicas e mentais do personagem. Cada um possui um
          modificador calculado como <strong style={{ color: "var(--text)" }}>⌊(valor − 10) ÷ 2⌋</strong>, que é o número
          efetivamente usado nas jogadas.
        </p>
      </div>

      {/* Método */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: 6,
            width: "fit-content",
          }}
        >
          {(["pointbuy", "standard"] as Method[]).map((m) => (
            <button
              key={m}
              onClick={() => changeMethod(m)}
              style={{
                padding: "8px 20px",
                background: method === m ? "var(--accent-dim)" : "none",
                border: method === m ? "1px solid var(--accent)" : "1px solid transparent",
                borderRadius: "var(--radius-lg)",
                color: method === m ? "var(--accent-light)" : "var(--text-muted)",
                fontSize: "0.82rem",
                fontWeight: method === m ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {m === "pointbuy" ? "Compra de Pontos" : "Array Padrão"}
            </button>
          ))}
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          {method === "pointbuy"
            ? `Você tem ${TOTAL_POINTS} pontos. Valores de 8 a 15 (antes dos bônus raciais). Valores altos custam mais: 14 custa 7 pts, 15 custa 9 pts.`
            : "Atribua os valores 15, 14, 13, 12, 10 e 8 — um para cada atributo. Nenhum valor pode ser repetido."}
        </p>
      </div>

      {/* Compra de pontos */}
      {method === "pointbuy" && (
        <>
          <div
            style={{
              background: remaining === 0 ? "var(--accent-dim)" : "var(--surface)",
              border: `1px solid ${remaining === 0 ? "var(--accent)" : remaining < 0 ? "#ef4444" : "var(--border)"}`,
              borderRadius: "var(--radius)",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Pontos disponíveis — bônus racial aplicado depois
            </span>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: remaining === 0 ? "var(--accent-light)" : remaining < 0 ? "#ef4444" : "var(--text)",
              }}
            >
              {remaining} / {TOTAL_POINTS}
            </span>
          </div>

          <div className="dnd-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {ABILITIES.map((key) => {
              const base   = effectiveBases[key];
              const racial = racialBonus[key] ?? 0;
              const cost   = POINT_COST[base] ?? 0;
              const nextCost = base < 15 ? (POINT_COST[base + 1] ?? 99) - cost : 99;
              const canInc = base < 15 && remaining >= nextCost;
              const canDec = base > 8;
              return (
                <AbilityCard
                  key={key}
                  abilityKey={key}
                  base={base}
                  racial={racial}
                  final={base + racial}
                  onInc={canInc ? () => setBase(key, base + 1) : undefined}
                  onDec={canDec ? () => setBase(key, base - 1) : undefined}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Array padrão */}
      {method === "standard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {STANDARD_ARRAY.map((val, idx) => {
              const assigned = stdAssign[idx];
              return (
                <div
                  key={idx}
                  style={{
                    background: assigned ? "var(--accent-dim)" : "var(--surface)",
                    border: `1px solid ${assigned ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 88,
                  }}
                >
                  <span style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-cinzel), serif", color: assigned ? "var(--accent-light)" : "var(--text)" }}>
                    {val}
                  </span>
                  <select
                    value={assigned}
                    onChange={(e) => assignStdSlot(idx, e.target.value as AbilityKey | "")}
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-xs)",
                      color: "var(--text)",
                      fontSize: "0.72rem",
                      padding: "3px 6px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    <option value="">— atribuir —</option>
                    {ABILITIES.map((k) => (
                      <option key={k} value={k}>
                        {ABILITY_SHORT[k]} — {ABILITY_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <div className="dnd-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {ABILITIES.map((key) => {
              const base   = displayBases[key];
              const racial = racialBonus[key] ?? 0;
              return (
                <AbilityCard
                  key={key}
                  abilityKey={key}
                  base={base}
                  racial={racial}
                  final={base + racial}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Testes de resistência e Percepção Passiva */}
      {cls && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Testes de Resistência
          </p>
          <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)", marginTop: -10, lineHeight: 1.5 }}>
            Cada classe concede proficiência em 2 testes de resistência. O bônus de proficiência (+{PROF_BONUS} no nível 1) é adicionado apenas nos saves da sua classe.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
            {(["Força", "Destreza", "Constituição", "Inteligência", "Sabedoria", "Carisma"] as const).map((saveName) => {
              const isProficient = cls.savingThrows.includes(saveName);
              const bonus        = saveBonus(saveName);
              return (
                <div
                  key={saveName}
                  style={{
                    background: isProficient ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${isProficient ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {isProficient && (
                      <span style={{ fontSize: "0.65rem", color: "var(--accent)", fontWeight: 900 }}>◆</span>
                    )}
                    <span style={{ fontSize: "0.8rem", color: isProficient ? "var(--accent-light)" : "var(--text-muted)", fontWeight: isProficient ? 700 : 400 }}>
                      {saveName}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: isProficient ? "var(--accent-light)" : "var(--text-muted)" }}>
                    {signed(bonus)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Percepção passiva */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>
                Percepção Passiva
              </p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 2 }}>
                10 + mod. SAB{selectedSkills.includes("Percepção") ? ` + ${PROF_BONUS} (prof.)` : ""} = {passivePerception}
              </p>
            </div>
            <span
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                fontFamily: "var(--font-cinzel), serif",
                color: "var(--accent-light)",
                background: "var(--accent-dim)",
                border: "1px solid var(--accent)",
                borderRadius: "var(--radius)",
                padding: "6px 14px",
              }}
            >
              {passivePerception}
            </span>
          </div>
        </div>
      )}

      {/* Perícias do Antecedente (travadas) */}
      {bgSkills.length > 0 && (
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
            Perícias do Antecedente — {bg?.name}
          </p>
          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
            Concedidas automaticamente pelo antecedente. Não podem ser removidas.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {bgSkills.map((skill) => {
              const abilityKey = SKILL_MAP[skill] ?? "str";
              const score      = finalScores[abilityKey];
              const totalBonus = mod(score) + PROF_BONUS;
              return (
                <div
                  key={skill}
                  style={{
                    background: "rgba(201,148,31,0.06)",
                    border: "1px solid rgba(201,148,31,0.25)",
                    borderRadius: "var(--radius)",
                    padding: "11px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    opacity: 0.9,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 18, height: 18,
                        borderRadius: 4,
                        border: "2px solid var(--accent)",
                        background: "var(--accent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "0.65rem", color: "#06090f", fontWeight: 900,
                      }}
                    >
                      ✓
                    </div>
                    <div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-light)" }}>
                        {skill}
                      </span>
                      <span style={{ marginLeft: 8, fontSize: "0.68rem", color: "var(--text-subtle)", fontStyle: "italic" }}>
                        antecedente
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2px 7px" }}>
                      {ABILITY_SHORT[abilityKey]}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--accent)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xs)", padding: "1px 5px" }}>
                      +{PROF_BONUS} prof.
                    </span>
                    <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--accent-light)", minWidth: 30, textAlign: "right" }}>
                      {signed(totalBonus)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seleção de perícias */}
      {cls && (
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
            Perícias da Classe — {cls.name}
            <span style={{ marginLeft: 10, fontWeight: 400, textTransform: "none", fontSize: "0.72rem", color: selectedSkills.length === cls.skillCount ? "var(--accent-light)" : "var(--text-subtle)" }}>
              {selectedSkills.length}/{cls.skillCount} escolhidas
            </span>
          </p>
          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.5 }}>
            Com proficiência você adiciona o bônus de proficiência (+{PROF_BONUS}) ao modificador do atributo quando realizar um teste nessa perícia.
            Constituição não possui perícias associadas segundo as regras oficiais.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {cls.skillChoices.map((skill) => {
              const abilityKey  = SKILL_MAP[skill] ?? "str";
              const score       = finalScores[abilityKey];
              const isFromBg    = bgSkills.includes(skill);
              const isSelected  = selectedSkills.includes(skill) || isFromBg;
              const totalBonus  = mod(score) + (isSelected ? PROF_BONUS : 0);
              const isDisabled  = isFromBg || (!selectedSkills.includes(skill) && selectedSkills.length >= cls.skillCount);
              return (
                <button
                  key={skill}
                  onClick={() => !isFromBg && toggleSkill(skill)}
                  disabled={isDisabled}
                  style={{
                    background: isSelected ? "var(--accent-dim)" : "var(--surface)",
                    border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    padding: "11px 16px",
                    cursor: isDisabled ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    opacity: isDisabled ? 0.4 : 1,
                    transition: "border-color 0.2s, background 0.2s, opacity 0.2s",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Checkbox visual */}
                    <div
                      style={{
                        width: 18, height: 18,
                        borderRadius: 4,
                        border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                        background: isSelected ? "var(--accent)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "0.65rem", color: "#06090f", fontWeight: 900,
                      }}
                    >
                      {isSelected && "✓"}
                    </div>
                    <div>
                      <span style={{ fontSize: "0.85rem", fontWeight: isSelected ? 700 : 400, color: isSelected ? "var(--accent-light)" : "var(--text)" }}>
                        {skill}
                      </span>
                      {isFromBg && (
                        <span style={{ marginLeft: 8, fontSize: "0.68rem", color: "var(--text-subtle)", fontStyle: "italic" }}>
                          antecedente
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {/* Atributo governante */}
                    <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2px 7px" }}>
                      {ABILITY_SHORT[abilityKey]}
                    </span>
                    {/* Modificador do atributo */}
                    <span style={{ fontSize: "0.76rem", color: "var(--text-subtle)", minWidth: 22, textAlign: "right" }}>
                      {signed(mod(score))}
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: "0.68rem", color: "var(--accent)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xs)", padding: "1px 5px" }}>
                        +{PROF_BONUS} prof.
                      </span>
                    )}
                    {/* Total */}
                    <span
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: isSelected ? "var(--accent-light)" : "var(--text-muted)",
                        minWidth: 30,
                        textAlign: "right",
                      }}
                    >
                      {signed(totalBonus)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── AbilityCard ────────────────────────────────────────────────────── */

function AbilityCard({
  abilityKey, base, racial, final, onInc, onDec,
}: {
  abilityKey: AbilityKey;
  base:       number;
  racial:     number;
  final:      number;
  onInc?:     () => void;
  onDec?:     () => void;
}) {
  const showControls = onInc !== undefined || onDec !== undefined;
  const m = Math.floor((final - 10) / 2);
  const isHigh = base >= 14;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${isHigh && showControls ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "14px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        transition: "border-color 0.2s",
      }}
    >
      {/* Header: abbrev + full name */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.64rem", fontWeight: 900, color: isHigh && showControls ? "var(--accent)" : "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {ABILITY_SHORT[abilityKey]}
        </p>
        <p style={{ fontSize: "0.65rem", color: "var(--text-subtle)", marginTop: 1, lineHeight: 1.2 }}>
          {ABILITY_LABELS[abilityKey]}
        </p>
      </div>

      {/* Base value + controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {showControls && (
          <button
            onClick={onDec}
            disabled={!onDec}
            style={{
              width: 24, height: 24, borderRadius: "var(--radius-xs)",
              background: onDec ? "var(--surface-2)" : "transparent",
              border: "1px solid var(--border)",
              color: onDec ? "var(--text)" : "var(--text-subtle)",
              fontSize: "1rem", fontWeight: 700,
              cursor: onDec ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >−</button>
        )}
        <span
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "1.8rem",
            fontWeight: 900,
            color: isHigh && showControls ? "var(--accent-light)" : "var(--text)",
            minWidth: 36, textAlign: "center",
            lineHeight: 1,
            transition: "color 0.2s",
          }}
        >
          {base}
        </span>
        {showControls && (
          <button
            onClick={onInc}
            disabled={!onInc}
            style={{
              width: 24, height: 24, borderRadius: "var(--radius-xs)",
              background: onInc ? "var(--surface-2)" : "transparent",
              border: "1px solid var(--border)",
              color: onInc ? "var(--text)" : "var(--text-subtle)",
              fontSize: "1rem", fontWeight: 700,
              cursor: onInc ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >+</button>
        )}
      </div>

      {/* Racial bonus */}
      {racial > 0 ? (
        <span style={{
          fontSize: "0.6rem", fontWeight: 700, color: "var(--accent-light)",
          background: "var(--accent-dim)", border: "1px solid var(--border-accent)",
          borderRadius: "var(--radius-xs)", padding: "1px 5px",
        }}>
          +{racial} racial
        </span>
      ) : <span style={{ height: 16 }} />}

      {/* Divider */}
      <div style={{ width: "100%", height: 1, background: "var(--border)" }} />

      {/* Final value + modifier */}
      <div style={{ textAlign: "center", lineHeight: 1 }}>
        <span style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "var(--text)",
        }}>
          {final}
        </span>
        <span style={{
          marginLeft: 5,
          fontSize: "0.8rem",
          fontWeight: 700,
          color: m >= 0 ? "var(--accent-light)" : "#ef4444",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xs)",
          padding: "1px 5px",
          display: "inline-block",
        }}>
          {m >= 0 ? `+${m}` : `${m}`}
        </span>
      </div>
    </div>
  );
}
