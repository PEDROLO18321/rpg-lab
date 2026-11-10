import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toJsonFieldOrNull, LIMITS } from "@/lib/characterTransfer";
import { numIn, textIn, nameIn, portraitIn, comGuardas } from "@/lib/sheetPatch";
import { STAT_KEYS } from "@/lib/cyberpunk/data";
import { RANGES, methodIn, roleIn, shapeIn, skillsIn } from "@/lib/cyberpunk/sheetInput";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.character.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return comGuardas(async () => {
  const body = await req.json();

  // Faixas em RANGES (src/lib/cyberpunk/sheetInput.ts). Os derivados (HP,
  // Humanidade) são editáveis porque o jogador os ajusta em jogo; a rota
  // só confere a faixa, não recalcula.
  const campos: Record<string, number | undefined> = {
    roleRank:          numIn(body.roleRank,          ...RANGES.roleRank,          "roleRank"),
    hpMax:             numIn(body.hpMax,             ...RANGES.hpMax,             "hpMax"),
    hpCurrent:         numIn(body.hpCurrent,         ...RANGES.hpCurrent,         "hpCurrent"),
    humanityMax:       numIn(body.humanityMax,       ...RANGES.humanityMax,       "humanityMax"),
    humanity:          numIn(body.humanity,          ...RANGES.humanity,          "humanity"),
    luckCurrent:       numIn(body.luckCurrent,       ...RANGES.luckCurrent,       "luckCurrent"),
    eurobucks:         numIn(body.eurobucks,         ...RANGES.eurobucks,         "eurobucks"),
    improvementPoints: numIn(body.improvementPoints, ...RANGES.improvementPoints, "improvementPoints"),
    reputation:        numIn(body.reputation,        ...RANGES.reputation,        "reputation"),
    deathSavePenalty:  numIn(body.deathSavePenalty,  ...RANGES.deathSavePenalty,  "deathSavePenalty"),
    ...Object.fromEntries(STAT_KEYS.map((k) => [k, numIn(body[k], ...RANGES.stat, k)])),
  };

  const role = roleIn(body.role);
  const creationMethod = methodIn(body.creationMethod);

  const sheetData = {
    ...Object.fromEntries(Object.entries(campos).filter(([, v]) => v !== undefined)),
    ...(role           !== undefined ? { role } : {}),
    ...(creationMethod !== undefined ? { creationMethod } : {}),
    ...(body.notes !== undefined ? { notes: textIn(body.notes, LIMITS.text, "notes") } : {}),
    // Json não-nulo no schema: `null` no corpo vira undefined (não toca a coluna), nunca grava NULL.
    ...(body.skills !== undefined ? { skills: toJsonFieldOrNull(skillsIn(body.skills)) } : {}),
    ...(body.armor !== undefined ? { armor: toJsonFieldOrNull(shapeIn(body.armor, "object", "armor")) } : {}),
    ...(body.weapons !== undefined ? { weapons: toJsonFieldOrNull(shapeIn(body.weapons, "array", "weapons")) } : {}),
    ...(body.cyberware !== undefined ? { cyberware: toJsonFieldOrNull(shapeIn(body.cyberware, "array", "cyberware")) } : {}),
    ...(body.gear !== undefined ? { gear: toJsonFieldOrNull(shapeIn(body.gear, "array", "gear")) } : {}),
    ...(body.criticalInjuries !== undefined ? { criticalInjuries: toJsonFieldOrNull(shapeIn(body.criticalInjuries, "array", "criticalInjuries")) } : {}),
    ...(body.lifepath !== undefined ? { lifepath: toJsonFieldOrNull(shapeIn(body.lifepath, "object", "lifepath")) } : {}),
    ...(body.background !== undefined ? { background: toJsonFieldOrNull(shapeIn(body.background, "object", "background")) } : {}),
  };

  const charUpdates: Record<string, unknown> = {};
  const nome = nameIn(body.name);
  if (nome !== undefined) charUpdates.name = nome;
  const retrato = portraitIn(body.portraitUrl);
  if (retrato !== undefined) charUpdates.portraitUrl = retrato;

  await prisma.$transaction([
    prisma.cyberpunkSheet.update({ where: { id }, data: sheetData }),
    ...(Object.keys(charUpdates).length > 0
      ? [prisma.character.update({ where: { id }, data: charUpdates })]
      : []),
  ]);

  return NextResponse.json({ ok: true });
  });
}
