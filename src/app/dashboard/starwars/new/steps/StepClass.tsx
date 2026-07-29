"use client";

import { useRef, useState } from "react";
import { CLASSES, ARCHETYPE_LABEL, ARCHETYPE_FORMULA } from "@/lib/starwars/classes";
import { getClassAbilities, getAbilitiesGroupedByLevel } from "@/lib/starwars/powers/registry";
import { smoothScrollTo } from "@/lib/smoothScroll";
import type { WizardData } from "../CharacterWizard";
import { SW, Panel, SectionTitle, Badge, SelectCard, gridAutoFill } from "../../ui";

interface Props { classId: string | null; classAbilityChoice: string | null; onChange: (p: Partial<WizardData>) => void }

export function StepClass({ classId, classAbilityChoice, onChange }: Props) {
  const cls = classId ? CLASSES.find((c) => c.id === classId) : undefined;
  const selectable = CLASSES;
  const firstAbilities = cls ? getClassAbilities(cls.id).filter((a) => a.level === 1) : [];
  const grouped = cls ? getAbilitiesGroupedByLevel(cls.id, 30) : [];
  const detailRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);

  function pick(id: string) {
    if (classId === id) return;
    onChange({ classId: id, classAbilityChoice: "" });
    setTimeout(() => { if (detailRef.current) smoothScrollTo(detailRef.current); }, 50);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <SectionTitle eyebrow="Etapa 4 de 8" title="Classe" desc="Sua classe define papel, arquétipo (Marcial / Especialista / Sensível à Força) e progressão de habilidades até o nível 99." />

      <div style={gridAutoFill(175)}>
        {selectable.map((c) => (
          <SelectCard key={c.id} label={c.name} sublabel={ARCHETYPE_LABEL[c.archetype]} selected={classId === c.id} onClick={() => pick(c.id)} />
        ))}
      </div>

      {cls && (
        <Panel active glow>
          <div ref={detailRef} style={{ scrollMarginTop: 120 }} />
          <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", fontWeight: 700, color: SW.accentBright, marginBottom: 8 }}>{cls.name}</h3>
          <p style={{ fontSize: "0.84rem", color: SW.textMuted, lineHeight: 1.65, marginBottom: 12 }}>{cls.description}</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <Badge>{ARCHETYPE_LABEL[cls.archetype]}</Badge>
            <Badge tone="muted">PV {ARCHETYPE_FORMULA[cls.archetype].pv1} (+{ARCHETYPE_FORMULA[cls.archetype].pvPerLevel}/nível)</Badge>
            <Badge tone="muted">PE {ARCHETYPE_FORMULA[cls.archetype].pe1} (+{ARCHETYPE_FORMULA[cls.archetype].pePerLevel}/nível)</Badge>
            <Badge tone="muted">Perícias ×{ARCHETYPE_FORMULA[cls.archetype].skillMultiplier}</Badge>
          </div>

          {firstAbilities.length > 0 && (
            <div style={{ paddingTop: 14, borderTop: `1px solid ${SW.panelBorder}`, display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 800, color: SW.textMuted, letterSpacing: "0.09em", textTransform: "uppercase" }}>
                {firstAbilities.length > 1 ? "Escolha 1 habilidade de nível 1" : "Habilidade de nível 1"}
              </p>
              {firstAbilities.length > 1 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {firstAbilities.map((a) => {
                    const selected = classAbilityChoice === a.name;
                    return (
                      <button key={a.name} onClick={() => onChange({ classAbilityChoice: a.name })}
                        style={{ textAlign: "left", padding: "10px 13px", background: selected ? SW.accentDim : "rgba(255,255,255,0.02)", border: `1px solid ${selected ? SW.accentBord : "var(--border)"}`, borderRadius: 6, cursor: "pointer" }}>
                        <p style={{ fontSize: "0.8rem", color: selected ? SW.accentBright : "var(--text)" }}>
                          <strong>{a.name}</strong>{a.combat ? <span style={{ color: SW.danger }}> (combate)</span> : null}
                        </p>
                        <p style={{ fontSize: "0.76rem", color: SW.textMuted, marginTop: 2, lineHeight: 1.5 }}>{a.description}</p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                firstAbilities.map((a) => (
                  <p key={a.name} style={{ fontSize: "0.8rem", color: SW.textMuted, lineHeight: 1.5 }}>
                    <strong style={{ color: "var(--text)" }}>{a.name}</strong>{a.combat ? <span style={{ color: SW.danger }}> (combate)</span> : null}: {a.description}
                  </p>
                ))
              )}
            </div>
          )}

          <div style={{ paddingTop: 14, marginTop: 14, borderTop: `1px solid ${SW.panelBorder}` }}>
            <button onClick={() => setShowAll((v) => !v)} style={{ background: "none", border: "none", color: SW.accentLight, fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", padding: 0 }}>
              {showAll ? "▾ Ocultar progressão completa" : "▸ Ver progressão completa (até nível 25)"}
            </button>
            {showAll && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, maxHeight: 360, overflowY: "auto" }}>
                {grouped.map(({ level, abilities }) => (
                  <div key={level}>
                    <p style={{ fontSize: "0.66rem", fontWeight: 800, color: SW.gold, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>Nível de Classe {level}</p>
                    {abilities.map((a) => (
                      <p key={a.name} style={{ fontSize: "0.78rem", color: SW.textMuted, lineHeight: 1.5, marginBottom: 3 }}>
                        <strong style={{ color: "var(--text)" }}>{a.name}</strong>{a.combat ? <span style={{ color: SW.danger }}> (combate)</span> : null}: {a.description}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
