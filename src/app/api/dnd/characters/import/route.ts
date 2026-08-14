import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { numOr, strOrNull, boolOr, toJsonFieldOrNull } from "@/lib/characterTransfer";
import { FORMAT } from "../[id]/export/route";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { systemId, payload } = body ?? {};
  if (!systemId || payload?.format !== FORMAT) {
    return NextResponse.json({ error: "Arquivo inválido para D&D 5e." }, { status: 400 });
  }

  const char = payload.character ?? {};
  const s = payload.sheet ?? {};
  if (typeof char.name !== "string" || !char.name.trim()) {
    return NextResponse.json({ error: "Nome do personagem ausente." }, { status: 400 });
  }

  const classes = Array.isArray(s.classes)
    ? s.classes
        .filter((c: unknown): c is Record<string, unknown> => !!c && typeof c === "object")
        .map((c: Record<string, unknown>) => ({
          className: strOrNull(c.className) ?? "",
          subclass: strOrNull(c.subclass),
          level: numOr(c.level, 1),
        }))
        .filter((c: { className: string }) => c.className)
    : [];

  const seenSkills = new Set<string>();
  const skills = Array.isArray(s.skills)
    ? s.skills
        .filter((k: unknown): k is Record<string, unknown> => !!k && typeof k === "object")
        .map((k: Record<string, unknown>) => ({
          skillName: strOrNull(k.skillName) ?? "",
          proficient: boolOr(k.proficient, false),
          expertise: boolOr(k.expertise, false),
        }))
        .filter((k: { skillName: string }) => k.skillName && !seenSkills.has(k.skillName) && seenSkills.add(k.skillName))
    : [];

  const spells = Array.isArray(s.spells)
    ? s.spells
        .filter((sp: unknown): sp is Record<string, unknown> => !!sp && typeof sp === "object")
        .map((sp: Record<string, unknown>) => ({
          spellName: strOrNull(sp.spellName) ?? "",
          level: numOr(sp.level, 0),
          school: strOrNull(sp.school),
          prepared: boolOr(sp.prepared, false),
          description: strOrNull(sp.description),
          components: strOrNull(sp.components),
          castingTime: strOrNull(sp.castingTime),
          duration: strOrNull(sp.duration),
          range: strOrNull(sp.range),
        }))
        .filter((sp: { spellName: string }) => sp.spellName)
    : [];

  const equipment = Array.isArray(s.equipment)
    ? s.equipment
        .filter((e: unknown): e is Record<string, unknown> => !!e && typeof e === "object")
        .map((e: Record<string, unknown>) => ({
          itemName: strOrNull(e.itemName) ?? "",
          quantity: numOr(e.quantity, 1),
          weight: typeof e.weight === "number" ? e.weight : null,
          equipped: boolOr(e.equipped, false),
          description: strOrNull(e.description),
        }))
        .filter((e: { itemName: string }) => e.itemName)
    : [];

  const features = Array.isArray(s.features)
    ? s.features
        .filter((f: unknown): f is Record<string, unknown> => !!f && typeof f === "object")
        .map((f: Record<string, unknown>) => ({
          name: strOrNull(f.name) ?? "",
          source: strOrNull(f.source),
          description: strOrNull(f.description),
        }))
        .filter((f: { name: string }) => f.name)
    : [];

  try {
    const character = await prisma.character.create({
      data: {
        userId: session.user.id,
        systemId,
        name: char.name.trim(),
        notes: strOrNull(char.notes),
        portraitUrl: strOrNull(char.portraitUrl),
        dndSheet: {
          create: {
            race: strOrNull(s.race), background: strOrNull(s.background), alignment: strOrNull(s.alignment),
            xp: numOr(s.xp, 0), level: numOr(s.level, 1),
            str: numOr(s.str, 10), dex: numOr(s.dex, 10), con: numOr(s.con, 10),
            int: numOr(s.int, 10), wis: numOr(s.wis, 10), cha: numOr(s.cha, 10),
            hpMax: numOr(s.hpMax, 10), hpCurrent: numOr(s.hpCurrent, 10), hpTemp: numOr(s.hpTemp, 0),
            hitDice: strOrNull(s.hitDice), hitDiceUsed: numOr(s.hitDiceUsed, 0),
            deathSavesSuccess: numOr(s.deathSavesSuccess, 0), deathSavesFailure: numOr(s.deathSavesFailure, 0),
            armorClass: numOr(s.armorClass, 10), initiative: numOr(s.initiative, 0), speed: numOr(s.speed, 30),
            inspiration: boolOr(s.inspiration, false),
            cp: numOr(s.cp, 0), sp: numOr(s.sp, 0), ep: numOr(s.ep, 0), gp: numOr(s.gp, 0), pp: numOr(s.pp, 0),
            conditions: toJsonFieldOrNull(s.conditions ?? []),
            spellSlotsUsed: toJsonFieldOrNull(s.spellSlotsUsed ?? {}),
            spellAbility: strOrNull(s.spellAbility),
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
    console.error("[POST /api/dnd/characters/import]", err);
    return NextResponse.json({ error: "Erro ao importar personagem." }, { status: 500 });
  }
}
