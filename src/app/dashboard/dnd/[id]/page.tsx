import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SheetClient } from "./SheetClient";

async function fetchCharacter(id: string, userId: string) {
  return prisma.character.findFirst({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      notes: true,
      portraitUrl: true,
      dndSheet: {
        select: {
          id: true,
          race: true,
          background: true,
          alignment: true,
          level: true,
          xp: true,
          str: true, dex: true, con: true, int: true, wis: true, cha: true,
          hpMax: true, hpCurrent: true, hpTemp: true,
          hitDice: true, hitDiceUsed: true,
          deathSavesSuccess: true, deathSavesFailure: true,
          armorClass: true, initiative: true, speed: true,
          inspiration: true,
          cp: true, sp: true, ep: true, gp: true, pp: true,
          conditions: true,
          spellSlotsUsed: true,
          spellAbility: true,
          classes:   { select: { id: true, className: true, subclass: true, level: true } },
          skills:    { select: { id: true, skillName: true, proficient: true, expertise: true } },
          spells:    { select: { id: true, spellName: true, level: true, school: true, prepared: true, castingTime: true, range: true, duration: true, description: true } },
          equipment: { select: { id: true, itemName: true, quantity: true, equipped: true, weight: true, description: true } },
          features:  { select: { id: true, name: true, source: true, description: true } },
        },
      },
    },
  });
}

export default async function CharacterSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const character = await fetchCharacter(id, session.user.id);
  if (!character || !character.dndSheet) notFound();

  return (
    <SheetClient
      characterId={character.id}
      characterName={character.name}
      sheet={character.dndSheet}
      notes={character.notes}
      portraitUrl={character.portraitUrl}
      userName={session.user.name ?? session.user.email ?? "Usuário"}
    />
  );
}
