import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_LEVEL } from "@/lib/dnd/leveling";
import { createCharacter } from "@/lib/dnd/characterService";
import { generateLevel1Build, buildAutoLevelPlan } from "@/lib/dnd/autoGenerate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, systemId, level, charName, classId } = body;

    if (!userId || !systemId) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }
    const lvl = Number(level);
    if (!Number.isInteger(lvl) || lvl < 1 || lvl > MAX_LEVEL) {
      return NextResponse.json({ error: `Nível deve ser entre 1 e ${MAX_LEVEL}.` }, { status: 400 });
    }

    const build = generateLevel1Build({ level: lvl, charName, classId });
    const created = await createCharacter({ ...build, userId, systemId });
    if (!created.ok) {
      return NextResponse.json({ error: created.error }, { status: created.status });
    }

    if (lvl > 1) {
      const plan = buildAutoLevelPlan(created.snapshot, lvl);
      await prisma.$transaction([
        prisma.dndSheet.update({ where: { id: created.id }, data: plan.sheetUpdate }),
        prisma.dndClass.updateMany({ where: { sheetId: created.id }, data: { level: plan.classLevel } }),
        ...(plan.allNewFeatures.length > 0
          ? [prisma.dndFeature.createMany({
              data: plan.allNewFeatures.map((f) => ({ sheetId: created.id, ...f })),
            })]
          : []),
        ...(plan.allNewSpellRows.length > 0
          ? [prisma.dndSpell.createMany({
              data: plan.allNewSpellRows.map((sp) => ({
                sheetId: created.id,
                spellName:   sp.name,
                level:       sp.level,
                school:      sp.school,
                prepared:    sp.level === 0,
                description: sp.description,
                castingTime: sp.castingTime,
                range:       sp.range,
                duration:    sp.duration,
              })),
            })]
          : []),
      ]);
    }

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/dnd/characters/auto]", err);
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
