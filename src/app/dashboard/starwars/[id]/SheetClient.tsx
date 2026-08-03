"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SPECIES_BY_ID } from "@/lib/starwars/species";
import { PLANET_BY_ID } from "@/lib/starwars/planets";
import { CLASS_BY_ID } from "@/lib/starwars/classes";
import { ATTR_KEYS, ATTR_ABBR, ATTR_LABEL, SKILL_GRADE_LABEL, SKILL_GRADE_BONUS, SKILL_GRADE_ORDER, type AttrKey, type SkillGrade } from "@/lib/starwars/data";
import { SKILLS, SKILL_BY_ID } from "@/lib/starwars/skills";
import { planetSkillBonus, attributeDicePool } from "@/lib/starwars/creation";
import { getAvailableMilestones, getAbilitiesGroupedByLevel } from "@/lib/starwars/powers/registry";
import type { ClassAbility, ClassMilestone } from "@/lib/starwars/powers/types";
import { GENERAL_POWER_BY_ID } from "@/lib/starwars/powers/generalPowers";
import { ITEMS, ITEM_BY_ID, CATEGORY_LABEL, CATEGORY_ORDER, type ItemCategory, type StarWarsItem } from "@/lib/starwars/items";
import { damageLevelMultiplier, baseDamageValue, scaledDamage } from "@/lib/starwars/damage";
import { LevelUpModal } from "./LevelUpModal";
import { StarWarsGuide } from "../mestre/campanha/[id]/StarWarsGuide";
import { RollResultDie, RollToast, type DiceFxRoll } from "@/components/three/DiceRollFx";

// ─── SW accent (azul holo, tom único — igual ao padrão branco/mono da Ordem) ──
const ACCENT       = "#5d9ed6";
const ACCENT_LIGHT = "#8fc4f5";
const ACCENT_DIM   = "rgba(93,158,214,0.14)";
const ACCENT_BORD  = "rgba(93,158,214,0.35)";
const GOLD = "#c9941f";
const TEMP_BLUE = "#5ec8e8";

const GRADE_LETTER: Record<SkillGrade, string> = {
  inexperiente: "-", iniciante: "I", treinado: "T", expert: "E", veterano: "V", mestre: "M",
};
const GRADE_COLOR: Record<SkillGrade, string> = {
  inexperiente: "#6b7280", iniciante: "#9ca3af", treinado: "#ffffff", expert: ACCENT_LIGHT, veterano: GOLD, mestre: "#e0524c",
};

type EquipmentItem = { id: string; name: string; qty: number; itemId?: string; equipped?: boolean };
type RollEntry = DiceFxRoll & { rolls: number[]; kept: number; bonus: number };
type SheetMode = "ficha" | "jogar" | "editar" | "regras";

function rollDie(): number { return Math.floor(Math.random() * 20) + 1; }

/**
 * Resolve as habilidades realmente aprendidas: quando um nível de classe oferece
 * mais de uma opção, mostra só a que está registrada em classPowers (escolhida
 * na criação ou na subida de nível). Fichas antigas sem registro mostram todas
 * as opções daquele nível, pra não esconder informação de personagens já criados.
 */
function resolveClassAbilities(classId: string, lvl: number, classPowers: { level: number; name: string; classId?: string }[]): ClassAbility[] {
  const groups = getAbilitiesGroupedByLevel(classId, lvl);
  const result: ClassAbility[] = [];
  for (const { level, abilities } of groups) {
    if (abilities.length === 1) { result.push(abilities[0]); continue; }
    const chosen = classPowers.find((p) => p.classId === classId && p.level === level);
    const match = chosen ? abilities.find((a) => a.name === chosen.name) : undefined;
    result.push(...(match ? [match] : abilities));
  }
  return result;
}

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { const v = JSON.parse(raw); return v ?? fallback; } catch { return fallback; }
}

interface StarWarsSheetData {
  id: string; species: string | null; planet: string | null; planetSkillChoice: string | null; path: string | null;
  classes: string; level: number; xp: number;
  agi: number; int: number; forca: number; vig: number; pre: number; sen: number;
  pvMax: number; pvClassSum: number; pvLevelGain: number; pvCurrent: number; pvTemp: number;
  peMax: number; peCurrent: number; peTemp: number;
  ppMax: number; ppCurrent: number; ppTemp: number;
  sabreForm: string | null;
  skills: string | null; classPowers: string | null; generalPowers: string | null;
  conditions: string | null; equipment: string | null;
  background: string | null; notes: string | null;
  unlockedProphecies: string;
}

interface CharacterProp {
  id: string; name: string; portraitUrl: string | null;
  starWarsSheet: StarWarsSheetData;
  user?: { name: string | null } | null;
}

// ─── shared bits (mesmo vocabulário visual da ficha de Ordem Paranormal) ──────

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

// ─── Além da Fronteira — perguntas de criação de personagem ───────────────────

const FRONTIER_INTRO =
  "Você vai participar da exploração do lado da Galáxia que ninguém jamais explorou, e que por muitos, colocada como uma forma irracional de se matar.";

const FRONTIER_QUESTIONS: { key: string; question: string }[] = [
  { key: "q_motivo", question: "O que o levou a seguir esse caminho?" },
  { key: "q_objetivo_vida", question: "Qual o maior objetivo da sua vida? Pelo que faria de tudo para conseguir ele?" },
  { key: "q_medo", question: "O que mais teme? O que faria para proteger quem ama ou para se proteger?" },
  { key: "q_alguem_importante", question: "Existe alguém importante em sua vida? Ou só você?" },
  { key: "q_valor_vida", question: "Sua vida é mais importante que qualquer outra vida?" },
  { key: "q_marco", question: "Qual foi o acontecimento que mais marcou sua história?" },
];

function AnswerBox({
  value, onSave, placeholder, rows = 3,
}: {
  value: string; onSave: (v: string) => void; placeholder?: string; rows?: number;
}) {
  const [v, setV] = useState(value);
  return (
    <textarea
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { if (v !== value) onSave(v); }}
      rows={rows}
      placeholder={placeholder ?? "Escreva sua resposta…"}
      style={{
        width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
        padding: "10px 12px", color: "var(--text)", fontSize: "0.84rem", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
      }}
    />
  );
}

function Badge({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div style={{ padding: "8px 16px", background: "var(--surface)", border: `1px solid ${warn ? "rgba(224,82,76,0.5)" : "var(--border)"}`, borderRadius: "var(--radius-lg)" }}>
      <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</p>
      <p style={{ fontSize: "0.95rem", fontWeight: 700, color: warn ? "#e0524c" : "var(--text)", marginTop: 2 }}>{value}</p>
    </div>
  );
}

function VitalCard({
  label, color, cur, max, temp, onDelta, onTemp, note, warn,
}: {
  label: string; color: string; cur: number; max: number; temp: number;
  onDelta?: (d: number) => void; onTemp?: (v: number) => void; note?: string; warn?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (cur / Math.max(1, max)) * 100));
  return (
    <div style={{ padding: "16px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
        {note && <span style={{ fontSize: "0.7rem", fontWeight: 700, color: warn ? "#e0524c" : "var(--text-subtle)" }}>{note}</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {onDelta && <button onClick={() => onDelta(-5)} style={vBtnSmall}>−5</button>}
        {onDelta && <button onClick={() => onDelta(-1)} style={vBtn}>−</button>}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: "1.6rem", fontWeight: 800, color, fontFamily: "var(--font-cinzel), serif" }}>{cur}</span>
            {temp > 0 && <span style={{ fontSize: "0.74rem", fontWeight: 700, color: TEMP_BLUE }}>(+{temp})</span>}
            <span style={{ fontSize: "0.9rem", color: "var(--text-subtle)" }}> / {max}</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "var(--surface-2)", overflow: "hidden", marginTop: 8 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        </div>
        {onDelta && <button onClick={() => onDelta(1)} style={vBtn}>+</button>}
        {onDelta && <button onClick={() => onDelta(5)} style={vBtnSmall}>+5</button>}
      </div>
      {onTemp && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <span style={{ fontSize: "0.6rem", color: TEMP_BLUE, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Temp</span>
          <button onClick={() => onTemp(Math.max(0, temp - 1))} style={vBtnTemp}>−</button>
          <span style={{ minWidth: 16, textAlign: "center", fontSize: "0.76rem", fontWeight: 700, color: TEMP_BLUE }}>{temp}</span>
          <button onClick={() => onTemp(temp + 1)} style={vBtnTemp}>+</button>
        </div>
      )}
    </div>
  );
}

const vBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--text)", fontSize: "1.05rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const vBtnSmall: React.CSSProperties = {
  minWidth: 30, height: 22, padding: "0 6px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--text-muted)", fontSize: "0.66rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const vBtnTemp: React.CSSProperties = {
  width: 20, height: 20, borderRadius: 4, background: "rgba(94,200,232,0.08)", border: "1px solid rgba(94,200,232,0.35)",
  color: TEMP_BLUE, fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", lineHeight: 1,
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};

// ─── Inventário — item de catálogo (arma/armadura/gadget) ─────────────────────

const ATTR_TEST_LABEL: Record<NonNullable<StarWarsItem["testAttr"]>, string> = {
  agi: "AGI", forca: "FOR", vig: "VIG", sen: "SEN", misto: "maior AGI/FOR/SEN",
};

function itemStatLines(item: StarWarsItem): string[] {
  const lines: string[] = [];
  if (item.testAttr && item.skill) {
    lines.push(`Teste: ${ATTR_TEST_LABEL[item.testAttr]} + ${SKILL_BY_ID[item.skill]?.name ?? item.skill}`);
  }
  if (item.damage) lines.push(`Dano: ${item.damage}${item.damageType ? ` · ${item.damageType}` : ""}`);
  if (item.range) lines.push(`Alcance: ${item.range}`);
  if (item.defenseBonus !== undefined) lines.push(`Defesa +${item.defenseBonus}${item.agiPenalty ? ` · Penalidade AGI ${item.agiPenalty}` : ""}`);
  return lines;
}

function OwnedItemCard({
  entry, onEquip, onQty, onRemove,
}: {
  entry: EquipmentItem;
  onEquip?: (id: string) => void;
  onQty?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
}) {
  const item = entry.itemId ? ITEM_BY_ID[entry.itemId] : undefined;
  return (
    <div style={{ padding: "10px 12px", background: entry.equipped ? ACCENT_DIM : "var(--surface)", border: `1px solid ${entry.equipped ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: 600 }}>
          {entry.name}{entry.qty > 1 ? ` ×${entry.qty}` : ""}
        </p>
        {entry.equipped && <span style={{ fontSize: "0.6rem", fontWeight: 700, color: ACCENT_LIGHT, whiteSpace: "nowrap" }}>EQUIPADO</span>}
      </div>
      {item?.category && <p style={{ fontSize: "0.66rem", color: "var(--text-subtle)", marginTop: 2 }}>{CATEGORY_LABEL[item.category]}{item.rarity ? ` · ${item.rarity}` : ""}</p>}
      {item && itemStatLines(item).map((l, i) => <p key={i} style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>{l}</p>)}
      {item?.special && <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginTop: 3, fontStyle: "italic" }}>{item.special}</p>}
      {(onEquip || onQty || onRemove) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {onEquip && item && (
            <button onClick={() => onEquip(entry.id)} style={{ padding: "3px 9px", background: entry.equipped ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT, borderRadius: 5, cursor: "pointer", fontSize: "0.68rem", fontWeight: 700 }}>
              {entry.equipped ? "Desequipar" : "Equipar"}
            </button>
          )}
          {onQty && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => onQty(entry.id, entry.qty - 1)} disabled={entry.qty <= 1} style={{ width: 20, height: 20, borderRadius: 4, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", cursor: entry.qty <= 1 ? "not-allowed" : "pointer", fontSize: "0.7rem", lineHeight: 1 }}>−</button>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", minWidth: 14, textAlign: "center" }}>{entry.qty}</span>
              <button onClick={() => onQty(entry.id, entry.qty + 1)} style={{ width: 20, height: 20, borderRadius: 4, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", fontSize: "0.7rem", lineHeight: 1 }}>+</button>
            </div>
          )}
          {onRemove && (
            <button onClick={() => onRemove(entry.id)} style={{ padding: "3px 9px", background: "none", border: "1px solid var(--border)", color: "var(--text-subtle)", borderRadius: 5, cursor: "pointer", fontSize: "0.68rem" }}>Remover</button>
          )}
        </div>
      )}
    </div>
  );
}

function ItemCatalogBrowser({ onAdd }: { onAdd: (itemId: string) => void }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<ItemCategory | "todos">("todos");
  const filtered = ITEMS.filter((it) => {
    if (cat !== "todos" && it.category !== cat) return false;
    if (search && !it.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <div>
      <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar item do catálogo…"
          style={{ flex: 1, minWidth: 0, padding: "6px 9px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text)", fontSize: "0.76rem" }} />
        <select value={cat} onChange={(e) => setCat(e.target.value as ItemCategory | "todos")}
          style={{ padding: "6px 7px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text)", fontSize: "0.72rem" }}>
          <option value="todos">Todas categorias</option>
          {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflowY: "auto" }}>
        {filtered.map((it) => (
          <div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "6px 9px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "0.76rem", color: "var(--text)" }}>
                {it.name} <span style={{ fontSize: "0.64rem", color: "var(--text-subtle)" }}>· {CATEGORY_LABEL[it.category]}</span>
              </p>
              <p style={{ fontSize: "0.66rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.damage ? `${it.damage}${it.damageType ? ` · ${it.damageType}` : ""}` : it.defenseBonus !== undefined ? `Defesa +${it.defenseBonus}` : it.description}
              </p>
            </div>
            <button onClick={() => onAdd(it.id)} style={{ flexShrink: 0, padding: "4px 10px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT, borderRadius: 5, cursor: "pointer", fontSize: "0.74rem", fontWeight: 700 }}>+</button>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", fontStyle: "italic", padding: "8px 0" }}>Nenhum item encontrado.</p>}
      </div>
    </div>
  );
}

function GradeDot({ grade, onClick }: { grade: SkillGrade; onClick?: () => void }) {
  const color = GRADE_COLOR[grade];
  const style: React.CSSProperties = {
    width: 26, height: 26, flexShrink: 0, borderRadius: "50%",
    background: grade === "inexperiente" ? "transparent" : `${color}22`,
    border: `1.5px solid ${color}`, color,
    fontSize: "0.72rem", fontWeight: 800,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-cinzel), serif",
  };
  if (!onClick) return <span style={style}>{GRADE_LETTER[grade]}</span>;
  return <button onClick={onClick} title={SKILL_GRADE_LABEL[grade]} style={{ ...style, cursor: "pointer" }}>{GRADE_LETTER[grade]}</button>;
}

// Habilidades de Forma de Sabre (Primeiras/Segundas Formas, Formas Completas, Domínio): o Teste
// é o teste padrão de atributo/perícia do sistema (maior AGI/FOR/SEN + Sabres de Luz); o dano é
// fixo (10), não rolado — diferente do golpe de sabre "cru", que segue 6d6×atributo+perícia.
function isSabreForm(a: ClassAbility | ClassMilestone): boolean {
  return a.weaponDamage === "sabre" && !!a.formTag;
}
const SABRE_FORM_DAMAGE = 10;

function AbilityStats({ a }: { a: ClassAbility | ClassMilestone }) {
  const pill: React.CSSProperties = { fontSize: "0.66rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999 };
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
      <span style={{ ...pill, color: TEMP_BLUE, background: "rgba(94,200,232,0.1)", border: "1px solid rgba(94,200,232,0.3)" }}>{a.peCost} PE</span>
      {isSabreForm(a) && (
        <span style={{ ...pill, color: GOLD, background: "rgba(201,148,31,0.1)", border: "1px solid rgba(201,148,31,0.3)" }}>Teste: maior AGI/FOR/SEN + Sabres de Luz</span>
      )}
      {!isSabreForm(a) && a.weaponDamage === "sabre" && (
        <span style={{ ...pill, color: "#e0524c", background: "rgba(224,82,76,0.1)", border: "1px solid rgba(224,82,76,0.3)" }}>
          Dano de sabre: 6d6 × atributo (AGI/FOR/SEN) + perícia Sabres de Luz
        </span>
      )}
      {a.damageDice && (
        <span style={{ ...pill, color: "#e0524c", background: "rgba(224,82,76,0.1)", border: "1px solid rgba(224,82,76,0.3)" }}>
          {a.heal ? "Cura" : a.healOrDamage ? "Cura ou Dano" : "Dano"} {a.damageDice}{!a.heal ? " + metade do grau" : ""}
        </span>
      )}
      {a.dt !== undefined && (
        <span style={{ ...pill, color: GOLD, background: "rgba(201,148,31,0.1)", border: "1px solid rgba(201,148,31,0.3)" }}>DT {a.dt}</span>
      )}
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────

export function SheetClient({ character }: { character: CharacterProp }) {
  const router = useRouter();
  const sheet = character.starWarsSheet;
  const [mode, setMode] = useState<SheetMode>("ficha");
  const [saved, setSaved] = useState<"idle" | "saving" | "ok">("idle");
  const [showLevelUp, setShowLevelUp] = useState(false);

  const [pvCur, setPvCur] = useState(sheet.pvCurrent ?? 0);
  const [peCur, setPeCur] = useState(sheet.peCurrent ?? 0);
  const [ppCur, setPpCur] = useState(sheet.ppCurrent ?? 0);
  const [pvTemp, setPvTemp] = useState(sheet.pvTemp ?? 0);
  const [peTemp, setPeTemp] = useState(sheet.peTemp ?? 0);
  const [ppTemp, setPpTemp] = useState(sheet.ppTemp ?? 0);
  const [conditions] = useState<string[]>(() => parse(sheet.conditions, [] as string[]));
  const [equipment, setEquipment] = useState<EquipmentItem[]>(() => parse(sheet.equipment, [] as EquipmentItem[]));
  const [skills, setSkills] = useState<Record<string, SkillGrade>>(() => parse(sheet.skills, {} as Record<string, SkillGrade>));
  const [background, setBackground] = useState<Record<string, string>>(() => parse(sheet.background, {} as Record<string, string>));

  // Subir de nível e a aba Editar chamam router.refresh(), que traz um `sheet` novo do
  // servidor — mas os useState acima só leem o valor inicial na montagem. Sem este
  // sync, PV/PE/PP e perícias continuariam mostrando os números velhos até dar F5.
  // Ajuste durante o render (padrão do React pra "estado derivado de prop que mudou"),
  // em vez de efeito: re-renderiza antes de pintar, sem flash do valor antigo.
  const [syncedSheet, setSyncedSheet] = useState(sheet);
  if (syncedSheet !== sheet) {
    setSyncedSheet(sheet);
    setPvCur(sheet.pvCurrent ?? 0);
    setPeCur(sheet.peCurrent ?? 0);
    setPpCur(sheet.ppCurrent ?? 0);
    setPvTemp(sheet.pvTemp ?? 0);
    setPeTemp(sheet.peTemp ?? 0);
    setPpTemp(sheet.ppTemp ?? 0);
    setSkills(parse(sheet.skills, {} as Record<string, SkillGrade>));
    setEquipment(parse(sheet.equipment, [] as EquipmentItem[]));
    setBackground(parse(sheet.background, {} as Record<string, string>));
  }

  const species = sheet.species ? SPECIES_BY_ID[sheet.species] : undefined;
  const planet = sheet.planet ? PLANET_BY_ID[sheet.planet] : undefined;
  const classLevels: Record<string, number> = parse(sheet.classes, {});
  const classPowers: { level: number; name: string; classId?: string }[] = parse(sheet.classPowers, []);
  const generalPowerIds: string[] = parse(sheet.generalPowers, []);
  const attrs: Record<AttrKey, number> = { agi: sheet.agi, int: sheet.int, forca: sheet.forca, vig: sheet.vig, pre: sheet.pre, sen: sheet.sen };

  function save(payload: Record<string, unknown>) {
    setSaved("saving");
    fetch(`/api/starwars/characters/${character.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    }).then(() => { setSaved("ok"); setTimeout(() => setSaved("idle"), 1200); }).catch(() => setSaved("idle"));
  }

  function adjust(field: "pv" | "pe" | "pp", delta: number) {
    const current = field === "pv" ? pvCur : field === "pe" ? peCur : ppCur;
    const temp = field === "pv" ? pvTemp : field === "pe" ? peTemp : ppTemp;
    const max = field === "pv" ? sheet.pvMax : field === "pe" ? sheet.peMax : sheet.ppMax;
    const setCurrent = field === "pv" ? setPvCur : field === "pe" ? setPeCur : setPpCur;
    const setTemp = field === "pv" ? setPvTemp : field === "pe" ? setPeTemp : setPpTemp;
    const currentKey = `${field}Current`, tempKey = `${field}Temp`;

    if (delta < 0 && temp > 0) {
      const dmg = -delta;
      const tempUsed = Math.min(temp, dmg);
      const newTemp = temp - tempUsed;
      const newCurrent = Math.max(0, current - (dmg - tempUsed));
      setTemp(newTemp); setCurrent(newCurrent);
      save({ [tempKey]: newTemp, [currentKey]: newCurrent });
      return;
    }
    const v = Math.max(0, Math.min(max, current + delta));
    setCurrent(v);
    save({ [currentKey]: v });
  }

  function setTempValue(field: "pv" | "pe" | "pp", value: number) {
    const v = Math.max(0, value);
    const setTemp = field === "pv" ? setPvTemp : field === "pe" ? setPeTemp : setPpTemp;
    setTemp(v);
    save({ [`${field}Temp`]: v });
  }

  function setBackgroundField(key: string, value: string) {
    const next = { ...background, [key]: value };
    setBackground(next);
    save({ background: next });
  }

  function addEquipment(name: string, qty: number) {
    const next = [...equipment, { id: crypto.randomUUID(), name, qty }];
    setEquipment(next);
    save({ equipment: next });
  }

  function addCatalogItem(itemId: string) {
    const item = ITEM_BY_ID[itemId];
    if (!item) return;
    const existing = equipment.find((e) => e.itemId === itemId);
    const next = existing
      ? equipment.map((e) => (e.itemId === itemId ? { ...e, qty: e.qty + 1 } : e))
      : [...equipment, { id: crypto.randomUUID(), name: item.name, qty: 1, itemId }];
    setEquipment(next);
    save({ equipment: next });
  }

  function removeEquipment(id: string) {
    const next = equipment.filter((e) => e.id !== id);
    setEquipment(next);
    save({ equipment: next });
  }

  function setEquipmentQty(id: string, qty: number) {
    const next = equipment.map((e) => (e.id === id ? { ...e, qty: Math.max(1, qty) } : e));
    setEquipment(next);
    save({ equipment: next });
  }

  function toggleEquipped(id: string) {
    const next = equipment.map((e) => (e.id === id ? { ...e, equipped: !e.equipped } : e));
    setEquipment(next);
    save({ equipment: next });
  }

  function bumpSkillGrade(skillId: string) {
    // atalho de mestre/jogador pra corrigir grau manualmente (não substitui subir de nível)
    const current = skills[skillId] ?? "inexperiente";
    const idx = SKILL_GRADE_ORDER.indexOf(current);
    const next = SKILL_GRADE_ORDER[(idx + 1) % SKILL_GRADE_ORDER.length];
    const nextSkills = { ...skills, [skillId]: next };
    setSkills(nextSkills);
    save({ skills: nextSkills });
  }

  const sharedVitals = { pvCur, peCur, ppCur, pvTemp, peTemp, ppTemp };

  return (
    <div style={{ minHeight: "100vh", background: "transparent", paddingBottom: 60 }}>
      <header style={{ position: "sticky", top: 0, zIndex: 30, borderBottom: "1px solid var(--border)", background: "rgba(5,7,13,0.9)", backdropFilter: "blur(20px)" }}>
        <div className="sw-header-inner" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/dashboard/starwars/jogador" style={{ color: "var(--text-muted)", fontSize: "0.82rem", textDecoration: "none" }}>
            ← Meus Personagens
          </Link>
          <span className="sw-header-title" style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>
            Star Wars: Além da Fronteira
          </span>
          <div className="sw-mode-tabs-wrap" style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: "0.74rem", color: saved === "ok" ? "#7dc864" : "var(--text-muted)", minWidth: 60, textAlign: "right", marginRight: 4 }}>
              {saved === "saving" ? "Salvando…" : saved === "ok" ? "✓ Salvo" : ""}
            </span>
            {(["editar", "ficha", "jogar", "regras"] as SheetMode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: "6px 14px", borderRadius: "var(--radius-lg)",
                background: mode === m ? ACCENT_DIM : "var(--surface-2)",
                border: `1px solid ${mode === m ? ACCENT_BORD : "var(--border)"}`,
                color: mode === m ? ACCENT_LIGHT : "var(--text-muted)",
                fontWeight: mode === m ? 700 : 400, fontSize: "0.82rem", cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: mode === m ? `0 0 14px ${ACCENT_DIM}` : "none",
              }}>
                {m === "ficha" ? "Ficha" : m === "jogar" ? "Jogar" : m === "editar" ? "Editar" : "Regras"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="sw-main-padding" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ width: 56, height: 56, borderRadius: "var(--radius-lg)", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", fontWeight: 700, color: ACCENT_LIGHT, flexShrink: 0, overflow: "hidden" }}>
            {character.portraitUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={character.portraitUrl} alt={character.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : character.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>{character.name}</h1>
            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: 3 }}>
              {[species?.name, planet?.name, Object.entries(classLevels).map(([id, lvl]) => `${CLASS_BY_ID[id]?.name ?? id} ${lvl}`).join(" / "), `Nível ${sheet.level}`].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button className="sw-levelup-btn" onClick={() => setShowLevelUp(true)} style={{
            marginLeft: "auto", padding: "10px 18px", borderRadius: "var(--radius-lg)",
            background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT,
            fontWeight: 700, fontSize: "0.84rem", fontFamily: "inherit", cursor: "pointer",
            boxShadow: `0 0 16px ${ACCENT_DIM}`, whiteSpace: "nowrap",
          }}>
            ⬆ Subir de Nível
          </button>
        </div>

        {showLevelUp && (
          <LevelUpModal
            characterId={character.id}
            sheet={sheet}
            onClose={() => setShowLevelUp(false)}
            onDone={() => { setShowLevelUp(false); router.refresh(); }}
          />
        )}

        {mode === "ficha" ? (
          <ViewMode
            sheet={sheet} attrs={attrs} classLevels={classLevels} classPowers={classPowers}
            generalPowerIds={generalPowerIds} background={background} setBackgroundField={setBackgroundField} planet={planet}
            skills={skills} conditions={conditions} equipment={equipment}
            {...sharedVitals}
          />
        ) : mode === "jogar" ? (
          <PlayMode
            sheet={sheet} attrs={attrs} skills={skills} generalPowerIds={generalPowerIds}
            classLevels={classLevels} classPowers={classPowers}
            equipment={equipment} addEquipment={addEquipment} removeEquipment={removeEquipment}
            addCatalogItem={addCatalogItem} setEquipmentQty={setEquipmentQty} toggleEquipped={toggleEquipped}
            adjust={adjust} setTempValue={setTempValue}
            {...sharedVitals}
          />
        ) : mode === "editar" ? (
          <EditMode
            characterId={character.id}
            characterName={character.name}
            portraitUrl={character.portraitUrl}
            sheet={sheet}
            background={background}
            onSaved={() => { setSaved("ok"); setTimeout(() => setSaved("idle"), 1500); router.refresh(); }}
          />
        ) : (
          <RegrasMode />
        )}
      </main>
    </div>
  );
}

// ─── FICHA (view mode) ─────────────────────────────────────────────────────────

interface VitalsProps { pvCur: number; peCur: number; ppCur: number; pvTemp: number; peTemp: number; ppTemp: number; }

function ViewMode({
  sheet, attrs, classLevels, classPowers, generalPowerIds, background, setBackgroundField, planet, skills, conditions, equipment,
  pvCur, peCur, ppCur, pvTemp, peTemp, ppTemp,
}: VitalsProps & {
  sheet: StarWarsSheetData; attrs: Record<AttrKey, number>; classLevels: Record<string, number>;
  classPowers: { level: number; name: string; classId?: string }[]; generalPowerIds: string[];
  background: Record<string, string>; setBackgroundField: (key: string, value: string) => void;
  planet: (typeof PLANET_BY_ID)[string] | undefined;
  skills: Record<string, SkillGrade>; conditions: string[]; equipment: EquipmentItem[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <VitalCard label="Pontos de Vida" color="#e06c6c" cur={pvCur} max={sheet.pvMax} temp={pvTemp} warn={pvCur <= 0} note={pvCur <= 0 ? "Incapacitado!" : undefined} />
        <VitalCard label="Energia da Força" color={ACCENT_LIGHT} cur={peCur} max={sheet.peMax} temp={peTemp} />
        <VitalCard label="Pontos de Poder" color={GOLD} cur={ppCur} max={sheet.ppMax} temp={ppTemp} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Badge label="Nível" value={sheet.level} />
        {Object.entries(classLevels).map(([id, lvl]) => (
          <Badge key={id} label={CLASS_BY_ID[id]?.name ?? id} value={`Nível ${lvl}`} />
        ))}
        {sheet.sabreForm && <Badge label="Forma de Sabre" value={sheet.sabreForm} />}
        {conditions.length > 0 && <Badge label="Condições" value={conditions.join(", ")} warn />}
      </div>

      <div className="sw-two-col" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel title="Atributos">
            <div className="sw-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {ATTR_KEYS.map((k) => {
                const pool = attributeDicePool(attrs[k]);
                return (
                  <div key={k} style={{ textAlign: "center", padding: "12px 6px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    <p style={{ fontSize: "0.6rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em" }}>{ATTR_ABBR[k]}</p>
                    <p style={{ fontSize: "1.5rem", fontWeight: 800, color: attrs[k] < 0 ? "#e0524c" : ACCENT_LIGHT, fontFamily: "var(--font-cinzel), serif" }}>{attrs[k]}</p>
                    <p style={{ fontSize: "0.56rem", color: "var(--text-subtle)", marginTop: 2 }}>{pool.dice}d20 {pool.take === "highest" ? "maior" : "menor"}</p>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Perícias">
            {planet && <p style={{ fontSize: "0.74rem", color: GOLD, marginBottom: 10 }}>{planet.naturalAbility.name}: {planet.naturalAbility.description}</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, fontSize: "0.64rem", color: "var(--text-subtle)" }}>
              {SKILL_GRADE_ORDER.map((g) => (
                <span key={g} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <GradeDot grade={g} /> {SKILL_GRADE_LABEL[g]}
                </span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 4 }}>
              {SKILLS.map((s) => {
                const grade = skills[s.id] ?? "inexperiente";
                const planetBonus = planetSkillBonus(sheet.planet, sheet.planetSkillChoice, s.id);
                const total = SKILL_GRADE_BONUS[grade] + planetBonus;
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: "var(--radius)", background: grade !== "inexperiente" ? ACCENT_DIM : "transparent" }}>
                    <GradeDot grade={grade} />
                    <span style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: grade !== "inexperiente" ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{s.name}</span>
                    <span style={{ fontSize: "0.68rem", color: total ? ACCENT_LIGHT : "var(--text-subtle)", fontWeight: 700, flexShrink: 0 }}>{total >= 0 ? "+" : ""}{total}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel title="Habilidades de Classe">
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {Object.entries(classLevels).map(([classId, lvl]) => {
                const abilities = resolveClassAbilities(classId, lvl, classPowers);
                const milestones = getAvailableMilestones(classId, lvl);
                return (
                  <div key={classId}>
                    <p style={{ fontSize: "0.72rem", fontWeight: 800, color: ACCENT_LIGHT, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
                      {CLASS_BY_ID[classId]?.name ?? classId} · Nível {lvl}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {abilities.map((a) => (
                        <div key={a.name} style={{ padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                          <p style={{ fontSize: "0.82rem", color: "var(--text)" }}>
                            <strong>{a.name}</strong>{a.combat ? <span style={{ color: "#e0524c" }}> (combate)</span> : null}
                            <span style={{ color: "var(--text-subtle)", fontWeight: 400, fontSize: "0.7rem" }}> · Nível de Classe {a.level}</span>
                          </p>
                          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{a.description}</p>
                          <AbilityStats a={a} />
                        </div>
                      ))}
                      {milestones.map((m) => (
                        <div key={m.name} style={{ padding: "9px 12px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)" }}>
                          <p style={{ fontSize: "0.82rem", color: ACCENT_LIGHT }}><strong>Marco {m.level} — {m.name}</strong></p>
                          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 2 }}>{m.description}</p>
                          <AbilityStats a={m} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {generalPowerIds.length > 0 && (
            <Panel title="Poderes Gerais">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {generalPowerIds.map((id) => {
                  const p = GENERAL_POWER_BY_ID[id];
                  if (!p) return null;
                  return (
                    <div key={id} style={{ padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                      <p style={{ fontSize: "0.8rem", color: "var(--text)" }}><strong>{p.name}</strong> <span style={{ color: GOLD, fontSize: "0.72rem" }}>({p.cost} PP, {p.sustain})</span></p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{p.description}</p>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {equipment.length > 0 && (
            <Panel title={`Inventário (${equipment.length})`}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {CATEGORY_ORDER.filter((cat) => equipment.some((e) => e.itemId && ITEM_BY_ID[e.itemId]?.category === cat)).map((cat) => (
                  <div key={cat}>
                    <p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{CATEGORY_LABEL[cat]}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                      {equipment.filter((e) => e.itemId && ITEM_BY_ID[e.itemId]?.category === cat).map((e) => (
                        <OwnedItemCard key={e.id} entry={e} />
                      ))}
                    </div>
                  </div>
                ))}
                {equipment.some((e) => !e.itemId) && (
                  <div>
                    <p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Itens personalizados</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                      {equipment.filter((e) => !e.itemId).map((e) => (
                        <OwnedItemCard key={e.id} entry={e} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {(background.history || background.objective || background.organization) && (
            <Panel title="Descrição">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {background.organization && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Organização: {background.organization}</p>}
                {background.history && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>História: {background.history}</p>}
                {background.objective && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Objetivo: {background.objective}</p>}
              </div>
            </Panel>
          )}

          <Panel title="Além da Fronteira">
            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
              {FRONTIER_INTRO}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {FRONTIER_QUESTIONS.map((q) => (
                <div key={q.key}>
                  <p style={{ fontSize: "0.78rem", color: "var(--text)", fontWeight: 600, marginBottom: 6 }}>{q.question}</p>
                  <AnswerBox value={background[q.key] ?? ""} onSave={(v) => setBackgroundField(q.key, v)} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Conexões Importantes">
            <AnswerBox
              value={background.connections ?? ""}
              onSave={(v) => setBackgroundField("connections", v)}
              placeholder="Aliados, mentores, rivais, família, dívidas — quem marca a jornada do seu personagem."
              rows={4}
            />
          </Panel>
        </div>
      </div>
    </div>
  );
}

// ─── JOGAR (play mode) ─────────────────────────────────────────────────────────

const DICE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;
type DiceSides = typeof DICE_SIDES[number];

function PlayMode({
  sheet, attrs, skills, generalPowerIds, classLevels, classPowers,
  equipment, addEquipment, removeEquipment, addCatalogItem, setEquipmentQty, toggleEquipped,
  pvCur, peCur, ppCur, pvTemp, peTemp, ppTemp,
  adjust, setTempValue,
}: VitalsProps & {
  sheet: StarWarsSheetData; attrs: Record<AttrKey, number>; skills: Record<string, SkillGrade>;
  generalPowerIds: string[]; classLevels: Record<string, number>;
  classPowers: { level: number; name: string; classId?: string }[];
  equipment: EquipmentItem[]; addEquipment: (name: string, qty: number) => void; removeEquipment: (id: string) => void;
  addCatalogItem: (itemId: string) => void; setEquipmentQty: (id: string, qty: number) => void; toggleEquipped: (id: string) => void;
  adjust: (field: "pv" | "pe" | "pp", delta: number) => void;
  setTempValue: (field: "pv" | "pe" | "pp", value: number) => void;
}) {
  const [lastRoll, setLastRoll] = useState<RollEntry | null>(null);
  const [fxRoll, setFxRoll] = useState<RollEntry | null>(null);
  const [log, setLog] = useState<RollEntry[]>([]);
  const rollId = useRef(0);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [mod, setMod] = useState(0);
  const [selectedDie, setSelectedDie] = useState<DiceSides>(20);
  const [diceQty, setDiceQty] = useState(1);
  const [pickMode, setPickMode] = useState<"soma" | "maior">("soma");
  const [rollChoice, setRollChoice] = useState<{ skillId: string; chosenAttr?: AttrKey } | null>(null);

  function doRoll(label: string, attr: AttrKey, bonus: number) {
    const pool = attributeDicePool(attrs[attr]);
    const rolls = Array.from({ length: pool.dice }, rollDie);
    const kept = pool.take === "highest" ? Math.max(...rolls) : Math.min(...rolls);
    const total = kept + bonus;
    const entry: RollEntry = { id: ++rollId.current, label, dice: 20, total, rolls, kept, bonus, isCrit: kept === 20, isFumble: kept === 1 };
    setLastRoll(entry); setFxRoll(entry);
    setLog((l) => [entry, ...l].slice(0, 5));
  }

  function doGenericRoll() {
    const rolls = Array.from({ length: diceQty }, () => Math.floor(Math.random() * selectedDie) + 1);
    const raw = pickMode === "maior" ? Math.max(...rolls) : rolls.reduce((a, b) => a + b, 0);
    const total = Math.max(1, raw + mod);
    const label = `${diceQty}D${selectedDie === 100 ? "%" : selectedDie}`;
    const entry: RollEntry = {
      id: ++rollId.current, label, dice: selectedDie, total,
      rolls, kept: raw, bonus: mod, isCrit: selectedDie === 20 && rolls[0] === 20, isFumble: selectedDie === 20 && rolls[0] === 1,
    };
    setLastRoll(entry); setFxRoll(entry);
    setLog((l) => [entry, ...l].slice(0, 5));
  }

  function skillTotal(skillId: string): number {
    const grade = skills[skillId] ?? "inexperiente";
    const planetBonus = planetSkillBonus(sheet.planet, sheet.planetSkillChoice, skillId);
    return SKILL_GRADE_BONUS[grade] + planetBonus;
  }
  function rollSkillRow(skillId: string) {
    const skill = SKILL_BY_ID[skillId];
    if (!skill) return;
    if (skill.attrs.length === 1) { finalizeSkillRoll(skillId, skill.attrs[0], false); return; }
    setRollChoice({ skillId });
  }
  function chooseAttrForRoll(attr: AttrKey) {
    if (!rollChoice) return;
    if (attr === "sen" && rollChoice.skillId !== "dominio_forca") {
      setRollChoice({ ...rollChoice, chosenAttr: attr });
      return;
    }
    finalizeSkillRoll(rollChoice.skillId, attr, false);
    setRollChoice(null);
  }
  function choosePeSpend(spend: boolean) {
    if (!rollChoice?.chosenAttr) return;
    finalizeSkillRoll(rollChoice.skillId, rollChoice.chosenAttr, spend);
    setRollChoice(null);
  }
  function finalizeSkillRoll(skillId: string, attr: AttrKey, spendPe: boolean) {
    doRoll(SKILL_BY_ID[skillId].name, attr, skillTotal(skillId) + mod);
    if (spendPe) adjust("pe", -1);
  }
  function rollAttribute(k: AttrKey) {
    doRoll(ATTR_LABEL[k], k, mod);
  }

  function activateAbility(a: ClassAbility | ClassMilestone) {
    if (isSabreForm(a)) {
      // Habilidade de Forma: o Teste segue a mesma regra padrão de teste do sistema (Nd20 pelo
      // maior entre AGI/FOR/SEN + perícia Sabres de Luz — igual a qualquer perícia/atributo).
      // O dano é fixo em 10, não rolado (ver badge "Dano: 10").
      const sabreSkill = SKILL_BY_ID["sabres_de_luz"];
      const bestAttr = sabreSkill.attrs.reduce((best, k) => (attrs[k] > attrs[best] ? k : best), sabreSkill.attrs[0]);
      doRoll(`Forma: ${a.name}`, bestAttr, skillTotal("sabres_de_luz") + mod);
      adjust("pe", -a.peCost);
      return;
    }
    if (a.weaponDamage === "sabre") {
      // Regra fixa: dano de sabre nunca segue a escala por círculo — é sempre
      // 6d6 × atributo base (o maior entre AGI/FOR/SEN, mín. 1 pra nunca zerar/inverter
      // o dano com atributo 0 ou negativo) + valor total da perícia Sabres de Luz.
      const sabreSkill = SKILL_BY_ID["sabres_de_luz"];
      const bestAttr = sabreSkill.attrs.reduce((best, k) => (attrs[k] > attrs[best] ? k : best), sabreSkill.attrs[0]);
      const attrValue = Math.max(1, attrs[bestAttr]);
      const rolls = Array.from({ length: 6 }, () => Math.floor(Math.random() * 6) + 1);
      const diceSum = rolls.reduce((x, y) => x + y, 0);
      const skillBonus = skillTotal("sabres_de_luz");
      const total = Math.max(0, diceSum * attrValue + skillBonus + mod);
      const entry: RollEntry = { id: ++rollId.current, label: `Sabre: ${a.name}`, dice: 6, total, rolls, kept: diceSum, bonus: skillBonus + mod };
      setLastRoll(entry); setFxRoll(entry);
      setLog((l) => [entry, ...l].slice(0, 5));
      adjust("pe", -a.peCost);
      return;
    }
    if (a.dt !== undefined) {
      // Habilidade utilitária (não-combate): faz o teste normal (1d20 + mod) contra a DT cadastrada e desconta PE.
      const roll = Math.floor(Math.random() * 20) + 1;
      const total = roll + mod;
      const entry: RollEntry = {
        id: ++rollId.current, label: `Teste: ${a.name} (DT ${a.dt})`, dice: 20, total, rolls: [roll], kept: roll, bonus: mod,
        isCrit: roll === 20, isFumble: roll === 1,
      };
      setLastRoll(entry); setFxRoll(entry);
      setLog((l) => [entry, ...l].slice(0, 5));
      adjust("pe", -a.peCost);
      return;
    }
    if (!a.damageDice) return;
    const diceMatch = a.damageDice.match(/^(\d+)d(\d+)$/);
    if (!diceMatch) return;
    const n = parseInt(diceMatch[1], 10), sides = parseInt(diceMatch[2], 10);
    const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
    const raw = rolls.reduce((x, y) => x + y, 0);
    // Dano de habilidade de classe escala com o nível (Base × (1 + Nível/5)) — ver lib/starwars/damage.ts.
    const scaled = scaledDamage(raw, sheet.level);
    const total = Math.max(0, scaled + mod);
    const label = `${a.heal ? "Cura" : "Dano"}: ${a.name}`;
    const entry: RollEntry = { id: ++rollId.current, label, dice: sides, total, rolls, kept: scaled, bonus: mod };
    setLastRoll(entry); setFxRoll(entry);
    setLog((l) => [entry, ...l].slice(0, 5));
    adjust("pe", -a.peCost);
  }

  const ppAvailable = ppCur + ppTemp;
  const peAvailable = peCur + peTemp;

  // Área de Danos: dano já calculado (base → escalado pelo nível atual) de toda habilidade
  // com dano numérico e de todo item equipado — ver lib/starwars/damage.ts.
  type DamageRow = { name: string; baseLabel: string; base: number; scales: boolean; notation?: string };
  const abilityDamageRows: DamageRow[] = [];
  for (const [classId, lvl] of Object.entries(classLevels)) {
    const all: (ClassAbility | ClassMilestone)[] = [...resolveClassAbilities(classId, lvl, classPowers), ...getAvailableMilestones(classId, lvl)];
    for (const a of all) {
      if (isSabreForm(a)) {
        abilityDamageRows.push({ name: a.name, baseLabel: `${SABRE_FORM_DAMAGE}`, base: SABRE_FORM_DAMAGE, scales: true });
      } else if (a.weaponDamage === "sabre") {
        abilityDamageRows.push({ name: a.name, baseLabel: "6d6 × atributo + perícia", base: 0, scales: false });
      } else if (a.damageDice) {
        const base = baseDamageValue(a.damageDice);
        if (base !== null) abilityDamageRows.push({ name: `${a.heal ? "Cura" : "Dano"}: ${a.name}`, baseLabel: a.damageDice, base, scales: true, notation: a.damageDice });
      }
    }
  }
  const itemDamageRows: DamageRow[] = equipment
    .filter((e) => e.equipped && e.itemId)
    .map((e) => ITEM_BY_ID[e.itemId as string])
    .filter((item): item is StarWarsItem => !!item?.damage)
    .map((item): DamageRow | null => {
      const base = baseDamageValue(item.damage as string);
      return base !== null ? { name: item.name, baseLabel: item.damage as string, base, scales: true, notation: /^\d+d\d+$/.test(item.damage as string) ? (item.damage as string) : undefined } : null;
    })
    .filter((r): r is DamageRow => r !== null);

  function rollDamageRow(r: DamageRow) {
    const m = r.notation?.match(/^(\d+)d(\d+)$/);
    if (!m) return;
    const n = parseInt(m[1], 10), sides = parseInt(m[2], 10);
    const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
    const raw = rolls.reduce((x, y) => x + y, 0);
    const scaled = scaledDamage(raw, sheet.level);
    const entry: RollEntry = { id: ++rollId.current, label: r.name, dice: sides, total: scaled, rolls, kept: scaled, bonus: 0 };
    setLastRoll(entry); setFxRoll(entry);
    setLog((l) => [entry, ...l].slice(0, 5));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <VitalCard label="Pontos de Vida" color="#e06c6c" cur={pvCur} max={sheet.pvMax} temp={pvTemp} onDelta={(d) => adjust("pv", d)} onTemp={(v) => setTempValue("pv", v)} warn={pvCur <= 0} note={pvCur <= 0 ? "Incapacitado!" : undefined} />
        <VitalCard label="Energia da Força" color={ACCENT_LIGHT} cur={peCur} max={sheet.peMax} temp={peTemp} onDelta={(d) => adjust("pe", d)} onTemp={(v) => setTempValue("pe", v)} />
        <VitalCard label="Pontos de Poder" color={GOLD} cur={ppCur} max={sheet.ppMax} temp={ppTemp} onDelta={(d) => adjust("pp", d)} onTemp={(v) => setTempValue("pp", v)} />
      </div>

      <div className="sw-two-col" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel title="Atributos">
            <div className="sw-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {ATTR_KEYS.map((k) => {
                const pool = attributeDicePool(attrs[k]);
                return (
                  <button key={k} onClick={() => rollAttribute(k)} style={{ textAlign: "center", padding: "12px 4px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", cursor: "pointer" }}>
                    <p style={{ fontSize: "0.58rem", color: "var(--text-subtle)", fontWeight: 700 }}>{ATTR_ABBR[k]}</p>
                    <p style={{ fontSize: "1.3rem", fontWeight: 800, color: attrs[k] < 0 ? "#e0524c" : ACCENT_LIGHT, fontFamily: "var(--font-cinzel), serif" }}>{attrs[k]}</p>
                    <p style={{ fontSize: "0.52rem", color: "var(--text-subtle)" }}>{pool.dice}d20</p>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Perícias">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 4, maxHeight: 320, overflowY: "auto" }}>
              {SKILLS.map((s) => {
                const grade = skills[s.id] ?? "inexperiente";
                const total = skillTotal(s.id);
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: "var(--radius)", background: grade !== "inexperiente" ? ACCENT_DIM : "transparent" }}>
                    <GradeDot grade={grade} />
                    <button onClick={() => rollSkillRow(s.id)} style={{ flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                      <span style={{ fontSize: "0.68rem", color: total ? ACCENT_LIGHT : "var(--text-subtle)", fontWeight: 700, flexShrink: 0 }}>{total >= 0 ? "+" : ""}{total}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Habilidades de Classe">
            <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", marginBottom: 10 }}>PE disponível: <strong style={{ color: TEMP_BLUE }}>{peAvailable}</strong></p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 340, overflowY: "auto" }}>
              {Object.entries(classLevels).map(([classId, lvl]) => {
                const abilities = resolveClassAbilities(classId, lvl, classPowers);
                const milestones = getAvailableMilestones(classId, lvl);
                const all: (ClassAbility | ClassMilestone)[] = [...abilities, ...milestones];
                return (
                  <div key={classId}>
                    <p style={{ fontSize: "0.68rem", fontWeight: 800, color: ACCENT_LIGHT, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                      {CLASS_BY_ID[classId]?.name ?? classId}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {all.map((a) => {
                        const affordable = peAvailable >= a.peCost;
                        const usable = !!a.damageDice || a.weaponDamage === "sabre" || a.dt !== undefined;
                        return (
                          <button key={a.name} disabled={usable && !affordable} onClick={() => usable && activateAbility(a)} title={a.description}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "7px 10px", background: "var(--surface)", border: `1px solid ${usable && affordable ? "rgba(224,82,76,0.4)" : "var(--border)"}`, borderRadius: "var(--radius)", color: usable && !affordable ? "var(--text-subtle)" : "var(--text)", cursor: usable ? (affordable ? "pointer" : "not-allowed") : "default", textAlign: "left", opacity: usable && !affordable ? 0.5 : 1 }}>
                            <span style={{ fontSize: "0.78rem" }}>{a.name}</span>
                            <span style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                              <span style={{ fontSize: "0.68rem", color: TEMP_BLUE, fontWeight: 700 }}>{a.peCost} PE</span>
                              {a.weaponDamage === "sabre" && <span style={{ fontSize: "0.68rem", color: "#e0524c", fontWeight: 700 }}>{isSabreForm(a) ? "Teste attr+perícia" : "Sabre 6d6×atr+perícia"}</span>}
                              {a.damageDice && <span style={{ fontSize: "0.68rem", color: "#e0524c", fontWeight: 700 }}>{a.heal ? "Cura" : "Dano"} {a.damageDice}</span>}
                              {a.dt !== undefined && <span style={{ fontSize: "0.68rem", color: GOLD, fontWeight: 700 }}>DT {a.dt}</span>}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Área de Danos">
            <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", marginBottom: 12 }}>
              Nível {sheet.level} → multiplicador <strong style={{ color: ACCENT_LIGHT }}>×{damageLevelMultiplier(sheet.level).toFixed(1)}</strong> (Dano Final = Base × (1 + Nível ÷ 5))
            </p>

            <p style={{ fontSize: "0.66rem", fontWeight: 800, color: ACCENT_LIGHT, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Habilidades</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
              {abilityDamageRows.length === 0 && <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Nenhuma habilidade com dano numérico ainda.</p>}
              {abilityDamageRows.map((r, i) => {
                const Tag = r.notation ? "button" : "div";
                return (
                  <Tag key={i} onClick={r.notation ? () => rollDamageRow(r) : undefined} title={r.notation ? "Rolar dano" : undefined}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: `1px solid ${r.notation ? "rgba(224,82,76,0.4)" : "var(--border)"}`, width: "100%", textAlign: "left", cursor: r.notation ? "pointer" : "default", font: "inherit", color: "inherit" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                      {r.notation && <span aria-hidden>🎲</span>}
                      {r.name}
                    </span>
                    {r.scales ? (
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        Base {r.baseLabel} → <strong style={{ color: "#e0524c" }}>{scaledDamage(r.base, sheet.level)}</strong>
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", fontStyle: "italic" }}>{r.baseLabel} — regra própria, não escala</span>
                    )}
                  </Tag>
                );
              })}
            </div>

            <p style={{ fontSize: "0.66rem", fontWeight: 800, color: ACCENT_LIGHT, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Itens Equipados</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {itemDamageRows.length === 0 && <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Nenhum item equipado com dano (equipe algo no Inventário).</p>}
              {itemDamageRows.map((r, i) => {
                const Tag = r.notation ? "button" : "div";
                return (
                  <Tag key={i} onClick={r.notation ? () => rollDamageRow(r) : undefined} title={r.notation ? "Rolar dano" : undefined}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: `1px solid ${r.notation ? "rgba(224,82,76,0.4)" : "var(--border)"}`, width: "100%", textAlign: "left", cursor: r.notation ? "pointer" : "default", font: "inherit", color: "inherit" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                      {r.notation && <span aria-hidden>🎲</span>}
                      {r.name}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      Base {r.baseLabel} → <strong style={{ color: "#e0524c" }}>{scaledDamage(r.base, sheet.level)}</strong>
                    </span>
                  </Tag>
                );
              })}
            </div>
          </Panel>

          {generalPowerIds.length > 0 && (
            <Panel title="Poderes Gerais">
              <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", marginBottom: 10 }}>PP disponível: <strong style={{ color: GOLD }}>{ppAvailable}</strong></p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {generalPowerIds.map((id) => {
                  const p = GENERAL_POWER_BY_ID[id];
                  if (!p) return null;
                  const affordable = ppAvailable >= p.cost;
                  return (
                    <button key={id} disabled={!affordable} onClick={() => adjust("pp", -p.cost)} title={p.description}
                      style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 10px", background: "var(--surface)", border: `1px solid ${affordable ? "rgba(201,148,31,0.4)" : "var(--border)"}`, borderRadius: "var(--radius)", color: affordable ? "var(--text)" : "var(--text-subtle)", cursor: affordable ? "pointer" : "not-allowed", textAlign: "left", opacity: affordable ? 1 : 0.5 }}>
                      <span style={{ fontSize: "0.78rem" }}>{p.name}</span>
                      <span style={{ fontSize: "0.7rem", color: GOLD, fontWeight: 700 }}>{p.cost} PP</span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel title="Rolagem de Dados">
            <div className="sw-dice-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 14 }}>
              {DICE_SIDES.map((d) => (
                <button key={d} onClick={() => setSelectedDie(d)} style={{
                  padding: "5px 0", borderRadius: "var(--radius)", fontSize: "0.72rem", fontWeight: 700,
                  cursor: "pointer", fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.03em", textAlign: "center",
                  border: `1px solid ${selectedDie === d ? ACCENT_BORD : "var(--border)"}`,
                  background: selectedDie === d ? ACCENT_DIM : "var(--surface-2)",
                  color: selectedDie === d ? ACCENT_LIGHT : "var(--text-muted)",
                  boxShadow: selectedDie === d ? `0 0 10px ${ACCENT_DIM}` : "none",
                }}>
                  D{d === 100 ? "%" : d}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <RollResultDie
                sides={selectedDie} size={120} roll={fxRoll} color={ACCENT_LIGHT} edgeColor={ACCENT_LIGHT} emissive={ACCENT}
                resultColor={ACCENT_LIGHT}
                label={selectedDie === 100 ? "d%" : undefined}
                fallback={<div style={{ width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", color: "var(--text-subtle)", fontFamily: "var(--font-cinzel), serif" }}>D{selectedDie === 100 ? "%" : selectedDie}</div>}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Qtd</span>
                <button onClick={() => setDiceQty((q) => Math.max(1, q - 1))} style={{ width: 24, height: 24, borderRadius: "var(--radius-xs)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem", cursor: "pointer" }}>−</button>
                <span style={{ minWidth: 20, textAlign: "center", fontSize: "0.82rem", fontWeight: 700, color: ACCENT_LIGHT }}>×{diceQty}</span>
                <button onClick={() => setDiceQty((q) => Math.min(20, q + 1))} style={{ width: 24, height: 24, borderRadius: "var(--radius-xs)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem", cursor: "pointer" }}>+</button>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {(["soma", "maior"] as const).map((m) => (
                  <button key={m} onClick={() => setPickMode(m)} style={{ padding: "4px 10px", borderRadius: "var(--radius-xs)", fontSize: "0.68rem", fontWeight: 700, cursor: "pointer", textTransform: "uppercase", border: `1px solid ${pickMode === m ? ACCENT_BORD : "var(--border)"}`, background: pickMode === m ? ACCENT_DIM : "var(--surface-2)", color: pickMode === m ? ACCENT_LIGHT : "var(--text-muted)" }}>{m}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", flexShrink: 0 }}>Mod</span>
              <button onClick={() => setMod((m) => m - 1)} style={{ width: 28, height: 28, borderRadius: "var(--radius-xs)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "1rem", cursor: "pointer" }}>−</button>
              <span style={{ minWidth: 28, textAlign: "center", fontSize: "0.9rem", fontWeight: 700, color: mod !== 0 ? ACCENT_LIGHT : "var(--text-subtle)", fontFamily: "var(--font-cinzel), serif" }}>{mod >= 0 ? `+${mod}` : mod}</span>
              <button onClick={() => setMod((m) => m + 1)} style={{ width: 28, height: 28, borderRadius: "var(--radius-xs)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "1rem", cursor: "pointer" }}>+</button>
              <button onClick={() => setMod(0)} style={{ fontSize: "0.66rem", color: "var(--text-subtle)", background: "none", border: "none", cursor: "pointer" }}>reset</button>
            </div>

            <button onClick={doGenericRoll} style={{
              width: "100%", padding: "11px 0", borderRadius: "var(--radius-lg)", marginBottom: 12,
              background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`,
              color: ACCENT_LIGHT, fontWeight: 700, fontSize: "0.88rem",
              fontFamily: "var(--font-cinzel), serif", cursor: "pointer", letterSpacing: "0.05em",
              boxShadow: `0 0 14px ${ACCENT_DIM}`,
            }}>
              ROLAR {diceQty > 1 ? diceQty : ""}D{selectedDie === 100 ? "%" : selectedDie}
            </button>

            <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginBottom: 10 }}>Ou clique num atributo/perícia ao lado (Nd20, regra própria de Star Wars: mantém maior/menor conforme o valor do atributo).</p>
            {lastRoll && (
              <p style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text)" }}>{lastRoll.label}</strong>: [{lastRoll.rolls.join(", ")}] → {lastRoll.kept}{lastRoll.bonus ? ` + ${lastRoll.bonus}` : ""} = <strong style={{ color: ACCENT_LIGHT }}>{lastRoll.total}</strong>
              </p>
            )}
            {log.length > 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 8 }}>
                {log.slice(1).map((r) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-subtle)", padding: "3px 8px", background: "var(--surface-2)", borderRadius: 4 }}>
                    <span>{r.label}</span><span style={{ color: "var(--text-muted)", fontWeight: 700 }}>{r.total}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Catálogo de Itens">
            <ItemCatalogBrowser onAdd={addCatalogItem} />
          </Panel>

          <Panel title={`Inventário (${equipment.length})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, maxHeight: 320, overflowY: "auto" }}>
              {equipment.map((item) => (
                <OwnedItemCard key={item.id} entry={item} onEquip={toggleEquipped} onQty={setEquipmentQty} onRemove={removeEquipment} />
              ))}
              {equipment.length === 0 && <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Sem itens registrados.</p>}
            </div>
            <p style={{ fontSize: "0.66rem", color: "var(--text-subtle)", marginBottom: 6 }}>Item personalizado (fora do catálogo):</p>
            <div style={{ display: "flex", gap: 5 }}>
              <input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Novo item…" style={{ flex: 1, minWidth: 0, padding: "6px 9px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text)", fontSize: "0.76rem" }} />
              <input type="number" min={1} value={newItemQty} onChange={(e) => setNewItemQty(Math.max(1, Number(e.target.value) || 1))} style={{ width: 44, padding: "6px 5px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text)", fontSize: "0.76rem", textAlign: "center" }} />
              <button onClick={() => { if (newItemName.trim()) { addEquipment(newItemName.trim(), newItemQty); setNewItemName(""); setNewItemQty(1); } }} style={{ padding: "6px 11px", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 5, cursor: "pointer", fontSize: "0.74rem" }}>+</button>
            </div>
          </Panel>
        </div>
      </div>

      <RollToast roll={fxRoll} color={ACCENT} edgeColor={ACCENT_LIGHT} emissive="#12202e" />

      {rollChoice && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(5,7,13,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setRollChoice(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: 22, width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 14 }}>
            {rollChoice.chosenAttr ? (
              <>
                <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)" }}>Gastar 1 Ponto de Energia da Força?</p>
                <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)" }}>{SKILL_BY_ID[rollChoice.skillId]?.name} rolada com {ATTR_LABEL[rollChoice.chosenAttr]} (Sensitividade).</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => choosePeSpend(true)} style={{ flex: 1, padding: "9px 12px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT, borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}>Sim</button>
                  <button onClick={() => choosePeSpend(false)} style={{ flex: 1, padding: "9px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}>Não</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)" }}>Rolar {SKILL_BY_ID[rollChoice.skillId]?.name} com qual atributo?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SKILL_BY_ID[rollChoice.skillId]?.attrs.map((a) => (
                    <button key={a} onClick={() => chooseAttrForRoll(a)} style={{ padding: "9px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: "var(--radius)", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", textAlign: "left" }}>
                      {ATTR_LABEL[a]} <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>({attrs[a]})</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            <button onClick={() => setRollChoice(null)} style={{ alignSelf: "flex-end", background: "none", border: "none", color: "var(--text-subtle)", fontSize: "0.72rem", cursor: "pointer", padding: 0 }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EDITAR (sandbox de correção manual) ───────────────────────────────────────

interface EditProps {
  characterId: string;
  characterName: string;
  portraitUrl: string | null;
  sheet: StarWarsSheetData;
  background: Record<string, string>;
  onSaved: () => void;
}

const editLabelStyle: React.CSSProperties = {
  fontSize: "0.66rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5,
};
const editInputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", background: "var(--surface-2)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", fontFamily: "inherit", boxSizing: "border-box",
};
const miniBtn: React.CSSProperties = {
  padding: "5px 11px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
  color: "var(--text-muted)", fontSize: "0.72rem", cursor: "pointer", fontFamily: "inherit",
};

function EditSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      {children}
    </div>
  );
}

function EditNumber({ label, value, onChange, min, hint, readOnly }: { label: string; value: number; onChange: (v: number) => void; min?: number; hint?: string; readOnly?: boolean }) {
  return (
    <div>
      <p style={editLabelStyle}>{label}{hint && <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none" }}> · {hint}</span>}</p>
      <input type="number" value={value} min={min} readOnly={readOnly}
        onChange={(e) => onChange(min !== undefined ? Math.max(min, Number(e.target.value) || 0) : Number(e.target.value) || 0)}
        style={readOnly ? { ...editInputStyle, opacity: 0.7, cursor: "not-allowed" } : editInputStyle} />
    </div>
  );
}

function EditText({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <p style={editLabelStyle}>{label}</p>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} style={{ ...editInputStyle, resize: "vertical", lineHeight: 1.6 }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={editInputStyle} />
      )}
    </div>
  );
}

function EditMode({ characterId, characterName, portraitUrl: initialPortrait, sheet, background: initialBackground, onSaved }: EditProps) {
  const [name, setName] = useState(characterName);
  const [portrait, setPortrait] = useState<string | null>(initialPortrait);
  const [attrs, setAttrs] = useState<Record<AttrKey, number>>({ agi: sheet.agi, int: sheet.int, forca: sheet.forca, vig: sheet.vig, pre: sheet.pre, sen: sheet.sen });
  const [vitals, setVitals] = useState({
    pvClassSum: sheet.pvClassSum, pvLevelGain: sheet.pvLevelGain,
    pvCurrent: sheet.pvCurrent, peMax: sheet.peMax, peCurrent: sheet.peCurrent, ppMax: sheet.ppMax, ppCurrent: sheet.ppCurrent,
  });
  const [progress, setProgress] = useState({ level: sheet.level, xp: sheet.xp });
  const [sabreForm, setSabreForm] = useState(sheet.sabreForm ?? "");
  const [skills, setSkills] = useState<Record<string, SkillGrade>>(() => parse(sheet.skills, {} as Record<string, SkillGrade>));
  const [background, setBackground] = useState({
    organization: initialBackground.organization ?? "", history: initialBackground.history ?? "", objective: initialBackground.objective ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSavedLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function setAttr(k: AttrKey, v: number) { setAttrs((a) => ({ ...a, [k]: v })); setSavedLocal(false); }
  function setVital(k: keyof typeof vitals, v: number) { setVitals((s) => ({ ...s, [k]: v })); setSavedLocal(false); }
  function setProg(k: keyof typeof progress, v: number) { setProgress((s) => ({ ...s, [k]: v })); setSavedLocal(false); }
  function bumpSkillGrade(skillId: string) {
    const current = skills[skillId] ?? "inexperiente";
    const idx = SKILL_GRADE_ORDER.indexOf(current);
    const next = SKILL_GRADE_ORDER[(idx + 1) % SKILL_GRADE_ORDER.length];
    setSkills((s) => ({ ...s, [skillId]: next }));
    setSavedLocal(false);
  }

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const max = 400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        setPortrait(canvas.toDataURL("image/jpeg", 0.85));
        setSavedLocal(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/starwars/characters/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, portraitUrl: portrait,
          ...attrs,
          ...vitals,
          level: progress.level, xp: progress.xp,
          sabreForm: sabreForm.trim() || null,
          skills,
          background,
        }),
      });
      if (!res.ok) throw new Error("Falha ao salvar.");
      setSavedLocal(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
        <p style={{ fontSize: "0.78rem", color: ACCENT_LIGHT, fontWeight: 700, marginBottom: 2 }}>⚠️ Atenção: edição manual da ficha</p>
        <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Ao salvar, os valores desta tela substituem os atuais. Use pra corrigir erros — não concede recursos automáticos (pra isso, use &quot;Subir de Nível&quot;).
        </p>
      </div>

      <EditSection label="Identidade">
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 110, height: 110, borderRadius: "var(--radius-lg)", border: `1px solid ${ACCENT_BORD}`, background: "var(--surface-2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {portrait
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={portrait} alt="Retrato" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "0.66rem", color: "var(--text-subtle)", textAlign: "center", padding: 8 }}>Sem foto</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} style={{ display: "none" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => fileRef.current?.click()} style={miniBtn}>Trocar foto</button>
              {portrait && <button onClick={() => { setPortrait(null); setSavedLocal(false); }} style={miniBtn}>Remover</button>}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <EditText label="Nome" value={name} onChange={(v) => { setName(v); setSavedLocal(false); }} />
          </div>
        </div>
      </EditSection>

      <EditSection label="Atributos">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {ATTR_KEYS.map((k) => (
            <EditNumber key={k} label={ATTR_LABEL[k]} value={attrs[k]} onChange={(v) => setAttr(k, v)} />
          ))}
        </div>
      </EditSection>

      <EditSection label="Vitalidade">
        <div>
          <p style={{ ...editLabelStyle, marginBottom: 8 }}>PV Máximo — composição</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 10 }}>
            <EditNumber label="Pv Soma das Classes" value={vitals.pvClassSum} onChange={(v) => setVital("pvClassSum", v)} min={0} />
            <EditNumber label="Pv Por Subir de Nível" value={vitals.pvLevelGain} onChange={(v) => setVital("pvLevelGain", v)} min={0} />
          </div>
          <div style={{ padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", marginBottom: 14 }}>
            <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              PV Indicado
            </p>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, color: ACCENT_LIGHT }}>
              {vitals.pvClassSum} + {vitals.pvLevelGain} = {vitals.pvClassSum + vitals.pvLevelGain}
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          <EditNumber label="PV Máximo" value={vitals.pvClassSum + vitals.pvLevelGain} onChange={() => {}} readOnly hint="calculado" />
          <EditNumber label="PV Atual" value={vitals.pvCurrent} onChange={(v) => setVital("pvCurrent", v)} min={0} />
          <EditNumber label="PE Máximo" value={vitals.peMax} onChange={(v) => setVital("peMax", v)} min={0} />
          <EditNumber label="PE Atual" value={vitals.peCurrent} onChange={(v) => setVital("peCurrent", v)} min={0} />
          <EditNumber label="PP Máximo" value={vitals.ppMax} onChange={(v) => setVital("ppMax", v)} min={0} />
          <EditNumber label="PP Atual" value={vitals.ppCurrent} onChange={(v) => setVital("ppCurrent", v)} min={0} />
        </div>
      </EditSection>

      <EditSection label="Progressão">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          <EditNumber label="Nível" value={progress.level} onChange={(v) => setProg("level", v)} min={1} hint="correção manual" />
          <EditNumber label="XP" value={progress.xp} onChange={(v) => setProg("xp", v)} min={0} />
        </div>
        <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>
          Alterar o Nível aqui não distribui pontos em classes nem concede PV/PE/PP — use &quot;Subir de Nível&quot; pra isso. Este campo é só pra correções.
        </p>
      </EditSection>

      <EditSection label="Forma de Sabre">
        <EditText label="Forma especialista (se aplicável)" value={sabreForm} onChange={(v) => { setSabreForm(v); setSavedLocal(false); }} />
      </EditSection>

      <EditSection label="Perícias">
        <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginBottom: 8 }}>Clique no grau pra avançar (Inexperiente → Treinado → Adepto → Versado → Mestre → volta ao início).</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 4 }}>
          {SKILLS.map((s) => {
            const grade = skills[s.id] ?? "inexperiente";
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: "var(--radius)", background: grade !== "inexperiente" ? ACCENT_DIM : "transparent" }}>
                <GradeDot grade={grade} onClick={() => bumpSkillGrade(s.id)} />
                <span style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: grade !== "inexperiente" ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{s.name}</span>
              </div>
            );
          })}
        </div>
      </EditSection>

      <EditSection label="Descrição">
        <EditText label="Organização" value={background.organization} onChange={(v) => { setBackground((b) => ({ ...b, organization: v })); setSavedLocal(false); }} />
        <EditText label="História" value={background.history} onChange={(v) => { setBackground((b) => ({ ...b, history: v })); setSavedLocal(false); }} textarea />
        <EditText label="Objetivo" value={background.objective} onChange={(v) => { setBackground((b) => ({ ...b, objective: v })); setSavedLocal(false); }} textarea />
      </EditSection>

      {error && <p style={{ fontSize: "0.8rem", color: "#e0524c" }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center" }}>
        {saved && <span style={{ fontSize: "0.78rem", color: "#7dc864" }}>✓ Salvo</span>}
        <button onClick={save} disabled={saving} style={{
          padding: "10px 22px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT,
          fontWeight: 700, fontSize: "0.84rem", fontFamily: "inherit", cursor: saving ? "wait" : "pointer",
          borderRadius: "var(--radius-lg)", boxShadow: `0 0 16px ${ACCENT_DIM}`,
        }}>
          {saving ? "Salvando…" : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}

// ─── REGRAS (explicação do sistema e da ficha) ─────────────────────────────────

function RegrasMode() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "18px 20px" }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Como usar esta ficha</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.6 }}>
            <strong style={{ color: ACCENT_LIGHT }}>Ficha</strong> — visão só-leitura do personagem: atributos, perícias, habilidades de classe já aprendidas, poderes gerais e descrição.
          </p>
          <p style={{ fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.6 }}>
            <strong style={{ color: ACCENT_LIGHT }}>Jogar</strong> — pra usar em mesa: PV/PE/PP com dano/cura/pontos temporários, rolagem de dados (clique num atributo ou perícia pra rolar com a regra de Star Wars, ou use o roller genérico D4-D%), Habilidades de Classe (área do teste) seguida da Área de Danos (dano já calculado com a escala de nível — ver &quot;Escala de Dano por Nível&quot; abaixo), lista de Poderes Gerais que desconta PP automaticamente, e inventário.
          </p>
          <p style={{ fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.6 }}>
            <strong style={{ color: ACCENT_LIGHT }}>Editar</strong> — correção manual de nome, foto, atributos, PV/PE/PP máximo/atual, nível/XP e descrição. Não concede recursos automáticos — pra subir de nível de verdade, use o botão &quot;Subir de Nível&quot; no topo.
          </p>
          <p style={{ fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.6 }}>
            <strong style={{ color: ACCENT_LIGHT }}>Subir de Nível</strong> — abre o assistente de progressão: escolhe em qual classe o nível entra (ou multiclassa), e escolhe uma evolução (atributo, habilidade de classe, poder geral ou grau de perícia — perícia é obrigatória em níveis múltiplos de 5).
          </p>
        </div>
      </div>

      <StarWarsGuide />
    </div>
  );
}
