"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ATTR_KEYS, ATTR_ABBR, ATTR_LABEL, ATTR_MAX,
  SKILLS, SKILL_BY_ID, TRAIN_LABEL,
  CLASS_BY_ID, computeVitals, computeDefense,
  type AttrKey, type TrainDegree, type ClassId, type OrdemAttrs, type Element,
} from "@/lib/ordem/data";
import {
  CLASS_POWERS_BY_CLASS, TRAILS_BY_CLASS, PARANORMAL_POWERS,
} from "@/lib/ordem/abilities";
import {
  RITUALS, RITUAL_COST, ELEMENT_LABEL_PT, ELEMENT_COLOR_UI, maxRitualCircle,
  type RitualCircle,
} from "@/lib/ordem/rituals";
import {
  buildNexPlan, trailPowerAt, recomputeVitals, normalizeProgression,
  type OrdemProgression,
} from "@/lib/ordem/leveling";

const ACCENT = "#ffffff";
const ACCENT_DIM = "rgba(255,255,255,0.14)";
const ACCENT_BORD = "rgba(255,255,255,0.32)";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyChar = any;

function parse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

interface Props {
  character: AnyChar;
  onClose: () => void;
}

export function LevelUpModal({ character, onClose }: Props) {
  const router = useRouter();
  const sheet = character.ordemSheet;
  const classId = sheet.className as ClassId;
  const origin: string | undefined = sheet.origin ?? undefined;

  const baseAttrs: OrdemAttrs = {
    agi: sheet.agi, for: sheet.forca, int: sheet.int, pre: sheet.pre, vig: sheet.vig,
  };
  const progression = useMemo<OrdemProgression>(
    () => normalizeProgression(parse<unknown>(sheet.abilities, null), sheet.trail),
    [sheet.abilities, sheet.trail],
  );
  const knownRituals = useMemo<string[]>(() => parse<string[]>(sheet.rituals, []), [sheet.rituals]);
  const knownSkills = useMemo<Record<string, TrainDegree>>(
    () => parse<Record<string, TrainDegree>>(sheet.skills, {}), [sheet.skills],
  );

  const plan = useMemo(() => buildNexPlan(classId, sheet.nex, baseAttrs.int), [classId, sheet.nex, baseAttrs.int]);

  // ── Estado de escolhas ───────────────────────────────────────────────────────
  const [trailId, setTrailId]       = useState<string | null>(progression.trailId);
  const [attrPicks, setAttrPicks]   = useState<AttrKey[]>([]);          // atributos +1
  const [powerMode, setPowerMode]   = useState<"normal" | "transcender">("normal"); // avanço de poder
  const [powerPicks, setPowerPicks] = useState<string[]>([]);          // ids de poder de classe
  const [paraPicks, setParaPicks]   = useState<string[]>([]);          // poderes paranormais (Transcender)
  const [trainPicks, setTrainPicks] = useState<string[]>([]);          // perícias melhoradas
  const [ritualPicks, setRitualPicks] = useState<string[]>([]);        // rituais aprendidos
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  if (!plan) {
    return (
      <Overlay onClose={onClose}>
        <h2 style={titleStyle}>NEX máximo</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.86rem" }}>
          Este agente já alcançou NEX 99% — o ápice da Exposição. Não há mais como avançar.
        </p>
        <button onClick={onClose} style={primaryBtn}>Fechar</button>
      </Overlay>
    );
  }

  // ── Atributos finais (com aumentos aplicados) ────────────────────────────────
  const newAttrs: OrdemAttrs = { ...baseAttrs };
  for (const k of attrPicks) newAttrs[k] = Math.min(ATTR_MAX, newAttrs[k] + 1);

  // Transcender é o poder de classe "{c|e|o}_transcender" — troca o ganho de
  // Sanidade do NEX por um poder paranormal à escolha.
  const transcendId = `${classId[0]}_transcender`;
  const transcenderChosen = plan.powerChoices > 0 && powerMode === "transcender";

  const vitBefore = computeVitals(classId, plan.fromNex, baseAttrs.vig, baseAttrs.pre, origin);
  const vitAfter  = recomputeVitals(classId, plan.toNex, newAttrs, origin, transcenderChosen);
  const dPv  = vitAfter.pvMax  - vitBefore.pvMax;
  const dPe  = vitAfter.peMax  - vitBefore.peMax;
  const dSan = vitAfter.sanMax - vitBefore.sanMax;

  // Poder de trilha concedido neste passo (após a trilha estar definida).
  const grantedTrailPower = trailPowerAt(trailId, plan.trailPowerNex ?? -1);

  // ── Validação ────────────────────────────────────────────────────────────────
  const ownedPowers = new Set(progression.classPowers);
  const availablePowers = CLASS_POWERS_BY_CLASS[classId].filter((p) => {
    if (p.id === transcendId) return false; // Transcender tem modo próprio
    if (ownedPowers.has(p.id)) return p.description.includes("várias vezes"); // repetíveis
    return true;
  });

  const eligibleTrainSkills = SKILLS.filter((s) => {
    const cur = knownSkills[s.id] ?? "destreinado";
    if (plan.trainingTarget === "veterano") return cur === "treinado";
    if (plan.trainingTarget === "expert")   return cur === "veterano";
    return false;
  });

  const newMaxCircle = maxRitualCircle(plan.toNex) ?? 1;
  const learnableRituals = RITUALS.filter(
    (r) => r.circle <= newMaxCircle && !knownRituals.includes(r.id),
  );

  const trailOK = !plan.needsTrail || !!trailId;
  const attrOK  = attrPicks.length === plan.attrIncreases;
  const powerOK = plan.powerChoices === 0 || (
    powerMode === "transcender"
      ? paraPicks.length === plan.powerChoices
      : powerPicks.length === plan.powerChoices
  );
  const trainOK = plan.trainingCount === 0 || trainPicks.length === Math.min(plan.trainingCount, eligibleTrainSkills.length);
  const canConfirm = trailOK && attrOK && powerOK && trainOK && !saving;

  // ── Aplicar ──────────────────────────────────────────────────────────────────
  async function confirm() {
    if (!plan) return;
    setSaving(true);
    setError(null);

    // Poder de classe vs Transcender
    const gainedClassPowers = plan.powerChoices === 0
      ? []
      : powerMode === "transcender" ? [transcendId] : powerPicks;
    const gainedParanormal = plan.powerChoices > 0 && powerMode === "transcender" ? paraPicks : [];

    // Progressão atualizada
    const nextProg: OrdemProgression = {
      trailId: trailId ?? progression.trailId,
      classPowers: [...progression.classPowers, ...gainedClassPowers],
      paranormalPowers: [...progression.paranormalPowers, ...gainedParanormal],
      features: [...progression.features],
    };
    if (plan.featureText) nextProg.features.push({ nex: plan.toNex, text: plan.featureText });
    if (grantedTrailPower) {
      nextProg.features.push({ nex: plan.toNex, text: `Trilha · ${grantedTrailPower.name}: ${grantedTrailPower.description}` });
    }

    // Perícias atualizadas
    const nextSkills = { ...knownSkills };
    for (const id of trainPicks) nextSkills[id] = plan.trainingTarget ?? nextSkills[id];

    // Rituais atualizados
    const nextRituals = [...knownRituals, ...ritualPicks];

    const newPvMax = vitAfter.pvMax, newPeMax = vitAfter.peMax, newSanMax = vitAfter.sanMax;

    try {
      const res = await fetch(`/api/ordem/characters/${character.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nex: plan.toNex,
          agi: newAttrs.agi, forca: newAttrs.for, int: newAttrs.int, pre: newAttrs.pre, vig: newAttrs.vig,
          defense: computeDefense(newAttrs.agi),
          pvMax: newPvMax, pvCurrent: sheet.pvCurrent + Math.max(0, dPv),
          peMax: newPeMax, peCurrent: sheet.peCurrent + Math.max(0, dPe),
          sanMax: newSanMax, sanCurrent: sheet.sanCurrent + Math.max(0, dSan),
          trail: nextProg.trailId,
          abilities: nextProg,
          skills: nextSkills,
          rituals: nextRituals.length ? nextRituals : null,
        }),
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

  const cls = CLASS_BY_ID[classId];

  return (
    <Overlay onClose={onClose}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h2 style={titleStyle}>Subir NEX · {cls?.name}</h2>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: ACCENT, fontFamily: "var(--font-cinzel), serif" }}>
          {plan.fromNex}% → {plan.toNex}%
        </span>
      </div>

      {plan.featureText && (
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.55, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 12px" }}>
          <strong style={{ color: ACCENT }}>NEX {plan.toNex}%:</strong> {plan.featureText}
        </p>
      )}

      {/* Ganhos de vitais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <Delta label="PV"  value={vitAfter.pvMax}  delta={dPv}  color="#c03030" />
        <Delta label="PE"  value={vitAfter.peMax}  delta={dPe}  color={ACCENT} />
        <Delta label="SAN" value={vitAfter.sanMax} delta={dSan} color="#c9941f" />
      </div>

      {/* Trilha (NEX 10%) */}
      {plan.needsTrail && (
        <Group label="Escolha sua Trilha" hint="Define sua especialização — concede um poder agora e mais nos NEX 40%, 65% e 99%.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
            {TRAILS_BY_CLASS[classId].map((t) => {
              const on = trailId === t.id;
              const first = t.powers.find((p) => p.nex === 10);
              return (
                <button key={t.id} onClick={() => setTrailId(on ? null : t.id)} style={cardBtn(on)}>
                  <p style={{ fontSize: "0.86rem", fontWeight: 700, color: on ? ACCENT : "var(--text)" }}>{t.name}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", lineHeight: 1.45, marginTop: 3 }}>{t.description}</p>
                  {first && <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.45, marginTop: 5 }}><strong style={{ color: ACCENT }}>{first.name}:</strong> {first.description}</p>}
                </button>
              );
            })}
          </div>
        </Group>
      )}

      {/* Poder de trilha automático (40/65/99) */}
      {!plan.needsTrail && grantedTrailPower && (
        <Group label="Poder de Trilha" hint="Concedido automaticamente pela sua trilha.">
          <div style={{ ...cardBtn(true), cursor: "default" }}>
            <p style={{ fontSize: "0.86rem", fontWeight: 700, color: ACCENT }}>{grantedTrailPower.name}</p>
            <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5, marginTop: 3 }}>{grantedTrailPower.description}</p>
          </div>
        </Group>
      )}
      {!plan.needsTrail && plan.trailPowerNex && !trailId && (
        <p style={{ fontSize: "0.76rem", color: "#e0843c" }}>⚠ Nenhuma trilha definida — defina a trilha na ficha (Editar) para receber poderes de trilha.</p>
      )}

      {/* Aumento de atributo */}
      {plan.attrIncreases > 0 && (
        <Group label={`Aumento de Atributo (${attrPicks.length}/${plan.attrIncreases})`} hint="+1 em um atributo, até o máximo de 5.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {ATTR_KEYS.map((k) => {
              const on = attrPicks.includes(k);
              const atMax = baseAttrs[k] >= ATTR_MAX;
              const full = attrPicks.length >= plan.attrIncreases && !on;
              return (
                <button key={k} disabled={atMax || full} onClick={() => setAttrPicks(on ? attrPicks.filter((x) => x !== k) : [...attrPicks, k])}
                  style={{ ...cardBtn(on), textAlign: "center", opacity: atMax ? 0.4 : 1, cursor: atMax || full ? "default" : "pointer" }}>
                  <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", fontWeight: 700 }}>{ATTR_ABBR[k]}</p>
                  <p style={{ fontSize: "1.2rem", fontWeight: 800, color: on ? ACCENT : "var(--text)", fontFamily: "var(--font-cinzel), serif" }}>
                    {baseAttrs[k]}{on ? `→${newAttrs[k]}` : ""}
                  </p>
                  <p style={{ fontSize: "0.56rem", color: "var(--text-subtle)" }}>{ATTR_LABEL[k]}</p>
                </button>
              );
            })}
          </div>
        </Group>
      )}

      {/* Avanço de poder: subir normalmente OU transcender */}
      {plan.powerChoices > 0 && (
        <Group
          label={`Avanço de Poder${plan.powerChoices > 1 ? ` (${plan.powerChoices})` : ""}`}
          hint={plan.toNex === 50 ? "NEX 50% inclui Versatilidade: um poder adicional." : undefined}
        >
          {/* Toggle */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 4 }}>
            <button onClick={() => setPowerMode("normal")} style={toggleBtn(powerMode === "normal")}>
              <p style={{ fontSize: "0.84rem", fontWeight: 700, color: powerMode === "normal" ? ACCENT : "var(--text)" }}>Subir normalmente</p>
              <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginTop: 2 }}>Poder de {cls?.name} + ganho normal de Sanidade.</p>
            </button>
            <button onClick={() => setPowerMode("transcender")} style={toggleBtn(powerMode === "transcender")}>
              <p style={{ fontSize: "0.84rem", fontWeight: 700, color: powerMode === "transcender" ? "#b89cf0" : "var(--text)" }}>Transcender</p>
              <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginTop: 2 }}>Poder paranormal. Você NÃO ganha Sanidade neste NEX.</p>
            </button>
          </div>

          {powerMode === "normal" ? (
            <>
              <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>Escolha {plan.powerChoices} poder{plan.powerChoices > 1 ? "es" : ""} ({powerPicks.length}/{plan.powerChoices}).</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                {availablePowers.map((p) => {
                  const on = powerPicks.includes(p.id);
                  const full = powerPicks.length >= plan.powerChoices && !on;
                  return (
                    <button key={p.id} disabled={full} onClick={() => setPowerPicks(on ? powerPicks.filter((x) => x !== p.id) : [...powerPicks, p.id])}
                      style={{ ...cardBtn(on), opacity: full ? 0.5 : 1, cursor: full ? "default" : "pointer" }}>
                      <p style={{ fontSize: "0.82rem", fontWeight: 700, color: on ? ACCENT : "var(--text)" }}>{p.name}</p>
                      {p.prerequisite && <p style={{ fontSize: "0.64rem", color: "#c9941f", marginTop: 2 }}>Pré-req: {p.prerequisite}</p>}
                      <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", lineHeight: 1.45, marginTop: 3 }}>{p.description}</p>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: "0.72rem", color: "#b89cf0" }}>
                ⚠ Transcender · Sanidade não aumenta neste NEX. Escolha {plan.powerChoices} poder{plan.powerChoices > 1 ? "es" : ""} paranormal ({paraPicks.length}/{plan.powerChoices}).
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                {PARANORMAL_POWERS.map((pp) => {
                  const owned = progression.paranormalPowers.includes(pp.id);
                  const on = paraPicks.includes(pp.id);
                  const full = paraPicks.length >= plan.powerChoices && !on;
                  return (
                    <button key={pp.id} disabled={owned || full} onClick={() => setParaPicks(on ? paraPicks.filter((x) => x !== pp.id) : [...paraPicks, pp.id])}
                      style={{ ...cardBtn(on), opacity: owned ? 0.4 : full ? 0.5 : 1, cursor: owned || full ? "default" : "pointer" }}>
                      <p style={{ fontSize: "0.82rem", fontWeight: 700, color: on ? "#b89cf0" : "var(--text)" }}>{pp.name}{owned ? " ✓" : ""}</p>
                      <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#b89cf0", marginTop: 2 }}>{pp.element}{pp.prerequisite ? ` · req. ${pp.prerequisite}` : ""}</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", lineHeight: 1.45, marginTop: 3 }}>{pp.description}</p>
                      <p style={{ fontSize: "0.66rem", color: "var(--text-muted)", lineHeight: 1.4, marginTop: 3 }}><strong style={{ color: "#9b7fd4" }}>Afinidade:</strong> {pp.affinity}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </Group>
      )}

      {/* Grau de treinamento */}
      {plan.trainingCount > 0 && (
        <Group label={`Grau de Treinamento → ${plan.trainingTarget ? TRAIN_LABEL[plan.trainingTarget] : ""} (${trainPicks.length}/${Math.min(plan.trainingCount, eligibleTrainSkills.length)})`}
          hint={`Melhore até ${plan.trainingCount} perícias um grau. Elegíveis: perícias atualmente ${plan.trainingTarget === "veterano" ? "treinadas" : "veteranas"}.`}>
          {eligibleTrainSkills.length === 0 ? (
            <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Nenhuma perícia elegível no momento.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {eligibleTrainSkills.map((s) => {
                const on = trainPicks.includes(s.id);
                const cap = Math.min(plan.trainingCount, eligibleTrainSkills.length);
                const full = trainPicks.length >= cap && !on;
                return (
                  <button key={s.id} disabled={full} onClick={() => setTrainPicks(on ? trainPicks.filter((x) => x !== s.id) : [...trainPicks, s.id])}
                    style={{ padding: "6px 12px", fontSize: "0.78rem", fontWeight: 600, background: on ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${on ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-full)", color: on ? ACCENT : full ? "var(--text-subtle)" : "var(--text)", cursor: full ? "default" : "pointer" }}>
                    {SKILL_BY_ID[s.id]?.name ?? s.id}
                  </button>
                );
              })}
            </div>
          )}
        </Group>
      )}

      {/* Rituais (Ocultista) */}
      {classId === "ocultista" && (
        <Group
          label={`Aprender Rituais${plan.ritualCircleUnlocked ? ` · ${plan.ritualCircleUnlocked}º círculo liberado!` : ""} (${ritualPicks.length} novo${ritualPicks.length !== 1 ? "s" : ""})`}
          hint={`Você pode aprender novos rituais até o ${newMaxCircle}º círculo. Opcional.`}>
          <RitualLearnGrid learnable={learnableRituals} picks={ritualPicks} setPicks={setRitualPicks} />
        </Group>
      )}

      {error && <p style={{ fontSize: "0.8rem", color: "#ff6b6b" }}>{error}</p>}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <button onClick={onClose} style={ghostBtn}>Cancelar</button>
        <button onClick={confirm} disabled={!canConfirm} style={{ ...primaryBtn, opacity: canConfirm ? 1 : 0.45, cursor: canConfirm ? "pointer" : "default" }}>
          {saving ? "Aplicando…" : `Confirmar NEX ${plan.toNex}%`}
        </button>
      </div>
    </Overlay>
  );
}

// ─── Ritual picker (agrupado por elemento) ────────────────────────────────────
function RitualLearnGrid({ learnable, picks, setPicks }: { learnable: typeof RITUALS; picks: string[]; setPicks: (v: string[]) => void }) {
  const [el, setEl] = useState<Element | "all">("all");
  const filtered = learnable.filter((r) => el === "all" || r.element === el);
  if (learnable.length === 0) return <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", fontStyle: "italic" }}>Você já conhece todos os rituais disponíveis.</p>;
  return (
    <>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <FilterChip label="Todos" on={el === "all"} onClick={() => setEl("all")} />
        {(["conhecimento", "energia", "morte", "sangue", "medo"] as Element[]).map((e) => (
          <FilterChip key={e} label={ELEMENT_LABEL_PT[e]} on={el === e} color={ELEMENT_COLOR_UI[e]} onClick={() => setEl(e)} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8, maxHeight: 260, overflowY: "auto" }}>
        {filtered.map((r) => {
          const on = picks.includes(r.id);
          return (
            <button key={r.id} onClick={() => setPicks(on ? picks.filter((x) => x !== r.id) : [...picks, r.id])} style={cardBtn(on)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: on ? ACCENT : "var(--text)" }}>{r.name}</span>
                <span style={{ fontSize: "0.6rem", color: ELEMENT_COLOR_UI[r.element], fontWeight: 700 }}>{r.circle}º · {RITUAL_COST[r.circle as RitualCircle]} PE</span>
              </div>
              <p style={{ fontSize: "0.64rem", color: "var(--text-subtle)" }}>{ELEMENT_LABEL_PT[r.element]} · {r.execution}</p>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── Bits ─────────────────────────────────────────────────────────────────────
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(3,5,10,0.78)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 760, background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: "24px 26px", display: "flex", flexDirection: "column", gap: 18, boxShadow: "0 24px 70px rgba(0,0,0,0.6)" }}>
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
      <p style={{ fontSize: "0.68rem", color: delta >= 0 ? "#5fbf7f" : "#e0843c", fontWeight: 700 }}>{delta >= 0 ? "+" : ""}{delta}</p>
    </div>
  );
}

function FilterChip({ label, on, color, onClick }: { label: string; on: boolean; color?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: "4px 11px", fontSize: "0.72rem", fontWeight: 600, background: on ? (color ? `${color}22` : ACCENT_DIM) : "var(--surface-2)", border: `1px solid ${on ? (color ?? ACCENT_BORD) : "var(--border)"}`, borderRadius: "var(--radius-full)", color: on ? (color ?? ACCENT) : "var(--text-muted)", cursor: "pointer" }}>
      {label}
    </button>
  );
}

function toggleBtn(on: boolean): React.CSSProperties {
  return {
    textAlign: "left", padding: "12px 14px",
    background: on ? ACCENT_DIM : "var(--surface-2)",
    border: `1.5px solid ${on ? ACCENT_BORD : "var(--border)"}`,
    borderRadius: "var(--radius-lg)", cursor: "pointer", transition: "all 0.12s",
    boxShadow: on ? "0 0 14px rgba(255,255,255,0.1)" : "none",
  };
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

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-cinzel), serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--text)",
};
const primaryBtn: React.CSSProperties = {
  padding: "10px 22px", borderRadius: "var(--radius-lg)", background: ACCENT_DIM,
  border: `1px solid ${ACCENT_BORD}`, color: ACCENT, fontWeight: 700, fontSize: "0.88rem",
  fontFamily: "inherit", boxShadow: "0 0 16px rgba(255,255,255,0.1)",
};
const ghostBtn: React.CSSProperties = {
  padding: "10px 18px", borderRadius: "var(--radius-lg)", background: "var(--surface-2)",
  border: "1px solid var(--border)", color: "var(--text-muted)", fontWeight: 600,
  fontSize: "0.86rem", fontFamily: "inherit", cursor: "pointer",
};
