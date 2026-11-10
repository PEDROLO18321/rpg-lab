"use client";

import { useState } from "react";
import { ARMORS, ARMORS_MAP, BULLETPROOF_SHIELD } from "@/lib/cyberpunk/armor";
import { CYBERWARE, CYBERWARE_MAP, CYBER_CATEGORY_LABEL, type CyberCategory } from "@/lib/cyberpunk/cyberware";
import { COMPLETE_PACKAGE_GEAR_EB, ROLE_KITS, STARTING_EUROBUCKS_STREETRAT, type KitEntry } from "@/lib/cyberpunk/data";
import { ALL_GEAR, GEAR_MAP } from "@/lib/cyberpunk/gear";
import { WEAPONS, WEAPONS_MAP } from "@/lib/cyberpunk/weapons";
import { CP, PrimaryButton, SectionTitle, dangerBtn, inputStyle, labelStyle } from "../../ui";
import { Field } from "@/components/ui/Field";
import { chargenHumanity, equipmentCost, type WizardData } from "../wizardModel";

interface Props {
  data: WizardData;
  onChange: (p: Partial<WizardData>) => void;
}

interface Opt { value: string; label: string; group: string }

const WEAPON_GROUP: Record<string, string> = { melee: "Corpo a corpo", ranged: "Longo alcance", exotic: "Exóticas", blackChrome: "Black Chrome" };
const WEAPON_OPTS: Opt[] = WEAPONS.map((w) => ({ value: w.key, label: `${w.name} · ${w.damage} · ${w.cost} eb`, group: WEAPON_GROUP[w.group] }));
const GEAR_OPTS: Opt[] = ALL_GEAR.map((g) => ({ value: g.key, label: `${g.name} · ${g.cost} eb`, group: "Equipamento" }));
const CYBER_OPTS: Opt[] = CYBERWARE.map((c) => ({ value: c.key, label: `${c.name} · HL ${c.hl} · ${c.cost} eb`, group: CYBER_CATEGORY_LABEL[c.category as CyberCategory] }));
const HEAD_OPTS = ARMORS.filter((a) => a.slots.includes("head"));
const BODY_OPTS = ARMORS.filter((a) => a.slots.includes("body"));

function keyName(key: string): string {
  return WEAPONS_MAP[key]?.name ?? GEAR_MAP[key]?.name ?? (key === "bulletproofShield" ? BULLETPROOF_SHIELD.name : key);
}

export function StepEquipment({ data, onChange }: Props) {
  const complete = data.method === "complete";
  const kit = ROLE_KITS[data.role];
  const cost = equipmentCost(data);
  const hl = chargenHumanity(data);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle
        eyebrow="Passo 5" title="Equipamento e ciberware"
        desc={complete
          ? `No Pacote Completo você compra tudo com ${COMPLETE_PACKAGE_GEAR_EB} eb. O que sobrar vira dinheiro na ficha.`
          : `Nos métodos Streetrat e Edgerunner o kit do papel é grátis e você ainda começa com ${STARTING_EUROBUCKS_STREETRAT} eb. Dá para acrescentar itens por conta própria.`}
      />

      {complete && (
        <p style={{ fontSize: "0.9rem", fontWeight: 700, color: cost > COMPLETE_PACKAGE_GEAR_EB ? CP.danger : CP.success }}>
          Gasto: {cost} eb de {COMPLETE_PACKAGE_GEAR_EB} — sobram {Math.max(0, COMPLETE_PACKAGE_GEAR_EB - cost)} eb
        </p>
      )}

      {!complete && (
        <div style={{ padding: 14, background: "var(--surface)", border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius)", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: "0.74rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Kit do papel</p>
          <KitRows cat="weapons" entries={kit.weapons} data={data} onChange={onChange} />
          <KitRows cat="armor" entries={kit.armor} data={data} onChange={onChange} />
          <KitRows cat="gear" entries={kit.gear} data={data} onChange={onChange} />
          <KitRows cat="cyberware" entries={kit.cyberware} data={data} onChange={onChange} />
          <p style={{ fontSize: "0.72rem", color: CP.textMuted }}>Roupas: {kit.fashion}</p>
        </div>
      )}

      <Block title="Armas">
        <AddPicker options={WEAPON_OPTS} label="Adicionar arma" onAdd={(k) => onChange({ weapons: [...data.weapons, k] })} />
        <Chips items={data.weapons.map((k, i) => ({ id: `${k}-${i}`, text: keyName(k), onRemove: () => onChange({ weapons: data.weapons.filter((_, j) => j !== i) }) }))} />
      </Block>

      <Block title="Armadura">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 12 }}>
          <Field label="Cabeça" style={labelStyle}>
            <select value={data.armorHead} onChange={(e) => onChange({ armorHead: e.target.value })} style={inputStyle}>
              <option value="">{complete ? "Nenhuma" : "Do kit / nenhuma"}</option>
              {HEAD_OPTS.map((a) => <option key={a.key} value={a.key}>{a.name} · PA {a.sp} · {a.cost} eb</option>)}
            </select>
          </Field>
          <Field label="Corpo" style={labelStyle}>
            <select value={data.armorBody} onChange={(e) => onChange({ armorBody: e.target.value })} style={inputStyle}>
              <option value="">{complete ? "Nenhuma" : "Do kit / nenhuma"}</option>
              {BODY_OPTS.map((a) => <option key={a.key} value={a.key}>{a.name} · PA {a.sp} · {a.cost} eb</option>)}
            </select>
          </Field>
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.82rem", minHeight: 28 }}>
          <input type="checkbox" checked={data.shield} onChange={(e) => onChange({ shield: e.target.checked })} />
          {BULLETPROOF_SHIELD.name} ({BULLETPROOF_SHIELD.hp} HP, {BULLETPROOF_SHIELD.cost} eb)
        </label>
        {(data.armorHead && data.armorBody) && ARMORS_MAP[data.armorHead] && ARMORS_MAP[data.armorBody] && (
          <p style={{ fontSize: "0.72rem", color: CP.textMuted }}>A PA não soma entre camadas: vale a maior de cada local.</p>
        )}
      </Block>

      <Block title="Equipamento">
        <AddPicker options={GEAR_OPTS} label="Adicionar item" onAdd={(k) => {
          const i = data.gear.findIndex((g) => g.key === k);
          onChange({ gear: i < 0 ? [...data.gear, { key: k, qty: 1 }] : data.gear.map((g, j) => (j === i ? { ...g, qty: g.qty + 1 } : g)) });
        }} />
        <Chips items={data.gear.map((g) => ({ id: g.key, text: `${GEAR_MAP[g.key]?.name ?? g.key} ×${g.qty}`, onRemove: () => onChange({ gear: data.gear.filter((x) => x.key !== g.key) }) }))} />
      </Block>

      <Block title={`Ciberware (perda de Humanidade na criação: ${hl})`}>
        <AddPicker options={CYBER_OPTS} label="Adicionar ciberware" onAdd={(k) => onChange({ cyberware: [...data.cyberware, k] })} />
        <Chips items={data.cyberware.map((k, i) => ({ id: `${k}-${i}`, text: `${CYBERWARE_MAP[k]?.name ?? k} (HL ${CYBERWARE_MAP[k]?.hl ?? 0})`, onRemove: () => onChange({ cyberware: data.cyberware.filter((_, j) => j !== i) }) }))} />
        <p style={{ fontSize: "0.72rem", color: CP.textMuted }}>Cada peça consome Humanidade fixa agora; depois da criação a perda é rolada.</p>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: "0.74rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</p>
      {children}
    </div>
  );
}

/** Seletor com grupos + botão. Mantém o próprio valor para não competir com o estado do assistente. */
function AddPicker({ options, label, onAdd }: { options: Opt[]; label: string; onAdd: (value: string) => void }) {
  const [value, setValue] = useState("");
  const groups = Array.from(new Set(options.map((o) => o.group)));
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <select aria-label={label} value={value} onChange={(e) => setValue(e.target.value)} style={{ ...inputStyle, flex: "1 1 220px", width: "auto" }}>
        <option value="">{label}…</option>
        {groups.map((g) => (
          <optgroup key={g} label={g}>
            {options.filter((o) => o.group === g).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </optgroup>
        ))}
      </select>
      <PrimaryButton disabled={!value} onClick={() => { onAdd(value); setValue(""); }}>+ Adicionar</PrimaryButton>
    </div>
  );
}

function Chips({ items }: { items: { id: string; text: string; onRemove: () => void }[] }) {
  if (items.length === 0) return <p style={{ fontSize: "0.76rem", color: CP.textSubtle }}>Nada adicionado.</p>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {items.map((it) => (
        <span key={it.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 4px 3px 10px", background: CP.accentDim, border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius-full)", fontSize: "0.76rem", maxWidth: "100%" }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{it.text}</span>
          <button type="button" onClick={it.onRemove} aria-label={`Remover ${it.text}`} style={{ ...dangerBtn, padding: "0 8px", minHeight: 24 }}>×</button>
        </span>
      ))}
    </div>
  );
}

/** Linhas do kit; as que têm "ou" ganham um seletor entre as alternativas. */
function KitRows({ cat, entries, data, onChange }: { cat: string; entries: KitEntry[]; data: WizardData; onChange: (p: Partial<WizardData>) => void }) {
  return (
    <>
      {entries.map((e, i) => {
        const sel = data.kitSel[`${cat}:${i}`] ?? e.key;
        const name = (k: string) => (cat === "cyberware" ? CYBERWARE_MAP[k]?.name : cat === "armor" ? ARMORS_MAP[k]?.name ?? BULLETPROOF_SHIELD.name : keyName(k)) ?? k;
        return (
          <div key={`${cat}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "0.8rem" }}>
            {e.alt ? (
              <select aria-label="Escolha uma das opções do kit" value={sel} onChange={(ev) => onChange({ kitSel: { ...data.kitSel, [`${cat}:${i}`]: ev.target.value } })} style={{ ...inputStyle, width: "auto", maxWidth: "100%" }}>
                {[e.key, ...e.alt].map((k) => <option key={k} value={k}>{name(k)}</option>)}
              </select>
            ) : <span>{name(e.key)}</span>}
            {(e.qty ?? 1) > 1 && <b style={{ color: CP.accentLight }}>×{e.qty}</b>}
            {e.alt && <span style={{ fontSize: "0.68rem", color: CP.textSubtle }}>(ou)</span>}
          </div>
        );
      })}
    </>
  );
}
