import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeVitals, computeDefense, BASE_MOVEMENT, type ClassId } from "@/lib/ordem/data";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      systemId, name, origin, className, trail, nex,
      attrs, skills, abilities, rituals, inventory, weapons, background, notes,
      paranormalPower,
    } = body;

    if (!systemId || !name?.trim())
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
        userId:   session.user.id,
        systemId,
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
            skills:    skills    ? JSON.stringify(skills)    : null,
            abilities: abilities
              ? JSON.stringify(abilities)
              : paranormalPower
                ? JSON.stringify({ paranormalPower })
                : null,
            rituals:   rituals   ? JSON.stringify(rituals)   : null,
            inventory: inventory ? JSON.stringify(inventory) : null,
            weapons:   weapons && weapons.length ? JSON.stringify(weapons) : null,
            background: background ? JSON.stringify(background) : null,
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
