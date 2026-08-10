import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_LEVEL, CLASS_LEVEL_CAP, BONUS_LEVEL_ID, isMilestone5, isMilestone10,
  levelUpGain, ppLevelUpGain, canCombineClasses,
  countExpertSkills, expertSkillsRequiredForNewClass,
  POOL_CLASS_IDS, getRemainingPoolAbilities,
} from "@/lib/starwars/leveling";
import { CLASS_BY_ID } from "@/lib/starwars/classes";
import { getAvailableAbilities } from "@/lib/starwars/powers/registry";
import { GENERAL_POWER_BY_ID, GENERAL_POWERS } from "@/lib/starwars/powers/generalPowers";
import { SKILL_GRADE_ORDER, type SkillGrade } from "@/lib/starwars/data";
import { SKILLS } from "@/lib/starwars/skills";
import type { ChosenPower } from "@/lib/starwars/powers/types";

const ATTR_KEYS = ["agi", "int", "forca", "vig", "pre", "sen"] as const;

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

  const classLevels: Record<string, number> = JSON.parse(sheet.classes || "{}");
  const existingClassIds = Object.keys(classLevels);
  const skills: Record<string, SkillGrade> = JSON.parse(sheet.skills || "{}");

  const body = await req.json().catch(() => ({}));
  const classId: string = body.classId ?? existingClassIds[0];
  const isBonus = classId === BONUS_LEVEL_ID;
  const cls = isBonus ? undefined : CLASS_BY_ID[classId];
  if (!isBonus && !cls) return NextResponse.json({ error: "Classe inválida." }, { status: 400 });

  const isNewClass = !isBonus && !existingClassIds.includes(classId);
  const fromLevelInClass = isBonus ? 0 : classLevels[classId] ?? 0;
  const toLevelInClass = fromLevelInClass + 1;
  const fromLevel = sheet.level;
  const toLevel = fromLevel + 1;

  if (!isBonus && toLevelInClass > CLASS_LEVEL_CAP) {
    return NextResponse.json({ error: `Nível máximo por classe (${CLASS_LEVEL_CAP}) já atingido nessa classe. Escolha outra classe ou um nível Bônus.` }, { status: 400 });
  }

  const classPowerId: string | undefined = body.classPowerId;
  const mandatorySkillId: string | undefined = body.mandatorySkillId;
  const mandatoryAttrKey: string | undefined = body.mandatoryAttrKey;
  const milestoneSkillId: string | undefined = body.milestoneSkillId;
  const milestonePowerId: string | undefined = body.milestonePowerId;
  const milestoneAttrKey: string | undefined = body.milestoneAttrKey;
  const multiclassAttrKey: string | undefined = body.multiclassAttrKey;

  const existingClassPowers: ChosenPower[] = JSON.parse(sheet.classPowers || "[]");
  const existingGeneralPowers: string[] = JSON.parse(sheet.generalPowers || "[]");
  const newClassPowers = [...existingClassPowers];
  const newGeneralPowers = [...existingGeneralPowers];
  const attrUpdates: Record<string, number> = {};

  function isValidAttr(k: string | undefined): k is (typeof ATTR_KEYS)[number] {
    return !!k && (ATTR_KEYS as readonly string[]).includes(k);
  }
  function bumpAttr(k: (typeof ATTR_KEYS)[number]) {
    const current = (attrUpdates[k] as number | undefined) ?? ((sheet as unknown as Record<string, number>)[k] ?? 0);
    attrUpdates[k] = current + 1;
  }
  function bumpSkill(sid: string) {
    const current: SkillGrade = skills[sid] ?? "inexperiente";
    const idx = SKILL_GRADE_ORDER.indexOf(current);
    skills[sid] = SKILL_GRADE_ORDER[idx + 1];
  }
  // Considera as 25 perícias do catálogo (não só as já treinadas) — uma perícia nunca
  // treinada é "Inexperiente", que também conta como disponível pra subir de grau.
  function nonMaxSkillIds(): string[] {
    const maxGrade = SKILL_GRADE_ORDER[SKILL_GRADE_ORDER.length - 1];
    return SKILLS.filter((s) => (skills[s.id] ?? "inexperiente") !== maxGrade).map((s) => s.id);
  }

  if (isNewClass) {
    // ─── Multiclasse: evento isolado — ganha a habilidade de nível 1 da nova classe + 1 atributo. ───
    for (const existing of existingClassIds) {
      if (!canCombineClasses(existing, classId)) {
        return NextResponse.json({ error: "Essa classe não pode ser combinada com uma classe ligada à Força que você já tem." }, { status: 400 });
      }
    }
    const isSpecialClass = !!cls?.isPathClass || !!cls?.isPropheticClass;
    if (!isSpecialClass) {
      const expertCount = countExpertSkills(skills);
      const required = expertSkillsRequiredForNewClass(fromLevel, existingClassIds.length);
      if (expertCount < required) {
        return NextResponse.json({ error: `Esta multiclasse exige ${required} perícias em grau Expert ou acima (você tem ${expertCount}).` }, { status: 400 });
      }
    }
    if (!classPowerId) {
      return NextResponse.json({ error: "Escolha a habilidade de nível 1 da nova classe." }, { status: 400 });
    }
    const ability = getAvailableAbilities(classId, 1).find((a) => a.name === classPowerId && a.level === 1);
    if (!ability) return NextResponse.json({ error: "Habilidade inválida para o nível 1 dessa classe." }, { status: 400 });
    newClassPowers.push({ level: 1, id: classPowerId, name: ability.name, source: "classe", classId });

    if (!isValidAttr(multiclassAttrKey)) return NextResponse.json({ error: "Escolha o atributo que sobe ao multiclassar." }, { status: 400 });
    bumpAttr(multiclassAttrKey);
  } else {
    // ─── Escolha obrigatória: Habilidade de Classe → senão Perícia → senão Atributo. ───
    // Classes de Pool (as 13 normais): "disponível" é tudo que já abriu (pool 1/6/11/16, nunca
    // fecha) e ainda não foi escolhido nessa classe — ver getRemainingPoolAbilities. Classes
    // especiais (fora do redesenho) continuam no sistema linear antigo: match exato de nível.
    const isPoolClass = POOL_CLASS_IDS.has(classId);
    const remainingPoolAbilities = isPoolClass ? getRemainingPoolAbilities(classId, toLevelInClass, existingClassPowers) : [];
    const hasHabilidade = !isBonus && !!cls && (isPoolClass
      ? remainingPoolAbilities.length > 0
      : getAvailableAbilities(classId, toLevelInClass).some((a) => a.level === toLevelInClass));
    if (hasHabilidade) {
      if (!classPowerId) return NextResponse.json({ error: "Escolha a Habilidade de Classe aprendida neste nível." }, { status: 400 });
      const ability = isPoolClass
        ? remainingPoolAbilities.find((a) => a.name === classPowerId)
        : getAvailableAbilities(classId, toLevelInClass).find((a) => a.name === classPowerId && a.level === toLevelInClass);
      if (!ability) return NextResponse.json({ error: "Habilidade não disponível para esta classe/nível." }, { status: 400 });
      newClassPowers.push({ level: toLevelInClass, id: classPowerId, name: ability.name, source: "classe", classId });
    } else {
      const available = nonMaxSkillIds();
      if (available.length > 0) {
        if (!mandatorySkillId || !available.includes(mandatorySkillId)) {
          return NextResponse.json({ error: "Escolha uma perícia pra treinar ou subir de grau." }, { status: 400 });
        }
        bumpSkill(mandatorySkillId);
      } else {
        if (!isValidAttr(mandatoryAttrKey)) return NextResponse.json({ error: "Escolha um atributo." }, { status: 400 });
        bumpAttr(mandatoryAttrKey);
      }
    }

    // ─── Múltiplo de 5: mais 1 perícia + 1 Poder Geral (obrigatório, além da escolha acima). ───
    if (isMilestone5(toLevel)) {
      const availableAfterMandatory = nonMaxSkillIds();
      if (availableAfterMandatory.length > 0) {
        if (!milestoneSkillId || !availableAfterMandatory.includes(milestoneSkillId)) {
          return NextResponse.json({ error: "Nível múltiplo de 5 exige treinar ou subir o grau de mais uma perícia." }, { status: 400 });
        }
        bumpSkill(milestoneSkillId);
      }
      const availablePowers = GENERAL_POWERS.filter((p) => !newGeneralPowers.includes(p.id));
      if (availablePowers.length > 0) {
        if (!milestonePowerId || !GENERAL_POWER_BY_ID[milestonePowerId] || newGeneralPowers.includes(milestonePowerId)) {
          return NextResponse.json({ error: "Nível múltiplo de 5 exige aprender um Poder Geral." }, { status: 400 });
        }
        newGeneralPowers.push(milestonePowerId);
      }
    }

    // ─── Múltiplo de 10: mais +1 atributo (obrigatório, além do de cima). ───
    if (isMilestone10(toLevel)) {
      if (!isValidAttr(milestoneAttrKey)) return NextResponse.json({ error: "Nível múltiplo de 10 exige escolher +1 atributo." }, { status: 400 });
      bumpAttr(milestoneAttrKey);
    }
  }

  if (!isBonus) classLevels[classId] = toLevelInClass;

  const newVig = attrUpdates.vig ?? sheet.vig;
  const newSen = attrUpdates.sen ?? sheet.sen;
  const newPre = attrUpdates.pre ?? sheet.pre;

  // Todo nível sobe PV/PE/PP. Multiclasse ganha o PV/PE base (nível 1) da nova classe direto,
  // e só o modificador fixo de PP dela (não o ganho recorrente). Bônus não pertence a nenhuma
  // classe: sem PV/PE de arquétipo, só o PP geral do nível.
  const pvGainRaw = isNewClass ? levelUpGain(classId, newVig, newSen, 1).pv : isBonus ? 0 : levelUpGain(classId, newVig, newSen, toLevelInClass).pv;
  const peGainRaw = isNewClass ? levelUpGain(classId, newVig, newSen, 1).pe : isBonus ? 0 : levelUpGain(classId, newVig, newSen, toLevelInClass).pe;
  const realPpGain = isNewClass ? (cls ? cls.ppModifier : 0) : ppLevelUpGain(newPre);

  const newPvClassSum = sheet.pvClassSum + (toLevelInClass === 1 ? pvGainRaw : 0);
  const newPvLevelGain = sheet.pvLevelGain + (toLevelInClass > 1 ? pvGainRaw : 0);
  const newPvMax = newPvClassSum + newPvLevelGain;
  const pvGainThisLevel = newPvMax - sheet.pvMax;

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
      pvMax: newPvMax,
      pvClassSum: newPvClassSum,
      pvLevelGain: newPvLevelGain,
      pvCurrent: sheet.pvCurrent + pvGainThisLevel,
      peMax: sheet.peMax + peGainRaw,
      peCurrent: sheet.peCurrent + peGainRaw,
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
      pvGain: pvGainThisLevel,
      peGain: peGainRaw,
      ppGain: realPpGain,
    },
  });
}
