import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Duplica o personagem com ficha completa (classes, perícias, magias, equipamento, características). */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const original = await prisma.character.findUnique({
    where: { id },
    include: {
      dndSheet: {
        include: { classes: true, skills: true, spells: true, equipment: true, features: true },
      },
    },
  });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (original.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const s = original.dndSheet;

  const copy = await prisma.character.create({
    data: {
      userId: original.userId,
      systemId: original.systemId,
      name: `${original.name} (cópia)`,
      portraitUrl: original.portraitUrl,
      notes: original.notes,
      ...(s
        ? {
            dndSheet: {
              create: {
                race: s.race,
                background: s.background,
                alignment: s.alignment,
                xp: s.xp,
                level: s.level,
                str: s.str, dex: s.dex, con: s.con, int: s.int, wis: s.wis, cha: s.cha,
                hpMax: s.hpMax, hpCurrent: s.hpCurrent, hpTemp: s.hpTemp,
                hitDice: s.hitDice, hitDiceUsed: s.hitDiceUsed,
                deathSavesSuccess: s.deathSavesSuccess,
                deathSavesFailure: s.deathSavesFailure,
                armorClass: s.armorClass, initiative: s.initiative, speed: s.speed,
                inspiration: s.inspiration,
                cp: s.cp, sp: s.sp, ep: s.ep, gp: s.gp, pp: s.pp,
                conditions: s.conditions,
                spellSlotsUsed: s.spellSlotsUsed,
                classes: {
                  create: s.classes.map((c) => ({
                    className: c.className, subclass: c.subclass, level: c.level,
                  })),
                },
                skills: {
                  create: s.skills.map((k) => ({
                    skillName: k.skillName, proficient: k.proficient, expertise: k.expertise,
                  })),
                },
                spells: {
                  create: s.spells.map((sp) => ({
                    spellName: sp.spellName, level: sp.level, school: sp.school,
                    prepared: sp.prepared, description: sp.description,
                    components: sp.components, castingTime: sp.castingTime,
                    duration: sp.duration, range: sp.range,
                  })),
                },
                equipment: {
                  create: s.equipment.map((e) => ({
                    itemName: e.itemName, quantity: e.quantity, weight: e.weight,
                    equipped: e.equipped, description: e.description,
                  })),
                },
                features: {
                  create: s.features.map((f) => ({
                    name: f.name, source: f.source, description: f.description,
                  })),
                },
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ ok: true, id: copy.id });
}
