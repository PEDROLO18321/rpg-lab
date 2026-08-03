import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_LEVEL, CLASS_LEVEL_CAP, BONUS_LEVEL_ID, levelUpBucket, vitalsGrantedAtLevel,
  PAR_FALLBACK_CHAIN, IMPAR_FALLBACK_CHAIN, levelUpGain, ppLevelUpGain, canCombineClasses,
  countExpertSkills, expertSkillsRequiredForNewClass, type LevelUpChoiceKind,
} from "@/lib/starwars/leveling";
import { CLASS_BY_ID } from "@/lib/starwars/classes";
import { getAvailableAbilities } from "@/lib/starwars/powers/registry";
import { GENERAL_POWER_BY_ID, GENERAL_POWERS } from "@/lib/starwars/powers/generalPowers";
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

  const attrKey: string | undefined = body.attrKey;
  const classPowerId: string | undefined = body.classPowerId;
  const generalPowerId: string | undefined = body.generalPowerId;
  const skillGradeUpId: string | undefined = body.skillGradeUpId;
  const skillGradeUpIds: string[] = Array.isArray(body.skillGradeUpIds) ? body.skillGradeUpIds : [];

  const existingClassPowers: ChosenPower[] = JSON.parse(sheet.classPowers || "[]");
  const existingGeneralPowers: string[] = JSON.parse(sheet.generalPowers || "[]");
  const newClassPowers = [...existingClassPowers];
  const newGeneralPowers = [...existingGeneralPowers];
  const attrUpdates: Record<string, number> = {};

  const nonMaxSkillIds = () => {
    const maxGrade = SKILL_GRADE_ORDER[SKILL_GRADE_ORDER.length - 1];
    return Object.keys(skills).length === 0
      ? [] // sem perícias cadastradas ainda — trata como "nenhuma disponível", cai pro próximo fallback
      : Object.entries(skills).filter(([, g]) => g !== maxGrade).map(([sid]) => sid);
  };

  if (isNewClass) {
    // ─── Multiclasse: ignora as regras normais de subida — só a habilidade de nível 1 da nova classe. ───
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
    if (attrKey || generalPowerId || skillGradeUpId || skillGradeUpIds.length > 0) {
      return NextResponse.json({ error: "Multiclasse só aceita a habilidade de nível 1 da nova classe." }, { status: 400 });
    }
    if (!classPowerId) {
      return NextResponse.json({ error: "Escolha a habilidade de nível 1 da nova classe." }, { status: 400 });
    }
    const ability = getAvailableAbilities(classId, 1).find((a) => a.name === classPowerId && a.level === 1);
    if (!ability) return NextResponse.json({ error: "Habilidade inválida para o nível 1 dessa classe." }, { status: 400 });
    newClassPowers.push({ level: 1, id: classPowerId, name: ability.name, source: "classe", classId });
  } else {
    const bucket = levelUpBucket(toLevel);
    const grants = vitalsGrantedAtLevel(bucket);

    if (bucket === "quinto") {
      if (attrKey || classPowerId || generalPowerId) {
        return NextResponse.json({ error: "Nível múltiplo de 5: só aceita subir grau de perícia e +1 atributo." }, { status: 400 });
      }
      const available = nonMaxSkillIds();
      const expectedCount = Math.min(2, available.length);
      const uniqueIds = [...new Set(skillGradeUpIds)];
      if (uniqueIds.length !== expectedCount || uniqueIds.some((sid) => !available.includes(sid))) {
        return NextResponse.json({ error: `Nível múltiplo de 5 exige subir o grau de ${expectedCount} perícia(s) não-Mestre.` }, { status: 400 });
      }
      if (!attrKey || !["agi", "int", "forca", "vig", "pre", "sen"].includes(attrKey)) {
        return NextResponse.json({ error: "Nível múltiplo de 5 exige escolher +1 ponto de atributo." }, { status: 400 });
      }
      attrUpdates[attrKey] = ((sheet as unknown as Record<string, number>)[attrKey] ?? 0) + 1;
      for (const sid of uniqueIds) {
        const current: SkillGrade = skills[sid] ?? "inexperiente";
        const idx = SKILL_GRADE_ORDER.indexOf(current);
        skills[sid] = SKILL_GRADE_ORDER[idx + 1];
      }
    } else {
      const chain = bucket === "par" ? PAR_FALLBACK_CHAIN : IMPAR_FALLBACK_CHAIN;
      const hasHabilidade = !isBonus && !!cls && getAvailableAbilities(classId, toLevelInClass).some((a) => a.level === toLevelInClass);
      const hasPoderGeral = GENERAL_POWERS.some((p) => !existingGeneralPowers.includes(p.id));
      const hasGrauPericia = nonMaxSkillIds().length > 0;
      const availability: Record<LevelUpChoiceKind, boolean> = {
        habilidade_classe: hasHabilidade, poder_geral: hasPoderGeral, grau_pericia: hasGrauPericia, atributo: true,
      };
      const resolvedKind = chain.find((k) => availability[k])!;

      if (resolvedKind === "habilidade_classe") {
        if (!classPowerId) return NextResponse.json({ error: "Escolha uma Habilidade de Classe." }, { status: 400 });
        const ability = getAvailableAbilities(classId, toLevelInClass).find((a) => a.name === classPowerId && a.level === toLevelInClass);
        if (!ability) return NextResponse.json({ error: "Habilidade não disponível para esta classe/nível." }, { status: 400 });
        newClassPowers.push({ level: toLevelInClass, id: classPowerId, name: ability.name, source: "classe", classId });
      } else if (resolvedKind === "poder_geral") {
        if (!generalPowerId) return NextResponse.json({ error: "Escolha um Poder Geral." }, { status: 400 });
        const power = GENERAL_POWER_BY_ID[generalPowerId];
        if (!power || existingGeneralPowers.includes(generalPowerId)) return NextResponse.json({ error: "Poder Geral inválido ou já aprendido." }, { status: 400 });
        newGeneralPowers.push(generalPowerId);
      } else if (resolvedKind === "grau_pericia") {
        if (!skillGradeUpId) return NextResponse.json({ error: "Escolha uma perícia pra subir de grau." }, { status: 400 });
        const current: SkillGrade = skills[skillGradeUpId] ?? "inexperiente";
        const idx = SKILL_GRADE_ORDER.indexOf(current);
        if (idx === -1 || idx === SKILL_GRADE_ORDER.length - 1) return NextResponse.json({ error: "Perícia já está no grau máximo." }, { status: 400 });
        skills[skillGradeUpId] = SKILL_GRADE_ORDER[idx + 1];
      } else {
        if (!attrKey || !["agi", "int", "forca", "vig", "pre", "sen"].includes(attrKey)) {
          return NextResponse.json({ error: "Escolha um atributo." }, { status: 400 });
        }
        attrUpdates[attrKey] = ((sheet as unknown as Record<string, number>)[attrKey] ?? 0) + 1;
      }
    }

    if (!isBonus) classLevels[classId] = toLevelInClass;
  }

  const newVig = attrUpdates.vig ?? sheet.vig;
  const newSen = attrUpdates.sen ?? sheet.sen;
  const newPre = attrUpdates.pre ?? sheet.pre;

  // Multiclasse ignora o bucket do nível e ganha o PV/PE base (nível 1) da nova classe direto.
  // Bônus nunca ganha PV/PE (não pertence a nenhuma classe), só PP conforme o bucket.
  const bucket = isNewClass ? null : levelUpBucket(toLevel);
  const grants = isNewClass ? { pv: true, pe: true, pp: false } : vitalsGrantedAtLevel(bucket!);

  const pvGainRaw = isNewClass ? levelUpGain(classId, newVig, newSen, 1).pv : !isBonus && grants.pv ? levelUpGain(classId, newVig, newSen, toLevelInClass).pv : 0;
  const peGainRaw = isNewClass ? levelUpGain(classId, newVig, newSen, 1).pe : !isBonus && grants.pe ? levelUpGain(classId, newVig, newSen, toLevelInClass).pe : 0;
  // PP: ganho recorrente por nível só nos buckets que concedem PP (par→ímpar / múltiplo de 5);
  // multiclasse não concede o recorrente (o nível foi "gasto" na nova classe), só o modificador fixo dela.
  const realPpGain = (!isNewClass && grants.pp ? ppLevelUpGain(newPre) : 0) + (isNewClass && cls ? cls.ppModifier : 0);

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
      bucket,
    },
  });
}
