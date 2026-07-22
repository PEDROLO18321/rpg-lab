import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { attrMod, type AttrKey, type TormentaAttrs } from "@/lib/tormenta/data";
import { CLASS_BY_ID } from "@/lib/tormenta/classes";
import { RACE_BY_ID } from "@/lib/tormenta/races";
import { ORIGIN_BY_ID } from "@/lib/tormenta/origins";
import { computeVitals, racialAttrBonus, resolveClassFixedSkills, resolveKeyAttribute } from "@/lib/tormenta/creation";
import { computeTormentaDefense, STARTING_MONEY_DICE } from "@/lib/tormenta/items";

const ATTR_KEYS: AttrKey[] = ["for", "des", "con", "int", "sab", "car"];

function rollDice(notation: string): number {
  const m = notation.match(/^(\d+)d(\d+)$/);
  if (!m) return 0;
  const count = Number(m[1]);
  const sides = Number(m[2]);
  let total = 0;
  for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
  return total;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId, systemId, charName,
      raceId, raceVariantId, racialAttrChoices,
      classId, pathId, schoolsChosen, godId,
      originId, originSkillChoices, classSkillChoices, classFixedChoice, intBonusSkillChoices,
      attrBases, selectedSpells,
      weaponId, armorId, shieldId,
      desc,
    } = body;

    if (!userId || !systemId || !charName?.trim() || !raceId || !classId || !originId) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    const race = RACE_BY_ID[raceId];
    const cls = CLASS_BY_ID[classId];
    const origin = ORIGIN_BY_ID[originId];
    if (!race || !cls || !origin) {
      return NextResponse.json({ error: "Raça, classe ou origem inválida." }, { status: 400 });
    }

    const base = ATTR_KEYS.reduce((acc, k) => ({ ...acc, [k]: attrBases?.[k] ?? 10 }), {} as TormentaAttrs);
    const bonus = racialAttrBonus(raceId, raceVariantId ?? null, (racialAttrChoices ?? []) as AttrKey[]);
    const finalAttrs = ATTR_KEYS.reduce((acc, k) => ({ ...acc, [k]: Math.max(3, base[k] + (bonus[k] ?? 0)) }), {} as TormentaAttrs);

    const conMod = attrMod(finalAttrs.con);
    const desMod = attrMod(finalAttrs.des);
    const spellKeyAttr = resolveKeyAttribute(classId, pathId);
    const keyAttrMod = spellKeyAttr ? attrMod(finalAttrs[spellKeyAttr]) : 0;

    const vitals = computeVitals(classId, conMod, keyAttrMod);
    const defense = computeTormentaDefense(desMod, armorId ?? null, shieldId ?? null);

    const classFixed = resolveClassFixedSkills(classId, classFixedChoice ?? {});
    const trainedSkills = new Set<string>([
      ...classFixed,
      ...(classSkillChoices ?? []),
      ...(originSkillChoices ?? []),
      ...(intBonusSkillChoices ?? []),
    ]);
    const skillsData = Object.fromEntries(Array.from(trainedSkills).map((id) => [id, true]));

    const equipment = [
      origin.items,
      "Mochila", "Saco de dormir", "Traje de viajante",
      ...(armorId ? [armorId] : []),
      ...(shieldId ? [shieldId] : []),
    ];

    const character = await prisma.character.create({
      data: {
        userId,
        systemId,
        name: charName.trim(),
        notes: null,
        tormentaSheet: {
          create: {
            race: raceId,
            raceVariant: raceVariantId ?? null,
            className: classId,
            path: pathId ?? null,
            origin: originId,
            godId: godId ?? null,
            level: 1,
            xp: 0,
            forca: finalAttrs.for,
            des: finalAttrs.des,
            con: finalAttrs.con,
            int: finalAttrs.int,
            sab: finalAttrs.sab,
            car: finalAttrs.car,
            pvMax: vitals.pvMax,
            pvCurrent: vitals.pvMax,
            pmMax: vitals.pmMax,
            pmCurrent: vitals.pmMax,
            defense,
            movement: race.speed,
            money: rollDice(STARTING_MONEY_DICE),
            skills: JSON.stringify(skillsData),
            schoolsChosen: schoolsChosen ? JSON.stringify(schoolsChosen) : null,
            spellsKnown: selectedSpells ? JSON.stringify(selectedSpells) : null,
            weapons: weaponId ? JSON.stringify([weaponId]) : null,
            equipment: JSON.stringify(equipment),
            background: desc ? JSON.stringify(desc) : null,
          },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: character.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tormenta/characters]", err);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
