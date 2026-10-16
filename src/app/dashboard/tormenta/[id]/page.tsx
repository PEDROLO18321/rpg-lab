import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SheetClient } from "./SheetClient";
import { RACE_BY_ID } from "@/lib/tormenta/races";
import { CLASS_BY_ID } from "@/lib/tormenta/classes";
import { ORIGIN_BY_ID } from "@/lib/tormenta/origins";
import { GOD_BY_ID } from "@/lib/tormenta/gods";
import { SPELLS } from "@/lib/tormenta/spells";
import { parseJsonField } from "@/lib/characterTransfer";

export default async function TormentaSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const character = await prisma.character.findFirst({
    where: { id, userId: session.user.id },
    include: { tormentaSheet: true, user: { select: { name: true } } },
  });

  if (!character || !character.tormentaSheet) notFound();

  // Raça, classe, origem, divindade e magias são resolvidas aqui, no servidor.
  // A tela só precisa do nome de cada uma, e importá-las no cliente levava
  // ~86 KB de catálogo para o navegador para exibir meia dúzia de strings.
  // Esses valores só mudam ao subir de nível, que recarrega a página.
  const sheet = character.tormentaSheet;
  const cls = sheet.className ? CLASS_BY_ID[sheet.className] : null;
  const spellIds = parseJsonField<string[]>(sheet.spellsKnown, []);

  const labels = {
    race: sheet.race ? RACE_BY_ID[sheet.race]?.name ?? null : null,
    className: cls?.name ?? null,
    origin: sheet.origin ? ORIGIN_BY_ID[sheet.origin]?.name ?? null : null,
    god: sheet.godId ? GOD_BY_ID[sheet.godId]?.name ?? null : null,
    initials: cls ? cls.id.slice(0, 3).toUpperCase() : "T20",
    spells: spellIds
      .map((id) => SPELLS.find((sp) => sp.id === id))
      .filter((sp) => sp != null)
      .map((sp) => ({ id: sp.id, name: sp.name, school: sp.school, circle: sp.circle, description: sp.description })),
  };

  return <SheetClient character={character as never} labels={labels} />;
}
