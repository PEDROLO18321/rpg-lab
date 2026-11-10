"use client";

import { useState, type ReactNode } from "react";
import { ARMORS, ARMORS_MAP, BULLETPROOF_SHIELD, type ArmorDef } from "@/lib/cyberpunk/armor";
import { CYBERWARE, CYBERWARE_MAP, CYBER_CATEGORY_LABEL, type CyberCategory } from "@/lib/cyberpunk/cyberware";
import { COMPLETE_PACKAGE_FASHION_EB, ROLE_KITS, getSkillDef, type KitEntry } from "@/lib/cyberpunk/data";
import { BASIC_AMMO, GEAR, GEAR_MAP, GRENADES, SPECIAL_AMMO } from "@/lib/cyberpunk/gear";
import { humanityMax as calcHumanityMax } from "@/lib/cyberpunk/rules";
import { WEAPONS, WEAPONS_MAP } from "@/lib/cyberpunk/weapons";
import { CP, SectionTitle, dangerBtn, inputStyle, labelStyle, pillBtn } from "../../ui";
import { Field } from "@/components/ui/Field";
import {
  chargenHumanity, equipmentBudget, equipmentCost, resolveEquipment, resolveKitOnly, type WizardData,
} from "../wizardModel";

interface Props {
  data: WizardData;
  onChange: (p: Partial<WizardData>) => void;
}

// ─── Catálogo ────────────────────────────────────────────────────────────────

type Kind = "weapon" | "gear" | "cyber";
type TabId = "weapons" | "armor" | "cyber" | "gear";

interface Item {
  kind: Kind;
  key: string;
  name: string;
  group: string;
  cost: number;
  stats: string[];
  desc: string;
  /** Perda de Humanidade fixa da criação (só ciberware). */
  hl?: number;
  requires?: string;
}

const eb = (n: number) => `${n.toLocaleString("pt-BR")} eb`;

const WEAPON_GROUP: Record<string, string> = { melee: "Corpo a corpo", ranged: "Longo alcance", exotic: "Exóticas", blackChrome: "Black Chrome" };
const WEAPON_GROUP_ORDER = ["melee", "ranged", "exotic", "blackChrome"];

const WEAPON_ITEMS: Item[] = [...WEAPONS]
  .sort((a, b) => WEAPON_GROUP_ORDER.indexOf(a.group) - WEAPON_GROUP_ORDER.indexOf(b.group))
  .map((w) => ({
    kind: "weapon", key: w.key, name: w.name, group: WEAPON_GROUP[w.group], cost: w.cost,
    stats: [w.damage, getSkillDef(w.skill)?.name ?? w.skill, `${w.hands} mão${w.hands > 1 ? "s" : ""}`, ...(w.concealable ? ["oculta"] : [])],
    desc: w.notes,
  }));

const GEAR_ITEMS: Item[] = [
  ...GEAR.map((g) => ({ g, group: "Equipamento" })),
  ...BASIC_AMMO.map((g) => ({ g, group: "Munição" })),
  ...SPECIAL_AMMO.map((g) => ({ g, group: "Munição" })),
  ...GRENADES.map((g) => ({ g, group: "Granadas" })),
].map(({ g, group }) => ({ kind: "gear", key: g.key, name: g.name, group, cost: g.cost, stats: [], desc: g.desc }));

const CYBER_ITEMS: Item[] = [...CYBERWARE]
  .sort((a, b) => a.category.localeCompare(b.category))
  .map((c) => ({
    kind: "cyber", key: c.key, name: c.name, group: CYBER_CATEGORY_LABEL[c.category as CyberCategory], cost: c.cost,
    stats: [`HL ${c.hl}`], desc: c.desc, hl: c.hl, requires: c.requires,
  }));

const CATALOG: Record<Exclude<TabId, "armor">, Item[]> = { weapons: WEAPON_ITEMS, gear: GEAR_ITEMS, cyber: CYBER_ITEMS };

const TABS: { id: TabId; label: string }[] = [
  { id: "weapons", label: "Armas" },
  { id: "armor", label: "Armadura" },
  { id: "cyber", label: "Ciberware" },
  { id: "gear", label: "Equipamento" },
];

const PAGE = 30;

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function keyName(key: string): string {
  return WEAPONS_MAP[key]?.name ?? GEAR_MAP[key]?.name ?? (key === "bulletproofShield" ? BULLETPROOF_SHIELD.name : key);
}

// ─── Passo ───────────────────────────────────────────────────────────────────

export function StepEquipment({ data, onChange }: Props) {
  const complete = data.method === "complete";
  const [tab, setTab] = useState<TabId>("weapons");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const budget = equipmentBudget(data);
  const spent = equipmentCost(data);
  const remaining = budget - spent;
  const kitOnly = resolveKitOnly(data);

  function add(item: Item) {
    if (item.cost > remaining) return;
    if (item.kind === "weapon") onChange({ weapons: [...data.weapons, item.key] });
    else if (item.kind === "cyber") onChange({ cyberware: [...data.cyberware, item.key] });
    else {
      const i = data.gear.findIndex((g) => g.key === item.key);
      onChange({ gear: i < 0 ? [...data.gear, { key: item.key, qty: 1 }] : data.gear.map((g, j) => (j === i ? { ...g, qty: g.qty + 1 } : g)) });
    }
  }

  function changeTab(t: TabId) {
    setTab(t);
    setQuery("");
    setLimit(PAGE);
  }

  /** Por que o item não pode entrar agora; `null` quando pode. */
  function blockReason(item: Item): string | null {
    if (item.kind === "cyber") {
      if (data.cyberware.includes(item.key)) return "Já no carrinho";
      if (resolveEquipment(data).cyberware.includes(item.key)) return "Já no kit";
    }
    if (item.cost > remaining) return "Saldo insuficiente";
    return null;
  }

  const list = tab === "armor" ? [] : CATALOG[tab];
  const q = normalize(query.trim());
  const filtered = q ? list.filter((i) => normalize(`${i.name} ${i.group} ${i.desc}`).includes(q)) : list;
  const shown = filtered.slice(0, limit);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle
        eyebrow="Passo 5" title="Equipamento e ciberware"
        desc={complete
          ? `No Pacote Completo você compra tudo com ${eb(budget)} (livro, p.104). O que sobrar fica como dinheiro na ficha. Existem ${eb(COMPLETE_PACKAGE_FASHION_EB)} à parte só para roupas e modaware: eles não entram neste carrinho e o que não for gasto se perde.`
          : `O kit do papel é fixo e grátis. Além dele você tem ${eb(budget)} para comprar o que quiser ou guardar (livro, p.98); o que sobrar vira dinheiro na ficha.`}
      />

      {!complete && <KitPanel data={data} onChange={onChange} />}

      <div className="cp-shop-mobilebar" style={{ display: "none" }}>
        <Balance budget={budget} spent={spent} remaining={remaining} compact />
      </div>

      <div className="cp-shop-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
        <section aria-label="Catálogo" style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div role="tablist" aria-label="Categorias" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button
                key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => changeTab(t.id)}
                style={{
                  ...pillBtn, minHeight: 36, padding: "6px 14px",
                  background: tab === t.id ? CP.accentDim : "var(--surface)",
                  borderColor: tab === t.id ? CP.accentBord : "var(--border)",
                  color: tab === t.id ? CP.accentLight : "var(--text)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "armor" ? (
            <ArmorSlots data={data} onChange={onChange} remaining={remaining} kitOnly={kitOnly} complete={complete} />
          ) : (
            <>
              <input
                type="search" aria-label={`Buscar em ${TABS.find((t) => t.id === tab)?.label}`} placeholder="Buscar pelo nome…"
                value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }} style={inputStyle}
              />
              {filtered.length === 0 && <p style={{ fontSize: "0.8rem", color: CP.textSubtle }}>Nada encontrado.</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {shown.map((item, i) => (
                  <div key={`${item.kind}-${item.key}`} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(i === 0 || shown[i - 1].group !== item.group) && (
                      <p style={{ fontSize: "0.66rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.08em", margin: "6px 0 0" }}>{item.group}</p>
                    )}
                    <ItemRow item={item} reason={blockReason(item)} onAdd={() => add(item)} />
                  </div>
                ))}
              </div>
              {filtered.length > shown.length && (
                <button type="button" onClick={() => setLimit((n) => n + PAGE)} style={{ ...pillBtn, alignSelf: "center", minHeight: 36 }}>
                  Mostrar mais ({filtered.length - shown.length})
                </button>
              )}
            </>
          )}
        </section>

        <Cart data={data} onChange={onChange} budget={budget} spent={spent} remaining={remaining} kitHl={chargenHumanity({ ...data, weapons: [], gear: [], cyberware: [] })} />
      </div>
    </div>
  );
}

// ─── Linha do catálogo ───────────────────────────────────────────────────────

function ItemRow({ item, reason, onAdd }: { item: Item; reason: string | null; onAdd: () => void }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", minWidth: 0 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)", overflowWrap: "anywhere" }}>{item.name}</p>
        {item.stats.length > 0 && (
          <p style={{ fontSize: "0.7rem", color: CP.accentLight, fontWeight: 700, marginTop: 2 }}>{item.stats.join(" · ")}</p>
        )}
        {item.desc && (
          <p style={{ fontSize: "0.7rem", color: CP.textMuted, lineHeight: 1.45, marginTop: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.desc}</p>
        )}
        {item.requires && CYBERWARE_MAP[item.requires] && (
          <p style={{ fontSize: "0.66rem", color: CP.warn, marginTop: 2 }}>Requer {CYBERWARE_MAP[item.requires].name}</p>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <b style={{ fontSize: "0.8rem", fontFamily: "var(--font-cinzel), serif", whiteSpace: "nowrap" }}>{eb(item.cost)}</b>
        <button
          type="button" onClick={onAdd} disabled={!!reason}
          aria-label={reason ? `Adicionar ${item.name}: ${reason}` : `Adicionar ${item.name}`}
          title={reason ?? undefined}
          style={{ ...pillBtn, minHeight: 32, padding: "4px 14px", background: reason ? "var(--surface-2)" : CP.accentDim, borderColor: reason ? "var(--border)" : CP.accentBord, color: reason ? CP.textSubtle : CP.accentLight, cursor: reason ? "default" : "pointer" }}
        >
          Adicionar
        </button>
        {reason && <span style={{ fontSize: "0.62rem", color: reason === "Saldo insuficiente" ? CP.danger : CP.textSubtle, whiteSpace: "nowrap" }}>{reason}</span>}
      </div>
    </div>
  );
}

// ─── Armadura: dois espaços alinhados e o escudo ─────────────────────────────

function ArmorSlots({ data, onChange, remaining, kitOnly, complete }: {
  data: WizardData; onChange: (p: Partial<WizardData>) => void; remaining: number;
  kitOnly: ReturnType<typeof resolveKitOnly>; complete: boolean;
}) {
  const kitHasShield = kitOnly.shield;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="cp-armor-slots" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <ArmorSlot
          label="Cabeça" slot="head" value={data.armorHead} kitKey={kitOnly.armorHead} complete={complete} remaining={remaining}
          onChange={(v) => onChange({ armorHead: v })}
        />
        <ArmorSlot
          label="Corpo" slot="body" value={data.armorBody} kitKey={kitOnly.armorBody} complete={complete} remaining={remaining}
          onChange={(v) => onChange({ armorBody: v })}
        />
      </div>

      <button
        type="button" aria-pressed={kitHasShield || data.shield}
        disabled={kitHasShield || (!data.shield && BULLETPROOF_SHIELD.cost > remaining)}
        onClick={() => onChange({ shield: !data.shield })}
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", textAlign: "left", fontFamily: "inherit", minHeight: 52,
          background: kitHasShield || data.shield ? CP.accentDim : "var(--surface)",
          border: `1px solid ${kitHasShield || data.shield ? CP.accentBord : "var(--border)"}`,
          borderRadius: "var(--radius)", color: "var(--text)",
          cursor: kitHasShield || (!data.shield && BULLETPROOF_SHIELD.cost > remaining) ? "default" : "pointer",
          opacity: !kitHasShield && !data.shield && BULLETPROOF_SHIELD.cost > remaining ? 0.6 : 1,
        }}
      >
        <span aria-hidden style={{ width: 22, height: 22, borderRadius: 4, border: `2px solid ${CP.accentBord}`, background: kitHasShield || data.shield ? CP.accent : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#0b0614", fontSize: "0.8rem", fontWeight: 900 }}>
          {kitHasShield || data.shield ? "✓" : ""}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: "0.84rem", fontWeight: 700 }}>{BULLETPROOF_SHIELD.name}</span>
          <span style={{ display: "block", fontSize: "0.7rem", color: CP.textMuted }}>
            {BULLETPROOF_SHIELD.hp} HP, absorve o dano antes de você · {kitHasShield ? "incluído no kit" : eb(BULLETPROOF_SHIELD.cost)}
            {!kitHasShield && !data.shield && BULLETPROOF_SHIELD.cost > remaining ? " · Saldo insuficiente" : ""}
          </span>
        </span>
      </button>

      {data.armorHead && data.armorBody && (
        <p style={{ fontSize: "0.72rem", color: CP.textMuted }}>A PA não soma entre camadas: vale a maior de cada local. A penalidade de REF/DES/MOV vem da pior peça, uma vez só.</p>
      )}
    </div>
  );
}

function ArmorSlot({ label, slot, value, kitKey, complete, remaining, onChange }: {
  label: string; slot: "head" | "body"; value: string; kitKey: string; complete: boolean; remaining: number; onChange: (v: string) => void;
}) {
  const options = ARMORS.filter((a) => a.slots.includes(slot));
  const kit = kitKey ? ARMORS_MAP[kitKey] : undefined;
  const current: ArmorDef | undefined = (value ? ARMORS_MAP[value] : undefined) ?? kit;
  const currentCost = value ? ARMORS_MAP[value]?.cost ?? 0 : 0;
  const noneLabel = complete ? "Nenhuma" : kit ? `Do kit: ${kit.name} (grátis)` : "Nenhuma";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", minWidth: 0 }}>
      <Field label={label} style={labelStyle}>
        <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
          <option value="">{noneLabel}</option>
          {options.map((a) => {
            const blocked = a.key !== value && a.cost > remaining + currentCost;
            return (
              <option key={a.key} value={a.key} disabled={blocked}>
                {a.name} · PA {a.sp} · {eb(a.cost)}{blocked ? " · saldo insuficiente" : ""}
              </option>
            );
          })}
        </select>
      </Field>
      {current ? (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Stat label="PA" value={String(current.sp)} />
          <Stat label="Penalidade" value={current.penalty === 0 ? "0" : String(current.penalty)} warn={current.penalty < 0} />
          <Stat label="Custo" value={value ? eb(current.cost) : "grátis"} />
        </div>
      ) : (
        <p style={{ fontSize: "0.74rem", color: CP.textSubtle }}>Sem armadura neste local.</p>
      )}
      {current?.notes && <p style={{ fontSize: "0.68rem", color: CP.textMuted, lineHeight: 1.4 }}>{current.notes}</p>}
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <span style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: "0.58rem", fontWeight: 700, color: CP.textSubtle, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <b style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.95rem", color: warn ? CP.warn : "var(--text)" }}>{value}</b>
    </span>
  );
}

// ─── Carrinho ────────────────────────────────────────────────────────────────

interface CartLine {
  id: string;
  name: string;
  detail?: string;
  qty?: number;
  total: number;
  /** Custo de mais uma unidade; sem saldo, o "+" fica desabilitado. */
  unit?: number;
  setQty?: (q: number) => void;
  remove: () => void;
}

function Cart({ data, onChange, budget, spent, remaining, kitHl }: {
  data: WizardData; onChange: (p: Partial<WizardData>) => void; budget: number; spent: number; remaining: number; kitHl: number;
}) {
  const weaponCount = new Map<string, number>();
  for (const k of data.weapons) weaponCount.set(k, (weaponCount.get(k) ?? 0) + 1);

  const sections: { title: string; lines: CartLine[] }[] = [
    {
      title: "Armas",
      lines: [...weaponCount].map(([key, qty]) => ({
        id: `w-${key}`, name: keyName(key), qty, unit: WEAPONS_MAP[key]?.cost ?? 0, total: (WEAPONS_MAP[key]?.cost ?? 0) * qty,
        setQty: (n: number) => onChange({ weapons: [...data.weapons.filter((k) => k !== key), ...Array<string>(n).fill(key)] }),
        remove: () => onChange({ weapons: data.weapons.filter((k) => k !== key) }),
      })),
    },
    {
      title: "Armadura",
      lines: [
        ...(data.armorHead && ARMORS_MAP[data.armorHead] ? [{ id: "a-head", name: `${ARMORS_MAP[data.armorHead].name} (cabeça)`, detail: `PA ${ARMORS_MAP[data.armorHead].sp}`, total: ARMORS_MAP[data.armorHead].cost, remove: () => onChange({ armorHead: "" }) }] : []),
        ...(data.armorBody && ARMORS_MAP[data.armorBody] ? [{ id: "a-body", name: `${ARMORS_MAP[data.armorBody].name} (corpo)`, detail: `PA ${ARMORS_MAP[data.armorBody].sp}`, total: ARMORS_MAP[data.armorBody].cost, remove: () => onChange({ armorBody: "" }) }] : []),
        ...(data.shield && !resolveKitOnly(data).shield ? [{ id: "a-shield", name: BULLETPROOF_SHIELD.name, detail: `${BULLETPROOF_SHIELD.hp} HP`, total: BULLETPROOF_SHIELD.cost, remove: () => onChange({ shield: false }) }] : []),
      ],
    },
    {
      title: "Ciberware",
      lines: data.cyberware.map((key, i) => {
        const c = CYBERWARE_MAP[key];
        return { id: `c-${key}-${i}`, name: c?.name ?? key, detail: `HL ${c?.hl ?? 0}`, total: c?.cost ?? 0, remove: () => onChange({ cyberware: data.cyberware.filter((_, j) => j !== i) }) };
      }),
    },
    {
      title: "Equipamento",
      lines: data.gear.map((g) => ({
        id: `g-${g.key}`, name: GEAR_MAP[g.key]?.name ?? g.key, qty: g.qty, unit: GEAR_MAP[g.key]?.cost ?? 0, total: (GEAR_MAP[g.key]?.cost ?? 0) * g.qty,
        setQty: (n: number) => onChange({ gear: data.gear.map((x) => (x.key === g.key ? { ...x, qty: n } : x)) }),
        remove: () => onChange({ gear: data.gear.filter((x) => x.key !== g.key) }),
      })),
    },
  ];
  const empty = sections.every((s) => s.lines.length === 0);

  // Humanidade: o que o kit já cobrou mais o que o carrinho acrescentou.
  const cartHl = data.cyberware.reduce((n, k) => n + (CYBERWARE_MAP[k]?.hl ?? 0), 0);
  const totalHl = chargenHumanity(data);
  const hasStats = !!data.stats;
  const humMax = data.stats ? calcHumanityMax(data.stats.emp) : null;
  const hum = humMax === null ? null : humMax - totalHl;
  const emp = hum === null ? null : Math.max(0, Math.floor(hum / 10));

  const owned = resolveEquipment(data).cyberware;
  const missing = data.cyberware
    .map((k) => CYBERWARE_MAP[k])
    .filter((c) => c?.requires && !owned.includes(c.requires))
    .map((c) => `${c.name} requer ${CYBERWARE_MAP[c.requires!]?.name ?? c.requires}`);

  return (
    <aside className="cp-shop-cart" aria-label="Carrinho" style={{ position: "sticky", top: 72, maxHeight: "calc(100vh - 170px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, padding: 14, background: "var(--surface)", border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius)", minWidth: 0 }}>
      <p style={{ fontSize: "0.74rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Carrinho</p>

      {empty ? (
        <p style={{ fontSize: "0.78rem", color: CP.textSubtle }}>Nada escolhido ainda. Use “Adicionar” no catálogo.</p>
      ) : (
        sections.filter((s) => s.lines.length > 0).map((s) => (
          <div key={s.title} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ fontSize: "0.64rem", fontWeight: 800, color: CP.textSubtle, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.title}</p>
            {s.lines.map((l) => <CartRow key={l.id} line={l} remaining={remaining} />)}
          </div>
        ))
      )}

      <Balance budget={budget} spent={spent} remaining={remaining} />

      <div style={{ paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 4, fontSize: "0.78rem" }}>
        <Row label="Perda de Humanidade" value={`−${totalHl}`} detail={cartHl > 0 || kitHl > 0 ? `kit −${kitHl}, carrinho −${cartHl}` : undefined} />
        {hasStats && hum !== null && humMax !== null && emp !== null ? (
          <>
            <Row label="Humanidade resultante" value={`${hum} / ${humMax}`} tone={hum < 0 ? "danger" : undefined} />
            <Row label="EMP resultante" value={`${emp}`} detail={`era ${data.stats!.emp}`} tone={hum < 0 ? "danger" : undefined} />
            {hum < 0 && <p style={{ fontSize: "0.7rem", color: CP.danger }}>Humanidade abaixo de zero: ciberpsicose.</p>}
          </>
        ) : (
          <p style={{ fontSize: "0.7rem", color: CP.textSubtle }}>Defina os atributos para ver Humanidade e EMP.</p>
        )}
        {missing.map((m) => <p key={m} style={{ fontSize: "0.7rem", color: CP.warn }}>{m}.</p>)}
      </div>
    </aside>
  );
}

function CartRow({ line, remaining }: { line: CartLine; remaining: number }) {
  const canPlus = line.unit !== undefined && line.unit <= remaining;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", minWidth: 0 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, overflowWrap: "anywhere", minWidth: 0 }}>
          {line.name}{line.detail && <span style={{ color: CP.accentLight, fontWeight: 700 }}> · {line.detail}</span>}
        </span>
        <button type="button" onClick={line.remove} aria-label={`Remover ${line.name}`} style={{ ...dangerBtn, minHeight: 28, minWidth: 32, padding: "0 8px" }}>×</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        {line.qty !== undefined && line.setQty ? (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button type="button" onClick={() => line.setQty!(line.qty! - 1)} disabled={line.qty <= 1} aria-label={`Diminuir quantidade de ${line.name}`} style={{ ...pillBtn, minHeight: 32, minWidth: 32, padding: 0 }}>−</button>
            <b style={{ minWidth: 22, textAlign: "center", fontSize: "0.84rem" }}>{line.qty}</b>
            <button type="button" onClick={() => line.setQty!(line.qty! + 1)} disabled={!canPlus} aria-label={`Aumentar quantidade de ${line.name}`} title={canPlus ? undefined : "Saldo insuficiente"} style={{ ...pillBtn, minHeight: 32, minWidth: 32, padding: 0, opacity: canPlus ? 1 : 0.4 }}>+</button>
          </span>
        ) : <span />}
        <b style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>{eb(line.total)}</b>
      </div>
    </div>
  );
}

function Row({ label, value, detail, tone }: { label: string; value: string; detail?: string; tone?: "danger" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span style={{ color: CP.textMuted }}>{label}</span>
      <span style={{ textAlign: "right" }}>
        <b style={{ color: tone === "danger" ? CP.danger : "var(--text)" }}>{value}</b>
        {detail && <span style={{ display: "block", fontSize: "0.64rem", color: CP.textSubtle }}>{detail}</span>}
      </span>
    </div>
  );
}

/** Subtotal, orçamento e saldo. Vermelho quando zera: não dá para comprar mais nada. */
function Balance({ budget, spent, remaining, compact }: { budget: number; spent: number; remaining: number; compact?: boolean }) {
  const none = remaining <= 0;
  const body: ReactNode = (
    <>
      <Row label="Subtotal" value={eb(spent)} />
      <Row label="Orçamento" value={eb(budget)} />
      <Row label="Saldo restante" value={eb(remaining)} tone={none ? "danger" : undefined} />
    </>
  );
  return (
    <div
      role="status" aria-label="Saldo"
      style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", padding: compact ? "10px 12px" : "10px 0 0", borderTop: compact ? undefined : "1px solid var(--border)", ...(compact ? { background: "var(--surface)", border: `1px solid ${none ? "rgba(239,107,107,0.5)" : CP.accentBord}`, borderRadius: "var(--radius)" } : null) }}
    >
      {body}
    </div>
  );
}

// ─── Kit do papel ────────────────────────────────────────────────────────────

/** Kit fixo do livro, agrupado; as linhas com "ou" ganham um seletor. */
function KitPanel({ data, onChange }: { data: WizardData; onChange: (p: Partial<WizardData>) => void }) {
  const kit = ROLE_KITS[data.role];
  const kitHl = kit.cyberware.reduce((n, e, i) => n + (CYBERWARE_MAP[data.kitSel[`cyberware:${i}`] ?? e.key]?.hl ?? 0), 0);
  return (
    <div style={{ padding: 14, background: "var(--surface)", border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius)", display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: "0.74rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Kit do papel · grátis</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 14 }}>
        <KitGroup title="Armas" cat="weapons" entries={kit.weapons} data={data} onChange={onChange} />
        <KitGroup title="Armadura" cat="armor" entries={kit.armor} data={data} onChange={onChange} />
        <KitGroup title={`Ciberware · perda de Humanidade −${kitHl}`} cat="cyberware" entries={kit.cyberware} data={data} onChange={onChange} />
        <KitGroup title="Equipamento" cat="gear" entries={kit.gear} data={data} onChange={onChange} />
      </div>
      <p style={{ fontSize: "0.72rem", color: CP.textMuted }}>Roupas: {kit.fashion}</p>
    </div>
  );
}

function KitGroup({ title, cat, entries, data, onChange }: {
  title: string; cat: string; entries: KitEntry[]; data: WizardData; onChange: (p: Partial<WizardData>) => void;
}) {
  const name = (k: string) => {
    if (cat === "cyberware") { const c = CYBERWARE_MAP[k]; return c ? `${c.name} · HL ${c.hl}` : k; }
    if (cat === "armor") { const a = ARMORS_MAP[k]; return a ? `${a.name} · PA ${a.sp}` : BULLETPROOF_SHIELD.name; }
    return keyName(k);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <p style={{ fontSize: "0.66rem", fontWeight: 800, color: CP.textSubtle, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</p>
      {entries.map((e, i) => {
        const sel = data.kitSel[`${cat}:${i}`] ?? e.key;
        return (
          <div key={`${cat}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "0.8rem", minWidth: 0 }}>
            {e.alt ? (
              <select aria-label="Escolha uma das opções do kit" value={sel} onChange={(ev) => onChange({ kitSel: { ...data.kitSel, [`${cat}:${i}`]: ev.target.value } })} style={{ ...inputStyle, width: "auto", maxWidth: "100%", minWidth: 0 }}>
                {[e.key, ...e.alt].map((k) => <option key={k} value={k}>{name(k)}</option>)}
              </select>
            ) : <span style={{ overflowWrap: "anywhere" }}>{name(e.key)}{(e.qty ?? 1) > 1 && <b style={{ color: CP.accentLight }}> {cat === "armor" ? "(cabeça e corpo)" : `×${e.qty}`}</b>}</span>}
            {e.alt && <span style={{ fontSize: "0.68rem", color: CP.textSubtle }}>(ou)</span>}
          </div>
        );
      })}
    </div>
  );
}
