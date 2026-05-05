import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CharacterWizard } from "./CharacterWizard";

export default async function NewCharacterPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const system = await prisma.system.findUnique({ where: { slug: "dnd5e" } });
  if (!system) redirect("/dashboard/dnd");

  return <CharacterWizard userId={session.user.id} systemId={system.id} />;
}
