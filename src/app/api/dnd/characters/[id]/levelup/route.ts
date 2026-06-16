import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CLASSES } from "@/lib/dnd/classes";
import { SPELLCASTING } from "@/lib/dnd/spells";
import {
  MAX_LEVEL,
  XP_THRESHOLDS,
  buildLevelUpPlan,
  averageHpGain,
  validateAsi,
  spellChoicesOnLevelUp,
  maxSpellLevelAt,
  checkMulticlassPrereqs,
} from "@/lib/dnd/leveling";
import { SPELLS, spellClassKey } from "@/lib/dnd/spells";
import type { AbilityKey } from "@/lib/dnd/races";

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

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

  const plan = buildLevelUpPlan(cls.id, sheet.race ?? "", clsEntry.level, cls.hitDie, sheet.level);
  if (!plan) return NextResponse.json({ error: "Nível máximo já alcançado." }, { status: 400 });

  // ── PV ───────────────────────────────────────────────────────────────────────
  let hpDie: number;
  if (hpMode === "roll") {
    const r = Number(body.hpRoll);
    if (!Number.isInteger(r) || r < 1 || r > cls.hitDie)
      return NextResponse.json({ error: `Rolagem de PV inválida (1–${cls.hitDie}).` }, { status: 400 });
    hpDie = r;
  } else {
    hpDie = averageHpGain(cls.hitDie);
  }

  // ── ASI ──────────────────────────────────────────────────────────────────────
  const asiIncreases: Partial<Record<AbilityKey, number>> = {};
  if (plan.asi) {
    const raw = body.asi ?? {};
    for (const k of ABILITIES) {
      const v = Number(raw[k] ?? 0);
      if (v > 0) asiIncreases[k] = v;
    }
    const err = validateAsi(asiIncreases, currentScores);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
  }

  const newScores = { ...currentScores };
  for (const [k, v] of Object.entries(asiIncreases) as [AbilityKey, number][]) {
    newScores[k] += v;
  }

  const conModBefore = mod(currentScores.con);
  const conModAfter  = mod(newScores.con);
  const hpGain       = Math.max(1, hpDie + conModAfter);
  const retroactiveHp = (conModAfter - conModBefore) * plan.fromLevel;
  const newHpMax = sheet.hpMax + hpGain + retroactiveHp;

  // ── Magias ───────────────────────────────────────────────────────────────────
  const choices    = spellChoicesOnLevelUp(cls.id, plan.newLevel);
  const classKey   = spellClassKey(cls.id);
  const maxSpellLv = maxSpellLevelAt(cls.id, plan.newLevel);

  const requestedIds: string[] = Array.isArray(body.newSpells) ? body.newSpells : [];
  const newSpellRows: typeof SPELLS = [];
  let cantripCount = 0;
  let spellCount   = 0;
  for (const sid of requestedIds) {
    const sp = SPELLS.find((s) => s.id === sid);
    if (!sp) return NextResponse.json({ error: `Magia desconhecida: ${sid}` }, { status: 400 });
    if (!sp.classes.includes(classKey))
      return NextResponse.json({ error: `${sp.name} não pertence à lista da sua classe.` }, { status: 400 });
    if (known.has(sp.name.toLowerCase()))
      return NextResponse.json({ error: `${sp.name} já é conhecida.` }, { status: 400 });
    if (sp.level === 0) {
      cantripCount++;
      if (cantripCount > choices.cantrips)
        return NextResponse.json({ error: "Truques escolhidos além do permitido." }, { status: 400 });
    } else {
      if (sp.level > maxSpellLv)
        return NextResponse.json({ error: `${sp.name} é de nível maior que seus espaços (${maxSpellLv}°).` }, { status: 400 });
      spellCount++;
      if (spellCount > choices.spells)
        return NextResponse.json({ error: "Magias escolhidas além do permitido." }, { status: 400 });
    }
    known.add(sp.name.toLowerCase());
    newSpellRows.push(sp);
  }

  // ── Características ───────────────────────────────────────────────────────────
  const newFeatures = [
    ...plan.classFeatures.map((f) => ({ ...f, source: `${cls.name} ${plan.newLevel}°` })),
    ...plan.raceFeatures.map((f)  => ({ ...f, source: `Raça · ${plan.newLevel}° nível` })),
  ];

  await prisma.$transaction([
    prisma.dndSheet.update({
      where: { id: sheet.id },
      data: {
        level:     plan.totalLevelAfter,
        xp:        Math.max(sheet.xp, XP_THRESHOLDS[plan.totalLevelAfter]),
        hpMax:     newHpMax,
        hpCurrent: sheet.hpCurrent + hpGain + retroactiveHp,
        str: newScores.str, dex: newScores.dex, con: newScores.con,
        int: newScores.int, wis: newScores.wis, cha: newScores.cha,
        initiative: mod(newScores.dex),
      },
    }),
    prisma.dndClass.update({
      where: { id: clsEntry.id },
      data:  { level: plan.newLevel },
    }),
    ...(newFeatures.length > 0
      ? [prisma.dndFeature.createMany({
          data: newFeatures.map((f) => ({
            sheetId: sheet.id,
            name: f.name, source: f.source, description: f.description,
          })),
        })]
      : []),
    ...(newSpellRows.length > 0
      ? [prisma.dndSpell.createMany({
          data: newSpellRows.map((sp) => ({
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

  return NextResponse.json({
    ok: true,
    summary: {
      newLevel:         plan.totalLevelAfter,
      hpGain:           hpGain + retroactiveHp,
      hpDie,
      hpMode,
      conRetroactive:   retroactiveHp,
      newHpMax,
      profBonusBefore:  plan.profBonusBefore,
      profBonusAfter:   plan.profBonusAfter,
      asiApplied:       asiIncreases,
      features:         newFeatures,
      slotsGained:      plan.slotsGained,
      newMaxSlots:      plan.newMaxSlots,
      cantripsBefore:   plan.cantripsBefore,
      cantripsAfter:    plan.cantripsAfter,
      spellsKnownBefore: plan.spellsKnownBefore,
      spellsKnownAfter:  plan.spellsKnownAfter,
      spellsLearned:    newSpellRows.map((sp) => sp.name),
    },
  });
}
