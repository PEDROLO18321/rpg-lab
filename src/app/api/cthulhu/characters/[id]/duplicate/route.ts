import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const original = await prisma.character.findUnique({
    where: { id },
    include: { cthulhuSheet: true },
  });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (original.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const s = original.cthulhuSheet;

  const copy = await prisma.character.create({
    data: {
      userId: original.userId,
      systemId: original.systemId,
      name: `${original.name} (cópia)`,
      portraitUrl: original.portraitUrl,
      notes: original.notes,
      ...(s
        ? {
            cthulhuSheet: {
              create: {
                occupation: s.occupation,
                era: s.era,
                age: s.age,
                atribFor: s.atribFor,
                atribCon: s.atribCon,
                atribTam: s.atribTam,
                atribDes: s.atribDes,
                atribApa: s.atribApa,
                atribInt: s.atribInt,
                atribPod: s.atribPod,
                atribEdu: s.atribEdu,
                sanCurrent: s.sanCurrent,
                sanMax: s.sanMax,
                pvMax: s.pvMax,
                pvCurrent: s.pvCurrent,
                luck: s.luck,
                mov: s.mov,
                pmCurrent: s.pmCurrent,
                pvTemp: s.pvTemp,
                sanTemp: s.sanTemp,
                pmTemp: s.pmTemp,
                skillChecks: s.skillChecks,
                skills: s.skills,
                background: s.background,
                weapons: s.weapons,
                equipment: s.equipment,
                notes: s.notes,
                insanityData: s.insanityData,
                spellsData: s.spellsData,
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ ok: true, id: copy.id });
}
