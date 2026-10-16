import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toJsonFieldOrNull, LIMITS } from "@/lib/characterTransfer";
import { MAX_LEVEL } from "@/lib/starwars/leveling";
import { numIn, textIn, nameIn, portraitIn, comGuardas } from "@/lib/sheetPatch";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findUnique({ where: { id }, include: { starWarsSheet: true } });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const sheet = character.starWarsSheet;
  if (!sheet) return NextResponse.json({ error: "No sheet" }, { status: 404 });

  return comGuardas(async () => {
  const body = await req.json();
  const {
    pvCurrent, pvTemp, peCurrent, peTemp, ppCurrent, ppTemp, notes,
    skills, classPowers, generalPowers, equipment, weapons, conditions, background, sabreForm,
    name, portraitUrl, planetSkillChoice,
    agi, int, forca, vig, pre, sen, level, xp, peMax, ppMax, classes,
    unlockedProphecies, pvClassSum, pvLevelGain,
  } = body;

  // Faixas do sistema. O Star Wars é autoral e vai MUITO além dos outros:
  // MAX_LEVEL = 2000 (src/lib/starwars/leveling.ts). A cada 10 níveis há +1
  // atributo (leveling.ts, "Múltiplo de 10"), logo um atributo chega perto de
  // 4 (criação) + 200; e PV/PE/PP crescem por nível, então os tetos de vitais
  // acompanham a escala de nível 2000, não a de 20.
  const ATTR_MAX = 300;
  const VITAL_MAX = 1_000_000;
  const pvClassSumN  = numIn(pvClassSum,  0, VITAL_MAX, "pvClassSum");
  const pvLevelGainN = numIn(pvLevelGain, 0, VITAL_MAX, "pvLevelGain");

  // PV Máximo = Pv Soma das Classes + Pv por Subir de Nível (ambos já embutem Vigor via as fórmulas de arquétipo).
  // Recalculado sempre que qualquer um dos termos muda nesta requisição.
  const touchesPvFormula = pvClassSumN !== undefined || pvLevelGainN !== undefined;
  const effClassSum = pvClassSumN ?? sheet.pvClassSum;
  const effLevelGain = pvLevelGainN ?? sheet.pvLevelGain;
  const computedPvMax = effClassSum + effLevelGain;

  const campos = {
    // Atuais aceitam negativo (personagem morrendo); temporários e máximos, não.
    pvCurrent: numIn(pvCurrent, -999, VITAL_MAX, "pvCurrent"),
    pvTemp:    numIn(pvTemp,       0, VITAL_MAX, "pvTemp"),
    peCurrent: numIn(peCurrent, -999, VITAL_MAX, "peCurrent"),
    peTemp:    numIn(peTemp,       0, VITAL_MAX, "peTemp"),
    ppCurrent: numIn(ppCurrent, -999, VITAL_MAX, "ppCurrent"),
    ppTemp:    numIn(ppTemp,       0, VITAL_MAX, "ppTemp"),
    // Mínimo negativo: o Humano tem um atributo -1 (humanAttrChoice no schema).
    agi:       numIn(agi,   -10, ATTR_MAX, "agi"),
    int:       numIn(int,   -10, ATTR_MAX, "int"),
    forca:     numIn(forca, -10, ATTR_MAX, "forca"),
    vig:       numIn(vig,   -10, ATTR_MAX, "vig"),
    pre:       numIn(pre,   -10, ATTR_MAX, "pre"),
    sen:       numIn(sen,   -10, ATTR_MAX, "sen"),
    level:     numIn(level,   1, MAX_LEVEL, "level"),
    // XP não tem tabela no código que dê um teto; 1e9 é só contra lixo (CHUTE).
    xp:        numIn(xp,      0, 1_000_000_000, "xp"),
    peMax:     numIn(peMax,   0, VITAL_MAX, "peMax"),
    ppMax:     numIn(ppMax,   0, VITAL_MAX, "ppMax"),
  };

  const sheetData = {
    ...Object.fromEntries(Object.entries(campos).filter(([, v]) => v !== undefined)),
    ...(touchesPvFormula ? { pvMax: computedPvMax, pvClassSum: effClassSum, pvLevelGain: effLevelGain } : {}),
    ...(notes !== undefined ? { notes: textIn(notes, LIMITS.text, "notes") } : {}),
    ...(sabreForm !== undefined ? { sabreForm: textIn(sabreForm, LIMITS.name, "sabreForm") } : {}),
    ...(planetSkillChoice !== undefined ? { planetSkillChoice: textIn(planetSkillChoice, LIMITS.name, "planetSkillChoice") } : {}),
    // `classes` e `unlockedProphecies` não aceitam null no banco: vazio é o padrão.
    ...(classes       !== undefined ? { classes: toJsonFieldOrNull(classes) ?? {} } : {}),
    ...(skills        !== undefined ? { skills: toJsonFieldOrNull(skills) } : {}),
    ...(classPowers   !== undefined ? { classPowers: toJsonFieldOrNull(classPowers) } : {}),
    ...(generalPowers !== undefined ? { generalPowers: toJsonFieldOrNull(generalPowers) } : {}),
    ...(weapons       !== undefined ? { weapons: toJsonFieldOrNull(weapons) } : {}),
    ...(equipment     !== undefined ? { equipment: toJsonFieldOrNull(equipment) } : {}),
    ...(conditions    !== undefined ? { conditions: toJsonFieldOrNull(conditions) } : {}),
    ...(background    !== undefined ? { background: toJsonFieldOrNull(background) } : {}),
    ...(unlockedProphecies !== undefined ? { unlockedProphecies: toJsonFieldOrNull(unlockedProphecies) ?? [] } : {}),
  };

  const charUpdates: Record<string, unknown> = {};
  const nome = nameIn(name);
  if (nome !== undefined) charUpdates.name = nome;
  const retrato = portraitIn(portraitUrl);
  if (retrato !== undefined) charUpdates.portraitUrl = retrato;

  await prisma.$transaction([
    prisma.starWarsSheet.update({ where: { id }, data: sheetData }),
    ...(Object.keys(charUpdates).length > 0 ? [prisma.character.update({ where: { id }, data: charUpdates })] : []),
  ]);

  return NextResponse.json({ ok: true });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const character = await prisma.character.findUnique({ where: { id } });
  if (!character) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (character.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.character.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
