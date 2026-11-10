import { NextRequest, NextResponse } from "next/server";
import { authedSystemContext } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";
import { LIMITS, toJsonFieldOrNull } from "@/lib/characterTransfer";
import { numIn, textIn, nameIn, comGuardas } from "@/lib/sheetPatch";
import {
  STAT_KEYS, STAT_MAX, STAT_MIN, STARTING_ROLE_RANK, type Stats,
} from "@/lib/cyberpunk/data";
import { hpMax as calcHpMax, humanityMax as calcHumanityMax } from "@/lib/cyberpunk/rules";
import { validateCompletePackage } from "@/lib/cyberpunk/creation";
import {
  RANGES, humanityLossOf, methodIn, roleIn, shapeIn, skillsIn,
} from "@/lib/cyberpunk/sheetInput";

export async function POST(req: NextRequest) {
  const ctx = await authedSystemContext("cyberpunk");
  if (!ctx.ok) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  try {
    return await comGuardas(async () => {
      const body = await req.json();
      const nome = nameIn(body.name);
      if (!nome) return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });

      const role = roleIn(body.role) ?? "solo";
      const creationMethod = methodIn(body.creationMethod) ?? "streetrat";

      // Atributos podem vir soltos ou dentro de `stats`. Na criação valem as
      // faixas do livro (2–8), mais estreitas que as do PATCH (1–10).
      const src = (body.stats && typeof body.stats === "object" ? body.stats : body) as Record<string, unknown>;
      const stats = {} as Stats;
      for (const k of STAT_KEYS) stats[k] = numIn(src[k], STAT_MIN, STAT_MAX, k) ?? 5;

      const skills = skillsIn(body.skills) ?? {};
      if (creationMethod === "complete") {
        // Pacote Completo é o único método sem sorteio: a regra dos 62/86
        // pontos só se garante conferindo aqui, não confiando no cliente.
        const check = validateCompletePackage({
          stats, skills,
          freeLanguageKey: typeof body.freeLanguageKey === "string" ? body.freeLanguageKey : undefined,
        });
        if (!check.valid) {
          return NextResponse.json({ error: check.errors.join(" ") }, { status: 400 });
        }
      }

      const cyberware = shapeIn(body.cyberware, "array", "cyberware");

      // Derivados vêm das fórmulas, nunca do corpo: o cliente não escolhe seu HP.
      const hpMax = calcHpMax(stats.body, stats.will);
      const humanityMax = calcHumanityMax(stats.emp);
      const hpCurrent = Math.min(numIn(body.hpCurrent, ...RANGES.hpCurrent, "hpCurrent") ?? hpMax, hpMax);

      const character = await prisma.character.create({
        data: {
          userId:   ctx.userId,
          systemId: ctx.systemId,
          name:     nome,
          notes:    textIn(body.notes, LIMITS.text, "notes") ?? null,
          cyberpunkSheet: {
            create: {
              role, creationMethod,
              roleRank: numIn(body.roleRank, ...RANGES.roleRank, "roleRank") ?? STARTING_ROLE_RANK,
              ...stats,
              luckCurrent: stats.luck,
              hpMax, hpCurrent,
              humanityMax,
              // Implante de criação já cobra Humanidade (HL fixa do livro).
              humanity: humanityMax - humanityLossOf(cyberware),
              eurobucks: numIn(body.eurobucks, ...RANGES.eurobucks, "eurobucks"),
              skills:           toJsonFieldOrNull(skills),
              armor:            toJsonFieldOrNull(shapeIn(body.armor, "object", "armor")),
              weapons:          toJsonFieldOrNull(shapeIn(body.weapons, "array", "weapons")),
              cyberware:        toJsonFieldOrNull(cyberware),
              gear:             toJsonFieldOrNull(shapeIn(body.gear, "array", "gear")),
              criticalInjuries: toJsonFieldOrNull(shapeIn(body.criticalInjuries, "array", "criticalInjuries")),
              lifepath:         toJsonFieldOrNull(shapeIn(body.lifepath, "object", "lifepath")),
              background:       toJsonFieldOrNull(shapeIn(body.background, "object", "background")),
            },
          },
        },
        select: { id: true },
      });

      return NextResponse.json({ id: character.id }, { status: 201 });
    });
  } catch (err) {
    console.error("[POST /api/cyberpunk/characters]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
