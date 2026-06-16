import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const body = await req.json();
  const {
    pvCurrent, sanCurrent, pmCurrent, luck, notes,
    pvTemp, sanTemp, pmTemp,
    pvMax, sanMax, mov,
    atribFor, atribCon, atribTam, atribDes, atribApa, atribInt, atribPod, atribEdu,
    occupation, age, era,
    skills, skillChecks, equipment, name,
  } = body;

  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

  const sheetData = {
    ...(num(pvCurrent)  !== undefined ? { pvCurrent }  : {}),
    ...(num(sanCurrent) !== undefined ? { sanCurrent } : {}),
    ...(num(pmCurrent)  !== undefined ? { pmCurrent }  : {}),
    ...(num(luck)       !== undefined ? { luck }       : {}),
    ...(num(pvTemp)     !== undefined ? { pvTemp }     : {}),
    ...(num(sanTemp)    !== undefined ? { sanTemp }    : {}),
    ...(num(pmTemp)     !== undefined ? { pmTemp }     : {}),
    ...(num(pvMax)      !== undefined ? { pvMax }      : {}),
    ...(num(sanMax)     !== undefined ? { sanMax }     : {}),
    ...(num(mov)        !== undefined ? { mov }        : {}),
    ...(num(atribFor)   !== undefined ? { atribFor }   : {}),
    ...(num(atribCon)   !== undefined ? { atribCon }   : {}),
    ...(num(atribTam)   !== undefined ? { atribTam }   : {}),
    ...(num(atribDes)   !== undefined ? { atribDes }   : {}),
    ...(num(atribApa)   !== undefined ? { atribApa }   : {}),
    ...(num(atribInt)   !== undefined ? { atribInt }   : {}),
    ...(num(atribPod)   !== undefined ? { atribPod }   : {}),
    ...(num(atribEdu)   !== undefined ? { atribEdu }   : {}),
    ...(num(age)        !== undefined ? { age }        : {}),
    ...(occupation  !== undefined ? { occupation } : {}),
    ...(era         !== undefined ? { era }        : {}),
    ...(notes       !== undefined ? { notes }      : {}),
    ...(equipment   !== undefined ? { equipment }  : {}),
    ...(skills      !== undefined ? { skills: skills ? JSON.stringify(skills) : null } : {}),
    ...(skillChecks !== undefined ? { skillChecks: skillChecks ? JSON.stringify(skillChecks) : null } : {}),
  };

  await prisma.$transaction([
    prisma.cthulhuSheet.update({ where: { id }, data: sheetData }),
    ...(typeof name === "string" && name.trim()
      ? [prisma.character.update({ where: { id }, data: { name: name.trim() } })]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
