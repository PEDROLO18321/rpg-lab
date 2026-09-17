import { NextRequest, NextResponse } from "next/server";
import { authedSystemContext } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";
import { toJsonFieldOrNull } from "@/lib/characterTransfer";
import { computeVitals, computeDefense, BASE_MOVEMENT, type ClassId } from "@/lib/ordem/data";

export async function POST(req: NextRequest) {
  const ctx = await authedSystemContext("ordem");
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  try {
    const body = await req.json();
    const {
      name, origin, className, trail, nex,
      attrs, skills, abilities, rituals, inventory, weapons, background, notes,
      paranormalPower,
    } = body;

    if (!name?.trim())
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    if (!className)
      return NextResponse.json({ error: "Classe obrigatória." }, { status: 400 });

    const a = attrs ?? {};
    const agi   = a.agi ?? 1;
    const forca = a.for ?? 1;
    const int   = a.int ?? 1;
    const pre   = a.pre ?? 1;
    const vig   = a.vig ?? 1;
    const nexVal = nex ?? 5;

    const vitals = computeVitals(className as ClassId, nexVal, vig, pre, origin ?? undefined);

    const character = await prisma.character.create({
      data: {
        userId:   ctx.userId,
        systemId: ctx.systemId,
        name:     name.trim(),
        notes:    notes ?? null,
        ordemSheet: {
          create: {
            origin:    origin ?? null,
            className,
            trail:     trail ?? null,
            nex:       nexVal,
            agi, forca, int, pre, vig,
            pvMax:     vitals.pvMax,
            pvCurrent: vitals.pvMax,
            peMax:     vitals.peMax,
            peCurrent: vitals.peMax,
            sanMax:    vitals.sanMax,
            sanCurrent: vitals.sanMax,
            defense:   computeDefense(agi),
            movement:  BASE_MOVEMENT,
            skills:    toJsonFieldOrNull(skills),
            abilities: toJsonFieldOrNull(abilities ?? (paranormalPower ? { paranormalPower } : null)),
            rituals:   toJsonFieldOrNull(rituals),
            inventory: toJsonFieldOrNull(inventory),
            weapons:   toJsonFieldOrNull(weapons && weapons.length ? weapons : null),
            background: toJsonFieldOrNull(background),
          },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: character.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/ordem/characters]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
