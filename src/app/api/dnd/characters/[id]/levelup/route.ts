import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CLASSES } from "@/lib/dnd/classes";
import {
  MAX_LEVEL,
  XP_THRESHOLDS,
  buildLevelUpPlan,
  averageHpGain,
  validateAsi,
  spellChoicesOnLevelUp,
  maxSpellLevelAt,
} from "@/lib/dnd/leveling";
import { SPELLS, spellClassKey } from "@/lib/dnd/spells";
import type { AbilityKey } from "@/lib/dnd/races";

const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

function mod(score: number) {
  return Math.floor((score - 10) / 2);
}

/**
 * Sobe o personagem um nível aplicando as regras do Livro do Jogador:
 *  - PV: rolagem do Dado de Vida (1..dado, validada) ou média fixa; + mod. CON (mín. 1)
 *  - Aumento retroativo de PV se o mod. de CON subir via ASI
 *  - Bônus de proficiência pela tabela de Avanço
 *  - ASI (+2 ou +1/+1, máx. 20) nos níveis da classe
 *  - Características de classe e raça do novo nível → DndFeature
 *  - XP ajustado ao mínimo do novo nível
 *
 * Body: { hpMode: "average" | "roll", hpRoll?: number,
 *         asi?: Partial<Record<AbilityKey, number>> }
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

  const clsEntry = sheet.classes[0];
  const cls = CLASSES.find((c) => c.id === clsEntry?.className);
  if (!clsEntry || !cls)
    return NextResponse.json({ error: "Classe do personagem não reconhecida." }, { status: 400 });

  if (sheet.level >= MAX_LEVEL)
    return NextResponse.json({ error: "Nível máximo (20) já alcançado." }, { status: 400 });

  const plan = buildLevelUpPlan(cls.id, sheet.race ?? "", sheet.level, cls.hitDie);
  if (!plan) return NextResponse.json({ error: "Nível máximo já alcançado." }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const hpMode: "average" | "roll" = body.hpMode === "roll" ? "roll" : "average";

  // ── PV ganho ──────────────────────────────────────────────────────────────
  let hpDie: number;
  if (hpMode === "roll") {
    const r = Number(body.hpRoll);
    if (!Number.isInteger(r) || r < 1 || r > cls.hitDie)
      return NextResponse.json({ error: `Rolagem de PV inválida (1–${cls.hitDie}).` }, { status: 400 });
    hpDie = r;
  } else {
    hpDie = averageHpGain(cls.hitDie);
  }

  // ── ASI ───────────────────────────────────────────────────────────────────
  const currentScores: Record<AbilityKey, number> = {
    str: sheet.str, dex: sheet.dex, con: sheet.con,
    int: sheet.int, wis: sheet.wis, cha: sheet.cha,
  };
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

  // ── PV máximo ─────────────────────────────────────────────────────────────
  const conModBefore = mod(currentScores.con);
  const conModAfter = mod(newScores.con);
  // Ganho do novo nível usa o mod. de CON já atualizado (PHB: o nível em que
  // o aumento ocorre também se beneficia)
  const hpGain = Math.max(1, hpDie + conModAfter);
  // Retroativo: +1 PV por nível JÁ possuído para cada ponto de mod. ganho
  const retroactiveHp = (conModAfter - conModBefore) * plan.fromLevel;
  const newHpMax = sheet.hpMax + hpGain + retroactiveHp;

  // ── Magias novas (truques + magias conhecidas/grimório) ──────────────────
  const newLevel = plan.newLevel;
  const choices = spellChoicesOnLevelUp(cls.id, newLevel);
  const known = new Set(sheet.spells.map((s) => s.spellName.toLowerCase()));
  const classKey = spellClassKey(cls.id);
  const maxSpellLv = maxSpellLevelAt(cls.id, newLevel);

  const requestedIds: string[] = Array.isArray(body.newSpells) ? body.newSpells : [];
  const newSpellRows: typeof SPELLS = [];
  let cantripCount = 0;
  let spellCount = 0;
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

  // ── Persistência (transação) ──────────────────────────────────────────────
  const newFeatures = [
    ...plan.classFeatures.map((f) => ({ ...f, source: `${cls.name} ${newLevel}°` })),
    ...plan.raceFeatures.map((f) => ({ ...f, source: `Raça · ${newLevel}° nível` })),
  ];

  await prisma.$transaction([
    prisma.dndSheet.update({
      where: { id: sheet.id },
      data: {
        level: newLevel,
        xp: Math.max(sheet.xp, XP_THRESHOLDS[newLevel]),
        hpMax: newHpMax,
        hpCurrent: sheet.hpCurrent + hpGain + retroactiveHp,
        str: newScores.str, dex: newScores.dex, con: newScores.con,
        int: newScores.int, wis: newScores.wis, cha: newScores.cha,
        // iniciativa acompanha mod. de Destreza (pode mudar com ASI)
        initiative: mod(newScores.dex),
      },
    }),
    prisma.dndClass.update({
      where: { id: clsEntry.id },
      data: { level: newLevel },
    }),
    ...(newFeatures.length > 0
      ? [
          prisma.dndFeature.createMany({
            data: newFeatures.map((f) => ({
              sheetId: sheet.id,
              name: f.name,
              source: f.source,
              description: f.description,
            })),
          }),
        ]
      : []),
    ...(newSpellRows.length > 0
      ? [
          prisma.dndSpell.createMany({
            data: newSpellRows.map((sp) => ({
              sheetId: sheet.id,
              spellName: sp.name,
              level: sp.level,
              school: sp.school,
              prepared: sp.level === 0,
              description: sp.description,
              castingTime: sp.castingTime,
              range: sp.range,
              duration: sp.duration,
            })),
          }),
        ]
      : []),
  ]);

  return NextResponse.json({
    ok: true,
    summary: {
      newLevel,
      hpGain: hpGain + retroactiveHp,
      hpDie,
      hpMode,
      conRetroactive: retroactiveHp,
      newHpMax,
      profBonusBefore: plan.profBonusBefore,
      profBonusAfter: plan.profBonusAfter,
      asiApplied: asiIncreases,
      features: newFeatures,
      slotsGained: plan.slotsGained,
      newMaxSlots: plan.newMaxSlots,
      cantripsBefore: plan.cantripsBefore,
      cantripsAfter: plan.cantripsAfter,
      spellsKnownBefore: plan.spellsKnownBefore,
      spellsKnownAfter: plan.spellsKnownAfter,
      spellsLearned: newSpellRows.map((sp) => sp.name),
    },
  });
}
