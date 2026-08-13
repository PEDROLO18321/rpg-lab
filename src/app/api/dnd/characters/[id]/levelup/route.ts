import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CLASSES } from "@/lib/dnd/classes";
import { SPELLCASTING } from "@/lib/dnd/spells";
import {
  MAX_LEVEL,
  XP_THRESHOLDS,
  averageHpGain,
  checkMulticlassPrereqs,
} from "@/lib/dnd/leveling";
import { SPELLS, spellClassKey } from "@/lib/dnd/spells";
import { levelUpCharacterOnce, type SheetSnapshot } from "@/lib/dnd/characterService";
import type { AbilityKey } from "@/lib/dnd/races";

function mod(score: number) {
  return Math.floor((score - 10) / 2);
}

/**
 * Sobe o personagem um nível (PHB):
 *  - Body sem newClassId: sobe nível em classe existente (targetClassId opcional)
 *  - Body com newClassId: adiciona nova classe (multiclasse)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findUnique({
    where: { id },
    select: {
      userId: true,
      dndSheet: { include: { classes: true, spells: { select: { spellName: true } } } },
    },
  });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const sheet = character.dndSheet;
  if (!sheet) return NextResponse.json({ error: "No sheet" }, { status: 404 });

  if (sheet.level >= MAX_LEVEL)
    return NextResponse.json({ error: "Nível máximo (20) já alcançado." }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const hpMode: "average" | "roll" = body.hpMode === "roll" ? "roll" : "average";

  const currentScores: Record<AbilityKey, number> = {
    str: sheet.str, dex: sheet.dex, con: sheet.con,
    int: sheet.int, wis: sheet.wis, cha: sheet.cha,
  };
  const conMod = mod(currentScores.con);
  const known  = new Set(sheet.spells.map((s) => s.spellName.toLowerCase()));

  // ─────────────────────────────────────────────────────────────────────────────
  // CASO A: Multiclasse — adicionar nova classe
  // ─────────────────────────────────────────────────────────────────────────────
  if (body.newClassId) {
    const newCls = CLASSES.find((c) => c.id === body.newClassId);
    if (!newCls)
      return NextResponse.json({ error: "Classe inválida." }, { status: 400 });

    if (sheet.classes.some((c) => c.className === body.newClassId))
      return NextResponse.json({ error: "Você já possui essa classe." }, { status: 400 });

    const prereqErr = checkMulticlassPrereqs(body.newClassId, currentScores);
    if (prereqErr)
      return NextResponse.json({ error: prereqErr }, { status: 400 });

    // PV: dado da nova classe
    let hpDie: number;
    if (hpMode === "roll") {
      const r = Number(body.hpRoll);
      if (!Number.isInteger(r) || r < 1 || r > newCls.hitDie)
        return NextResponse.json({ error: `Rolagem inválida (1–${newCls.hitDie}).` }, { status: 400 });
      hpDie = r;
    } else {
      hpDie = averageHpGain(newCls.hitDie);
    }
    const hpGain = Math.max(1, hpDie + conMod);
    const newTotalLevel = sheet.level + 1;

    // Magias da nova classe (só classes "known" ganham magias ao multiclassear)
    const newSpellCfg = SPELLCASTING[body.newClassId];
    const requestedIds: string[] = Array.isArray(body.newSpells) ? body.newSpells : [];
    const newSpellRows: typeof SPELLS = [];

    if (newSpellCfg?.type === "known" && requestedIds.length > 0) {
      const classKey = spellClassKey(body.newClassId);
      let cantripCount = 0;
      let spellCount   = 0;
      for (const sid of requestedIds) {
        const sp = SPELLS.find((s) => s.id === sid);
        if (!sp)
          return NextResponse.json({ error: `Magia desconhecida: ${sid}` }, { status: 400 });
        if (!sp.classes.includes(classKey))
          return NextResponse.json({ error: `${sp.name} não é da lista de ${newCls.name}.` }, { status: 400 });
        if (known.has(sp.name.toLowerCase()))
          return NextResponse.json({ error: `${sp.name} já é conhecida.` }, { status: 400 });
        if (sp.level === 0) {
          cantripCount++;
          if (cantripCount > (newSpellCfg.cantripsKnown ?? 0))
            return NextResponse.json({ error: "Truques além do permitido." }, { status: 400 });
        } else {
          spellCount++;
          if (spellCount > (newSpellCfg.spellsKnown ?? 0))
            return NextResponse.json({ error: "Magias além do permitido." }, { status: 400 });
        }
        known.add(sp.name.toLowerCase());
        newSpellRows.push(sp);
      }
    }

    await prisma.$transaction([
      prisma.dndSheet.update({
        where: { id: sheet.id },
        data: {
          level: newTotalLevel,
          xp:    Math.max(sheet.xp, XP_THRESHOLDS[newTotalLevel]),
          hpMax:     sheet.hpMax     + hpGain,
          hpCurrent: sheet.hpCurrent + hpGain,
        },
      }),
      prisma.dndClass.create({
        data: { sheetId: sheet.id, className: newCls.id, level: 1, subclass: null },
      }),
      ...(newSpellRows.length > 0
        ? [prisma.dndSpell.createMany({
            data: newSpellRows.map((sp) => ({
              sheetId: sheet.id,
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

    return NextResponse.json({
      ok: true,
      summary: {
        newLevel:         newTotalLevel,
        hpGain,
        hpDie,
        hpMode,
        conRetroactive:   0,
        newHpMax:         sheet.hpMax + hpGain,
        profBonusBefore:  Math.ceil(Math.max(1, Math.min(sheet.level, 20)) / 4) + 1,
        profBonusAfter:   Math.ceil(Math.max(1, Math.min(newTotalLevel, 20)) / 4) + 1,
        asiApplied:       {},
        features:         [],
        slotsGained:      {},
        newMaxSlots:      {},
        cantripsBefore:   0,
        cantripsAfter:    0,
        spellsKnownBefore: 0,
        spellsKnownAfter:  0,
        spellsLearned:    newSpellRows.map((sp) => sp.name),
        newClassName:     newCls.name,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CASO B: Subir nível em classe existente
  // ─────────────────────────────────────────────────────────────────────────────
  const clsEntry = body.targetClassId
    ? sheet.classes.find((c) => c.id === body.targetClassId)
    : sheet.classes[0];
  const cls = CLASSES.find((c) => c.id === clsEntry?.className);
  if (!clsEntry || !cls)
    return NextResponse.json({ error: "Classe do personagem não reconhecida." }, { status: 400 });

  const snapshot: SheetSnapshot = {
    level: sheet.level,
    xp: sheet.xp,
    hpMax: sheet.hpMax,
    hpCurrent: sheet.hpCurrent,
    str: currentScores.str, dex: currentScores.dex, con: currentScores.con,
    int: currentScores.int, wis: currentScores.wis, cha: currentScores.cha,
    race: sheet.race ?? "",
    classId: cls.id,
    classLevel: clsEntry.level,
    hitDie: cls.hitDie,
    knownSpellNames: known,
  };

  const result = levelUpCharacterOnce(snapshot, {
    hpMode,
    hpRoll: Number(body.hpRoll),
    asi: body.asi,
    newSpells: Array.isArray(body.newSpells) ? body.newSpells : [],
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await prisma.$transaction([
    prisma.dndSheet.update({
      where: { id: sheet.id },
      data: result.sheetUpdate,
    }),
    prisma.dndClass.update({
      where: { id: clsEntry.id },
      data:  { level: result.classLevel },
    }),
    ...(result.newFeatures.length > 0
      ? [prisma.dndFeature.createMany({
          data: result.newFeatures.map((f) => ({
            sheetId: sheet.id,
            name: f.name, source: f.source, description: f.description,
          })),
        })]
      : []),
    ...(result.newSpellRows.length > 0
      ? [prisma.dndSpell.createMany({
          data: result.newSpellRows.map((sp) => ({
            sheetId:     sheet.id,
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

  return NextResponse.json({ ok: true, summary: result.summary });
}
