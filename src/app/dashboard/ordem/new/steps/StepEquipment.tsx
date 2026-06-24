"use client";

import { useState } from "react";
import type { OrdemWizardData } from "../CharacterWizard";
import { Intro } from "./StepAttrs";
import {
  WEAPONS, PROTECTIONS, GENERAL_ITEMS, GENERAL_GROUP_LABEL,
  WEAPON_BY_ID, PROTECTION_BY_ID, GENERAL_BY_ID,
  DAMAGE_TYPE_LABEL, loadStatus, categoryLimit,
  type WeaponProf, type GeneralGroup,
} from "@/lib/ordem/items";
import {
  applicableWeaponMods, applicableProtectionMods, isAccessory,
  ACCESSORY_MODS, WEAPON_CURSES, PROTECTION_CURSES, ACCESSORY_CURSES,
  configuredCategory, effectiveCategory, weaponSpaceDelta, protectionSpaceDelta, accessorySpaceDelta,
  type ConfiguredItem,
} from "@/lib/ordem/modifications";

const BORD_SEL = "rgba(255,255,255,0.55)";
const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const PATENTE = "recruta"; // nível 1
const roman = (n: number) => ROMAN[n] ?? String(n);

const PROF_LABEL: Record<WeaponProf, string> = {
  simples: "Armas Simples",
  tatica: "Armas Táticas",
  pesada: "Armas Pesadas",
};

const CLASS_WEAPON_PROFS: Record<string, WeaponProf[]> = {
  combatente: ["simples", "tatica"],
  especialista: ["simples"],
  ocultista: ["simples"],
};

type ItemKind = "weapons" | "protections" | "generalItems";

interface Props {
  data: OrdemWizardData;
  onChange: (p: Partial<OrdemWizardData>) => void;
}

export function StepEquipment({ data, onChange }: Props) {
  const profSet = data.classId ? CLASS_WEAPON_PROFS[data.classId] ?? [] : [];
  const [editing, setEditing] = useState<{ kind: ItemKind; id: string } | null>(null);

  // ── Espaços e categoria efetiva de cada item configurado ──
  function weaponSpaces(c: ConfiguredItem): number {
    const w = WEAPON_BY_ID[c.id]; if (!w) return 0;
    return Math.max(0, w.spaces + weaponSpaceDelta(c.mods));
  }
  function protectionSpaces(c: ConfiguredItem): number {
    const p = PROTECTION_BY_ID[c.id]; if (!p) return 0;
    return Math.max(0, p.spaces + protectionSpaceDelta(c.mods));
  }
  function generalSpaces(c: ConfiguredItem): number {
    const g = GENERAL_BY_ID[c.id]; if (!g) return 0;
    const delta = isAccessory(g) ? accessorySpaceDelta(c.mods) : 0;
    return Math.max(0, g.spaces + delta);
  }
  function weaponCat(c: ConfiguredItem): number {
    const w = WEAPON_BY_ID[c.id]; return w ? configuredCategory(w.category, c) : 0;
  }
  function protectionCat(c: ConfiguredItem): number {
    const p = PROTECTION_BY_ID[c.id]; return p ? configuredCategory(p.category, c) : 0;
  }
  function generalCat(c: ConfiguredItem): number {
    const g = GENERAL_BY_ID[c.id]; return g ? configuredCategory(g.category, c) : 0;
  }

  const usedSpaces =
    data.weapons.reduce((a, c) => a + weaponSpaces(c), 0) +
    data.protections.reduce((a, c) => a + protectionSpaces(c), 0) +
    data.generalItems.reduce((a, c) => a + generalSpaces(c), 0);
  const bonusSpaces = data.generalItems.reduce((a, c) => a + (GENERAL_BY_ID[c.id]?.capacityBonus ?? 0), 0);
  const load = loadStatus(usedSpaces, data.attrs.for, bonusSpaces);

  // Contagem por categoria efetiva (para limites de patente).
  const allCats: number[] = [
    ...data.weapons.map(weaponCat),
    ...data.protections.map(protectionCat),
    ...data.generalItems.map(generalCat),
  ];
  const catCount = (cat: number) => allCats.filter((c) => c === cat).length;
  const catILimit = categoryLimit(PATENTE, 1); // 2 para recruta

  // Maior categoria que a patente atual libera (recruta = I).
  function maxAllowedCat(): number {
    let m = 0;
    for (let c = 1; c <= 4; c++) if (categoryLimit(PATENTE, c) > 0) m = c;
    return m;
  }

  function baseCatFor(kind: ItemKind, id: string): number {
    if (kind === "weapons") return WEAPON_BY_ID[id]?.category ?? 0;
    if (kind === "protections") return PROTECTION_BY_ID[id]?.category ?? 0;
    return GENERAL_BY_ID[id]?.category ?? 0;
  }
  function effCatOf(kind: ItemKind, c: ConfiguredItem): number {
    if (kind === "weapons") return weaponCat(c);
    if (kind === "protections") return protectionCat(c);
    return generalCat(c);
  }
  // Categorias efetivas de todos os itens, exceto o (kind,id) informado.
  function catsExcept(kind: ItemKind, id: string): number[] {
    const out: number[] = [];
    (["weapons", "protections", "generalItems"] as ItemKind[]).forEach((k) => {
      listFor(k).forEach((c) => { if (!(k === kind && c.id === id)) out.push(effCatOf(k, c)); });
    });
    return out;
  }
  // Verifica se colocar este item na categoria `newCat` respeita a patente.
  function changeValid(kind: ItemKind, id: string, newCat: number): string | null {
    if (newCat > maxAllowedCat()) return `Categoria ${roman(newCat)} exige patente maior`;
    const cats = catsExcept(kind, id);
    cats.push(newCat);
    for (let c = 1; c <= 4; c++) {
      const lim = categoryLimit(PATENTE, c);
      if (lim === Infinity) continue;
      if (cats.filter((x) => x === c).length > lim) return `Limite de categoria ${roman(c)} (${lim})`;
    }
    return null;
  }

  function listFor(kind: ItemKind): ConfiguredItem[] { return data[kind] as ConfiguredItem[]; }
  function find(kind: ItemKind, id: string): ConfiguredItem | undefined {
    return listFor(kind).find((c) => c.id === id);
  }

  // Motivo de bloqueio para SELECIONAR um item novo (categoria base).
  function blockReason(category: number, spaces: number): string | null {
    if (category >= 2 && categoryLimit(PATENTE, category) <= 0) return `Categoria ${roman(category)} exige patente maior`;
    if (category === 1 && catCount(1) >= catILimit) return `Limite de categoria I (${catILimit})`;
    if (load.used + spaces > load.hardCap) return "Excede o limite máximo de carga";
    return null;
  }

  function toggle(kind: ItemKind, id: string, category: number, spaces: number) {
    const list = listFor(kind);
    if (list.some((c) => c.id === id)) {
      onChange({ [kind]: list.filter((c) => c.id !== id) } as Partial<OrdemWizardData>);
      if (editing?.kind === kind && editing.id === id) setEditing(null);
    } else if (!blockReason(category, spaces)) {
      onChange({ [kind]: [...list, { id, mods: [], curses: [] }] } as Partial<OrdemWizardData>);
    }
  }

  function updateItem(kind: ItemKind, id: string, patch: Partial<ConfiguredItem>) {
    const list = listFor(kind);
    onChange({ [kind]: list.map((c) => (c.id === id ? { ...c, ...patch } : c)) } as Partial<OrdemWizardData>);
  }

  function toggleMod(kind: ItemKind, id: string, modId: string) {
    const c = find(kind, id); if (!c) return;
    const adding = !c.mods.includes(modId);
    if (adding) {
      const newCat = effectiveCategory(baseCatFor(kind, id), c.mods.length + 1, c.curses.length);
      if (changeValid(kind, id, newCat)) return; // bloqueia se passar da categoria liberada
    }
    const mods = c.mods.includes(modId) ? c.mods.filter((m) => m !== modId) : [...c.mods, modId];
    updateItem(kind, id, { mods });
  }
  function toggleCurse(kind: ItemKind, id: string, curseId: string) {
    const c = find(kind, id); if (!c) return;
    const adding = !c.curses.includes(curseId);
    if (adding) {
      const newCat = effectiveCategory(baseCatFor(kind, id), c.mods.length, c.curses.length + 1);
      if (changeValid(kind, id, newCat)) return;
    }
    const curses = c.curses.includes(curseId) ? c.curses.filter((m) => m !== curseId) : [...c.curses, curseId];
    updateItem(kind, id, { curses });
  }

  // Motivo de bloqueio para ADICIONAR mais uma modificação / maldição ao item.
  function addModReason(kind: ItemKind, c: ConfiguredItem): string | null {
    return changeValid(kind, c.id, effectiveCategory(baseCatFor(kind, c.id), c.mods.length + 1, c.curses.length));
  }
  function addCurseReason(kind: ItemKind, c: ConfiguredItem): string | null {
    return changeValid(kind, c.id, effectiveCategory(baseCatFor(kind, c.id), c.mods.length, c.curses.length + 1));
  }

  const profs: WeaponProf[] = ["simples", "tatica", "pesada"];
  const groups: GeneralGroup[] = ["acessorio", "explosivo", "operacional", "paranormal", "artefato"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <Intro
        title="Equipamento & Identidade"
        text="Como recruta (nível 1), você libera itens de categoria 0 à vontade e até 2 de categoria I. Cada modificação sobe a categoria do item em I; maldições sobem +II (a primeira) e +I (demais). Respeite a capacidade de carga."
      />

      {/* Resumo de carga + categorias (sticky) */}
      <div
        style={{
          position: "sticky", top: 64, zIndex: 5,
          display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
          padding: "14px 18px",
          background: "rgba(10,12,18,0.92)", backdropFilter: "blur(12px)",
          border: `1px solid ${load.overCap ? "rgba(220,60,60,0.5)" : load.overloaded ? "rgba(224,132,60,0.5)" : "rgba(255,255,255,0.18)"}`,
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Carga</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: load.overCap ? "#e0843c" : "#ffffff" }}>
              {load.used} / {load.capacity} esp{load.overloaded && !load.overCap ? " · sobrecarregado" : ""}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (load.used / Math.max(1, load.capacity)) * 100)}%`, background: load.overloaded ? "#e0843c" : "#ffffff", transition: "width 0.25s" }} />
          </div>
          <p style={{ fontSize: "0.66rem", color: "var(--text-subtle)", marginTop: 4 }}>
            Capacidade 5×Força{bonusSpaces ? ` +${bonusSpaces}` : ""} · teto {load.hardCap}. Sobrecarga: −5 Defesa, −3m, −5 perícias de carga.
          </p>
        </div>
        <div style={{ textAlign: "center", padding: "6px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "var(--radius)" }}>
          <p style={{ fontSize: "0.64rem", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase" }}>Categoria I</p>
          <p style={{ fontSize: "1.05rem", fontWeight: 800, color: catCount(1) >= catILimit ? "#e0843c" : "#ffffff" }}>{catCount(1)}/{catILimit}</p>
        </div>
      </div>

      {load.overloaded && (
        <p style={{ fontSize: "0.78rem", color: "#e0843c", marginTop: -12 }}>
          {load.overCap ? "Acima do teto de carga — remova itens para continuar." : "Sobrecarregado: aplicará −5 em Defesa, −3m de deslocamento e −5 em perícias de carga."}
        </p>
      )}

      {/* Armas */}
      <Section title="Armas" caption={<><span style={{ color: "#e0843c", fontWeight: 700 }}>−5</span> = arma fora da proficiência da classe. Clique em <b>Modificar</b> para aplicar modificações e maldições.</>}>
        {profs.map((prof) => (
          <div key={prof} style={{ marginBottom: 12 }}>
            <GroupLabel>{PROF_LABEL[prof]}</GroupLabel>
            <Grid>
              {WEAPONS.filter((w) => w.prof === prof).map((w) => {
                const conf = find("weapons", w.id);
                const sel = !!conf;
                const effCat = conf ? weaponCat(conf) : w.category;
                const effSpaces = conf ? weaponSpaces(conf) : w.spaces;
                const block = sel ? null : blockReason(w.category, w.spaces);
                const proficient = profSet.includes(w.prof);
                return (
                  <ItemBtn
                    key={w.id}
                    selected={sel}
                    blocked={block}
                    onClick={() => toggle("weapons", w.id, w.category, w.spaces)}
                    title={w.name}
                    titleExtra={!proficient ? <span style={{ fontSize: "0.62rem", color: "#e0843c", fontWeight: 700, marginLeft: 6 }}>−5</span> : null}
                    sub={`${w.damage} · ${DAMAGE_TYPE_LABEL[w.type]} · crít ${w.crit}${w.range ? ` · ${w.range}` : ""}`}
                    category={effCat}
                    baseCategory={w.category}
                    spaces={effSpaces}
                    modCount={conf ? conf.mods.length + conf.curses.length : 0}
                    onModify={sel ? () => setEditing(editing?.id === w.id && editing.kind === "weapons" ? null : { kind: "weapons", id: w.id }) : undefined}
                    editing={editing?.kind === "weapons" && editing.id === w.id}
                  />
                );
              })}
            </Grid>
            {/* Painel de modificação de arma */}
            {editing?.kind === "weapons" && WEAPONS.some((w) => w.prof === prof && w.id === editing.id) && (() => {
              const w = WEAPON_BY_ID[editing.id]; const conf = find("weapons", editing.id);
              if (!w || !conf) return null;
              return (
                <ModPanel
                  title={w.name}
                  mods={applicableWeaponMods(w).map((m) => ({ id: m.id, name: m.name, effect: m.effect }))}
                  curses={WEAPON_CURSES.map((c) => ({ id: c.id, name: c.name, effect: c.effect, element: c.element }))}
                  selMods={conf.mods}
                  selCurses={conf.curses}
                  onToggleMod={(id) => toggleMod("weapons", editing!.id, id)}
                  onToggleCurse={(id) => toggleCurse("weapons", editing!.id, id)}
                  baseCat={w.category}
                  effCat={weaponCat(conf)}
                  addModBlocked={addModReason("weapons", conf)}
                  addCurseBlocked={addCurseReason("weapons", conf)}
                />
              );
            })()}
          </div>
        ))}
      </Section>

      {/* Proteções */}
      <Section title="Proteções">
        <Grid>
          {PROTECTIONS.map((p) => {
            const conf = find("protections", p.id);
            const sel = !!conf;
            const effCat = conf ? protectionCat(conf) : p.category;
            const effSpaces = conf ? protectionSpaces(conf) : p.spaces;
            const block = sel ? null : blockReason(p.category, p.spaces);
            return (
              <ItemBtn
                key={p.id}
                selected={sel}
                blocked={block}
                onClick={() => toggle("protections", p.id, p.category, p.spaces)}
                title={p.name}
                sub={`Defesa +${p.defense}${p.note ? ` · ${p.note}` : ""}`}
                category={effCat}
                baseCategory={p.category}
                spaces={effSpaces}
                modCount={conf ? conf.mods.length + conf.curses.length : 0}
                onModify={sel ? () => setEditing(editing?.id === p.id && editing.kind === "protections" ? null : { kind: "protections", id: p.id }) : undefined}
                editing={editing?.kind === "protections" && editing.id === p.id}
              />
            );
          })}
        </Grid>
        {editing?.kind === "protections" && (() => {
          const p = PROTECTION_BY_ID[editing.id]; const conf = find("protections", editing.id);
          if (!p || !conf) return null;
          return (
            <ModPanel
              title={p.name}
              mods={applicableProtectionMods(p).map((m) => ({ id: m.id, name: m.name, effect: m.effect }))}
              curses={PROTECTION_CURSES.map((c) => ({ id: c.id, name: c.name, effect: c.effect, element: c.element }))}
              selMods={conf.mods}
              selCurses={conf.curses}
              onToggleMod={(id) => toggleMod("protections", editing!.id, id)}
              onToggleCurse={(id) => toggleCurse("protections", editing!.id, id)}
              baseCat={p.category}
              effCat={protectionCat(conf)}
              addModBlocked={addModReason("protections", conf)}
              addCurseBlocked={addCurseReason("protections", conf)}
            />
          );
        })()}
      </Section>

      {/* Itens Gerais */}
      <Section title="Itens Gerais" caption={<>Apenas <b>acessórios</b> (utensílio, vestimenta…) aceitam modificações e maldições.</>}>
        {groups.map((g) => (
          <div key={g} style={{ marginBottom: 12 }}>
            <GroupLabel>{GENERAL_GROUP_LABEL[g]}</GroupLabel>
            <Grid>
              {GENERAL_ITEMS.filter((it) => it.group === g).map((it) => {
                const conf = find("generalItems", it.id);
                const sel = !!conf;
                const acc = isAccessory(it);
                const effCat = conf ? generalCat(conf) : it.category;
                const effSpaces = conf ? generalSpaces(conf) : it.spaces;
                const block = sel ? null : blockReason(it.category, it.spaces);
                return (
                  <ItemBtn
                    key={it.id}
                    selected={sel}
                    blocked={block}
                    onClick={() => toggle("generalItems", it.id, it.category, it.spaces)}
                    title={it.name}
                    sub={it.desc}
                    category={effCat}
                    baseCategory={it.category}
                    spaces={effSpaces}
                    modCount={conf ? conf.mods.length + conf.curses.length : 0}
                    onModify={sel && acc ? () => setEditing(editing?.id === it.id && editing.kind === "generalItems" ? null : { kind: "generalItems", id: it.id }) : undefined}
                    editing={editing?.kind === "generalItems" && editing.id === it.id}
                  />
                );
              })}
            </Grid>
            {editing?.kind === "generalItems" && GENERAL_ITEMS.some((it) => it.group === g && it.id === editing.id) && (() => {
              const it = GENERAL_BY_ID[editing.id]; const conf = find("generalItems", editing.id);
              if (!it || !conf) return null;
              return (
                <ModPanel
                  title={it.name}
                  mods={ACCESSORY_MODS.map((m) => ({ id: m.id, name: m.name, effect: m.effect }))}
                  curses={ACCESSORY_CURSES.map((c) => ({ id: c.id, name: c.name, effect: c.effect, element: c.element }))}
                  selMods={conf.mods}
                  selCurses={conf.curses}
                  onToggleMod={(id) => toggleMod("generalItems", editing!.id, id)}
                  onToggleCurse={(id) => toggleCurse("generalItems", editing!.id, id)}
                  baseCat={it.category}
                  effCat={generalCat(conf)}
                  addModBlocked={addModReason("generalItems", conf)}
                  addCurseBlocked={addCurseReason("generalItems", conf)}
                />
              );
            })()}
          </div>
        ))}
      </Section>

      {/* Identidade */}
      <Section title="Identidade (opcional)">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Aparência" value={data.background.appearance} onChange={(v) => onChange({ background: { ...data.background, appearance: v } })} placeholder="Como o agente se parece?" />
          <Field label="Personalidade" value={data.background.personality} onChange={(v) => onChange({ background: { ...data.background, personality: v } })} placeholder="Traços marcantes, manias, valores…" />
          <Field label="História" value={data.background.history} onChange={(v) => onChange({ background: { ...data.background, history: v } })} placeholder="O que aconteceu antes da Ordem?" textarea />
          <Field label="Objetivo" value={data.background.objective} onChange={(v) => onChange({ background: { ...data.background, objective: v } })} placeholder="O que move o agente?" />
        </div>
      </Section>
    </div>
  );
}

/* ── Subcomponentes ── */

function Section({ title, caption, children }: { title: string; caption?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: caption ? 4 : 12 }}>{title}</h3>
      {caption && <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", marginBottom: 12 }}>{caption}</p>}
      {children}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{children}</p>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>{children}</div>;
}

function ItemBtn({
  selected, blocked, onClick, title, titleExtra, sub, category, baseCategory, spaces, modCount, onModify, editing,
}: {
  selected: boolean;
  blocked: string | null;
  onClick: () => void;
  title: string;
  titleExtra?: React.ReactNode;
  sub: string;
  category: number;
  baseCategory: number;
  spaces: number;
  modCount: number;
  onModify?: () => void;
  editing?: boolean;
}) {
  const disabled = !!blocked && !selected;
  const bumped = category !== baseCategory;
  return (
    <div
      style={{
        textAlign: "left", padding: "10px 12px",
        background: selected ? "rgba(255,255,255,0.12)" : "var(--surface)",
        border: `1px solid ${selected ? BORD_SEL : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.12s",
        display: "flex", flexDirection: "column", gap: 4,
      }}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        title={blocked ?? undefined}
        style={{
          all: "unset", cursor: disabled ? "not-allowed" : "pointer",
          display: "flex", flexDirection: "column", gap: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <span style={{ fontSize: "0.84rem", fontWeight: 600, color: selected ? "#ffffff" : "var(--text)" }}>
            {title}{titleExtra}
          </span>
          <span style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <Tag highlight={bumped}>Cat {roman(category)}</Tag>
            <Tag>{spaces} esp</Tag>
          </span>
        </div>
        <span style={{ fontSize: "0.68rem", color: "var(--text-subtle)", lineHeight: 1.45 }}>
          {blocked && !selected ? blocked : sub}
        </span>
      </button>
      {selected && onModify && (
        <button
          onClick={onModify}
          style={{
            marginTop: 4, alignSelf: "flex-start",
            fontSize: "0.66rem", fontWeight: 700,
            padding: "3px 9px", borderRadius: "var(--radius-full)",
            background: editing ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#ffffff", cursor: "pointer",
          }}
        >
          {editing ? "Fechar" : modCount > 0 ? `Modificações (${modCount})` : "Modificar"}
        </button>
      )}
    </div>
  );
}

const ELEM_COLOR: Record<string, string> = {
  Sangue: "#e0524c", Morte: "#9aa0a8", Conhecimento: "#f5c451", Energia: "#9b7ce0", Medo: "#7dd3a8",
};

function ModPanel({
  title, mods, curses, selMods, selCurses, onToggleMod, onToggleCurse, baseCat, effCat,
  addModBlocked, addCurseBlocked,
}: {
  title: string;
  mods: { id: string; name: string; effect: string }[];
  curses: { id: string; name: string; effect: string; element: string }[];
  selMods: string[];
  selCurses: string[];
  onToggleMod: (id: string) => void;
  onToggleCurse: (id: string) => void;
  baseCat: number;
  effCat: number;
  addModBlocked: string | null;   // motivo p/ não poder adicionar mais 1 modificação
  addCurseBlocked: string | null; // motivo p/ não poder adicionar mais 1 maldição
}) {
  return (
    <div style={{
      marginTop: 10, padding: "14px 16px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "var(--radius-lg)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff" }}>Modificar · {title}</span>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          Categoria {roman(baseCat)} → <b style={{ color: effCat !== baseCat ? "#e0843c" : "#ffffff" }}>{roman(effCat)}</b>
        </span>
      </div>

      {(addModBlocked || addCurseBlocked) && (
        <p style={{ fontSize: "0.68rem", color: "#e0843c", marginBottom: 10 }}>
          ⚠ {addModBlocked ?? addCurseBlocked} — remova uma modificação ou suba de patente para aplicar mais.
        </p>
      )}

      <GroupLabel>Modificações (+I cada)</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6, marginBottom: 12 }}>
        {mods.map((m) => {
          const on = selMods.includes(m.id);
          const disabled = !on && !!addModBlocked;
          return (
            <button key={m.id} onClick={() => onToggleMod(m.id)} disabled={disabled} title={disabled ? addModBlocked! : m.effect}
              style={chipStyle(on, "rgba(255,255,255,0.55)", disabled)}>
              <span style={{ fontWeight: 700, fontSize: "0.74rem" }}>{m.name}</span>
              <span style={{ fontSize: "0.64rem", color: "var(--text-subtle)", lineHeight: 1.35 }}>{m.effect}</span>
            </button>
          );
        })}
      </div>

      <GroupLabel>Maldições (1ª +II, demais +I)</GroupLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6 }}>
        {curses.map((c) => {
          const on = selCurses.includes(c.id);
          const col = ELEM_COLOR[c.element] ?? "#ffffff";
          const disabled = !on && !!addCurseBlocked;
          return (
            <button key={c.id} onClick={() => onToggleCurse(c.id)} disabled={disabled} title={disabled ? addCurseBlocked! : c.effect}
              style={chipStyle(on, col, disabled)}>
              <span style={{ fontWeight: 700, fontSize: "0.74rem", color: on ? "#ffffff" : col }}>{c.name} <span style={{ fontSize: "0.6rem", color: col }}>· {c.element}</span></span>
              <span style={{ fontSize: "0.64rem", color: "var(--text-subtle)", lineHeight: 1.35 }}>{c.effect}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function chipStyle(on: boolean, accent: string, disabled = false): React.CSSProperties {
  return {
    textAlign: "left", display: "flex", flexDirection: "column", gap: 2,
    padding: "8px 10px", borderRadius: "var(--radius)",
    background: on ? "rgba(255,255,255,0.12)" : "var(--surface)",
    border: `1px solid ${on ? accent : "var(--border)"}`,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "all 0.12s",
  };
}

function Tag({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: "var(--radius-full)", background: highlight ? "rgba(224,132,60,0.18)" : "rgba(255,255,255,0.07)", border: `1px solid ${highlight ? "rgba(224,132,60,0.5)" : "rgba(255,255,255,0.14)"}`, color: highlight ? "#e0843c" : "var(--text-muted)", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Field({
  label, value, onChange, placeholder, textarea,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean;
}) {
  const common = {
    width: "100%", padding: "10px 13px",
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem",
    fontFamily: "inherit", resize: "vertical" as const,
  };
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={common} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={common} />
      )}
    </div>
  );
}
