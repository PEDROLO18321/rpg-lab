import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { makeEnvelope, parseJsonField } from "@/lib/characterTransfer";

export const FORMAT = "rpglab.dnd.v1";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findFirst({
    where: { id, userId: session.user.id },
    select: {
      name: true,
      notes: true,
      portraitUrl: true,
      dndSheet: {
        select: {
          race: true, background: true, alignment: true, xp: true, level: true,
          str: true, dex: true, con: true, int: true, wis: true, cha: true,
          hpMax: true, hpCurrent: true, hpTemp: true,
          hitDice: true, hitDiceUsed: true,
          deathSavesSuccess: true, deathSavesFailure: true,
          armorClass: true, initiative: true, speed: true, inspiration: true,
          cp: true, sp: true, ep: true, gp: true, pp: true,
          conditions: true, spellSlotsUsed: true, spellAbility: true,
          classes: { select: { className: true, subclass: true, level: true } },
          skills: { select: { skillName: true, proficient: true, expertise: true } },
          spells: { select: { spellName: true, level: true, school: true, prepared: true, description: true, components: true, castingTime: true, duration: true, range: true } },
          equipment: { select: { itemName: true, quantity: true, weight: true, equipped: true, description: true } },
          features: { select: { name: true, source: true, description: true } },
        },
      },
    },
  });
  if (!character || !character.dndSheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const s = character.dndSheet;
  const envelope = makeEnvelope(
    FORMAT,
    { name: character.name, portraitUrl: character.portraitUrl, notes: character.notes },
    {
      race: s.race, background: s.background, alignment: s.alignment, xp: s.xp, level: s.level,
      str: s.str, dex: s.dex, con: s.con, int: s.int, wis: s.wis, cha: s.cha,
      hpMax: s.hpMax, hpCurrent: s.hpCurrent, hpTemp: s.hpTemp,
      hitDice: s.hitDice, hitDiceUsed: s.hitDiceUsed,
      deathSavesSuccess: s.deathSavesSuccess, deathSavesFailure: s.deathSavesFailure,
      armorClass: s.armorClass, initiative: s.initiative, speed: s.speed, inspiration: s.inspiration,
      cp: s.cp, sp: s.sp, ep: s.ep, gp: s.gp, pp: s.pp,
      conditions: parseJsonField<string[]>(s.conditions, []),
      spellSlotsUsed: parseJsonField<Record<string, number>>(s.spellSlotsUsed, {}),
      spellAbility: s.spellAbility,
      classes: s.classes,
      skills: s.skills,
      spells: s.spells,
      equipment: s.equipment,
      features: s.features,
    }
  );

  return NextResponse.json(envelope);
}
