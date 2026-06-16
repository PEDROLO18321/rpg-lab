import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      systemId, name, era, age,
      atribFor, atribCon, atribTam, atribDes, atribApa, atribInt, atribPod, atribEdu,
      sanCurrent, sanMax, pvMax, pvCurrent, luck, mov, pmCurrent,
      occupation, skills, background, notes, weapons, equipment,
    } = body;

    if (!systemId || !name?.trim())
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });

    const character = await prisma.character.create({
      data: {
        userId:   session.user.id,
        systemId,
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
            skills:     skills ? JSON.stringify(skills) : null,
            background: background ? JSON.stringify(background) : null,
            weapons:    weapons && weapons.length ? JSON.stringify(weapons) : null,
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
