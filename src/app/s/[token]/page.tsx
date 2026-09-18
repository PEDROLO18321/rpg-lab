// Destino do link de compartilhamento. Exige login; a partir daí o visitante
// escolhe em qual campanha *dele*, do mesmo sistema, a ficha entra.
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LinkSheetClient } from "./LinkSheetClient";

export const metadata = { title: "Vincular ficha à campanha · RPG Lab" };

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await auth();

  // Sem sessão o visitante volta para cá depois do login, sem perder o link.
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(`/s/${token}`)}`);

  return <LinkSheetClient token={token} />;
}
