import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attrMod, ATTR_KEYS, type AttrKey, type TormentaAttrs } from "@/lib/tormenta/data";
import { CLASS_BY_ID } from "@/lib/tormenta/classes";
import { resolveKeyAttribute } from "@/lib/tormenta/creation";
import {
  buildLevelUpPlan, casterProgressionFor, maxCircleAtLevel, XP_THRESHOLDS,
  nextAttributeIncreaseAmount, computePvMax, computePmMax, type ChosenPower,
} from "@/lib/tormenta/leveling";
import { getAvailablePowers, getFeaturesAtLevel, POWER_BY_ID } from "@/lib/tormenta/powers/registry";
import { ARMOR_BY_ID, computeTormentaDefense } from "@/lib/tormenta/items";
import { SPELLS } from "@/lib/tormenta/spells";

const ATTR_COLUMN: Record<AttrKey, string> = { for: "forca", des: "des", con: "con", int: "int", sab: "sab", car: "car" };

function slug(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findUnique({ where: { id }, include: { tormentaSheet: true } });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const sheet = character.tormentaSheet;
  if (!sheet) return NextResponse.json({ error: "No sheet" }, { status: 404 });

  const cls = sheet.className ? CLASS_BY_ID[sheet.className] : undefined;
  if (!cls) return NextResponse.json({ error: "Classe não reconhecida." }, { status: 400 });

  const plan = buildLevelUpPlan(cls.id, sheet.path, sheet.level);
  if (!plan) return NextResponse.json({ error: "Nível máximo (20) já alcançado." }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const powerId: string | undefined = body.powerId;
  const attrKey: AttrKey | undefined = body.attrKey;
  const requestedSpells: string[] = Array.isArray(body.newSpells) ? body.newSpells : [];

  const chosenPower = powerId ? POWER_BY_ID[powerId] : undefined;
  if (!chosenPower) return NextResponse.json({ error: "Poder inválido." }, { status: 400 });
  const available = new Set(getAvailablePowers(cls.id).map((p) => p.id));
  if (!available.has(chosenPower.id)) return NextResponse.json({ error: "Poder não disponível para esta classe." }, { status: 400 });

  const existingPowers: ChosenPower[] = JSON.parse(sheet.powers ?? "[]");

  let attrAmount: number | undefined;
  if (chosenPower.special === "attribute-increase") {
    if (!attrKey || !ATTR_KEYS.includes(attrKey))
      return NextResponse.json({ error: "Escolha um atributo válido para Aumento de Atributo." }, { status: 400 });
    attrAmount = nextAttributeIncreaseAmount(existingPowers, attrKey);
  } else {
    const repeatable = /várias vezes|quantas vezes|outras vezes/i.test(chosenPower.description);
    if (!repeatable && existingPowers.some((p) => p.id === chosenPower.id))
      return NextResponse.json({ error: "Você já possui este poder." }, { status: 400 });
  }

  const currentAttrs: TormentaAttrs = { for: sheet.forca, des: sheet.des, con: sheet.con, int: sheet.int, sab: sheet.sab, car: sheet.car };
  const newAttrs: TormentaAttrs = { ...currentAttrs };
  if (attrKey && attrAmount) newAttrs[attrKey] = newAttrs[attrKey] + attrAmount;

  const conMod = attrMod(newAttrs.con);
  const spellKeyAttr = resolveKeyAttribute(cls.id, sheet.path);
  const keyAttrMod = spellKeyAttr ? attrMod(newAttrs[spellKeyAttr]) : 0;
  const newPvMax = computePvMax(cls.id, plan.toLevel, conMod);
  const newPmMax = computePmMax(cls.id, plan.toLevel, keyAttrMod);

  const equipment: string[] = JSON.parse(sheet.equipment ?? "[]");
  const armorId = equipment.find((e) => ARMOR_BY_ID[e]?.category === "leve" || ARMOR_BY_ID[e]?.category === "pesada") ?? null;
  const shieldId = equipment.find((e) => ARMOR_BY_ID[e]?.category === "escudo") ?? null;
  const newDefense = computeTormentaDefense(attrMod(newAttrs.des), armorId, shieldId);

  // ── Magias ───────────────────────────────────────────────────────────────────
  const prog = casterProgressionFor(cls);
  const spellsKnown: string[] = JSON.parse(sheet.spellsKnown ?? "[]");
  const schoolsChosen: string[] = JSON.parse(sheet.schoolsChosen ?? "[]");
  const newSpellRows: typeof SPELLS = [];

  if (plan.spellsGained > 0) {
    if (requestedSpells.length !== plan.spellsGained)
      return NextResponse.json({ error: `Escolha exatamente ${plan.spellsGained} magia(s) neste nível.` }, { status: 400 });
    const maxCircle = prog ? maxCircleAtLevel(prog, plan.toLevel) : 1;
    for (const sid of requestedSpells) {
      const sp = SPELLS.find((s) => s.id === sid);
      if (!sp) return NextResponse.json({ error: `Magia desconhecida: ${sid}` }, { status: 400 });
      if (sp.tradition !== cls.spellcasting?.tradition)
        return NextResponse.json({ error: `${sp.name} não é da tradição de ${cls.name}.` }, { status: 400 });
      if (sp.circle > maxCircle)
        return NextResponse.json({ error: `${sp.name} é de círculo maior que o disponível (${maxCircle}º).` }, { status: 400 });
      if (cls.spellcasting?.schoolChoiceCount && !schoolsChosen.includes(sp.school))
        return NextResponse.json({ error: `${sp.name} não pertence às suas escolas conhecidas.` }, { status: 400 });
      if (spellsKnown.includes(sid) || newSpellRows.some((s) => s.id === sid))
        return NextResponse.json({ error: `${sp.name} já é conhecida.` }, { status: 400 });
      newSpellRows.push(sp);
    }
  } else if (requestedSpells.length > 0) {
    return NextResponse.json({ error: "Nenhuma magia nova disponível neste nível." }, { status: 400 });
  }

  // ── Poderes ganhos neste nível (escolha + características fixas) ─────────────
  const fixedFeatures = getFeaturesAtLevel(cls.id, plan.toLevel);
  const newPowers: ChosenPower[] = [
    ...existingPowers,
    {
      level: plan.toLevel, id: chosenPower.id, name: chosenPower.name, category: chosenPower.category,
      description: chosenPower.description, prerequisite: chosenPower.prerequisite,
      classId: chosenPower.classId, attrKey, attrAmount, fixed: false,
    },
    ...fixedFeatures.map((f) => ({
      level: plan.toLevel, id: slug(f.name), name: f.name, category: "classe" as const,
      description: f.description, classId: cls.id, fixed: true,
    })),
  ];

  const pvGain = newPvMax - sheet.pvMax;
  const pmGain = newPmMax - sheet.pmMax;

  await prisma.tormentaSheet.update({
    where: { id },
    data: {
      level: plan.toLevel,
      xp: Math.max(sheet.xp, XP_THRESHOLDS[plan.toLevel]),
      forca: newAttrs.for, des: newAttrs.des, con: newAttrs.con, int: newAttrs.int, sab: newAttrs.sab, car: newAttrs.car,
      pvMax: newPvMax, pvCurrent: Math.min(newPvMax, sheet.pvCurrent + Math.max(0, pvGain)),
      pmMax: newPmMax, pmCurrent: Math.min(newPmMax, sheet.pmCurrent + Math.max(0, pmGain)),
      defense: newDefense,
      powers: JSON.stringify(newPowers),
      spellsKnown: newSpellRows.length > 0 ? JSON.stringify([...spellsKnown, ...newSpellRows.map((s) => s.id)]) : sheet.spellsKnown,
    },
  });

  return NextResponse.json({
    ok: true,
    summary: {
      newLevel: plan.toLevel,
      pvGain, newPvMax, pmGain, newPmMax,
      newDefense,
      powerGained: chosenPower.name,
      attrIncreased: attrKey ?? null,
      attrAmount: attrAmount ?? null,
      circleUnlocked: plan.circleUnlocked,
      spellsLearned: newSpellRows.map((s) => s.name),
      fixedFeatures: fixedFeatures.map((f) => f.name),
    },
  });
}
