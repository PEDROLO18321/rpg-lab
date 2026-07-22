"use client";

import { RACE_BY_ID } from "@/lib/tormenta/races";
import { CLASS_BY_ID } from "@/lib/tormenta/classes";
import { ORIGIN_BY_ID } from "@/lib/tormenta/origins";
import { GOD_BY_ID } from "@/lib/tormenta/gods";
import { WEAPON_BY_ID, ARMOR_BY_ID } from "@/lib/tormenta/items";
import { SPELLS } from "@/lib/tormenta/spells";
import { ATTR_KEYS, ATTR_LABEL, attrMod, SKILL_BY_ID } from "@/lib/tormenta/data";
import { computeVitals, racialAttrBonus, resolveClassFixedSkills, resolveKeyAttribute } from "@/lib/tormenta/creation";
import { computeTormentaDefense } from "@/lib/tormenta/items";
import type { WizardData } from "../CharacterWizard";
import { ACCENT_LIGHT, ACCENT_DIM, ACCENT_BORD } from "../CharacterWizard";
import { Intro } from "./Intro";

export function StepReview({ data }: { data: Partial<WizardData> }) {
  const race = data.raceId ? RACE_BY_ID[data.raceId] : undefined;
  const cls = data.classId ? CLASS_BY_ID[data.classId] : undefined;
  const origin = data.originId ? ORIGIN_BY_ID[data.originId] : undefined;
  const god = data.godId ? GOD_BY_ID[data.godId] : undefined;

  if (!race || !cls || !origin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Intro title="Revisão" text="Complete os passos anteriores para ver o resumo do seu herói." />
      </div>
    );
  }

  const base = ATTR_KEYS.reduce((acc, k) => ({ ...acc, [k]: data.attrBases?.[k] ?? 10 }), {} as Record<string, number>);
  const bonus = racialAttrBonus(data.raceId!, data.raceVariantId ?? null, data.racialAttrChoices ?? []);
  const finalAttrs = ATTR_KEYS.reduce((acc, k) => ({ ...acc, [k]: Math.max(3, base[k] + (bonus[k] ?? 0)) }), {} as Record<string, number>);

  const conMod = attrMod(finalAttrs.con);
  const desMod = attrMod(finalAttrs.des);
  const spellKeyAttr = resolveKeyAttribute(cls.id, data.pathId);
  const keyAttrMod = spellKeyAttr ? attrMod(finalAttrs[spellKeyAttr]) : 0;
  const vitals = computeVitals(cls.id, conMod, keyAttrMod);
  const defense = computeTormentaDefense(desMod, data.armorId || null, data.shieldId || null);

  const classFixed = resolveClassFixedSkills(cls.id, data.classFixedChoice ?? {});
  const trainedSkills = new Set([...classFixed, ...(data.classSkillChoices ?? []), ...(data.originSkillChoices ?? []), ...(data.intBonusSkillChoices ?? [])]);

  const weapon = data.weaponId ? WEAPON_BY_ID[data.weaponId] : undefined;
  const armor = data.armorId ? ARMOR_BY_ID[data.armorId] : undefined;
  const shield = data.shieldId ? ARMOR_BY_ID[data.shieldId] : undefined;
  const spells = (data.selectedSpells ?? []).map((id) => SPELLS.find((s) => s.id === id)).filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro title="Revisão" text="Confira tudo antes de criar seu herói." />

      <div style={{ background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", fontWeight: 700, color: ACCENT_LIGHT }}>{data.charName || "Sem nome"}</h3>
          <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginTop: 4 }}>
            {race.icon} {race.name} · {cls.icon} {cls.name} · {origin.name}{god ? ` · Devoto de ${god.name}` : ""}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Stat label="PV" value={`${vitals.pvMax}`} />
          <Stat label="PM" value={`${vitals.pmMax}`} />
          <Stat label="Defesa" value={`${defense}`} />
          <Stat label="Deslocamento" value={`${race.speed}m`} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 8 }}>
          {ATTR_KEYS.map((k) => (
            <Stat key={k} label={ATTR_LABEL[k]} value={`${finalAttrs[k]} (${attrMod(finalAttrs[k]) >= 0 ? "+" : ""}${attrMod(finalAttrs[k])})`} />
          ))}
        </div>

        <div>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Perícias treinadas</p>
          <p style={{ fontSize: "0.82rem", color: "var(--text)" }}>{Array.from(trainedSkills).map((id) => SKILL_BY_ID[id]?.name ?? id).join(", ") || "—"}</p>
        </div>

        {spells.length > 0 && (
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Magias conhecidas</p>
            <p style={{ fontSize: "0.82rem", color: "var(--text)" }}>{spells.map((s) => s!.name).join(", ")}</p>
          </div>
        )}

        <div>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Equipamento</p>
          <p style={{ fontSize: "0.82rem", color: "var(--text)" }}>
            {[weapon?.name, armor?.name, shield?.name].filter(Boolean).join(", ") || "—"} · {origin.items}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "8px 14px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-lg)", minWidth: 80 }}>
      <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: ACCENT_LIGHT }}>{value}</p>
    </div>
  );
}
