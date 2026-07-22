"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ATTR_KEYS, ATTR_ABBR, ATTR_LABEL, attrMod, type AttrKey, type TormentaAttrs } from "@/lib/tormenta/data";
import { CLASS_BY_ID } from "@/lib/tormenta/classes";
import { resolveKeyAttribute } from "@/lib/tormenta/creation";
import {
  buildLevelUpPlan, casterProgressionFor, maxCircleAtLevel, computePvMax, computePmMax,
  nextAttributeIncreaseAmount, type ChosenPower,
} from "@/lib/tormenta/leveling";
import { getAvailablePowers, getFeaturesAtLevel, type Power, type PowerCategory } from "@/lib/tormenta/powers/registry";
import { ARMOR_BY_ID, computeTormentaDefense } from "@/lib/tormenta/items";
import { SPELLS } from "@/lib/tormenta/spells";

const ACCENT       = "#a01818";
const ACCENT_LIGHT = "#c94040";
const ACCENT_DIM   = "rgba(160,24,24,0.12)";
const ACCENT_BORD  = "rgba(160,24,24,0.35)";

const CATEGORY_LABEL: Record<PowerCategory | "todos", string> = {
  todos: "Todos", classe: "De Classe", combate: "Combate", destino: "Destino",
  magia: "Magia", tormenta: "Tormenta", concedido: "Concedido",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyChar = any;

function parse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function LevelUpModal({ character, onClose }: { character: AnyChar; onClose: () => void }) {
  const router = useRouter();
  const sheet = character.tormentaSheet;
  const cls = CLASS_BY_ID[sheet.className];
  const plan = buildLevelUpPlan(cls.id, sheet.path, sheet.level);

  const [powerId, setPowerId] = useState<string | null>(null);
  const [attrKey, setAttrKey] = useState<AttrKey | null>(null);
  const [category, setCategory] = useState<PowerCategory | "todos">("classe");
  const [spellPicks, setSpellPicks] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingPowers: ChosenPower[] = parse(sheet.powers, []);
  const spellsKnown: string[] = parse(sheet.spellsKnown, []);
  const schoolsChosen: string[] = parse(sheet.schoolsChosen, []);
  const equipment: string[] = parse(sheet.equipment, []);

  if (!plan) {
    return (
      <Overlay onClose={onClose}>
        <h2 style={titleStyle}>Nível máximo</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.86rem" }}>Este herói já alcançou o 20º nível — o auge do poder em Arton.</p>
        <button onClick={onClose} style={primaryBtn}>Fechar</button>
      </Overlay>
    );
  }

  const currentAttrs: TormentaAttrs = { for: sheet.forca, des: sheet.des, con: sheet.con, int: sheet.int, sab: sheet.sab, car: sheet.car };
  const available = getAvailablePowers(cls.id);
  const chosenPower = available.find((p) => p.id === powerId) ?? null;
  const isAttrIncrease = chosenPower?.special === "attribute-increase";
  const attrAmount = attrKey ? nextAttributeIncreaseAmount(existingPowers, attrKey) : null;

  const newAttrs: TormentaAttrs = { ...currentAttrs };
  if (isAttrIncrease && attrKey && attrAmount) newAttrs[attrKey] = newAttrs[attrKey] + attrAmount;

  const conMod = attrMod(newAttrs.con);
  const spellKeyAttr = resolveKeyAttribute(cls.id, sheet.path);
  const keyAttrMod = spellKeyAttr ? attrMod(newAttrs[spellKeyAttr]) : 0;
  const newPvMax = computePvMax(cls.id, plan.toLevel, conMod);
  const newPmMax = computePmMax(cls.id, plan.toLevel, keyAttrMod);
  const dPv = newPvMax - sheet.pvMax;
  const dPm = newPmMax - sheet.pmMax;

  const armorId = equipment.find((e) => ARMOR_BY_ID[e]?.category === "leve" || ARMOR_BY_ID[e]?.category === "pesada") ?? null;
  const shieldId = equipment.find((e) => ARMOR_BY_ID[e]?.category === "escudo") ?? null;
  const newDefense = computeTormentaDefense(attrMod(newAttrs.des), armorId, shieldId);
  const dDefense = newDefense - sheet.defense;

  const fixedFeatures = getFeaturesAtLevel(cls.id, plan.toLevel);

  const prog = cls.spellcasting ? casterProgressionFor(cls) : null;
  const maxCircle = prog ? maxCircleAtLevel(prog, plan.toLevel) : 1;
  const eligibleSpells = useMemo(() => {
    if (!cls.spellcasting || plan.spellsGained === 0) return [];
    return SPELLS.filter((s) =>
      s.tradition === cls.spellcasting!.tradition &&
      s.circle <= maxCircle &&
      (!cls.spellcasting!.schoolChoiceCount || schoolsChosen.includes(s.school)) &&
      !spellsKnown.includes(s.id),
    );
  }, [cls, maxCircle, plan.spellsGained, schoolsChosen, spellsKnown]);

  const ownedIds = new Set(existingPowers.map((p) => p.id));
  const categories: (PowerCategory | "todos")[] = ["todos", "classe", "combate", "destino", "magia", "tormenta", "concedido"];
  const visiblePowers = available.filter((p) => {
    if (category !== "todos" && p.category !== category) return false;
    if (p.special === "attribute-increase") return true;
    const repeatable = /várias vezes|quantas vezes|outras vezes/i.test(p.description);
    return repeatable || !ownedIds.has(p.id);
  });

  const powerOK = !!chosenPower && (!isAttrIncrease || !!attrKey);
  const spellsOK = spellPicks.length === plan.spellsGained;
  const canConfirm = powerOK && spellsOK && !saving;

  async function confirm() {
    if (!chosenPower) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/tormenta/characters/${character.id}/levelup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ powerId: chosenPower.id, attrKey: isAttrIncrease ? attrKey : undefined, newSpells: spellPicks }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Erro ao salvar.");
      }
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
      setSaving(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h2 style={titleStyle}>Subir de Nível · {cls.name}</h2>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: ACCENT, fontFamily: "var(--font-cinzel), serif" }}>
          {plan.fromLevel}º → {plan.toLevel}º
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <Delta label="PV" value={newPvMax} delta={dPv} color="#c03030" />
        <Delta label="PM" value={newPmMax} delta={dPm} color={ACCENT} />
        <Delta label="Defesa" value={newDefense} delta={dDefense} color="#c9941f" />
      </div>

      {fixedFeatures.length > 0 && (
        <Group label="Características automáticas deste nível" hint="Concedidas automaticamente, sem escolha.">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {fixedFeatures.map((f) => (
              <div key={f.name} style={{ ...cardBtn(true), cursor: "default" }}>
                <p style={{ fontSize: "0.84rem", fontWeight: 700, color: ACCENT }}>{f.name}</p>
                <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5, marginTop: 3 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </Group>
      )}

      {plan.circleUnlocked && (
        <p style={{ fontSize: "0.8rem", color: ACCENT_LIGHT, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", padding: "8px 12px" }}>
          ✦ {plan.circleUnlocked}º círculo de magia desbloqueado!
        </p>
      )}

      <Group label="Escolha de Poder" hint='Um poder da sua classe ou "Poder Geral" (Combate/Destino/Magia/Tormenta/Concedido) — você pode sempre trocar um poder de classe por um geral.'>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
          {categories.map((c) => (
            <FilterChip key={c} label={CATEGORY_LABEL[c]} on={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8, maxHeight: 300, overflowY: "auto" }}>
          {visiblePowers.map((p) => {
            const on = powerId === p.id;
            return (
              <button key={p.id} onClick={() => { setPowerId(p.id); if (p.special !== "attribute-increase") setAttrKey(null); }} style={cardBtn(on)}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: on ? ACCENT_LIGHT : "var(--text)" }}>{p.name}</p>
                {p.prerequisite !== "—" && <p style={{ fontSize: "0.64rem", color: "#c9941f", marginTop: 2 }}>Pré-req: {p.prerequisite}</p>}
                <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", lineHeight: 1.45, marginTop: 3 }}>{p.description}</p>
              </button>
            );
          })}
          {visiblePowers.length === 0 && <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Nenhum poder nesta categoria.</p>}
        </div>
      </Group>

      {isAttrIncrease && (
        <Group label={`Atributo (+${attrAmount ?? 2})`} hint="Escolha o atributo que recebe o aumento.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
            {ATTR_KEYS.map((k) => {
              const on = attrKey === k;
              const amt = nextAttributeIncreaseAmount(existingPowers, k);
              return (
                <button key={k} onClick={() => setAttrKey(k)} style={{ ...cardBtn(on), textAlign: "center" }}>
                  <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", fontWeight: 700 }}>{ATTR_ABBR[k]}</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: 800, color: on ? ACCENT_LIGHT : "var(--text)", fontFamily: "var(--font-cinzel), serif" }}>
                    {currentAttrs[k]}{on ? `→${currentAttrs[k] + amt}` : ""}
                  </p>
                  <p style={{ fontSize: "0.56rem", color: "var(--text-subtle)" }}>{ATTR_LABEL[k]} (+{amt})</p>
                </button>
              );
            })}
          </div>
        </Group>
      )}

      {plan.spellsGained > 0 && (
        <Group label={`Magias Novas (${spellPicks.length}/${plan.spellsGained})`} hint={`Escolha entre magias de até o ${maxCircle}º círculo que você pode lançar.`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
            {eligibleSpells.map((sp) => {
              const on = spellPicks.includes(sp.id);
              const full = spellPicks.length >= plan.spellsGained && !on;
              return (
                <button key={sp.id} disabled={full} onClick={() => setSpellPicks(on ? spellPicks.filter((x) => x !== sp.id) : [...spellPicks, sp.id])}
                  style={{ ...cardBtn(on), opacity: full ? 0.5 : 1, cursor: full ? "default" : "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: on ? ACCENT_LIGHT : "var(--text)" }}>{sp.name}</span>
                    <span style={{ fontSize: "0.66rem", color: "var(--text-subtle)" }}>{sp.school} · {sp.circle}º</span>
                  </div>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginTop: 2 }}>{sp.description}</p>
                </button>
              );
            })}
            {eligibleSpells.length === 0 && <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Nenhuma magia nova elegível.</p>}
          </div>
        </Group>
      )}

      {error && <p style={{ fontSize: "0.8rem", color: "#ff6b6b" }}>{error}</p>}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <button onClick={onClose} style={ghostBtn}>Cancelar</button>
        <button onClick={confirm} disabled={!canConfirm} style={{ ...primaryBtn, opacity: canConfirm ? 1 : 0.45, cursor: canConfirm ? "pointer" : "default" }}>
          {saving ? "Aplicando…" : `Confirmar Nível ${plan.toLevel}`}
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(3,5,10,0.78)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 780, background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: "24px 26px", display: "flex", flexDirection: "column", gap: 18, boxShadow: "0 24px 70px rgba(0,0,0,0.6)" }}>
        {children}
      </div>
    </div>
  );
}

function Group({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</p>
        {hint && <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 2 }}>{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Delta({ label, value, delta, color }: { label: string; value: number; delta: number; color: string }) {
  return (
    <div style={{ textAlign: "center", padding: "10px 8px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
      <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", fontWeight: 700 }}>{label}</p>
      <p style={{ fontSize: "1.3rem", fontWeight: 800, color, fontFamily: "var(--font-cinzel), serif" }}>{value}</p>
      <p style={{ fontSize: "0.68rem", color: delta > 0 ? "#5fbf7f" : "var(--text-subtle)", fontWeight: 700 }}>{delta > 0 ? `+${delta}` : "—"}</p>
    </div>
  );
}

function FilterChip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: "4px 11px", fontSize: "0.72rem", fontWeight: 600, background: on ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${on ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-full)", color: on ? ACCENT_LIGHT : "var(--text-muted)", cursor: "pointer" }}>
      {label}
    </button>
  );
}

function cardBtn(on: boolean): React.CSSProperties {
  return {
    textAlign: "left", padding: "10px 12px",
    background: on ? ACCENT_DIM : "var(--surface-2)",
    border: `1px solid ${on ? ACCENT_BORD : "var(--border)"}`,
    borderRadius: "var(--radius-lg)", cursor: "pointer", transition: "all 0.12s",
    display: "flex", flexDirection: "column", gap: 0,
  };
}

const titleStyle: React.CSSProperties = { fontFamily: "var(--font-cinzel), serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" };
const primaryBtn: React.CSSProperties = {
  padding: "10px 22px", borderRadius: "var(--radius-lg)", background: ACCENT_DIM,
  border: `1px solid ${ACCENT_BORD}`, color: ACCENT_LIGHT, fontWeight: 700, fontSize: "0.88rem",
  fontFamily: "inherit", boxShadow: `0 0 16px ${ACCENT_DIM}`,
};
const ghostBtn: React.CSSProperties = {
  padding: "10px 22px", borderRadius: "var(--radius-lg)", background: "var(--surface-2)",
  border: "1px solid var(--border)", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.88rem", fontFamily: "inherit", cursor: "pointer",
};
