import { NextRequest, NextResponse } from "next/server";
import { authedSystemContext } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";
import { toJsonFieldOrNull } from "@/lib/characterTransfer";

export async function POST(req: NextRequest) {
  const ctx = await authedSystemContext("cthulhu");
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  try {
    const body = await req.json();
    const {
      name, era, age,
      atribFor, atribCon, atribTam, atribDes, atribApa, atribInt, atribPod, atribEdu,
      sanCurrent, sanMax, pvMax, pvCurrent, luck, mov, pmCurrent,
      occupation, skills, background, notes, weapons, equipment,
    } = body;

    if (!name?.trim())
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });

    const character = await prisma.character.create({
      data: {
        userId:   ctx.userId,
        systemId: ctx.systemId,
        name:     name.trim(),
        notes:    notes ?? null,
        cthulhuSheet: {
          create: {
            occupation: occupation ?? null,
            era:        era ?? "1920s",
            age:        age ?? 25,
            atribFor:   atribFor ?? 50,
            atribCon:   atribCon ?? 50,
            atribTam:   atribTam ?? 65,
            atribDes:   atribDes ?? 50,
            atribApa:   atribApa ?? 50,
            atribInt:   atribInt ?? 65,
            atribPod:   atribPod ?? 50,
            atribEdu:   atribEdu ?? 65,
            sanCurrent: sanCurrent ?? atribPod ?? 50,
            sanMax:     sanMax ?? 99,
            pvMax:      pvMax ?? 12,
            pvCurrent:  pvCurrent ?? pvMax ?? 12,
            luck:       luck ?? 50,
            mov:        mov ?? 8,
            pmCurrent:  pmCurrent ?? Math.floor((atribPod ?? 50) / 5),
            skills:     toJsonFieldOrNull(skills),
            background: toJsonFieldOrNull(background),
            weapons:    toJsonFieldOrNull(weapons && weapons.length ? weapons : null),
            equipment:  equipment?.trim() ? equipment.trim() : null,
          },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: character.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/cthulhu/characters]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
