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
    nex, patente, prestige, affinity, trail, origin, className,
    agi, forca, int, pre, vig,
    pvMax, pvCurrent, pvTemp, peMax, peCurrent, peTemp, sanMax, sanCurrent, sanTemp,
    defense, movement,
    skills, abilities, rituals, inventory, weapons, background, conditions, insanity,
    notes, name, portraitUrl,
  } = body;

  // Faixas do sistema. Vitais atuais aceitam negativo (personagem morrendo ou
  // enlouquecendo); máximos e temporários, não.
  const campos = {
    // NEX_VALUES (src/lib/ordem/data.ts): vai de 5 a 99, não é "nível".
    nex:        numIn(nex,        5, 99, "nex"),
    // Prestígio é pontuação aberta (patente); o teto é só contra lixo.
    prestige:   numIn(prestige,   0, 99_999, "prestige"),
    // Atributos: schema.prisma diz 0-5. Folga até 10 para bônus de item/ritual.
    agi:        numIn(agi,        0, 10, "agi"),
    forca:      numIn(forca,      0, 10, "forca"),
    int:        numIn(int,        0, 10, "int"),
    pre:        numIn(pre,        0, 10, "pre"),
    vig:        numIn(vig,        0, 10, "vig"),
    // PV/PE/SAN: computeVitals (data.ts) rende dezenas no NEX 99; 9.999 é só teto.
    pvMax:      numIn(pvMax,      0, 9_999, "pvMax"),
    pvCurrent:  numIn(pvCurrent,  -999, 9_999, "pvCurrent"),
    pvTemp:     numIn(pvTemp,     0, 9_999, "pvTemp"),
    peMax:      numIn(peMax,      0, 9_999, "peMax"),
    peCurrent:  numIn(peCurrent,  -999, 9_999, "peCurrent"),
    peTemp:     numIn(peTemp,     0, 9_999, "peTemp"),
    sanMax:     numIn(sanMax,     0, 9_999, "sanMax"),
    sanCurrent: numIn(sanCurrent, -999, 9_999, "sanCurrent"),
    sanTemp:    numIn(sanTemp,    0, 9_999, "sanTemp"),
    defense:    numIn(defense,    0, 999, "defense"),
    movement:   numIn(movement,   0, 999, "movement"),
  };

  // Slugs curtos (patente, origem, classe...): mesmo teto do nome.
  const slug = (v: unknown, campo: string) => textIn(v, LIMITS.name, campo);
  // `patente` não aceita null no banco: null/ausente deixa o valor como está.
  const patenteOk = slug(patente, "patente") ?? undefined;

  const sheetData = {
    ...Object.fromEntries(Object.entries(campos).filter(([, v]) => v !== undefined)),
    ...(patenteOk !== undefined ? { patente: patenteOk } : {}),
    ...(affinity  !== undefined ? { affinity:  slug(affinity, "affinity") } : {}),
    ...(trail     !== undefined ? { trail:     slug(trail, "trail") } : {}),
    ...(origin    !== undefined ? { origin:    slug(origin, "origin") } : {}),
    ...(className !== undefined ? { className: slug(className, "className") } : {}),
    ...(notes     !== undefined ? { notes:     textIn(notes, LIMITS.text, "notes") } : {}),
    ...(skills     !== undefined ? { skills:     toJsonFieldOrNull(skills) } : {}),
    ...(abilities  !== undefined ? { abilities:  toJsonFieldOrNull(abilities) } : {}),
    ...(rituals    !== undefined ? { rituals:    toJsonFieldOrNull(rituals) } : {}),
    ...(inventory  !== undefined ? { inventory:  toJsonFieldOrNull(inventory) } : {}),
    ...(weapons    !== undefined ? { weapons:    toJsonFieldOrNull(weapons) } : {}),
    ...(background !== undefined ? { background: toJsonFieldOrNull(background) } : {}),
    ...(conditions !== undefined ? { conditions: toJsonFieldOrNull(conditions) } : {}),
    ...(insanity   !== undefined ? { insanity:   toJsonFieldOrNull(insanity) } : {}),
  };

  const charUpdates: Record<string, unknown> = {};
  const nome = nameIn(name);
  if (nome !== undefined) charUpdates.name = nome;
  const retrato = portraitIn(portraitUrl);
  if (retrato !== undefined) charUpdates.portraitUrl = retrato;

  await prisma.$transaction([
    prisma.ordemSheet.update({ where: { id }, data: sheetData }),
    ...(Object.keys(charUpdates).length > 0
      ? [prisma.character.update({ where: { id }, data: charUpdates })]
      : []),
  ]);

  return NextResponse.json({ ok: true });
  });
}
