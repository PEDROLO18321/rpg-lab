import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CharacterWizard } from "./CharacterWizard";

export default async function NewTormentaCharacterPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const system = await prisma.system.findUnique({ where: { slug: "tormenta20" } });
  if (!system) redirect("/dashboard/tormenta");

  return <CharacterWizard userId={session.user.id} systemId={system.id} />;
}
