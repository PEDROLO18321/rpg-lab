import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewCharacterEntry } from "./NewCharacterEntry";

export default async function NewAgentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const system = await prisma.system.findUnique({ where: { slug: "ordem" } });
  if (!system) redirect("/dashboard/ordem");

  return <NewCharacterEntry systemId={system.id} />;
}
