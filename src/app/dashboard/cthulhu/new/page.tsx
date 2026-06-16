import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CthulhuWizard } from "./CthulhuWizard";

export default async function NewInvestigatorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const system = await prisma.system.findUnique({ where: { slug: "cthulhu7" } });
  if (!system) redirect("/dashboard/cthulhu");

  return <CthulhuWizard userId={session.user.id} systemId={system.id} />;
}
