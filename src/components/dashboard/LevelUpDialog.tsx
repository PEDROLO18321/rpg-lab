"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildLevelUpPlan,
  ABILITY_MAX,
  spellChoicesOnLevelUp,
  maxSpellLevelAt,
} from "@/lib/dnd/leveling";
import type { LevelFeature } from "@/lib/dnd/leveling";
import { SPELLS, SCHOOL_COLORS, spellClassKey } from "@/lib/dnd/spells";
import { ABILITY_LABELS } from "@/lib/dnd/races";
import type { AbilityKey } from "@/lib/dnd/races";

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

const GREEN = "#5fbf7f";
const GREEN_DIM = "rgba(95,191,127,0.12)";
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
}

/**
 * Botão verde "Subir de Nível" + modal com as regras do Livro do Jogador:
 * escolha de PV (média ou rolagem), ASI quando aplicável, preview das
 * características do novo nível e resumo do que mudou após confirmar.
 */
export function LevelUpButton({
  characterId,
  classId,
  hitDie,
  raceKey,
  currentLevel,
  scores,
  knownSpellNames,
}: {
  characterId: string;
  classId: string;
  hitDie: number;
  raceKey: string;
  currentLevel: number;
  scores: Record<AbilityKey, number>;
  knownSpellNames: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const plan = useMemo(
    () => buildLevelUpPlan(classId, raceKey, currentLevel, hitDie),
    [classId, raceKey, currentLevel, hitDie]
  );

  if (!plan) return null; // nível 20 — sem botão

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
          classId={classId}
          plan={plan}
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
  classId,
  plan,
  scores,
  knownSpellNames,
  onClose,
}: {
  characterId: string;
  classId: string;
  plan: NonNullable<ReturnType<typeof buildLevelUpPlan>>;
  scores: Record<AbilityKey, number>;
  knownSpellNames: string[];
  onClose: (changed: boolean) => void;
}) {
  const [hpMode, setHpMode] = useState<"average" | "roll">("average");
  const [hpRoll, setHpRoll] = useState<number | null>(null);
  // ASI: modo +2 único ou +1/+1
  const [asiMode, setAsiMode] = useState<"two" | "oneone">("two");
  const [asiPick, setAsiPick] = useState<AbilityKey | null>(null);
  const [asiPick2, setAsiPick2] = useState<AbilityKey | null>(null);
  // Magias novas escolhidas (ids do catálogo)
  const [pickedCantrips, setPickedCantrips] = useState<Set<string>>(new Set());
  const [pickedSpells, setPickedSpells] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const conMod = Math.floor((scores.con - 10) / 2);

  // ── Escolha de magias (Livro do Jogador: seção Conjuração da classe) ──────
  const choices = useMemo(() => spellChoicesOnLevelUp(classId, plan.newLevel), [classId, plan.newLevel]);
  const known = useMemo(() => new Set(knownSpellNames.map((n) => n.toLowerCase())), [knownSpellNames]);
  const classKey = spellClassKey(classId);
  const maxSpellLv = maxSpellLevelAt(classId, plan.newLevel);
  const cantripOptions = useMemo(
    () => SPELLS.filter((s) => s.level === 0 && s.classes.includes(classKey) && !known.has(s.name.toLowerCase())),
    [classKey, known]
  );
  const spellOptions = useMemo(
    () =>
      SPELLS.filter(
        (s) => s.level >= 1 && s.level <= maxSpellLv && s.classes.includes(classKey) && !known.has(s.name.toLowerCase())
      ).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)),
    [classKey, known, maxSpellLv]
  );

  function rollHitDie() {
    setHpRoll(Math.floor(Math.random() * plan.hitDie) + 1);
  }

  const asiIncreases: Partial<Record<AbilityKey, number>> = {};
  if (plan.asi) {
    if (asiMode === "two" && asiPick) asiIncreases[asiPick] = 2;
    if (asiMode === "oneone" && asiPick && asiPick2 && asiPick !== asiPick2) {
      asiIncreases[asiPick] = 1;
      asiIncreases[asiPick2] = 1;
    }
  }
  const asiReady = !plan.asi || Object.keys(asiIncreases).length > 0;
  const hpReady = hpMode === "average" || hpRoll !== null;
  const canConfirm = asiReady && hpReady && !submitting;

  async function confirm() {
    if (!canConfirm) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/dnd/characters/${characterId}/levelup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hpMode,
          ...(hpMode === "roll" ? { hpRoll } : {}),
          ...(plan.asi ? { asi: asiIncreases } : {}),
          newSpells: [...pickedCantrips, ...pickedSpells],
        }),
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
    width: "100%", maxWidth: 520, maxHeight: "86vh", overflowY: "auto",
    background: "var(--surface)", border: `1px solid ${GREEN_BORDER}`,
    borderRadius: "var(--radius-xl)", padding: "26px 26px 22px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(95,191,127,0.08)",
    display: "flex", flexDirection: "column", gap: 18,
  };

  // ── Tela de resumo (após confirmar) ────────────────────────────────────────
  if (summary) {
    return (
      <div style={overlay} onClick={() => onClose(true)}>
        <div style={panel} onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.14em" }}>
              ✦ Nível alcançado ✦
            </p>
            <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2.2rem", fontWeight: 900, color: GREEN, lineHeight: 1.1, marginTop: 4 }}>
              Nível {summary.newLevel}
            </h2>
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
              value={Object.entries(summary.slotsGained)
                .map(([lvl, n]) => `+${n} de ${lvl}° nível`)
                .join(" · ")}
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
                {summary.features.map((f, i) => (
                  <FeatureCard key={i} feature={f} />
                ))}
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

  // ── Tela de configuração ───────────────────────────────────────────────────
  return (
    <div style={overlay} onClick={() => onClose(false)}>
      <div style={panel} onClick={(e) => e.stopPropagation()}>
        <div>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Subir de Nível
          </p>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", marginTop: 2 }}>
            Nível {plan.fromLevel} → <span style={{ color: GREEN }}>{plan.newLevel}</span>
          </h2>
          {plan.profBonusAfter !== plan.profBonusBefore && (
            <p style={{ fontSize: "0.78rem", color: GREEN, marginTop: 4, fontWeight: 600 }}>
              Bônus de proficiência sobe para +{plan.profBonusAfter}
            </p>
          )}
        </div>

        {/* PV */}
        <div>
          <p style={sectionLabel}>Pontos de Vida (d{plan.hitDie} {conMod !== 0 ? `${conMod > 0 ? "+" : ""}${conMod} CON` : ""})</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setHpMode("average"); }}
              style={choiceBtn(hpMode === "average")}
            >
              Média fixa
              <span style={{ display: "block", fontSize: "1.05rem", fontWeight: 900, marginTop: 2 }}>
                +{Math.max(1, plan.averageRoll + conMod)}
              </span>
            </button>
            <button
              onClick={() => { setHpMode("roll"); if (hpRoll === null) rollHitDie(); }}
              style={choiceBtn(hpMode === "roll")}
            >
              Rolar d{plan.hitDie}
              <span style={{ display: "block", fontSize: "1.05rem", fontWeight: 900, marginTop: 2 }}>
                {hpMode === "roll" && hpRoll !== null ? `🎲 ${hpRoll} → +${Math.max(1, hpRoll + conMod)}` : "🎲"}
              </span>
            </button>
          </div>
          {hpMode === "roll" && hpRoll !== null && (
            <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginTop: 6 }}>
              A rolagem é definitiva — como na mesa.
            </p>
          )}
        </div>

        {/* ASI */}
        {plan.asi && (
          <div>
            <p style={sectionLabel}>Melhoria de Valor de Habilidade</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button onClick={() => { setAsiMode("two"); setAsiPick(null); setAsiPick2(null); }} style={choiceBtn(asiMode === "two")}>
                +2 em um atributo
              </button>
              <button onClick={() => { setAsiMode("oneone"); setAsiPick(null); setAsiPick2(null); }} style={choiceBtn(asiMode === "oneone")}>
                +1 em dois atributos
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {ABILITIES.map((k) => {
                const inc = asiMode === "two" ? 2 : 1;
                const capped = scores[k] + inc > ABILITY_MAX;
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
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: capped && !isPicked ? "default" : "pointer",
                      opacity: capped && !isPicked ? 0.45 : 1,
                      fontFamily: "inherit",
                      transition: "all 0.12s",
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

        {/* Escolha de truques novos */}
        {choices.cantrips > 0 && (
          <SpellPickSection
            title={`Novos Truques (escolha ${choices.cantrips})`}
            options={cantripOptions}
            picked={pickedCantrips}
            max={choices.cantrips}
            onToggle={(id) => {
              const next = new Set(pickedCantrips);
              if (next.has(id)) next.delete(id);
              else if (next.size < choices.cantrips) next.add(id);
              setPickedCantrips(next);
            }}
          />
        )}

        {/* Escolha de magias novas (conhecidas/grimório) */}
        {choices.spells > 0 && (
          <SpellPickSection
            title={
              classId === "mago"
                ? `Grimório — novas magias (escolha ${choices.spells})`
                : `Novas Magias (escolha ${choices.spells})`
            }
            options={spellOptions}
            picked={pickedSpells}
            max={choices.spells}
            onToggle={(id) => {
              const next = new Set(pickedSpells);
              if (next.has(id)) next.delete(id);
              else if (next.size < choices.spells) next.add(id);
              setPickedSpells(next);
            }}
          />
        )}

        {/* Preview do que vem */}
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
            {submitting ? "Aplicando…" : `Confirmar Nível ${plan.newLevel}`}
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

function choiceBtn(active: boolean): React.CSSProperties {
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
    <div
      style={{
        background: highlight ? GREEN_DIM : "var(--surface-2)",
        border: `1px solid ${highlight ? GREEN_BORDER : "var(--border)"}`,
        borderRadius: "var(--radius)",
        padding: "8px 12px",
      }}
    >
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
  title,
  options,
  picked,
  max,
  onToggle,
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
            const full = picked.size >= max && !isPicked;
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
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${GREEN}`,
        borderRadius: "var(--radius)",
        padding: "8px 12px",
      }}
    >
      <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>{feature.name}</p>
      <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5, marginTop: 2 }}>
        {feature.description}
      </p>
    </div>
  );
}
