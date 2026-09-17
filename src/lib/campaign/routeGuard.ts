// Guarda comum das rotas genéricas de campanha: sessão válida + sistema conhecido.
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isSystemKey, type SystemKey } from "@/lib/campaign/registry";

export type Guard =
  | { ok: true; system: SystemKey; userId: string }
  | { ok: false; response: NextResponse };

export async function guardSystem(system: string): Promise<Guard> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isSystemKey(system)) {
    return { ok: false, response: NextResponse.json({ error: "Sistema inválido." }, { status: 404 }) };
  }
  return { ok: true, system, userId: session.user.id };
}

export function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
