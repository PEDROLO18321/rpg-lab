"use client";

// ─── D&D 5e — Modo Jogar ─────────────────────────────────────────────────────
// Mesa do jogador: rolagens, PV, espaços de magia, inventário, moedas e
// descanso. Saiu de SheetClient.tsx, que passava de 2.900 linhas com os três
// modos no mesmo arquivo.

import React, { useState, useRef } from "react";
import { useEscapeKey } from "@/lib/useEscapeKey";
import { ABILITY_LABELS } from "@/lib/dnd/races";
import { CLASSES } from "@/lib/dnd/classes";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import { ALL_PHB_ITEMS, PICKER_GROUPS, WEAPONS, type PickerGroup } from "@/lib/dnd/items";
import { proficiencyBonus } from "@/lib/dnd/leveling";
import { activateOnKey } from "@/lib/a11y";
import type { AbilityKey } from "@/lib/dnd/races";
import type { SpellcastingConfig } from "@/lib/dnd/spellcasting";
import { SpellbookPanel } from "@/components/dashboard/SpellbookPanel";
import { RollToast } from "@/components/three/DiceRollFx";
import { PlayShell, PlayVitals, PlayChips, PlayAlert } from "@/components/play/PlayShell";
import { PlayCard, playLabelStyle as labelStyle } from "@/components/play/PlayCard";
import { VitalBar } from "@/components/play/VitalBar";
import { StatChip } from "@/components/play/StatChip";
import { RollHistory } from "@/components/play/RollHistory";
import { DicePanel, type DiceResult } from "@/components/play/DicePanel";
import { ActiveConditionChips } from "@/components/play/ConditionPicker";
import { PLAY_THEME } from "@/components/play/theme";
import type { PlayRollEntry } from "@/components/play/types";
import { rollDie } from "@/components/dice/DieSvg";
import { ABILITIES, ABILITY_SHORT, CONDITIONS, CONDITION_COLOR, CP_VALUE, CURRENCY_COLOR, CURRENCY_LABEL, DiceType, RollEntry, SKILL_MAP, SheetRow, SlotState, mod, signed, smallBtn } from "./sheetShared";

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

export function PlayMode({
  characterId, sheet, scores, cls, proficientSkills, expertiseSkills,
  isCaster, spellConfig, maxSlots,
  spells, setSpells, spellAbility, setSpellAbility,
  hpCurrent, setHpCurrent, hpTemp, setHpTemp,
  hitDiceUsed, setHitDiceUsed, dsSuccess, setDsSuccess, dsFailure, setDsFailure,
  inspiration, setInspiration, conditions, setConditions,
  slotsUsed, setSlotsUsed,
  gp, setGp, cp, setCp, sp, setSp, ep, setEp, pp, setPp,
  equipment, setEquipment, patchSheet,
}: PlayProps) {
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
      spellSlotsUsed: {},
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
  useEscapeKey(showItemPicker, () => setShowItemPicker(false));
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
  /** Rolagens disparadas pela ficha: perícias, ataques, saves e dano. */
  function doRoll(label: string, die: DiceType, count: number, bonus: number) {
    const rolls = Array.from({ length: count }, () => rollDie(die));
    const total = rolls.reduce((a, b) => a + b, 0) + bonus;
    const entry: RollEntry = {
      id: ++rollId.current, label, dice: die, count, modifier: bonus, rolls, total,
      isCrit: die === 20 && rolls[0] === 20,
      isFumble: die === 20 && rolls[0] === 1,
    };
    setRollHistory((prev) => [entry, ...prev].slice(0, 5));
    return entry;
  }

  function quickRoll(label: string, bonus: number) {
    setFxRoll(doRoll(label, 20, 1, bonus));
  }

  function rollWeaponDamage(name: string, damage: string, dmgMod: number) {
    const [countStr, sidesStr] = damage.split("d");
    if (!sidesStr) {
      // flat damage (e.g. "1")
      const total = parseInt(damage) + dmgMod;
      const entry: RollEntry = { id: ++rollId.current, label: `${name} — Dano`, dice: parseInt(damage), count: 1, modifier: dmgMod, rolls: [parseInt(damage)], total };
        setRollHistory((prev) => [entry, ...prev].slice(0, 12));
      return;
    }
    const dieCount = parseInt(countStr) || 1;
    const dieSides = parseInt(sidesStr) as DiceType;
    setFxRoll(doRoll(`${name} — Dano`, dieSides, dieCount, dmgMod));
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
    const entry = doRoll("Resistência à Morte", 20, 1, 0);
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
    setSlotsUsed(newSlots); patchSheet({ spellSlotsUsed: newSlots });
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
    patchSheet({ spellSlotsUsed: newState });
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

  const historico: PlayRollEntry[] = rollHistory.map((r) => ({
    id: r.id,
    label: r.label,
    total: r.total,
    detail: `[${(r.allRolls ?? r.rolls).join(", ")}]${r.advantageMode ? (r.advantageMode === "advantage" ? " vantagem" : " desvantagem") : r.pickMode === "max" ? " maior" : ""}${r.modifier !== 0 ? ` ${signed(r.modifier)}` : ""}`,
    tone: r.isCrit ? ("crit" as const) : r.isFumble ? ("fumble" as const) : undefined,
    badge: r.isCrit ? "CRÍTICO" : r.isFumble ? "FALHA" : undefined,
  }));

  /** Resultado do painel compartilhado, no mesmo log das demais rolagens. */
  function handleDiceRoll(r: DiceResult) {
    const entry: RollEntry = {
      id: ++rollId.current, label: r.label, dice: r.sides, count: r.rolls.length,
      modifier: r.mod, rolls: r.rolls, total: r.total,
      isCrit: r.sides === 20 && r.kept === 20,
      isFumble: r.sides === 20 && r.kept === 1,
      ...(r.allRolls ? { allRolls: r.allRolls, advantageMode: r.advantageMode, advantagePickIdx: r.advantagePickIdx } : {}),
    };
    setRollHistory((prev) => [entry, ...prev].slice(0, 5));
    setFxRoll(entry);
  }

  return (
    <>
      <PlayShell
        system="dnd"
        band={
          <>
            <PlayVitals>
              <VitalBar
                label="Pontos de Vida" color={hpColor} cur={hpCurrent} max={sheet.hpMax} temp={hpTemp} bigStep={5}
                onDelta={(d) => (d < 0 ? applyDamage(-d) : applyHeal(d))}
                onTemp={(t) => { setHpTemp(t); patchSheet({ hpTemp: t }); }}
                note={isDying ? "Inconsciente" : undefined}
                warn={isDying}
              />
            </PlayVitals>

            <PlayChips>
              <StatChip label="CA" value={sheet.armorClass} />
              <StatChip label="Init" value={signed(sheet.initiative)} />
              <StatChip label="Vel" value={`${sheet.speed}m`} />
              <StatChip
                label="Inspiração" value={inspiration ? "Sim" : "Não"}
                onClick={() => { const v = !inspiration; setInspiration(v); patchSheet({ inspiration: v }); }}
                title="Alternar inspiração"
              />
              {confirmRestore ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Restaurar tudo?</span>
                  <button onClick={restoreSheet} style={{ padding: "5px 12px", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: "rgba(95,191,127,0.25)", border: "1px solid #5fbf7f", color: "#5fbf7f" }}>Sim</button>
                  <button onClick={() => setConfirmRestore(false)} style={{ padding: "5px 12px", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>Não</button>
                </span>
              ) : (
                <button onClick={() => setConfirmRestore(true)} title="Restaura PV, dados de vida e espaços de magia ao máximo"
                  style={{ padding: "7px 14px", borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  ✨ Restaurar Ficha
                </button>
              )}
            </PlayChips>

            {isDying && (
              <PlayAlert title="💀 Inconsciente — Resistências à Morte">
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
                  <button onClick={rollDeathSave}
                    style={{ padding: "6px 16px", borderRadius: "var(--radius)", background: "rgba(139,0,0,0.3)", border: "1px solid #8b0000", color: "#ff6b6b", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
                    🎲 Rolar Resistência
                  </button>
                  {dsSuccess >= 3 && <span style={{ fontSize: "0.8rem", color: "#4fc3f7", fontWeight: 700 }}>✦ Estabilizado!</span>}
                  {dsFailure >= 3 && <span style={{ fontSize: "0.8rem", color: "#ff4444", fontWeight: 700 }}>💀 Morto!</span>}
                </div>
              </PlayAlert>
            )}

            <ActiveConditionChips
              all={CONDITIONS.map((c) => ({ id: c, name: c, desc: "Clique para remover" }))}
              active={conditions}
              onRemove={(c) => { const v = conditions.filter((x) => x !== c); setConditions(v); patchSheet({ conditions: v }); }}
            />
          </>
        }
        left={
          <>
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
                            role="button"
                            tabIndex={0}
                            aria-expanded={isExpanded}
                            onKeyDown={activateOnKey(() => setExpandedItemId(isExpanded ? null : item.id))}
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
          </>
        }
        right={
          <>
            <PlayCard title="Rolagem de Dados" accent>
              <DicePanel
                theme={PLAY_THEME.dnd}
                features={{ qty: true, pickMode: true, advantage: true }}
                onRoll={handleDiceRoll}
              />
            </PlayCard>

            <PlayCard title="Histórico">
              <RollHistory log={historico} onClear={() => setRollHistory([])} />
            </PlayCard>

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
                        setConditions(v); patchSheet({ conditions: v });
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
                      role="button"
                      tabIndex={0}
                      aria-label={`Remover condição ${c}`}
                      onKeyDown={activateOnKey(() => { const v = conditions.filter((x) => x !== c); setConditions(v); patchSheet({ conditions: v }); })}
                      onClick={() => { const v = conditions.filter((x) => x !== c); setConditions(v); patchSheet({ conditions: v }); }}
                      style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "var(--radius-xs)", cursor: "pointer", background: `${CONDITION_COLOR[c] ?? "#555"}22`, border: `1px solid ${CONDITION_COLOR[c] ?? "#555"}`, color: "var(--text)", userSelect: "none" }}
                      title="Clique para remover"
                    >
                      {c} ✕
                    </span>
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

            {/* Currency */}
            <PlayCard>
              <p style={labelStyle}>Moedas</p>

              {/* Currency display */}
              <div className="dnd-currency-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginBottom: 10 }}>
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
          </>
        }
      />

      <RollToast roll={fxRoll} />

      {/* Item Picker Modal */}
      {showItemPicker && (
        <div role="presentation"
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
    </>
  );
}

// ── Subcomponentes do modo Jogar ──────────────────────────────────────────────

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
