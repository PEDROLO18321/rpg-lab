"use client";

import { SPECIES_BY_ID } from "@/lib/starwars/species";
import { PLANET_BY_ID } from "@/lib/starwars/planets";
import { CLASS_BY_ID } from "@/lib/starwars/classes";
import { PATH_LABEL, ATTR_KEYS, ATTR_LABEL, type StarWarsAttrs } from "@/lib/starwars/data";
import { SKILL_BY_ID } from "@/lib/starwars/skills";
import { computeVitals, planetSkillBonus, effectivePlanetSkill } from "@/lib/starwars/creation";
import type { WizardData } from "../CharacterWizard";
import { SW, Panel, SectionTitle, Badge, Gauge } from "../../ui";

interface Props { data: Partial<WizardData>; attrsFinal: StarWarsAttrs; skillCount: number }

export function StepReview({ data, attrsFinal, skillCount }: Props) {
  const species = data.speciesId ? SPECIES_BY_ID[data.speciesId] : undefined;
  const planet = data.planetId ? PLANET_BY_ID[data.planetId] : undefined;
  const cls = data.classId ? CLASS_BY_ID[data.classId] : undefined;
  const vitals = data.classId && data.speciesId ? computeVitals(data.classId, data.speciesId, attrsFinal.vig, attrsFinal.sen, attrsFinal.pre) : null;
  const planetSkill = effectivePlanetSkill(data.planetId, data.planetSkillChoice);
  const freeSkills = [...(species?.initialSkills ?? []), ...(planetSkill ? [planetSkill] : [])];
  const allSkills = [...new Set([...freeSkills, ...(data.skillChoices ?? [])])];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle eyebrow="Etapa 8 de 8" title="Revisão Final" desc="Confira tudo antes de dar vida ao personagem." />

      <Panel active glow>
        <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.35rem", fontWeight: 700, color: SW.accentBright, marginBottom: 6 }}>{data.charName || "(sem nome)"}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          <Badge>{species?.name}</Badge>
          <Badge tone="gold">{planet?.name}</Badge>
          <Badge tone="muted">{data.pathId ? PATH_LABEL[data.pathId] : "—"}</Badge>
          <Badge>{cls?.name}</Badge>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8, marginBottom: 20 }}>
          {ATTR_KEYS.map((k) => (
            <div key={k} style={{ textAlign: "center", padding: "10px 6px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.6rem", color: SW.textSubtle, textTransform: "uppercase", letterSpacing: "0.06em" }}>{ATTR_LABEL[k]}</p>
              <p style={{ fontSize: "1.15rem", fontWeight: 800, color: SW.accentBright, fontFamily: "var(--font-cinzel), serif" }}>{attrsFinal[k]}</p>
            </div>
          ))}
        </div>

        {vitals && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20, paddingTop: 16, borderTop: `1px solid ${SW.panelBorder}` }}>
            <Gauge label="Vida" current={vitals.pvMax} max={vitals.pvMax} color="#e06c6c" compact />
            <Gauge label="Energia" current={vitals.peMax} max={vitals.peMax} color={SW.accentLight} compact />
            <Gauge label="Poder" current={vitals.ppMax} max={vitals.ppMax} color={SW.gold} compact />
          </div>
        )}

        <div style={{ paddingTop: 16, borderTop: `1px solid ${SW.panelBorder}` }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 800, color: SW.textMuted, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 8 }}>
            Perícias Iniciante ({allSkills.length}/{skillCount + freeSkills.length})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allSkills.map((id) => {
              const bonus = planetSkillBonus(data.planetId, data.planetSkillChoice, id);
              return (
                <Badge key={id} tone={bonus ? "gold" : "muted"}>
                  {SKILL_BY_ID[id]?.name}{bonus ? " (+5 planeta)" : ""}
                </Badge>
              );
            })}
          </div>
        </div>

        {planet && (
          <p style={{ fontSize: "0.78rem", color: SW.gold, marginTop: 16 }}>
            {planet.naturalAbility.name}: {planet.naturalAbility.description}
          </p>
        )}

        {(data.desc?.organization || data.desc?.history) && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${SW.panelBorder}`, display: "flex", flexDirection: "column", gap: 6 }}>
            {data.desc?.organization && <p style={{ fontSize: "0.8rem", color: SW.textMuted }}>Organização: {data.desc.organization}</p>}
            {data.desc?.history && <p style={{ fontSize: "0.8rem", color: SW.textMuted }}>História: {data.desc.history}</p>}
          </div>
        )}
      </Panel>
    </div>
  );
}
