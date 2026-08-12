import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SheetClient } from "./SheetClient";

export default async function OrdemSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const character = await prisma.character.findUnique({
    where: { id },
    include: { ordemSheet: true, system: true, user: true },
  });

  if (!character || !character.ordemSheet) notFound();
  if (character.userId !== session.user.id) redirect("/dashboard/ordem");

  return <SheetClient character={character as never} />;
}
