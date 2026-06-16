"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildLevelUpPlan,
  ABILITY_MAX,
  spellChoicesOnLevelUp,
  maxSpellLevelAt,
  MULTICLASS_PROFICIENCIES,
  checkMulticlassPrereqs,
} from "@/lib/dnd/leveling";
import type { LevelFeature } from "@/lib/dnd/leveling";
import { SPELLS, SCHOOL_COLORS, spellClassKey, SPELLCASTING } from "@/lib/dnd/spells";
import { CLASSES } from "@/lib/dnd/classes";
import { ABILITY_LABELS } from "@/lib/dnd/races";
import type { AbilityKey } from "@/lib/dnd/races";

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

const GREEN        = "#5fbf7f";
const GREEN_DIM    = "rgba(95,191,127,0.12)";
const GREEN_BORDER = "rgba(95,191,127,0.45)";

interface Summary {
  newLevel: number;
  hpGain: number;
  hpDie: number;
  hpMode: "average" | "roll";
  conRetroactive: number;
  newHpMax: number;
  profBonusBefore: number;
  profBonusAfter: number;
  asiApplied: Partial<Record<AbilityKey, number>>;
  features: (LevelFeature & { source?: string })[];
  slotsGained: Record<string, number>;
  newMaxSlots: Record<string, number>;
  cantripsBefore: number;
  cantripsAfter: number;
  spellsKnownBefore: number;
  spellsKnownAfter: number;
  spellsLearned: string[];
  newClassName?: string;
}

type ClassEntry = { id: string; className: string; level: number };

export function LevelUpButton({
  characterId,
  classes,
  raceKey,
  currentLevel,
  scores,
  knownSpellNames,
}: {
  characterId: string;
  classes: ClassEntry[];
  raceKey: string;
  currentLevel: number;
  scores: Record<AbilityKey, number>;
  knownSpellNames: string[];
}) {
  const router   = useRouter();
  const [open,    setOpen]    = useState(false);
  const [hovered, setHovered] = useState(false);

  if (currentLevel >= 20 || classes.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "8px 16px",
          borderRadius: "var(--radius)",
          background: hovered ? "rgba(95,191,127,0.22)" : GREEN_DIM,
          border: `1px solid ${GREEN_BORDER}`,
          color: GREEN,
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          cursor: "pointer",
          boxShadow: hovered ? "0 0 16px rgba(95,191,127,0.3)" : "0 0 8px rgba(95,191,127,0.12)",
          transition: "all 0.15s",
        }}
      >
        ▲ Subir de Nível
      </button>

      {open && (
        <LevelUpModal
          characterId={characterId}
          classes={classes}
          raceKey={raceKey}
          currentLevel={currentLevel}
          scores={scores}
          knownSpellNames={knownSpellNames}
          onClose={(changed) => {
            setOpen(false);
            if (changed) router.refresh();
          }}
        />
      )}
    </>
  );
}

function LevelUpModal({
  characterId,
  classes,
  raceKey,
  currentLevel,
  scores,
  knownSpellNames,
  onClose,
}: {
  characterId: string;
  classes: ClassEntry[];
  raceKey: string;
  currentLevel: number;
  scores: Record<AbilityKey, number>;
  knownSpellNames: string[];
  onClose: (changed: boolean) => void;
}) {
  // Null = "adicionar nova classe"; string = id do DndClass a subir de nível
  const [targetClassEntryId, setTargetClassEntryId] = useState<string | null>(classes[0]?.id ?? null);
  const [newClassId,    setNewClassId]    = useState<string | null>(null);

  const [hpMode,   setHpMode]   = useState<"average" | "roll">("average");
  const [hpRoll,   setHpRoll]   = useState<number | null>(null);
  const [asiMode,  setAsiMode]  = useState<"two" | "oneone">("two");
  const [asiPick,  setAsiPick]  = useState<AbilityKey | null>(null);
  const [asiPick2, setAsiPick2] = useState<AbilityKey | null>(null);
  const [pickedCantrips, setPickedCantrips] = useState<Set<string>>(new Set());
  const [pickedSpells,   setPickedSpells]   = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [summary,    setSummary]    = useState<Summary | null>(null);

  const isMulticlassMode = targetClassEntryId === null;

  // Classe/plano para o caminho de subida de nível
  const targetEntry = useMemo(
    () => classes.find((c) => c.id === targetClassEntryId) ?? null,
    [classes, targetClassEntryId]
  );
  const targetCls = useMemo(
    () => (targetEntry ? CLASSES.find((c) => c.id === targetEntry.className) : null),
    [targetEntry]
  );
  const plan = useMemo(() => {
    if (!targetEntry || !targetCls) return null;
    return buildLevelUpPlan(targetCls.id, raceKey, targetEntry.level, targetCls.hitDie, currentLevel);
  }, [targetEntry, targetCls, raceKey, currentLevel]);

  // Nova classe (multiclasse)
  const newCls = useMemo(
    () => (newClassId ? CLASSES.find((c) => c.id === newClassId) : null),
    [newClassId]
  );
  const prereqError = useMemo(
    () => (newClassId ? checkMulticlassPrereqs(newClassId, scores) : null),
    [newClassId, scores]
  );
  const newClsSpellCfg = newClassId ? SPELLCASTING[newClassId] : null;

  const conMod = Math.floor((scores.con - 10) / 2);

  // Magias da nova classe (multiclasse "known")
  const known = useMemo(
    () => new Set(knownSpellNames.map((n) => n.toLowerCase())),
    [knownSpellNames]
  );
  const newCantripOptions = useMemo(() => {
    if (!newClassId || !newClsSpellCfg) return [];
    const ck = spellClassKey(newClassId);
    return SPELLS.filter((s) => s.level === 0 && s.classes.includes(ck) && !known.has(s.name.toLowerCase()));
  }, [newClassId, newClsSpellCfg, known]);
  const newSpellOptions = useMemo(() => {
    if (!newClassId || !newClsSpellCfg || newClsSpellCfg.type !== "known") return [];
    const ck = spellClassKey(newClassId);
    return SPELLS.filter(
      (s) => s.level >= 1 && s.level <= 1 && s.classes.includes(ck) && !known.has(s.name.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [newClassId, newClsSpellCfg, known]);

  // Magias da classe existente (subida normal)
  const choices = useMemo(
    () => (plan && targetCls ? spellChoicesOnLevelUp(targetCls.id, plan.newLevel) : { cantrips: 0, spells: 0 }),
    [plan, targetCls]
  );
  const existingClassKey = targetCls ? spellClassKey(targetCls.id) : "";
  const maxSpellLv = plan && targetCls ? maxSpellLevelAt(targetCls.id, plan.newLevel) : 0;
  const cantripOptions = useMemo(
    () => SPELLS.filter((s) => s.level === 0 && s.classes.includes(existingClassKey) && !known.has(s.name.toLowerCase())),
    [existingClassKey, known]
  );
  const spellOptions = useMemo(
    () =>
      SPELLS.filter(
        (s) => s.level >= 1 && s.level <= maxSpellLv && s.classes.includes(existingClassKey) && !known.has(s.name.toLowerCase())
      ).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)),
    [existingClassKey, known, maxSpellLv]
  );

  function rollHitDie() {
    const die = isMulticlassMode ? (newCls?.hitDie ?? 8) : (targetCls?.hitDie ?? 8);
    setHpRoll(Math.floor(Math.random() * die) + 1);
  }

  const asiIncreases: Partial<Record<AbilityKey, number>> = {};
  if (plan?.asi) {
    if (asiMode === "two" && asiPick) asiIncreases[asiPick] = 2;
    if (asiMode === "oneone" && asiPick && asiPick2 && asiPick !== asiPick2) {
      asiIncreases[asiPick] = 1;
      asiIncreases[asiPick2] = 1;
    }
  }

  const asiReady    = !plan?.asi || Object.keys(asiIncreases).length > 0;
  const hpReady     = hpMode === "average" || hpRoll !== null;
  const spellsReady = pickedCantrips.size >= choices.cantrips && pickedSpells.size >= choices.spells;
  const multiReady  = isMulticlassMode
    ? (!!newClassId && !prereqError &&
       pickedCantrips.size === (newClsSpellCfg?.type === "known" ? (newClsSpellCfg.cantripsKnown ?? 0) : 0) &&
       pickedSpells.size   === (newClsSpellCfg?.type === "known" ? (newClsSpellCfg.spellsKnown ?? 0) : 0))
    : (asiReady && spellsReady);
  const canConfirm  = multiReady && hpReady && !submitting;

  async function confirm() {
    if (!canConfirm) return;
    setSubmitting(true);
    setError(null);
    try {
      const bodyData: Record<string, unknown> = {
        hpMode,
        ...(hpMode === "roll" ? { hpRoll } : {}),
      };
      if (isMulticlassMode) {
        bodyData.newClassId = newClassId;
        bodyData.newSpells  = [...pickedCantrips, ...pickedSpells];
      } else {
        bodyData.targetClassId = targetEntry?.id;
        if (plan?.asi) bodyData.asi = asiIncreases;
        bodyData.newSpells = [...pickedCantrips, ...pickedSpells];
      }
      const res  = await fetch(`/api/dnd/characters/${characterId}/levelup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao subir de nível.");
        return;
      }
      setSummary(data.summary);
    } catch {
      setError("Falha de conexão.");
    } finally {
      setSubmitting(false);
    }
  }

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 100,
    background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  };
  const panel: React.CSSProperties = {
    width: "100%", maxWidth: 700, maxHeight: "88vh", overflowY: "auto",
    background: "var(--surface)", border: `1px solid ${GREEN_BORDER}`,
    borderRadius: "var(--radius-xl)", padding: "26px 26px 22px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(95,191,127,0.08)",
    display: "flex", flexDirection: "column", gap: 18,
  };

  // ── Tela de resumo ─────────────────────────────────────────────────────────
  if (summary) {
    return (
      <div style={overlay} onClick={() => onClose(true)}>
        <div style={panel} onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.14em" }}>
              {summary.newClassName ? `✦ Nova Classe ✦` : `✦ Nível alcançado ✦`}
            </p>
            <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2.2rem", fontWeight: 900, color: GREEN, lineHeight: 1.1, marginTop: 4 }}>
              {summary.newClassName ? summary.newClassName : `Nível ${summary.newLevel}`}
            </h2>
            {summary.newClassName && (
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
                Nível total: {summary.newLevel}
              </p>
            )}
          </div>

          <SummaryRow label="Pontos de Vida" value={`+${summary.hpGain} (novo máximo: ${summary.newHpMax})${summary.conRetroactive > 0 ? ` · inclui +${summary.conRetroactive} retroativo de CON` : ""}`} />
          {summary.profBonusAfter !== summary.profBonusBefore && (
            <SummaryRow label="Bônus de Proficiência" value={`+${summary.profBonusBefore} → +${summary.profBonusAfter}`} highlight />
          )}
          {Object.keys(summary.asiApplied).length > 0 && (
            <SummaryRow
              label="Atributos"
              value={Object.entries(summary.asiApplied)
                .map(([k, v]) => `${ABILITY_LABELS[k as AbilityKey]} +${v}`)
                .join(" · ")}
              highlight
            />
          )}
          {Object.keys(summary.slotsGained).length > 0 && (
            <SummaryRow
              label="Espaços de Magia"
              value={Object.entries(summary.slotsGained).map(([lvl, n]) => `+${n} de ${lvl}° nível`).join(" · ")}
            />
          )}
          {summary.cantripsAfter > summary.cantripsBefore && (
            <SummaryRow label="Truques" value={`${summary.cantripsBefore} → ${summary.cantripsAfter} conhecidos`} />
          )}
          {summary.spellsKnownAfter > summary.spellsKnownBefore && (
            <SummaryRow label="Magias Conhecidas" value={`${summary.spellsKnownBefore} → ${summary.spellsKnownAfter}`} />
          )}
          {summary.spellsLearned.length > 0 && (
            <SummaryRow label="Magias Aprendidas" value={summary.spellsLearned.join(" · ")} highlight />
          )}
          {summary.features.length > 0 && (
            <div>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Novas Características
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {summary.features.map((f, i) => <FeatureCard key={i} feature={f} />)}
              </div>
            </div>
          )}

          <button onClick={() => onClose(true)} style={confirmBtnStyle(true)}>
            Continuar
          </button>
        </div>
      </div>
    );
  }

  const effectiveHitDie = isMulticlassMode ? (newCls?.hitDie ?? 8) : (targetCls?.hitDie ?? 8);

  // ── Tela de configuração ───────────────────────────────────────────────────
  return (
    <div style={overlay} onClick={() => onClose(false)}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>

        {/* Seletor de classe alvo */}
        <div>
          <p style={sectionLabel}>Subir em qual classe?</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {classes.map((c) => {
              const cl = CLASSES.find((x) => x.id === c.className);
              const active = targetClassEntryId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setTargetClassEntryId(c.id);
                    setNewClassId(null);
                    setHpRoll(null);
                    setAsiPick(null); setAsiPick2(null);
                    setPickedCantrips(new Set()); setPickedSpells(new Set());
                  }}
                  style={choiceBtn(active, false)}
                >
                  {cl?.name ?? c.className} {c.level}
                </button>
              );
            })}
            <button
              onClick={() => {
                setTargetClassEntryId(null);
                setNewClassId(null);
                setHpRoll(null);
                setPickedCantrips(new Set()); setPickedSpells(new Set());
              }}
              style={choiceBtn(isMulticlassMode, false)}
            >
              + Nova Classe
            </button>
          </div>
        </div>

        {/* ── Modo: adicionar nova classe ── */}
        {isMulticlassMode && (
          <>
            <div>
              <p style={sectionLabel}>Escolha a nova classe</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {CLASSES.map((cl) => {
                  const prereq  = checkMulticlassPrereqs(cl.id, scores);
                  const already = classes.some((c) => c.className === cl.id);
                  const sel     = newClassId === cl.id;
                  const disabled = !!prereq || already;
                  return (
                    <button
                      key={cl.id}
                      disabled={disabled}
                      title={prereq ?? (already ? "Você já possui esta classe" : undefined)}
                      onClick={() => {
                        if (!disabled) {
                          setNewClassId(sel ? null : cl.id);
                          setPickedCantrips(new Set());
                          setPickedSpells(new Set());
                          setHpRoll(null);
                        }
                      }}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "var(--radius)",
                        background: sel ? GREEN_DIM : "var(--surface-2)",
                        border: `1px solid ${sel ? GREEN_BORDER : "var(--border)"}`,
                        color: disabled ? "var(--text-subtle)" : sel ? GREEN : "var(--text)",
                        fontSize: "0.72rem", fontWeight: 700,
                        cursor: disabled ? "default" : "pointer",
                        opacity: disabled ? 0.4 : 1,
                        transition: "all 0.12s", fontFamily: "inherit",
                      }}
                    >
                      {cl.name}
                      {prereq && (
                        <span style={{ display: "block", fontSize: "0.58rem", color: "#e06c6c", marginTop: 2, fontWeight: 500 }}>
                          Não elegível
                        </span>
                      )}
                      {already && (
                        <span style={{ display: "block", fontSize: "0.58rem", color: "var(--text-subtle)", marginTop: 2, fontWeight: 500 }}>
                          Já possui
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {newClassId && (
              <div
                style={{
                  background: GREEN_DIM,
                  border: `1px solid ${GREEN_BORDER}`,
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                }}
              >
                <p style={{ fontSize: "0.65rem", fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Proficiências ganhas ao multiclassear
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text)", marginTop: 4 }}>
                  {MULTICLASS_PROFICIENCIES[newClassId] ?? "—"}
                </p>
              </div>
            )}

            {/* Seleção de magias da nova classe (só "known") */}
            {newClassId && newClsSpellCfg?.type === "known" && (
              <>
                {newClsSpellCfg.cantripsKnown > 0 && (
                  <SpellPickSection
                    title={`Truques de ${newCls?.name} (escolha ${newClsSpellCfg.cantripsKnown})`}
                    options={newCantripOptions}
                    picked={pickedCantrips}
                    max={newClsSpellCfg.cantripsKnown}
                    onToggle={(sid) => {
                      const next = new Set(pickedCantrips);
                      if (next.has(sid)) next.delete(sid);
                      else if (next.size < newClsSpellCfg.cantripsKnown) next.add(sid);
                      setPickedCantrips(next);
                    }}
                  />
                )}
                {newClsSpellCfg.spellsKnown > 0 && (
                  <SpellPickSection
                    title={`Magias de ${newCls?.name} (escolha ${newClsSpellCfg.spellsKnown})`}
                    options={newSpellOptions}
                    picked={pickedSpells}
                    max={newClsSpellCfg.spellsKnown}
                    onToggle={(sid) => {
                      const next = new Set(pickedSpells);
                      if (next.has(sid)) next.delete(sid);
                      else if (next.size < newClsSpellCfg.spellsKnown) next.add(sid);
                      setPickedSpells(next);
                    }}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* ── Modo: subir de nível em classe existente ── */}
        {!isMulticlassMode && plan && (
          <>
            <div>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                {targetCls?.name} · Subir de Nível
              </p>
              <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", marginTop: 2 }}>
                {plan.fromLevel} → <span style={{ color: GREEN }}>{plan.newLevel}</span>
                {plan.totalLevelBefore !== plan.fromLevel && (
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500, marginLeft: 8 }}>
                    (total: {plan.totalLevelBefore} → {plan.totalLevelAfter})
                  </span>
                )}
              </h2>
              {plan.profBonusAfter !== plan.profBonusBefore && (
                <p style={{ fontSize: "0.78rem", color: GREEN, marginTop: 4, fontWeight: 600 }}>
                  Bônus de proficiência sobe para +{plan.profBonusAfter}
                </p>
              )}
            </div>

            {/* ASI */}
            {plan.asi && (
              <div>
                <p style={sectionLabel}>Melhoria de Valor de Habilidade</p>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button onClick={() => { setAsiMode("two"); setAsiPick(null); setAsiPick2(null); }} style={choiceBtn(asiMode === "two", false)}>
                    +2 em um atributo
                  </button>
                  <button onClick={() => { setAsiMode("oneone"); setAsiPick(null); setAsiPick2(null); }} style={choiceBtn(asiMode === "oneone", false)}>
                    +1 em dois atributos
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {ABILITIES.map((k) => {
                    const inc     = asiMode === "two" ? 2 : 1;
                    const capped  = scores[k] + inc > ABILITY_MAX;
                    const isPicked = asiPick === k || asiPick2 === k;
                    return (
                      <button
                        key={k}
                        disabled={capped && !isPicked}
                        onClick={() => {
                          if (asiMode === "two") {
                            setAsiPick(asiPick === k ? null : k);
                          } else if (asiPick === k) {
                            setAsiPick(asiPick2); setAsiPick2(null);
                          } else if (asiPick2 === k) {
                            setAsiPick2(null);
                          } else if (!asiPick) {
                            setAsiPick(k);
                          } else if (!asiPick2) {
                            setAsiPick2(k);
                          }
                        }}
                        style={{
                          padding: "8px 4px",
                          borderRadius: "var(--radius)",
                          background: isPicked ? GREEN_DIM : "var(--surface-2)",
                          border: `1px solid ${isPicked ? GREEN_BORDER : "var(--border)"}`,
                          color: capped && !isPicked ? "var(--text-subtle)" : isPicked ? GREEN : "var(--text)",
                          fontSize: "0.72rem", fontWeight: 700,
                          cursor: capped && !isPicked ? "default" : "pointer",
                          opacity: capped && !isPicked ? 0.45 : 1,
                          fontFamily: "inherit", transition: "all 0.12s",
                        }}
                      >
                        {ABILITY_LABELS[k]}
                        <span style={{ display: "block", fontSize: "0.82rem", marginTop: 2 }}>
                          {scores[k]}{isPicked ? ` → ${scores[k] + inc}` : capped ? " (máx)" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Truques novos */}
            {choices.cantrips > 0 && (
              <SpellPickSection
                title={`Novos Truques (escolha ${choices.cantrips})`}
                options={cantripOptions}
                picked={pickedCantrips}
                max={choices.cantrips}
                onToggle={(sid) => {
                  const next = new Set(pickedCantrips);
                  if (next.has(sid)) next.delete(sid);
                  else if (next.size < choices.cantrips) next.add(sid);
                  setPickedCantrips(next);
                }}
              />
            )}

            {/* Magias novas */}
            {choices.spells > 0 && (
              <SpellPickSection
                title={targetCls?.id === "mago" ? `Grimório — novas magias (escolha ${choices.spells})` : `Novas Magias (escolha ${choices.spells})`}
                options={spellOptions}
                picked={pickedSpells}
                max={choices.spells}
                onToggle={(sid) => {
                  const next = new Set(pickedSpells);
                  if (next.has(sid)) next.delete(sid);
                  else if (next.size < choices.spells) next.add(sid);
                  setPickedSpells(next);
                }}
              />
            )}

            {/* Preview características */}
            {(plan.classFeatures.length > 0 || plan.raceFeatures.length > 0) && (
              <div>
                <p style={sectionLabel}>Você ganhará</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[...plan.classFeatures, ...plan.raceFeatures].map((f, i) => (
                    <FeatureCard key={i} feature={f} />
                  ))}
                </div>
              </div>
            )}
            {Object.keys(plan.slotsGained).length > 0 && (
              <SummaryRow
                label="Espaços de Magia"
                value={Object.entries(plan.slotsGained).map(([lvl, n]) => `+${n} de ${lvl}° nível`).join(" · ")}
              />
            )}
            {plan.cantripsAfter > plan.cantripsBefore && (
              <SummaryRow label="Truques" value={`${plan.cantripsBefore} → ${plan.cantripsAfter} conhecidos`} />
            )}
            {plan.spellsKnownAfter > plan.spellsKnownBefore && (
              <SummaryRow label="Magias Conhecidas" value={`${plan.spellsKnownBefore} → ${plan.spellsKnownAfter}`} />
            )}
          </>
        )}

        {/* PV (sempre visível) */}
        {(!isMulticlassMode || newClassId) && (
          <div>
            <p style={sectionLabel}>
              Pontos de Vida (d{effectiveHitDie}
              {conMod !== 0 ? ` ${conMod > 0 ? "+" : ""}${conMod} CON` : ""})
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setHpMode("average")} style={choiceBtn(hpMode === "average", false)}>
                Média fixa
                <span style={{ display: "block", fontSize: "1.05rem", fontWeight: 900, marginTop: 2 }}>
                  +{Math.max(1, Math.floor(effectiveHitDie / 2) + 1 + conMod)}
                </span>
              </button>
              <button
                onClick={() => { setHpMode("roll"); if (hpRoll === null) rollHitDie(); }}
                style={choiceBtn(hpMode === "roll", false)}
              >
                Rolar d{effectiveHitDie}
                <span style={{ display: "block", fontSize: "1.05rem", fontWeight: 900, marginTop: 2 }}>
                  {hpMode === "roll" && hpRoll !== null ? `🎲 ${hpRoll} → +${Math.max(1, hpRoll + conMod)}` : "🎲"}
                </span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <p style={{ fontSize: "0.78rem", color: "#e06c6c", fontWeight: 600 }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onClose(false)}
            style={{
              flex: 1, padding: "11px", borderRadius: "var(--radius-lg)",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              color: "var(--text-muted)", fontSize: "0.84rem", fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Cancelar
          </button>
          <button onClick={confirm} disabled={!canConfirm} style={confirmBtnStyle(canConfirm)}>
            {submitting
              ? "Aplicando…"
              : isMulticlassMode
                ? `Adicionar ${newCls?.name ?? "Nova Classe"}`
                : `Confirmar Nível ${plan?.totalLevelAfter ?? currentLevel + 1}`}
          </button>
        </div>
      </div>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)",
  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
};

function choiceBtn(active: boolean, _disabled: boolean): React.CSSProperties {
  return {
    flex: 1, padding: "9px 8px", borderRadius: "var(--radius-lg)",
    background: active ? GREEN_DIM : "var(--surface-2)",
    border: `1px solid ${active ? GREEN_BORDER : "var(--border)"}`,
    color: active ? GREEN : "var(--text-muted)",
    fontSize: "0.74rem", fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.12s", textAlign: "center",
  };
}

function confirmBtnStyle(enabled: boolean): React.CSSProperties {
  return {
    flex: 2, padding: "11px", borderRadius: "var(--radius-lg)",
    background: enabled ? "rgba(95,191,127,0.18)" : "var(--surface-2)",
    border: `1px solid ${enabled ? GREEN_BORDER : "var(--border)"}`,
    color: enabled ? GREEN : "var(--text-subtle)",
    fontFamily: "var(--font-cinzel), serif",
    fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.04em",
    cursor: enabled ? "pointer" : "default",
    boxShadow: enabled ? "0 0 16px rgba(95,191,127,0.2)" : "none",
    transition: "all 0.15s",
  };
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      background: highlight ? GREEN_DIM : "var(--surface-2)",
      border: `1px solid ${highlight ? GREEN_BORDER : "var(--border)"}`,
      borderRadius: "var(--radius)", padding: "8px 12px",
    }}>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
        {label}
      </span>
      <span style={{ fontSize: "0.84rem", fontWeight: 700, color: highlight ? GREEN : "var(--text)" }}>
        {value}
      </span>
    </div>
  );
}

function SpellPickSection({
  title, options, picked, max, onToggle,
}: {
  title: string;
  options: typeof SPELLS;
  picked: Set<string>;
  max: number;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <p style={sectionLabel}>
        {title} <span style={{ color: picked.size === max ? GREEN : "var(--text-subtle)" }}>· {picked.size}/{max}</span>
      </p>
      {options.length === 0 ? (
        <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontStyle: "italic" }}>
          Nenhuma opção disponível no catálogo — anote suas escolhas com o Mestre.
        </p>
      ) : (
        <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {options.map((s) => {
            const isPicked = picked.has(s.id);
            const full     = picked.size >= max && !isPicked;
            return (
              <button
                key={s.id}
                onClick={() => onToggle(s.id)}
                disabled={full}
                title={s.description}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                  background: isPicked ? GREEN_DIM : "var(--surface-2)",
                  border: `1px solid ${isPicked ? GREEN_BORDER : "var(--border)"}`,
                  borderRadius: "var(--radius)", cursor: full ? "default" : "pointer",
                  fontFamily: "inherit", textAlign: "left",
                  opacity: full ? 0.45 : 1, transition: "all 0.12s",
                }}
              >
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: "var(--radius-xs)",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  color: "var(--text-muted)", flexShrink: 0,
                }}>
                  {s.level === 0 ? "T" : `${s.level}°`}
                </span>
                <span style={{ flex: 1, fontSize: "0.78rem", fontWeight: 600, color: isPicked ? GREEN : "var(--text)" }}>
                  {s.name}
                </span>
                <span style={{ fontSize: "0.62rem", color: SCHOOL_COLORS[s.school] ?? "var(--text-subtle)", flexShrink: 0 }}>
                  {s.school}
                </span>
                {isPicked && <span style={{ color: GREEN, fontSize: "0.78rem", flexShrink: 0 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeatureCard({ feature }: { feature: LevelFeature }) {
  return (
    <div style={{
      background: "var(--surface-2)", border: "1px solid var(--border)",
      borderLeft: `3px solid ${GREEN}`, borderRadius: "var(--radius)", padding: "8px 12px",
    }}>
      <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>{feature.name}</p>
      <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5, marginTop: 2 }}>
        {feature.description}
      </p>
    </div>
  );
}
