import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SheetClient } from "./SheetClient";

export default async function TormentaSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const character = await prisma.character.findUnique({
    where: { id },
    include: { tormentaSheet: true, system: true },
  });

  if (!character || !character.tormentaSheet) notFound();
  if (character.userId !== session.user.id) redirect("/dashboard/tormenta");

  return <SheetClient character={character as never} />;
}
