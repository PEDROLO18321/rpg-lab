import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toJsonFieldOrNull, LIMITS } from "@/lib/characterTransfer";
import { numIn, textIn, nameIn, portraitIn, comGuardas } from "@/lib/sheetPatch";

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
  const {
    pvCurrent, sanCurrent, pmCurrent, luck, notes,
    pvTemp, sanTemp, pmTemp,
    pvMax, sanMax, mov,
    atribFor, atribCon, atribTam, atribDes, atribApa, atribInt, atribPod, atribEdu,
    occupation, age, era,
    skills, skillChecks, equipment, name, insanityData, spellsData,
    portraitUrl, weapons, background,
  } = body;

  // Faixas do sistema. Atributos, Sorte e Sanidade são percentuais (d100):
  // teto 99 (schema.prisma: "valores percentuais, 15-99"; sanMax padrão 99).
  // Vitais atuais aceitam negativo (investigador morrendo / sanidade perdida).
  const campos = {
    pvCurrent:  numIn(pvCurrent,  -99, 99, "pvCurrent"),
    sanCurrent: numIn(sanCurrent, -99, 99, "sanCurrent"),
    // PM = POD/5, no máximo ~20; 99 é o teto do percentual de POD.
    pmCurrent:  numIn(pmCurrent,  -99, 99, "pmCurrent"),
    luck:       numIn(luck,        0, 99, "luck"),
    pvTemp:     numIn(pvTemp,      0, 99, "pvTemp"),
    sanTemp:    numIn(sanTemp,     0, 99, "sanTemp"),
    pmTemp:     numIn(pmTemp,      0, 99, "pmTemp"),
    // PV máx = (CON+TAM)/10 — não passa de 20 por regra; 99 é folga de casa.
    pvMax:      numIn(pvMax,       1, 99, "pvMax"),
    sanMax:     numIn(sanMax,      0, 99, "sanMax"),
    mov:        numIn(mov,         0, 99, "mov"),
    atribFor:   numIn(atribFor,    0, 99, "atribFor"),
    atribCon:   numIn(atribCon,    0, 99, "atribCon"),
    atribTam:   numIn(atribTam,    0, 99, "atribTam"),
    atribDes:   numIn(atribDes,    0, 99, "atribDes"),
    atribApa:   numIn(atribApa,    0, 99, "atribApa"),
    atribInt:   numIn(atribInt,    0, 99, "atribInt"),
    atribPod:   numIn(atribPod,    0, 99, "atribPod"),
    atribEdu:   numIn(atribEdu,    0, 99, "atribEdu"),
    // Idade: a tabela de envelhecimento do sistema começa em 15; 200 é só teto.
    age:        numIn(age,         1, 200, "age"),
  };

  const sheetData = {
    ...Object.fromEntries(Object.entries(campos).filter(([, v]) => v !== undefined)),
    ...(occupation  !== undefined ? { occupation: textIn(occupation, LIMITS.name, "occupation") } : {}),
    ...(era         !== undefined ? { era:        textIn(era, LIMITS.name, "era") } : {}),
    ...(notes       !== undefined ? { notes:      textIn(notes, LIMITS.text, "notes") } : {}),
    // `equipment` é String no banco, mas guarda a lista serializada: teto de JSON.
    ...(equipment   !== undefined ? { equipment:  textIn(equipment, LIMITS.json, "equipment") } : {}),
    ...(skills        !== undefined ? { skills: toJsonFieldOrNull(skills) } : {}),
    ...(skillChecks   !== undefined ? { skillChecks: toJsonFieldOrNull(skillChecks) } : {}),
    ...(insanityData  !== undefined ? { insanityData: toJsonFieldOrNull(insanityData) } : {}),
    ...(spellsData    !== undefined ? { spellsData: toJsonFieldOrNull(spellsData) } : {}),
    ...(weapons   !== undefined ? { weapons: toJsonFieldOrNull(weapons) } : {}),
    ...(background !== undefined ? { background: toJsonFieldOrNull(background) } : {}),
  };

  const charUpdates: Record<string, unknown> = {};
  const nome = nameIn(name);
  if (nome !== undefined) charUpdates.name = nome;
  const retrato = portraitIn(portraitUrl);
  if (retrato !== undefined) charUpdates.portraitUrl = retrato;

  await prisma.$transaction([
    prisma.cthulhuSheet.update({ where: { id }, data: sheetData }),
    ...(Object.keys(charUpdates).length > 0
      ? [prisma.character.update({ where: { id }, data: charUpdates })]
      : []),
  ]);

  return NextResponse.json({ ok: true });
  });
}
