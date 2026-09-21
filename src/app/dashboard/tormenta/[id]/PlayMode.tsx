"use client";

// ─── TORMENTA 20 — Modo Jogar ────────────────────────────────────────────────
// Mesa do jogador: rolagens, PV/PM, condições, magias por PM, descanso e
// inventário. Mesma estrutura do modo Jogar de D&D, com os valores e as regras
// do T20 (ver src/lib/tormenta/play.ts para a parte calculável).

import { useRef, useState } from "react";
import { ATTR_KEYS, ATTR_LABEL, ATTR_ABBR, attrMod, SKILLS, skillModifier, type AttrKey } from "@/lib/tormenta/data";
import { WEAPONS, WEAPON_BY_ID, ARMORS, GEAR, type Weapon } from "@/lib/tormenta/items";
import { SPELLS } from "@/lib/tormenta/spells";
import { CONDITIONS, CONDITION_BY_ID, CATEGORY_COLOR, ALQUEBRADO_ID } from "@/lib/tormenta/conditions";
import type { ChosenPower } from "@/lib/tormenta/leveling";
import {
  parseCritical, parseDamageDice, criticalDamageDice, attackSkillId, isRanged,
  damageUsesStrength, restRecovery, REST_LABEL, type RestQuality,
  deathThreshold, spendFromPool, recoverToMax, spellPmCost, STABILIZE_DC,
} from "@/lib/tormenta/play";
import { RollResultDie, RollToast } from "@/components/three/DiceRollFx";
import { useEscapeKey } from "@/lib/useEscapeKey";
import { activateOnKey } from "@/lib/a11y";
import "../tormenta-responsive.css";

const ACCENT       = "#a01818";
const ACCENT_LIGHT = "#d56c6c";
const ACCENT_DIM   = "rgba(160,24,24,0.12)";
const ACCENT_BORD  = "rgba(160,24,24,0.32)";
const MANA         = "#5b7fd4";

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;
type DiceType = typeof DICE_TYPES[number];

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
  pickMode?: "max";
};

type Pool = { cur: number; max: number; temp: number };

function rollDie(sides: number) { return Math.floor(Math.random() * sides) + 1; }
function signed(n: number) { return n >= 0 ? `+${n}` : `${n}`; }

interface Props {
  level: number;
  attrs: Record<AttrKey, number>;
  skillsData: Record<string, boolean>;
  defense: number;
  movement: number;
  pv: Pool; setPv: (p: Pool) => void;
  pm: Pool; setPm: (p: Pool) => void;
  conditions: string[]; setConditions: (v: string[]) => void;
  money: number; setMoney: (v: number) => void;
  weaponIds: string[]; setWeaponIds: (v: string[]) => void;
  equipment: string[]; setEquipment: (v: string[]) => void;
  spellIds: string[];
  powers: ChosenPower[];
  save: (patch: Record<string, unknown>) => void;
}

export function PlayMode({
  level, attrs, skillsData, defense, movement,
  pv, setPv, pm, setPm, conditions, setConditions, money, setMoney,
  weaponIds, setWeaponIds, equipment, setEquipment, spellIds, powers, save,
}: Props) {
  // Rolador
  const [selectedDie, setSelectedDie] = useState<DiceType>(20);
  const [diceCount, setDiceCount] = useState(1);
  const [diceModifier, setDiceModifier] = useState(0);
  const [pickMode, setPickMode] = useState<"sum" | "max">("sum");
  const [lastRoll, setLastRoll] = useState<RollEntry | null>(null);
  const [rollHistory, setRollHistory] = useState<RollEntry[]>([]);
  const [fxRoll, setFxRoll] = useState<RollEntry | null>(null);
  const rollId = useRef(0);

  // Painéis
  const [skillsOpen, setSkillsOpen] = useState(true);
  const [powersOpen, setPowersOpen] = useState(false);
  const [showConditionPicker, setShowConditionPicker] = useState(false);
  const [hpAmount, setHpAmount] = useState(1);
  const [pmAmount, setPmAmount] = useState(1);
  const [moneyInput, setMoneyInput] = useState("");
  const [restQuality, setRestQuality] = useState<RestQuality>("normal");
  // Atributo do teste de ataque por arma: a regra manda Luta (Força), mas armas
  // leves/de arremesso podem usar Destreza (adaga, poder Acuidade com Arma).
  const [weaponAttr, setWeaponAttr] = useState<Record<string, AttrKey>>({});

  const [showItemPicker, setShowItemPicker] = useState(false);
  useEscapeKey(showItemPicker, () => setShowItemPicker(false));
  const [itemSearch, setItemSearch] = useState("");
  const [itemGroup, setItemGroup] = useState<"Armas" | "Armaduras" | "Equipamento">("Armas");

  const alquebrado = conditions.includes(ALQUEBRADO_ID);
  const halfLevel = Math.floor(level / 2);
  const deathAt = deathThreshold(pv.max);
  const dying = pv.cur <= 0;
  const dead = pv.cur <= deathAt;

  // ── Rolagens ──────────────────────────────────────────────────────────────
  function doRoll(
    label: string,
    die: DiceType = selectedDie,
    count: number = diceCount,
    bonus: number = diceModifier,
    opts?: { threat?: number; pick?: "sum" | "max" },
  ): RollEntry {
    const rolls = Array.from({ length: count }, () => rollDie(die));
    const pick = opts?.pick ?? pickMode;
    const useMax = pick === "max" && rolls.length > 1;
    const raw = useMax ? Math.max(...rolls) : rolls.reduce((a, b) => a + b, 0);
    const threat = opts?.threat ?? 20;
    const entry: RollEntry = {
      id: ++rollId.current, label, dice: die, count, modifier: bonus, rolls,
      total: raw + bonus,
      isCrit: die === 20 && rolls[0] >= threat,
      isFumble: die === 20 && rolls[0] === 1,
      ...(useMax ? { pickMode: "max" as const } : {}),
    };
    setLastRoll(entry);
    setRollHistory((prev) => [entry, ...prev].slice(0, 5));
    return entry;
  }

  function quickRoll(label: string, bonus: number, threat = 20) {
    setFxRoll(doRoll(label, 20, 1, bonus, { threat, pick: "sum" }));
  }

  function rollSkill(skillId: string, name: string) {
    const skill = SKILLS.find((s) => s.id === skillId);
    if (!skill) return;
    const trained = !!skillsData[skillId];
    quickRoll(name, skillModifier(level, attrMod(attrs[skill.attr]), trained));
  }

  // ── Ataques ───────────────────────────────────────────────────────────────
  function attackBonus(weapon: Weapon): { bonus: number; attr: AttrKey; skillName: string } {
    const skillId = attackSkillId(weapon);
    const skill = SKILLS.find((s) => s.id === skillId)!;
    const attr = weaponAttr[weapon.id] ?? skill.attr;
    const trained = !!skillsData[skillId];
    return {
      bonus: skillModifier(level, attrMod(attrs[attr]), trained),
      attr,
      skillName: skill.name,
    };
  }

  function rollAttack(weapon: Weapon) {
    const crit = parseCritical(weapon.critical);
    const { bonus } = attackBonus(weapon);
    setFxRoll(doRoll(`${weapon.name} — Ataque`, 20, 1, bonus, { threat: crit?.threat ?? 20, pick: "sum" }));
  }

  function rollDamage(weapon: Weapon, critical: boolean) {
    const base = parseDamageDice(weapon.damage);
    if (!base) return;
    const crit = parseCritical(weapon.critical);
    const dice = critical && crit ? criticalDamageDice(base, crit.multiplier) : base;
    const bonus = damageUsesStrength(weapon) ? attrMod(attrs.for) : 0;
    setFxRoll(doRoll(
      `${weapon.name} — Dano${critical ? " crítico" : ""}`,
      dice.sides as DiceType, dice.count, bonus, { pick: "sum" },
    ));
  }

  // ── PV / PM ───────────────────────────────────────────────────────────────
  function damagePv(amount: number) {
    // Temporários primeiro; PV pode ficar negativo até o limiar de morte.
    const next = spendFromPool({ current: pv.cur, temp: pv.temp }, amount, deathAt);
    const p = { ...pv, cur: next.current, temp: next.temp };
    setPv(p);
    save({ pvCurrent: p.cur, pvTemp: p.temp });
  }

  function healPv(amount: number) {
    const cur = recoverToMax(pv.cur, amount, pv.max);
    const p = { ...pv, cur };
    setPv(p);
    // "Recobra a consciência e pode agir normalmente" ao voltar a 1 PV ou mais.
    const cleaned = cur > 0 ? conditions.filter((c) => c !== "sangrando" && c !== "inconsciente") : conditions;
    if (cleaned.length !== conditions.length) setConditions(cleaned);
    save({ pvCurrent: cur, ...(cleaned.length !== conditions.length ? { conditions: cleaned } : {}) });
  }

  function setPvTemp(temp: number) {
    const p = { ...pv, temp: Math.max(0, temp) };
    setPv(p);
    save({ pvTemp: p.temp });
  }

  function spendPm(amount: number) {
    const next = spendFromPool({ current: pm.cur, temp: pm.temp }, amount, 0);
    const p = { ...pm, cur: next.current, temp: next.temp };
    setPm(p);
    save({ pmCurrent: p.cur, pmTemp: p.temp });
  }

  function recoverPm(amount: number) {
    const cur = recoverToMax(pm.cur, amount, pm.max);
    const p = { ...pm, cur };
    setPm(p);
    save({ pmCurrent: cur });
  }

  function setPmTemp(temp: number) {
    const p = { ...pm, temp: Math.max(0, temp) };
    setPm(p);
    save({ pmTemp: p.temp });
  }

  /** Teste de Constituição (CD 15) do sangramento. */
  function rollStabilize() {
    const entry = doRoll("Estabilizar — Constituição", 20, 1, attrMod(attrs.con), { pick: "sum" });
    setFxRoll(entry);
    if (entry.total >= STABILIZE_DC) {
      const cleaned = conditions.filter((c) => c !== "sangrando");
      if (cleaned.length !== conditions.length) {
        setConditions(cleaned);
        save({ conditions: cleaned });
      }
    } else {
      damagePv(rollDie(6));
    }
  }

  function doRest() {
    const amount = restRecovery(level, restQuality);
    // Pontos temporários desaparecem no fim do dia.
    const nextPv = { ...pv, cur: recoverToMax(Math.max(pv.cur, 0), amount, pv.max), temp: 0 };
    const nextPm = { ...pm, cur: recoverToMax(pm.cur, amount, pm.max), temp: 0 };
    setPv(nextPv);
    setPm(nextPm);
    const cleaned = nextPv.cur > 0 ? conditions.filter((c) => c !== "sangrando" && c !== "inconsciente") : conditions;
    if (cleaned.length !== conditions.length) setConditions(cleaned);
    save({
      pvCurrent: nextPv.cur, pvTemp: 0, pmCurrent: nextPm.cur, pmTemp: 0,
      ...(cleaned.length !== conditions.length ? { conditions: cleaned } : {}),
    });
  }

  // ── Condições ─────────────────────────────────────────────────────────────
  function toggleCondition(id: string) {
    const v = conditions.includes(id) ? conditions.filter((c) => c !== id) : [...conditions, id];
    setConditions(v);
    save({ conditions: v });
  }

  // ── Magias ────────────────────────────────────────────────────────────────
  const knownSpells = spellIds.map((id) => SPELLS.find((s) => s.id === id)).filter((s) => s != null);

  function castSpell(circle: 1 | 2 | 3 | 4 | 5) {
    spendPm(spellPmCost(circle, alquebrado));
  }

  // ── Inventário ────────────────────────────────────────────────────────────
  function addWeapon(id: string) {
    const v = [...weaponIds, id];
    setWeaponIds(v);
    save({ weapons: v });
  }
  function removeWeapon(index: number) {
    const v = weaponIds.filter((_, i) => i !== index);
    setWeaponIds(v);
    save({ weapons: v });
  }
  function addGear(name: string) {
    const v = [...equipment, name];
    setEquipment(v);
    save({ equipment: v });
  }
  function removeGear(index: number) {
    const v = equipment.filter((_, i) => i !== index);
    setEquipment(v);
    save({ equipment: v });
  }

  function adjustMoney(sign: 1 | -1) {
    const amount = parseInt(moneyInput) || 0;
    if (amount === 0) return;
    const v = Math.max(0, money + sign * amount);
    setMoney(v);
    save({ money: v });
    setMoneyInput("");
  }

  const weapons = weaponIds.map((id) => WEAPON_BY_ID[id]).filter((w) => w != null);
  const pvPct = pv.max > 0 ? Math.max(0, pv.cur) / pv.max : 0;
  const pvColor = pvPct > 0.5 ? "#2d8b2d" : pvPct > 0.25 ? "#b8860b" : "#8b0000";
  const pmPct = pm.max > 0 ? pm.cur / pm.max : 0;

  const pickerItems =
    itemGroup === "Armas"
      ? WEAPONS.map((w) => ({ id: w.id, name: w.name, detail: `${w.damage} · ${w.critical} · T$ ${w.price}`, weapon: true }))
      : itemGroup === "Armaduras"
        ? ARMORS.map((a) => ({ id: a.id, name: a.name, detail: `Defesa +${a.defenseBonus} · T$ ${a.price}`, weapon: false }))
        : GEAR.map((g) => ({ id: g.id, name: g.name, detail: `T$ ${g.price} · ${g.description}`, weapon: false }));
  const filteredItems = pickerItems.filter(
    (i) => itemSearch === "" || i.name.toLowerCase().includes(itemSearch.toLowerCase()),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <RollToast roll={fxRoll} color={ACCENT} edgeColor={ACCENT_LIGHT} emissive={ACCENT} />

      {/* ── Vitais ─────────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2rem", fontWeight: 900, color: pvColor, lineHeight: 1 }}>{pv.cur}</span>
              <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/ {pv.max}</span>
              {pv.temp > 0 && <span style={{ fontSize: "0.84rem", color: "#4fc3f7", fontWeight: 700 }}>+{pv.temp} temp</span>}
              <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginLeft: 4 }}>Pontos de Vida</span>
            </div>
            <div style={{ height: 10, background: "var(--surface-2)", borderRadius: 5, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ height: "100%", width: `${Math.min(100, pvPct * 100)}%`, background: pvColor, borderRadius: 5, transition: "width 0.4s ease, background 0.4s ease" }} />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2rem", fontWeight: 900, color: MANA, lineHeight: 1 }}>{pm.cur}</span>
              <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/ {pm.max}</span>
              {pm.temp > 0 && <span style={{ fontSize: "0.84rem", color: "#4fc3f7", fontWeight: 700 }}>+{pm.temp} temp</span>}
              <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginLeft: 4 }}>Pontos de Mana</span>
            </div>
            <div style={{ height: 10, background: "var(--surface-2)", borderRadius: 5, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, pmPct * 100))}%`, background: MANA, borderRadius: 5, transition: "width 0.4s ease" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <QuickStat label="Defesa" value={String(defense)} />
            <QuickStat label="Desloc." value={`${movement}m`} />
            <QuickStat label="T$" value={String(money)} />
          </div>
        </div>

        {/* Ajuste de PV e PM */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={vitalLabel}>PV</span>
            <input
              type="number" min={1} value={hpAmount} aria-label="Valor de dano ou cura em PV"
              onChange={(e) => setHpAmount(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: 54, padding: "4px 6px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.8rem", fontFamily: "inherit" }}
            />
            <button onClick={() => damagePv(hpAmount)} style={vitalBtn} title="Sofrer dano">−</button>
            <button onClick={() => healPv(hpAmount)} style={vitalBtn} title="Recuperar PV">+</button>
            <span style={{ fontSize: "0.66rem", color: "var(--text-subtle)" }}>temp</span>
            <button onClick={() => setPvTemp(pv.temp - 1)} style={tempBtn}>−</button>
            <span style={{ minWidth: 18, textAlign: "center", fontSize: "0.86rem", fontWeight: 800, color: pv.temp > 0 ? "#4fc3f7" : "var(--text-subtle)" }}>{pv.temp}</span>
            <button onClick={() => setPvTemp(pv.temp + 1)} style={tempBtn}>+</button>
          </div>

          <div style={{ width: 1, height: 28, background: "var(--border)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={vitalLabel}>PM</span>
            <input
              type="number" min={1} value={pmAmount} aria-label="Valor de gasto ou recuperação em PM"
              onChange={(e) => setPmAmount(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: 54, padding: "4px 6px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.8rem", fontFamily: "inherit" }}
            />
            <button onClick={() => spendPm(pmAmount)} style={vitalBtn} title="Gastar PM">−</button>
            <button onClick={() => recoverPm(pmAmount)} style={vitalBtn} title="Recuperar PM">+</button>
            <span style={{ fontSize: "0.66rem", color: "var(--text-subtle)" }}>temp</span>
            <button onClick={() => setPmTemp(pm.temp - 1)} style={tempBtn}>−</button>
            <span style={{ minWidth: 18, textAlign: "center", fontSize: "0.86rem", fontWeight: 800, color: pm.temp > 0 ? "#4fc3f7" : "var(--text-subtle)" }}>{pm.temp}</span>
            <button onClick={() => setPmTemp(pm.temp + 1)} style={tempBtn}>+</button>
          </div>
        </div>

        {/* Sangramento / morte (pág. 217) */}
        {dying && (
          <div style={{ background: "rgba(139,0,0,0.15)", border: "1px solid #8b0000", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#ff4444", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              {dead ? "💀 Morto" : "💀 Inconsciente e sangrando"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                {dead
                  ? `PV em ${pv.cur} — a morte ocorre em ${deathAt} PV.`
                  : `No início do seu turno, teste de Constituição (CD ${STABILIZE_DC}). Falhando, perde 1d6 PV. Morte em ${deathAt} PV.`}
              </p>
              {!dead && (
                <button onClick={rollStabilize}
                  style={{ padding: "6px 16px", borderRadius: "var(--radius)", background: "rgba(139,0,0,0.3)", border: "1px solid #8b0000", color: "#ff6b6b", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
                  🎲 Testar Constituição
                </button>
              )}
            </div>
          </div>
        )}

        {/* Condições ativas */}
        {conditions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {conditions.map((id) => {
              const c = CONDITION_BY_ID[id];
              const color = c ? CATEGORY_COLOR[c.category] : "#555";
              return (
                <span
                  key={id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Remover condição ${c?.name ?? id}`}
                  title={c?.desc ?? "Clique para remover"}
                  onClick={() => toggleCondition(id)}
                  onKeyDown={activateOnKey(() => toggleCondition(id))}
                  style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-xs)", cursor: "pointer", background: `${color}33`, border: `1px solid ${color}`, color: "var(--text)", userSelect: "none" }}
                >
                  {c?.name ?? id} ✕
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Grade principal ────────────────────────────────────────────────── */}
      <div className="tm-sheet-columns" style={{ display: "grid", gridTemplateColumns: "230px 1fr 290px", gap: 16, alignItems: "start" }}>

        {/* ESQUERDA: atributos + perícias */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <PlayCard>
            <p style={labelStyle}>Atributos</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ATTR_KEYS.map((k) => {
                const m = attrMod(attrs[k]);
                return (
                  <button
                    key={k}
                    onClick={() => quickRoll(`Teste de ${ATTR_LABEL[k]}`, m)}
                    title={`Rolar teste de ${ATTR_LABEL[k]} (1d20 ${signed(m)})`}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                  >
                    <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.3rem", fontWeight: 900, color: "var(--text)", minWidth: 28, textAlign: "center" }}>{attrs[k]}</span>
                    <div>
                      <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{ATTR_ABBR[k]}</p>
                      <p style={{ fontSize: "0.82rem", fontWeight: 700, color: m >= 0 ? ACCENT_LIGHT : "var(--text-muted)" }}>{signed(m)}</p>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-subtle)" }} aria-hidden>🎲</span>
                  </button>
                );
              })}
            </div>
          </PlayCard>

          <PlayCard>
            <button
              onClick={() => setSkillsOpen((v) => !v)}
              aria-expanded={skillsOpen}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: skillsOpen ? 6 : 0, fontFamily: "inherit" }}
            >
              <p style={labelStyle}>Perícias</p>
              <span aria-hidden style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "inline-block", transform: skillsOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
            </button>
            {skillsOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {SKILLS.map((s) => {
                  const trained = !!skillsData[s.id];
                  const bonus = skillModifier(level, attrMod(attrs[s.attr]), trained);
                  // "Somente treinada": sem treinamento, o teste não pode ser feito.
                  const blocked = s.trainedOnly && !trained;
                  return (
                    <button
                      key={s.id}
                      onClick={() => rollSkill(s.id, s.name)}
                      disabled={blocked}
                      title={blocked ? `${s.name} é somente treinada — sem treinamento, não é possível testar` : `Rolar ${s.name} (1d20 ${signed(bonus)})`}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px", background: trained ? ACCENT_DIM : "transparent", border: "none", borderRadius: "var(--radius-xs)", cursor: blocked ? "not-allowed" : "pointer", opacity: blocked ? 0.45 : 1, fontFamily: "inherit" }}
                    >
                      <span style={{ fontSize: "0.7rem", color: trained ? ACCENT_LIGHT : "var(--text-muted)", fontWeight: trained ? 700 : 400, textAlign: "left" }}>
                        {trained ? "◆" : s.trainedOnly ? "✕" : "○"} {s.name}
                      </span>
                      <span style={{ fontSize: "0.76rem", fontWeight: 700, color: trained ? ACCENT_LIGHT : "var(--text-muted)", marginLeft: 4 }}>{signed(bonus)}</span>
                    </button>
                  );
                })}
                <p style={{ fontSize: "0.6rem", color: "var(--text-subtle)", marginTop: 4, lineHeight: 1.5 }}>
                  ◆ treinada (+2) · ✕ somente treinada · metade do nível (+{halfLevel}) já incluída
                </p>
              </div>
            )}
          </PlayCard>
        </div>

        {/* CENTRO: ações, dados, magias, inventário */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <PlayCard>
            <p style={labelStyle}>Ações Rápidas</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <QuickActionBtn label="⚡ Iniciativa" onClick={() => rollSkill("iniciativa", "Iniciativa")} />
              <QuickActionBtn label="🛡 Fortitude" onClick={() => rollSkill("fortitude", "Fortitude")} />
              <QuickActionBtn label="💨 Reflexos" onClick={() => rollSkill("reflexos", "Reflexos")} />
              <QuickActionBtn label="🧠 Vontade" onClick={() => rollSkill("vontade", "Vontade")} />
            </div>

            {weapons.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {weapons.map((w, i) => {
                  const crit = parseCritical(w.critical);
                  const { bonus, attr, skillName } = attackBonus(w);
                  const dmgAttr = damageUsesStrength(w) ? attrMod(attrs.for) : 0;
                  const meleeLight = !isRanged(w);
                  return (
                    <div key={`${w.id}-${i}`} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "8px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", flex: 1, minWidth: 110 }}>{w.name}</span>
                        <button onClick={() => rollAttack(w)} style={attackBtn}>
                          Ataque {signed(bonus)}
                        </button>
                        {parseDamageDice(w.damage) && (
                          <>
                            <button onClick={() => rollDamage(w, false)} style={dmgBtn}>
                              Dano {w.damage}{dmgAttr !== 0 ? signed(dmgAttr) : ""}
                            </button>
                            {crit && (
                              <button onClick={() => rollDamage(w, true)} style={dmgBtn} title={`Margem de ameaça ${crit.threat} · multiplicador x${crit.multiplier}`}>
                                ✦ x{crit.multiplier}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.64rem", color: "var(--text-subtle)" }}>
                          {skillName} · {w.critical} · {w.damageType ?? "—"}{w.range ? ` · alcance ${w.range}` : ""}
                        </span>
                        {meleeLight && (
                          <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            {(["for", "des"] as AttrKey[]).map((k) => (
                              <button
                                key={k}
                                onClick={() => setWeaponAttr((prev) => ({ ...prev, [w.id]: k }))}
                                title={`Usar ${ATTR_LABEL[k]} no teste de ataque`}
                                style={{
                                  padding: "1px 7px", borderRadius: "var(--radius-xs)", fontSize: "0.6rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                                  background: attr === k ? ACCENT_DIM : "var(--surface)",
                                  border: `1px solid ${attr === k ? ACCENT_BORD : "var(--border)"}`,
                                  color: attr === k ? ACCENT_LIGHT : "var(--text-subtle)",
                                }}
                              >
                                {ATTR_ABBR[k]}
                              </button>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PlayCard>

          {/* Rolador */}
          <PlayCard accent>
            <p style={labelStyle}>Rolagem de Dados</p>

            <div className="tm-dice-grid" style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 10 }}>
              {DICE_TYPES.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDie(d)}
                  aria-label={d === 100 ? "Dado percentual" : `Dado de ${d} faces`}
                  aria-pressed={selectedDie === d}
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "pointer",
                    opacity: selectedDie === d ? 1 : 0.4,
                    transform: selectedDie === d ? "scale(1.18) translateY(-2px)" : "scale(1)",
                    filter: selectedDie === d ? `drop-shadow(0 0 5px ${ACCENT})` : "none",
                    transition: "opacity 0.15s, transform 0.15s",
                  }}
                >
                  <DieSvg sides={d} active={selectedDie === d} size={42} />
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <RollResultDie
                sides={selectedDie}
                size={110}
                roll={lastRoll && lastRoll.dice === selectedDie ? lastRoll : null}
                color={ACCENT}
                edgeColor={ACCENT_LIGHT}
                emissive={ACCENT}
                fallback={<DieSvg sides={selectedDie} active size={110} result={lastRoll && lastRoll.dice === selectedDie ? lastRoll.total : null} />}
              />
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", marginBottom: 10, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Qtd
                <select
                  value={diceCount}
                  onChange={(e) => setDiceCount(parseInt(e.target.value))}
                  style={{ padding: "5px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.82rem", fontFamily: "inherit" }}
                >
                  {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => <option key={n} value={n}>×{n}</option>)}
                </select>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Mod
                <input
                  type="number"
                  value={diceModifier}
                  onChange={(e) => setDiceModifier(parseInt(e.target.value) || 0)}
                  style={{ width: 60, padding: "5px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.82rem", fontFamily: "inherit" }}
                />
              </label>
              <div style={{ display: "flex", gap: 5 }}>
                {(["sum", "max"] as const).map((m) => {
                  const active = pickMode === m;
                  const disabled = diceCount <= 1;
                  return (
                    <button
                      key={m}
                      onClick={() => setPickMode(m)}
                      disabled={disabled}
                      title={m === "sum" ? "Somar todos os dados" : "Usar o maior dado"}
                      style={{
                        width: 42, height: 42, borderRadius: "50%",
                        background: active ? ACCENT_DIM : "var(--surface-2)",
                        border: `2px solid ${active ? ACCENT : "var(--border)"}`,
                        color: active ? ACCENT_LIGHT : "var(--text-subtle)",
                        fontFamily: "var(--font-cinzel), serif", fontSize: "0.6rem", fontWeight: 700,
                        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1,
                        transition: "all 0.15s",
                      }}
                    >
                      {m === "sum" ? "Soma" : "Maior"}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => doRoll(`${diceCount}d${selectedDie}${diceModifier !== 0 ? signed(diceModifier) : ""}`)}
              style={{
                width: "100%", padding: "10px", borderRadius: "var(--radius-lg)",
                background: ACCENT_DIM, border: `1px solid ${ACCENT}`, color: ACCENT_LIGHT,
                fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.06em", marginBottom: 8,
                boxShadow: `0 0 16px ${ACCENT_DIM}`,
              }}
            >
              ROLAR {diceCount}d{selectedDie}{diceModifier !== 0 ? signed(diceModifier) : ""}
            </button>

            {lastRoll && (
              <div style={{ textAlign: "center", marginBottom: 6 }}>
                {lastRoll.isCrit && <p style={{ fontSize: "0.66rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.12em" }}>✦ Acerto crítico ✦</p>}
                {lastRoll.isFumble && <p style={{ fontSize: "0.66rem", fontWeight: 700, color: "#ff4444", textTransform: "uppercase", letterSpacing: "0.12em" }}>Falha crítica</p>}
                <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>
                  {lastRoll.label} · [{lastRoll.rolls.join(", ")}]{lastRoll.modifier !== 0 ? ` ${signed(lastRoll.modifier)}` : ""}
                  {lastRoll.pickMode === "max" ? " · Maior" : ""}
                </p>
              </div>
            )}

            {rollHistory.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <p style={{ ...labelStyle, marginBottom: 2 }}>Histórico</p>
                {rollHistory.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 8px", background: "var(--surface-2)", borderRadius: "var(--radius-xs)" }}>
                    <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", fontWeight: 700, color: r.isCrit ? ACCENT_LIGHT : r.isFumble ? "#ff6b6b" : "var(--text)", minWidth: 26 }}>{r.total}</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", flex: 1 }}>{r.label}</span>
                    <span style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>
                      [{r.rolls.join(", ")}]{r.modifier !== 0 ? signed(r.modifier) : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </PlayCard>

          {/* Magias */}
          {knownSpells.length > 0 && (
            <PlayCard>
              <p style={labelStyle}>Magias — custo em PM</p>
              {alquebrado && (
                <p style={{ fontSize: "0.68rem", color: ACCENT_LIGHT, marginBottom: 8 }}>
                  Alquebrado: todo custo em PM está +1.
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {knownSpells.map((sp) => {
                  const cost = spellPmCost(sp.circle, alquebrado);
                  const affordable = pm.cur + pm.temp >= cost;
                  return (
                    <div key={sp.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>
                          {sp.name}
                          <span style={{ fontSize: "0.66rem", color: "var(--text-subtle)", fontWeight: 400 }}> · {sp.school} · {sp.circle}º círculo</span>
                        </p>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{sp.description}</p>
                      </div>
                      <button
                        onClick={() => castSpell(sp.circle)}
                        disabled={!affordable}
                        title={affordable ? `Gastar ${cost} PM` : "PM insuficiente"}
                        style={{
                          flexShrink: 0, padding: "5px 10px", borderRadius: "var(--radius)",
                          background: affordable ? "rgba(91,127,212,0.16)" : "var(--surface)",
                          border: `1px solid ${affordable ? MANA : "var(--border)"}`,
                          color: affordable ? MANA : "var(--text-subtle)",
                          fontSize: "0.72rem", fontWeight: 700, cursor: affordable ? "pointer" : "not-allowed",
                          fontFamily: "inherit",
                        }}
                      >
                        {cost} PM
                      </button>
                    </div>
                  );
                })}
              </div>
            </PlayCard>
          )}

          {/* Inventário */}
          <PlayCard>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ ...labelStyle, marginBottom: 0 }}>Inventário</p>
              <button
                onClick={() => setShowItemPicker(true)}
                style={{ padding: "4px 10px", borderRadius: "var(--radius)", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                + Adicionar
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {weaponIds.map((id, i) => (
                <ItemChip key={`w-${id}-${i}`} label={WEAPON_BY_ID[id]?.name ?? id} onRemove={() => removeWeapon(i)} accent />
              ))}
              {equipment.map((name, i) => (
                <ItemChip key={`g-${name}-${i}`} label={name} onRemove={() => removeGear(i)} />
              ))}
              {weaponIds.length === 0 && equipment.length === 0 && (
                <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)" }}>Nada carregado ainda.</p>
              )}
            </div>
          </PlayCard>
        </div>

        {/* DIREITA: condições, descanso, dinheiro, poderes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <PlayCard>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ ...labelStyle, marginBottom: 0 }}>Condições</p>
              <button
                onClick={() => setShowConditionPicker((v) => !v)}
                aria-expanded={showConditionPicker}
                style={{ padding: "4px 10px", borderRadius: "var(--radius)", background: showConditionPicker ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${showConditionPicker ? ACCENT_BORD : "var(--border)"}`, color: showConditionPicker ? ACCENT_LIGHT : "var(--text-muted)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                {showConditionPicker ? "Fechar" : "+ Aplicar"}
              </button>
            </div>
            {showConditionPicker ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 320, overflowY: "auto" }}>
                {CONDITIONS.map((c) => {
                  const active = conditions.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCondition(c.id)}
                      title={c.desc}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", textAlign: "left",
                        background: active ? `${CATEGORY_COLOR[c.category]}22` : "transparent",
                        border: `1px solid ${active ? CATEGORY_COLOR[c.category] : "transparent"}`,
                        borderRadius: "var(--radius-xs)", cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLOR[c.category], flexShrink: 0 }} />
                      <span style={{ fontSize: "0.72rem", color: active ? "var(--text)" : "var(--text-muted)", fontWeight: active ? 700 : 400 }}>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : conditions.length === 0 ? (
              <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)" }}>Nenhuma condição ativa.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {conditions.map((id) => {
                  const c = CONDITION_BY_ID[id];
                  if (!c) return null;
                  return (
                    <div key={id} style={{ padding: "6px 8px", background: `${CATEGORY_COLOR[c.category]}18`, border: `1px solid ${CATEGORY_COLOR[c.category]}`, borderRadius: "var(--radius)" }}>
                      <p style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text)" }}>{c.name}</p>
                      <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 2, lineHeight: 1.45 }}>{c.desc}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </PlayCard>

          {/* Descanso */}
          <PlayCard>
            <p style={labelStyle}>Descanso</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.5 }}>
              Oito horas de sono recuperam PV e PM conforme o nível e a condição do descanso.
            </p>
            <select
              value={restQuality}
              onChange={(e) => setRestQuality(e.target.value as RestQuality)}
              aria-label="Condição do descanso"
              style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit", marginBottom: 8 }}
            >
              {(Object.keys(REST_LABEL) as RestQuality[]).map((q) => (
                <option key={q} value={q}>{REST_LABEL[q]}</option>
              ))}
            </select>
            <button
              onClick={doRest}
              style={{ width: "100%", padding: "8px", borderRadius: "var(--radius-lg)", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              🌙 Descansar — +{restRecovery(level, restQuality)} PV e PM
            </button>
          </PlayCard>

          {/* Dinheiro */}
          <PlayCard>
            <p style={labelStyle}>Tibares (T$)</p>
            <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.6rem", fontWeight: 900, color: ACCENT_LIGHT, textAlign: "center", marginBottom: 8 }}>
              T$ {money}
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="number"
                value={moneyInput}
                onChange={(e) => setMoneyInput(e.target.value)}
                placeholder="0"
                aria-label="Valor em tibares"
                style={{ flex: 1, minWidth: 0, padding: "6px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.8rem", fontFamily: "inherit" }}
              />
              <button onClick={() => adjustMoney(1)} style={moneyBtn} title="Receber">+</button>
              <button onClick={() => adjustMoney(-1)} style={moneyBtn} title="Gastar">−</button>
            </div>
          </PlayCard>

          {/* Poderes */}
          {powers.length > 0 && (
            <PlayCard>
              <button
                onClick={() => setPowersOpen((v) => !v)}
                aria-expanded={powersOpen}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                <p style={{ ...labelStyle, marginBottom: 0 }}>Poderes ({powers.length})</p>
                <span aria-hidden style={{ fontSize: "0.65rem", color: "var(--text-muted)", transform: powersOpen ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▼</span>
              </button>
              {powersOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {powers.slice().sort((a, b) => a.level - b.level).map((p, i) => (
                    <div key={`${p.id}-${i}`} style={{ padding: "6px 8px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                      <p style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text)" }}>
                        {p.name}
                        <span style={{ fontSize: "0.64rem", color: "var(--text-subtle)", fontWeight: 400 }}> · nível {p.level}</span>
                      </p>
                      <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 2, lineHeight: 1.45 }}>{p.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </PlayCard>
          )}
        </div>
      </div>

      {/* ── Catálogo de itens ──────────────────────────────────────────────── */}
      {showItemPicker && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Adicionar item ao inventário"
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div style={{ background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 560, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>Equipamento</h2>
              <button onClick={() => setShowItemPicker(false)} aria-label="Fechar"
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ padding: "10px 20px", display: "flex", gap: 6, flexWrap: "wrap", borderBottom: "1px solid var(--border)" }}>
              {(["Armas", "Armaduras", "Equipamento"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setItemGroup(g)}
                  style={{
                    padding: "4px 12px", borderRadius: "var(--radius)", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    background: itemGroup === g ? ACCENT_DIM : "var(--surface-2)",
                    border: `1px solid ${itemGroup === g ? ACCENT_BORD : "var(--border)"}`,
                    color: itemGroup === g ? ACCENT_LIGHT : "var(--text-muted)",
                  }}
                >
                  {g}
                </button>
              ))}
              <input
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Buscar…"
                aria-label="Buscar item"
                style={{ flex: 1, minWidth: 120, padding: "5px 10px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { if (item.weapon) addWeapon(item.id); else addGear(item.name); setShowItemPicker(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                >
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", flexShrink: 0 }}>{item.name}</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.detail}</span>
                  <span style={{ marginLeft: "auto", color: ACCENT_LIGHT, fontSize: "0.9rem" }} aria-hidden>+</span>
                </button>
              ))}
              {filteredItems.length === 0 && (
                <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", textAlign: "center", padding: 20 }}>Nenhum item encontrado.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: "0.64rem", fontWeight: 700, color: "var(--text-muted)",
  textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8,
};

const vitalLabel: React.CSSProperties = {
  fontSize: "0.66rem", fontWeight: 700, color: "var(--text-subtle)",
  letterSpacing: "0.04em", textTransform: "uppercase",
};

const vitalBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: "var(--radius)", background: "var(--surface-2)",
  border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "1rem",
  cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center",
};

const tempBtn: React.CSSProperties = { ...vitalBtn, width: 22, height: 22, fontSize: "0.8rem", borderRadius: "50%" };

const attackBtn: React.CSSProperties = {
  padding: "4px 10px", borderRadius: "var(--radius)", background: ACCENT_DIM,
  border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT, fontSize: "0.72rem",
  fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
};

const dmgBtn: React.CSSProperties = {
  padding: "4px 10px", borderRadius: "var(--radius)", background: "var(--surface)",
  border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.72rem",
  fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
};

const moneyBtn: React.CSSProperties = {
  width: 34, borderRadius: "var(--radius)", background: "var(--surface-2)",
  border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "1rem",
  cursor: "pointer", fontFamily: "inherit",
};

function PlayCard({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ background: "var(--surface)", border: `1px solid ${accent ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-xl)", padding: 16 }}>
      {children}
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "6px 12px", textAlign: "center", minWidth: 58 }}>
      <p style={{ fontSize: "0.56rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{value}</p>
    </div>
  );
}

function QuickActionBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: "6px 12px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.76rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
    >
      {label}
    </button>
  );
}

function ItemChip({ label, onRemove, accent }: { label: string; onRemove: () => void; accent?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.74rem", padding: "4px 8px", borderRadius: "var(--radius)", background: accent ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${accent ? ACCENT_BORD : "var(--border)"}`, color: accent ? ACCENT_LIGHT : "var(--text-muted)" }}>
      {label}
      <button onClick={onRemove} aria-label={`Remover ${label}`}
        style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "0.72rem", padding: 0, lineHeight: 1 }}>✕</button>
    </span>
  );
}

/** Silhuetas dos dados — versão nas cores do Tormenta (o D&D usa as do tema). */
function DieSvg({ sides, size = 44, active = false, result }: {
  sides: number; size?: number; active?: boolean; result?: number | null;
}) {
  const stroke = active ? ACCENT : "var(--border)";
  const fill   = active ? ACCENT_DIM : "var(--surface-2)";
  const centerY = sides === 4 ? 65 : 56;
  const fontSize = result != null ? (result >= 100 ? 20 : result >= 10 ? 24 : 28) : (sides === 100 ? 16 : 18);
  const text = result != null ? String(result) : (sides === 100 ? "d%" : `d${sides}`);
  const textFill = result != null
    ? (result === sides ? ACCENT_LIGHT : result === 1 && sides === 20 ? "#ff6b6b" : "var(--text)")
    : (active ? ACCENT_LIGHT : "var(--text-muted)");

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible" }} aria-hidden>
      {sides === 4   && <polygon points="50,8 92,87 8,87"                  fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 6   && <rect x="10" y="10" width="80" height="80" rx="12" fill={fill} stroke={stroke} strokeWidth="3" />}
      {sides === 8   && <polygon points="50,5 95,50 50,95 5,50"            fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 10  && <polygon points="50,5 93,40 76,90 24,90 7,40"      fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 12  && <polygon points="50,5 93,32 78,88 22,88 7,32"      fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 20  && <polygon points="50,5 93,27 93,73 50,95 7,73 7,27" fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 100 && <circle cx="50" cy="50" r="44"                     fill={fill} stroke={stroke} strokeWidth="3" />}
      <text x="50" y={centerY} textAnchor="middle" fontSize={fontSize} fontWeight="900" fill={textFill}
        fontFamily="var(--font-cinzel), serif" style={{ userSelect: "none" }}>
        {text}
      </text>
    </svg>
  );
}
