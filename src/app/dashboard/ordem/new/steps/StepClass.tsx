"use client";

import type { OrdemWizardData } from "../CharacterWizard";
import { Intro } from "./StepAttrs";
import { CLASSES, SKILL_BY_ID, type ClassId } from "@/lib/ordem/data";
import { CLASS_NEX_TABLE } from "@/lib/ordem/abilities";

const BORD_SEL = "rgba(255,255,255,0.55)";
const BG_SEL = "rgba(255,255,255,0.08)";

interface Props {
  data: OrdemWizardData;
  onChange: (p: Partial<OrdemWizardData>) => void;
}

export function StepClass({ data, onChange }: Props) {
  function pick(id: ClassId) {
    if (data.classId === id) return;
    onChange({ classId: id, fixedChoices: {}, trainedSkills: [] });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Intro
        title="Classe"
        text="A classe define seu papel: quantos PV, PE e Sanidade você tem, suas proficiências e as perícias que domina. Selecione para ver tudo que ela concede."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {CLASSES.map((c) => {
          const isSel = data.classId === c.id;
          return (
            <div
              key={c.id}
              style={{
                background: isSel ? BG_SEL : "var(--surface)",
                border: `1px solid ${isSel ? BORD_SEL : "var(--border)"}`,
                borderRadius: "var(--radius-xl)",
                transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
                boxShadow: isSel ? "0 0 0 1px rgba(255,255,255,0.3), 0 14px 40px rgba(0,0,0,0.35)" : "none",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => pick(c.id)}
                style={{ all: "unset", cursor: "pointer", display: "block", width: "100%", padding: "18px 20px", boxSizing: "border-box" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", fontWeight: 700, color: isSel ? "#ffffff" : "var(--text)" }}>
                    {c.name}
                  </h3>
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `2px solid ${isSel ? "#ffffff" : "var(--border)"}`,
                      background: isSel ? "#ffffff" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {isSel && <span style={{ color: "#06090f", fontSize: "0.7rem", fontWeight: 900 }}>✓</span>}
                  </div>
                </div>
                <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{c.description}</p>
              </button>

              {/* Expansão */}
              {isSel && (
                <div className="ordem-expand-in" style={{ padding: "0 20px 20px" }}>
                  <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.12)", display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Vitais */}
                    <Block title="Vitalidade">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        <Stat label="PV" value={`${c.pvInitial} + VIG`} sub={`+${c.pvPerNex}+VIG / NEX`} />
                        <Stat label="PE" value={`${c.peInitial} + PRE`} sub={`+${c.pePerNex}+PRE / NEX`} />
                        <Stat label="SAN" value={`${c.sanInitial}`} sub={`+${c.sanPerNex} / NEX`} />
                      </div>
                    </Block>

                    {/* Perícias */}
                    <Block title="Perícias treinadas">
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {c.fixedSkills.map((f) => {
                          if (!f.includes("|")) {
                            return (
                              <span key={f} style={{ fontSize: "0.82rem", color: "#ffffff", fontWeight: 600 }}>
                                ✓ {SKILL_BY_ID[f]?.name ?? f}
                              </span>
                            );
                          }
                          const opts = f.split("|");
                          const chosen = data.fixedChoices[f];
                          return (
                            <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Escolha:</span>
                              {opts.map((opt) => {
                                const on = chosen === opt;
                                return (
                                  <button
                                    key={opt}
                                    onClick={() => onChange({ fixedChoices: { ...data.fixedChoices, [f]: opt } })}
                                    style={{
                                      padding: "5px 12px", fontSize: "0.78rem", fontWeight: 600,
                                      background: on ? "rgba(255,255,255,0.16)" : "var(--surface-2)",
                                      border: `1px solid ${on ? BORD_SEL : "var(--border)"}`,
                                      borderRadius: "var(--radius-full)",
                                      color: on ? "#ffffff" : "var(--text)", cursor: "pointer",
                                    }}
                                  >
                                    {SKILL_BY_ID[opt]?.name ?? opt}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                          + <strong style={{ color: "#ffffff" }}>{c.skillBase} + Intelecto</strong> perícias à sua escolha (próxima etapa)
                        </span>
                      </div>
                    </Block>

                    {/* Proficiências */}
                    <Block title="Proficiências">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {c.proficiencies.map((p) => (
                          <span key={p} style={{ padding: "4px 11px", fontSize: "0.74rem", fontWeight: 600, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", color: "var(--text)" }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </Block>

                    {/* Habilidade inicial NEX 5% */}
                    <Block title="Habilidade inicial (NEX 5%)">
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                        {CLASS_NEX_TABLE[c.id as ClassId]?.[0]?.description ?? "—"}
                      </p>
                    </Block>

                    {/* Progressão */}
                    <Block title="Progressão (NEX)">
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                        Trilha em <strong style={{ color: "#ffffff" }}>NEX 10%</strong> · poderes de classe a partir de <strong style={{ color: "#ffffff" }}>NEX 15%</strong>.
                      </p>
                    </Block>

                    {/* Famosos */}
                    <Block title="Personagens famosos">
                      <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", lineHeight: 1.6 }}>{c.famous.join(" · ")}</p>
                    </Block>
                  </div>
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
    <div style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "var(--radius-lg)" }}>
      <p style={{ fontSize: "0.64rem", color: "var(--text-subtle)", fontWeight: 700, letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#ffffff" }}>{value}</p>
      <p style={{ fontSize: "0.64rem", color: "var(--text-subtle)", marginTop: 1 }}>{sub}</p>
    </div>
  );
}
