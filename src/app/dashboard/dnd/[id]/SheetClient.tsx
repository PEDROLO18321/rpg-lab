"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { RACES, ABILITY_LABELS } from "@/lib/dnd/races";
import { CLASSES } from "@/lib/dnd/classes";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import { SPELLCASTING } from "@/lib/dnd/spells";
import type { SpellcastingConfig } from "@/lib/dnd/spells";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DeleteCharacterButton } from "@/components/dashboard/DeleteCharacterButton";
import type { AbilityKey } from "@/lib/dnd/races";
import { WEAPONS, ALL_PHB_ITEMS, PICKER_GROUPS } from "@/lib/dnd/items";
import type { PickerGroup } from "@/lib/dnd/items";

// ── Constants ─────────────────────────────────────────────────────────────────

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_SHORT: Record<AbilityKey, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};
const SKILL_MAP: Record<string, AbilityKey> = {
  "Atletismo": "str",
  "Acrobacia": "dex", "Furtividade": "dex", "Prestidigitação": "dex",
  "Arcanismo": "int", "História": "int", "Investigação": "int", "Natureza": "int", "Religião": "int",
  "Adestrar Animais": "wis", "Intuição": "wis", "Medicina": "wis", "Percepção": "wis", "Sobrevivência": "wis",
  "Atuação": "cha", "Enganação": "cha", "Intimidação": "cha", "Persuasão": "cha",
};
const SAVE_ABILITY: Record<string, AbilityKey> = {
  "Força": "str", "Destreza": "dex", "Constituição": "con",
  "Inteligência": "int", "Sabedoria": "wis", "Carisma": "cha",
};
const CONDITIONS = [
  "Abalado", "Agarrado", "Assustado", "Cego", "Enfeitiçado",
  "Envenenado", "Exausto (Grau 1)", "Exausto (Grau 2)", "Exausto (Grau 3)",
  "Incapacitado", "Inconsciente", "Invisível",
  "Paralisado", "Petrificado", "Propenso", "Restrito", "Surdo",
];
const CONDITION_COLOR: Record<string, string> = {
  "Envenenado": "#2d7d2d", "Cego": "#666", "Paralisado": "#8b0000",
  "Inconsciente": "#1a0a2e", "Propenso": "#5d3a1a", "Petrificado": "#607d8b",
  "Assustado": "#4a1464", "Enfeitiçado": "#c94818", "Abalado": "#e25c00",
  "Invisível": "#455a64", "Restrito": "#4e342e", "Agarrado": "#6a1b9a",
  "Incapacitado": "#6b0000", "Surdo": "#546e7a",
};
const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;
type DiceType = typeof DICE_TYPES[number];
const PROF_BONUS = 2;
const ALIGNMENT_LABELS: Record<string, string> = {
  lg: "Leal e Bom", ng: "Neutro e Bom", cg: "Caótico e Bom",
  ln: "Leal e Neutro", nn: "Neutro", cn: "Caótico e Neutro",
  le: "Leal e Mau", ne: "Neutro e Mau", ce: "Caótico e Mau",
};

// PHB currency conversion (values in PC)
const CP_VALUE: Record<string, number> = { cp: 1, sp: 10, ep: 50, gp: 100, pp: 1000 };
const CURRENCY_LABEL: Record<string, string> = { cp: "PC", sp: "PP", ep: "PE", gp: "PO", pp: "PL" };
const CURRENCY_COLOR: Record<string, string> = {
  cp: "#b5651d", sp: "#aaaaaa", ep: "#7eb8b5", gp: "#c9941f", pp: "#8b5cf6",
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type SheetRow = {
  id: string;
  race: string | null;
  background: string | null;
  alignment: string | null;
  level: number;
  xp: number;
  str: number; dex: number; con: number; int: number; wis: number; cha: number;
  hpMax: number; hpCurrent: number; hpTemp: number;
  hitDice: string | null; hitDiceUsed: number;
  deathSavesSuccess: number; deathSavesFailure: number;
  armorClass: number; initiative: number; speed: number;
  inspiration: boolean;
  cp: number; sp: number; ep: number; gp: number; pp: number;
  conditions: string | null;
  spellSlotsUsed: string | null;
  classes: { id: string; className: string; subclass: string | null; level: number }[];
  skills: { id: string; skillName: string; proficient: boolean; expertise: boolean }[];
  spells: { id: string; spellName: string; level: number; school: string | null; prepared: boolean; castingTime: string | null; range: string | null; duration: string | null }[];
  equipment: { id: string; itemName: string; quantity: number; equipped: boolean; weight: number | null; description: string | null }[];
};

type RollEntry = {
  id: number;
  label: string;
  dice: number;
  count: number;
  modifier: number;
  rolls: number[];
  total: number;
  isCrit?: boolean;
  isFumble?: boolean;
  advantageMode?: "advantage" | "disadvantage";
  allRolls?: number[];
};

// per-slot boolean array: true = slot used
type SlotState = Record<string, boolean[]>;

interface Props {
  characterId: string;
  characterName: string;
  sheet: SheetRow;
  userName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mod(score: number) { return Math.floor((score - 10) / 2); }
function signed(n: number)  { return n >= 0 ? `+${n}` : `${n}`; }
function rollDie(sides: number) { return Math.floor(Math.random() * sides) + 1; }

function parseConditions(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function parseSlots(raw: string | null, maxPerLevel: Record<string, number>): SlotState {
  const make = (max: number) => Array.from({ length: max }, () => false);
  const empty = Object.fromEntries(Object.entries(maxPerLevel).map(([k, v]) => [k, make(v)]));
  if (!raw) return empty;
  try {
    const data = JSON.parse(raw);
    return Object.fromEntries(
      Object.entries(maxPerLevel).map(([level, max]) => {
        const stored = data[level];
        if (Array.isArray(stored)) return [level, stored.slice(0, max).map(Boolean)];
        // backward compat: old format stored count-used as number
        if (typeof stored === "number") return [level, Array.from({ length: max }, (_, i) => i < stored)];
        return [level, make(max)];
      })
    );
  } catch { return empty; }
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SheetClient({ characterId, characterName, sheet: initial, userName }: Props) {
  const [mode, setMode] = useState<"ficha" | "jogar">("ficha");

  // Mutable play-state
  const [hpCurrent, setHpCurrent] = useState(initial.hpCurrent);
  const [hpTemp,    setHpTemp]    = useState(initial.hpTemp);
  const [hitDiceUsed, setHitDiceUsed] = useState(initial.hitDiceUsed);
  const [dsSuccess, setDsSuccess] = useState(initial.deathSavesSuccess);
  const [dsFailure, setDsFailure] = useState(initial.deathSavesFailure);
  const [inspiration, setInspiration] = useState(initial.inspiration);
  const [conditions, setConditions]   = useState<string[]>(() => parseConditions(initial.conditions));
  const [gp, setGp] = useState(initial.gp);
  const [cp, setCp] = useState(initial.cp);
  const [sp, setSp] = useState(initial.sp);
  const [ep, setEp] = useState(initial.ep);
  const [pp, setPp] = useState(initial.pp);
  const [equipment, setEquipment] = useState(initial.equipment);

  // Lib data
  const [raceId, subraceId] = (initial.race ?? "").split("/");
  const race    = RACES.find((r) => r.id === raceId);
  const subrace = race?.subraces.find((s) => s.id === subraceId);
  const clsEntry = initial.classes[0];
  const cls = CLASSES.find((c) => c.id === clsEntry?.className);
  const bg  = BACKGROUNDS.find((b) => b.id === initial.background);
  const raceName = race ? (subrace ? `${race.name} (${subrace.name})` : race.name) : (initial.race ?? "—");

  const scores: Record<AbilityKey, number> = {
    str: initial.str, dex: initial.dex, con: initial.con,
    int: initial.int, wis: initial.wis, cha: initial.cha,
  };

  const proficientSaves = cls?.savingThrows ?? [];
  const proficientSkills = new Set(initial.skills.filter((s) => s.proficient).map((s) => s.skillName));
  const expertiseSkills  = new Set(initial.skills.filter((s) => s.expertise).map((s) => s.skillName));

  const spellConfig = clsEntry?.className ? SPELLCASTING[clsEntry.className] : null;
  const isCaster = !!spellConfig;
  const maxSlots: Record<string, number> = isCaster ? { "1": spellConfig.spellSlots1st } : {};

  // Slot state: must be init after maxSlots is computed
  const [slotsUsed, setSlotsUsed] = useState<SlotState>(() => parseSlots(initial.spellSlotsUsed, maxSlots));

  async function patchSheet(data: Record<string, unknown>) {
    await fetch(`/api/dnd/characters/${characterId}/sheet`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <DashboardNav
        userName={userName}
        systemName="D&D 5e"
        systemHref="/dashboard/dnd"
      />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 80px" }}>
        <Link href="/dashboard/dnd" style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
          ← Meus Personagens
        </Link>

        {/* Header */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-accent)",
            borderRadius: "var(--radius-xl)",
            padding: "20px 24px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ width: 52, height: 52, borderRadius: "var(--radius-xl)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>
            {cls?.icon ?? "⚔️"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>
              {characterName}
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>
              {[raceName, cls?.name, bg?.name].filter(Boolean).join(" · ")} · Nível {initial.level}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <ModeBtn active={mode === "ficha"} onClick={() => setMode("ficha")}>📋 Ficha</ModeBtn>
            <ModeBtn active={mode === "jogar"} onClick={() => setMode("jogar")}>⚔️ Jogar</ModeBtn>
          </div>
        </div>

        {mode === "ficha" ? (
          <ViewMode
            characterId={characterId}
            sheet={initial}
            scores={scores}
            raceName={raceName}
            race={race}
            subrace={subrace}
            cls={cls}
            bg={bg}
            proficientSaves={proficientSaves}
            proficientSkills={proficientSkills}
            hpCurrent={hpCurrent}
            hpTemp={hpTemp}
            gp={gp}
            equipment={equipment}
          />
        ) : (
          <PlayMode
            characterId={characterId}
            sheet={initial}
            scores={scores}
            cls={cls}
            bg={bg}
            proficientSaves={proficientSaves}
            proficientSkills={proficientSkills}
            expertiseSkills={expertiseSkills}
            isCaster={isCaster}
            spellConfig={spellConfig}
            maxSlots={maxSlots}
            hpCurrent={hpCurrent}    setHpCurrent={setHpCurrent}
            hpTemp={hpTemp}          setHpTemp={setHpTemp}
            hitDiceUsed={hitDiceUsed} setHitDiceUsed={setHitDiceUsed}
            dsSuccess={dsSuccess}    setDsSuccess={setDsSuccess}
            dsFailure={dsFailure}    setDsFailure={setDsFailure}
            inspiration={inspiration} setInspiration={setInspiration}
            conditions={conditions}  setConditions={setConditions}
            slotsUsed={slotsUsed}    setSlotsUsed={setSlotsUsed}
            gp={gp} setGp={setGp}
            cp={cp} setCp={setCp}
            sp={sp} setSp={setSp}
            ep={ep} setEp={setEp}
            pp={pp} setPp={setPp}
            equipment={equipment}    setEquipment={setEquipment}
            patchSheet={patchSheet}
          />
        )}
      </main>

      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 40 }}>
        <DeleteCharacterButton characterId={characterId} characterName={characterName} />
      </div>
    </div>
  );
}

// ── Mode Button ───────────────────────────────────────────────────────────────

function ModeBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 18px",
        borderRadius: "var(--radius-lg)",
        background: active ? "var(--accent-dim)" : "var(--surface-2)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        color: active ? "var(--accent-light)" : "var(--text-muted)",
        fontWeight: active ? 700 : 400,
        fontSize: "0.84rem",
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "inherit",
        boxShadow: active ? "0 0 16px var(--accent-glow)" : "none",
      }}
    >
      {children}
    </button>
  );
}

// ── VIEW MODE ─────────────────────────────────────────────────────────────────

interface ViewProps {
  characterId: string;
  sheet: SheetRow;
  scores: Record<AbilityKey, number>;
  raceName: string;
  race: ReturnType<typeof RACES.find>;
  subrace: ReturnType<typeof RACES.find> extends undefined ? undefined : unknown;
  cls: ReturnType<typeof CLASSES.find>;
  bg: ReturnType<typeof BACKGROUNDS.find>;
  proficientSaves: string[];
  proficientSkills: Set<string>;
  hpCurrent: number;
  hpTemp: number;
  gp: number;
  equipment: SheetRow["equipment"];
}

function ViewMode({ sheet, scores, raceName, race, subrace, cls, bg, proficientSaves, proficientSkills, hpCurrent, hpTemp, gp, equipment }: ViewProps) {
  const passivePerception = 10 + mod(scores.wis) + (proficientSkills.has("Percepção") ? PROF_BONUS : 0);
  const subclassEntry = cls?.subclasses?.find((s) => s.id === sheet.classes[0]?.subclass || s.name === sheet.classes[0]?.subclass);
  const cantrips = sheet.spells.filter((s) => s.level === 0);
  const spells1  = sheet.spells.filter((s) => s.level > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Core stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
        <StatBox label="Pontos de Vida" value={`${hpCurrent}${hpTemp > 0 ? `+${hpTemp}` : ""} / ${sheet.hpMax}`} accent />
        <StatBox label="Classe de Armadura" value={String(sheet.armorClass)} />
        <StatBox label="Iniciativa" value={signed(sheet.initiative)} />
        <StatBox label="Velocidade" value={`${sheet.speed} m`} />
        <StatBox label="Perc. Passiva" value={String(passivePerception)} />
        <StatBox label="Bônus Prof." value={`+${PROF_BONUS}`} accent />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Ability scores */}
          <ViewSection label="Atributos">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {ABILITIES.map((k) => {
                const score = scores[k];
                const m = mod(score);
                return (
                  <div key={k} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "12px 8px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{ABILITY_SHORT[k]}</p>
                    <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{score}</p>
                    <p style={{ fontSize: "0.78rem", fontWeight: 700, color: m >= 0 ? "var(--accent-light)" : "var(--text-muted)", marginTop: 2 }}>{signed(m)}</p>
                    <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", marginTop: 3 }}>{ABILITY_LABELS[k]}</p>
                  </div>
                );
              })}
            </div>
          </ViewSection>

          {/* Saves */}
          <ViewSection label="Testes de Resistência">
            {Object.entries(SAVE_ABILITY).map(([label, key]) => {
              const prof = proficientSaves.includes(label);
              const bonus = mod(scores[key]) + (prof ? PROF_BONUS : 0);
              return <ViewSaveRow key={key} label={label} bonus={bonus} prof={prof} />;
            })}
          </ViewSection>

          {/* Skills */}
          <ViewSection label="Perícias">
            {Object.entries(SKILL_MAP).map(([skill, abilityKey]) => {
              const prof = proficientSkills.has(skill);
              const bonus = mod(scores[abilityKey]) + (prof ? PROF_BONUS : 0);
              return <ViewSaveRow key={skill} label={`${skill} (${ABILITY_SHORT[abilityKey]})`} bonus={bonus} prof={prof} />;
            })}
          </ViewSection>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Traits */}
          {(race || cls || bg) && (
            <ViewSection label="Traços & Características">
              {race && <TraitGroup label={`Raça — ${raceName}`} items={[...(race as { traits: string[] }).traits, ...((subrace as { traits: string[] } | undefined)?.traits ?? [])]} />}
              {cls && <TraitGroup label={`Classe — ${cls.name}`} items={cls.keyFeatures.filter((f) => { const m = f.match(/\((\d+)°\)/); return !m || parseInt(m[1]) <= 1; })} />}
              {subclassEntry && <TraitGroup label={`Subclasse — ${subclassEntry.name}`} items={subclassEntry.features} />}
              {bg && <TraitGroup label={`Antecedente — ${bg.name}`} items={[`${bg.feature}: ${bg.featureDesc}`]} />}
            </ViewSection>
          )}

          {/* Equipment */}
          <ViewSection label="Equipamento">
            {equipment.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {equipment.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{item.itemName}</span>
                    {item.quantity > 1 && <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "1px 6px" }}>×{item.quantity}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Sem itens registrados.</p>
            )}
          </ViewSection>

          {/* Spells */}
          {(cantrips.length > 0 || spells1.length > 0) && (
            <ViewSection label="Magias">
              {cantrips.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Truques</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {cantrips.map((s) => <SpellTag key={s.id} name={s.spellName} school={s.school} />)}
                  </div>
                </div>
              )}
              {spells1.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Magias de 1° Nível</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {spells1.map((s) => <SpellTag key={s.id} name={s.spellName} school={s.school} />)}
                  </div>
                </div>
              )}
            </ViewSection>
          )}

          {/* Currency */}
          <ViewSection label="Moedas">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {(["cp","sp","ep","gp","pp"] as const).map((coin) => {
                const value = coin === "gp" ? gp : sheet[coin];
                return (
                  <div key={coin} style={{ background: "var(--surface-2)", border: `1px solid ${CURRENCY_COLOR[coin]}44`, borderRadius: "var(--radius)", padding: "10px 6px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.58rem", fontWeight: 700, color: CURRENCY_COLOR[coin], textTransform: "uppercase", letterSpacing: "0.05em" }}>{CURRENCY_LABEL[coin]}</p>
                    <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginTop: 3 }}>{value}</p>
                  </div>
                );
              })}
            </div>
          </ViewSection>
        </div>
      </div>
    </div>
  );
}

// ── PLAY MODE ─────────────────────────────────────────────────────────────────

interface PlayProps {
  characterId: string;
  sheet: SheetRow;
  scores: Record<AbilityKey, number>;
  cls: ReturnType<typeof CLASSES.find>;
  bg: ReturnType<typeof BACKGROUNDS.find>;
  proficientSaves: string[];
  proficientSkills: Set<string>;
  expertiseSkills: Set<string>;
  isCaster: boolean;
  spellConfig: SpellcastingConfig | null;
  maxSlots: Record<string, number>;
  hpCurrent: number;    setHpCurrent: (v: number) => void;
  hpTemp: number;       setHpTemp: (v: number) => void;
  hitDiceUsed: number;  setHitDiceUsed: (v: number) => void;
  dsSuccess: number;    setDsSuccess: (v: number) => void;
  dsFailure: number;    setDsFailure: (v: number) => void;
  inspiration: boolean; setInspiration: (v: boolean) => void;
  conditions: string[]; setConditions: (v: string[]) => void;
  slotsUsed: SlotState; setSlotsUsed: (v: SlotState) => void;
  gp: number; setGp: (v: number) => void;
  cp: number; setCp: (v: number) => void;
  sp: number; setSp: (v: number) => void;
  ep: number; setEp: (v: number) => void;
  pp: number; setPp: (v: number) => void;
  equipment: SheetRow["equipment"]; setEquipment: (v: SheetRow["equipment"]) => void;
  patchSheet: (data: Record<string, unknown>) => Promise<void>;
}

function PlayMode({
  characterId, sheet, scores, cls, proficientSaves, proficientSkills, expertiseSkills,
  isCaster, spellConfig, maxSlots,
  hpCurrent, setHpCurrent, hpTemp, setHpTemp,
  hitDiceUsed, setHitDiceUsed, dsSuccess, setDsSuccess, dsFailure, setDsFailure,
  inspiration, setInspiration, conditions, setConditions,
  slotsUsed, setSlotsUsed,
  gp, setGp, cp, setCp, sp, setSp, ep, setEp, pp, setPp,
  equipment, setEquipment, patchSheet,
}: PlayProps) {
  // Dice roller state
  const [selectedDie, setSelectedDie] = useState<DiceType>(20);
  const [diceCount, setDiceCount] = useState(1);
  const [diceModifier, setDiceModifier] = useState(0);
  const [advantage, setAdvantage] = useState<"normal" | "advantage" | "disadvantage">("normal");
  const [lastRoll, setLastRoll] = useState<RollEntry | null>(null);
  const [rollHistory, setRollHistory] = useState<RollEntry[]>([]);
  const rollId = useRef(0);

  // HP panel state
  const [hpInput, setHpInput] = useState("");
  const [hpMode, setHpMode] = useState<"none" | "damage" | "heal" | "temp">("none");

  // Rest state
  const [restMode, setRestMode] = useState<"none" | "short" | "confirm-long">("none");
  const [restHitDice, setRestHitDice] = useState(1);
  const [skillsOpen, setSkillsOpen] = useState(false);

  // Conditions panel
  const [showConditionPicker, setShowConditionPicker] = useState(false);

  // Currency
  const [goldInput, setGoldInput] = useState("");
  const [goldCurrency, setGoldCurrency] = useState<"gp"|"cp"|"sp"|"ep"|"pp">("gp");
  const [showConvert, setShowConvert] = useState(false);
  const [showRates, setShowRates] = useState(false);
  const [convertFrom, setConvertFrom] = useState<"cp"|"sp"|"ep"|"gp"|"pp">("gp");
  const [convertTo, setConvertTo]     = useState<"cp"|"sp"|"ep"|"gp"|"pp">("cp");
  const [convertAmt, setConvertAmt]   = useState(1);

  // Item picker state
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [itemPickerGroup, setItemPickerGroup] = useState<PickerGroup>("Tudo");
  const [itemQty, setItemQty] = useState(1);
  const [addingItem, setAddingItem] = useState(false);

  const hitDie = parseInt((sheet.hitDice ?? "d8").replace(/\d*d/, "")) || 8;
  const totalHitDice = sheet.level;
  const availableHitDice = totalHitDice - hitDiceUsed;
  const isDying = hpCurrent <= 0;
  const conMod = mod(scores.con);

  const strMod = mod(scores.str);
  const dexMod = mod(scores.dex);

  const spellAbilityMap: Record<string, AbilityKey> = {
    "Carisma": "cha", "Sabedoria": "wis", "Inteligência": "int",
  };
  const spellAbilityKey: AbilityKey = spellConfig ? (spellAbilityMap[spellConfig.ability] ?? "int") : "int";
  const spellAttackBonus = isCaster ? mod(scores[spellAbilityKey]) + PROF_BONUS : 0;
  const spellSaveDC = isCaster ? 8 + PROF_BONUS + mod(scores[spellAbilityKey]) : 0;

  // Weapon attacks from equipped items
  const weaponAttacks = equipment
    .filter((e) => e.equipped)
    .flatMap((e) => {
      const w = WEAPONS.find((w) => w.name.toLowerCase() === e.itemName.toLowerCase());
      if (!w) return [];
      const atkMod = w.finesse
        ? Math.max(strMod, dexMod) + PROF_BONUS
        : w.ranged
          ? dexMod + PROF_BONUS
          : strMod + PROF_BONUS;
      const dmgMod = w.finesse
        ? Math.max(strMod, dexMod)
        : w.ranged ? dexMod : strMod;
      return [{ id: e.id, name: e.itemName, w, atkMod, dmgMod }];
    });

  // Currency setters map
  const currencySetters: Record<string, [number, (v: number) => void]> = {
    cp: [cp, setCp], sp: [sp, setSp], ep: [ep, setEp], gp: [gp, setGp], pp: [pp, setPp],
  };

  // ── Dice ──────────────────────────────────────────────────────────────────
  function doRoll(label: string, die: DiceType = selectedDie, count: number = diceCount, bonus: number = diceModifier, adv?: "normal" | "advantage" | "disadvantage") {
    const mode = adv ?? advantage;
    let rolls: number[];
    let allRolls: number[] | undefined;
    if (die === 20 && mode !== "normal") {
      const r1 = rollDie(die);
      const r2 = rollDie(die);
      allRolls = [r1, r2];
      rolls = [mode === "advantage" ? Math.max(r1, r2) : Math.min(r1, r2)];
    } else {
      rolls = Array.from({ length: count }, () => rollDie(die));
    }
    const rawTotal = rolls.reduce((a, b) => a + b, 0);
    const total = rawTotal + bonus;
    const isCrit   = die === 20 && rolls[0] === 20;
    const isFumble = die === 20 && rolls[0] === 1;
    const entry: RollEntry = {
      id: ++rollId.current, label, dice: die, count, modifier: bonus, rolls, total, isCrit, isFumble,
      ...(allRolls ? { allRolls, advantageMode: mode as "advantage" | "disadvantage" } : {}),
    };
    setLastRoll(entry);
    setRollHistory((prev) => [entry, ...prev].slice(0, 5));
    return entry;
  }

  function quickRoll(label: string, bonus: number) {
    doRoll(label, 20, 1, bonus, "normal");
  }

  function rollWeaponDamage(name: string, damage: string, dmgMod: number) {
    const [countStr, sidesStr] = damage.split("d");
    if (!sidesStr) {
      // flat damage (e.g. "1")
      const total = parseInt(damage) + dmgMod;
      const entry: RollEntry = { id: ++rollId.current, label: `${name} — Dano`, dice: parseInt(damage), count: 1, modifier: dmgMod, rolls: [parseInt(damage)], total };
      setLastRoll(entry);
      setRollHistory((prev) => [entry, ...prev].slice(0, 12));
      return;
    }
    const dieCount = parseInt(countStr) || 1;
    const dieSides = parseInt(sidesStr) as DiceType;
    doRoll(`${name} — Dano`, dieSides, dieCount, dmgMod, "normal");
  }

  // ── HP ────────────────────────────────────────────────────────────────────
  function applyDamage(amount: number) {
    let remaining = amount;
    let newTemp = hpTemp;
    if (newTemp > 0) {
      const absorbed = Math.min(newTemp, remaining);
      newTemp -= absorbed;
      remaining -= absorbed;
      setHpTemp(newTemp);
      patchSheet({ hpTemp: newTemp });
    }
    const newHp = Math.max(0, hpCurrent - remaining);
    setHpCurrent(newHp);
    patchSheet({ hpCurrent: newHp });
    if (newHp === 0) {
      setDsSuccess(0); setDsFailure(0);
      patchSheet({ deathSavesSuccess: 0, deathSavesFailure: 0 });
    }
  }

  function applyHeal(amount: number) {
    const newHp = Math.min(sheet.hpMax, hpCurrent + amount);
    setHpCurrent(newHp);
    patchSheet({ hpCurrent: newHp });
    if (newHp > 0) { setDsSuccess(0); setDsFailure(0); patchSheet({ deathSavesSuccess: 0, deathSavesFailure: 0 }); }
  }

  function rollDeathSave() {
    const roll = rollDie(20);
    doRoll("Resistência à Morte", 20, 1, 0, "normal");
    if (roll === 20) { applyHeal(1); return; }
    if (roll === 1) {
      const newFail = Math.min(3, dsFailure + 2);
      setDsFailure(newFail); patchSheet({ deathSavesFailure: newFail });
    } else if (roll >= 10) {
      const newSucc = Math.min(3, dsSuccess + 1);
      setDsSuccess(newSucc); patchSheet({ deathSavesSuccess: newSucc });
    } else {
      const newFail = Math.min(3, dsFailure + 1);
      setDsFailure(newFail); patchSheet({ deathSavesFailure: newFail });
    }
  }

  // ── Rest ──────────────────────────────────────────────────────────────────
  function doShortRest() {
    const count = Math.min(restHitDice, availableHitDice);
    if (count <= 0) return;
    let total = 0;
    for (let i = 0; i < count; i++) total += rollDie(hitDie) + conMod;
    applyHeal(Math.max(0, total));
    const newUsed = hitDiceUsed + count;
    setHitDiceUsed(newUsed);
    patchSheet({ hitDiceUsed: newUsed });
    setRestMode("none");
  }

  function doLongRest() {
    const newHp = sheet.hpMax;
    setHpCurrent(newHp); patchSheet({ hpCurrent: newHp });
    setHpTemp(0); patchSheet({ hpTemp: 0 });
    const recovered = Math.max(1, Math.floor(totalHitDice / 2));
    const newUsed = Math.max(0, hitDiceUsed - recovered);
    setHitDiceUsed(newUsed); patchSheet({ hitDiceUsed: newUsed });
    const newSlots: SlotState = {};
    Object.entries(maxSlots).forEach(([k, max]) => { newSlots[k] = Array.from({ length: max }, () => false); });
    setSlotsUsed(newSlots); patchSheet({ spellSlotsUsed: JSON.stringify(newSlots) });
    setDsSuccess(0); setDsFailure(0); patchSheet({ deathSavesSuccess: 0, deathSavesFailure: 0 });
    setRestMode("none");
  }

  // ── Spell slots ───────────────────────────────────────────────────────────
  function toggleSlot(level: string, index: number) {
    const current = slotsUsed[level] ?? Array.from({ length: maxSlots[level] ?? 0 }, () => false);
    const next = [...current];
    next[index] = !next[index];
    const newState = { ...slotsUsed, [level]: next };
    setSlotsUsed(newState);
    patchSheet({ spellSlotsUsed: JSON.stringify(newState) });
  }

  // ── Inventory ─────────────────────────────────────────────────────────────
  async function addItemByName(itemName: string, quantity: number) {
    if (!itemName.trim() || addingItem) return;
    setAddingItem(true);
    try {
      const res = await fetch(`/api/dnd/characters/${characterId}/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: itemName.trim(), quantity }),
      });
      if (res.ok) {
        const item = await res.json();
        setEquipment([...equipment, item]);
      }
    } finally {
      setAddingItem(false);
    }
  }

  async function removeItem(id: string) {
    await fetch(`/api/dnd/characters/${characterId}/equipment/${id}`, { method: "DELETE" });
    setEquipment(equipment.filter((e) => e.id !== id));
  }

  async function toggleEquipped(item: SheetRow["equipment"][number]) {
    const updated = { ...item, equipped: !item.equipped };
    await fetch(`/api/dnd/characters/${characterId}/equipment/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipped: updated.equipped }),
    });
    setEquipment(equipment.map((e) => e.id === item.id ? updated : e));
  }

  // ── Currency ──────────────────────────────────────────────────────────────
  function adjustCurrency() {
    const amount = parseInt(goldInput) || 0;
    if (amount === 0) return;
    const [current, setter] = currencySetters[goldCurrency];
    const newVal = Math.max(0, current + amount);
    setter(newVal);
    patchSheet({ [goldCurrency]: newVal });
    setGoldInput("");
  }

  function convertCurrency() {
    const [fromCurrent, fromSetter] = currencySetters[convertFrom];
    if (fromCurrent < convertAmt) return;
    const cpTotal = convertAmt * CP_VALUE[convertFrom];
    const toAmt = Math.floor(cpTotal / CP_VALUE[convertTo]);
    if (toAmt === 0) return;
    const [toCurrent, toSetter] = currencySetters[convertTo];
    const newFrom = fromCurrent - convertAmt;
    const newTo = toCurrent + toAmt;
    fromSetter(newFrom);
    toSetter(newTo);
    patchSheet({ [convertFrom]: newFrom, [convertTo]: newTo });
  }

  const hpPct = sheet.hpMax > 0 ? hpCurrent / sheet.hpMax : 0;
  const hpColor = hpPct > 0.5 ? "#2d8b2d" : hpPct > 0.25 ? "#b8860b" : "#8b0000";

  // Filtered item picker list
  const filteredItems = ALL_PHB_ITEMS.filter((item) => {
    const matchGroup = itemPickerGroup === "Tudo" || item.group === itemPickerGroup;
    const matchSearch = itemSearch === "" || item.name.toLowerCase().includes(itemSearch.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* HP Bar + Core stats */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xl)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* HP header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2rem", fontWeight: 900, color: isDying ? "#8b0000" : hpColor, lineHeight: 1 }}>
                {isDying ? "0" : hpCurrent}
              </span>
              <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/ {sheet.hpMax}</span>
              {hpTemp > 0 && <span style={{ fontSize: "0.84rem", color: "#4fc3f7", fontWeight: 700 }}>+{hpTemp} temp</span>}
              <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginLeft: 4 }}>Pontos de Vida</span>
            </div>
            <div style={{ height: 10, background: "var(--surface-2)", borderRadius: 5, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, hpPct * 100))}%`, background: hpColor, borderRadius: 5, transition: "width 0.4s ease, background 0.4s ease" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <QuickStat label="CA" value={String(sheet.armorClass)} />
            <QuickStat label="Init" value={signed(sheet.initiative)} />
            <QuickStat label="Vel" value={`${sheet.speed}m`} />
            <button
              onClick={() => { const v = !inspiration; setInspiration(v); patchSheet({ inspiration: v }); }}
              style={{
                padding: "6px 14px", borderRadius: "var(--radius)", border: `1px solid ${inspiration ? "var(--accent)" : "var(--border)"}`,
                background: inspiration ? "var(--accent-dim)" : "var(--surface-2)",
                color: inspiration ? "var(--accent-light)" : "var(--text-subtle)",
                fontWeight: 700, fontSize: "0.76rem", cursor: "pointer", fontFamily: "inherit",
                boxShadow: inspiration ? "0 0 12px var(--accent-glow)" : "none",
              }}
            >
              ⚡ Inspiração
            </button>
          </div>
        </div>

        {/* HP actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {(["damage", "heal", "temp"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setHpMode(hpMode === m ? "none" : m)}
              style={{
                padding: "6px 14px", borderRadius: "var(--radius)", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                background: hpMode === m ? (m === "damage" ? "rgba(139,0,0,0.3)" : m === "heal" ? "rgba(45,139,45,0.3)" : "rgba(79,195,247,0.2)") : "var(--surface-2)",
                border: `1px solid ${hpMode === m ? (m === "damage" ? "#8b0000" : m === "heal" ? "#2d8b2d" : "#4fc3f7") : "var(--border)"}`,
                color: hpMode === m ? (m === "damage" ? "#ff6b6b" : m === "heal" ? "#6bff6b" : "#4fc3f7") : "var(--text-muted)",
              }}
            >
              {m === "damage" ? "⚔️ Dano" : m === "heal" ? "💚 Curar" : "🔷 PV Temp"}
            </button>
          ))}

          {hpMode !== "none" && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="number"
                value={hpInput}
                onChange={(e) => setHpInput(e.target.value)}
                placeholder="0"
                min="0"
                style={{ width: 64, padding: "6px 10px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.9rem", fontFamily: "inherit" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = parseInt(hpInput) || 0;
                    if (hpMode === "damage") applyDamage(v);
                    else if (hpMode === "heal") applyHeal(v);
                    else { setHpTemp(v); patchSheet({ hpTemp: v }); }
                    setHpInput(""); setHpMode("none");
                  }
                }}
              />
              <button
                onClick={() => {
                  const v = parseInt(hpInput) || 0;
                  if (hpMode === "damage") applyDamage(v);
                  else if (hpMode === "heal") applyHeal(v);
                  else { setHpTemp(v); patchSheet({ hpTemp: v }); }
                  setHpInput(""); setHpMode("none");
                }}
                style={{ padding: "6px 12px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}
              >
                OK
              </button>
            </div>
          )}
        </div>

        {/* Death saves */}
        {isDying && (
          <div style={{ background: "rgba(139,0,0,0.15)", border: "1px solid #8b0000", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#ff4444", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              💀 INCONSCIENTE — Resistências à Morte
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.72rem", color: "#4fc3f7", fontWeight: 700 }}>Sucesso:</span>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: i < dsSuccess ? "#2d8b2d" : "var(--surface-2)", border: `2px solid ${i < dsSuccess ? "#2d8b2d" : "var(--border)"}`, transition: "all 0.2s" }} />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.72rem", color: "#ff6b6b", fontWeight: 700 }}>Falha:</span>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: i < dsFailure ? "#8b0000" : "var(--surface-2)", border: `2px solid ${i < dsFailure ? "#8b0000" : "var(--border)"}`, transition: "all 0.2s" }} />
                ))}
              </div>
              <button
                onClick={rollDeathSave}
                style={{ padding: "6px 16px", borderRadius: "var(--radius)", background: "rgba(139,0,0,0.3)", border: "1px solid #8b0000", color: "#ff6b6b", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}
              >
                🎲 Rolar Resistência
              </button>
              {dsSuccess >= 3 && <span style={{ fontSize: "0.8rem", color: "#4fc3f7", fontWeight: 700 }}>✦ Estabilizado!</span>}
              {dsFailure >= 3 && <span style={{ fontSize: "0.8rem", color: "#ff4444", fontWeight: 700 }}>💀 Morto!</span>}
            </div>
          </div>
        )}

        {/* Active conditions */}
        {conditions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {conditions.map((c) => (
              <span
                key={c}
                onClick={() => { const v = conditions.filter((x) => x !== c); setConditions(v); patchSheet({ conditions: JSON.stringify(v) }); }}
                style={{
                  fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-xs)", cursor: "pointer",
                  background: `${CONDITION_COLOR[c] ?? "#555"}33`,
                  border: `1px solid ${CONDITION_COLOR[c] ?? "#555"}`,
                  color: "var(--text)",
                  userSelect: "none",
                }}
                title="Clique para remover"
              >
                {c} ✕
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 16, alignItems: "start" }}>

        {/* LEFT: Abilities + Saves + Skills */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <PlayCard>
            <p style={labelStyle}>Atributos</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ABILITIES.map((k) => {
                const score = scores[k];
                const m = mod(score);
                return (
                  <button
                    key={k}
                    onClick={() => doRoll(`Teste de ${ABILITY_LABELS[k]}`, 20, 1, m, "normal")}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                      background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
                      cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s",
                    }}
                    title={`Rolar teste de ${ABILITY_LABELS[k]}`}
                  >
                    <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.3rem", fontWeight: 900, color: "var(--text)", minWidth: 28, textAlign: "center" }}>{score}</span>
                    <div>
                      <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{ABILITY_SHORT[k]}</p>
                      <p style={{ fontSize: "0.82rem", fontWeight: 700, color: m >= 0 ? "var(--accent-light)" : "var(--text-muted)" }}>{signed(m)}</p>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-subtle)" }}>🎲</span>
                  </button>
                );
              })}
            </div>
          </PlayCard>

          <PlayCard>
            <button
              onClick={() => setSkillsOpen((v) => !v)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: skillsOpen ? 6 : 0, fontFamily: "inherit" }}
            >
              <p style={labelStyle}>Perícias</p>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "inline-block", transition: "transform 0.2s", transform: skillsOpen ? "rotate(180deg)" : "none" }}>▼</span>
            </button>
            {skillsOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {Object.entries(SKILL_MAP).map(([skill, abilityKey]) => {
                  const prof = proficientSkills.has(skill);
                  const expert = expertiseSkills.has(skill);
                  const bonus = mod(scores[abilityKey]) + (expert ? PROF_BONUS * 2 : prof ? PROF_BONUS : 0);
                  return (
                    <button
                      key={skill}
                      onClick={() => quickRoll(skill, bonus)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", background: prof ? "rgba(201,148,31,0.06)" : "transparent", border: "none", borderRadius: "var(--radius-xs)", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      <span style={{ fontSize: "0.7rem", color: prof ? "var(--accent-light)" : "var(--text-muted)", fontWeight: prof ? 700 : 400, textAlign: "left" }}>
                        {expert ? "◆◆" : prof ? "◆" : "○"} {skill}
                      </span>
                      <span style={{ fontSize: "0.76rem", fontWeight: 700, color: prof ? "var(--accent-light)" : "var(--text-muted)", flexShrink: 0, marginLeft: 4 }}>{signed(bonus)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </PlayCard>
        </div>

        {/* CENTER: Quick Actions + Dice + Spells */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Quick Actions */}
          <PlayCard>
            <p style={labelStyle}>Ações Rápidas</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {/* Initiative always shown */}
              <QuickActionBtn
                label={`🎯 Iniciativa (${signed(dexMod)})`}
                onClick={() => quickRoll("Iniciativa", dexMod)}
              />

              {/* Weapon attacks from equipped weapons */}
              {weaponAttacks.length > 0 && weaponAttacks.map((atk) => (
                <div key={atk.id} style={{ display: "flex", gap: 4 }}>
                  <QuickActionBtn
                    label={`⚔️ ${atk.name} (${signed(atk.atkMod)})`}
                    onClick={() => quickRoll(`Ataque — ${atk.name}`, atk.atkMod)}
                  />
                  <button
                    onClick={() => rollWeaponDamage(atk.name, atk.w.damage, atk.dmgMod)}
                    title={`Rolar dano: ${atk.w.damage}${atk.dmgMod >= 0 ? "+" : ""}${atk.dmgMod} ${atk.w.damageType}`}
                    style={{
                      padding: "6px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)",
                      border: "1px solid var(--border)", color: "var(--text-subtle)", fontSize: "0.72rem",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {atk.w.damage}
                  </button>
                </div>
              ))}

              {/* Spell attack if caster */}
              {isCaster && (
                <QuickActionBtn
                  label={`✨ Magia (${signed(spellAttackBonus)}) CD${spellSaveDC}`}
                  onClick={() => quickRoll("Ataque Mágico", spellAttackBonus)}
                />
              )}

              {/* Proficient skills only */}
              {Object.entries(SKILL_MAP)
                .filter(([skill]) => proficientSkills.has(skill))
                .map(([skill, abilityKey]) => {
                  const expert = expertiseSkills.has(skill);
                  const bonus = mod(scores[abilityKey]) + (expert ? PROF_BONUS * 2 : PROF_BONUS);
                  return (
                    <QuickActionBtn
                      key={skill}
                      label={`${expert ? "◆◆" : "◆"} ${skill} (${signed(bonus)})`}
                      onClick={() => quickRoll(skill, bonus)}
                    />
                  );
                })}
            </div>
          </PlayCard>

          {/* Dice Roller */}
          <PlayCard accent>
            <p style={labelStyle}>Rolagem de Dados</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
              {DICE_TYPES.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDie(d)}
                  style={{
                    padding: "5px 9px", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    background: selectedDie === d ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${selectedDie === d ? "var(--accent)" : "var(--border)"}`,
                    color: selectedDie === d ? "var(--accent-light)" : "var(--text-muted)",
                    boxShadow: selectedDie === d ? "0 0 10px var(--accent-glow)" : "none",
                    minWidth: 40, textAlign: "center",
                  }}
                >
                  d{d}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Qtd</span>
                <select
                  value={diceCount}
                  onChange={(e) => setDiceCount(parseInt(e.target.value))}
                  style={{ padding: "5px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.82rem", fontFamily: "inherit" }}
                >
                  {[1,2,3,4,6,8,10,12].map((n) => <option key={n} value={n}>×{n}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Mod</span>
                <input
                  type="number"
                  value={diceModifier}
                  onChange={(e) => setDiceModifier(parseInt(e.target.value) || 0)}
                  style={{ width: 60, padding: "5px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.82rem", fontFamily: "inherit" }}
                />
              </div>
              {selectedDie === 20 && (
                <div style={{ display: "flex", gap: 4 }}>
                  {(["normal", "advantage", "disadvantage"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAdvantage(a)}
                      style={{
                        padding: "4px 8px", borderRadius: "var(--radius-xs)", fontSize: "0.66rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                        background: advantage === a ? "var(--accent-dim)" : "var(--surface-2)",
                        border: `1px solid ${advantage === a ? "var(--accent)" : "var(--border)"}`,
                        color: advantage === a ? "var(--accent-light)" : "var(--text-subtle)",
                      }}
                    >
                      {a === "normal" ? "Normal" : a === "advantage" ? "Vantagem" : "Desvantagem"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => doRoll(`${diceCount}d${selectedDie}${diceModifier !== 0 ? (diceModifier > 0 ? `+${diceModifier}` : diceModifier) : ""}`)}
              style={{
                width: "100%", padding: "8px", borderRadius: "var(--radius-lg)",
                background: "var(--accent-dim)", border: "1px solid var(--accent)",
                color: "var(--accent-light)", fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.92rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em",
                boxShadow: "0 0 16px var(--accent-glow)",
                transition: "all 0.15s",
                marginBottom: 8,
              }}
            >
              🎲 ROLAR {diceCount}d{selectedDie}{diceModifier !== 0 ? (diceModifier > 0 ? `+${diceModifier}` : diceModifier) : ""}
            </button>

            {lastRoll && (
              <div
                style={{
                  padding: "12px 16px", borderRadius: "var(--radius-lg)", textAlign: "center",
                  background: lastRoll.isCrit ? "rgba(201,148,31,0.15)" : lastRoll.isFumble ? "rgba(139,0,0,0.15)" : "var(--surface-2)",
                  border: `1px solid ${lastRoll.isCrit ? "var(--accent)" : lastRoll.isFumble ? "#8b0000" : "var(--border)"}`,
                  marginBottom: 8,
                }}
              >
                {lastRoll.isCrit && <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>✦ ACERTO CRÍTICO ✦</p>}
                {lastRoll.isFumble && <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#ff4444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>💀 FALHA CRÍTICA</p>}
                {lastRoll.advantageMode && lastRoll.allRolls && (() => {
                  const [r1, r2] = lastRoll.allRolls;
                  const pickedIdx = lastRoll.advantageMode === "advantage" ? (r1 >= r2 ? 0 : 1) : (r1 <= r2 ? 0 : 1);
                  return (
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 6 }}>
                      {lastRoll.allRolls.map((r, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: i === pickedIdx ? "1rem" : "0.82rem", fontWeight: i === pickedIdx ? 900 : 400,
                            color: i === pickedIdx ? "var(--accent-light)" : "var(--text-subtle)",
                            background: i === pickedIdx ? "var(--accent-dim)" : "var(--surface)",
                            border: `1px solid ${i === pickedIdx ? "var(--accent)" : "var(--border)"}`,
                            borderRadius: "var(--radius)", padding: "3px 10px",
                          }}
                        >
                          {r}{i === pickedIdx ? " ✓" : ""}
                        </span>
                      ))}
                      <span style={{ fontSize: "0.64rem", color: "var(--text-subtle)", alignSelf: "center" }}>
                        {lastRoll.advantageMode === "advantage" ? "↑ vantagem" : "↓ desvantagem"}
                      </span>
                    </div>
                  );
                })()}
                <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2.2rem", fontWeight: 900, color: lastRoll.isCrit ? "var(--accent-light)" : lastRoll.isFumble ? "#ff6b6b" : "var(--text)", lineHeight: 1 }}>
                  {lastRoll.total}
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginTop: 3 }}>
                  {lastRoll.label} · [{lastRoll.rolls.join(", ")}]{lastRoll.modifier !== 0 ? ` ${lastRoll.modifier >= 0 ? "+" : ""}${lastRoll.modifier}` : ""}
                </p>
              </div>
            )}

            {rollHistory.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <p style={{ ...labelStyle, marginBottom: 3 }}>Histórico</p>
                {rollHistory.slice(0, 5).map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 8px", background: "var(--surface-2)", borderRadius: "var(--radius-xs)" }}>
                    <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", fontWeight: 700, color: r.isCrit ? "var(--accent-light)" : r.isFumble ? "#ff6b6b" : "var(--text)", minWidth: 26 }}>{r.total}</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", flex: 1 }}>{r.label}</span>
                    <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>{r.dice === 20 && r.isCrit ? "🏆" : r.dice === 20 && r.isFumble ? "💀" : `d${r.dice}`}</span>
                  </div>
                ))}
              </div>
            )}
          </PlayCard>

          {/* Spell Slots — individual per-slot bubbles */}
          {isCaster && spellConfig && (
            <PlayCard>
              <p style={labelStyle}>Espaços de Magia</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4 }}>
                  Habilidade: <strong style={{ color: "var(--accent-light)" }}>{spellConfig.ability}</strong>
                  {" · "}CD: <strong style={{ color: "var(--accent-light)" }}>{spellSaveDC}</strong>
                  {" · "}Ataque: <strong style={{ color: "var(--accent-light)" }}>{signed(spellAttackBonus)}</strong>
                </div>
                {Object.entries(maxSlots).map(([level, max]) => {
                  const slots = slotsUsed[level] ?? Array.from({ length: max }, () => false);
                  const usedCount = slots.filter(Boolean).length;
                  return (
                    <div key={level} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", minWidth: 50 }}>Nível {level}</span>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {Array.from({ length: max }).map((_, i) => {
                          const isUsed = slots[i] ?? false;
                          return (
                            <button
                              key={i}
                              onClick={() => toggleSlot(level, i)}
                              title={isUsed ? "Usado — clique para recuperar" : "Disponível — clique para gastar"}
                              style={{
                                width: 28, height: 28, borderRadius: "50%",
                                background: isUsed ? "var(--surface-2)" : "var(--accent-dim)",
                                border: `2px solid ${isUsed ? "var(--border)" : "var(--accent)"}`,
                                cursor: "pointer",
                                boxShadow: isUsed ? "none" : "0 0 10px var(--accent-glow)",
                                transition: "all 0.15s",
                              }}
                            />
                          );
                        })}
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{max - usedCount}/{max}</span>
                    </div>
                  );
                })}

                {/* Spell list */}
                <div style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                  {[
                    { label: "Truques", spells: sheet.spells.filter((s) => s.level === 0) },
                    { label: "1° Nível", spells: sheet.spells.filter((s) => s.level > 0) },
                  ].map(({ label, spells }) =>
                    spells.length > 0 ? (
                      <div key={label} style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {spells.map((s) => <SpellTag key={s.id} name={s.spellName} school={s.school} />)}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </PlayCard>
          )}

          {/* Inventory — placed here, below spells */}
          <PlayCard>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={labelStyle}>Inventário ({equipment.length} itens)</p>
              <button
                onClick={() => setShowItemPicker(true)}
                style={{
                  padding: "5px 14px", borderRadius: "var(--radius)", background: "var(--accent-dim)",
                  border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700,
                  fontSize: "0.76rem", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                + Adicionar Item
              </button>
            </div>

            {equipment.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--text-subtle)", fontSize: "0.8rem", background: "var(--surface-2)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
                Inventário vazio. Adicione itens clicando no botão acima.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 7 }}>
                {equipment.map((item) => {
                  const w = WEAPONS.find((w) => w.name.toLowerCase() === item.itemName.toLowerCase());
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                        background: item.equipped ? "var(--accent-dim)" : "var(--surface-2)",
                        border: `1px solid ${item.equipped ? "var(--border-accent)" : "var(--border)"}`,
                        borderRadius: "var(--radius-lg)", transition: "all 0.15s",
                      }}
                    >
                      <button
                        onClick={() => toggleEquipped(item)}
                        title={item.equipped ? "Equipado — clique para desequipar" : "Clique para equipar"}
                        style={{
                          width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                          background: item.equipped ? "var(--accent)" : "var(--surface)",
                          border: `2px solid ${item.equipped ? "var(--accent)" : "var(--border)"}`,
                          cursor: "pointer",
                          boxShadow: item.equipped ? "0 0 6px var(--accent-glow)" : "none",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: item.equipped ? 700 : 400, color: item.equipped ? "var(--accent-light)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.itemName}
                        </p>
                        {w && (
                          <p style={{ fontSize: "0.64rem", color: "var(--text-subtle)", marginTop: 1 }}>
                            {w.damage} {w.damageType} · {w.category.includes("dist") ? "Dist." : "CAC"}
                            {w.finesse ? " · Acuidade" : ""}
                            {w.range ? ` · ${w.range}m` : ""}
                          </p>
                        )}
                      </div>
                      {item.quantity > 1 && (
                        <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "1px 5px", flexShrink: 0 }}>
                          ×{item.quantity}
                        </span>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{ fontSize: "0.7rem", color: "var(--text-subtle)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", lineHeight: 1, flexShrink: 0 }}
                        title="Remover item"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </PlayCard>
        </div>

        {/* RIGHT: Conditions + Currency + Rest */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Conditions */}
          <PlayCard>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={labelStyle}>Condições</p>
              <button onClick={() => setShowConditionPicker((v) => !v)} style={{ fontSize: "0.72rem", color: "var(--accent-light)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>+ Adicionar</button>
            </div>
            {showConditionPicker && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8, maxHeight: 140, overflowY: "auto" }}>
                {CONDITIONS.filter((c) => !conditions.includes(c)).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      const v = [...conditions, c];
                      setConditions(v); patchSheet({ conditions: JSON.stringify(v) });
                      setShowConditionPicker(false);
                    }}
                    style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "var(--radius-xs)", background: `${CONDITION_COLOR[c] ?? "#555"}22`, border: `1px solid ${CONDITION_COLOR[c] ?? "#555"}`, color: "var(--text)", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {conditions.length === 0 ? (
              <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Nenhuma condição ativa.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {conditions.map((c) => (
                  <span
                    key={c}
                    onClick={() => { const v = conditions.filter((x) => x !== c); setConditions(v); patchSheet({ conditions: JSON.stringify(v) }); }}
                    style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "var(--radius-xs)", cursor: "pointer", background: `${CONDITION_COLOR[c] ?? "#555"}22`, border: `1px solid ${CONDITION_COLOR[c] ?? "#555"}`, color: "var(--text)", userSelect: "none" }}
                    title="Clique para remover"
                  >
                    {c} ✕
                  </span>
                ))}
              </div>
            )}
          </PlayCard>

          {/* Currency */}
          <PlayCard>
            <p style={labelStyle}>Moedas</p>

            {/* Currency display */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginBottom: 10 }}>
              {(["cp","sp","ep","gp","pp"] as const).map((coin) => {
                const value = currencySetters[coin][0];
                return (
                  <div
                    key={coin}
                    style={{
                      background: "var(--surface-2)",
                      border: `1px solid ${CURRENCY_COLOR[coin]}44`,
                      borderRadius: "var(--radius)",
                      padding: "8px 4px",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: "0.54rem", fontWeight: 700, color: CURRENCY_COLOR[coin], textTransform: "uppercase", letterSpacing: "0.05em" }}>{CURRENCY_LABEL[coin]}</p>
                    <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{value}</p>
                  </div>
                );
              })}
            </div>

            {/* Adjust */}
            <div style={{ display: "flex", gap: 5, marginBottom: 6 }}>
              <select
                value={goldCurrency}
                onChange={(e) => setGoldCurrency(e.target.value as "gp")}
                style={{ padding: "5px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit" }}
              >
                {(["cp","sp","ep","gp","pp"] as const).map((c) => (
                  <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>
                ))}
              </select>
              <button onClick={adjustCurrency} style={{ padding: "5px 10px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>OK</button>
              <input
                type="number"
                value={goldInput}
                onChange={(e) => setGoldInput(e.target.value)}
                placeholder="±"
                onKeyDown={(e) => e.key === "Enter" && adjustCurrency()}
                style={{ width: 64, padding: "5px 6px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.82rem", fontFamily: "inherit" }}
              />
            </div>
            <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", marginBottom: 8 }}>Use +N para ganhar, −N para gastar</p>

            {/* Conversion */}
            <button
              onClick={() => setShowConvert((v) => !v)}
              style={{ fontSize: "0.7rem", color: "var(--accent-light)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", paddingLeft: 0, marginBottom: showConvert ? 8 : 0 }}
            >
              {showConvert ? "▲" : "▼"} Converter moedas
            </button>
            {showConvert && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: 6 }}>
                <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>
                  1PL=10PO · 1PO=2PE=10PP=100PC · 1PE=5PP
                </p>
                <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="number"
                    min={1}
                    value={convertAmt}
                    onChange={(e) => setConvertAmt(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: 48, padding: "4px 6px", borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.8rem", fontFamily: "inherit" }}
                  />
                  <select
                    value={convertFrom}
                    onChange={(e) => setConvertFrom(e.target.value as "gp")}
                    style={{ padding: "4px", borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit" }}
                  >
                    {(["cp","sp","ep","gp","pp"] as const).map((c) => (
                      <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>→</span>
                  <select
                    value={convertTo}
                    onChange={(e) => setConvertTo(e.target.value as "cp")}
                    style={{ padding: "4px", borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit" }}
                  >
                    {(["cp","sp","ep","gp","pp"] as const).map((c) => (
                      <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>
                    ))}
                  </select>
                </div>
                {convertFrom !== convertTo && (
                  <p style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                    = {Math.floor((convertAmt * CP_VALUE[convertFrom]) / CP_VALUE[convertTo])} {CURRENCY_LABEL[convertTo]}
                  </p>
                )}
                <button
                  onClick={convertCurrency}
                  disabled={convertFrom === convertTo || currencySetters[convertFrom][0] < convertAmt}
                  style={{
                    padding: "5px 10px", borderRadius: "var(--radius)",
                    background: "var(--accent-dim)", border: "1px solid var(--accent)",
                    color: "var(--accent-light)", fontWeight: 700, fontSize: "0.76rem",
                    cursor: "pointer", fontFamily: "inherit",
                    opacity: (convertFrom === convertTo || currencySetters[convertFrom][0] < convertAmt) ? 0.4 : 1,
                  }}
                >
                  Converter
                </button>
              </div>
            )}

            {/* Exchange rate table */}
            <button
              onClick={() => setShowRates((v) => !v)}
              style={{ fontSize: "0.7rem", color: "var(--accent-light)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", paddingLeft: 0, marginBottom: showRates ? 8 : 0 }}
            >
              {showRates ? "▲" : "▼"} Tabela de câmbio
            </button>
            {showRates && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                {([
                  { from: "PL", to: "PO", rate: 10, fromColor: "#b0c4de", toColor: "#c9941f" },
                  { from: "PO", to: "PE", rate: 2,  fromColor: "#c9941f", toColor: "#7dd3fc" },
                  { from: "PE", to: "PP", rate: 5,  fromColor: "#7dd3fc", toColor: "#d1d5db" },
                  { from: "PP", to: "PC", rate: 10, fromColor: "#d1d5db", toColor: "#b45309" },
                ] as const).map(({ from, to, rate, fromColor, toColor }) => (
                  <div key={from} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", borderRadius: "var(--radius-xs)", background: "var(--surface)" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: fromColor, minWidth: 24 }}>1 {from}</span>
                    <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>→</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: toColor }}>{rate} {to}</span>
                  </div>
                ))}
              </div>
            )}
          </PlayCard>

          {/* Rest */}
          <PlayCard>
            <p style={labelStyle}>Descanso</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8 }}>
              Dados de Vida: {availableHitDice}/{totalHitDice} (D{hitDie}) disponíveis
            </p>

            {restMode === "none" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setRestMode("short")}
                  disabled={availableHitDice === 0 || isDying}
                  style={{ flex: 1, padding: "8px 6px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: availableHitDice === 0 ? "var(--text-subtle)" : "var(--text-muted)", fontSize: "0.78rem", fontWeight: 700, cursor: availableHitDice === 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                >
                  ☕ Curto<br /><span style={{ fontSize: "0.64rem", fontWeight: 400 }}>1 hora</span>
                </button>
                <button
                  onClick={() => setRestMode("confirm-long")}
                  disabled={isDying && hpCurrent === 0}
                  style={{ flex: 1, padding: "8px 6px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", color: "var(--accent-light)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                >
                  🌙 Longo<br /><span style={{ fontSize: "0.64rem", fontWeight: 400 }}>8 horas</span>
                </button>
              </div>
            )}

            {restMode === "short" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Quantos dados de vida gastar?</p>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button onClick={() => setRestHitDice(Math.max(1, restHitDice - 1))} style={smallBtn}>−</button>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", minWidth: 24, textAlign: "center" }}>{Math.min(restHitDice, availableHitDice)}</span>
                  <button onClick={() => setRestHitDice(Math.min(availableHitDice, restHitDice + 1))} style={smallBtn}>+</button>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>× (D{hitDie} + {signed(conMod)})</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={doShortRest} style={{ flex: 1, padding: "7px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit" }}>Descansar</button>
                  <button onClick={() => setRestMode("none")} style={{ flex: 1, padding: "7px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
                </div>
              </div>
            )}

            {restMode === "confirm-long" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ background: "rgba(201,148,31,0.08)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius)", padding: "10px 12px" }}>
                  <p style={{ fontSize: "0.76rem", color: "var(--accent-light)", fontWeight: 700, marginBottom: 4 }}>Descanso Longo recupera:</p>
                  <ul style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0, paddingLeft: 16 }}>
                    <li>Todos os Pontos de Vida</li>
                    <li>Metade dos Dados de Vida (mín. 1)</li>
                    {isCaster && <li>Todos os Espaços de Magia</li>}
                  </ul>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={doLongRest} style={{ flex: 1, padding: "7px", borderRadius: "var(--radius)", background: "rgba(201,148,31,0.2)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit" }}>🌙 Confirmar</button>
                  <button onClick={() => setRestMode("none")} style={{ flex: 1, padding: "7px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
                </div>
              </div>
            )}
          </PlayCard>
        </div>
      </div>

      {/* Item Picker Modal */}
      {showItemPicker && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowItemPicker(false); }}
        >
          <div
            style={{
              background: "var(--surface)", border: "1px solid var(--border-accent)",
              borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 680,
              maxHeight: "85vh", display: "flex", flexDirection: "column",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal header */}
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
                Adicionar Item
              </p>
              <button onClick={() => setShowItemPicker(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            {/* Search */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
              <input
                autoFocus
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Buscar item..."
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: "var(--radius)",
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  color: "var(--text)", fontSize: "0.88rem", fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Group tabs */}
            <div style={{ padding: "8px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PICKER_GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setItemPickerGroup(g)}
                  style={{
                    padding: "4px 12px", borderRadius: "var(--radius)", fontSize: "0.74rem", fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    background: itemPickerGroup === g ? "var(--accent-dim)" : "var(--surface-2)",
                    border: `1px solid ${itemPickerGroup === g ? "var(--accent)" : "var(--border)"}`,
                    color: itemPickerGroup === g ? "var(--accent-light)" : "var(--text-muted)",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Item list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
              {filteredItems.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", textAlign: "center", padding: "24px 0" }}>
                  Nenhum item encontrado.
                </p>
              ) : filteredItems.map((item) => {
                const w = WEAPONS.find((w) => w.name === item.name);
                const alreadyHas = equipment.some((e) => e.itemName === item.name);
                return (
                  <div
                    key={item.name}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                      background: "var(--surface-2)", border: "1px solid var(--border)",
                      borderRadius: "var(--radius)", cursor: "pointer",
                      transition: "all 0.1s",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text)" }}>{item.name}</p>
                      <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: "0.66rem", color: "var(--text-subtle)" }}>{item.group}</span>
                        {item.cost && <span style={{ fontSize: "0.66rem", color: "var(--accent-light)" }}>{item.cost}</span>}
                        {w && <span style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>{w.damage} {w.damageType}</span>}
                        {alreadyHas && <span style={{ fontSize: "0.62rem", color: "#4fc3f7" }}>✓ no inventário</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => setItemQty(Math.max(1, itemQty - 1))} style={smallBtn}>−</button>
                      <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)", minWidth: 20, textAlign: "center" }}>{itemQty}</span>
                      <button onClick={() => setItemQty(itemQty + 1)} style={smallBtn}>+</button>
                      <button
                        disabled={addingItem}
                        onClick={async () => {
                          await addItemByName(item.name, itemQty);
                          setItemQty(1);
                        }}
                        style={{
                          padding: "5px 12px", borderRadius: "var(--radius)",
                          background: "var(--accent-dim)", border: "1px solid var(--accent)",
                          color: "var(--accent-light)", fontWeight: 700, fontSize: "0.76rem",
                          cursor: addingItem ? "not-allowed" : "pointer", fontFamily: "inherit",
                          opacity: addingItem ? 0.6 : 1,
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal footer */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowItemPicker(false)}
                style={{ padding: "8px 20px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.84rem", cursor: "pointer", fontFamily: "inherit" }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: "0.64rem", fontWeight: 700, color: "var(--text-muted)",
  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8,
};

const smallBtn: React.CSSProperties = {
  width: 26, height: 26, borderRadius: "var(--radius)", background: "var(--surface-2)",
  border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem",
  cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center",
};

function PlayCard({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ background: "var(--surface)", border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`, borderRadius: "var(--radius-xl)", padding: "16px" }}>
      {children}
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "6px 12px", textAlign: "center", minWidth: 52 }}>
      <p style={{ fontSize: "0.56rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{value}</p>
    </div>
  );
}

function QuickActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px", borderRadius: "var(--radius)", background: "var(--surface-2)",
        border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.76rem",
        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: accent ? "var(--accent-dim)" : "var(--surface)", border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`, borderRadius: "var(--radius-lg)", padding: "12px 10px", textAlign: "center" }}>
      <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.15rem", fontWeight: 700, color: accent ? "var(--accent-light)" : "var(--text)" }}>{value}</p>
    </div>
  );
}

function ViewSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      {children}
    </div>
  );
}

function ViewSaveRow({ label, bonus, prof }: { label: string; bonus: number; prof: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", background: prof ? "var(--accent-dim)" : "transparent", border: `1px solid ${prof ? "var(--accent)" : "transparent"}`, borderRadius: "var(--radius)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {prof && <span style={{ fontSize: "0.5rem", color: "var(--accent)" }}>◆</span>}
        <span style={{ fontSize: "0.76rem", color: prof ? "var(--accent-light)" : "var(--text-muted)", fontWeight: prof ? 700 : 400 }}>{label}</span>
      </div>
      <span style={{ fontSize: "0.84rem", fontWeight: 700, color: prof ? "var(--accent-light)" : "var(--text-muted)" }}>{signed(bonus)}</span>
    </div>
  );
}

function TraitGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
            <span style={{ color: "var(--accent)", fontSize: "0.68rem", flexShrink: 0, marginTop: 2 }}>•</span>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpellTag({ name, school }: { name: string; school: string | null }) {
  return (
    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-light)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>
      {name}
    </span>
  );
}
