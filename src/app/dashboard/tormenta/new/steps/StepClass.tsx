"use client";

import { CLASSES, CLASS_BY_ID } from "@/lib/tormenta/classes";
import { GODS } from "@/lib/tormenta/gods";
import { MAGIC_SCHOOLS } from "@/lib/tormenta/spells";
import { SKILL_BY_ID } from "@/lib/tormenta/data";
import type { WizardData } from "../CharacterWizard";
import { ACCENT, ACCENT_LIGHT, ACCENT_DIM, ACCENT_BORD } from "../CharacterWizard";
import { Intro } from "./Intro";

interface Props {
  classId: string | null;
  pathId: string | null;
  schoolsChosen: string[];
  godId: string | null;
  onChange: (p: Partial<WizardData>) => void;
}

function skillLabel(id: string): string {
  if (id.includes("|")) return id.split("|").map((x) => SKILL_BY_ID[x]?.name ?? x).join(" ou ");
  return SKILL_BY_ID[id]?.name ?? id;
}

export function StepClass({ classId, pathId, schoolsChosen, godId, onChange }: Props) {
  const cls = classId ? CLASS_BY_ID[classId] : undefined;

  function pick(id: string) {
    if (classId === id) return;
    onChange({ classId: id, pathId: "", schoolsChosen: [], godId: null, classFixedChoice: {}, classSkillChoices: [] });
  }

  function toggleSchool(school: string) {
    if (!cls?.spellcasting?.schoolChoiceCount) return;
    const chosen = schoolsChosen.includes(school);
    if (chosen) onChange({ schoolsChosen: schoolsChosen.filter((s) => s !== school) });
    else if (schoolsChosen.length < cls.spellcasting.schoolChoiceCount) onChange({ schoolsChosen: [...schoolsChosen, school] });
  }

  const eligibleGods = cls?.godChoice
    ? GODS.filter((g) => (cls.spellcasting?.tradition === "divina" || cls.id === "paladino") && (cls.id === "clerigo" ? g.clericAllowed : cls.id === "paladino" ? g.paladinAllowed : true))
        .filter((g) => cls.godChoice!.allowedGodIds.length === 0 || cls.godChoice!.allowedGodIds.includes(g.id))
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro title="Classe" text="A classe define seu papel: PV, PM, perícias e habilidades. Tormenta 20 tem 14 classes." />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CLASSES.map((c) => {
          const isSel = classId === c.id;
          return (
            <div key={c.id} style={{ background: isSel ? ACCENT_DIM : "var(--surface)", border: `1px solid ${isSel ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "all 0.2s" }}>
              <button onClick={() => pick(c.id)} style={{ all: "unset", cursor: "pointer", display: "block", width: "100%", padding: "16px 20px", boxSizing: "border-box" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.05rem", fontWeight: 700, color: isSel ? ACCENT_LIGHT : "var(--text)" }}>{c.icon} {c.name}</h3>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isSel ? ACCENT : "var(--border)"}`, background: isSel ? ACCENT : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isSel && <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 900 }}>✓</span>}
                  </div>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>{c.description}</p>
              </button>

              {isSel && (
                <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <Stat label="PV" value={`${c.pvBase} + Con`} sub={`+${c.pvPerLevel}+Con / nível`} />
                    <Stat label="PM" value={`${c.pmPerLevel}/nível`} sub={c.spellcasting ? "+ atributo-chave" : "—"} />
                  </div>

                  <Block title="Perícias fixas">
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      {c.skillsFixed.map(skillLabel).join(", ")} · +{c.skillChoiceCount} à escolha (próxima etapa)
                    </p>
                  </Block>

                  <Block title="Proficiências">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {c.proficiencies.length === 0 && <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>Nenhuma além de armas simples e armaduras leves</span>}
                      {c.proficiencies.map((p) => <Tag key={p}>{p}</Tag>)}
                    </div>
                  </Block>

                  <Block title="Habilidades de 1º nível">
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {c.level1Features.map((f) => (
                        <div key={f.name}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: ACCENT_LIGHT }}>{f.name}. </span>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{f.description}</span>
                        </div>
                      ))}
                    </div>
                  </Block>

                  {c.paths && (
                    <Block title="Caminho (escolha permanente)">
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {c.paths.map((p) => {
                          const sel = pathId === p.id;
                          return (
                            <button key={p.id} onClick={() => onChange({ pathId: p.id })}
                              style={{ textAlign: "left", padding: "10px 14px", background: sel ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${sel ? ACCENT : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: sel ? ACCENT_LIGHT : "var(--text)" }}>{p.name}</p>
                              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{p.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </Block>
                  )}

                  {c.spellcasting?.schoolChoiceCount && (
                    <Block title={`Escolas de Magia (${schoolsChosen.length}/${c.spellcasting.schoolChoiceCount})`}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {MAGIC_SCHOOLS.map((s) => {
                          const sel = schoolsChosen.includes(s);
                          const maxed = !sel && schoolsChosen.length >= c.spellcasting!.schoolChoiceCount!;
                          return (
                            <button key={s} onClick={() => toggleSchool(s)} disabled={maxed}
                              style={{ padding: "5px 12px", background: sel ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${sel ? ACCENT : "var(--border)"}`, borderRadius: "var(--radius-full)", color: sel ? ACCENT_LIGHT : "var(--text)", fontSize: "0.78rem", fontWeight: 600, cursor: maxed ? "not-allowed" : "pointer", opacity: maxed ? 0.4 : 1 }}>
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </Block>
                  )}

                  {c.godChoice && (
                    <Block title="Devoto de">
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {c.godChoice.allowNone && (
                          <button onClick={() => onChange({ godId: null })}
                            style={{ textAlign: "left", padding: "8px 12px", background: godId === null ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${godId === null ? ACCENT : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer", fontSize: "0.82rem", color: godId === null ? ACCENT_LIGHT : "var(--text)" }}>
                            Nenhum deus específico (Panteão / paladino do bem)
                          </button>
                        )}
                        {eligibleGods.map((g) => {
                          const sel = godId === g.id;
                          return (
                            <button key={g.id} onClick={() => onChange({ godId: g.id })}
                              style={{ textAlign: "left", padding: "8px 12px", background: sel ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${sel ? ACCENT : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer" }}>
                              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: sel ? ACCENT_LIGHT : "var(--text)" }}>{g.name} — {g.title}</p>
                              <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: 1 }}>{g.edict}</p>
                            </button>
                          );
                        })}
                      </div>
                    </Block>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{title}</p>
      {children}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ padding: "8px 14px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-lg)" }}>
      <p style={{ fontSize: "0.64rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ fontSize: "0.92rem", fontWeight: 700, color: ACCENT_LIGHT }}>{value}</p>
      <p style={{ fontSize: "0.64rem", color: "var(--text-subtle)", marginTop: 1 }}>{sub}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span style={{ padding: "4px 11px", fontSize: "0.74rem", fontWeight: 600, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", color: "var(--text)" }}>{children}</span>;
}
