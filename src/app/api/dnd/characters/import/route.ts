import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readImportRequest, handleImportError } from "@/lib/characterImport";
import { ImportError, LIMITS, intIn, strOrNull, boolOr, toJsonFieldOrNull } from "@/lib/characterTransfer";
import { MAX_LEVEL } from "@/lib/dnd/leveling";
import { FORMAT } from "../[id]/export/route";

/** Teto de linhas por coleção filha — impede um arquivo inflar o banco. */
const MAX_ROWS = 500;

function rows(v: unknown, field: string): Record<string, unknown>[] {
  if (!Array.isArray(v)) return [];
  if (v.length > MAX_ROWS) {
    throw new ImportError(`Arquivo rejeitado: "${field}" tem mais de ${MAX_ROWS} itens.`);
  }
  return v.filter((x): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x));
}

export async function POST(req: NextRequest) {
  try {
    const { userId, systemId, character: char, sheet: s } = await readImportRequest(req, {
      slug: "dnd",
      format: FORMAT,
      label: "D&D 5e",
    });

    const classes = rows(s.classes, "classes")
      .map((c) => ({
        className: strOrNull(c.className, LIMITS.name) ?? "",
        subclass: strOrNull(c.subclass, LIMITS.name),
        level: intIn(c.level, 1, MAX_LEVEL, 1),
      }))
      .filter((c) => c.className);

    const seenSkills = new Set<string>();
    const skills = rows(s.skills, "skills")
      .map((k) => ({
        skillName: strOrNull(k.skillName, LIMITS.name) ?? "",
        proficient: boolOr(k.proficient, false),
        expertise: boolOr(k.expertise, false),
      }))
      .filter((k) => k.skillName && !seenSkills.has(k.skillName) && seenSkills.add(k.skillName));

    const spells = rows(s.spells, "spells")
      .map((sp) => ({
        spellName: strOrNull(sp.spellName, LIMITS.name) ?? "",
        level: intIn(sp.level, 0, 9, 0),
        school: strOrNull(sp.school, LIMITS.name),
        prepared: boolOr(sp.prepared, false),
        description: strOrNull(sp.description),
        components: strOrNull(sp.components, LIMITS.name),
        castingTime: strOrNull(sp.castingTime, LIMITS.name),
        duration: strOrNull(sp.duration, LIMITS.name),
        range: strOrNull(sp.range, LIMITS.name),
      }))
      .filter((sp) => sp.spellName);

    const equipment = rows(s.equipment, "equipment")
      .map((e) => ({
        itemName: strOrNull(e.itemName, LIMITS.name) ?? "",
        quantity: intIn(e.quantity, 0, 100_000, 1),
        weight: typeof e.weight === "number" && Number.isFinite(e.weight) ? e.weight : null,
        equipped: boolOr(e.equipped, false),
        description: strOrNull(e.description),
      }))
      .filter((e) => e.itemName);

    const features = rows(s.features, "features")
      .map((f) => ({
        name: strOrNull(f.name, LIMITS.name) ?? "",
        source: strOrNull(f.source, LIMITS.name),
        description: strOrNull(f.description),
      }))
      .filter((f) => f.name);

    const character = await prisma.character.create({
      data: {
        userId,
        systemId,
        name: (char.name as string).trim(),
        notes: strOrNull(char.notes),
        portraitUrl: strOrNull(char.portraitUrl, LIMITS.url),
        dndSheet: {
          create: {
            race: strOrNull(s.race, LIMITS.name),
            background: strOrNull(s.background, LIMITS.name),
            alignment: strOrNull(s.alignment, LIMITS.name),
            xp: intIn(s.xp, 0, 1_000_000, 0),
            level: intIn(s.level, 1, MAX_LEVEL, 1),
            str: intIn(s.str, 1, 30, 10), dex: intIn(s.dex, 1, 30, 10), con: intIn(s.con, 1, 30, 10),
            int: intIn(s.int, 1, 30, 10), wis: intIn(s.wis, 1, 30, 10), cha: intIn(s.cha, 1, 30, 10),
            hpMax: intIn(s.hpMax, 0, 100_000, 10),
            hpCurrent: intIn(s.hpCurrent, -1_000, 100_000, 10),
            hpTemp: intIn(s.hpTemp, 0, 100_000, 0),
            hitDice: strOrNull(s.hitDice, LIMITS.name),
            hitDiceUsed: intIn(s.hitDiceUsed, 0, MAX_LEVEL, 0),
            deathSavesSuccess: intIn(s.deathSavesSuccess, 0, 3, 0),
            deathSavesFailure: intIn(s.deathSavesFailure, 0, 3, 0),
            armorClass: intIn(s.armorClass, 0, 100, 10),
            initiative: intIn(s.initiative, -50, 100, 0),
            speed: intIn(s.speed, 0, 1_000, 30),
            inspiration: boolOr(s.inspiration, false),
            cp: intIn(s.cp, 0, 10_000_000, 0), sp: intIn(s.sp, 0, 10_000_000, 0),
            ep: intIn(s.ep, 0, 10_000_000, 0), gp: intIn(s.gp, 0, 10_000_000, 0),
            pp: intIn(s.pp, 0, 10_000_000, 0),
            conditions: toJsonFieldOrNull(s.conditions ?? []),
            spellSlotsUsed: toJsonFieldOrNull(s.spellSlotsUsed ?? {}),
            spellAbility: strOrNull(s.spellAbility, LIMITS.name),
            classes: { create: classes },
            skills: { create: skills },
            spells: { create: spells },
            equipment: { create: equipment },
            features: { create: features },
          },
        },
      },
      select: { id: true },
    });
    return NextResponse.json({ id: character.id }, { status: 201 });
  } catch (err) {
    return handleImportError(err, "[POST /api/dnd/characters/import]");
  }
}
