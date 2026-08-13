"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import "../ordem-responsive.css";

import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { RollResultDie, type DiceFxRoll } from "@/components/three/DiceRollFx";
import {
  ATTR_KEYS, ATTR_ABBR, ATTR_LABEL, type AttrKey,
  SKILLS, SKILL_BY_ID, TRAIN_LABEL, type TrainDegree,
  CLASS_BY_ID, CLASSES, peLimit, nexLevel, patenteForPP, rollSkill, type RollResult,
  BASE_MOVEMENT, computeDefense, computeVitals, ATTR_MAX, NEX_VALUES, PATENTES,
} from "@/lib/ordem/data";
import { ORIGIN_BY_ID, ORIGINS } from "@/lib/ordem/origins";
import {
  WEAPON_BY_ID, DAMAGE_TYPE_LABEL, PROTECTION_BY_ID, GENERAL_BY_ID,
  WEAPONS, PROTECTIONS, GENERAL_ITEMS, GENERAL_GROUP_LABEL,
  armorDefenseBonus, loadStatus, OVERLOAD_DEFENSE_PENALTY, OVERLOAD_MOVE_PENALTY,
} from "@/lib/ordem/items";
import {
  normalizeItems, configuredCategory, weaponSpaceDelta, protectionSpaceDelta,
  accessorySpaceDelta, isAccessory, weaponEffectSummary, effectiveCrit,
  WEAPON_MOD_BY_ID, WEAPON_CURSE_BY_ID, PROTECTION_MOD_BY_ID, PROTECTION_CURSE_BY_ID,
  ACCESSORY_MOD_BY_ID, ACCESSORY_CURSE_BY_ID, CURSE_PRICE,
  type ConfiguredItem, type ModElement,
} from "@/lib/ordem/modifications";
import { sanityStatus, SANITY_STATUS_LABEL, lifeStatus, rollInsanity } from "@/lib/ordem/sanity";
import {
  getUnlockedAbilities, TRAILS_BY_CLASS, CLASS_POWERS_BY_CLASS, PARANORMAL_POWERS,
  TRAIL_BY_ID, CLASS_POWERS, PARANORMAL_POWER_BY_ID,
} from "@/lib/ordem/abilities";
import { normalizeProgression, nextNexValue, type OrdemProgression } from "@/lib/ordem/leveling";
import { LevelUpModal } from "./LevelUpModal";
import {
  RITUALS, RITUAL_COST, ELEMENT_LABEL_PT, ELEMENT_COLOR_UI, maxRitualCircle,
  type RitualCircle,
} from "@/lib/ordem/rituals";
import type { ClassId, Element } from "@/lib/ordem/data";

const ACCENT       = "#ffffff";
const ACCENT_LIGHT = "#ffffff";
const ACCENT_DIM   = "rgba(255,255,255,0.14)";
const ACCENT_BORD  = "rgba(255,255,255,0.32)";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyChar = any;

const DEGREES: TrainDegree[] = ["destreinado", "treinado", "veterano", "expert"];
const DEGREE_LETTER: Record<TrainDegree, string> = { destreinado: "D", treinado: "T", veterano: "V", expert: "E" };
const DEGREE_COLOR:  Record<TrainDegree, string> = { destreinado: "#6b7280", treinado: "#ffffff", veterano: "#c9941f", expert: "#5a9fd4" };

// Condições de combate / estado (Livro de Regras, Cap. 3). Marcadores sem
// efeito mecânico automático — apenas registram o estado atual do agente.
const ORDEM_CONDITIONS = [
  "Abalado", "Agarrado", "Apavorado", "Atordoado", "Caído", "Cego", "Confuso",
  "Debilitado", "Desprevenido", "Doente", "Em Chamas", "Enredado", "Envenenado",
  "Esmorecido", "Exausto", "Fascinado", "Fraco", "Frustrado", "Imóvel",
  "Inconsciente", "Indefeso", "Lento", "Ofuscado", "Paralisado", "Pasmo",
  "Petrificado", "Provocado", "Sangrando", "Sobrecarregado", "Surdo",
  "Surpreendido", "Vulnerável",
];
const ORDEM_CONDITION_COLOR: Record<string, string> = {
  "Inconsciente": "#1a0a2e", "Indefeso": "#6b0000", "Paralisado": "#8b0000",
  "Petrificado": "#607d8b", "Apavorado": "#4a1464", "Atordoado": "#c9941f",
  "Sangrando": "#a01818", "Em Chamas": "#d35400", "Envenenado": "#2d7d2d",
  "Caído": "#5d3a1a", "Surdo": "#546e7a", "Cego": "#4b5563", "Vulnerável": "#b5651d",
  "Confuso": "#7e57c2", "Doente": "#6d8c3a",
};

const SANITY_STATUS_COLOR: Record<ReturnType<typeof sanityStatus>, string> = {
  estavel: "#7dc864", perturbado: "#d88a2b", enlouquecendo: "#c0392b", insano: "#8b0000",
};

interface InsanityData { traumas: string[]; notes: string; }

function parse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

interface RollLog extends RollResult { id: number; label: string; }

type SheetMode = "ficha" | "jogar" | "editar";

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function SheetClient({ character }: { character: AnyChar }) {
  const sheet  = character.ordemSheet;
  const cls    = sheet.className ? CLASS_BY_ID[sheet.className as ClassId] : null;
  const origin = sheet.origin ? ORIGIN_BY_ID[sheet.origin] : null;

  const [mode, setMode] = useState<SheetMode>("ficha");
  const [showLevelUp, setShowLevelUp] = useState(false);

  // ── Estado editável ──────────────────────────────────────────────────────────
  const [pv,     setPv]     = useState({ cur: sheet.pvCurrent,  max: sheet.pvMax,  temp: sheet.pvTemp  });
  const [pe,     setPe]     = useState({ cur: sheet.peCurrent,  max: sheet.peMax,  temp: sheet.peTemp  });
  const [san,    setSan]    = useState({ cur: sheet.sanCurrent, max: sheet.sanMax, temp: sheet.sanTemp });
  const [skills] = useState<Record<string, TrainDegree>>(
    parse(sheet.skills, {} as Record<string, TrainDegree>)
  );
  const [notes, setNotes]   = useState<string>(sheet.notes ?? "");

  // ── Atributo-base escolhido por perícia (persistido em localStorage) ──────────
  const [skillAttr, setSkillAttr] = useState<Record<string, AttrKey>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(`ordem-skillattr-${character.id}`);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  function setSkillAttrFor(id: string, k: AttrKey) {
    setSkillAttr((prev) => {
      const sk = SKILL_BY_ID[id];
      const next = { ...prev };
      if (k === sk.attr) delete next[id]; else next[id] = k; // padrão não precisa ser salvo
      try { localStorage.setItem(`ordem-skillattr-${character.id}`, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }


  // ── Dados derivados (read-only) ───────────────────────────────────────────────
  const attrs = {
    agi: sheet.agi, for: sheet.forca, int: sheet.int, pre: sheet.pre, vig: sheet.vig,
  };
  const weapons      = normalizeItems(parse<unknown[]>(sheet.weapons, []));
  const background   = parse<{ appearance?: string; personality?: string; history?: string; objective?: string }>(sheet.background, {});
  const inventory    = parse<{ kind: string; id: string; mods?: string[]; curses?: string[] }[]>(sheet.inventory, []);
  const protections  = normalizeItems(inventory.filter((i) => i.kind === "protection"));
  const generals     = normalizeItems(inventory.filter((i) => i.kind === "general"));
  const protectionIds = protections.map((c) => c.id);
  const generalIds    = generals.map((c) => c.id);
  const armorBonus   = armorDefenseBonus(protectionIds);
  const bonusSpaces  = generals.reduce((a, c) => a + (GENERAL_BY_ID[c.id]?.capacityBonus ?? 0), 0);
  const usedSpaces   = [
    ...weapons.map((c) => Math.max(0, (WEAPON_BY_ID[c.id]?.spaces ?? 0) + weaponSpaceDelta(c.mods))),
    ...protections.map((c) => Math.max(0, (PROTECTION_BY_ID[c.id]?.spaces ?? 0) + protectionSpaceDelta(c.mods))),
    ...generals.map((c) => {
      const g = GENERAL_BY_ID[c.id];
      const delta = g && isAccessory(g) ? accessorySpaceDelta(c.mods) : 0;
      return Math.max(0, (g?.spaces ?? 0) + delta);
    }),
  ].reduce((a, b) => a + b, 0);
  const load             = loadStatus(usedSpaces, sheet.forca, bonusSpaces);
  const effectiveDefense = sheet.defense + armorBonus - (load.overloaded ? OVERLOAD_DEFENSE_PENALTY : 0);
  const effectiveMove    = sheet.movement - (load.overloaded ? OVERLOAD_MOVE_PENALTY : 0);
  const nex: number      = sheet.nex;
  const patente          = patenteForPP(sheet.prestige ?? 0);

  // ── Roll log ─────────────────────────────────────────────────────────────────
  const [log, setLog] = useState<RollLog[]>([]);
  const rollId        = useRef(0);

  // ── Autosave (debounced) ──────────────────────────────────────────────────────
  const [saved, setSaved]   = useState<"idle" | "saving" | "ok">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const save = useCallback((payload: Record<string, unknown>) => {
    setSaved("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch(`/api/ordem/characters/${character.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSaved("ok");
        setTimeout(() => setSaved("idle"), 1500);
      } catch { setSaved("idle"); }
    }, 600);
  }, [character.id]);

  function rollSkillRow(id: string) {
    const sk = SKILL_BY_ID[id];
    const degree = skills[id] ?? "destreinado";
    if (sk.trainedOnly && degree === "destreinado") return;
    const baseAttr = (skillAttr[id] ?? sk.attr) as AttrKey;
    const res = rollSkill(attrs[baseAttr], degree);
    const label = `${sk.name} (${TRAIN_LABEL[degree]})`;
    pushLog({ ...res, id: ++rollId.current, label });
  }

  function rollAttribute(k: AttrKey) {
    const res = rollSkill(attrs[k], "destreinado");
    pushLog({ ...res, id: ++rollId.current, label: ATTR_LABEL[k] });
  }

  function rollDamage(expr: string, label: string) {
    const part = expr.split("/")[0].trim();
    const m = part.match(/^(\d+)d(\d+)$/i);
    if (!m) return;
    const n = parseInt(m[1], 10), faces = parseInt(m[2], 10);
    const diceArr = Array.from({ length: n }, () => Math.floor(Math.random() * faces) + 1);
    const total = diceArr.reduce((a, b) => a + b, 0);
    pushLog({ dice: diceArr, chosen: total, bonus: 0, total, worstChosen: false, id: ++rollId.current, label: `Dano · ${label}` });
  }

  function pushLog(entry: RollLog) {
    setLog((l) => [entry, ...l].slice(0, 5));
  }

  const sanStatus = sanityStatus(san.cur, san.max);
  const lifeStat  = lifeStatus(pv.cur, pv.max);

  const sharedProps = { character, sheet, cls, origin, attrs, nex, patente, pv, pe, san, skills, skillAttr, notes, weapons, protections, generals, protectionIds, generalIds, load, armorBonus, effectiveDefense, effectiveMove, background, log, saved };

  return (
    <div style={{ minHeight: "100vh", background: "transparent", paddingBottom: 60 }}>
      <DashboardNav
        userName={character.user?.name ?? "Agente"}
        systemName="Ordem Paranormal"
        systemHref="/dashboard/ordem/jogador"
        backLabel="Meus Agentes"
        accentColor={ACCENT}
        // onExportPdf={() => window.print()} — export em PDF desativado do visual por ora
      />

      <div className="op-header-modes no-print" style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px 0", display: "flex", justifyContent: "flex-end", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: "0.74rem", color: saved === "ok" ? "#7dc864" : "var(--text-muted)", minWidth: 60, textAlign: "right", marginRight: 4 }}>
          {saved === "saving" ? "Salvando…" : saved === "ok" ? "✓ Salvo" : ""}
        </span>
        {(["ficha", "jogar", "editar"] as SheetMode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "6px 14px", borderRadius: "var(--radius-lg)",
            background: mode === m ? ACCENT_DIM : "var(--surface-2)",
            border: `1px solid ${mode === m ? ACCENT_BORD : "var(--border)"}`,
            color: mode === m ? ACCENT_LIGHT : "var(--text-muted)",
            fontWeight: mode === m ? 700 : 400, fontSize: "0.82rem", cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: mode === m ? `0 0 14px rgba(255,255,255,0.12)` : "none",
          }}>
            {m === "ficha" ? "Ficha" : m === "jogar" ? "Jogar" : "Editar"}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 24px 32px" }}>
        {/* Identity header (always visible) */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: "var(--radius-lg)", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", fontWeight: 700, color: ACCENT_LIGHT, flexShrink: 0, overflow: "hidden" }}>
            {character.portraitUrl
              ? <img src={character.portraitUrl} alt={character.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : character.name.split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join("")}
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>{character.name}</h1>
            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: 3 }}>
              {[cls?.name, origin?.name, patente.name, `NEX ${nex}%`].filter(Boolean).join(" · ")}
            </p>
          </div>
          {cls && nextNexValue(nex) != null && (
            <button onClick={() => setShowLevelUp(true)} style={{
              marginLeft: "auto", padding: "10px 18px", borderRadius: "var(--radius-lg)",
              background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT,
              fontWeight: 700, fontSize: "0.84rem", fontFamily: "inherit", cursor: "pointer",
              boxShadow: "0 0 16px rgba(255,255,255,0.12)", whiteSpace: "nowrap",
            }}>
              ⬆ Subir NEX → {nextNexValue(nex)}%
            </button>
          )}
        </div>

        {showLevelUp && <LevelUpModal character={character} onClose={() => setShowLevelUp(false)} />}

        {mode === "ficha" && (
          <ViewMode
            {...sharedProps}
            sanStatus={sanStatus}
            lifeStat={lifeStat}
          />
        )}
        {mode === "jogar" && (
          <PlayMode
            {...sharedProps}
            sanStatus={sanStatus}
            lifeStat={lifeStat}
            setPv={setPv}
            setPe={setPe}
            setSan={setSan}
            setNotes={setNotes}
            setSkillAttrFor={setSkillAttrFor}
            rollSkillRow={rollSkillRow}
            rollAttribute={rollAttribute}
            rollDamage={rollDamage}
            pushLog={pushLog}
            save={save}
          />
        )}
        {mode === "editar" && (
          <EditMode
            character={character}
            sheet={sheet}
            currentAttrs={attrs}
            onSaved={() => { setSaved("ok"); setTimeout(() => setSaved("idle"), 1500); }}
          />
        )}
      </main>

    </div>
  );
}

// ─── ORDEM DICE PANEL (rolagem livre, colunas direita do PlayMode) ───────────

const DICE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;
type DiceSides = typeof DICE_SIDES[number];

function OrdemDicePanel({ pushLog }: { pushLog: (entry: RollLog) => void }) {
  const rollId = useRef(0);
  const [selected, setSelected] = useState<DiceSides>(20);
  const [mod, setMod] = useState(0);
  const [lastRoll, setLastRoll] = useState<DiceFxRoll | null>(null);

  function doRoll() {
    const faces = selected === 100 ? 10 : selected;
    const die1 = Math.floor(Math.random() * faces) + 1;
    const die2 = selected === 100 ? Math.floor(Math.random() * 10) * 10 : null;
    const raw = die2 !== null ? die2 + die1 - 1 : die1;
    const total = Math.max(1, raw + mod);
    const label = `D${selected}${mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : ""}`;
    const id = ++rollId.current;
    pushLog({ dice: [raw], chosen: raw, bonus: mod, total, worstChosen: false, id, label });
    setLastRoll({ id, label, dice: selected === 100 ? 10 : selected, total });
  }

  const btnBase: React.CSSProperties = {
    padding: "5px 0", borderRadius: "var(--radius)", fontSize: "0.72rem", fontWeight: 700,
    cursor: "pointer", fontFamily: "var(--font-cinzel), serif", border: "1px solid",
    letterSpacing: "0.03em", textAlign: "center",
  };

  return (
    <Panel title="Rolagem de Dados">
      {/* Dice type selector */}
      <div className="op-dice-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 14 }}>
        {DICE_SIDES.map((d) => (
          <button key={d} onClick={() => setSelected(d)} style={{
            ...btnBase,
            background: selected === d ? "rgba(255,255,255,0.18)" : "var(--surface-2)",
            borderColor: selected === d ? "rgba(255,255,255,0.55)" : "var(--border)",
            color: selected === d ? "#ffffff" : "var(--text-muted)",
            boxShadow: selected === d ? "0 0 10px rgba(255,255,255,0.12)" : "none",
          }}>
            D{d === 100 ? "%" : d}
          </button>
        ))}
      </div>

      {/* 3D die inline */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <RollResultDie
          sides={selected === 100 ? 10 : selected}
          size={120}
          roll={lastRoll}
          color="#ffffff"
          edgeColor="#ffffff"
          emissive="#2a2a30"
          resultColor="#1a1a22"
          fallback={
            <div style={{ width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", color: "var(--text-subtle)", fontFamily: "var(--font-cinzel), serif" }}>
              D{selected === 100 ? "%" : selected}
            </div>
          }
        />
      </div>

      {/* Modifier row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", flexShrink: 0 }}>Mod</span>
        <button onClick={() => setMod((m) => m - 1)} style={{ width: 28, height: 28, borderRadius: "var(--radius-xs)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
        <span style={{ minWidth: 28, textAlign: "center", fontSize: "0.9rem", fontWeight: 700, color: mod !== 0 ? "#ffffff" : "var(--text-subtle)", fontFamily: "var(--font-cinzel), serif" }}>{mod >= 0 ? `+${mod}` : mod}</span>
        <button onClick={() => setMod((m) => m + 1)} style={{ width: 28, height: 28, borderRadius: "var(--radius-xs)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        <button onClick={() => setMod(0)} style={{ fontSize: "0.66rem", color: "var(--text-subtle)", background: "none", border: "none", cursor: "pointer", marginLeft: 2, padding: "2px 6px" }}>reset</button>
      </div>

      {/* Roll button */}
      <button onClick={doRoll} style={{
        width: "100%", padding: "11px 0", borderRadius: "var(--radius-lg)",
        background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.35)",
        color: "#ffffff", fontWeight: 700, fontSize: "0.88rem",
        fontFamily: "var(--font-cinzel), serif", cursor: "pointer", letterSpacing: "0.05em",
        boxShadow: "0 0 14px rgba(255,255,255,0.08)",
      }}>
        ROLAR 1D{selected === 100 ? "%" : selected}
      </button>
    </Panel>
  );
}

// ─── SHARED TYPES ──────────────────────────────────────────────────────────────

interface SharedProps {
  character: AnyChar;
  sheet: AnyChar;
  cls: AnyChar;
  origin: AnyChar;
  attrs: Record<AttrKey, number>;
  nex: number;
  patente: AnyChar;
  pv: { cur: number; max: number; temp: number };
  pe: { cur: number; max: number; temp: number };
  san: { cur: number; max: number; temp: number };
  skills: Record<string, TrainDegree>;
  skillAttr: Record<string, AttrKey>;
  notes: string;
  weapons: ConfiguredItem[];
  protections: ConfiguredItem[];
  generals: ConfiguredItem[];
  protectionIds: string[];
  generalIds: string[];
  load: ReturnType<typeof loadStatus>;
  armorBonus: number;
  effectiveDefense: number;
  effectiveMove: number;
  background: Record<string, string | undefined>;
  log: RollLog[];
  saved: string;
  sanStatus: ReturnType<typeof sanityStatus>;
  lifeStat: ReturnType<typeof lifeStatus>;
}

// ─── VIEW MODE ────────────────────────────────────────────────────────────────

function ViewMode({ sheet, cls, origin, attrs, nex, patente, pv, pe, san, skills, weapons, protections, generals, load, armorBonus, effectiveDefense, effectiveMove, background, sanStatus, lifeStat }: SharedProps) {
  const unlockedAbilities = cls ? getUnlockedAbilities(cls.id as ClassId, nex) : [];
  const classTrails = cls ? TRAILS_BY_CLASS[cls.id as ClassId] ?? [] : [];
  const maxCircle = maxRitualCircle(nex);
  const knownRitualIds = parse<string[]>(sheet.rituals, []);
  const knownRituals = RITUALS.filter((r) => knownRitualIds.includes(r.id));
  const [openElement, setOpenElement] = useState<Element | null>(null);

  const progression = normalizeProgression(parse<unknown>(sheet.abilities, null), sheet.trail);
  const chosenTrail = progression.trailId ? TRAIL_BY_ID[progression.trailId] : null;
  const chosenPowers = progression.classPowers
    .map((id) => CLASS_POWERS.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);
  const chosenParanormal = progression.paranormalPowers
    .map((id) => PARANORMAL_POWER_BY_ID[id])
    .filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Vitals (read-only) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <VitalView label="Pontos de Vida" color="#c03030" cur={pv.cur} temp={pv.temp} max={pv.max} note={lifeStat === "morrendo" ? "Morrendo!" : lifeStat === "machucado" ? "Machucado" : ""} warn={lifeStat === "morrendo"} />
        <VitalView label="Pontos de Esforço" color={ACCENT} cur={pe.cur} temp={pe.temp} max={pe.max} note={`Limite ${peLimit(nex)} PE/turno`} />
        <VitalView label="Sanidade" color="#c9941f" cur={san.cur} temp={san.temp} max={san.max} note={SANITY_STATUS_LABEL[sanStatus]} warn={sanStatus !== "estavel"} />
      </div>

      {/* Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Badge label="NEX" value={`${nex}% · nível ${nexLevel(nex)}`} />
        <Badge label="Defesa" value={armorBonus > 0 ? `${effectiveDefense} (+${armorBonus})` : effectiveDefense} warn={load.overloaded} />
        <Badge label="Deslocamento" value={`${effectiveMove}m`} warn={load.overloaded} />
        <Badge label="Carga" value={`${load.used}/${load.capacity} esp`} warn={load.overloaded} />
        <Badge label="Prestígio" value={sheet.prestige ?? 0} />
        <Badge label="Patente" value={patente.name} />
      </div>

      {/* Conditions & Insanity (read-only) */}
      {(parse<string[]>(sheet.conditions, []).length > 0 ||
        (parse<Partial<InsanityData>>(sheet.insanity, {}).traumas?.length ?? 0) > 0 ||
        sanStatus !== "estavel") && (
        <StatusPanel sheet={sheet} sanStatus={sanStatus} readOnly />
      )}

      <div className="op-two-col" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 24, alignItems: "start" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Attributes */}
          <Panel title="Atributos">
            <div className="op-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {ATTR_KEYS.map((k) => (
                <div key={k} style={{ textAlign: "center", padding: "12px 6px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                  <p style={{ fontSize: "0.6rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em" }}>{ATTR_ABBR[k]}</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: attrs[k] === 0 ? "var(--text-subtle)" : ACCENT_LIGHT, fontFamily: "var(--font-cinzel), serif" }}>{attrs[k]}</p>
                  <p style={{ fontSize: "0.58rem", color: "var(--text-subtle)", marginTop: 2 }}>{ATTR_LABEL[k]}</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Skills read-only */}
          <Panel title="Perícias">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, fontSize: "0.66rem", color: "var(--text-subtle)" }}>
              {DEGREES.map((d) => (
                <span key={d} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <DegreeDot degree={d} small /> {TRAIN_LABEL[d]}
                </span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 4 }}>
              {SKILLS.map((s) => {
                const degree = skills[s.id] ?? "destreinado";
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: "var(--radius)", background: degree !== "destreinado" ? ACCENT_DIM : "transparent" }}>
                    <DegreeDot degree={degree} />
                    <span style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: degree !== "destreinado" ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                    <span style={{ fontSize: "0.6rem", color: "var(--text-subtle)", flexShrink: 0 }}>{ATTR_ABBR[s.attr]}</span>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Class abilities */}
          {unlockedAbilities.length > 0 && (
            <Panel title={`Habilidades de Classe — ${cls?.name}`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {unlockedAbilities.map((a) => (
                  <div key={a.nex} style={{ display: "flex", gap: 10, padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    <span style={{ fontSize: "0.66rem", fontWeight: 700, color: ACCENT_LIGHT, whiteSpace: "nowrap", marginTop: 1 }}>{a.nex}%</span>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{a.description}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Origin power */}
          {origin && (
            <Panel title={`Poder de Origem · ${origin.powerName}`}>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{origin.powerDesc}</p>
            </Panel>
          )}

          {/* Trilha escolhida */}
          {chosenTrail ? (
            <Panel title={`Trilha · ${chosenTrail.name}`}>
              <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", marginBottom: 10 }}>{chosenTrail.description}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {chosenTrail.powers.map((p) => {
                  const unlocked = p.nex <= nex;
                  return (
                    <div key={p.nex} style={{ background: "var(--surface-2)", border: `1px solid ${unlocked ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius)", padding: "10px 12px", opacity: unlocked ? 1 : 0.5 }}>
                      <p style={{ fontSize: "0.78rem", fontWeight: 700, color: unlocked ? ACCENT_LIGHT : "var(--text-subtle)" }}>
                        {unlocked ? "" : "🔒 "}{p.name} <span style={{ fontWeight: 400, color: "var(--text-subtle)" }}>· NEX {p.nex}%</span>
                      </p>
                      <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", lineHeight: 1.5, marginTop: 2 }}>{p.description}</p>
                    </div>
                  );
                })}
              </div>
            </Panel>
          ) : classTrails.length > 0 && nex >= 10 ? (
            <Panel title="Trilha de Classe">
              <p style={{ fontSize: "0.78rem", color: "#e0843c", lineHeight: 1.5 }}>
                Nenhuma trilha escolhida. Use <strong>⬆ Subir NEX</strong> (ou Editar) para definir sua trilha — ela concede poderes em NEX 10%, 40%, 65% e 99%.
              </p>
            </Panel>
          ) : null}

          {/* Poderes de classe escolhidos */}
          {chosenPowers.length > 0 && (
            <Panel title={`Poderes de ${cls?.name}`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {chosenPowers.map((p) => (
                  <div key={p.id} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 12px" }}>
                    <p style={{ fontSize: "0.78rem", fontWeight: 700, color: ACCENT_LIGHT }}>{p.name}</p>
                    <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", lineHeight: 1.5, marginTop: 2 }}>{p.description}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Poderes paranormais */}
          {chosenParanormal.length > 0 && (
            <Panel title="Poderes Paranormais">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {chosenParanormal.map((p) => (
                  <div key={p.id} style={{ background: "var(--surface-2)", border: "1px solid rgba(155,127,212,0.3)", borderRadius: "var(--radius)", padding: "10px 12px" }}>
                    <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#b89cf0" }}>{p.name}</p>
                    <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", lineHeight: 1.5, marginTop: 2 }}>{p.description}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Rituals (Ocultista only) */}
          {sheet.className === "ocultista" && (
            <Panel title={`Rituais${maxCircle ? ` (até ${maxCircle}º círculo)` : ""}`}>
              {knownRituals.length === 0 ? (
                <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", fontStyle: "italic" }}>
                  Nenhum ritual registrado. Edite a ficha para adicionar rituais.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(["conhecimento", "energia", "morte", "sangue", "medo"] as Element[]).map((el) => {
                    const elRituals = knownRituals.filter((r) => r.element === el);
                    if (elRituals.length === 0) return null;
                    const isOpen = openElement === el;
                    return (
                      <div key={el}>
                        <button
                          onClick={() => setOpenElement(isOpen ? null : el)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "var(--surface-2)", border: `1px solid ${ELEMENT_COLOR_UI[el]}44`, borderRadius: "var(--radius)", padding: "8px 12px", cursor: "pointer", fontFamily: "inherit" }}
                        >
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: ELEMENT_COLOR_UI[el] }}>{ELEMENT_LABEL_PT[el]} ({elRituals.length})</span>
                          <span style={{ fontSize: "0.64rem", color: "var(--text-muted)" }}>{isOpen ? "▲" : "▼"}</span>
                        </button>
                        {isOpen && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                            {elRituals.map((r) => (
                              <div key={r.id} style={{ padding: "10px 12px", background: "var(--surface-2)", border: `1px solid ${ELEMENT_COLOR_UI[r.element]}33`, borderRadius: "var(--radius)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                                  <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>{r.name}</span>
                                  <span style={{ fontSize: "0.66rem", color: ELEMENT_COLOR_UI[r.element], fontWeight: 700 }}>{r.circle}º · {RITUAL_COST[r.circle as RitualCircle]} PE</span>
                                </div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                                  {[r.execution, r.range, r.duration].map((v, i) => (
                                    <span key={i} style={{ fontSize: "0.64rem", color: "var(--text-subtle)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "1px 7px" }}>{v}</span>
                                  ))}
                                  {r.resistance && <span style={{ fontSize: "0.64rem", color: "#c9941f", background: "rgba(201,148,31,0.1)", border: "1px solid rgba(201,148,31,0.3)", borderRadius: "var(--radius-xs)", padding: "1px 7px" }}>{r.resistance}</span>}
                                </div>
                                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.55 }}>{r.description}</p>
                                {r.upgrade && <p style={{ fontSize: "0.72rem", color: "#5a9fd4", lineHeight: 1.5, marginTop: 4 }}>⬆ {r.upgrade}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          {/* Identity */}
          {(background.appearance || background.personality || background.history || background.objective) && (
            <Panel title="Identidade">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {background.appearance  && <BgRow label="Aparência"    value={background.appearance} />}
                {background.personality && <BgRow label="Personalidade" value={background.personality} />}
                {background.history     && <BgRow label="História"      value={background.history} />}
                {background.objective   && <BgRow label="Objetivo"      value={background.objective} />}
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* Equipment full-width */}
      {(weapons.length > 0 || protections.length > 0 || generals.length > 0) && (
        <Panel title="Equipamento">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {weapons.map((c, i) => <WeaponCard key={`w${i}`} item={c} />)}
            {protections.map((c, i) => <ProtectionCard key={`p${i}`} item={c} />)}
            {generals.map((c, i) => <GeneralCard key={`g${i}`} item={c} />)}
          </div>
          <CursePricePanel weapons={weapons} protections={protections} generals={generals} />
        </Panel>
      )}
    </div>
  );
}

// ─── PLAY MODE ────────────────────────────────────────────────────────────────

interface PlayProps extends SharedProps {
  setPv: (v: { cur: number; max: number; temp: number }) => void;
  setPe: (v: { cur: number; max: number; temp: number }) => void;
  setSan: (v: { cur: number; max: number; temp: number }) => void;
  setNotes: (v: string) => void;
  setSkillAttrFor: (id: string, k: AttrKey) => void;
  rollSkillRow: (id: string) => void;
  rollAttribute: (k: AttrKey) => void;
  rollDamage: (expr: string, label: string) => void;
  pushLog: (entry: RollLog) => void;
  save: (payload: Record<string, unknown>) => void;
}

function PlayMode({ sheet, cls, origin, attrs, nex, patente, pv, pe, san, skills, skillAttr, notes, weapons, protections, generals, load, armorBonus, effectiveDefense, effectiveMove, background, log, sanStatus, lifeStat, setPv, setPe, setSan, setNotes, setSkillAttrFor, rollSkillRow, rollAttribute, rollDamage, pushLog, save }: PlayProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Vitals editable */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <VitalCard label="Pontos de Vida" color="#c03030" data={pv} setData={(d) => { setPv(d); save({ pvCurrent: d.cur, pvMax: d.max, pvTemp: d.temp }); }} note={lifeStat === "morrendo" ? "Morrendo!" : lifeStat === "machucado" ? "Machucado" : ""} noteWarn={lifeStat === "morrendo"} />
        <VitalCard label="Pontos de Esforço" color={ACCENT} data={pe} setData={(d) => { setPe(d); save({ peCurrent: d.cur, peMax: d.max, peTemp: d.temp }); }} note={`Limite ${peLimit(nex)} PE/turno`} />
        <VitalCard label="Sanidade" color="#c9941f" data={san} setData={(d) => { setSan(d); save({ sanCurrent: d.cur, sanMax: d.max, sanTemp: d.temp }); }} note={SANITY_STATUS_LABEL[sanStatus]} noteWarn={sanStatus !== "estavel"} />
      </div>

      {/* Derived badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Badge label="NEX" value={`${nex}% · nível ${nexLevel(nex)}`} />
        <Badge label="Defesa" value={armorBonus > 0 ? `${effectiveDefense} (+${armorBonus})` : effectiveDefense} warn={load.overloaded} />
        <Badge label="Deslocamento" value={`${effectiveMove}m`} warn={load.overloaded} />
        <Badge label="Carga" value={`${load.used}/${load.capacity} esp`} warn={load.overloaded} />
        <Badge label="Prestígio" value={sheet.prestige ?? 0} />
      </div>

      <div className="op-two-col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Attributes — clickable */}
          <Panel title="Atributos">
            <div className="op-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {ATTR_KEYS.map((k) => (
                <button key={k} onClick={() => rollAttribute(k)} title={`Rolar ${ATTR_LABEL[k]}`}
                  style={{ textAlign: "center", padding: "12px 6px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", transition: "border-color 0.15s" }}>
                  <p style={{ fontSize: "0.6rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em" }}>{ATTR_ABBR[k]}</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: attrs[k] === 0 ? "var(--text-subtle)" : ACCENT_LIGHT, fontFamily: "var(--font-cinzel), serif" }}>{attrs[k]}</p>
                </button>
              ))}
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 10 }}>Toque em um atributo para rolar.</p>
          </Panel>

          {/* Skills — clickable degree + roll */}
          <Panel title="Perícias">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, fontSize: "0.68rem", color: "var(--text-subtle)" }}>
              {DEGREES.map((d) => (
                <span key={d} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <DegreeDot degree={d} small /> {TRAIN_LABEL[d]}
                </span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 5 }}>
              {SKILLS.map((s) => {
                const degree = skills[s.id] ?? "destreinado";
                const canRoll = !(s.trainedOnly && degree === "destreinado");
                const chosenAttr = (skillAttr[s.id] ?? s.attr) as AttrKey;
                const isDefault = chosenAttr === s.attr;
                const cycleAttr = () => {
                  const i = ATTR_KEYS.indexOf(chosenAttr);
                  setSkillAttrFor(s.id, ATTR_KEYS[(i + 1) % ATTR_KEYS.length]);
                };
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 8px", borderRadius: "var(--radius)", background: degree !== "destreinado" ? ACCENT_DIM : "transparent" }}>
                    <DegreeDot degree={degree} />
                    <button onClick={() => rollSkillRow(s.id)} disabled={!canRoll}
                      style={{ flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", cursor: canRoll ? "pointer" : "default", color: canRoll ? "var(--text)" : "var(--text-subtle)", fontSize: "0.82rem", fontWeight: degree !== "destreinado" ? 600 : 400, padding: 0, display: "flex", alignItems: "baseline", gap: 5, overflow: "hidden" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                      {s.trainedOnly && <span title="Só pode usar se treinada" style={{ fontSize: "0.56rem", color: "#c9941f", flexShrink: 0 }}>•T</span>}
                    </button>
                    <button
                      onClick={cycleAttr}
                      title={isDefault ? `Atributo-base padrão (${ATTR_LABEL[chosenAttr]}). Clique para mudar.` : `Atributo-base: ${ATTR_LABEL[chosenAttr]} (padrão: ${ATTR_LABEL[s.attr]}). Clique para mudar.`}
                      style={{
                        flexShrink: 0, padding: "2px 7px", borderRadius: "var(--radius-xs)",
                        background: isDefault ? "rgba(201,148,31,0.12)" : ACCENT_DIM,
                        border: `1px solid ${isDefault ? "rgba(201,148,31,0.45)" : ACCENT_BORD}`,
                        color: isDefault ? "#c9941f" : ACCENT_LIGHT,
                        fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.04em", cursor: "pointer", fontFamily: "inherit",
                      }}>
                      {ATTR_ABBR[chosenAttr]}
                    </button>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginTop: 10 }}>
              <span style={{ color: "#c9941f", fontWeight: 700 }}>Dourado</span> = atributo-base padrão. Toque na sigla para escolher outro atributo para o teste.
            </p>
          </Panel>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Free dice roller */}
          <OrdemDicePanel pushLog={pushLog} />

          {/* Roll log */}
          <Panel title="Histórico de Rolagens">
            {log.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>Role um atributo, perícia ou dano para ver aqui.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {log.map((r) => (
                  <div key={r.id} style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{r.label}</span>
                      <span style={{ fontSize: "1.2rem", fontWeight: 800, color: ACCENT_LIGHT, fontFamily: "var(--font-cinzel), serif" }}>{r.total}</span>
                    </div>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginTop: 2 }}>
                      [{r.dice.join(", ")}]{r.worstChosen ? " pior" : r.dice.length > 1 ? " maior" : ""} {r.bonus ? `+ ${r.bonus}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Power */}
          {origin && (
            <Panel title={`Poder · ${origin.powerName}`}>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{origin.powerDesc}</p>
            </Panel>
          )}

          {/* Identity */}
          {(background.appearance || background.personality || background.history || background.objective) && (
            <Panel title="Identidade">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {background.appearance  && <BgRow label="Aparência"    value={background.appearance} />}
                {background.personality && <BgRow label="Personalidade" value={background.personality} />}
                {background.history     && <BgRow label="História"      value={background.history} />}
                {background.objective   && <BgRow label="Objetivo"      value={background.objective} />}
              </div>
            </Panel>
          )}

          {/* Conditions & Insanity */}
          <StatusPanel sheet={sheet} save={save} sanStatus={sanStatus} />

          {/* Notes */}
          <Panel title="Anotações">
            <textarea value={notes} onChange={(e) => { setNotes(e.target.value); save({ notes: e.target.value }); }} rows={5} placeholder="Notas da sessão, pistas, contatos…"
              style={{ width: "100%", padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", fontFamily: "inherit", resize: "vertical" }} />
          </Panel>
        </div>
      </div>

      {/* Rituais conhecidos — Ocultista only */}
      {sheet.className === "ocultista" && <RituaisPanel sheet={sheet} nex={nex} pe={pe} rollDamage={rollDamage} />}

      {/* Equipment full-width with roll buttons */}
      {(weapons.length > 0 || protections.length > 0 || generals.length > 0) && (
        <Panel title="Equipamento">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {weapons.map((c, i) => <WeaponCard key={`w${i}`} item={c} onRollDamage={rollDamage} />)}
            {protections.map((c, i) => <ProtectionCard key={`p${i}`} item={c} />)}
            {generals.map((c, i) => <GeneralCard key={`g${i}`} item={c} />)}
          </div>
          <CursePricePanel weapons={weapons} protections={protections} generals={generals} />
        </Panel>
      )}
    </div>
  );
}

// ─── EQUIPMENT CARDS (com modificações/maldições) ─────────────────────────────

const ELEM_UI_COLOR: Record<string, string> = {
  Sangue: "#e0524c", Morte: "#9aa0a8", Conhecimento: "#f5c451", Energia: "#9b7ce0", Medo: "#7dd3a8",
};
const ROMAN_SHEET = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function ModTags({ mods, curses, modMap, curseMap }: {
  mods: string[]; curses: string[];
  modMap: Record<string, { name: string }>;
  curseMap: Record<string, { name: string; element: string }>;
}) {
  if (mods.length === 0 && curses.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
      {mods.map((id) => modMap[id] && (
        <span key={id} style={{ fontSize: "0.58rem", fontWeight: 700, padding: "1px 6px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "var(--text-muted)" }}>
          {modMap[id].name}
        </span>
      ))}
      {curses.map((id) => curseMap[id] && (
        <span key={id} title={curseMap[id].element} style={{ fontSize: "0.58rem", fontWeight: 700, padding: "1px 6px", borderRadius: "var(--radius-full)", background: "rgba(0,0,0,0.25)", border: `1px solid ${ELEM_UI_COLOR[curseMap[id].element] ?? "#fff"}`, color: ELEM_UI_COLOR[curseMap[id].element] ?? "#fff" }}>
          ⛧ {curseMap[id].name}
        </span>
      ))}
    </div>
  );
}

function CatBadge({ base, eff }: { base: number; eff: number }) {
  if (eff === base) return null;
  return (
    <span style={{ fontSize: "0.58rem", fontWeight: 800, padding: "1px 6px", borderRadius: "var(--radius-full)", background: "rgba(224,132,60,0.18)", border: "1px solid rgba(224,132,60,0.5)", color: "#e0843c", whiteSpace: "nowrap" }}>
      Cat {ROMAN_SHEET[eff] ?? eff}
    </span>
  );
}

function WeaponCard({ item, onRollDamage }: { item: ConfiguredItem; onRollDamage?: (expr: string, label: string) => void }) {
  const w = WEAPON_BY_ID[item.id]; if (!w) return null;
  const eff = weaponEffectSummary(w, item.mods, item.curses);
  const cat = configuredCategory(w.category, item);
  const crit = effectiveCrit(w.crit, eff.threatBonus, eff.critMultBonus);
  const dmgExtra = eff.extraDamage.length ? ` ${eff.extraDamage.join(" ")}` : "";
  const dmgBonus = eff.damageBonus ? ` +${eff.damageBonus}` : "";
  const atk = eff.attackBonus ? ` · atq +${eff.attackBonus}` : "";
  return (
    <div style={{ padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{w.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <CatBadge base={w.category} eff={cat} />
          {onRollDamage && (
            <button onClick={() => onRollDamage(w.damage, w.name)}
              style={{ padding: "5px 11px", fontSize: "0.72rem", fontWeight: 700, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: ACCENT_LIGHT, cursor: "pointer", whiteSpace: "nowrap" }}>
              Dano
            </button>
          )}
        </div>
      </div>
      <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>
        {w.damage}{dmgBonus}{dmgExtra} · {DAMAGE_TYPE_LABEL[w.type]} · crít {crit}{w.range ? ` · ${w.range}` : ""}{atk}
      </p>
      <ModTags mods={item.mods} curses={item.curses} modMap={WEAPON_MOD_BY_ID} curseMap={WEAPON_CURSE_BY_ID} />
      {eff.notes.length > 0 && (
        <ul style={{ margin: "4px 0 0", paddingLeft: 16, listStyle: "disc" }}>
          {eff.notes.map((n, i) => <li key={i} style={{ fontSize: "0.62rem", color: "var(--text-subtle)", lineHeight: 1.4 }}>{n}</li>)}
        </ul>
      )}
    </div>
  );
}

function ProtectionCard({ item }: { item: ConfiguredItem }) {
  const p = PROTECTION_BY_ID[item.id]; if (!p) return null;
  const cat = configuredCategory(p.category, item);
  const defBonus = item.mods.includes("reforcada") ? 2 : 0;
  return (
    <div style={{ padding: "12px 14px", background: "var(--surface-2)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>🛡 {p.name}</p>
        <CatBadge base={p.category} eff={cat} />
      </div>
      <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginTop: 2 }}>Defesa +{p.defense + defBonus}{p.note ? ` · ${p.note}` : ""}</p>
      <ModTags mods={item.mods} curses={item.curses} modMap={PROTECTION_MOD_BY_ID} curseMap={PROTECTION_CURSE_BY_ID} />
    </div>
  );
}

function GeneralCard({ item }: { item: ConfiguredItem }) {
  const g = GENERAL_BY_ID[item.id]; if (!g) return null;
  const acc = isAccessory(g);
  const cat = configuredCategory(g.category, item);
  return (
    <div style={{ padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{g.name}</p>
        <CatBadge base={g.category} eff={cat} />
      </div>
      <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginTop: 2, lineHeight: 1.4 }}>{g.desc}</p>
      {acc && <ModTags mods={item.mods} curses={item.curses} modMap={ACCESSORY_MOD_BY_ID} curseMap={ACCESSORY_CURSE_BY_ID} />}
    </div>
  );
}

// Preço da maldição: lista os elementos presentes nos itens amaldiçoados.
function CursePricePanel({ weapons, protections, generals }: { weapons: ConfiguredItem[]; protections: ConfiguredItem[]; generals: ConfiguredItem[] }) {
  const elements = new Set<ModElement>();
  for (const c of weapons) for (const id of c.curses) { const x = WEAPON_CURSE_BY_ID[id]; if (x) elements.add(x.element); }
  for (const c of protections) for (const id of c.curses) { const x = PROTECTION_CURSE_BY_ID[id]; if (x) elements.add(x.element); }
  for (const c of generals) for (const id of c.curses) { const x = ACCESSORY_CURSE_BY_ID[id]; if (x) elements.add(x.element); }
  if (elements.size === 0) return null;
  return (
    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(160,24,24,0.08)", border: "1px solid rgba(224,80,76,0.35)", borderRadius: "var(--radius-lg)" }}>
      <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#e0524c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>⛧ Preço da Maldição</p>
      <ul style={{ margin: 0, paddingLeft: 16, listStyle: "disc" }}>
        {[...elements].map((el) => (
          <li key={el} style={{ fontSize: "0.68rem", color: "var(--text-muted)", lineHeight: 1.45 }}>{CURSE_PRICE[el]}</li>
        ))}
      </ul>
    </div>
  );
}

// ─── RITUAIS PANEL (PlayMode, Ocultista) ──────────────────────────────────────

function RituaisPanel({ sheet, nex, pe }: { sheet: AnyChar; nex: number; pe: { cur: number; max: number; temp: number }; rollDamage: (expr: string, label: string) => void }) {
  const knownRitualIds = parse<string[]>(sheet.rituals, []);
  const knownRituals   = RITUALS.filter((r) => knownRitualIds.includes(r.id));
  const [openEl, setOpenEl]       = useState<Element | null>(null);
  const [openRitual, setOpenRitual] = useState<string | null>(null);
  const maxCircle = maxRitualCircle(nex);

  if (knownRituals.length === 0) return null;

  const byElement = (["conhecimento", "energia", "morte", "sangue", "medo"] as Element[])
    .map((el) => ({ el, rituals: knownRituals.filter((r) => r.element === el) }))
    .filter((g) => g.rituals.length > 0);

  return (
    <Panel title={`Rituais Conhecidos${maxCircle ? ` · até ${maxCircle}º círculo` : ""}`}>
      <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginBottom: 12 }}>
        PE disponível: <strong style={{ color: ACCENT_LIGHT }}>{pe.cur}</strong>/{pe.max}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {byElement.map(({ el, rituals }) => {
          const isElOpen = openEl === el;
          return (
            <div key={el}>
              <button
                onClick={() => setOpenEl(isElOpen ? null : el)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: isElOpen ? `${ELEMENT_COLOR_UI[el]}18` : "var(--surface-2)", border: `1px solid ${ELEMENT_COLOR_UI[el]}${isElOpen ? "55" : "30"}`, borderRadius: "var(--radius)", padding: "8px 12px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              >
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: ELEMENT_COLOR_UI[el] }}>{ELEMENT_LABEL_PT[el]} ({rituals.length})</span>
                <span style={{ fontSize: "0.64rem", color: "var(--text-muted)" }}>{isElOpen ? "▲" : "▼"}</span>
              </button>

              {isElOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6, paddingLeft: 4 }}>
                  {rituals.map((r) => {
                    const cost = RITUAL_COST[r.circle as RitualCircle];
                    const canAfford = pe.cur >= cost;
                    const isOpen = openRitual === r.id;
                    return (
                      <div key={r.id} style={{ background: "var(--surface-2)", border: `1px solid ${isOpen ? ELEMENT_COLOR_UI[r.element] + "44" : "var(--border)"}`, borderRadius: "var(--radius)", overflow: "hidden" }}>
                        <button
                          onClick={() => setOpenRitual(isOpen ? null : r.id)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "9px 12px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                        >
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                            <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                            <span style={{ fontSize: "0.64rem", color: "var(--text-subtle)", whiteSpace: "nowrap" }}>{r.circle}º círculo</span>
                          </div>
                          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: canAfford ? ELEMENT_COLOR_UI[r.element] : "#c03030", flexShrink: 0, marginLeft: 8 }}>{cost} PE</span>
                        </button>

                        {isOpen && (
                          <div style={{ padding: "0 12px 12px", borderTop: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, marginBottom: 8 }}>
                              {[r.execution, r.range, r.duration].map((v, i) => (
                                <span key={i} style={{ fontSize: "0.64rem", color: "var(--text-subtle)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "1px 7px" }}>{v}</span>
                              ))}
                              {r.target && <span style={{ fontSize: "0.64rem", color: "var(--text-subtle)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "1px 7px" }}>Alvo: {r.target}</span>}
                              {r.resistance && <span style={{ fontSize: "0.64rem", color: "#c9941f", background: "rgba(201,148,31,0.1)", border: "1px solid rgba(201,148,31,0.3)", borderRadius: "var(--radius-xs)", padding: "1px 7px" }}>{r.resistance}</span>}
                            </div>
                            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{r.description}</p>
                            {r.upgrade && (
                              <p style={{ fontSize: "0.72rem", color: "#5a9fd4", lineHeight: 1.5, marginTop: 6 }}>
                                ⬆ {r.upgrade}
                              </p>
                            )}
                            {!canAfford && (
                              <p style={{ fontSize: "0.7rem", color: "#c03030", fontWeight: 700, marginTop: 6 }}>PE insuficiente ({pe.cur}/{cost})</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ─── EDIT MODE ────────────────────────────────────────────────────────────────

interface EditModeProps {
  character: AnyChar;
  sheet: AnyChar;
  currentAttrs: Record<AttrKey, number>;
  onSaved: () => void;
}

const ELEMENTS_ALL: Element[] = ["conhecimento", "energia", "morte", "sangue", "medo"];

function EditMode({ character, sheet, onSaved }: EditModeProps) {
  // ── Identidade ────────────────────────────────────────────────────────────
  const [name,        setName]        = useState<string>(character.name);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(character.portraitUrl ?? null);
  const [origin,      setOrigin]      = useState<string>(sheet.origin ?? "");
  const [className,   setClassName]   = useState<string>(sheet.className ?? "");
  const [trail,       setTrail]       = useState<string>(sheet.trail ?? "");
  const [patente,     setPatente]     = useState<string>(sheet.patente ?? "recruta");
  const [affinity,    setAffinity]    = useState<string>(sheet.affinity ?? "");

  const bg0 = parse<Record<string, string>>(sheet.background, {});
  const [appearance,  setAppearance]  = useState<string>(bg0.appearance ?? "");
  const [personality, setPersonality] = useState<string>(bg0.personality ?? "");
  const [history,     setHistory]     = useState<string>(bg0.history ?? "");
  const [objective,   setObjective]   = useState<string>(bg0.objective ?? "");

  // ── Atributos ─────────────────────────────────────────────────────────────
  const [attrs, setAttrs] = useState<Record<AttrKey, number>>({
    agi: sheet.agi, for: sheet.forca, int: sheet.int, pre: sheet.pre, vig: sheet.vig,
  });

  // ── Vitais / combate / progressão ─────────────────────────────────────────
  const [pv,  setPv]  = useState({ cur: sheet.pvCurrent,  max: sheet.pvMax,  temp: sheet.pvTemp  ?? 0 });
  const [pe,  setPe]  = useState({ cur: sheet.peCurrent,  max: sheet.peMax,  temp: sheet.peTemp  ?? 0 });
  const [san, setSan] = useState({ cur: sheet.sanCurrent, max: sheet.sanMax, temp: sheet.sanTemp ?? 0 });
  const [defense,  setDefense]  = useState<number>(sheet.defense ?? computeDefense(sheet.agi));
  const [movement, setMovement] = useState<number>(sheet.movement ?? BASE_MOVEMENT);
  const [prestige, setPrestige] = useState<number>(sheet.prestige ?? 0);
  const [nex,      setNex]      = useState<number>(sheet.nex ?? 5);

  // ── Perícias ──────────────────────────────────────────────────────────────
  const [skills, setSkills] = useState<Record<string, TrainDegree>>(
    parse<Record<string, TrainDegree>>(sheet.skills, {}),
  );

  // ── Poderes (progressão) ──────────────────────────────────────────────────
  const prog0 = normalizeProgression(parse<unknown>(sheet.abilities, null), sheet.trail);
  const [classPowers,      setClassPowers]      = useState<string[]>(prog0.classPowers);
  const [paranormalPowers, setParanormalPowers] = useState<string[]>(prog0.paranormalPowers);

  // ── Itens (preservam modificações/maldições; edição de mods no criador) ─────
  const inv0 = parse<{ kind: string; id: string; mods?: string[]; curses?: string[] }[]>(sheet.inventory, []);
  const [weapons,     setWeapons]     = useState<ConfiguredItem[]>(normalizeItems(parse<unknown[]>(sheet.weapons, [])));
  const [protections, setProtections] = useState<ConfiguredItem[]>(normalizeItems(inv0.filter((i) => i.kind === "protection")));
  const [generalItems, setGeneralItems] = useState<ConfiguredItem[]>(normalizeItems(inv0.filter((i) => i.kind === "general")));

  // ── Rituais ───────────────────────────────────────────────────────────────
  const [selectedRituals, setSelectedRituals] = useState<string[]>(parse<string[]>(sheet.rituals, []));
  const [ritualSearch, setRitualSearch] = useState("");
  const [ritualElement, setRitualElement] = useState<Element | "all">("all");

  const [saving, setSaving] = useState(false);
  const [saved,  setSavedLocal] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const classTrails = className ? TRAILS_BY_CLASS[className as ClassId] ?? [] : [];
  const classPowerList = className ? CLASS_POWERS_BY_CLASS[className as ClassId] ?? [] : [];
  const maxCircle = maxRitualCircle(nex) ?? 1;

  const filteredRituals = RITUALS.filter((r) => {
    if (ritualElement !== "all" && r.element !== ritualElement) return false;
    if (ritualSearch && !r.name.toLowerCase().includes(ritualSearch.toLowerCase())) return false;
    return true;
  });

  const toggle = (arr: string[], set: (v: string[]) => void, id: string) =>
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  // Toggle preservando modificações/maldições já aplicadas ao item.
  const toggleItem = (arr: ConfiguredItem[], set: (v: ConfiguredItem[]) => void, id: string) =>
    set(arr.some((c) => c.id === id) ? arr.filter((c) => c.id !== id) : [...arr, { id, mods: [], curses: [] }]);

  function setAttr(k: AttrKey, v: number) {
    setAttrs((p) => ({ ...p, [k]: Math.max(0, Math.min(ATTR_MAX, v)) }));
  }

  function recalcVitals() {
    if (!className) return;
    const v = computeVitals(className as ClassId, nex, attrs.vig, attrs.pre, origin || undefined);
    setPv((p) => ({ ...p, max: v.pvMax, cur: v.pvMax }));
    setPe((p) => ({ ...p, max: v.peMax, cur: v.peMax }));
    setSan((p) => ({ ...p, max: v.sanMax, cur: v.sanMax }));
    setDefense(computeDefense(attrs.agi));
  }

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Imagem muito grande (máx. 2 MB)."); return; }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPortraitUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const progression: OrdemProgression = {
      trailId: trail || null, classPowers, paranormalPowers, features: prog0.features,
    };
    const inventory = [
      ...protections.map((c) => ({ kind: "protection", id: c.id, mods: c.mods, curses: c.curses })),
      ...generalItems.map((c) => ({ kind: "general", id: c.id, mods: c.mods, curses: c.curses })),
    ];
    try {
      const res = await fetch(`/api/ordem/characters/${character.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, portraitUrl,
          origin: sheet.origin ?? null, className: sheet.className ?? null, trail: sheet.trail ?? null,
          patente, affinity: affinity || null,
          agi: attrs.agi, forca: attrs.for, int: attrs.int, pre: attrs.pre, vig: attrs.vig,
          pvCurrent: pv.cur, pvMax: pv.max, pvTemp: pv.temp,
          peCurrent: pe.cur, peMax: pe.max, peTemp: pe.temp,
          sanCurrent: san.cur, sanMax: san.max, sanTemp: san.temp,
          defense, movement, prestige, nex: sheet.nex,
          skills, abilities: progression,
          rituals: selectedRituals, weapons, inventory,
          background: { appearance, personality, history, objective },
        }),
      });
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? "Erro ao salvar."); }
      setSavedLocal(true);
      onSaved();
      setTimeout(() => setSavedLocal(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: `${ACCENT_DIM}`, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
        <p style={{ fontSize: "0.78rem", color: ACCENT_LIGHT, fontWeight: 700, marginBottom: 2 }}>⚙️ Modo de Edição completo</p>
        <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Edite tudo: identidade, foto, atributos, vitais, perícias, poderes, rituais e itens. Modo sandbox — sem validação de regras.
        </p>
      </div>

      {/* Identidade + foto */}
      <EditSection label="Identidade">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            <div style={{ width: 96, height: 96, borderRadius: "var(--radius-lg)", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-subtle)", fontSize: "0.7rem" }}>
              {portraitUrl ? <img src={portraitUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "Sem foto"}
            </div>
            <label style={{ ...smallActionBtn, cursor: "pointer" }}>
              📷 Enviar
              <input type="file" accept="image/*" onChange={onPickPhoto} style={{ display: "none" }} />
            </label>
            {portraitUrl && <button onClick={() => setPortraitUrl(null)} style={{ ...smallActionBtn, color: "#ff8080" }}>Remover</button>}
          </div>
          <div style={{ flex: 1, minWidth: 240, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            <EditText label="Nome" value={name} onChange={setName} />
            <EditSelect label="Origem" value={origin} onChange={setOrigin} options={[{ v: "", t: "— Nenhuma —" }, ...ORIGINS.map((o) => ({ v: o.id, t: o.name }))]} />
            <EditSelect label="Classe" value={className} onChange={(v) => { setClassName(v); setTrail(""); }} options={[{ v: "", t: "— Nenhuma —" }, ...CLASSES.map((c) => ({ v: c.id, t: c.name }))]} />
            <EditSelect label="Trilha" value={trail} onChange={setTrail} options={[{ v: "", t: "— Sem trilha —" }, ...classTrails.map((t) => ({ v: t.id, t: t.name }))]} />
            <EditSelect label="Patente" value={patente} onChange={setPatente} options={PATENTES.map((p) => ({ v: p.id, t: p.name }))} />
            <EditSelect label="Afinidade" value={affinity} onChange={setAffinity} options={[{ v: "", t: "— Nenhuma —" }, ...ELEMENTS_ALL.map((e) => ({ v: e, t: ELEMENT_LABEL_PT[e] }))]} />
          </div>
        </div>
      </EditSection>

      {/* Conceito */}
      <EditSection label="Conceito">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
          <EditArea label="Aparência"    value={appearance}  onChange={setAppearance} />
          <EditArea label="Personalidade" value={personality} onChange={setPersonality} />
          <EditArea label="História"     value={history}     onChange={setHistory} />
          <EditArea label="Objetivo"     value={objective}   onChange={setObjective} />
        </div>
      </EditSection>

      {/* Atributos */}
      <EditSection label="Atributos (0–5)">
        <div className="op-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {ATTR_KEYS.map((k) => (
            <div key={k}>
              <p style={editLabelStyle}>{ATTR_ABBR[k]} · {ATTR_LABEL[k]}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => setAttr(k, attrs[k] - 1)} style={smallBtn}>−</button>
                <input type="number" value={attrs[k]} onChange={(e) => setAttr(k, parseInt(e.target.value) || 0)}
                  style={{ ...editInputStyle, textAlign: "center", padding: "8px 4px", fontWeight: 700 }} />
                <button onClick={() => setAttr(k, attrs[k] + 1)} style={smallBtn}>+</button>
              </div>
            </div>
          ))}
        </div>
      </EditSection>

      {/* Vitais */}
      <EditSection label="Vitais">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          <EditNumber label="PV Atual"   value={pv.cur}   onChange={(v) => setPv({ ...pv,  cur: v })} />
          <EditNumber label="PV Máximo"  value={pv.max}   onChange={(v) => setPv({ ...pv,  max: v })} />
          <EditNumber label="PV Temp."   value={pv.temp}  onChange={(v) => setPv({ ...pv,  temp: v })} min={0} />
          <EditNumber label="PE Atual"   value={pe.cur}   onChange={(v) => setPe({ ...pe,  cur: v })} />
          <EditNumber label="PE Máximo"  value={pe.max}   onChange={(v) => setPe({ ...pe,  max: v })} />
          <EditNumber label="PE Temp."   value={pe.temp}  onChange={(v) => setPe({ ...pe,  temp: v })} min={0} />
          <EditNumber label="SAN Atual"  value={san.cur}  onChange={(v) => setSan({ ...san, cur: v })} />
          <EditNumber label="SAN Máximo" value={san.max}  onChange={(v) => setSan({ ...san, max: v })} />
          <EditNumber label="SAN Temp."  value={san.temp} onChange={(v) => setSan({ ...san, temp: v })} min={0} />
        </div>
        <button onClick={recalcVitals} disabled={!className} style={{ ...smallActionBtn, marginTop: 4, opacity: className ? 1 : 0.4 }}>
          ↻ Recalcular vitais e defesa pelos atributos/NEX
        </button>
      </EditSection>

      {/* Combate & Progressão */}
      <EditSection label="Combate & Progressão">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          <EditNumber label="Defesa"        value={defense}  onChange={setDefense} />
          <EditNumber label="Deslocamento"  value={movement} onChange={setMovement} />
          <EditNumber label="Prestígio (PP)" value={prestige} onChange={setPrestige} min={0} />
          <EditSelect label="NEX (%)" value={String(nex)} onChange={(v) => setNex(parseInt(v))} options={NEX_VALUES.map((n) => ({ v: String(n), t: `${n}% · nível ${nexLevel(n)}` }))} />
        </div>
      </EditSection>

      {/* Perícias */}
      <EditSection label="Perícias (clique para alternar grau)">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, fontSize: "0.66rem", color: "var(--text-subtle)" }}>
          {DEGREES.map((d) => (<span key={d} style={{ display: "flex", alignItems: "center", gap: 5 }}><DegreeDot degree={d} small /> {TRAIN_LABEL[d]}</span>))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 5 }}>
          {SKILLS.map((s) => {
            const degree = skills[s.id] ?? "destreinado";
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 8px", borderRadius: "var(--radius)", background: degree !== "destreinado" ? ACCENT_DIM : "transparent" }}>
                <DegreeDot degree={degree} onClick={() => {
                  const next = DEGREES[(DEGREES.indexOf(degree) + 1) % DEGREES.length];
                  const u = { ...skills }; if (next === "destreinado") delete u[s.id]; else u[s.id] = next; setSkills(u);
                }} />
                <span style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: degree !== "destreinado" ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                <span style={{ fontSize: "0.6rem", color: "var(--text-subtle)", marginLeft: "auto" }}>{ATTR_ABBR[s.attr]}</span>
              </div>
            );
          })}
        </div>
      </EditSection>

      {/* Poderes de classe */}
      {classPowerList.length > 0 && (
        <EditSection label={`Poderes de Classe (${classPowers.length})`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8, maxHeight: 340, overflowY: "auto" }}>
            {classPowerList.map((p) => {
              const on = classPowers.includes(p.id);
              return (
                <button key={p.id} onClick={() => toggle(classPowers, setClassPowers, p.id)}
                  style={{ textAlign: "left", padding: "10px 12px", background: on ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${on ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 700, color: on ? ACCENT_LIGHT : "var(--text)" }}>{p.name}</p>
                  {p.prerequisite && <p style={{ fontSize: "0.62rem", color: "#c9941f", marginTop: 2 }}>Pré-req: {p.prerequisite}</p>}
                  <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", lineHeight: 1.45, marginTop: 3 }}>{p.description}</p>
                </button>
              );
            })}
          </div>
        </EditSection>
      )}

      {/* Poderes paranormais */}
      <EditSection label={`Poderes Paranormais (${paranormalPowers.length})`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, maxHeight: 300, overflowY: "auto" }}>
          {PARANORMAL_POWERS.map((p) => {
            const on = paranormalPowers.includes(p.id);
            return (
              <button key={p.id} onClick={() => toggle(paranormalPowers, setParanormalPowers, p.id)}
                style={{ textAlign: "left", padding: "10px 12px", background: on ? "rgba(155,127,212,0.18)" : "var(--surface-2)", border: `1px solid ${on ? "rgba(155,127,212,0.5)" : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: on ? "#b89cf0" : "var(--text)" }}>{p.name}</p>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#b89cf0", marginTop: 2 }}>{p.element}{p.prerequisite ? ` · req. ${p.prerequisite}` : ""}</p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", lineHeight: 1.45, marginTop: 3 }}>{p.description}</p>
                <p style={{ fontSize: "0.66rem", color: "var(--text-muted)", lineHeight: 1.4, marginTop: 3 }}><strong style={{ color: "#9b7fd4" }}>Afinidade:</strong> {p.affinity}</p>
              </button>
            );
          })}
        </div>
      </EditSection>

      {/* Itens */}
      <EditSection label={`Armas (${weapons.length})`}>
        <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginBottom: 8 }}>Modificações/maldições são preservadas; aplique-as no criador de agente.</p>
        <PickerGrid items={WEAPONS.map((w) => ({ id: w.id, name: w.name, sub: `${w.damage} · ${DAMAGE_TYPE_LABEL[w.type]} · crít ${w.crit}${w.range ? ` · ${w.range}` : ""}` }))} selected={weapons.map((c) => c.id)} onToggle={(id) => toggleItem(weapons, setWeapons, id)} search />
      </EditSection>
      <EditSection label={`Proteções (${protections.length})`}>
        <PickerGrid items={PROTECTIONS.map((p) => ({ id: p.id, name: p.name, sub: `Defesa +${p.defense}${p.note ? ` · ${p.note}` : ""}` }))} selected={protections.map((c) => c.id)} onToggle={(id) => toggleItem(protections, setProtections, id)} />
      </EditSection>
      <EditSection label={`Equipamento Geral (${generalItems.length})`}>
        <PickerGrid items={GENERAL_ITEMS.map((g) => ({ id: g.id, name: g.name, sub: `${GENERAL_GROUP_LABEL[g.group]} · ${g.desc}` }))} selected={generalItems.map((c) => c.id)} onToggle={(id) => toggleItem(generalItems, setGeneralItems, id)} search />
      </EditSection>

      {/* Rituais */}
      <EditSection label={`Rituais Conhecidos (${selectedRituals.length})`}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <input value={ritualSearch} onChange={(e) => setRitualSearch(e.target.value)} placeholder="Buscar ritual…"
            style={{ flex: 1, minWidth: 160, padding: "7px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", fontFamily: "inherit" }} />
          <select value={ritualElement} onChange={(e) => setRitualElement(e.target.value as Element | "all")}
            style={{ padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.82rem", fontFamily: "inherit", cursor: "pointer" }}>
            <option value="all">Todos os elementos</option>
            {ELEMENTS_ALL.map((el) => (<option key={el} value={el}>{ELEMENT_LABEL_PT[el]}</option>))}
          </select>
        </div>
        <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginBottom: 8 }}>NEX {nex}% → até {maxCircle}º círculo (não restringe a edição).</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8, maxHeight: 400, overflowY: "auto" }}>
          {filteredRituals.map((r) => {
            const selected = selectedRituals.includes(r.id);
            return (
              <button key={r.id} onClick={() => toggle(selectedRituals, setSelectedRituals, r.id)}
                style={{ textAlign: "left", padding: "10px 12px", background: selected ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${selected ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: 600, color: selected ? ACCENT_LIGHT : "var(--text)" }}>{r.name}</span>
                  <span style={{ fontSize: "0.62rem", color: ELEMENT_COLOR_UI[r.element], fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>{r.circle}º · {RITUAL_COST[r.circle as RitualCircle]} PE</span>
                </div>
                <span style={{ fontSize: "0.64rem", color: "var(--text-subtle)" }}>{ELEMENT_LABEL_PT[r.element]} · {r.execution} · {r.duration}</span>
              </button>
            );
          })}
        </div>
      </EditSection>

      {/* Save bar */}
      <div style={{ position: "sticky", bottom: 0, display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", boxShadow: "0 -4px 24px rgba(0,0,0,0.25)" }}>
        <button onClick={save} disabled={saving}
          style={{ padding: "10px 24px", borderRadius: "var(--radius-lg)", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT, fontWeight: 700, fontSize: "0.9rem", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 0 16px rgba(255,255,255,0.1)", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Salvando…" : "💾 Salvar alterações"}
        </button>
        {saved  && <span style={{ fontSize: "0.82rem", color: "#5fbf7f", fontWeight: 700 }}>✓ Salvo</span>}
        {error  && <span style={{ fontSize: "0.82rem", color: "#ff6b6b" }}>{error}</span>}
      </div>
    </div>
  );
}

// Picker reutilizável (itens) com busca opcional
function PickerGrid({ items, selected, onToggle, search }: { items: { id: string; name: string; sub: string }[]; selected: string[]; onToggle: (id: string) => void; search?: boolean }) {
  const [q, setQ] = useState("");
  const list = search && q ? items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())) : items;
  return (
    <>
      {search && (
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…"
          style={{ width: "100%", marginBottom: 10, padding: "7px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", fontFamily: "inherit", boxSizing: "border-box" }} />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, maxHeight: 320, overflowY: "auto" }}>
        {list.map((i) => {
          const on = selected.includes(i.id);
          return (
            <button key={i.id} onClick={() => onToggle(i.id)}
              style={{ textAlign: "left", padding: "10px 12px", background: on ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${on ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: on ? ACCENT_LIGHT : "var(--text)" }}>{i.name}</p>
              <p style={{ fontSize: "0.66rem", color: "var(--text-subtle)", marginTop: 2, lineHeight: 1.4 }}>{i.sub}</p>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function VitalView({ label, color, cur, max, temp = 0, note, warn }: { label: string; color: string; cur: number; max: number; temp?: number; note?: string; warn?: boolean }) {
  const pct = Math.max(0, Math.min(100, (cur / Math.max(1, max)) * 100));
  return (
    <div style={{ padding: "16px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
        {note && <span style={{ fontSize: "0.7rem", fontWeight: 700, color: warn ? "#e0843c" : "var(--text-subtle)" }}>{note}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: "1.6rem", fontWeight: 800, color, fontFamily: "var(--font-cinzel), serif" }}>{cur + temp}</span>
        {temp > 0 && <span style={{ fontSize: "0.74rem", fontWeight: 700, color: ACCENT_LIGHT }}>(+{temp})</span>}
        <span style={{ fontSize: "0.9rem", color: "var(--text-subtle)" }}> / {max}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "var(--surface-2)", overflow: "hidden", marginTop: 10 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

function VitalCard({ label, color, data, setData, note, noteWarn }: { label: string; color: string; data: { cur: number; max: number; temp: number }; setData: (d: { cur: number; max: number; temp: number }) => void; note?: string; noteWarn?: boolean }) {
  const pct = Math.max(0, Math.min(100, (data.cur / Math.max(1, data.max)) * 100));
  return (
    <div style={{ padding: "16px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
        {note && <span style={{ fontSize: "0.7rem", fontWeight: 700, color: noteWarn ? "#e0843c" : "var(--text-subtle)" }}>{note}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* − desconta primeiro os pontos temporários */}
        <button onClick={() => data.temp > 0 ? setData({ ...data, temp: data.temp - 1 }) : setData({ ...data, cur: data.cur - 1 })} style={vBtn}>−</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontSize: "1.6rem", fontWeight: 800, color, fontFamily: "var(--font-cinzel), serif" }}>{data.cur + data.temp}</span>
          {data.temp > 0 && <span style={{ fontSize: "0.72rem", fontWeight: 700, color: ACCENT_LIGHT }}> (+{data.temp})</span>}
          <span style={{ fontSize: "0.9rem", color: "var(--text-subtle)" }}> / </span>
          <input value={data.max} onChange={(e) => { const v = parseInt(e.target.value, 10); setData({ ...data, max: Number.isFinite(v) ? v : 0 }); }}
            style={{ width: 38, background: "none", border: "none", color: "var(--text-muted)", fontSize: "1rem", fontWeight: 700, textAlign: "center" }} />
        </div>
        <button onClick={() => setData({ ...data, cur: data.cur + 1 })} style={vBtn}>+</button>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "var(--surface-2)", overflow: "hidden", marginTop: 10 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.3s" }} />
      </div>
      {/* Pontos temporários — botões no mesmo estilo, levemente diferentes (quadrados tracejados) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
        <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "var(--text-subtle)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Temp.</span>
        <button onClick={() => setData({ ...data, temp: Math.max(0, data.temp - 1) })} style={vBtnTemp}>−</button>
        <span style={{ minWidth: 24, textAlign: "center", fontSize: "1rem", fontWeight: 800, color: data.temp > 0 ? ACCENT_LIGHT : "var(--text-subtle)", fontFamily: "var(--font-cinzel), serif" }}>{data.temp}</span>
        <button onClick={() => setData({ ...data, temp: data.temp + 1 })} style={vBtnTemp}>+</button>
      </div>
    </div>
  );
}

const vBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: "50%",
  background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--text)", fontSize: "1.1rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};

const vBtnTemp: React.CSSProperties = {
  width: 26, height: 26, borderRadius: "var(--radius-xs)",
  background: ACCENT_DIM, border: `1px dashed ${ACCENT_BORD}`,
  color: ACCENT_LIGHT, fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};

function DegreeDot({ degree, onClick, small }: { degree: TrainDegree; onClick?: () => void; small?: boolean }) {
  const color = DEGREE_COLOR[degree];
  const size = small ? 18 : 26;
  const style: React.CSSProperties = {
    width: size, height: size, flexShrink: 0, borderRadius: "50%",
    background: degree === "destreinado" ? "transparent" : `${color}22`,
    border: `1.5px solid ${color}`, color,
    fontSize: small ? "0.58rem" : "0.74rem", fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-cinzel), serif",
  };
  if (!onClick) return <span style={style}>{DEGREE_LETTER[degree]}</span>;
  return <button onClick={onClick} title={TRAIN_LABEL[degree]} style={{ ...style, cursor: "pointer" }}>{DEGREE_LETTER[degree]}</button>;
}

// ─── CONDIÇÕES & INSANIDADE ──────────────────────────────────────────────────
function StatusPanel({
  sheet, save, sanStatus, readOnly,
}: {
  sheet: AnyChar;
  save?: (payload: Record<string, unknown>) => void;
  sanStatus: ReturnType<typeof sanityStatus>;
  readOnly?: boolean;
}) {
  const [conditions, setConditions] = useState<string[]>(() => parse<string[]>(sheet.conditions, []));
  const [insanity, setInsanity] = useState<InsanityData>(() => {
    const raw = parse<Partial<InsanityData>>(sheet.insanity, {});
    return { traumas: Array.isArray(raw.traumas) ? raw.traumas : [], notes: raw.notes ?? "" };
  });
  const [showPicker, setShowPicker] = useState(false);

  const persistCond = (v: string[]) => { setConditions(v); save?.({ conditions: v }); };
  const persistIns  = (v: InsanityData) => { setInsanity(v); save?.({ insanity: v }); };

  const addTrauma = (text: string) => {
    const t = text.trim();
    if (!t || insanity.traumas.includes(t)) return;
    persistIns({ ...insanity, traumas: [...insanity.traumas, t] });
  };

  const statusColor = SANITY_STATUS_COLOR[sanStatus];

  return (
    <Panel title="Condições & Insanidade">
      {/* Estado de Sanidade */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontWeight: 700 }}>Estado mental:</span>
        <span style={{ fontSize: "0.78rem", fontWeight: 800, padding: "3px 12px", borderRadius: "var(--radius-lg)", background: `${statusColor}22`, border: `1px solid ${statusColor}`, color: statusColor }}>
          {SANITY_STATUS_LABEL[sanStatus]}
        </span>
      </div>

      {/* Condições */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Condições</p>
        {!readOnly && (
          <button onClick={() => setShowPicker((v) => !v)} style={{ fontSize: "0.72rem", color: ACCENT_LIGHT, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>+ Adicionar</button>
        )}
      </div>
      {showPicker && !readOnly && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10, maxHeight: 150, overflowY: "auto" }}>
          {ORDEM_CONDITIONS.filter((c) => !conditions.includes(c)).map((c) => (
            <button key={c} onClick={() => { persistCond([...conditions, c]); setShowPicker(false); }}
              style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "var(--radius-xs)", background: `${ORDEM_CONDITION_COLOR[c] ?? "#555"}22`, border: `1px solid ${ORDEM_CONDITION_COLOR[c] ?? "#555"}`, color: "var(--text)", cursor: "pointer", fontFamily: "inherit" }}>
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
            <span key={c}
              onClick={readOnly ? undefined : () => persistCond(conditions.filter((x) => x !== c))}
              title={readOnly ? c : "Clique para remover"}
              style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "var(--radius-xs)", cursor: readOnly ? "default" : "pointer", background: `${ORDEM_CONDITION_COLOR[c] ?? "#555"}22`, border: `1px solid ${ORDEM_CONDITION_COLOR[c] ?? "#555"}`, color: "var(--text)", userSelect: "none" }}>
              {c}{readOnly ? "" : " ✕"}
            </span>
          ))}
        </div>
      )}

      {/* Insanidade / Traumas */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0 8px" }}>
        <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Efeitos de Insanidade</p>
        {!readOnly && (
          <button onClick={() => addTrauma(rollInsanity().effect)} style={{ fontSize: "0.72rem", color: ACCENT_LIGHT, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>🎲 Rolar (1d20)</button>
        )}
      </div>
      {insanity.traumas.length === 0 ? (
        <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Nenhum efeito de insanidade registrado.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {insanity.traumas.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
              <span style={{ flex: 1, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.45 }}>{t}</span>
              {!readOnly && (
                <button onClick={() => persistIns({ ...insanity, traumas: insanity.traumas.filter((_, j) => j !== i) })}
                  style={{ flexShrink: 0, background: "none", border: "none", color: "var(--text-subtle)", cursor: "pointer", fontSize: "0.8rem" }} title="Remover">✕</button>
              )}
            </div>
          ))}
        </div>
      )}
      {!readOnly && (
        <textarea
          value={insanity.notes}
          onChange={(e) => persistIns({ ...insanity, notes: e.target.value })}
          rows={2}
          placeholder="Transtornos, gatilhos, manias persistentes…"
          style={{ width: "100%", marginTop: 10, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.8rem", fontFamily: "inherit", resize: "vertical" }}
        />
      )}
      {readOnly && insanity.notes && (
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{insanity.notes}</p>
      )}
    </Panel>
  );
}

function Badge({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div style={{ padding: "8px 16px", background: "var(--surface)", border: `1px solid ${warn ? "rgba(224,132,60,0.5)" : "var(--border)"}`, borderRadius: "var(--radius-lg)" }}>
      <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
      <p style={{ fontSize: "0.95rem", fontWeight: 700, color: warn ? "#e0843c" : "var(--text)", marginTop: 2 }}>{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${ACCENT}22` }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function BgRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: ACCENT_LIGHT, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{value}</p>
    </div>
  );
}

function EditSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      {children}
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
const smallBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: "var(--radius)", background: "var(--surface-2)",
  border: "1px solid var(--border)", color: "var(--text)", fontSize: "1rem",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const smallActionBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
  padding: "7px 12px", borderRadius: "var(--radius)", background: "var(--surface-2)",
  border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.74rem",
  fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
};

function EditSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; t: string }[] }) {
  const locked = label === "Origem" || label === "Classe" || label === "Trilha" || label === "NEX (%)";
  return (
    <div>
      <p style={editLabelStyle}>{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={locked}
        title={locked ? "Este campo fica travado para preservar a progressao da ficha." : undefined}
        style={{
          ...editInputStyle,
          cursor: locked ? "not-allowed" : "pointer",
          opacity: locked ? 0.68 : 1,
          borderColor: locked ? ACCENT_BORD : "var(--border)",
        }}
      >
        {options.map((o) => (<option key={o.v} value={o.v}>{o.t}</option>))}
      </select>
      {locked && <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", marginTop: 4 }}>Campo travado na ediÃ§Ã£o.</p>}
    </div>
  );
}

function EditArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p style={editLabelStyle}>{label}</p>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
        style={{ ...editInputStyle, resize: "vertical" }} />
    </div>
  );
}

function EditNumber({ label, value, onChange, min }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  const clamp = (v: number) => (min != null ? Math.max(min, v) : v);
  return (
    <div>
      <p style={editLabelStyle}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={() => onChange(clamp(value - 1))} style={smallBtn}>−</button>
        <input type="number" value={value} onChange={(e) => onChange(clamp(parseInt(e.target.value) || 0))}
          style={{ ...editInputStyle, textAlign: "center", padding: "8px 4px", fontWeight: 700 }} />
        <button onClick={() => onChange(clamp(value + 1))} style={smallBtn}>+</button>
      </div>
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
