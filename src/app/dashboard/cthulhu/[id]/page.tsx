import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SheetClient } from "./SheetClient";

export default async function CthulhuSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const character = await prisma.character.findFirst({
    where: { id, userId: session.user.id },
    include: { cthulhuSheet: true, user: { select: { name: true } } },
  });

  if (!character || !character.cthulhuSheet) notFound();

  return <SheetClient character={character as never} />;
}
