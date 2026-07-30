import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ATTR_KEYS, type StarWarsAttrs, type AttrKey } from "@/lib/starwars/data";
import { SPECIES_BY_ID } from "@/lib/starwars/species";
import { CLASS_BY_ID } from "@/lib/starwars/classes";
import { PLANET_BY_ID } from "@/lib/starwars/planets";
import { finalAttrs as computeFinalAttrs, computeVitals, trainedSkillCount, effectivePlanetSkill } from "@/lib/starwars/creation";
import { getClassAbilities } from "@/lib/starwars/powers/registry";
import { DEFAULT_PV_VIG_MULTIPLIER } from "@/lib/starwars/leveling";
import type { ChosenPower } from "@/lib/starwars/powers/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId, systemId, charName,
      speciesId, humanChoice,
      planetId, planetSkillChoice, pathId, classId, classAbilityChoice,
      attrBases, skillChoices,
      desc,
    } = body;

    if (!userId || !systemId || !charName?.trim() || !speciesId || !planetId || !pathId || !classId) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    const species = SPECIES_BY_ID[speciesId];
    const planet = PLANET_BY_ID[planetId];
    const cls = CLASS_BY_ID[classId];
    if (!species || !planet || !cls) {
      return NextResponse.json({ error: "Espécie, planeta ou classe inválida." }, { status: 400 });
    }

    const base = ATTR_KEYS.reduce((acc, k) => ({ ...acc, [k]: attrBases?.[k] ?? 0 }), {} as StarWarsAttrs);
    const attrs = computeFinalAttrs(base, speciesId, humanChoice as { plus2: AttrKey[]; plus1: AttrKey[]; minus1: AttrKey[] } | undefined);

    const vitals = computeVitals(classId, speciesId, attrs.vig, attrs.sen, attrs.pre);
    const skillCount = trainedSkillCount(classId, attrs.int);

    const chosenPlanetSkill = effectivePlanetSkill(planetId, planetSkillChoice);
    if (planet.naturalAbility.skills.length > 1 && !planet.naturalAbility.skills.includes(chosenPlanetSkill ?? "")) {
      return NextResponse.json({ error: "Escolha uma perícia válida para a Habilidade Natal do planeta." }, { status: 400 });
    }

    const firstAbilities = getClassAbilities(classId).filter((a) => a.level === 1);
    let classPowers: ChosenPower[] = [];
    if (firstAbilities.length > 1) {
      const chosen = firstAbilities.find((a) => a.name === classAbilityChoice);
      if (!chosen) return NextResponse.json({ error: "Escolha uma habilidade de nível 1 válida para a classe." }, { status: 400 });
      classPowers = [{ level: 1, id: chosen.name, name: chosen.name, source: "classe", classId }];
    } else if (firstAbilities.length === 1) {
      classPowers = [{ level: 1, id: firstAbilities[0].name, name: firstAbilities[0].name, source: "classe", classId }];
    }

    const trainedFromChoices = new Set<string>((skillChoices ?? []).filter((id: string) => id !== chosenPlanetSkill));
    const skillsData: Record<string, string> = {};
    for (const id of species.initialSkills) skillsData[id] = "iniciante";
    if (chosenPlanetSkill) skillsData[chosenPlanetSkill] = "iniciante"; // Habilidade Natal do planeta também treina, como a espécie; o +5 extra é aplicado em tempo de exibição.
    for (const id of Array.from(trainedFromChoices).slice(0, skillCount)) skillsData[id] = "iniciante";

    const character = await prisma.character.create({
      data: {
        userId,
        systemId,
        name: charName.trim(),
        notes: null,
        starWarsSheet: {
          create: {
            species: speciesId,
            planet: planetId,
            planetSkillChoice: chosenPlanetSkill,
            path: pathId,
            classes: JSON.stringify({ [classId]: 1 }),
            level: 1,
            xp: 0,
            humanAttrChoice: humanChoice ? JSON.stringify(humanChoice) : null,
            agi: attrs.agi,
            int: attrs.int,
            forca: attrs.forca,
            vig: attrs.vig,
            pre: attrs.pre,
            sen: attrs.sen,
            pvMax: vitals.pvMax + DEFAULT_PV_VIG_MULTIPLIER * attrs.vig,
            pvClassSum: vitals.pvMax,
            pvLevelGain: 0,
            pvVigMultiplier: DEFAULT_PV_VIG_MULTIPLIER,
            pvCurrent: vitals.pvMax + DEFAULT_PV_VIG_MULTIPLIER * attrs.vig,
            peMax: vitals.peMax,
            peCurrent: vitals.peMax,
            ppMax: vitals.ppMax,
            ppCurrent: vitals.ppMax,
            skills: JSON.stringify(skillsData),
            classPowers: JSON.stringify(classPowers),
            generalPowers: JSON.stringify([]),
            background: desc ? JSON.stringify(desc) : null,
          },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: character.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/starwars/characters]", err);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
