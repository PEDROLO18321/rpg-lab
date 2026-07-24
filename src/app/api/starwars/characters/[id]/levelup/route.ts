import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_LEVEL, availableChoiceKinds, isSkillGradeMandatory, levelUpGain, ppLevelUpGain, canCombineClasses, countExpertSkills, expertSkillsRequiredForNewClass } from "@/lib/starwars/leveling";
import { CLASS_BY_ID } from "@/lib/starwars/classes";
import { getAvailableAbilities } from "@/lib/starwars/powers/registry";
import { GENERAL_POWER_BY_ID } from "@/lib/starwars/powers/generalPowers";
import { SKILL_GRADE_ORDER, type SkillGrade } from "@/lib/starwars/data";
import type { ChosenPower } from "@/lib/starwars/powers/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const character = await prisma.character.findUnique({ where: { id }, include: { starWarsSheet: true } });
  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (character.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const sheet = character.starWarsSheet;
  if (!sheet) return NextResponse.json({ error: "No sheet" }, { status: 404 });

  if (sheet.level >= MAX_LEVEL) {
    return NextResponse.json({ error: `Nível máximo (${MAX_LEVEL}) já alcançado.` }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const classId: string = body.classId ?? Object.keys(JSON.parse(sheet.classes || "{}"))[0];
  const cls = CLASS_BY_ID[classId];
  if (!cls) return NextResponse.json({ error: "Classe inválida." }, { status: 400 });

  const classLevels: Record<string, number> = JSON.parse(sheet.classes || "{}");
  const existingClassIds = Object.keys(classLevels);
  const isNewClass = !existingClassIds.includes(classId);
  const fromLevelInClass = classLevels[classId] ?? 0;
  const toLevelInClass = fromLevelInClass + 1;
  const fromLevel = sheet.level;
  const toLevel = fromLevel + 1;

  if (isNewClass) {
    for (const existing of existingClassIds) {
      if (!canCombineClasses(existing, classId)) {
        return NextResponse.json({ error: "Essa classe não pode ser combinada com uma classe ligada à Força que você já tem." }, { status: 400 });
      }
    }
    const skillsNow: Record<string, SkillGrade> = JSON.parse(sheet.skills || "{}");
    const expertCount = countExpertSkills(skillsNow);
    const required = expertSkillsRequiredForNewClass(fromLevel, existingClassIds.length);
    if (expertCount < required) {
      return NextResponse.json({ error: `Esta multiclasse exige ${required} perícias em grau Expert ou acima (você tem ${expertCount}).` }, { status: 400 });
    }
  }

  const kinds = availableChoiceKinds(fromLevel, toLevel);
  const mandatorySkill = isSkillGradeMandatory(toLevel);

  const attrKey: string | undefined = body.attrKey;
  const classPowerId: string | undefined = body.classPowerId;
  const generalPowerId: string | undefined = body.generalPowerId;
  const skillGradeUpId: string | undefined = body.skillGradeUpId;

  // Regra: apenas UMA escolha de evolução por nível. A perícia pode substituir qualquer uma
  // das outras, mas nunca soma com elas. Em níveis múltiplos de 5, a perícia é obrigatória.
  const pickedCount = [attrKey, classPowerId, generalPowerId, skillGradeUpId].filter(Boolean).length;
  if (pickedCount > 1) {
    return NextResponse.json({ error: "Escolha apenas uma evolução para este nível (atributo, habilidade, poder geral OU perícia)." }, { status: 400 });
  }
  if (mandatorySkill && !skillGradeUpId) {
    return NextResponse.json({ error: `Nível ${toLevel} é múltiplo de 5: a evolução obrigatória deste nível é subir o grau de uma perícia.` }, { status: 400 });
  }

  const attrUpdates: Record<string, number> = {};
  const existingClassPowers: ChosenPower[] = JSON.parse(sheet.classPowers || "[]");
  const existingGeneralPowers: string[] = JSON.parse(sheet.generalPowers || "[]");
  const newClassPowers = [...existingClassPowers];
  const newGeneralPowers = [...existingGeneralPowers];

  if (attrKey) {
    if (!kinds.includes("atributo")) return NextResponse.json({ error: "Atributo só pode subir em transições ímpar→par." }, { status: 400 });
    if (!["agi", "int", "forca", "vig", "pre", "sen"].includes(attrKey)) return NextResponse.json({ error: "Atributo inválido." }, { status: 400 });
    attrUpdates[attrKey] = ((sheet as unknown as Record<string, number>)[attrKey] ?? 0) + 1;
  }

  if (classPowerId) {
    if (!kinds.includes("habilidade_classe")) return NextResponse.json({ error: "Habilidade de classe indisponível nesta transição." }, { status: 400 });
    const ability = getAvailableAbilities(classId, toLevelInClass).find((a) => a.name === classPowerId && a.level === toLevelInClass);
    if (!ability) return NextResponse.json({ error: "Habilidade não disponível para esta classe/nível." }, { status: 400 });
    newClassPowers.push({ level: toLevelInClass, id: classPowerId, name: ability.name, source: "classe", classId });
  }

  if (generalPowerId) {
    if (!kinds.includes("poder_geral")) return NextResponse.json({ error: "Poder Geral só pode ser aprendido em transições par→ímpar." }, { status: 400 });
    const power = GENERAL_POWER_BY_ID[generalPowerId];
    if (!power) return NextResponse.json({ error: "Poder Geral inválido." }, { status: 400 });
    if (!newGeneralPowers.includes(generalPowerId)) newGeneralPowers.push(generalPowerId);
  }

  const skills: Record<string, SkillGrade> = JSON.parse(sheet.skills || "{}");
  if (skillGradeUpId) {
    const current: SkillGrade = skills[skillGradeUpId] ?? "inexperiente";
    const idx = SKILL_GRADE_ORDER.indexOf(current);
    if (idx === -1 || idx === SKILL_GRADE_ORDER.length - 1) {
      return NextResponse.json({ error: "Perícia já está no grau máximo." }, { status: 400 });
    }
    skills[skillGradeUpId] = SKILL_GRADE_ORDER[idx + 1];
  }

  const newVig = attrUpdates.vig ?? sheet.vig;
  const newSen = attrUpdates.sen ?? sheet.sen;
  const newPre = attrUpdates.pre ?? sheet.pre;
  const realGain = levelUpGain(classId, newVig, newSen, toLevelInClass);
  // PP: ganho automático do nível + modificador de PP da nova classe, somado uma única vez
  // (o modificador é cumulativo entre todas as classes possuídas — regra de "Modificador de PP").
  const realPpGain = ppLevelUpGain(newPre) + (isNewClass ? cls.ppModifier : 0);

  classLevels[classId] = toLevelInClass;

  const updated = await prisma.starWarsSheet.update({
    where: { id },
    data: {
      level: toLevel,
      classes: JSON.stringify(classLevels),
      agi: attrUpdates.agi ?? sheet.agi,
      int: attrUpdates.int ?? sheet.int,
      forca: attrUpdates.forca ?? sheet.forca,
      vig: newVig,
      pre: newPre,
      sen: newSen,
      pvMax: sheet.pvMax + realGain.pv,
      pvCurrent: sheet.pvCurrent + realGain.pv,
      peMax: sheet.peMax + realGain.pe,
      peCurrent: sheet.peCurrent + realGain.pe,
      ppMax: sheet.ppMax + realPpGain,
      ppCurrent: sheet.ppCurrent + realPpGain,
      classPowers: JSON.stringify(newClassPowers),
      generalPowers: JSON.stringify(newGeneralPowers),
      skills: JSON.stringify(skills),
    },
  });

  return NextResponse.json({
    ok: true,
    summary: {
      newLevel: updated.level,
      pvGain: realGain.pv,
      peGain: realGain.pe,
      ppGain: realPpGain,
      choiceKinds: kinds,
    },
  });
}
