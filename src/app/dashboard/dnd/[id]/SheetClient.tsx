"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { parseJsonField } from "@/lib/characterTransfer";
import { useEscapeKey } from "@/lib/useEscapeKey";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RACES, ABILITY_LABELS } from "@/lib/dnd/races";
import { CLASSES } from "@/lib/dnd/classes";
import { BACKGROUNDS } from "@/lib/dnd/backgrounds";
import { SPELLCASTING } from "@/lib/dnd/spellcasting";
import type { SpellcastingConfig } from "@/lib/dnd/spellcasting";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DeleteCharacterButton } from "@/components/dashboard/DeleteCharacterButton";
import type { AbilityKey } from "@/lib/dnd/races";
import { WEAPONS, ALL_PHB_ITEMS, PICKER_GROUPS } from "@/lib/dnd/items";
import type { PickerGroup } from "@/lib/dnd/items";
import { proficiencyBonus, getMaxSlots, getMulticlassSlots } from "@/lib/dnd/leveling";
// Carregados sob demanda. Todos só aparecem depois de uma ação do usuário — abrir
// o grimório, subir de nível, imprimir, ler o manual —, e cada um arrasta consigo
// uma fatia grande de dados de regra. Estáticos, esse peso entrava no bundle
// inicial da ficha mesmo para quem só queria conferir os PV. O padrão é o mesmo do
// fundo 3D em components/three/ImmersiveBackground.tsx.
const LevelUpButton = dynamic(() => import("@/components/dashboard/LevelUpDialog").then((m) => m.LevelUpButton), { ssr: false, loading: () => null });
const SpellbookPanel = dynamic(() => import("@/components/dashboard/SpellbookPanel").then((m) => m.SpellbookPanel), { ssr: false, loading: () => null });
const DndPrintSheet = dynamic(() => import("./DndPrintSheet").then((m) => m.DndPrintSheet), { ssr: false, loading: () => null });
import { ExportJsonButton } from "@/components/dashboard/ExportJsonButton";
import "../dnd-responsive.css";
import { PlayMode } from "./PlayMode";
import { SheetHeader } from "@/components/sheet/SheetHeader";
import { SheetSaveBar } from "@/components/sheet/SheetSaveBar";
import { SheetShell, SheetVitals } from "@/components/sheet/SheetShell";
import { SheetSection, SheetStat } from "@/components/sheet/SheetSection";
import {
  ABILITIES, ABILITY_SHORT, SKILL_MAP, SAVE_ABILITY, HALF_CASTER_ABILITY, ALIGNMENT_LABELS, CP_VALUE, CURRENCY_LABEL, CURRENCY_COLOR, mod, signed, smallBtn,
  type SheetRow, type SlotState, type DescData,
} from "./sheetShared";

function parseDesc(raw: string | null): DescData {
  if (!raw) return {};
  try {
    const d = JSON.parse(raw);
    return (d && typeof d === "object") ? d : {};
  } catch { return {}; }
}

interface Props {
  characterId: string;
  characterName: string;
  sheet: SheetRow;
  notes: string | null;
  portraitUrl: string | null;
  userName: string;
}

function parseConditions(raw: unknown): string[] {
  const a = parseJsonField<unknown>(raw, []);
  return Array.isArray(a) ? (a as string[]) : [];
}

function parseSlots(raw: unknown, maxPerLevel: Record<string, number>): SlotState {
  const make = (max: number) => Array.from({ length: max }, () => false);
  const empty = Object.fromEntries(Object.entries(maxPerLevel).map(([k, v]) => [k, make(v)]));
  if (raw === null || raw === undefined) return empty;
  try {
    const data = parseJsonField<Record<string, unknown>>(raw, {});
    return Object.fromEntries(
      Object.entries(maxPerLevel).map(([level, max]) => {
        const stored = data[level];
        if (Array.isArray(stored)) return [level, stored.slice(0, max).map(Boolean)];
        // backward compat: old format stored count-used as number
        if (typeof stored === "number") return [level, Array.from({ length: max }, (_, i) => i < stored)];
        return [level, make(max)];
      })
    );
  } catch { return empty; }
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SheetClient({ characterId, characterName, sheet: initial, notes, portraitUrl, userName }: Props) {
  const [mode, setMode] = useState<"ficha" | "jogar" | "editar">("ficha");
  const desc = parseDesc(notes);

  // Mutable play-state
  const [hpCurrent, setHpCurrent] = useState(initial.hpCurrent);
  const [hpTemp,    setHpTemp]    = useState(initial.hpTemp);
  const [hitDiceUsed, setHitDiceUsed] = useState(initial.hitDiceUsed);
  const [dsSuccess, setDsSuccess] = useState(initial.deathSavesSuccess);
  const [dsFailure, setDsFailure] = useState(initial.deathSavesFailure);
  const [inspiration, setInspiration] = useState(initial.inspiration);
  const [conditions, setConditions]   = useState<string[]>(() => parseConditions(initial.conditions));
  const [gp, setGp] = useState(initial.gp);
  const [cp, setCp] = useState(initial.cp);
  const [sp, setSp] = useState(initial.sp);
  const [ep, setEp] = useState(initial.ep);
  const [pp, setPp] = useState(initial.pp);
  const [equipment, setEquipment] = useState(initial.equipment);
  const [spells, setSpells] = useState(initial.spells);

  // Após subir de nível, router.refresh() traz `initial` novo do servidor;
  // re-sincroniza os estados que o level-up altera (magias novas no grimório,
  // PV ganho) sem precisar de F5. patchSheet persiste cada mudança local
  // antes, então o servidor é a fonte de verdade.
  // Ajuste de estado durante o render (padrão oficial do React para "estado
  // derivado de prop que mudou") — evita o render extra de um useEffect.
  const [syncedFrom, setSyncedFrom] = useState(initial);
  if (syncedFrom !== initial) {
    setSyncedFrom(initial);
    setSpells(initial.spells);
    setHpCurrent(initial.hpCurrent);
  }

  // Lib data
  const [raceId, subraceId] = (initial.race ?? "").split("/");
  const race    = RACES.find((r) => r.id === raceId);
  const subrace = race?.subraces.find((s) => s.id === subraceId);
  const clsEntry = initial.classes[0];
  const cls = CLASSES.find((c) => c.id === clsEntry?.className);
  const bg  = BACKGROUNDS.find((b) => b.id === initial.background);
  const raceName = race ? (subrace ? `${race.name} (${subrace.name})` : race.name) : (initial.race ?? "—");

  // Exibição de classe(s): "Guerreiro 3 / Mago 2" para multiclasse, "Guerreiro" para única
  const classDisplay = initial.classes.length > 1
    ? initial.classes
        .map((c) => {
          const cl = CLASSES.find((x) => x.id === c.className);
          return `${cl?.name ?? c.className} ${c.level}`;
        })
        .join(" / ")
    : (cls?.name ?? clsEntry?.className ?? "—");

  const scores: Record<AbilityKey, number> = {
    str: initial.str, dex: initial.dex, con: initial.con,
    int: initial.int, wis: initial.wis, cha: initial.cha,
  };

  const proficientSaves = cls?.savingThrows ?? [];
  const proficientSkills = new Set(initial.skills.filter((s) => s.proficient).map((s) => s.skillName));
  const expertiseSkills  = new Set(initial.skills.filter((s) => s.expertise).map((s) => s.skillName));

  // Espaços de magia: multiclasse usa tabela combinada (PHB p.165)
  const maxSlots: Record<string, number> = initial.classes.length > 1
    ? getMulticlassSlots(initial.classes.map((c) => ({ classId: c.className, level: c.level })))
    : (clsEntry?.className ? getMaxSlots(clsEntry.className, initial.level) : {});

  // Para spellConfig: encontra a primeira classe conjuradora
  const casterEntry = initial.classes.find((c) => {
    return SPELLCASTING[c.className] || Object.keys(getMaxSlots(c.className, c.level)).length > 0;
  });
  const spellConfig: SpellcastingConfig | null = casterEntry?.className
    ? SPELLCASTING[casterEntry.className] ??
      (Object.keys(maxSlots).length > 0
        ? {
            cantripsKnown: 0,
            spellsKnown: 0,
            spellSlots1st: maxSlots["1"] ?? 0,
            ability: HALF_CASTER_ABILITY[casterEntry.className] ?? "Sabedoria",
            type: "prepare",
          }
        : null)
    : null;
  const isCaster = !!spellConfig || Object.keys(maxSlots).length > 0;

  // Atributo de conjuração: escolha salva na ficha sobrepõe o padrão da classe
  const [spellAbility, setSpellAbility] = useState<string>(
    initial.spellAbility ?? spellConfig?.ability ?? "Inteligência"
  );

  // Slot state: must be init after maxSlots is computed
  const [slotsUsed, setSlotsUsed] = useState<SlotState>(() => parseSlots(initial.spellSlotsUsed, maxSlots));

  // ── Derived data for print export ──────────────────────────────────────
  const PROF_BONUS = proficiencyBonus(initial.level);
  const strMod = mod(scores.str);
  const dexMod = mod(scores.dex);
  const spellAbilityMapPrint: Record<string, AbilityKey> = { "Carisma": "cha", "Sabedoria": "wis", "Inteligência": "int" };
  const spellAbilityKeyPrint: AbilityKey = spellAbilityMapPrint[spellAbility] ?? "int";
  const spellAttackBonusPrint = isCaster ? mod(scores[spellAbilityKeyPrint]) + PROF_BONUS : 0;
  const spellSaveDCPrint = isCaster ? 8 + PROF_BONUS + mod(scores[spellAbilityKeyPrint]) : 0;
  const weaponAttacksPrint = equipment
    .filter((e) => e.equipped)
    .flatMap((e) => {
      const w = WEAPONS.find((w) => w.name.toLowerCase() === e.itemName.toLowerCase());
      if (!w) return [];
      const atkMod = w.finesse
        ? Math.max(strMod, dexMod) + PROF_BONUS
        : w.ranged ? dexMod + PROF_BONUS : strMod + PROF_BONUS;
      const dmgMod = w.finesse ? Math.max(strMod, dexMod) : w.ranged ? dexMod : strMod;
      return [{ id: e.id, name: e.itemName, w, atkMod, dmgMod }];
    });
  const slotsUsedCountPrint = Object.fromEntries(
    Object.entries(slotsUsed).map(([lvl, arr]) => [lvl, arr.filter(Boolean).length])
  );
  const hitDieSidesPrint = parseInt((initial.hitDice ?? "d8").replace(/\d*d/, "")) || 8;

  async function patchSheet(data: Record<string, unknown>) {
    await fetch(`/api/dnd/characters/${characterId}/sheet`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <DashboardNav
        userName={userName}
        systemName="D&D 5e"
        systemHref="/dashboard/dnd/jogador"
        backLabel="Meus Personagens"
        accentColor="#c9941f"
        shareCharacterId={characterId}
      />

      <main id="conteudo" className="no-print" style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px 80px" }}>
        <Link href="/dashboard/dnd/jogador" style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
          ← Meus Personagens
        </Link>

        {/* Header */}
        <SheetHeader
          system="dnd"
          initials={cls ? cls.id.slice(0, 3).toUpperCase() : "D&D"}
          portraitUrl={portraitUrl}
          name={characterName}
          subtitle={`${[raceName, classDisplay, bg?.name].filter(Boolean).join(" · ")} · Nível ${initial.level}`}
          mode={mode}
          onMode={(id) => setMode(id as "editar" | "ficha" | "jogar")}
          progression={initial.classes.length > 0 && (
            <LevelUpButton
              characterId={characterId}
              classes={initial.classes}
              raceKey={initial.race ?? ""}
              currentLevel={initial.level}
              scores={scores}
              knownSpellNames={spells.map((s) => s.spellName)}
            />
          )}
          actions={<ExportJsonButton exportUrl={`/api/dnd/characters/${characterId}/export`} characterName={characterName} systemSlug="dnd" />}
        />

        {mode === "editar" ? (
          <EditMode
            characterId={characterId}
            characterName={characterName}
            sheet={initial}
            desc={desc}
            portraitUrl={portraitUrl}
            equipment={equipment}    setEquipment={setEquipment}
            spells={spells}          setSpells={setSpells}
            gp={gp} setGp={setGp}
            cp={cp} setCp={setCp}
            sp={sp} setSp={setSp}
            ep={ep} setEp={setEp}
            pp={pp} setPp={setPp}
            isCaster={isCaster}
            classId={cls?.id ?? null}
            patchSheet={patchSheet}
          />
        ) : mode === "ficha" ? (
          <ViewMode
            characterId={characterId}
            characterName={characterName}
            sheet={initial}
            scores={scores}
            raceName={raceName}
            race={race}
            subrace={subrace}
            cls={cls}
            bg={bg}
            desc={desc}
            portraitUrl={portraitUrl}
            proficientSaves={proficientSaves}
            proficientSkills={proficientSkills}
            hpCurrent={hpCurrent}
            hpTemp={hpTemp}
            gp={gp}
            equipment={equipment}
          />
        ) : (
          <PlayMode
            characterId={characterId}
            sheet={initial}
            scores={scores}
            cls={cls}
            bg={bg}
            proficientSaves={proficientSaves}
            proficientSkills={proficientSkills}
            expertiseSkills={expertiseSkills}
            isCaster={isCaster}
            spellConfig={spellConfig}
            maxSlots={maxSlots}
            spells={spells}            setSpells={setSpells}
            spellAbility={spellAbility} setSpellAbility={setSpellAbility}
            hpCurrent={hpCurrent}    setHpCurrent={setHpCurrent}
            hpTemp={hpTemp}          setHpTemp={setHpTemp}
            hitDiceUsed={hitDiceUsed} setHitDiceUsed={setHitDiceUsed}
            dsSuccess={dsSuccess}    setDsSuccess={setDsSuccess}
            dsFailure={dsFailure}    setDsFailure={setDsFailure}
            inspiration={inspiration} setInspiration={setInspiration}
            conditions={conditions}  setConditions={setConditions}
            slotsUsed={slotsUsed}    setSlotsUsed={setSlotsUsed}
            gp={gp} setGp={setGp}
            cp={cp} setCp={setCp}
            sp={sp} setSp={setSp}
            ep={ep} setEp={setEp}
            pp={pp} setPp={setPp}
            equipment={equipment}    setEquipment={setEquipment}
            patchSheet={patchSheet}
          />
        )}
      </main>

      <DndPrintSheet
        characterName={characterName}
        playerName={userName}
        raceName={raceName}
        classDisplay={classDisplay}
        level={initial.level}
        backgroundName={bg?.name ?? initial.background ?? "—"}
        alignmentLabel={ALIGNMENT_LABELS[initial.alignment ?? ""] ?? initial.alignment ?? "—"}
        xp={initial.xp}
        scores={scores}
        profBonus={PROF_BONUS}
        proficientSaves={proficientSaves}
        proficientSkills={proficientSkills}
        expertiseSkills={expertiseSkills}
        ac={initial.armorClass}
        initiative={initial.initiative}
        speed={initial.speed}
        hpMax={initial.hpMax}
        hpCurrent={hpCurrent}
        hpTemp={hpTemp}
        hitDiceType={`d${hitDieSidesPrint}`}
        hitDiceTotal={initial.level}
        hitDiceAvailable={initial.level - hitDiceUsed}
        deathSavesSuccess={dsSuccess}
        deathSavesFailure={dsFailure}
        inspiration={inspiration}
        weaponAttacks={weaponAttacksPrint}
        equipment={equipment}
        currency={{ cp, sp, ep, gp, pp }}
        features={initial.features}
        armorProficiencies={cls?.armorProficiencies ?? []}
        weaponProficiencies={cls?.weaponProficiencies ?? []}
        toolProficiencies={cls?.toolProficiencies ?? []}
        desc={desc}
        isCaster={isCaster}
        spellAbilityLabel={spellAbility}
        spellSaveDC={spellSaveDCPrint}
        spellAttackBonus={spellAttackBonusPrint}
        maxSlots={maxSlots}
        slotsUsedCount={slotsUsedCountPrint}
        spells={spells}
      />

      <div className="no-print" style={{ position: "fixed", bottom: 28, right: 28, zIndex: 40 }}>
        <DeleteCharacterButton characterId={characterId} characterName={characterName} />
      </div>
    </div>
  );
}

// ── VIEW MODE ─────────────────────────────────────────────────────────────────

interface ViewProps {
  characterId: string;
  characterName: string;
  sheet: SheetRow;
  scores: Record<AbilityKey, number>;
  raceName: string;
  race: ReturnType<typeof RACES.find>;
  subrace: ReturnType<typeof RACES.find> extends undefined ? undefined : unknown;
  cls: ReturnType<typeof CLASSES.find>;
  bg: ReturnType<typeof BACKGROUNDS.find>;
  desc: DescData;
  portraitUrl: string | null;
  proficientSaves: string[];
  proficientSkills: Set<string>;
  hpCurrent: number;
  hpTemp: number;
  gp: number;
  equipment: SheetRow["equipment"];
}

function ViewMode({ characterName, sheet, scores, raceName, race, subrace, cls, bg, desc, portraitUrl, proficientSaves, proficientSkills, hpCurrent, hpTemp, gp, equipment }: ViewProps) {
  const PROF_BONUS = proficiencyBonus(sheet.level);
  const passivePerception = 10 + mod(scores.wis) + (proficientSkills.has("Percepção") ? PROF_BONUS : 0);
  const cantrips = sheet.spells.filter((s) => s.level === 0);
  const spells1  = sheet.spells.filter((s) => s.level > 0);

  const physical = [
    desc.age    && { l: "Idade",  v: desc.age },
    desc.height && { l: "Altura", v: desc.height },
    desc.weight && { l: "Peso",   v: desc.weight },
    desc.eyes   && { l: "Olhos",  v: desc.eyes },
    desc.skin   && { l: "Pele",   v: desc.skin },
    desc.hair   && { l: "Cabelo", v: desc.hair },
  ].filter(Boolean) as { l: string; v: string }[];
  const personality = [
    desc.personalityTrait && { l: "Traço de Personalidade", v: desc.personalityTrait },
    desc.ideal            && { l: "Ideal",                  v: desc.ideal },
    desc.bond             && { l: "Vínculo",                v: desc.bond },
    desc.flaw             && { l: "Fraqueza",               v: desc.flaw },
  ].filter(Boolean) as { l: string; v: string }[];
  const hasIdentity = !!portraitUrl || physical.length > 0 || (desc.languages?.length ?? 0) > 0;

  return (
    <SheetShell
      system="dnd"
      band={
        <SheetVitals>
          <SheetStat label="Pontos de Vida" value={`${hpCurrent}${hpTemp > 0 ? `+${hpTemp}` : ""} / ${sheet.hpMax}`} accent />
          <SheetStat label="Classe de Armadura" value={String(sheet.armorClass)} />
          <SheetStat label="Iniciativa" value={signed(sheet.initiative)} />
          <SheetStat label="Velocidade" value={`${sheet.speed} m`} />
          <SheetStat label="Perc. Passiva" value={String(passivePerception)} />
          <SheetStat label="Bônus Prof." value={`+${PROF_BONUS}`} accent />
        </SheetVitals>
      }
      left={
        <>
          {/* Ability scores */}
          <SheetSection title="Atributos">
            <div className="dnd-attr-view-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {ABILITIES.map((k) => {
                const score = scores[k];
                const m = mod(score);
                return (
                  <div key={k} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "12px 8px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{ABILITY_SHORT[k]}</p>
                    <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{score}</p>
                    <p style={{ fontSize: "0.78rem", fontWeight: 700, color: m >= 0 ? "var(--accent-light)" : "var(--text-muted)", marginTop: 2 }}>{signed(m)}</p>
                    <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", marginTop: 3 }}>{ABILITY_LABELS[k]}</p>
                  </div>
                );
              })}
            </div>
          </SheetSection>

          {/* Saves */}
          <SheetSection title="Testes de Resistência">
            {Object.entries(SAVE_ABILITY).map(([label, key]) => {
              const prof = proficientSaves.includes(label);
              const bonus = mod(scores[key]) + (prof ? PROF_BONUS : 0);
              return <ViewSaveRow key={key} label={label} bonus={bonus} prof={prof} />;
            })}
          </SheetSection>

          {/* Skills */}
          <SheetSection title="Perícias">
            {Object.entries(SKILL_MAP).map(([skill, abilityKey]) => {
              const prof = proficientSkills.has(skill);
              const bonus = mod(scores[abilityKey]) + (prof ? PROF_BONUS : 0);
              return <ViewSaveRow key={skill} label={`${skill} (${ABILITY_SHORT[abilityKey]})`} bonus={bonus} prof={prof} />;
            })}
          </SheetSection>

          {/* Traits */}
          {(race || sheet.classes.length > 0 || bg) && (
            <SheetSection title="Traços & Características">
              {race && <TraitGroup label={`Raça — ${raceName}`} color="#7ec8e3" items={[...(race as { traits: string[] }).traits, ...((subrace as { traits: string[] } | undefined)?.traits ?? [])]} />}
              {sheet.classes.map((ce: { id: string; className: string; level: number }) => {
                const cl = CLASSES.find((c) => c.id === ce.className);
                if (!cl) return null;
                return (
                  <TraitGroup
                    key={ce.id}
                    label={sheet.classes.length > 1 ? `${cl.name} — Nível ${ce.level}` : cl.name}
                    color="#c9941f"
                    items={cl.keyFeatures.filter((f: string) => {
                      const m = f.match(/\((\d+)°\)/);
                      return !m || parseInt(m[1]) <= ce.level;
                    })}
                  />
                );
              })}
              {sheet.features.length > 0 && (
                <TraitGroup
                  label="Adquiridas ao subir de nível"
                  color="#5fbf7f"
                  items={sheet.features.map((f) => `${f.name}${f.source ? ` (${f.source})` : ""} — ${f.description ?? ""}`)}
                />
              )}
              {bg && <TraitGroup label={`Antecedente — ${bg.name}`} color="#e09c5b" items={[`${bg.feature}: ${bg.featureDesc}`]} />}
            </SheetSection>
          )}

          {/* Spells */}
          {(cantrips.length > 0 || spells1.length > 0) && (
            <SheetSection title="Magias">
              {cantrips.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Truques</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {cantrips.map((s) => <SpellTag key={s.id} name={s.spellName} school={s.school} />)}
                  </div>
                </div>
              )}
              {spells1.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Magias de 1° Nível</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {spells1.map((s) => <SpellTag key={s.id} name={s.spellName} school={s.school} />)}
                  </div>
                </div>
              )}
            </SheetSection>
          )}
        </>
      }
      right={
        <>
          {/* Retrato + aparência física */}
          {hasIdentity && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "18px 20px", display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
              {portraitUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={portraitUrl} alt="Retrato" style={{ width: 110, height: 110, objectFit: "cover", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-accent)", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12, minHeight: portraitUrl ? 110 : undefined }}>
                <div>
                  <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>{characterName}</p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {[raceName, cls?.name, bg?.name].filter(Boolean).join(" · ")} · Nível {sheet.level}
                  </p>
                </div>
                {physical.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
                    {physical.map(({ l, v }) => (
                      <div key={l} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "7px 10px" }}>
                        <p style={{ fontSize: "0.56rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</p>
                        <p style={{ fontSize: "0.84rem", color: "var(--text)", marginTop: 2 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                )}
                {(desc.languages?.length ?? 0) > 0 && (
                  <div>
                    <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Idiomas</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {desc.languages!.map((lang) => (
                        <span key={lang} style={{ fontSize: "0.72rem", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>{lang}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment */}
          <SheetSection title="Equipamento">
            {equipment.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {equipment.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{item.itemName}</span>
                    {item.quantity > 1 && <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "1px 6px" }}>×{item.quantity}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Sem itens registrados.</p>
            )}
          </SheetSection>

          {/* Currency */}
          <SheetSection title="Moedas">
            <div className="dnd-currency-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {(["cp","sp","ep","gp","pp"] as const).map((coin) => {
                const value = coin === "gp" ? gp : sheet[coin];
                return (
                  <div key={coin} style={{ background: "var(--surface-2)", border: `1px solid ${CURRENCY_COLOR[coin]}44`, borderRadius: "var(--radius)", padding: "10px 6px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.58rem", fontWeight: 700, color: CURRENCY_COLOR[coin], textTransform: "uppercase", letterSpacing: "0.05em" }}>{CURRENCY_LABEL[coin]}</p>
                    <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginTop: 3 }}>{value}</p>
                  </div>
                );
              })}
            </div>
          </SheetSection>
        </>
      }
      full={
        <>
          {/* Personalidade */}
          {personality.length > 0 && (
            <SheetSection title="Personalidade">
              {personality.map(({ l, v }) => (
                <div key={l} style={{ borderLeft: "3px solid var(--accent)", paddingLeft: 12 }}>
                  <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{l}</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{v}</p>
                </div>
              ))}
            </SheetSection>
          )}

          {/* História */}
          {desc.backstory?.trim() && (
            <SheetSection title="História do Personagem">
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{desc.backstory}</p>
            </SheetSection>
          )}
        </>
      }
    />
  );
}

// ── EDIT MODE (sandbox) ───────────────────────────────────────────────────────

const ALIGN_OPTIONS: { id: string; label: string }[] = Object.entries(ALIGNMENT_LABELS).map(([id, label]) => ({ id, label }));

interface EditProps {
  characterId: string;
  characterName: string;
  sheet: SheetRow;
  desc: DescData;
  portraitUrl: string | null;
  equipment: SheetRow["equipment"]; setEquipment: (v: SheetRow["equipment"]) => void;
  spells: SheetRow["spells"];       setSpells: (v: SheetRow["spells"]) => void;
  gp: number; setGp: (v: number) => void;
  cp: number; setCp: (v: number) => void;
  sp: number; setSp: (v: number) => void;
  ep: number; setEp: (v: number) => void;
  pp: number; setPp: (v: number) => void;
  isCaster: boolean;
  classId: string | null;
  patchSheet: (data: Record<string, unknown>) => Promise<void>;
}

function EditMode({
  characterId, characterName, sheet, desc: initialDesc, portraitUrl: initialPortrait,
  equipment, setEquipment, spells, setSpells,
  gp, setGp, cp, setCp, sp, setSp, ep, setEp, pp, setPp,
  isCaster, classId, patchSheet,
}: EditProps) {
  const router = useRouter();

  const [name, setName] = useState(characterName);
  const [scores, setScores] = useState<Record<AbilityKey, number>>({
    str: sheet.str, dex: sheet.dex, con: sheet.con, int: sheet.int, wis: sheet.wis, cha: sheet.cha,
  });
  const [combat, setCombat] = useState({
    hpMax: sheet.hpMax, hpCurrent: sheet.hpCurrent,
    armorClass: sheet.armorClass, initiative: sheet.initiative,
    speed: sheet.speed, level: sheet.level, xp: sheet.xp,
  });
  const [desc, setDesc] = useState<DescData>(initialDesc);
  const [portrait, setPortrait] = useState<string | null>(initialPortrait);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Item picker state ────────────────────────────────────────────────────
  const [showItemPicker, setShowItemPicker] = useState(false);
  useEscapeKey(showItemPicker, () => setShowItemPicker(false));
  const [itemSearch, setItemSearch] = useState("");
  const [itemPickerGroup, setItemPickerGroup] = useState<PickerGroup>("Tudo");
  const [itemQty, setItemQty] = useState(1);
  const [addingItem, setAddingItem] = useState(false);

  // ── Currency state ───────────────────────────────────────────────────────
  const [goldInput, setGoldInput] = useState("");
  const [goldCurrency, setGoldCurrency] = useState<"gp"|"cp"|"sp"|"ep"|"pp">("gp");
  const [showConvert, setShowConvert] = useState(false);
  const [convertFrom, setConvertFrom] = useState<"cp"|"sp"|"ep"|"gp"|"pp">("gp");
  const [convertTo, setConvertTo]     = useState<"cp"|"sp"|"ep"|"gp"|"pp">("cp");
  const [convertAmt, setConvertAmt]   = useState(1);

  const currencySetters: Record<string, [number, (v: number) => void]> = {
    gp: [gp, setGp], cp: [cp, setCp], sp: [sp, setSp], ep: [ep, setEp], pp: [pp, setPp],
  };

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

  const filteredItems = ALL_PHB_ITEMS.filter((item) => {
    const matchGroup = itemPickerGroup === "Tudo" || item.group === itemPickerGroup;
    const matchSearch = itemSearch === "" || item.name.toLowerCase().includes(itemSearch.toLowerCase());
    return matchGroup && matchSearch;
  });

  function setScore(k: AbilityKey, v: number) {
    setScores((s) => ({ ...s, [k]: v }));
    setSaved(false);
  }
  function setCombatField(k: keyof typeof combat, v: number) {
    setCombat((c) => ({ ...c, [k]: v }));
    setSaved(false);
  }
  function setDescField(k: keyof DescData, v: string) {
    setDesc((d) => ({ ...d, [k]: v }));
    setSaved(false);
  }

  // Redimensiona a imagem escolhida (máx. 400px) e guarda como data URL — sem
  // depender de storage externo; cabe na coluna portraitUrl.
  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const max = 400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        setPortrait(canvas.toDataURL("image/jpeg", 0.85));
        setSaved(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const sheetRes = await fetch(`/api/dnd/characters/${characterId}/sheet`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scores, ...combat }),
      });
      // Preserva languages e quaisquer campos extras do notes original
      const notes = JSON.stringify({ ...initialDesc, ...desc });
      const charRes = await fetch(`/api/dnd/characters/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, notes, portraitUrl: portrait }),
      });
      if (!sheetRes.ok || !charRes.ok) throw new Error("Falha ao salvar.");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "rgba(201,148,31,0.08)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-lg)", padding: "12px 16px" }}>
        <p style={{ fontSize: "0.78rem", color: "var(--accent-light)", fontWeight: 700, marginBottom: 2 }}>⚠️ Atenção: edição manual da ficha</p>
        <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Ao salvar, as informações antigas serão substituídas pelos valores atuais desta tela. Revise com cuidado antes de confirmar, especialmente ajustes manuais, itens, bônus e recursos do personagem.
        </p>
      </div>

      {/* Identidade + retrato */}
      <EditSection label="Identidade">
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 110, height: 110, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-accent)", background: "var(--surface-2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {portrait
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={portrait} alt="Retrato" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: "0.66rem", color: "var(--text-subtle)", textAlign: "center", padding: 8 }}>Sem foto</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} style={{ display: "none" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => fileRef.current?.click()} style={miniBtn}>Trocar foto</button>
              {portrait && <button onClick={() => { setPortrait(null); setSaved(false); }} style={miniBtn}>Remover</button>}
            </div>
            <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", textAlign: "center", lineHeight: 1.4, maxWidth: 130 }}>
              Ideal: imagem quadrada (1:1), ~400×400px. Redimensionada automaticamente.
            </p>
          </div>
          <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 12 }}>
            <EditText label="Nome" value={name} onChange={(v) => { setName(v); setSaved(false); }} />
            <div>
              <p style={editLabelStyle}>Alinhamento</p>
              <select
                value={desc.alignment ?? ""}
                onChange={(e) => setDescField("alignment", e.target.value)}
                style={{ ...editInputStyle, cursor: "pointer" }}
              >
                <option value="">—</option>
                {ALIGN_OPTIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </EditSection>

      {/* Atributos */}
      <EditSection label="Atributos">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {ABILITIES.map((k) => (
            <EditNumber
              key={k}
              label={`${ABILITY_SHORT[k]} · ${ABILITY_LABELS[k]}`}
              value={scores[k]}
              onChange={(v) => setScore(k, v)}
              hint={`mod ${signed(mod(scores[k]))}`}
            />
          ))}
        </div>
      </EditSection>

      {/* Combate / Progressão */}
      <EditSection label="Combate & Progressão">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          <EditNumber label="PV Máximo"   value={combat.hpMax}      onChange={(v) => setCombatField("hpMax", v)} />
          <EditNumber label="PV Atual"    value={combat.hpCurrent}  onChange={(v) => setCombatField("hpCurrent", v)} />
          <EditNumber label="Classe de Armadura" value={combat.armorClass} onChange={(v) => setCombatField("armorClass", v)} />
          <EditNumber label="Iniciativa"  value={combat.initiative} onChange={(v) => setCombatField("initiative", v)} />
          <EditNumber label="Velocidade"  value={combat.speed}      onChange={(v) => setCombatField("speed", v)} />
          <EditNumber label="Nível"       value={combat.level}      onChange={(v) => setCombatField("level", v)} min={1} />
          <EditNumber label="XP"          value={combat.xp}         onChange={(v) => setCombatField("xp", v)} />
        </div>
        <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginTop: 8, lineHeight: 1.5 }}>
          Alterar o Nível aqui não concede recursos automáticos — use &ldquo;Subir de Nível&rdquo; para isso. Este campo é só para correções manuais.
        </p>
      </EditSection>

      {/* Aparência */}
      <EditSection label="Aparência Física">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          <EditText label="Idade"  value={desc.age ?? ""}    onChange={(v) => setDescField("age", v)} />
          <EditText label="Altura" value={desc.height ?? ""} onChange={(v) => setDescField("height", v)} />
          <EditText label="Peso"   value={desc.weight ?? ""} onChange={(v) => setDescField("weight", v)} />
          <EditText label="Olhos"  value={desc.eyes ?? ""}   onChange={(v) => setDescField("eyes", v)} />
          <EditText label="Pele"   value={desc.skin ?? ""}   onChange={(v) => setDescField("skin", v)} />
          <EditText label="Cabelo" value={desc.hair ?? ""}   onChange={(v) => setDescField("hair", v)} />
        </div>
      </EditSection>

      {/* Personalidade */}
      <EditSection label="Personalidade & História">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <EditArea label="Traço de Personalidade" value={desc.personalityTrait ?? ""} onChange={(v) => setDescField("personalityTrait", v)} />
          <EditArea label="Ideal"    value={desc.ideal ?? ""} onChange={(v) => setDescField("ideal", v)} />
          <EditArea label="Vínculo"  value={desc.bond ?? ""}  onChange={(v) => setDescField("bond", v)} />
          <EditArea label="Fraqueza" value={desc.flaw ?? ""}  onChange={(v) => setDescField("flaw", v)} />
          <EditArea label="História" value={desc.backstory ?? ""} onChange={(v) => setDescField("backstory", v)} rows={6} />
        </div>
      </EditSection>

      {/* Inventário */}
      <EditSection label="Inventário">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {equipment.length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)" }}>Nenhum item no inventário.</p>
          ) : equipment.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
              <button
                onClick={() => toggleEquipped(item)}
                style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${item.equipped ? "var(--accent)" : "var(--border)"}`, background: item.equipped ? "var(--accent-dim)" : "transparent", cursor: "pointer", flexShrink: 0 }}
                title={item.equipped ? "Equipado" : "Guardado"}
              />
              <span style={{ flex: 1, fontSize: "0.84rem", color: "var(--text)" }}>{item.itemName}{item.quantity > 1 ? ` ×${item.quantity}` : ""}</span>
              <button onClick={() => removeItem(item.id)} style={{ ...miniBtn, color: "#ff6b6b", borderColor: "#ff6b6b44" }}>✕</button>
            </div>
          ))}
          <button
            onClick={() => setShowItemPicker(true)}
            style={{ padding: "8px 16px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start" }}
          >
            + Adicionar item
          </button>
        </div>
      </EditSection>

      {/* Moedas */}
      <EditSection label="Moedas">
        <div className="dnd-currency-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 10 }}>
          {(["cp","sp","ep","gp","pp"] as const).map((coin) => {
            const [value] = currencySetters[coin];
            return (
              <div key={coin} style={{ background: "var(--surface-2)", border: `1px solid ${CURRENCY_COLOR[coin]}44`, borderRadius: "var(--radius)", padding: "8px 4px", textAlign: "center" }}>
                <p style={{ fontSize: "0.54rem", fontWeight: 700, color: CURRENCY_COLOR[coin], textTransform: "uppercase", letterSpacing: "0.05em" }}>{CURRENCY_LABEL[coin]}</p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{value}</p>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
          <select value={goldCurrency} onChange={(e) => setGoldCurrency(e.target.value as "gp")} style={{ padding: "5px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit" }}>
            {(["cp","sp","ep","gp","pp"] as const).map((c) => <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>)}
          </select>
          <input type="number" value={goldInput} onChange={(e) => setGoldInput(e.target.value)} placeholder="±" onKeyDown={(e) => e.key === "Enter" && adjustCurrency()} style={{ width: 64, padding: "5px 6px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.82rem", fontFamily: "inherit" }} />
          <button onClick={adjustCurrency} style={{ padding: "5px 10px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>OK</button>
        </div>
        <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", marginBottom: 6 }}>Use +N para ganhar, −N para gastar</p>
        <button onClick={() => setShowConvert((v) => !v)} style={{ fontSize: "0.7rem", color: "var(--accent-light)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", paddingLeft: 0, marginBottom: showConvert ? 8 : 0 }}>
          {showConvert ? "▲" : "▼"} Converter moedas
        </button>
        {showConvert && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)" }}>1PL=10PO · 1PO=2PE=10PP=100PC · 1PE=5PP</p>
            <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
              <input type="number" min={1} value={convertAmt} onChange={(e) => setConvertAmt(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 48, padding: "4px 6px", borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.8rem", fontFamily: "inherit" }} />
              <select value={convertFrom} onChange={(e) => setConvertFrom(e.target.value as "gp")} style={{ padding: "4px", borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit" }}>
                {(["cp","sp","ep","gp","pp"] as const).map((c) => <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>)}
              </select>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>→</span>
              <select value={convertTo} onChange={(e) => setConvertTo(e.target.value as "cp")} style={{ padding: "4px", borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.78rem", fontFamily: "inherit" }}>
                {(["cp","sp","ep","gp","pp"] as const).map((c) => <option key={c} value={c}>{CURRENCY_LABEL[c]}</option>)}
              </select>
            </div>
            {convertFrom !== convertTo && (
              <p style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>= {Math.floor((convertAmt * CP_VALUE[convertFrom]) / CP_VALUE[convertTo])} {CURRENCY_LABEL[convertTo]}</p>
            )}
            <button onClick={convertCurrency} disabled={convertFrom === convertTo || currencySetters[convertFrom][0] < convertAmt} style={{ padding: "5px 10px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.76rem", cursor: "pointer", fontFamily: "inherit", opacity: (convertFrom === convertTo || currencySetters[convertFrom][0] < convertAmt) ? 0.4 : 1 }}>
              Converter
            </button>
          </div>
        )}
      </EditSection>

      {/* Magias */}
      {isCaster && (
        <EditSection label="Magias">
          <SpellbookPanel
            characterId={characterId}
            classId={classId}
            spells={spells}
            onSpellAdded={(spell) => setSpells([...spells, spell])}
          />
        </EditSection>
      )}

      <SheetSaveBar onSave={save} saving={saving} saved={saved} error={error} />

      {/* Item Picker Modal */}
      {showItemPicker && (
        <div role="presentation" style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={(e) => { if (e.target === e.currentTarget) setShowItemPicker(false); }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 680, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>Adicionar Item</p>
              <button onClick={() => setShowItemPicker(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
              <input autoFocus value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} placeholder="Buscar item..." style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.88rem", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ padding: "8px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PICKER_GROUPS.map((g) => (
                <button key={g} onClick={() => setItemPickerGroup(g)} style={{ padding: "4px 12px", borderRadius: "var(--radius)", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: itemPickerGroup === g ? "var(--accent-dim)" : "var(--surface-2)", border: `1px solid ${itemPickerGroup === g ? "var(--accent)" : "var(--border)"}`, color: itemPickerGroup === g ? "var(--accent-light)" : "var(--text-muted)" }}>{g}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
              {filteredItems.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", textAlign: "center", padding: "24px 0" }}>Nenhum item encontrado.</p>
              ) : filteredItems.map((item) => {
                const w = WEAPONS.find((w) => w.name === item.name);
                const alreadyHas = equipment.some((e) => e.itemName === item.name);
                return (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
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
                      <button disabled={addingItem} onClick={async () => { await addItemByName(item.name, itemQty); setItemQty(1); }} style={{ padding: "5px 12px", borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--accent)", color: "var(--accent-light)", fontWeight: 700, fontSize: "0.76rem", cursor: addingItem ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: addingItem ? 0.6 : 1 }}>+ Add</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
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
const miniBtn: React.CSSProperties = {
  padding: "5px 10px", borderRadius: "var(--radius)", background: "var(--surface-2)",
  border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.72rem",
  cursor: "pointer", fontFamily: "inherit",
};

function EditSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      {children}
    </div>
  );
}

function EditNumber({ label, value, onChange, hint, min }: { label: string; value: number; onChange: (v: number) => void; hint?: string; min?: number }) {
  const clamp = (v: number) => (min != null ? Math.max(min, v) : v);
  return (
    <div>
      <p style={editLabelStyle}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={() => onChange(clamp(value - 1))} style={smallBtn}>−</button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(clamp(parseInt(e.target.value) || 0))}
          style={{ ...editInputStyle, textAlign: "center", padding: "8px 4px", fontWeight: 700 }}
        />
        <button onClick={() => onChange(clamp(value + 1))} style={smallBtn}>+</button>
      </div>
      {hint && <p style={{ fontSize: "0.64rem", color: "var(--text-subtle)", marginTop: 3, textAlign: "center" }}>{hint}</p>}
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

function EditArea({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <p style={editLabelStyle}>{label}</p>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={{ ...editInputStyle, lineHeight: 1.6, resize: "vertical" }} />
    </div>
  );
}

// ── PLAY MODE ─────────────────────────────────────────────────────────────────

// ── Shared sub-components ─────────────────────────────────────────────────────





function ViewSaveRow({ label, bonus, prof }: { label: string; bonus: number; prof: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 8px", background: prof ? "var(--accent-dim)" : "transparent", border: `1px solid ${prof ? "var(--accent)" : "transparent"}`, borderRadius: "var(--radius)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {prof && <span style={{ fontSize: "0.5rem", color: "var(--accent)" }}>◆</span>}
        <span style={{ fontSize: "0.76rem", color: prof ? "var(--accent-light)" : "var(--text-muted)", fontWeight: prof ? 700 : 400 }}>{label}</span>
      </div>
      <span style={{ fontSize: "0.84rem", fontWeight: 700, color: prof ? "var(--accent-light)" : "var(--text-muted)" }}>{signed(bonus)}</span>
    </div>
  );
}

function TraitGroup({ label, items, color = "var(--text-subtle)" }: { label: string; items: string[]; color?: string }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 12, paddingTop: 2, paddingBottom: 2 }}>
      <p style={{ fontSize: "0.64rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
            <span style={{ color, fontSize: "0.65rem", flexShrink: 0, marginTop: 3 }}>▸</span>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpellTag({ name }: { name: string; school: string | null }) {
  return (
    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-light)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>
      {name}
    </span>
  );
}
