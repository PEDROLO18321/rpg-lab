"use client";

import { useState } from "react";
import { ARMORS, armorToSheetSlot } from "@/lib/cyberpunk/armor";
import {
  BODY_CRITICALS, HEAD_CRITICALS, getCriticalByKey, rollCriticalInjury, type CritLocation,
} from "@/lib/cyberpunk/criticalInjuries";
import { SKILLS_MAP } from "@/lib/cyberpunk/data";
import { applyDamage, effectiveSp } from "@/lib/cyberpunk/rules";
import { WEAPONS, WEAPONS_MAP } from "@/lib/cyberpunk/weapons";
import { SheetShell } from "@/components/sheet/SheetShell";
import { SheetSection } from "@/components/sheet/SheetSection";
import { Field } from "@/components/ui/Field";
import { CP, PrimaryButton, dangerBtn, inputStyle, labelStyle, pillBtn } from "../../ui";
import { autoModifier, skillLabel, type ArmorSlot, type SheetInjury, type SheetWeapon, type TabProps } from "../sheetModel";

type SlotKey = "head" | "body" | "shield";
const SLOT_LABEL: Record<SlotKey, string> = { head: "Cabeça", body: "Corpo", shield: "Escudo (HP)" };

export function CombatTab({ sh, patch, roll, rollDamage }: TabProps) {
  const [dv, setDv] = useState("");
  const [pick, setPick] = useState("");
  const [dmg, setDmg] = useState(0);
  const [loc, setLoc] = useState<CritLocation>("body");
  const [melee, setMelee] = useState(false);
  const [crit, setCrit] = useState(false);
  const [ignore, setIgnore] = useState(false);
  const [lastApplied, setLastApplied] = useState<string | null>(null);
  const [critPick, setCritPick] = useState("");

  const dvNum = dv.trim() === "" ? null : Number(dv);
  const owned = sh.criticalInjuries.map((c) => c.key);

  function attack(w: SheetWeapon) {
    const def = SKILLS_MAP[w.skill];
    const stat = def?.stat ?? "ref";
    if (w.mag !== null && (w.ammo ?? 0) > 0) updateWeapon(w.id, { ammo: (w.ammo ?? 0) - 1 });
    roll(`Ataque · ${w.name}`, sh[stat], sh.skills[w.skill] ?? 0, { modifier: autoModifier(sh, stat), dv: dvNum });
  }

  function updateWeapon(id: string, p: Partial<SheetWeapon>) {
    patch({ weapons: sh.weapons.map((w) => (w.id === id ? { ...w, ...p } : w)) });
  }

  function addWeapon() {
    const w = WEAPONS_MAP[pick];
    if (!w) return;
    patch({
      weapons: [...sh.weapons, {
        id: crypto.randomUUID(), name: w.name, skill: w.skill, damage: w.damage, rof: w.rof, mag: w.mag, ammo: w.mag,
        hands: w.hands, concealable: w.concealable, quality: w.quality, notes: w.notes,
      }],
    });
    setPick("");
  }

  function setSlot(slot: SlotKey, value: ArmorSlot | undefined) {
    const armor = { ...sh.armor };
    if (value) armor[slot] = value; else delete armor[slot];
    patch({ armor });
  }

  function equip(slot: "head" | "body", key: string) {
    const a = ARMORS.find((x) => x.key === key);
    if (a) setSlot(slot, armorToSheetSlot(a));
  }

  // Cálculo de dano recebido. O local "cabeça" já implica tiro mirado.
  const slot = sh.armor[loc];
  const calc = applyDamage({
    sp: slot?.sp ?? 0, damage: dmg, melee, headshot: loc === "head",
    crackedSkull: owned.includes("crackedSkull"), critical: crit, ignoreArmor: ignore,
  });

  function applyIncoming() {
    if (dmg <= 0 && !crit) return;
    const hp = Math.max(0, sh.hpCurrent - calc.damageTaken);
    const p: Parameters<typeof patch>[0] = { hpCurrent: hp };
    if (slot && calc.newSp !== slot.sp) p.armor = { ...sh.armor, [loc]: { ...slot, sp: calc.newSp } };
    let msg = `−${calc.damageTaken} HP${calc.newSp !== (slot?.sp ?? 0) ? ` · PA ${slot?.sp} → ${calc.newSp}` : ""}`;
    if (crit) {
      const inj = rollCriticalInjury(loc, owned);
      p.criticalInjuries = [...sh.criticalInjuries, { id: crypto.randomUUID(), key: inj.key, name: inj.name, location: inj.location, effect: inj.effect }];
      msg += ` · Ferimento crítico: ${inj.name}`;
    }
    patch(p);
    setLastApplied(msg);
    setCrit(false);
  }

  function addInjury(key: string) {
    const c = getCriticalByKey(key);
    if (!c || owned.includes(key)) return;
    patch({ criticalInjuries: [...sh.criticalInjuries, { id: crypto.randomUUID(), key: c.key, name: c.name, location: c.location, effect: c.effect }] });
    setCritPick("");
  }

  function removeInjury(i: SheetInjury) {
    patch({ criticalInjuries: sh.criticalInjuries.filter((x) => x.id !== i.id) });
  }

  const left = (
    <>
      <SheetSection
        title="Armas" accent
        action={
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "var(--text-muted)" }}>
            DV
            <input type="number" aria-label="DV do alvo" value={dv} placeholder="—" onChange={(e) => setDv(e.target.value)} style={{ ...inputStyle, width: 64, minHeight: 30, padding: "4px 8px" }} />
          </label>
        }
      >
        {sh.weapons.length === 0 && <p style={{ fontSize: "0.82rem", color: CP.textSubtle }}>Nenhuma arma. Adicione abaixo.</p>}
        {sh.weapons.map((w) => {
          const def = SKILLS_MAP[w.skill];
          const level = sh.skills[w.skill] ?? 0;
          const base = (def ? sh[def.stat] : 0) + level;
          const empty = w.mag !== null && (w.ammo ?? 0) <= 0;
          return (
            <div key={w.id} style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem" }}>{w.name}</p>
                  <p style={{ fontSize: "0.7rem", color: CP.textMuted }}>
                    {w.damage} · ROF {w.rof} · {def ? skillLabel(w.skill) : w.skill} {base} · {w.hands} mão(s){w.quality !== "standard" ? ` · ${w.quality === "poor" ? "ruim" : "excelente"}` : ""}
                  </p>
                  {w.notes && <p style={{ fontSize: "0.68rem", color: CP.textSubtle, marginTop: 2 }}>{w.notes}</p>}
                </div>
                {w.mag !== null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: "0.74rem", color: empty ? CP.danger : "var(--text)", fontWeight: 700 }}>{w.ammo ?? 0}/{w.mag}</span>
                    <button type="button" onClick={() => updateWeapon(w.id, { ammo: w.mag })} style={pillBtn}>Recarregar</button>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button type="button" onClick={() => attack(w)} disabled={empty} style={{ ...pillBtn, color: CP.accentLight, borderColor: CP.accentBord, background: CP.accentDim, opacity: empty ? 0.5 : 1 }}>🎯 Atacar</button>
                <button type="button" onClick={() => rollDamage(`Dano · ${w.name}`, w.damage)} style={{ ...pillBtn, color: CP.warn, borderColor: "rgba(240,180,41,0.4)" }}>🎲 Dano {w.damage}</button>
                <button type="button" onClick={() => patch({ weapons: sh.weapons.filter((x) => x.id !== w.id) })} aria-label={`Remover ${w.name}`} style={dangerBtn}>×</button>
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select aria-label="Adicionar arma" value={pick} onChange={(e) => setPick(e.target.value)} style={{ ...inputStyle, flex: "1 1 200px", width: "auto" }}>
            <option value="">Adicionar arma…</option>
            {WEAPONS.map((w) => <option key={w.key} value={w.key}>{w.name} · {w.damage}</option>)}
          </select>
          <PrimaryButton onClick={addWeapon} disabled={!pick}>+ Adicionar</PrimaryButton>
        </div>
      </SheetSection>

      <SheetSection title="Armadura (PA por local)">
        {(["head", "body", "shield"] as SlotKey[]).map((k) => {
          const a = sh.armor[k];
          return (
            <div key={k} style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.66rem", fontWeight: 800, color: CP.accentLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>{SLOT_LABEL[k]}</p>
                  <p style={{ fontSize: "0.84rem", fontWeight: 600 }}>{a ? a.name : "Sem proteção"}{a && a.penalty < 0 && <span style={{ color: CP.warn, fontSize: "0.7rem" }}> · {a.penalty} REF/DES/MOV</span>}</p>
                </div>
                {a && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button type="button" onClick={() => setSlot(k, { ...a, sp: Math.max(0, a.sp - 1) })} aria-label={`Menos 1 em ${SLOT_LABEL[k]}`} style={{ ...pillBtn, width: 30, padding: 0 }}>−</button>
                    <b style={{ minWidth: 44, textAlign: "center", color: a.sp < a.spMax ? CP.warn : "var(--text)" }}>{a.sp}/{a.spMax}</b>
                    <button type="button" onClick={() => setSlot(k, { ...a, sp: Math.min(a.spMax, a.sp + 1) })} aria-label={`Mais 1 em ${SLOT_LABEL[k]}`} style={{ ...pillBtn, width: 30, padding: 0 }}>+</button>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {k !== "shield" && (
                  <select aria-label={`Equipar ${SLOT_LABEL[k]}`} value="" onChange={(e) => equip(k, e.target.value)} style={{ ...inputStyle, flex: "1 1 160px", width: "auto", minHeight: 30, padding: "4px 8px" }}>
                    <option value="">Trocar armadura…</option>
                    {ARMORS.filter((x) => x.slots.includes(k)).map((x) => <option key={x.key} value={x.key}>{x.name} · PA {x.sp}</option>)}
                  </select>
                )}
                {a && <button type="button" onClick={() => setSlot(k, { ...a, sp: a.spMax })} style={pillBtn}>Reparar</button>}
                {a && <button type="button" onClick={() => setSlot(k, undefined)} aria-label={`Remover ${SLOT_LABEL[k]}`} style={dangerBtn}>×</button>}
              </div>
            </div>
          );
        })}
        <p style={{ fontSize: "0.72rem", color: CP.textMuted, lineHeight: 1.5 }}>
          A PA não soma entre camadas e cai 1 cada vez que um ataque a atravessa. A penalidade de REF/DES/MOV vem da pior peça.
        </p>
      </SheetSection>
    </>
  );

  const right = (
    <>
      <SheetSection title="Receber dano" accent>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <Field label="Dano rolado" style={labelStyle}>
              <input type="number" min={0} value={dmg} onChange={(e) => setDmg(Math.max(0, parseInt(e.target.value) || 0))} style={inputStyle} />
            </Field>
          </div>
          <div>
            <Field label="Local atingido" style={labelStyle}>
              <select value={loc} onChange={(e) => setLoc(e.target.value as CritLocation)} style={inputStyle}>
                <option value="body">Corpo</option>
                <option value="head">Cabeça (×2 no que passa)</option>
              </select>
            </Field>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: "0.78rem" }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center", minHeight: 28 }}><input type="checkbox" checked={melee} onChange={(e) => setMelee(e.target.checked)} /> Arma branca (metade da PA)</label>
          <label style={{ display: "flex", gap: 6, alignItems: "center", minHeight: 28 }}><input type="checkbox" checked={crit} onChange={(e) => setCrit(e.target.checked)} /> Crítico (dois 6)</label>
          <label style={{ display: "flex", gap: 6, alignItems: "center", minHeight: 28 }}><input type="checkbox" checked={ignore} onChange={(e) => setIgnore(e.target.checked)} /> Ignora armadura</label>
        </div>
        <div style={{ padding: "10px 12px", background: CP.accentDim, border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius)", fontSize: "0.8rem", lineHeight: 1.7 }}>
          PA do local: <b>{slot?.sp ?? 0}</b>{melee && !ignore && <> (efetiva <b>{effectiveSp(slot?.sp ?? 0, true)}</b>)</>}<br />
          Atravessa: <b>{calc.throughArmor}</b>{loc === "head" && calc.throughArmor > 0 && <> × {owned.includes("crackedSkull") ? 3 : 2}</>}{crit && <> + 5 (crítico)</>}<br />
          Dano ao HP: <b style={{ color: CP.danger, fontSize: "1rem" }}>{calc.damageTaken}</b>
          {calc.newSp !== (slot?.sp ?? 0) && <> · PA fica em <b>{calc.newSp}</b></>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <PrimaryButton onClick={applyIncoming} disabled={dmg <= 0 && !crit}>Aplicar dano</PrimaryButton>
          {lastApplied && <span style={{ fontSize: "0.76rem", color: CP.warn }}>{lastApplied}</span>}
        </div>
      </SheetSection>

      <SheetSection title={`Ferimentos críticos (${sh.criticalInjuries.length})`}>
        {sh.criticalInjuries.length === 0 && <p style={{ fontSize: "0.82rem", color: CP.textSubtle }}>Nenhum ferimento crítico.</p>}
        {sh.criticalInjuries.map((i) => (
          <div key={i.id} style={{ padding: "8px 10px", background: "var(--surface-2)", border: "1px solid rgba(239,107,107,0.3)", borderRadius: "var(--radius)", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: "0.84rem", color: CP.danger }}>{i.name} <span style={{ fontWeight: 400, color: CP.textSubtle, fontSize: "0.68rem" }}>({i.location === "head" ? "cabeça" : "corpo"})</span></p>
              <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{i.effect}</p>
            </div>
            <button type="button" onClick={() => removeInjury(i)} style={pillBtn} title="Marcar como curado">Curado</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <select aria-label="Adicionar ferimento crítico" value={critPick} onChange={(e) => addInjury(e.target.value)} style={{ ...inputStyle, flex: "1 1 160px", width: "auto" }}>
            <option value="">Registrar ferimento…</option>
            <optgroup label="Corpo">{BODY_CRITICALS.filter((c) => !owned.includes(c.key)).map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}</optgroup>
            <optgroup label="Cabeça">{HEAD_CRITICALS.filter((c) => !owned.includes(c.key)).map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}</optgroup>
          </select>
        </div>
        <p style={{ fontSize: "0.72rem", color: CP.textMuted, lineHeight: 1.5 }}>
          Alguns ferimentos aumentam a penalidade-base da Salvaguarda contra a Morte; a ficha soma isso sozinha.
        </p>
      </SheetSection>
    </>
  );

  return <SheetShell system="cyberpunk" left={left} right={right} />;
}
