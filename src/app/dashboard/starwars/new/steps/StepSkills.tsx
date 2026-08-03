"use client";

import { SKILLS } from "@/lib/starwars/skills";
import { SPECIES_BY_ID } from "@/lib/starwars/species";
import { ATTR_ABBR } from "@/lib/starwars/data";
import { planetSkillBonus, effectivePlanetSkill } from "@/lib/starwars/creation";
import type { WizardData } from "../CharacterWizard";
import { SW, SectionTitle, Badge, gridAutoFill } from "../../ui";

interface Props {
  classId: string | null;
  speciesId: string | null;
  planetId: string | null;
  planetSkillChoice: string | null;
  skillCount: number;
  skillChoices: string[];
  onChange: (p: Partial<WizardData>) => void;
}

export function StepSkills({ speciesId, planetId, planetSkillChoice, skillCount, skillChoices, onChange }: Props) {
  const species = speciesId ? SPECIES_BY_ID[speciesId] : undefined;
  const alreadyFromSpecies = species?.initialSkills ?? [];
  const planetSkill = effectivePlanetSkill(planetId, planetSkillChoice);
  const free = [...alreadyFromSpecies, ...(planetSkill ? [planetSkill] : [])];

  function toggle(id: string) {
    if (free.includes(id)) return;
    const has = skillChoices.includes(id);
    if (has) {
      onChange({ skillChoices: skillChoices.filter((x) => x !== id) });
    } else if (skillChoices.length < skillCount) {
      onChange({ skillChoices: [...skillChoices, id] });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle eyebrow="Etapa 5 de 8" title="Perícias" desc="As perícias da sua espécie e a da Habilidade Natal do seu planeta já vêm treinadas (Iniciante) de graça — a do planeta ainda recebe +5 extra por cima. Escolha o restante." />

      <Badge tone={skillChoices.length === skillCount ? "success" : "gold"}>{skillChoices.length}/{skillCount} selecionadas</Badge>

      <div style={gridAutoFill(215)}>
        {SKILLS.map((s) => {
          const isFree = free.includes(s.id);
          const isSel = isFree || skillChoices.includes(s.id);
          const planetBonus = planetSkillBonus(planetId, planetSkillChoice, s.id);
          const fromSpecies = alreadyFromSpecies.includes(s.id);
          const fromPlanet = planetSkill === s.id;
          return (
            <button key={s.id} onClick={() => toggle(s.id)} disabled={isFree}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: isSel ? "linear-gradient(135deg, rgba(59,130,196,0.16), rgba(59,130,196,0.04))" : "rgba(255,255,255,0.015)", border: `1px solid ${planetBonus ? "rgba(201,148,31,0.5)" : isSel ? SW.accentBord : "rgba(255,255,255,0.08)"}`, cursor: isFree ? "default" : "pointer", opacity: isFree ? 0.85 : 1 }}>
              <span style={{ fontSize: "0.82rem", color: isSel ? SW.accentBright : "var(--text)", fontWeight: isSel ? 700 : 500 }}>
                {s.name}{fromSpecies ? " · espécie" : fromPlanet ? " · planeta" : ""}
              </span>
              <span style={{ fontSize: "0.64rem", color: SW.textSubtle, fontWeight: 700 }}>{s.attrs.map((a) => ATTR_ABBR[a]).join("/")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
