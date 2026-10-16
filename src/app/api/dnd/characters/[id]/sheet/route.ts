import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ImportError, LIMITS, toJsonFieldOrNull } from "@/lib/characterTransfer";
import { MAX_LEVEL } from "@/lib/dnd/leveling";
import { numIn, textIn, comGuardas } from "@/lib/sheetPatch";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findUnique({
    where: { id },
    select: { userId: true, dndSheet: { select: { id: true } } },
  });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!character.dndSheet) return NextResponse.json({ error: "No sheet" }, { status: 404 });

  const sheetId = character.dndSheet.id; // fora do closure: o TS perde o estreitamento lá dentro
  return comGuardas(async () => {
  const body = await req.json();

  const allowed = [
    "hpCurrent", "hpTemp", "hitDiceUsed", "deathSavesSuccess", "deathSavesFailure",
    "inspiration", "conditions", "spellSlotsUsed",
    "gp", "cp", "sp", "ep", "pp",
    "str", "dex", "con", "int", "wis", "cha",
    "armorClass", "initiative", "speed", "hpMax", "xp", "level",
    "spellAbility",
  ] as const;

  // Faixas do sistema (SRD 5e). Cada chave da lista de permissão tem a sua.
  // Vitais atuais aceitam negativo (personagem morrendo); máximos, não.
  const faixas: Record<string, [number, number]> = {
    hpCurrent: [-999, 9_999], hpTemp: [0, 9_999], hpMax: [1, 9_999],
    // Dados de vida gastos: no máximo um por nível.
    hitDiceUsed: [0, MAX_LEVEL],
    // Salvaguardas contra a morte: 3 sucessos ou 3 falhas encerram.
    deathSavesSuccess: [0, 3], deathSavesFailure: [0, 3],
    gp: [0, 1_000_000_000], cp: [0, 1_000_000_000], sp: [0, 1_000_000_000],
    ep: [0, 1_000_000_000], pp: [0, 1_000_000_000],
    // Atributo: 1-30 (30 é o teto de qualquer criatura no SRD).
    str: [1, 30], dex: [1, 30], con: [1, 30], int: [1, 30], wis: [1, 30], cha: [1, 30],
    armorClass: [0, 99], initiative: [-99, 99], speed: [0, 999],
    // XP: 355.000 abre o nível 20 (tabela do SRD); 1e7 é só teto contra lixo.
    xp: [0, 10_000_000],
    level: [1, MAX_LEVEL], // MAX_LEVEL = 20 em src/lib/dnd/leveling.ts
  };

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (!(key in body)) continue;
    const v = body[key];
    if (key in faixas) {
      const n = numIn(v, faixas[key][0], faixas[key][1], key);
      if (n !== undefined) data[key] = n;
    } else if (key === "inspiration") {
      if (typeof v !== "boolean") throw new ImportError(`O campo "inspiration" precisa ser verdadeiro ou falso.`);
      data[key] = v;
    } else if (key === "conditions" || key === "spellSlotsUsed") {
      // null/ausente do Json fica de fora, como o Prisma exige para campo Json.
      const j = toJsonFieldOrNull(v);
      if (j !== undefined) data[key] = j;
    } else {
      // spellAbility: String? no banco, aceita null para limpar a escolha.
      data[key] = textIn(v, LIMITS.name, key);
    }
  }

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: "Nenhum campo válido." }, { status: 400 });

  await prisma.dndSheet.update({ where: { id: sheetId }, data });
  return NextResponse.json({ ok: true });
  });
}
