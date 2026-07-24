"use client";

import { useRef } from "react";
import { PLANETS } from "@/lib/starwars/planets";
import { SKILL_BY_ID } from "@/lib/starwars/skills";
import { smoothScrollTo } from "@/lib/smoothScroll";
import type { WizardData } from "../CharacterWizard";
import { SW, Panel, SectionTitle, Badge, SelectCard, gridAutoFill } from "../../ui";

interface Props { planetId: string | null; planetSkillChoice: string | null; onChange: (p: Partial<WizardData>) => void }

const PLANETS_SORTED = [...PLANETS].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

export function StepPlanet({ planetId, planetSkillChoice, onChange }: Props) {
  const planet = planetId ? PLANETS.find((p) => p.id === planetId) : undefined;
  const detailRef = useRef<HTMLDivElement>(null);

  function pick(id: string) {
    if (planetId === id) return;
    const p = PLANETS.find((x) => x.id === id);
    onChange({ planetId: id, planetSkillChoice: p && p.naturalAbility.skills.length === 1 ? p.naturalAbility.skills[0] : "" });
    setTimeout(() => { if (detailRef.current) smoothScrollTo(detailRef.current); }, 50);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <SectionTitle eyebrow="Etapa 2 de 8" title="Planeta de Origem" desc="Seu planeta natal concede uma Habilidade Natal: +5 fixo numa perícia específica, somado por cima do grau de treinamento. 28 planetas disponíveis." />

      <div style={gridAutoFill(165)}>
        {PLANETS_SORTED.map((p) => (
          <SelectCard key={p.id} label={p.name} sublabel={p.naturalAbility.name} selected={planetId === p.id} onClick={() => pick(p.id)} />
        ))}
      </div>

      {planet && (
        <Panel active glow>
          <div ref={detailRef} style={{ scrollMarginTop: 120 }} />
          <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", fontWeight: 700, color: SW.accentBright, marginBottom: 8 }}>{planet.name}</h3>
          <p style={{ fontSize: "0.84rem", color: SW.textMuted, lineHeight: 1.65, marginBottom: 14 }}>{planet.description}</p>
          <Badge tone="gold">{planet.naturalAbility.name}: {planet.naturalAbility.description}</Badge>

          {planet.naturalAbility.skills.length > 1 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${SW.panelBorder}` }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 800, color: SW.textMuted, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 8 }}>
                Escolha qual perícia recebe o +5
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {planet.naturalAbility.skills.map((skillId) => {
                  const on = planetSkillChoice === skillId;
                  return (
                    <button key={skillId} onClick={() => onChange({ planetSkillChoice: skillId })}
                      style={{ padding: "7px 16px", fontSize: "0.8rem", fontWeight: 700, borderRadius: 6, border: `1px solid ${on ? SW.accentBord : "var(--border)"}`, background: on ? SW.accentDim : "rgba(255,255,255,0.02)", color: on ? SW.accentBright : SW.textMuted, cursor: "pointer" }}>
                      {SKILL_BY_ID[skillId]?.name ?? skillId}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
