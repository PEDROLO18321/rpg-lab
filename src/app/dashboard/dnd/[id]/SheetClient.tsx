"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { RollResultDie, RollToast } from "@/components/three/DiceRollFx";
import { proficiencyBonus, getMaxSlots, getMulticlassSlots } from "@/lib/dnd/leveling";
import { LevelUpButton } from "@/components/dashboard/LevelUpDialog";
import { SpellbookPanel } from "@/components/dashboard/SpellbookPanel";

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
// Habilidade de conjuração dos meio-conjuradores (magias a partir do 2° nível)
const HALF_CASTER_ABILITY: Record<string, string> = {
  paladino: "Carisma",
  patrulheiro: "Sabedoria",
};
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
  spellAbility: string | null;
  classes: { id: string; className: string; subclass: string | null; level: number }[];
  skills: { id: string; skillName: string; proficient: boolean; expertise: boolean }[];
  spells: { id: string; spellName: string; level: number; school: string | null; prepared: boolean; castingTime: string | null; range: string | null; duration: string | null; description: string | null }[];
  equipment: { id: string; itemName: string; quantity: number; equipped: boolean; weight: number | null; description: string | null }[];
  features: { id: string; name: string; source: string | null; description: string | null }[];
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
  advantagePickIdx?: number;
  pickMode?: "sum" | "max";
};

// per-slot boolean array: true = slot used
type SlotState = Record<string, boolean[]>;

// Descrição/personalidade serializada em Character.notes (ver StepDesc + POST de criação)
type DescData = {
  alignment?: string;
  age?: string; height?: string; weight?: string;
  eyes?: string; skin?: string; hair?: string;
  personalityTrait?: string; ideal?: string; bond?: string; flaw?: string;
  backstory?: string;
  languages?: string[];
};

function parseDesc(raw: string | null): DescData {
  if (!raw) return {};
  try {
    const d = JSON.parse(raw);
    return (d && typeof d === "object") ? d : {};
  } catch { return {}; }
}

interface Props {
  characterId: string;
  characterName: string;
  sheet: SheetRow;
  notes: string | null;
  portraitUrl: string | null;
  userName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mod(score: number) { return Math.floor((score - 10) / 2); }
function signed(n: number)  { return n >= 0 ? `+${n}` : `${n}`; }
function rollDie(sides: number) { return Math.floor(Math.random() * sides) + 1; }

const dndVBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: "50%",
  background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--text)", fontSize: "1.15rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const dndVBtnTemp: React.CSSProperties = {
  width: 26, height: 26, borderRadius: "4px",
  background: "rgba(79,195,247,0.1)", border: "1px dashed rgba(79,195,247,0.45)",
  color: "#4fc3f7", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};

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

export function SheetClient({ characterId, characterName, sheet: initial, notes, portraitUrl, userName }: Props) {
  const [mode, setMode] = useState<"ficha" | "jogar" | "editar">("ficha");
  const desc = parseDesc(notes);

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
  const [spells, setSpells] = useState(initial.spells);

  // Após subir de nível, router.refresh() traz `initial` novo do servidor;
  // re-sincroniza os estados que o level-up altera (magias novas no grimório,
  // PV ganho) sem precisar de F5. patchSheet persiste cada mudança local
  // antes, então o servidor é a fonte de verdade.
  useEffect(() => {
    setSpells(initial.spells);
    setHpCurrent(initial.hpCurrent);
  }, [initial]);

  // Lib data
  const [raceId, subraceId] = (initial.race ?? "").split("/");
  const race    = RACES.find((r) => r.id === raceId);
  const subrace = race?.subraces.find((s) => s.id === subraceId);
  const clsEntry = initial.classes[0];
  const cls = CLASSES.find((c) => c.id === clsEntry?.className);
  const bg  = BACKGROUNDS.find((b) => b.id === initial.background);
  const raceName = race ? (subrace ? `${race.name} (${subrace.name})` : race.name) : (initial.race ?? "—");

  // Exibição de classe(s): "Guerreiro 3 / Mago 2" para multiclasse, "Guerreiro" para única
  const classDisplay = initial.classes.length > 1
    ? initial.classes
        .map((c) => {
          const cl = CLASSES.find((x) => x.id === c.className);
          return `${cl?.name ?? c.className} ${c.level}`;
        })
        .join(" / ")
    : (cls?.name ?? clsEntry?.className ?? "—");

  const scores: Record<AbilityKey, number> = {
    str: initial.str, dex: initial.dex, con: initial.con,
    int: initial.int, wis: initial.wis, cha: initial.cha,
  };

  const proficientSaves = cls?.savingThrows ?? [];
  const proficientSkills = new Set(initial.skills.filter((s) => s.proficient).map((s) => s.skillName));
  const expertiseSkills  = new Set(initial.skills.filter((s) => s.expertise).map((s) => s.skillName));

  // Espaços de magia: multiclasse usa tabela combinada (PHB p.165)
  const maxSlots: Record<string, number> = initial.classes.length > 1
    ? getMulticlassSlots(initial.classes.map((c) => ({ classId: c.className, level: c.level })))
    : (clsEntry?.className ? getMaxSlots(clsEntry.className, initial.level) : {});

  // Para spellConfig: encontra a primeira classe conjuradora
  const casterEntry = initial.classes.find((c) => {
    return SPELLCASTING[c.className] || Object.keys(getMaxSlots(c.className, c.level)).length > 0;
  });
  const spellConfig: SpellcastingConfig | null = casterEntry?.className
    ? SPELLCASTING[casterEntry.className] ??
      (Object.keys(maxSlots).length > 0
        ? {
            cantripsKnown: 0,
            spellsKnown: 0,
            spellSlots1st: maxSlots["1"] ?? 0,
            ability: HALF_CASTER_ABILITY[casterEntry.className] ?? "Sabedoria",
            type: "prepare",
          }
        : null)
    : null;
  const isCaster = !!spellConfig || Object.keys(maxSlots).length > 0;

  // Atributo de conjuração: escolha salva na ficha sobrepõe o padrão da classe
  const [spellAbility, setSpellAbility] = useState<string>(
    initial.spellAbility ?? spellConfig?.ability ?? "Inteligência"
  );

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
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={userName}
        systemName="D&D 5e"
        systemHref="/dashboard/dnd/jogador"
        backLabel="Meus Personagens"
      />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 80px" }}>
        <Link href="/dashboard/dnd/jogador" style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
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
          <div style={{ width: 52, height: 52, borderRadius: "var(--radius-xl)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.72rem", fontWeight: 900, color: "var(--accent-light)", letterSpacing: "0.04em" }}>
              {cls ? cls.id.slice(0, 3).toUpperCase() : "D&D"}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>
              {characterName}
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>
              {[raceName, classDisplay, bg?.name].filter(Boolean).join(" · ")} · Nível {initial.level}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
            {initial.classes.length > 0 && (
              <LevelUpButton
                characterId={characterId}
                classes={initial.classes}
                raceKey={initial.race ?? ""}
                currentLevel={initial.level}
                scores={scores}
                knownSpellNames={spells.map((s) => s.spellName)}
              />
            )}
            <ModeBtn active={mode === "editar"} onClick={() => setMode("editar")}>Editar</ModeBtn>
            <ModeBtn active={mode === "ficha"} onClick={() => setMode("ficha")}>Ficha</ModeBtn>
            <ModeBtn active={mode === "jogar"} onClick={() => setMode("jogar")}>Jogar</ModeBtn>
          </div>
        </div>

        {mode === "editar" ? (
          <EditMode
            characterId={characterId}
            characterName={characterName}
            sheet={initial}
            desc={desc}
            portraitUrl={portraitUrl}
            equipment={equipment}    setEquipment={setEquipment}
            spells={spells}          setSpells={setSpells}
            gp={gp} setGp={setGp}
            cp={cp} setCp={setCp}
            sp={sp} setSp={setSp}
            ep={ep} setEp={setEp}
            pp={pp} setPp={setPp}
            isCaster={isCaster}
            classId={cls?.id ?? null}
            patchSheet={patchSheet}
          />
        ) : mode === "ficha" ? (
          <ViewMode
            characterId={characterId}
            characterName={characterName}
            sheet={initial}
            scores={scores}
            raceName={raceName}
            race={race}
            subrace={subrace}
            cls={cls}
            bg={bg}
            desc={desc}
            portraitUrl={portraitUrl}
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
            spells={spells}            setSpells={setSpells}
            spellAbility={spellAbility} setSpellAbility={setSpellAbility}
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
  characterName: string;
  sheet: SheetRow;
  scores: Record<AbilityKey, number>;
  raceName: string;
  race: ReturnType<typeof RACES.find>;
  subrace: ReturnType<typeof RACES.find> extends undefined ? undefined : unknown;
  cls: ReturnType<typeof CLASSES.find>;
  bg: ReturnType<typeof BACKGROUNDS.find>;
  desc: DescData;
  portraitUrl: string | null;
  proficientSaves: string[];
  proficientSkills: Set<string>;
  hpCurrent: number;
  hpTemp: number;
  gp: number;
  equipment: SheetRow["equipment"];
}

function ViewMode({ characterName, sheet, scores, raceName, race, subrace, cls, bg, desc, portraitUrl, proficientSaves, proficientSkills, hpCurrent, hpTemp, gp, equipment }: ViewProps) {
  const PROF_BONUS = proficiencyBonus(sheet.level);
  const passivePerception = 10 + mod(scores.wis) + (proficientSkills.has("Percepção") ? PROF_BONUS : 0);
  const subclassEntry = cls?.subclasses?.find((s) => s.id === sheet.classes[0]?.subclass || s.name === sheet.classes[0]?.subclass);
  const cantrips = sheet.spells.filter((s) => s.level === 0);
  const spells1  = sheet.spells.filter((s) => s.level > 0);

  const physical = [
    desc.age    && { l: "Idade",  v: desc.age },
    desc.height && { l: "Altura", v: desc.height },
    desc.weight && { l: "Peso",   v: desc.weight },
    desc.eyes   && { l: "Olhos",  v: desc.eyes },
    desc.skin   && { l: "Pele",   v: desc.skin },
    desc.hair   && { l: "Cabelo", v: desc.hair },
  ].filter(Boolean) as { l: string; v: string }[];
  const personality = [
    desc.personalityTrait && { l: "Traço de Personalidade", v: desc.personalityTrait },
    desc.ideal            && { l: "Ideal",                  v: desc.ideal },
    desc.bond             && { l: "Vínculo",                v: desc.bond },
    desc.flaw             && { l: "Fraqueza",               v: desc.flaw },
  ].filter(Boolean) as { l: string; v: string }[];
  const hasIdentity = !!portraitUrl || physical.length > 0 || (desc.languages?.length ?? 0) > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Retrato + aparência física */}
      {hasIdentity && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "18px 20px", display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
          {portraitUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={portraitUrl} alt="Retrato" style={{ width: 110, height: 110, objectFit: "cover", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-accent)", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, minHeight: portraitUrl ? 110 : undefined }}>
            <div>
              <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>{characterName}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                {[raceName, cls?.name, bg?.name].filter(Boolean).join(" · ")} · Nível {sheet.level}
              </p>
            </div>
            {physical.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
                {physical.map(({ l, v }) => (
                  <div key={l} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "7px 10px" }}>
                    <p style={{ fontSize: "0.56rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</p>
                    <p style={{ fontSize: "0.84rem", color: "var(--text)", marginTop: 2 }}>{v}</p>
                  </div>
                ))}
              </div>
            )}
            {(desc.languages?.length ?? 0) > 0 && (
              <div>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Idiomas</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {desc.languages!.map((lang) => (
                    <span key={lang} style={{ fontSize: "0.72rem", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>{lang}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
          {(race || sheet.classes.length > 0 || bg) && (
            <ViewSection label="Traços & Características">
              {race && <TraitGroup label={`Raça — ${raceName}`} color="#7ec8e3" items={[...(race as { traits: string[] }).traits, ...((subrace as { traits: string[] } | undefined)?.traits ?? [])]} />}
              {sheet.classes.map((ce: { id: string; className: string; level: number }) => {
                const cl = CLASSES.find((c) => c.id === ce.className);
                if (!cl) return null;
                return (
                  <TraitGroup
                    key={ce.id}
                    label={sheet.classes.length > 1 ? `${cl.name} — Nível ${ce.level}` : cl.name}
                    color="#c9941f"
                    items={cl.keyFeatures.filter((f: string) => {
                      const m = f.match(/\((\d+)°\)/);
                      return !m || parseInt(m[1]) <= ce.level;
                    })}
                  />
                );
              })}
              {sheet.features.length > 0 && (
                <TraitGroup
                  label="Adquiridas ao subir de nível"
                  color="#5fbf7f"
                  items={sheet.features.map((f) => `${f.name}${f.source ? ` (${f.source})` : ""} — ${f.description ?? ""}`)}
                />
              )}
              {bg && <TraitGroup label={`Antecedente — ${bg.name}`} color="#e09c5b" items={[`${bg.feature}: ${bg.featureDesc}`]} />}
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

      {/* Personalidade */}
      {personality.length > 0 && (
        <ViewSection label="Personalidade">
          {personality.map(({ l, v }) => (
            <div key={l} style={{ borderLeft: "3px solid var(--accent)", paddingLeft: 12 }}>
              <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{l}</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{v}</p>
            </div>
          ))}
        </ViewSection>
      )}

      {/* História */}
      {desc.backstory?.trim() && (
        <ViewSection label="História do Personagem">
          <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{desc.backstory}</p>
        </ViewSection>
      )}
    </div>
  );
}

// ── EDIT MODE (sandbox) ───────────────────────────────────────────────────────

const ALIGN_OPTIONS: { id: string; label: string }[] = Object.entries(ALIGNMENT_LABELS).map(([id, label]) => ({ id, label }));

interface EditProps {
  characterId: string;
  characterName: string;
  sheet: SheetRow;
  desc: DescData;
  portraitUrl: string | null;
  equipment: SheetRow["equipment"]; setEquipment: (v: SheetRow["equipment"]) => void;
  spells: SheetRow["spells"];       setSpells: (v: SheetRow["spells"]) => void;
  gp: number; setGp: (v: number) => void;
  cp: number; setCp: (v: number) => void;
  sp: number; setSp: (v: number) => void;
  ep: number; setEp: (v: number) => void;
  pp: number; setPp: (v: number) => void;
  isCaster: boolean;
  classId: string | null;
  patchSheet: (data: Record<string, unknown>) => Promise<void>;
}

function EditMode({
  characterId, characterName, sheet, desc: initialDesc, portraitUrl: initialPortrait,
  equipment, setEquipment, spells, setSpells,
  gp, setGp, cp, setCp, sp, setSp, ep, setEp, pp, setPp,
  isCaster, classId, patchSheet,
}: EditProps) {
  const router = useRouter();

  const [name, setName] = useState(characterName);
  const [scores, setScores] = useState<Record<AbilityKey, number>>({
    str: sheet.str, dex: sheet.dex, con: sheet.con, int: sheet.int, wis: sheet.wis, cha: sheet.cha,
  });
  const [combat, setCombat] = useState({
    hpMax: sheet.hpMax, hpCurrent: sheet.hpCurrent,
    armorClass: sheet.armorClass, initiative: sheet.initiative,
    speed: sheet.speed, level: sheet.level, xp: sheet.xp,
  });
  const [desc, setDesc] = useState<DescData>(initialDesc);
  const [portrait, setPortrait] = useState<string | null>(initialPortrait);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Item picker state ────────────────────────────────────────────────────
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [itemPickerGroup, setItemPickerGroup] = useState<PickerGroup>("Tudo");
  const [itemQty, setItemQty] = useState(1);
  const [addingItem, setAddingItem] = useState(false);

  // ── Currency state ───────────────────────────────────────────────────────
  const [goldInput, setGoldInput] = useState("");
  const [goldCurrency, setGoldCurrency] = useState<"gp"|"cp"|"sp"|"ep"|"pp">("gp");
  const [showConvert, setShowConvert] = useState(false);
  const [convertFrom, setConvertFrom] = useState<"cp"|"sp"|"ep"|"gp"|"pp">("gp");
  const [convertTo, setConvertTo]     = useState<"cp"|"sp"|"ep"|"gp"|"pp">("cp");
  const [convertAmt, setConvertAmt]   = useState(1);

  const currencySetters: Record<string, [number, (v: number) => void]> = {
    gp: [gp, setGp], cp: [cp, setCp], sp: [sp, setSp], ep: [ep, setEp], pp: [pp, setPp],
  };

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

  const filteredItems = ALL_PHB_ITEMS.filter((item) => {
    const matchGroup = itemPickerGroup === "Tudo" || item.group === itemPickerGroup;
    const matchSearch = itemSearch === "" || item.name.toLowerCase().includes(itemSearch.toLowerCase());
    return matchGroup && matchSearch;
  });

  function setScore(k: AbilityKey, v: number) {
    setScores((s) => ({ ...s, [k]: v }));
    setSaved(false);
  }
  function setCombatField(k: keyof typeof combat, v: number) {
    setCombat((c) => ({ ...c, [k]: v }));
    setSaved(false);
  }
  function setDescField(k: keyof DescData, v: string) {
    setDesc((d) => ({ ...d, [k]: v }));
    setSaved(false);
  }

  // Redimensiona a imagem escolhida (máx. 400px) e guarda como data URL — sem
  // depender de storage externo; cabe na coluna portraitUrl.
  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const max = 400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        setPortrait(canvas.toDataURL("image/jpeg", 0.85));
        setSaved(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const sheetRes = await fetch(`/api/dnd/characters/${characterId}/sheet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scores, ...combat }),
      });
      // Preserva languages e quaisquer campos extras do notes original
      const notes = JSON.stringify({ ...initialDesc, ...desc });
      const charRes = await fetch(`/api/dnd/characters/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, notes, portraitUrl: portrait }),
      });
      if (!sheetRes.ok || !charRes.ok) throw new Error("Falha ao salvar.");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "rgba(201,148,31,0.08)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
        <p style={{ fontSize: "0.78rem", color: "var(--accent-light)", fontWeight: 700, marginBottom: 2 }}>⚠️ Atenção: edição manual da ficha</p>
        <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Ao salvar, as informações antigas serão substituídas pelos valores atuais desta tela. Revise com cuidado antes de confirmar, especialmente ajustes manuais, itens, bônus e recursos do personagem.
        </p>
      </div>

      {/* Identidade + retrato */}
      <EditSection label="Identidade">
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 110, height: 110, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-accent)", background: "var(--surface-2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {portrait
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={portrait} alt="Retrato" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "0.66rem", color: "var(--text-subtle)", textAlign: "center", padding: 8 }}>Sem foto</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} style={{ display: "none" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => fileRef.current?.click()} style={miniBtn}>Trocar foto</button>
              {portrait && <button onClick={() => { setPortrait(null); setSaved(false); }} style={miniBtn}>Remover</button>}
            </div>
            <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", textAlign: "center", lineHeight: 1.4, maxWidth: 130 }}>
              Ideal: imagem quadrada (1:1), ~400×400px. Redimensionada automaticamente.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 12 }}>
            <EditText label="Nome" value={name} onChange={(v) => { setName(v); setSaved(false); }} />
            <div>
              <p style={editLabelStyle}>Alinhamento</p>
              <select
                value={desc.alignment ?? ""}
                onChange={(e) => setDescField("alignment", e.target.value)}
                style={{ ...editInputStyle, cursor: "pointer" }}
              >
                <option value="">—</option>
                {ALIGN_OPTIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </EditSection>

      {/* Atributos */}
      <EditSection label="Atributos">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {ABILITIES.map((k) => (
            <EditNumber
              key={k}
              label={`${ABILITY_SHORT[k]} · ${ABILITY_LABELS[k]}`}
              value={scores[k]}
              onChange={(v) => setScore(k, v)}
              hint={`mod ${signed(mod(scores[k]))}`}
            />
          ))}
        </div>
      </EditSection>

      {/* Combate / Progressão */}
      <EditSection label="Combate & Progressão">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          <EditNumber label="PV Máximo"   value={combat.hpMax}      onChange={(v) => setCombatField("hpMax", v)} />
          <EditNumber label="PV Atual"    value={combat.hpCurrent}  onChange={(v) => setCombatField("hpCurrent", v)} />
          <EditNumber label="Classe de Armadura" value={combat.armorClass} onChange={(v) => setCombatField("armorClass", v)} />
          <EditNumber label="Iniciativa"  value={combat.initiative} onChange={(v) => setCombatField("initiative", v)} />
          <EditNumber label="Velocidade"  value={combat.speed}      onChange={(v) => setCombatField("speed", v)} />
          <EditNumber label="Nível"       value={combat.level}      onChange={(v) => setCombatField("level", v)} min={1} />
          <EditNumber label="XP"          value={combat.xp}         onChange={(v) => setCombatField("xp", v)} />
        </div>
        <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginTop: 8, lineHeight: 1.5 }}>
          Alterar o Nível aqui não concede recursos automáticos — use "Subir de Nível" para isso. Este campo é só para correções manuais.
        </p>
      </EditSection>

      {/* Aparência */}
      <EditSection label="Aparência Física">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          <EditText label="Idade"  value={desc.age ?? ""}    onChange={(v) => setDescField("age", v)} />
          <EditText label="Altura" value={desc.height ?? ""} onChange={(v) => setDescField("height", v)} />
          <EditText label="Peso"   value={desc.weight ?? ""} onChange={(v) => setDescField("weight", v)} />
          <EditText label="Olhos"  value={desc.eyes ?? ""}   onChange={(v) => setDescField("eyes", v)} />
          <EditText label="Pele"   value={desc.skin ?? ""}   onChange={(v) => setDescField("skin", v)} />
          <EditText label="Cabelo" value={desc.hair ?? ""}   onChange={(v) => setDescField("hair", v)} />
        </div>
      </EditSection>

      {/* Personalidade */}
      <EditSection label="Personalidade & História">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <EditArea label="Traço de Personalidade" value={desc.personalityTrait ?? ""} onChange={(v) => setDescField("personalityTrait", v)} />
          <EditArea label="Ideal"    value={desc.ideal ?? ""} onChange={(v) => setDescField("ideal", v)} />
          <EditArea label="Vínculo"  value={desc.bond ?? ""}  onChange={(v) => setDescField("bond", v)} />
          <EditArea label="Fraqueza" value={desc.flaw ?? ""}  onChange={(v) => setDescField("flaw", v)} />
          <EditArea label="História" value={desc.backstory ?? ""} onChange={(v) => setDescField("backstory", v)} rows={6} />
        </div>
      </EditSection>

      {/* Inventário */}
      <EditSection label="Inventário">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {equipment.length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)" }}>Nenhum item no inventário.</p>
          ) : equipment.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
              <button
                onClick={() => toggleEquipped(item)}
                style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${item.equipped ? "var(--accent)" : "var(--border)"}`, background: item.equipped ? "var(--accent-dim)" : "transparent", cursor: "pointer", flexShrink: 0 }}
                title={item.equipped ? "Equipado" : "Guardado"}
              />
              <span style={{ flex: 1, fontSize: "0.84rem", color: "var(--text)" }}>{item.itemName}{item.quantity > 1 ? ` ×${item.quantity}` : ""}</span>
              <button onClick={() => removeItem(item.id)} style={{ ...miniBtn, color: "#ff6b6b", borderColor: "#ff6b6b44" }}>✕</button>
            </div>
          ))}
          <button
            onClick={() => setShowItemPicker(true)}
            style={{ padding: "8px 16px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start" }}
          >
            + Adicionar item
          </button>
        </div>
      </EditSection>

      {/* Moedas */}
      <EditSection label="Moedas">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 10 }}>
          {(["cp","sp","ep","gp","pp"] as const).map((coin) => {
            const [value] = currencySetters[coin];
            return (
              <div key={coin} style={{ background: "var(--surface-2)", border: `1px solid ${CURRENCY_COLOR[coin]}44`, borderRadius: "var(--radius)", padding: "8px 4px", textAlign: "center" }}>
                <p style={{ fontSize: "0.54rem", fontWeight: 700, color: CURRENCY_COLOR[coin], textTransform: "uppercase", letterSpacing: "0.05em" }}>{CURRENCY_LABEL[coin]}</p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{value}</p>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
          <select value={goldCurrency} onChange={(e) => setGoldCurrency(e.target.value as "gp")} style={{ padding: "5px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit" }}>
            {(["cp","sp","ep","gp","pp"] as const).map((c) => <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>)}
          </select>
          <input type="number" value={goldInput} onChange={(e) => setGoldInput(e.target.value)} placeholder="±" onKeyDown={(e) => e.key === "Enter" && adjustCurrency()} style={{ width: 64, padding: "5px 6px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.82rem", fontFamily: "inherit" }} />
          <button onClick={adjustCurrency} style={{ padding: "5px 10px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>OK</button>
        </div>
        <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", marginBottom: 6 }}>Use +N para ganhar, −N para gastar</p>
        <button onClick={() => setShowConvert((v) => !v)} style={{ fontSize: "0.7rem", color: "var(--accent-light)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", paddingLeft: 0, marginBottom: showConvert ? 8 : 0 }}>
          {showConvert ? "▲" : "▼"} Converter moedas
        </button>
        {showConvert && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>1PL=10PO · 1PO=2PE=10PP=100PC · 1PE=5PP</p>
            <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
              <input type="number" min={1} value={convertAmt} onChange={(e) => setConvertAmt(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 48, padding: "4px 6px", borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.8rem", fontFamily: "inherit" }} />
              <select value={convertFrom} onChange={(e) => setConvertFrom(e.target.value as "gp")} style={{ padding: "4px", borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit" }}>
                {(["cp","sp","ep","gp","pp"] as const).map((c) => <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>)}
              </select>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>→</span>
              <select value={convertTo} onChange={(e) => setConvertTo(e.target.value as "cp")} style={{ padding: "4px", borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit" }}>
                {(["cp","sp","ep","gp","pp"] as const).map((c) => <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>)}
              </select>
            </div>
            {convertFrom !== convertTo && (
              <p style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>= {Math.floor((convertAmt * CP_VALUE[convertFrom]) / CP_VALUE[convertTo])} {CURRENCY_LABEL[convertTo]}</p>
            )}
            <button onClick={convertCurrency} disabled={convertFrom === convertTo || currencySetters[convertFrom][0] < convertAmt} style={{ padding: "5px 10px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.76rem", cursor: "pointer", fontFamily: "inherit", opacity: (convertFrom === convertTo || currencySetters[convertFrom][0] < convertAmt) ? 0.4 : 1 }}>
              Converter
            </button>
          </div>
        )}
      </EditSection>

      {/* Magias */}
      {isCaster && (
        <EditSection label="Magias">
          <SpellbookPanel
            characterId={characterId}
            classId={classId}
            spells={spells}
            onSpellAdded={(spell) => setSpells([...spells, spell])}
          />
        </EditSection>
      )}

      {/* Save bar */}
      <div style={{ position: "sticky", bottom: 0, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xl)", boxShadow: "0 -4px 24px rgba(0,0,0,0.25)" }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: "10px 24px", borderRadius: "var(--radius-lg)", background: "var(--accent-dim)",
            border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700,
            fontSize: "0.9rem", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
            boxShadow: "0 0 16px var(--accent-glow)", opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Salvando…" : "💾 Salvar alterações"}
        </button>
        {saved && <span style={{ fontSize: "0.82rem", color: "#5fbf7f", fontWeight: 700 }}>✓ Salvo</span>}
        {error && <span style={{ fontSize: "0.82rem", color: "#ff6b6b" }}>{error}</span>}
      </div>

      {/* Item Picker Modal */}
      {showItemPicker && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={(e) => { if (e.target === e.currentTarget) setShowItemPicker(false); }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 680, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>Adicionar Item</p>
              <button onClick={() => setShowItemPicker(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
              <input autoFocus value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} placeholder="Buscar item..." style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.88rem", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ padding: "8px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PICKER_GROUPS.map((g) => (
                <button key={g} onClick={() => setItemPickerGroup(g)} style={{ padding: "4px 12px", borderRadius: "var(--radius)", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: itemPickerGroup === g ? "var(--accent-dim)" : "var(--surface-2)", border: `1px solid ${itemPickerGroup === g ? "var(--accent)" : "var(--border)"}`, color: itemPickerGroup === g ? "var(--accent-light)" : "var(--text-muted)" }}>{g}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
              {filteredItems.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", textAlign: "center", padding: "24px 0" }}>Nenhum item encontrado.</p>
              ) : filteredItems.map((item) => {
                const w = WEAPONS.find((w) => w.name === item.name);
                const alreadyHas = equipment.some((e) => e.itemName === item.name);
                return (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
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
                      <button disabled={addingItem} onClick={async () => { await addItemByName(item.name, itemQty); setItemQty(1); }} style={{ padding: "5px 12px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.76rem", cursor: addingItem ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: addingItem ? 0.6 : 1 }}>+ Add</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const editLabelStyle: React.CSSProperties = {
  fontSize: "0.66rem", fontWeight: 700, color: "var(--text-muted)",
  textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5,
};
const editInputStyle: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "8px 12px", color: "var(--text)",
  fontSize: "0.86rem", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const miniBtn: React.CSSProperties = {
  padding: "5px 10px", borderRadius: "var(--radius)", background: "var(--surface-2)",
  border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.72rem",
  cursor: "pointer", fontFamily: "inherit",
};

function EditSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      {children}
    </div>
  );
}

function EditNumber({ label, value, onChange, hint, min }: { label: string; value: number; onChange: (v: number) => void; hint?: string; min?: number }) {
  const clamp = (v: number) => (min != null ? Math.max(min, v) : v);
  return (
    <div>
      <p style={editLabelStyle}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={() => onChange(clamp(value - 1))} style={smallBtn}>−</button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(clamp(parseInt(e.target.value) || 0))}
          style={{ ...editInputStyle, textAlign: "center", padding: "8px 4px", fontWeight: 700 }}
        />
        <button onClick={() => onChange(clamp(value + 1))} style={smallBtn}>+</button>
      </div>
      {hint && <p style={{ fontSize: "0.64rem", color: "var(--text-subtle)", marginTop: 3, textAlign: "center" }}>{hint}</p>}
    </div>
  );
}

function EditText({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p style={editLabelStyle}>{label}</p>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} style={editInputStyle} />
    </div>
  );
}

function EditArea({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <p style={editLabelStyle}>{label}</p>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={{ ...editInputStyle, lineHeight: 1.6, resize: "vertical" }} />
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
  spells: SheetRow["spells"];        setSpells: (v: SheetRow["spells"]) => void;
  spellAbility: string;              setSpellAbility: (v: string) => void;
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
  spells, setSpells, spellAbility, setSpellAbility,
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
  const [pickMode, setPickMode] = useState<"sum" | "max">("max");
  const [advantage, setAdvantage] = useState<"normal" | "advantage" | "disadvantage">("normal");
  const [advExtraDice, setAdvExtraDice] = useState(1); // dados extras de vantagem/desvantagem
  const [lastRoll, setLastRoll] = useState<RollEntry | null>(null);
  const [rollHistory, setRollHistory] = useState<RollEntry[]>([]);
  // Rolagem disparada fora do painel de dados (perícias, ataques, saves) →
  // alimenta o toast 3D flutuante.
  const [fxRoll, setFxRoll] = useState<RollEntry | null>(null);
  const rollId = useRef(0);

  // HP panel state
  const [confirmRestore, setConfirmRestore] = useState(false);

  // Restaura a ficha por completo: PV no máximo, dados de vida, espaços de
  // magia e testes contra a morte zerados.
  function restoreSheet() {
    setHpCurrent(sheet.hpMax);
    setHitDiceUsed(0);
    setDsSuccess(0);
    setDsFailure(0);
    setSlotsUsed({});
    setConfirmRestore(false);
    patchSheet({
      hpCurrent: sheet.hpMax,
      hitDiceUsed: 0,
      deathSavesSuccess: 0,
      deathSavesFailure: 0,
      spellSlotsUsed: JSON.stringify({}),
    });
  }

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

  // Inventory expansion + per-item attack attribute + quick actions
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [itemAtkAttr, setItemAtkAttr] = useState<Record<string, AbilityKey>>({});
  const [quickActionItemIds, setQuickActionItemIds] = useState<Set<string>>(new Set());

  const PROF_BONUS = proficiencyBonus(sheet.level);
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
  // Atributo escolhido pelo jogador (persistido na ficha) > padrão da classe
  const spellAbilityKey: AbilityKey = spellAbilityMap[spellAbility] ?? "int";
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
    const effectiveBonus = bonus;

    let advantagePickIdx: number | undefined;
    if (die === 20 && mode !== "normal") {
      const totalDice = count + advExtraDice;
      const rs = Array.from({ length: totalDice }, () => rollDie(die));
      allRolls = rs;
      const sorted = [...rs].sort((a, b) => b - a); // desc
      advantagePickIdx = mode === "advantage" ? 0 : advExtraDice;
      rolls = [sorted[Math.min(advantagePickIdx, sorted.length - 1)]];
    } else {
      rolls = Array.from({ length: count }, () => rollDie(die));
    }

    const useMax = pickMode === "max" && !allRolls && rolls.length > 1;
    const rawTotal = useMax ? Math.max(...rolls) : rolls.reduce((a, b) => a + b, 0);
    const total = rawTotal + effectiveBonus;
    const isCrit   = die === 20 && rolls[0] === 20;
    const isFumble = die === 20 && rolls[0] === 1;
    const entry: RollEntry = {
      id: ++rollId.current, label, dice: die, count, modifier: effectiveBonus, rolls, total, isCrit, isFumble,
      ...(allRolls ? { allRolls, advantageMode: mode as "advantage" | "disadvantage", advantagePickIdx } : {}),
      ...(useMax ? { pickMode: "max" } : {}),
    };
    setLastRoll(entry);
    setRollHistory((prev) => [entry, ...prev].slice(0, 5));
    return entry;
  }

  function quickRoll(label: string, bonus: number) {
    setFxRoll(doRoll(label, 20, 1, bonus, "normal"));
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
    setFxRoll(doRoll(`${name} — Dano`, dieSides, dieCount, dmgMod, "normal"));
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
    // Usa o MESMO resultado exibido (antes rolava dois números distintos).
    const entry = doRoll("Resistência à Morte", 20, 1, 0, "normal");
    setFxRoll(entry);
    const roll = entry.rolls[0];
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

      {/* Toast 3D de rolagem (perícias, ataques, saves) */}
      <RollToast roll={fxRoll} />

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

        {/* HP arrows (Ordem-style) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Main HP −/+ */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => applyDamage(1)} style={dndVBtn}>−</button>
            <button onClick={() => applyHeal(1)} style={dndVBtn}>+</button>
          </div>

          <div style={{ width: 1, height: 28, background: "var(--border)", flexShrink: 0 }} />

          {/* Temp HP */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "var(--text-subtle)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Temp</span>
            <button onClick={() => { const v = Math.max(0, hpTemp - 1); setHpTemp(v); patchSheet({ hpTemp: v }); }} style={dndVBtnTemp}>−</button>
            <span style={{ minWidth: 22, textAlign: "center", fontSize: "0.9rem", fontWeight: 800, color: hpTemp > 0 ? "#4fc3f7" : "var(--text-subtle)", fontFamily: "var(--font-cinzel), serif" }}>{hpTemp}</span>
            <button onClick={() => { const v = hpTemp + 1; setHpTemp(v); patchSheet({ hpTemp: v }); }} style={dndVBtnTemp}>+</button>
          </div>

          <div style={{ width: 1, height: 28, background: "var(--border)", flexShrink: 0 }} />

          {/* Restaurar */}
          {confirmRestore ? (
            <>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Restaurar tudo?</span>
              <button onClick={restoreSheet} style={{ padding: "5px 12px", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: "rgba(95,191,127,0.25)", border: "1px solid #5fbf7f", color: "#5fbf7f" }}>Sim</button>
              <button onClick={() => setConfirmRestore(false)} style={{ padding: "5px 12px", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>Não</button>
            </>
          ) : (
            <button onClick={() => setConfirmRestore(true)} title="Restaura PV, dados de vida e espaços de magia ao máximo"
              style={{ padding: "5px 12px", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              ✨ Restaurar Ficha
            </button>
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
                    onClick={() => quickRoll(`Teste de ${ABILITY_LABELS[k]}`, m)}
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

              {/* Items adicionados às ações rápidas */}
              {equipment
                .filter((e) => quickActionItemIds.has(e.id))
                .map((e) => {
                  const w = WEAPONS.find((w) => w.name.toLowerCase() === e.itemName.toLowerCase());
                  const atkAttr: AbilityKey = itemAtkAttr[e.id] ?? (w?.finesse ? (scores.str >= scores.dex ? "str" : "dex") : w?.ranged ? "dex" : "str");
                  const atkBonus = mod(scores[atkAttr]) + PROF_BONUS;
                  return (
                    <div key={e.id} style={{ display: "flex", gap: 4 }}>
                      <QuickActionBtn
                        label={`⚡ ${e.itemName} (${signed(atkBonus)})`}
                        onClick={() => quickRoll(`Ataque — ${e.itemName}`, atkBonus)}
                      />
                      {w && (
                        <button
                          onClick={() => rollWeaponDamage(e.itemName, w.damage, mod(scores[atkAttr]))}
                          title={`Dano: ${w.damage}+${mod(scores[atkAttr])} ${w.damageType}`}
                          style={{ padding: "6px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-subtle)", fontSize: "0.72rem", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          {w.damage}
                        </button>
                      )}
                    </div>
                  );
                })}

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

            {/* Die type selector — SVG shapes */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 10 }}>
              {DICE_TYPES.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDie(d)}
                  title={`d${d}`}
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer",
                    opacity: selectedDie === d ? 1 : 0.4,
                    transition: "opacity 0.15s, transform 0.15s",
                    transform: selectedDie === d ? "scale(1.18) translateY(-2px)" : "scale(1)",
                    filter: selectedDie === d ? "drop-shadow(0 0 5px var(--accent))" : "none",
                  }}
                >
                  <DieSvg sides={d} active={selectedDie === d} size={42} />
                </button>
              ))}
            </div>

            {/* Central die display — 3D quando o dispositivo aguenta */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <RollResultDie
                sides={selectedDie}
                size={110}
                roll={lastRoll && lastRoll.dice === selectedDie ? lastRoll : null}
                fallback={
                  <DieSvg
                    sides={selectedDie}
                    active
                    size={110}
                    result={lastRoll && lastRoll.dice === selectedDie ? lastRoll.total : null}
                  />
                }
              />
            </div>

            {/* Advantage/disadvantage (d20 only) */}
            {selectedDie === 20 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: advantage !== "normal" ? 8 : 0 }}>
                  {(["normal", "advantage", "disadvantage"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAdvantage(a)}
                      style={{
                        padding: "4px 10px", borderRadius: "var(--radius-xs)", fontSize: "0.66rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                        background: advantage === a ? "var(--accent-dim)" : "var(--surface-2)",
                        border: `1px solid ${advantage === a ? "var(--accent)" : "var(--border)"}`,
                        color: advantage === a ? "var(--accent-light)" : "var(--text-subtle)",
                        transition: "all 0.15s",
                      }}
                    >
                      {a === "normal" ? "Normal" : a === "advantage" ? "Vantagem" : "Desv."}
                    </button>
                  ))}
                </div>

                {/* Dados extras de vantagem/desvantagem */}
                {advantage !== "normal" && (
                  <div style={{
                    background: "var(--surface-2)", border: "1px solid var(--border-accent)",
                    borderRadius: "var(--radius-lg)", padding: "8px 14px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <button
                      onClick={() => setAdvExtraDice(Math.max(1, advExtraDice - 1))}
                      style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem", cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >−</button>
                    <span style={{ fontFamily: "var(--font-cinzel), serif", fontWeight: 700, fontSize: "0.88rem", color: "var(--accent-light)", minWidth: 18, textAlign: "center" }}>+{advExtraDice}</span>
                    <button
                      onClick={() => setAdvExtraDice(Math.min(5, advExtraDice + 1))}
                      style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem", cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >+</button>
                    <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>
                      dado{advExtraDice !== 1 ? "s" : ""} de {advantage === "advantage" ? "vantagem" : "desvantagem"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Qty + Modifier + Soma/Maior */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", marginBottom: 10, flexWrap: "wrap" }}>
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
              {/* Bolinhas Soma / Maior — oculto em modo vantagem (tem lógica própria) */}
              {advantage === "normal" && (
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  {(["sum", "max"] as const).map((m) => {
                    const active = pickMode === m;
                    const disabled = diceCount <= 1;
                    return (
                      <button
                        key={m}
                        onClick={() => setPickMode(m)}
                        title={m === "sum" ? "Somar todos os dados" : "Usar o maior dado"}
                        disabled={disabled}
                        style={{
                          width: 42, height: 42, borderRadius: "50%",
                          background: active ? "var(--accent-dim)" : "var(--surface-2)",
                          border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                          color: active ? "var(--accent-light)" : disabled ? "var(--text-subtle)" : "var(--text-muted)",
                          fontFamily: "var(--font-cinzel), serif",
                          fontSize: "0.6rem", fontWeight: 700, cursor: disabled ? "default" : "pointer",
                          opacity: disabled ? 0.4 : 1,
                          boxShadow: active ? "0 0 10px var(--accent-glow)" : "none",
                          transition: "all 0.15s",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {m === "sum" ? "Soma" : "Maior"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Roll button */}
            <button
              onClick={() => doRoll(`${diceCount}d${selectedDie}${diceModifier !== 0 ? (diceModifier > 0 ? `+${diceModifier}` : diceModifier) : ""}`)}
              style={{
                width: "100%", padding: "10px", borderRadius: "var(--radius-lg)",
                background: "var(--accent-dim)", border: "1px solid var(--accent)",
                color: "var(--accent-light)", fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.92rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em",
                boxShadow: "0 0 16px var(--accent-glow)",
                transition: "all 0.15s",
                marginBottom: 8,
              }}
            >
              ROLAR {diceCount}d{selectedDie}{diceModifier !== 0 ? (diceModifier > 0 ? `+${diceModifier}` : diceModifier) : ""}
            </button>

            {/* Last roll detail */}
            {lastRoll && (
              <div style={{ textAlign: "center", marginBottom: 6 }}>
                {lastRoll.isCrit    && <p style={{ fontSize: "0.66rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>✦ ACERTO CRITICO ✦</p>}
                {lastRoll.isFumble  && <p style={{ fontSize: "0.66rem", fontWeight: 700, color: "#ff4444", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>FALHA CRITICA</p>}

                {/* Dados de vantagem: mostra sorted desc, destaca o escolhido */}
                {lastRoll.advantageMode && lastRoll.allRolls && (() => {
                  const sorted = [...lastRoll.allRolls].sort((a, b) => b - a);
                  const pickIdx = lastRoll.advantagePickIdx ?? (lastRoll.advantageMode === "advantage" ? 0 : 1);
                  return (
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      {sorted.map((r, i) => {
                        const isPicked = i === pickIdx;
                        return (
                          <span
                            key={i}
                            style={{
                              fontSize: isPicked ? "0.95rem" : "0.78rem", fontWeight: isPicked ? 900 : 400,
                              color: isPicked ? "var(--accent-light)" : "var(--text-subtle)",
                              background: isPicked ? "var(--accent-dim)" : "var(--surface)",
                              border: `1px solid ${isPicked ? "var(--accent)" : "var(--border)"}`,
                              borderRadius: "var(--radius)", padding: "2px 9px",
                            }}
                          >
                            {r}{isPicked ? " ✓" : ""}
                          </span>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Multi-dado modo Maior: destaca o maior */}
                {lastRoll.pickMode === "max" && lastRoll.rolls.length > 1 && (() => {
                  const maxVal = Math.max(...lastRoll.rolls);
                  let markedMax = false;
                  return (
                    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                      {lastRoll.rolls.map((r, i) => {
                        const isMax = r === maxVal && !markedMax;
                        if (isMax) markedMax = true;
                        return (
                          <span
                            key={i}
                            style={{
                              fontSize: isMax ? "0.95rem" : "0.78rem", fontWeight: isMax ? 900 : 400,
                              color: isMax ? "var(--accent-light)" : "var(--text-subtle)",
                              background: isMax ? "var(--accent-dim)" : "var(--surface)",
                              border: `1px solid ${isMax ? "var(--accent)" : "var(--border)"}`,
                              borderRadius: "var(--radius)", padding: "2px 9px",
                            }}
                          >
                            {r}{isMax ? " ↑" : ""}
                          </span>
                        );
                      })}
                    </div>
                  );
                })()}

                <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>
                  {lastRoll.label} · [{lastRoll.rolls.join(", ")}]{lastRoll.modifier !== 0 ? ` ${lastRoll.modifier >= 0 ? "+" : ""}${lastRoll.modifier}` : ""}
                  {lastRoll.pickMode === "max" ? " · Maior" : ""}
                </p>
              </div>
            )}

            {/* History */}
            {rollHistory.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <p style={{ ...labelStyle, marginBottom: 2 }}>Histórico</p>
                {rollHistory.slice(0, 5).map((r) => {
                  const dieResult = r.total - r.modifier;
                  return (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 8px", background: "var(--surface-2)", borderRadius: "var(--radius-xs)" }}>
                      <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", fontWeight: 700, color: r.isCrit ? "var(--accent-light)" : r.isFumble ? "#ff6b6b" : "var(--text)", minWidth: 26 }}>{r.total}</span>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", flex: 1 }}>{r.label}</span>
                      {r.modifier !== 0 && (
                        <span style={{ fontSize: "0.6rem", color: "var(--text-subtle)" }}>
                          {dieResult}{r.modifier > 0 ? `+${r.modifier}` : r.modifier}
                        </span>
                      )}
                      <span style={{ fontSize: "0.62rem", color: r.isCrit ? "var(--accent)" : r.isFumble ? "#ff6b6b" : "var(--text-subtle)", fontWeight: r.isCrit || r.isFumble ? 700 : 400 }}>
                        {r.isCrit ? "CRIT" : r.isFumble ? "FAIL" : `d${r.dice}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </PlayCard>

          {/* Spell Slots — individual per-slot bubbles */}
          {isCaster && spellConfig && (
            <PlayCard>
              <p style={labelStyle}>Espaços de Magia</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Atributo de conjuração (escolhível) + valores derivados */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Habilidade:</span>
                  <select
                    value={spellAbility}
                    onChange={(e) => {
                      setSpellAbility(e.target.value);
                      patchSheet({ spellAbility: e.target.value });
                    }}
                    style={{
                      padding: "4px 8px", borderRadius: "var(--radius)",
                      background: "var(--surface-2)", border: "1px solid var(--border-accent)",
                      color: "var(--accent-light)", fontSize: "0.76rem", fontWeight: 700,
                      fontFamily: "inherit", cursor: "pointer",
                    }}
                  >
                    {["Inteligência", "Sabedoria", "Carisma"].map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  {spellAbility !== spellConfig.ability && (
                    <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>
                      (padrão da classe: {spellConfig.ability})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4 }}>
                  CD da Magia: <strong style={{ color: "var(--accent-light)" }}>{spellSaveDC}</strong>
                  {" · "}Bônus de Ataque: <strong style={{ color: "var(--accent-light)" }}>{signed(spellAttackBonus)}</strong>
                  {" · "}Mod.: <strong style={{ color: "var(--accent-light)" }}>{signed(mod(scores[spellAbilityKey]))}</strong>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {equipment.map((item) => {
                  const w = WEAPONS.find((w) => w.name.toLowerCase() === item.itemName.toLowerCase());
                  const catalogItem = ALL_PHB_ITEMS.find((i) => i.name.toLowerCase() === item.itemName.toLowerCase());
                  const isExpanded = expandedItemId === item.id;
                  const isQuick = quickActionItemIds.has(item.id);
                  const defaultAtk: AbilityKey = w?.finesse
                    ? (scores.str >= scores.dex ? "str" : "dex")
                    : w?.ranged ? "dex" : "str";
                  const atkAttr: AbilityKey = itemAtkAttr[item.id] ?? defaultAtk;
                  const atkBonus = mod(scores[atkAttr]) + PROF_BONUS;

                  return (
                    <div key={item.id}>
                      {/* Item row */}
                      <div
                        style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                          background: isExpanded ? "var(--surface-2)" : item.equipped ? "var(--accent-dim)" : "var(--surface-2)",
                          border: `1px solid ${isExpanded ? "var(--border-accent)" : item.equipped ? "var(--border-accent)" : "var(--border)"}`,
                          borderRadius: isExpanded ? "var(--radius-lg) var(--radius-lg) 0 0" : "var(--radius-lg)",
                          transition: "all 0.15s", cursor: "pointer",
                        }}
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleEquipped(item); }}
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
                            {isQuick && <span style={{ marginLeft: 6, fontSize: "0.6rem", color: "#5fbf7f" }}>⚡</span>}
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
                        <span style={{ fontSize: "0.6rem", color: "var(--text-subtle)", marginLeft: 4 }}>{isExpanded ? "▲" : "▼"}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                          style={{ fontSize: "0.7rem", color: "var(--text-subtle)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px", lineHeight: 1, flexShrink: 0 }}
                          title="Remover item"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Detail balloon */}
                      {isExpanded && (
                        <div style={{
                          background: "var(--surface-2)", border: "1px solid var(--border-accent)",
                          borderTop: "none", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
                          padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10,
                        }}>
                          {/* Stats chips */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {catalogItem?.group && (
                              <span style={{ fontSize: "0.62rem", padding: "2px 8px", borderRadius: "var(--radius-xs)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                                <strong>Tipo:</strong> {catalogItem.group}
                              </span>
                            )}
                            {w && (
                              <>
                                <span style={{ fontSize: "0.62rem", padding: "2px 8px", borderRadius: "var(--radius-xs)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                                  <strong>Dano:</strong> {w.damage} {w.damageType}
                                </span>
                                <span style={{ fontSize: "0.62rem", padding: "2px 8px", borderRadius: "var(--radius-xs)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                                  <strong>Categoria:</strong> {w.category}
                                </span>
                                {w.range && (
                                  <span style={{ fontSize: "0.62rem", padding: "2px 8px", borderRadius: "var(--radius-xs)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                                    <strong>Alcance:</strong> {w.range}m
                                  </span>
                                )}
                                {w.finesse && (
                                  <span style={{ fontSize: "0.62rem", padding: "2px 8px", borderRadius: "var(--radius-xs)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--accent-light)" }}>
                                    Acuidade
                                  </span>
                                )}
                              </>
                            )}
                            {catalogItem?.cost && (
                              <span style={{ fontSize: "0.62rem", padding: "2px 8px", borderRadius: "var(--radius-xs)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--accent-light)" }}>
                                {catalogItem.cost}
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          {item.description ? (
                            <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.55 }}>{item.description}</p>
                          ) : (
                            <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontStyle: "italic" }}>
                              Sem descrição — consulte o Livro do Jogador.
                            </p>
                          )}

                          {/* Attack attribute selector */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.66rem", color: "var(--text-muted)", fontWeight: 700 }}>Atributo de ataque:</span>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {ABILITIES.map((k) => {
                                const isSelected = atkAttr === k;
                                return (
                                  <button
                                    key={k}
                                    onClick={() => setItemAtkAttr((prev) => ({ ...prev, [item.id]: k }))}
                                    style={{
                                      padding: "3px 8px", borderRadius: "var(--radius-xs)", fontSize: "0.6rem", fontWeight: 700,
                                      cursor: "pointer", fontFamily: "inherit",
                                      background: isSelected ? "var(--accent-dim)" : "var(--surface)",
                                      border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                                      color: isSelected ? "var(--accent-light)" : "var(--text-subtle)",
                                    }}
                                  >
                                    {ABILITY_SHORT[k]}
                                  </button>
                                );
                              })}
                            </div>
                            <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>
                              Bônus: {signed(atkBonus)}
                            </span>
                          </div>

                          {/* Quick action toggle */}
                          <button
                            onClick={() => {
                              const next = new Set(quickActionItemIds);
                              if (next.has(item.id)) next.delete(item.id);
                              else next.add(item.id);
                              setQuickActionItemIds(next);
                            }}
                            style={{
                              alignSelf: "flex-start", padding: "5px 12px", borderRadius: "var(--radius)",
                              fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                              background: isQuick ? "rgba(95,191,127,0.15)" : "var(--surface)",
                              border: `1px solid ${isQuick ? "#5fbf7f" : "var(--border)"}`,
                              color: isQuick ? "#5fbf7f" : "var(--text-muted)",
                              transition: "all 0.12s",
                            }}
                          >
                            {isQuick ? "⚡ Remover das ações rápidas" : "⚡ Adicionar às ações rápidas"}
                          </button>
                        </div>
                      )}
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

          {/* Grimório — magias por nível, expansível, abaixo do Descanso */}
          {isCaster && (
            <PlayCard>
              <SpellbookPanel
                characterId={characterId}
                classId={cls?.id ?? null}
                spells={spells}
                onSpellAdded={(spell) => setSpells([...spells, spell])}
              />
            </PlayCard>
          )}
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

// ── DieSvg ────────────────────────────────────────────────────────────────────

function DieSvg({ sides, size = 44, active = false, result }: {
  sides: number;
  size?: number;
  active?: boolean;
  result?: number | null;
}) {
  const strokeColor = active ? "var(--accent)" : "var(--border)";
  const fillColor   = active ? "var(--accent-dim)" : "var(--surface-2)";
  const labelColor  = active ? "var(--accent-light)" : "var(--text-muted)";

  const centerY = sides === 4 ? 65 : 56;
  const fontSize = result != null
    ? (result >= 100 ? 20 : result >= 10 ? 24 : 28)
    : (sides === 100 ? 16 : 18);
  const displayText = result != null ? String(result) : (sides === 100 ? "d%" : `d${sides}`);
  const textFill = result != null
    ? (result === sides ? "var(--accent-light)" : result === 1 && sides === 20 ? "#ff6b6b" : "var(--text)")
    : labelColor;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible" }}>
      {sides === 4  && <polygon points="50,8 92,87 8,87"                           fill={fillColor} stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 6  && <rect x="10" y="10" width="80" height="80" rx="12"          fill={fillColor} stroke={strokeColor} strokeWidth="3" />}
      {sides === 8  && <polygon points="50,5 95,50 50,95 5,50"                      fill={fillColor} stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 10 && <polygon points="50,5 93,40 76,90 24,90 7,40"               fill={fillColor} stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 12 && <polygon points="50,5 93,32 78,88 22,88 7,32"               fill={fillColor} stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 20 && <polygon points="50,5 93,27 93,73 50,95 7,73 7,27"          fill={fillColor} stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 100 && <circle cx="50" cy="50" r="44"                             fill={fillColor} stroke={strokeColor} strokeWidth="3" />}
      <text
        x="50" y={centerY}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="900"
        fill={textFill}
        fontFamily="var(--font-cinzel), serif"
        style={{ userSelect: "none" }}
      >
        {displayText}
      </text>
    </svg>
  );
}

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
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
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

function TraitGroup({ label, items, color = "var(--text-subtle)" }: { label: string; items: string[]; color?: string }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 12, paddingTop: 2, paddingBottom: 2 }}>
      <p style={{ fontSize: "0.64rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
            <span style={{ color, fontSize: "0.65rem", flexShrink: 0, marginTop: 3 }}>▸</span>
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
