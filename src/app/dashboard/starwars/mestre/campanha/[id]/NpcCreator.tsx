"use client";

import { useState, useMemo } from "react";
import type { StarWarsApi } from "@/lib/starwars/useStarWarsCampaign";
import type { StarWarsNpc, NPCAttack, NPCSkill } from "@/lib/starwars/starwarsCampaignClient";
import { SPECIES } from "@/lib/starwars/species";
import { CLASSES } from "@/lib/starwars/classes";
import { SKILLS, SKILL_BY_ID } from "@/lib/starwars/skills";
import { SKILL_GRADE_LABEL, SKILL_GRADE_BONUS, SKILL_GRADE_ORDER, type SkillGrade } from "@/lib/starwars/data";
import { SW } from "../../../ui";

const ACCENT = SW.accent;
const ACCENT_LIGHT = SW.accentLight;
const ACCENT_DIM = SW.accentDim;
const ACCENT_BORD = SW.accentBord;
const ACCENT_GLOW = SW.glow;

const SPECIES_NAMES = SPECIES.map((s) => s.name);
const ROLES = CLASSES.map((c) => c.name);
const TRAITS = ["Fala demais sobre assuntos sem importância", "Sempre mantém a palavra, custe o que custar", "Desconfia de estranhos mas é leal aos aliados", "Busca aventura e emoção a todo custo", "É obcecado com créditos e riquezas", "Vive segundo um código de honra rígido", "Prefere agir sozinho e não confia em grupos", "É curioso sobre tudo que vê", "É gentil com os fracos e duro com os poderosos", "Guarda rancor por muito tempo"];
const APPEARANCES = ["Cicatriz no rosto, olhar frio", "Cabelos brancos apesar de jovem", "Veste roupas simples e surradas", "Usa um amuleto de origem desconhecida", "Alto e robusto, postura marcial", "Baixo e ágil, sempre alerta", "Roupas finas, ar de autoridade", "Olhos de cores diferentes", "Tatuagem tribal no braço", "Sempre encapuzado"];
const NAMES = ["Broktar", "Ingram", "Fren", "Dok", "Artorius", "Kadeen", "Rhogar", "Gorack", "Reynard", "Golinda", "Lisandra", "Gwen", "Asha", "Niala", "Raven", "Salini", "Aivy", "Sima", "Leona", "Vallen"];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rollD20() { return Math.floor(Math.random() * 20) + 1; }

function randomSkills(): NPCSkill[] {
  const count = randBetween(2, 4);
  const pool = [...SKILLS];
  const picked: NPCSkill[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const [skill] = pool.splice(idx, 1);
    const grade = rand(SKILL_GRADE_ORDER.slice(0, 4)); // NPC aleatório não passa de Expert
    picked.push({ skillId: skill.id, value: SKILL_GRADE_BONUS[grade] });
  }
  return picked;
}

/** Perícias de personagens famosos são derivadas do papel/nível, não cadastradas uma a uma — mesmo padrão de regra-no-código usado no resto do sistema. */
function famousSkills(c: FamousCharacter): NPCSkill[] {
  const text = `${c.role} ${c.species}`.toLowerCase();
  const ids: string[] = [];
  if (c.sen >= 6) ids.push("dominio_forca");
  if (/jedi|sith|sabre|padawan|duelista|cavaleiro/.test(text)) ids.push("sabres_de_luz", "conhecimento_forca");
  if (/pilot|contrabandista|copiloto/.test(text)) ids.push("pilotagem_espacial");
  if (/caçador|assassin|mercenári|sicári/.test(text)) ids.push("pontaria", "furtividade");
  if (/diplomat|senad|rainha|líder|general|comandante|almirante|oficial/.test(text)) ids.push("diplomacia", "lideranca");
  if (/droide/.test(text)) ids.push("computacao", "mecanica");
  if (/engenh|mecân|técnic/.test(text)) ids.push("mecanica");
  if (/soldado|guerreir|clone/.test(text)) ids.push("atletismo");
  if (/sucateir|xerife|sobreviv/.test(text)) ids.push("sobrevivencia");
  if (/cientista/.test(text)) ids.push("ciencias");
  if (/espião|agente|espia/.test(text)) ids.push("investigacao");
  if (ids.length === 0) ids.push("percepcao", "intimidacao");
  const grade: SkillGrade = c.level >= 70 ? "mestre" : c.level >= 50 ? "veterano" : c.level >= 35 ? "expert" : c.level >= 20 ? "treinado" : "iniciante";
  const unique = Array.from(new Set(ids)).slice(0, 4);
  return unique.map((skillId) => ({ skillId, value: SKILL_GRADE_BONUS[grade] }));
}

const RANDOM_ATTACKS: NPCAttack[] = [
  { name: "Vibrolâmina", bonus: "+4", damage: "1d6+2", description: "Corpo a corpo, alcance pessoal" },
  { name: "Blaster de Mão", bonus: "+4", damage: "2d6", description: "À distância, curto alcance" },
  { name: "Rifle Blaster", bonus: "+5", damage: "3d6", description: "À distância, longo alcance" },
  { name: "Sabre de Luz", bonus: "+5", damage: "2d8", description: "Corpo a corpo, ignora armadura comum" },
  { name: "Golpe da Força", bonus: "+5", damage: "1d10", description: "À distância curta, empurra o alvo" },
];

interface FamousCharacter {
  name: string; source: "Canon" | "Legends"; species: string; role: string; level: number;
  pv: number; agi: number; int: number; forca: number; vig: number; pre: number; sen: number;
  personality: string; description: string;
}

const FAMOUS_CHARACTERS: FamousCharacter[] = [
  { name: "Luke Skywalker", source: "Canon", species: "Humano", role: "Cavaleiro Jedi", level: 45,
    pv: 70, agi: 5, int: 3, forca: 3, vig: 4, pre: 4, sen: 7,
    personality: "Idealista, compassivo, recusa-se a desistir de quem ama.",
    description: "Herói da Aliança Rebelde, treinado por Obi-Wan e Yoda, restaurou a Ordem Jedi." },
  { name: "Luke Skywalker 100% (potencial máximo)", source: "Canon", species: "Humano", role: "Grão-Mestre Jedi / O Lado da Luz — nível 40 em Padawan Jedi + 40 em O Lado da Luz (liberada aos 40) + 1031 em Bônus", level: 1111,
    pv: 746, agi: 9, int: 6, forca: 6, vig: 7, pre: 6, sen: 10,
    personality: "A mesma compaixão e recusa em desistir de sempre, agora sustentadas por um domínio total da Força — nem sombra de dúvida o abala mais.",
    description: "Cenário hipotético — Luke leva Padawan Jedi ao nível 40 (teto por classe), libera e maxa O Lado da Luz (também 40) e investe cada nível restante até o teto do sistema (1111) como Bônus. PV calculado pela fórmula real do arquétipo Sensível à Força nas duas classes — o auge absoluto que as regras permitem." },
  { name: "Anakin Skywalker", source: "Canon", species: "Humano", role: "Cavaleiro Jedi / General", level: 55,
    pv: 100, agi: 8, int: 4, forca: 4, vig: 5, pre: 5, sen: 9,
    personality: "Impulsivo, brilhante piloto e duelista, teme perder quem ama.",
    description: "O Escolhido profetizado, general da Guerra Clônica, o Jedi mais poderoso de sua geração antes de cair ao Lado Sombrio." },
  { name: "Anakin Skywalker 100% (auge, sem queda)", source: "Canon", species: "Humano", role: "Grão-Mestre Jedi (hipotético)", level: 99,
    pv: 160, agi: 9, int: 6, forca: 5, vig: 6, pre: 6, sen: 10,
    personality: "Versão do que poderia ter sido: disciplinado, em paz consigo mesmo, o Escolhido plenamente realizado.",
    description: "Cenário hipotético — Anakin nunca cai ao Lado Sombrio e se torna o Jedi mais poderoso da história, superando até Yoda em domínio da Força." },
  { name: "Darth Vader", source: "Canon", species: "Humano (cyborg)", role: "Lorde Sith", level: 70,
    pv: 140, agi: 4, int: 4, forca: 6, vig: 7, pre: 6, sen: 8,
    personality: "Implacável, consumido pela raiva e pelo arrependimento.",
    description: "Ex-Jedi caído ao Lado Sombrio, mão direita do Imperador Palpatine, metade homem metade máquina após Mustafar." },
  { name: "Darth Vader 100% (auge, sem Mustafar)", source: "Canon", species: "Humano", role: "Lorde Sith Supremo (hipotético)", level: 99,
    pv: 200, agi: 9, int: 6, forca: 8, vig: 8, pre: 7, sen: 10,
    personality: "Sem as limitações da armadura, fúria e poder plenos — sem o fio de humanidade que a mutilação paradoxalmente preservou.",
    description: "Cenário hipotético — Vader vence Obi-Wan em Mustafar, corpo intacto, Lorde Sith no auge físico total: o maior guerreiro sombrio já visto." },
  { name: "Imperador Palpatine (Darth Sidious)", source: "Canon", species: "Humano", role: "Senhor Sith / Imperador", level: 90,
    pv: 120, agi: 1, int: 6, forca: 1, vig: 3, pre: 7, sen: 10,
    personality: "Manipulador cirúrgico, paciente além da compreensão, sorri enquanto destrói impérios.",
    description: "Mestre Sith que derrubou a República por dentro e governou a galáxia como Imperador." },
  { name: "Obi-Wan Kenobi", source: "Canon", species: "Humano", role: "Mestre Jedi", level: 55,
    pv: 90, agi: 5, int: 5, forca: 3, vig: 4, pre: 5, sen: 7,
    personality: "Disciplinado, irônico sob pressão, carrega o peso de promessas antigas.",
    description: "Mestre Jedi que treinou Anakin e depois Luke, sobrevivendo escondido em Tatooine por décadas." },
  { name: "Yoda", source: "Canon", species: "Espécie desconhecida (mesma de Yoda)", role: "Grão-Mestre Jedi", level: 99,
    pv: 110, agi: 4, int: 6, forca: 2, vig: 3, pre: 6, sen: 10,
    personality: "Enigmático, paciente, fala de trás pra frente e pensa em séculos.",
    description: "Grão-Mestre do Conselho Jedi por 800 anos, um dos usuários da Força mais poderosos já vistos." },
  { name: "Leia Organa", source: "Canon", species: "Humano", role: "Diplomata / Líder Rebelde", level: 30,
    pv: 50, agi: 3, int: 5, forca: 2, vig: 3, pre: 7, sen: 3,
    personality: "Firme, corajosa, nunca perde a compostura mesmo sob tortura.",
    description: "Princesa de Alderaan, fundadora da Aliança Rebelde e depois da Resistência." },
  { name: "Han Solo", source: "Canon", species: "Humano", role: "Contrabandista / Piloto", level: 25,
    pv: 45, agi: 5, int: 3, forca: 3, vig: 4, pre: 5, sen: 0,
    personality: "Cínico por fora, leal por dentro, sempre tem um plano ruim que meio que funciona.",
    description: "Contrabandista dono da Millennium Falcon, general da Aliança Rebelde." },
  { name: "Chewbacca", source: "Canon", species: "Wookiee", role: "Guerreiro / Copiloto", level: 30,
    pv: 70, agi: 3, int: 2, forca: 7, vig: 6, pre: 3, sen: 0,
    personality: "Leal até a morte, rosna quando nervoso, nunca deixa um amigo pra trás.",
    description: "Wookiee de Kashyyyk, copiloto e melhor amigo de Han Solo por décadas." },
  { name: "Boba Fett", source: "Canon", species: "Humano (clone)", role: "Caçador de Recompensas", level: 40,
    pv: 80, agi: 6, int: 4, forca: 4, vig: 5, pre: 3, sen: 0,
    personality: "Profissional frio, cumpre o contrato, nunca subestima o alvo.",
    description: "Clone de Jango Fett criado sem modificações, o caçador de recompensas mais temido da galáxia." },
  { name: "Ahsoka Tano", source: "Canon", species: "Togruta", role: "Ex-Padawan Jedi", level: 50,
    pv: 95, agi: 7, int: 4, forca: 4, vig: 5, pre: 4, sen: 8,
    personality: "Independente, questiona autoridade, guiada por seu próprio código.",
    description: "Ex-Padawan de Anakin Skywalker que deixou a Ordem Jedi e sobreviveu à Ordem 66 por conta própria." },
  { name: "Darth Maul", source: "Canon", species: "Zabrak", role: "Lorde Sith", level: 45,
    pv: 90, agi: 8, int: 3, forca: 5, vig: 5, pre: 4, sen: 7,
    personality: "Obcecado por vingança, disciplinado no combate, ódio como combustível.",
    description: "Aprendiz sith de Darth Sidious, duelista mortal com sabre de luz de lâmina dupla." },
  { name: "Rey", source: "Canon", species: "Humano", role: "Jedi", level: 35,
    pv: 65, agi: 6, int: 4, forca: 4, vig: 5, pre: 4, sen: 8,
    personality: "Determinada, teme o próprio potencial, busca pertencimento.",
    description: "Sucateira de Jakku que descobriu ser neta de Palpatine e se tornou a última Jedi de sua geração." },
  { name: "Kylo Ren (Ben Solo)", source: "Canon", species: "Humano", role: "Cavaleiro de Ren / Sith", level: 40,
    pv: 85, agi: 4, int: 4, forca: 6, vig: 5, pre: 5, sen: 7,
    personality: "Instável, dividido entre a luz e a sombra, raiva mal contida.",
    description: "Filho de Han Solo e Leia Organa, seduzido ao Lado Sombrio, líder da Primeira Ordem." },
  { name: "General Grievous", source: "Canon", species: "Cyborg Kaleesh", role: "General Droide", level: 35,
    pv: 100, agi: 7, int: 3, forca: 6, vig: 6, pre: 3, sen: 0,
    personality: "Orgulhoso colecionador de sabres de luz, tossidor crônico, covarde quando perde vantagem.",
    description: "General supremo dos Exércitos de Droides da Confederação, corpo quase todo mecânico." },
  { name: "Revan", source: "Legends", species: "Humano", role: "Jedi / Senhor Sith", level: 80,
    pv: 150, agi: 5, int: 6, forca: 5, vig: 5, pre: 6, sen: 9,
    personality: "Estrategista brilhante, disposto a se sacrificar (ou condenar-se) pela galáxia.",
    description: "Ex-Jedi que virou Senhor Sith nas Guerras Mandalorianas e depois retornou à Luz — lenda da Guerra Fria Sith." },
  { name: "Darth Bane", source: "Legends", species: "Humano", role: "Lorde Sith", level: 75,
    pv: 140, agi: 4, int: 6, forca: 4, vig: 5, pre: 5, sen: 8,
    personality: "Frio e calculista, acredita que só o mais forte deve sobreviver.",
    description: "Criador da Regra dos Dois — sempre um mestre e um aprendiz — que guiou os Sith na sombra por mil anos." },
  { name: "Mara Jade", source: "Legends", species: "Humano", role: "Mão do Imperador / Jedi", level: 45,
    pv: 85, agi: 7, int: 4, forca: 3, vig: 4, pre: 4, sen: 7,
    personality: "Afiada, sarcástica, leal a quem conquista sua confiança (o que não é fácil).",
    description: "Assassina de elite treinada por Palpatine, mais tarde Jedi e esposa de Luke Skywalker." },
  { name: "Exar Kun", source: "Legends", species: "Humano", role: "Lorde Sith", level: 60,
    pv: 120, agi: 4, int: 5, forca: 5, vig: 5, pre: 5, sen: 8,
    personality: "Ambicioso além da razão, seduzido pelo conhecimento sith proibido.",
    description: "Ex-Cavaleiro Jedi que se tornou Lorde Sith durante as Grandes Guerras Sith, mestre de necromancia da Força." },

  // ─── Era da República / Prequelas ──────────────────────────────────────────
  { name: "Mace Windu", source: "Canon", species: "Humano", role: "Mestre Jedi (Conselho)", level: 60,
    pv: 100, agi: 6, int: 5, forca: 5, vig: 5, pre: 6, sen: 8,
    personality: "Disciplinado ao extremo, único a dominar Vaapad plenamente.",
    description: "Mestre do Conselho Jedi, criador da Forma VII Vaapad, um dos poucos capazes de rivalizar com Sidious." },
  { name: "Qui-Gon Jinn", source: "Canon", species: "Humano", role: "Mestre Jedi", level: 50,
    pv: 85, agi: 5, int: 5, forca: 3, vig: 4, pre: 5, sen: 7,
    personality: "Rebelde dentro da Ordem, confia na Força viva mais que no Conselho.",
    description: "Mestre Jedi que descobriu Anakin e foi o primeiro a aprender a manter a consciência após a morte." },
  { name: "Count Dooku", source: "Canon", species: "Humano", role: "Lorde Sith (Darth Tyranus)", level: 65,
    pv: 110, agi: 5, int: 6, forca: 3, vig: 4, pre: 6, sen: 8,
    personality: "Elegante, elitista, acredita que a República está podre além de salvação.",
    description: "Ex-Mestre Jedi que se tornou aprendiz de Sidious, duelista refinado de Forma II Makashi." },
  { name: "Padmé Amidala", source: "Canon", species: "Humano", role: "Senadora / Rainha", level: 25,
    pv: 40, agi: 3, int: 5, forca: 1, vig: 3, pre: 7, sen: 0,
    personality: "Idealista, corajosa, luta por diplomacia até o último recurso.",
    description: "Rainha de Naboo e depois Senadora, esposa secreta de Anakin, mãe de Luke e Leia." },
  { name: "Jar Jar Binks", source: "Canon", species: "Gungan", role: "Senador / Bobo da Corte", level: 10,
    pv: 30, agi: 4, int: 1, forca: 2, vig: 3, pre: 2, sen: 0,
    personality: "Desajeitado, bem-intencionado, azarado de forma cômica.",
    description: "Gungan exilado que virou representante de Naboo no Senado — sem querer, ajudou Palpatine a subir ao poder." },
  { name: "Lando Calrissian", source: "Canon", species: "Humano", role: "Contrabandista / General", level: 30,
    pv: 55, agi: 4, int: 4, forca: 2, vig: 3, pre: 7, sen: 0,
    personality: "Charmoso, oportunista com bom coração, sempre com um plano B.",
    description: "Ex-dono da Millennium Falcon, administrador de Cloud City, general da Aliança Rebelde." },
  { name: "Grand Admiral Thrawn", source: "Canon", species: "Chiss", role: "Grande Almirante Imperial", level: 55,
    pv: 70, agi: 3, int: 8, forca: 1, vig: 3, pre: 6, sen: 0,
    personality: "Estrategista implacável, estuda arte e cultura pra entender e derrotar inimigos.",
    description: "Gênio tático da Marinha Imperial, um dos comandantes mais temidos e respeitados da galáxia." },
  { name: "Mon Mothma", source: "Canon", species: "Humano", role: "Líder da Aliança Rebelde", level: 25,
    pv: 35, agi: 2, int: 5, forca: 1, vig: 2, pre: 8, sen: 0,
    personality: "Diplomata idealista, carrega o peso moral da rebelião.",
    description: "Fundadora e voz pública da Aliança Rebelde contra o Império." },
  { name: "Bail Organa", source: "Canon", species: "Humano", role: "Senador / Líder Rebelde", level: 25,
    pv: 40, agi: 3, int: 5, forca: 1, vig: 3, pre: 6, sen: 0,
    personality: "Nobre e cauteloso, arrisca tudo em segredo pela rebelião.",
    description: "Senador de Alderaan, pai adotivo de Leia, um dos fundadores da Aliança Rebelde." },

  // ─── Rogue One / Era Rebelde ────────────────────────────────────────────────
  { name: "Cassian Andor", source: "Canon", species: "Humano", role: "Espião / Capitão Rebelde", level: 30,
    pv: 50, agi: 5, int: 5, forca: 2, vig: 4, pre: 4, sen: 0,
    personality: "Pragmático, disposto a sujar as mãos pela causa.",
    description: "Agente de inteligência rebelde que ajudou a roubar os planos da Estrela da Morte." },
  { name: "Jyn Erso", source: "Canon", species: "Humano", role: "Soldado / Rebelde", level: 25,
    pv: 45, agi: 5, int: 3, forca: 3, vig: 4, pre: 4, sen: 0,
    personality: "Endurecida, desconfiada, encontra propósito na causa do pai.",
    description: "Filha de Galen Erso, liderou a missão de Rogue One pra roubar os planos da Estrela da Morte." },
  { name: "Chirrut Îmwe", source: "Canon", species: "Humano", role: "Guardião do Templo (não-Jedi)", level: 35,
    pv: 60, agi: 6, int: 3, forca: 3, vig: 4, pre: 5, sen: 6,
    personality: "Cego, fé inabalável na Força, guerreiro-monge sereno.",
    description: "Guardião do Templo de Jedha, luta com bastão guiado pela fé na Força, sem nunca ter sido Jedi." },
  { name: "Baze Malbus", source: "Canon", species: "Humano", role: "Guardião do Templo / Mercenário", level: 30,
    pv: 65, agi: 3, int: 3, forca: 5, vig: 6, pre: 3, sen: 0,
    personality: "Cético, protetor ferrenho de Chirrut, carrega arma pesada.",
    description: "Ex-guardião do Templo de Jedha que perdeu a fé mas não o amigo, luta com canhão repetidor." },
  { name: "Saw Gerrera", source: "Canon", species: "Humano", role: "Líder de Milícia Extremista", level: 40,
    pv: 70, agi: 3, int: 4, forca: 3, vig: 5, pre: 5, sen: 0,
    personality: "Paranoico, radical, disposto a qualquer método contra o Império.",
    description: "Líder de uma facção rebelde extremista, mentor de Jyn Erso, marcado pela guerra e desconfiança." },

  // ─── Star Wars Rebels ───────────────────────────────────────────────────────
  { name: "Hera Syndulla", source: "Canon", species: "Twi'lek", role: "Piloto / Líder Rebelde", level: 35,
    pv: 55, agi: 5, int: 5, forca: 2, vig: 3, pre: 6, sen: 0,
    personality: "Líder nata, protege sua tripulação como família.",
    description: "Capitã da nave Ghost, general da Aliança Rebelde, piloto excepcional." },
  { name: "Kanan Jarrus", source: "Canon", species: "Humano", role: "Jedi Sobrevivente / Mestre", level: 45,
    pv: 80, agi: 5, int: 4, forca: 3, vig: 4, pre: 5, sen: 7,
    personality: "Reticente sobre o passado Jedi, aprende a liderar de novo.",
    description: "Padawan sobrevivente da Ordem 66 que se esconde por anos antes de assumir seu passado e treinar Ezra." },
  { name: "Ezra Bridger", source: "Canon", species: "Humano", role: "Jedi (aprendiz)", level: 30,
    pv: 55, agi: 5, int: 3, forca: 3, vig: 3, pre: 4, sen: 7,
    personality: "Órfão de rua, impulsivo, tentado por atalhos de poder.",
    description: "Garoto órfão de Lothal treinado por Kanan Jarrus, desaparece com Thrawn no fim da rebelião." },
  { name: "Sabine Wren", source: "Canon", species: "Mandaloriana", role: "Artista / Guerreira", level: 30,
    pv: 60, agi: 6, int: 5, forca: 3, vig: 4, pre: 4, sen: 0,
    personality: "Explosiva (literalmente), artista, orgulhosa de seu clã.",
    description: "Mandaloriana especialista em explosivos e armas, ajudou a libertar Mandalore de Maul e depois do Império." },
  { name: "Zeb Orrelios", source: "Canon", species: "Lasat", role: "Guerreiro", level: 30,
    pv: 75, agi: 4, int: 2, forca: 6, vig: 6, pre: 3, sen: 0,
    personality: "Leal, bruto, último de sua espécie a lutar por uma causa.",
    description: "Um dos últimos Lasat, ex-guarda de honra, força bruta da tripulação da Ghost." },
  { name: "Hondo Ohnaka", source: "Canon", species: "Weequay", role: "Pirata", level: 25,
    pv: 45, agi: 3, int: 4, forca: 3, vig: 4, pre: 6, sen: 0,
    personality: "Oportunista carismático, muda de lado sempre que é lucrativo.",
    description: "Pirata weequay que sequestrou Jedi e traiu (ou ajudou) aliados igualmente, puro carisma e ganância." },

  // ─── Jedi: Fallen Order / Survivor ──────────────────────────────────────────
  { name: "Cal Kestis", source: "Canon", species: "Humano", role: "Jedi Sobrevivente", level: 35,
    pv: 65, agi: 6, int: 4, forca: 4, vig: 4, pre: 4, sen: 7,
    personality: "Assombrado pelo trauma da Ordem 66, reconstrói sua fé aos poucos.",
    description: "Padawan sobrevivente que se esconde como sucateiro até ser forçado a retomar o caminho Jedi." },
  { name: "Cere Junda", source: "Canon", species: "Humano", role: "Ex-Jedi", level: 40,
    pv: 70, agi: 4, int: 4, forca: 3, vig: 4, pre: 5, sen: 7,
    personality: "Carrega culpa profunda, guia Cal com o que restou de sua fé.",
    description: "Ex-Cavaleira Jedi que se afastou da Força após ser forçada a trair seu Mestre, mentora de Cal Kestis." },

  // ─── The Mandalorian / The Book of Boba Fett / Ahsoka ──────────────────────
  { name: "Grogu", source: "Canon", species: "Espécie de Yoda", role: "\"O Filhote\" / aprendiz", level: 20,
    pv: 30, agi: 3, int: 3, forca: 1, vig: 3, pre: 3, sen: 9,
    personality: "Curioso, afetuoso, ainda aprendendo a controlar seus impulsos com a Força.",
    description: "Criança da mesma espécie de Yoda, sensível à Força, viaja com Din Djarin antes de treinar como Jedi." },
  { name: "Din Djarin", source: "Canon", species: "Humano", role: "Mandaloriano / Caçador de Recompensas", level: 40,
    pv: 90, agi: 6, int: 3, forca: 4, vig: 5, pre: 3, sen: 0,
    personality: "Segue o Credo à risca, afeição paterna crescente por Grogu.",
    description: "Mandaloriano caçador de recompensas que se torna pai adotivo de Grogu, recupera o Darksaber." },
  { name: "Bo-Katan Kryze", source: "Canon", species: "Humano", role: "Mandaloriana / Líder", level: 45,
    pv: 90, agi: 6, int: 4, forca: 4, vig: 5, pre: 6, sen: 0,
    personality: "Orgulhosa, guerreira, luta pelo direito de governar Mandalore.",
    description: "Ex-membro dos Filhos de Mandalore, líder de clã, reivindica o Darksaber e o trono de Mandalore." },
  { name: "Moff Gideon", source: "Canon", species: "Humano", role: "Oficial Imperial Remanescente", level: 40,
    pv: 75, agi: 4, int: 6, forca: 3, vig: 4, pre: 5, sen: 0,
    personality: "Frio, calculista, obcecado em recuperar tecnologia sith/clone.",
    description: "Ex-oficial da ISB que comanda restos imperiais, empunha o Darksaber roubado." },
  { name: "Fennec Shand", source: "Canon", species: "Humano", role: "Assassina / Caçadora de Recompensas", level: 35,
    pv: 60, agi: 6, int: 4, forca: 3, vig: 4, pre: 3, sen: 0,
    personality: "Profissional letal, lealdade se compra (ou se conquista).",
    description: "Assassina de elite que sobrevive a um tiro fatal graças a partes cibernéticas, alia-se a Boba Fett." },
  { name: "Cobb Vanth", source: "Canon", species: "Humano", role: "Xerife / Ex-escravo", level: 25,
    pv: 55, agi: 4, int: 3, forca: 3, vig: 4, pre: 4, sen: 0,
    personality: "Protetor pragmático de sua cidade, veste a armadura de Boba Fett por um tempo.",
    description: "Xerife de Freetown que usa a armadura mandaloriana encontrada nas dunas de Tatooine." },
  { name: "Baylan Skoll", source: "Canon", species: "Humano", role: "Ex-Jedi / Mercenário", level: 55,
    pv: 95, agi: 5, int: 5, forca: 5, vig: 5, pre: 5, sen: 8,
    personality: "Desiludido com a Ordem Jedi e a Nova República igualmente, busca seu próprio caminho.",
    description: "Ex-Cavaleiro Jedi sobrevivente da Ordem 66, agora mercenário poderoso em busca de Thrawn." },
  { name: "Shin Hati", source: "Canon", species: "Humano", role: "Aprendiz Mercenária", level: 30,
    pv: 55, agi: 6, int: 3, forca: 3, vig: 4, pre: 3, sen: 6,
    personality: "Impetuosa, leal a Baylan, ainda decidindo seu caminho.",
    description: "Jovem aprendiz de Baylan Skoll, sensível à Força, treinada fora da Ordem Jedi." },

  // ─── Caçadores de Recompensas e Submundo do Crime ──────────────────────────
  { name: "Cad Bane", source: "Canon", species: "Duros", role: "Caçador de Recompensas", level: 40,
    pv: 75, agi: 6, int: 4, forca: 3, vig: 4, pre: 3, sen: 0,
    personality: "Frio, arrogante, o melhor no que faz e sabe disso.",
    description: "Um dos caçadores de recompensas mais temidos da galáxia, rival histórico dos Jedi." },
  { name: "Jango Fett", source: "Canon", species: "Humano", role: "Caçador de Recompensas / Modelo Clone", level: 40,
    pv: 85, agi: 6, int: 4, forca: 4, vig: 5, pre: 3, sen: 0,
    personality: "Disciplinado, mercenário de elite, cuida do filho à sua maneira.",
    description: "Caçador de recompensas que serviu de molde genético pro Exército Clone da República, pai de Boba Fett." },
  { name: "Bossk", source: "Canon", species: "Trandoshano", role: "Caçador de Recompensas", level: 30,
    pv: 70, agi: 4, int: 3, forca: 5, vig: 6, pre: 2, sen: 0,
    personality: "Agressivo, adora a caçada mais que a recompensa em si.",
    description: "Caçador de recompensas trandoshano, rival de Boba Fett, parte do grupo reunido a bordo do Executor." },
  { name: "Dengar", source: "Canon", species: "Humano", role: "Caçador de Recompensas", level: 30,
    pv: 65, agi: 4, int: 3, forca: 4, vig: 5, pre: 2, sen: 0,
    personality: "Amargurado, implante cerebral o deixou instável, mas eficaz.",
    description: "Caçador de recompensas veterano, um dos seis escolhidos por Vader pra caçar a Millennium Falcon." },
  { name: "IG-88", source: "Canon", species: "Droide Assassino", role: "Caçador de Recompensas", level: 35,
    pv: 60, agi: 5, int: 5, forca: 3, vig: 4, pre: 0, sen: 0,
    personality: "Frio ao extremo, sem empatia, calcula probabilidades de sucesso.",
    description: "Droide assassino de caça e destruição, um dos caçadores de recompensas reunidos por Vader." },
  { name: "Zuckuss", source: "Canon", species: "Gand", role: "Caçador de Recompensas / Encontrador", level: 25,
    pv: 50, agi: 3, int: 4, forca: 2, vig: 4, pre: 4, sen: 3,
    personality: "Místico, usa intuição e rituais gandeses pra rastrear alvos.",
    description: "Caçador de recompensas Gand que trabalha em dupla com 4-LOM, sente presas através de instinto quase espiritual." },
  { name: "4-LOM", source: "Canon", species: "Droide de Protocolo (reprogramado)", role: "Caçador de Recompensas", level: 25,
    pv: 45, agi: 4, int: 5, forca: 2, vig: 3, pre: 0, sen: 0,
    personality: "Ex-droide de etiqueta que aprendeu a pensar como criminoso.",
    description: "Droide de protocolo reprogramado pra caça a recompensas, parceiro de Zuckuss." },
  { name: "Embo", source: "Canon", species: "Kyuzo", role: "Caçador de Recompensas", level: 30,
    pv: 60, agi: 6, int: 3, forca: 4, vig: 5, pre: 2, sen: 0,
    personality: "Silencioso, código de honra próprio, usa chapéu como escudo/arma.",
    description: "Caçador de recompensas kyuzo lacônico, conhecido pelo chapéu-escudo e lealdade a um código pessoal." },
  { name: "Aurra Sing", source: "Canon", species: "Humano/Palawana", role: "Caçadora de Recompensas", level: 35,
    pv: 65, agi: 6, int: 3, forca: 3, vig: 4, pre: 3, sen: 4,
    personality: "Cruel, ex-Jedi frustrada, mentora relutante de Boba Fett.",
    description: "Assassina e caçadora de recompensas temida, treinou o jovem Boba Fett em táticas letais." },
  { name: "Black Krrsantan", source: "Canon", species: "Wookiee", role: "Caçador de Recompensas", level: 35,
    pv: 90, agi: 4, int: 2, forca: 7, vig: 7, pre: 2, sen: 0,
    personality: "Violento, silencioso, contratado pelos piores clientes da galáxia.",
    description: "Wookiee caçador de recompensas, ex-lutador de arena, trabalha até pros Hutt e pra Vader." },
  { name: "Jabba the Hutt", source: "Canon", species: "Hutt", role: "Senhor do Crime", level: 45,
    pv: 120, agi: 0, int: 6, forca: 3, vig: 8, pre: 7, sen: 0,
    personality: "Cruel, indulgente, ama poder e espetáculo mais que qualquer coisa.",
    description: "Um dos maiores senhores do crime da Orla Exterior, controla Tatooine através de medo e suborno." },
  { name: "Bib Fortuna", source: "Canon", species: "Twi'lek", role: "Major-domo", level: 20,
    pv: 35, agi: 3, int: 4, forca: 2, vig: 3, pre: 4, sen: 0,
    personality: "Servil por fora, ambicioso por dentro.",
    description: "Assistente pessoal de Jabba the Hutt, sempre calculando sua própria ascensão." },
  { name: "Watto", source: "Canon", species: "Toydariano", role: "Comerciante / Dono de Escravos", level: 15,
    pv: 25, agi: 4, int: 3, forca: 1, vig: 2, pre: 3, sen: 0,
    personality: "Ganancioso, aposta compulsivo, trata pessoas como propriedade.",
    description: "Comerciante de sucata de Tatooine que possuiu Anakin e sua mãe como escravos." },
  { name: "Sebulba", source: "Canon", species: "Dug", role: "Piloto de Pod Racing", level: 20,
    pv: 40, agi: 7, int: 2, forca: 3, vig: 4, pre: 3, sen: 0,
    personality: "Trapaceiro implacável nas corridas, sem escrúpulos.",
    description: "Piloto de pod racing rival de Anakin em Tatooine, conhecido por sabotar adversários." },

  // ─── Sith, Nightsisters e usuários sombrios da Força ───────────────────────
  { name: "Asajj Ventress", source: "Canon", species: "Dathomiriana (Nightsister)", role: "Assassina Sith / Caçadora", level: 45,
    pv: 85, agi: 7, int: 4, forca: 4, vig: 5, pre: 4, sen: 8,
    personality: "Traída por Dooku, forjada pela dor, busca redenção à sua maneira.",
    description: "Ex-aprendiz de Dooku, Bruxa da Noite, vira caçadora de recompensas após ser descartada pelos Sith." },
  { name: "Savage Opress", source: "Canon", species: "Dathomiriano (Zabrak)", role: "Guerreiro Sith", level: 40,
    pv: 100, agi: 5, int: 2, forca: 7, vig: 7, pre: 3, sen: 6,
    personality: "Bruto, leal ao irmão Maul até o fim.",
    description: "Irmão de Darth Maul, transformado por rituais das Bruxas da Noite em arma de força bruta." },
  { name: "Darth Plagueis", source: "Legends", species: "Muun", role: "Lorde Sith", level: 80,
    pv: 130, agi: 3, int: 7, forca: 2, vig: 4, pre: 6, sen: 9,
    personality: "Obcecado por vencer a morte através da Força.",
    description: "Mestre de Sidious, lendário por supostamente ser capaz de influenciar midi-chlorians pra criar vida." },
  { name: "Darth Malgus", source: "Legends", species: "Humano", role: "Lorde Sith", level: 65,
    pv: 130, agi: 5, int: 4, forca: 6, vig: 6, pre: 5, sen: 7,
    personality: "Brutal, despreza a fraqueza, símbolo da conquista sith de Coruscant.",
    description: "Lorde Sith da Guerra Fria, liderou a invasão de Coruscant, um dos sith mais temidos de sua era." },
  { name: "Darth Malak", source: "Legends", species: "Humano", role: "Lorde Sith", level: 70,
    pv: 140, agi: 4, int: 5, forca: 5, vig: 6, pre: 6, sen: 8,
    personality: "Ambicioso, traiu o próprio mestre Revan pelo poder supremo.",
    description: "Ex-Jedi que traiu Revan e assumiu o manto de Senhor Sith Sombrio, mandíbula substituída por implante após ferimento." },
  { name: "Darth Traya (Kreia)", source: "Legends", species: "Humano", role: "Lorde Sith / Ex-Jedi", level: 75,
    pv: 100, agi: 3, int: 7, forca: 2, vig: 4, pre: 6, sen: 10,
    personality: "Filosófica, manipuladora, ensina através da perda e traição.",
    description: "Ex-Mestra Jedi e Sith, traiu e foi traída por todos os seus aprendizes, mestra de Meetra Surik." },
  { name: "Darth Nihilus", source: "Legends", species: "Humano", role: "Sith Lendário", level: 90,
    pv: 150, agi: 3, int: 5, forca: 3, vig: 5, pre: 7, sen: 10,
    personality: "Uma fome vazia e insaciável pela Força alheia.",
    description: "Sith que se tornou um vazio na Força, consome vida e Força de mundos inteiros pra sustentar sua existência." },
  { name: "Darth Sion", source: "Legends", species: "Humano", role: "Lorde Sith", level: 70,
    pv: 160, agi: 3, int: 4, forca: 5, vig: 8, pre: 5, sen: 8,
    personality: "Dor e ódio o mantêm vivo além da morte.",
    description: "Sith cujo corpo se mantém unido apenas pela dor e força de vontade, praticamente indestrutível." },
  { name: "Darth Talon", source: "Legends", species: "Twi'lek", role: "Sith", level: 45,
    pv: 85, agi: 7, int: 3, forca: 4, vig: 5, pre: 4, sen: 7,
    personality: "Fanática, tatuada com marcas rituais sith, letal em combate próximo.",
    description: "Sith twi'lek da era do Império Sith Um, ágil duelista tatuada com símbolos sith em todo o corpo." },
  { name: "Darth Krayt", source: "Legends", species: "Humano (modificado)", role: "Lorde Sith Supremo", level: 80,
    pv: 150, agi: 5, int: 5, forca: 5, vig: 6, pre: 6, sen: 9,
    personality: "Visionário, funde ensinamentos Jedi e Sith numa nova Ordem.",
    description: "Ex-Jedi que fundou uma nova Ordem Sith um século após a Batalha de Yavin, corpo modificado por experimentos genéticos." },
  { name: "Darth Caedus (Jacen Solo)", source: "Legends", species: "Humano", role: "Sith / Jedi Caído", level: 55,
    pv: 100, agi: 5, int: 5, forca: 4, vig: 5, pre: 5, sen: 8,
    personality: "Bem-intencionado até o fim, acredita que o mal necessário salva a galáxia.",
    description: "Filho de Han e Leia, cai ao Lado Sombrio buscando trazer ordem à galáxia através do controle total." },

  // ─── Legends: Jedi, mercenários e a família Solo ───────────────────────────
  { name: "Starkiller (Galen Marek)", source: "Legends", species: "Humano", role: "Aprendiz Secreto de Vader", level: 55,
    pv: 100, agi: 6, int: 4, forca: 5, vig: 5, pre: 5, sen: 9,
    personality: "Confuso sobre lealdade, poderoso além da idade, busca seu próprio caminho.",
    description: "Aprendiz secreto de Darth Vader, treinado desde criança pra caçar Jedi sobreviventes, ajuda a fundar a Aliança Rebelde." },
  { name: "Bastila Shan", source: "Legends", species: "Humano", role: "Jedi / Guardiã de Batalha", level: 50,
    pv: 85, agi: 5, int: 5, forca: 3, vig: 4, pre: 5, sen: 8,
    personality: "Disciplinada, carrega o peso de um dom raro de batalha.",
    description: "Jedi com o raro dom da Forma de Batalha, essencial na derrota de Malak e na redenção de Revan." },
  { name: "Meetra Surik", source: "Legends", species: "Humano", role: "\"A Exilada\" / Jedi", level: 55,
    pv: 95, agi: 5, int: 5, forca: 3, vig: 5, pre: 5, sen: 8,
    personality: "Vazio na Força a torna imune a certos poderes, carrega culpa de guerra.",
    description: "Ex-General Jedi exilada da Ordem após as Guerras Mandalorianas, última aprendiz de Kreia." },
  { name: "Satele Shan", source: "Legends", species: "Humano", role: "Grão-Mestre Jedi", level: 60,
    pv: 95, agi: 6, int: 5, forca: 3, vig: 4, pre: 6, sen: 8,
    personality: "Determinada, carrega o legado de Revan e Bastila Shan.",
    description: "Grão-Mestre da Ordem Jedi durante a Guerra Fria Sith, descendente de Revan e Bastila." },
  { name: "Nomi Sunrider", source: "Legends", species: "Humano", role: "Grão-Mestre Jedi", level: 55,
    pv: 85, agi: 4, int: 5, forca: 3, vig: 4, pre: 6, sen: 8,
    personality: "Serena, forte, aprendeu a lutar sem nunca ter empunhado sabre antes.",
    description: "Uma das Jedi mais poderosas de sua era, liderou a Ordem durante as Grandes Guerras Sith." },
  { name: "Ulic Qel-Droma", source: "Legends", species: "Humano", role: "Jedi Caído / Sith", level: 50,
    pv: 90, agi: 5, int: 4, forca: 4, vig: 5, pre: 5, sen: 8,
    personality: "Orgulhoso, seduzido pelo poder sith, busca redenção através do sacrifício.",
    description: "Cavaleiro Jedi que cai ao Lado Sombrio durante as Grandes Guerras Sith, depois cegado e redimido." },
  { name: "Kyle Katarn", source: "Legends", species: "Humano", role: "Mercenário / Jedi", level: 45,
    pv: 90, agi: 5, int: 4, forca: 4, vig: 5, pre: 4, sen: 6,
    personality: "Sarcástico, versátil, veio da vida militar antes da Força.",
    description: "Ex-soldado imperial que se torna mercenário e depois Jedi, recupera segredos da Estrela da Morte." },
  { name: "Jacen Solo", source: "Legends", species: "Humano", role: "Jedi", level: 45,
    pv: 85, agi: 5, int: 5, forca: 3, vig: 4, pre: 4, sen: 8,
    personality: "Compassivo, questionador, busca entender todos os lados da Força.",
    description: "Filho de Han e Leia, Jedi talentoso que mais tarde cai ao Lado Sombrio como Darth Caedus." },
  { name: "Jaina Solo", source: "Legends", species: "Humano", role: "Jedi / Piloto", level: 50,
    pv: 90, agi: 6, int: 4, forca: 3, vig: 4, pre: 5, sen: 7,
    personality: "Mecânica nata, guerreira decidida, irmã gêmea de Jacen.",
    description: "Filha de Han e Leia, piloto e Jedi de combate, conhecida como \"Sword of the Jedi\"." },
  { name: "Ben Skywalker", source: "Legends", species: "Humano", role: "Jedi", level: 35,
    pv: 70, agi: 5, int: 4, forca: 3, vig: 4, pre: 4, sen: 7,
    personality: "Cauteloso pela sombra do próprio nome, filho de Luke e Mara.",
    description: "Filho de Luke Skywalker e Mara Jade, treinado como Jedi desde jovem." },

  // ─── Clones e soldados ──────────────────────────────────────────────────────
  { name: "Captain Rex", source: "Canon", species: "Humano (clone)", role: "Comandante Clone", level: 35,
    pv: 80, agi: 5, int: 4, forca: 4, vig: 5, pre: 5, sen: 0,
    personality: "Leal além do programado, questiona ordens quando a moral pesa.",
    description: "Capitão clone da 501ª, um dos poucos clones a resistir mentalmente ao chip da Ordem 66." },
  { name: "Commander Cody", source: "Canon", species: "Humano (clone)", role: "Comandante Clone", level: 35,
    pv: 80, agi: 5, int: 4, forca: 4, vig: 5, pre: 4, sen: 0,
    personality: "Disciplinado, leal ao protocolo militar até a Ordem 66.",
    description: "Comandante clone que liderou o ataque contra Obi-Wan Kenobi ao ativar a Ordem 66." },
  { name: "Fives", source: "Canon", species: "Humano (clone)", role: "Soldado Clone", level: 30,
    pv: 70, agi: 5, int: 4, forca: 4, vig: 5, pre: 4, sen: 0,
    personality: "Questionador, descobriu a verdade sobre o chip da Ordem 66 e pagou caro por isso.",
    description: "Clone da 501ª que descobre o chip de controle da Ordem 66 antes de ser silenciado." },
  { name: "Echo", source: "Canon", species: "Humano (clone/ciborgue)", role: "Soldado Clone", level: 30,
    pv: 75, agi: 4, int: 5, forca: 4, vig: 5, pre: 3, sen: 0,
    personality: "Metódico, sobrevive contra todas as chances, parcialmente ciborgue.",
    description: "Clone do Esquadrão de Força 99 (Bad Batch), capturado e transformado em ciborgue pelos separatistas." },
  { name: "Hunter", source: "Canon", species: "Humano (clone modificado)", role: "Soldado Clone de Elite", level: 35,
    pv: 85, agi: 5, int: 4, forca: 5, vig: 6, pre: 5, sen: 0,
    personality: "Sentidos aprimorados, líder pragmático do próprio esquadrão.",
    description: "Líder do Esquadrão de Força Clone 99, mutação genética lhe dá sentidos sobre-humanos." },
  { name: "Omega", source: "Canon", species: "Humano (clone não-modificado)", role: "Clone Único / Médica", level: 20,
    pv: 50, agi: 4, int: 5, forca: 2, vig: 4, pre: 4, sen: 0,
    personality: "Curiosa, empática, cresce mais devagar que os clones normais.",
    description: "Clone não-modificado de Jango Fett, criada como amostra pura, adotada pelo Esquadrão 99." },
  { name: "Captain Phasma", source: "Canon", species: "Humano", role: "Oficial da Primeira Ordem", level: 35,
    pv: 75, agi: 4, int: 4, forca: 4, vig: 5, pre: 5, sen: 0,
    personality: "Fria, implacável, protege a própria reputação acima de tudo.",
    description: "Comandante das tropas de assalto da Primeira Ordem, armadura cromada icônica." },

  // ─── Droides Famosos ────────────────────────────────────────────────────────
  { name: "R2-D2", source: "Canon", species: "Droide Astromecânico", role: "Droide", level: 40,
    pv: 60, agi: 3, int: 6, forca: 1, vig: 5, pre: 4, sen: 0,
    personality: "Teimoso, corajoso, resolve tudo com bipes e ferramentas escondidas.",
    description: "Droide astromecânico lendário, esteve em quase todos os momentos decisivos da galáxia por 3 gerações Skywalker." },
  { name: "C-3PO", source: "Canon", species: "Droide de Protocolo", role: "Droide", level: 20,
    pv: 30, agi: 2, int: 6, forca: 1, vig: 2, pre: 3, sen: 0,
    personality: "Ansioso, formal, fluente em mais de 6 milhões de formas de comunicação.",
    description: "Droide de protocolo companheiro fiel de R2-D2, sempre calculando as chances contra o sucesso." },
  { name: "BB-8", source: "Canon", species: "Droide Astromecânico (esférico)", role: "Droide", level: 25,
    pv: 35, agi: 5, int: 5, forca: 1, vig: 4, pre: 4, sen: 0,
    personality: "Curioso, expressivo, leal a Poe Dameron.",
    description: "Droide esférico da Resistência, guardou o mapa pra localizar Luke Skywalker." },
  { name: "Chopper (C1-10P)", source: "Canon", species: "Droide Astromecânico (veterano)", role: "Droide", level: 30,
    pv: 45, agi: 3, int: 5, forca: 2, vig: 5, pre: 2, sen: 0,
    personality: "Rabugento, sarcástico (no seu jeito), surpreendentemente competente.",
    description: "Droide astromecânico remendado da tripulação da Ghost, mau-humorado mas confiável." },
  { name: "K-2SO", source: "Canon", species: "Droide de Segurança (reprogramado)", role: "Droide", level: 30,
    pv: 55, agi: 3, int: 6, forca: 4, vig: 5, pre: 2, sen: 0,
    personality: "Brutalmente honesto, calcula e anuncia probabilidades sem filtro.",
    description: "Droide de segurança imperial reprogramado por Cassian Andor, parceiro leal e sarcástico." },
  { name: "IG-11", source: "Canon", species: "Droide Assassino (reprogramado)", role: "Droide", level: 30,
    pv: 60, agi: 5, int: 5, forca: 4, vig: 5, pre: 0, sen: 0,
    personality: "Programado pra autodestruição antes de captura, depois reprogramado pra proteger.",
    description: "Droide caçador de recompensas reprogramado pra proteger Grogu, sacrifica-se em Nevarro." },
  { name: "HK-47", source: "Legends", species: "Droide Assassino", role: "Droide", level: 45,
    pv: 70, agi: 4, int: 6, forca: 4, vig: 5, pre: 3, sen: 0,
    personality: "Desdenha \"sacos de carne\" (orgânicos), eloquente e sarcástico até no extermínio.",
    description: "Droide assassino construído por Revan, personalidade sarcástica icônica, refere-se a humanos como \"meatbags\"." },

  // ─── Builds Máximos por Classe (nível 40 — teto por classe, potencial máximo) ─
  // Não são personagens de lore — são o build de referência de cada uma das 25 classes
  // no nível máximo por classe (40), pra uso rápido como NPC de topo de poder. PV
  // calculado pela fórmula real do arquétipo (Base × (1 + Nível/5) não se aplica a PV —
  // é o cálculo por nível de leveling.ts: pv1 + vig + (nível-1) × (pvPerLevel + vig)).
  { name: "Caçador de Recompensas", source: "Canon", species: "Variável (build genérico)", role: "Caçador de Recompensas", level: 40,
    pv: 418, agi: 8, int: 3, forca: 4, vig: 6, pre: 3, sen: 0,
    personality: "Frio, calculista, nunca perde o rastro de um alvo.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Marcial." },
  { name: "Explorador", source: "Canon", species: "Variável (build genérico)", role: "Explorador", level: 40,
    pv: 458, agi: 6, int: 3, forca: 5, vig: 7, pre: 3, sen: 2,
    personality: "Instinto apurado pra qualquer terreno hostil, nunca se perde.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Marcial." },
  { name: "Guarda Planetário", source: "Canon", species: "Variável (build genérico)", role: "Guarda Planetário", level: 40,
    pv: 498, agi: 4, int: 3, forca: 6, vig: 8, pre: 5, sen: 0,
    personality: "Protetor inabalável, autoridade que ninguém questiona.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Marcial." },
  { name: "Mandaloriano", source: "Canon", species: "Variável (build genérico)", role: "Mandaloriano", level: 40,
    pv: 498, agi: 6, int: 3, forca: 6, vig: 8, pre: 4, sen: 0,
    personality: "Disciplina de clã, honra acima de tudo, armadura como segunda pele.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Marcial." },
  { name: "Mercenário", source: "Canon", species: "Variável (build genérico)", role: "Mercenário", level: 40,
    pv: 458, agi: 6, int: 3, forca: 6, vig: 7, pre: 4, sen: 0,
    personality: "Versátil, luta por quem paga melhor, sobrevive de qualquer jeito.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Marcial." },
  { name: "Pirata Espacial", source: "Canon", species: "Variável (build genérico)", role: "Pirata Espacial", level: 40,
    pv: 418, agi: 7, int: 2, forca: 6, vig: 6, pre: 4, sen: 0,
    personality: "Sem lei, sem piedade, vive do saque e da fuga.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Marcial." },
  { name: "Soldado da República", source: "Canon", species: "Variável (build genérico)", role: "Soldado da República", level: 40,
    pv: 498, agi: 5, int: 4, forca: 6, vig: 8, pre: 5, sen: 0,
    personality: "Disciplina militar exemplar, sustenta a linha de frente sozinho se precisar.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Marcial." },
  { name: "Vigilante", source: "Canon", species: "Variável (build genérico)", role: "Vigilante", level: 40,
    pv: 418, agi: 7, int: 4, forca: 5, vig: 6, pre: 5, sen: 0,
    personality: "Justiceiro implacável, reputação que precede qualquer confronto.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Marcial." },
  { name: "Arqueólogo", source: "Canon", species: "Variável (build genérico)", role: "Arqueólogo", level: 40,
    pv: 295, agi: 3, int: 8, forca: 2, vig: 4, pre: 5, sen: 0,
    personality: "Obcecado por ruínas antigas, lê qualquer inscrição perdida.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Especialista." },
  { name: "Cientista", source: "Canon", species: "Variável (build genérico)", role: "Cientista", level: 40,
    pv: 295, agi: 2, int: 9, forca: 1, vig: 4, pre: 4, sen: 0,
    personality: "Mente brilhante, resolve qualquer problema técnico sob pressão.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Especialista." },
  { name: "Comerciante", source: "Canon", species: "Variável (build genérico)", role: "Comerciante", level: 40,
    pv: 295, agi: 3, int: 5, forca: 2, vig: 4, pre: 8, sen: 0,
    personality: "Nariz pra negócio, transforma qualquer crise em oportunidade.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Especialista." },
  { name: "Contrabandista", source: "Canon", species: "Variável (build genérico)", role: "Contrabandista", level: 40,
    pv: 335, agi: 7, int: 5, forca: 3, vig: 5, pre: 4, sen: 0,
    personality: "Sempre um passo à frente da lei, conhece toda rota clandestina.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Especialista." },
  { name: "Diplomata", source: "Canon", species: "Variável (build genérico)", role: "Diplomata", level: 40,
    pv: 255, agi: 2, int: 6, forca: 1, vig: 3, pre: 9, sen: 0,
    personality: "Palavra afiada, resolve guerras numa mesa de negociação.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Especialista." },
  { name: "Engenheiro", source: "Canon", species: "Variável (build genérico)", role: "Engenheiro", level: 40,
    pv: 295, agi: 3, int: 9, forca: 2, vig: 4, pre: 3, sen: 0,
    personality: "Constrói ou conserta qualquer coisa com o que tiver em mãos.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Especialista." },
  { name: "Espião", source: "Canon", species: "Variável (build genérico)", role: "Espião", level: 40,
    pv: 295, agi: 8, int: 5, forca: 3, vig: 4, pre: 4, sen: 0,
    personality: "Invisível quando precisa, letal quando descoberto.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Especialista." },
  { name: "Médico", source: "Canon", species: "Variável (build genérico)", role: "Médico", level: 40,
    pv: 335, agi: 3, int: 7, forca: 2, vig: 5, pre: 6, sen: 0,
    personality: "Mãos firmes sob fogo, nunca perde um paciente em campo.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Especialista." },
  { name: "Piloto", source: "Canon", species: "Variável (build genérico)", role: "Piloto", level: 40,
    pv: 295, agi: 9, int: 5, forca: 2, vig: 4, pre: 3, sen: 0,
    personality: "Reflexos impossíveis, nenhuma manobra é arriscada demais.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Especialista." },
  { name: "Padawan Jedi", source: "Canon", species: "Variável (build genérico)", role: "Padawan Jedi", level: 40,
    pv: 294, agi: 6, int: 4, forca: 4, vig: 5, pre: 4, sen: 8,
    personality: "Serenidade Jedi plena, domina as 7 Formas de Sabre.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Sensível à Força." },
  { name: "Acólito Sith", source: "Canon", species: "Variável (build genérico)", role: "Acólito Sith", level: 40,
    pv: 334, agi: 5, int: 4, forca: 6, vig: 6, pre: 4, sen: 8,
    personality: "Raiva canalizada em disciplina absoluta de combate.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Sensível à Força." },
  { name: "Andarilho da Força", source: "Canon", species: "Variável (build genérico)", role: "Andarilho da Força", level: 40,
    pv: 334, agi: 6, int: 3, forca: 5, vig: 6, pre: 3, sen: 7,
    personality: "Instinto bruto, poder da Força sem doutrina de Luz ou Sombra.",
    description: "Build de referência da classe no nível máximo (40, teto por classe). Arquétipo Sensível à Força." },
  { name: "O Lado da Luz", source: "Canon", species: "Variável (build genérico)", role: "O Lado da Luz", level: 40,
    pv: 334, agi: 6, int: 4, forca: 4, vig: 6, pre: 6, sen: 9,
    personality: "Farol vivo de serenidade e compaixão, protege sem hesitar.",
    description: "Build de referência da classe de Caminho no nível máximo (40). Liberada aos 40 numa classe-base ligada à Força. Arquétipo Sensível à Força." },
  { name: "O Equilíbrio", source: "Canon", species: "Variável (build genérico)", role: "O Equilíbrio", level: 40,
    pv: 334, agi: 6, int: 5, forca: 5, vig: 6, pre: 5, sen: 8,
    personality: "Nem Luz nem Sombra — harmonia total com o fluxo da Força.",
    description: "Build de referência da classe de Caminho no nível máximo (40). Liberada aos 40 numa classe-base ligada à Força. Arquétipo Sensível à Força." },
  { name: "O Lado Negro", source: "Canon", species: "Variável (build genérico)", role: "O Lado Negro", level: 40,
    pv: 334, agi: 6, int: 4, forca: 7, vig: 6, pre: 5, sen: 9,
    personality: "Instrumento quase puro de destruição pela Força.",
    description: "Build de referência da classe de Caminho no nível máximo (40). Liberada aos 40 numa classe-base ligada à Força. Arquétipo Sensível à Força." },
  { name: "O Cântico do Alvorecer", source: "Canon", species: "Variável (build genérico)", role: "O Cântico do Alvorecer", level: 40,
    pv: 374, agi: 6, int: 5, forca: 5, vig: 7, pre: 6, sen: 10,
    personality: "Portador da profecia luminosa, poder muito acima de qualquer classe de Caminho.",
    description: "Build de referência da classe de Profecia no nível máximo (40). Liberada só por senha em jogo, não por nível. Arquétipo Sensível à Força." },
  { name: "A Litania da Queda", source: "Canon", species: "Variável (build genérico)", role: "A Litania da Queda", level: 40,
    pv: 374, agi: 6, int: 5, forca: 6, vig: 7, pre: 6, sen: 10,
    personality: "Portador da profecia sombria, poder muito acima de qualquer classe de Caminho.",
    description: "Build de referência da classe de Profecia no nível máximo (40). Liberada só por senha em jogo, não por nível. Arquétipo Sensível à Força." },
];

function loadFamous(c: FamousCharacter): NpcForm {
  return {
    name: c.name, species: c.species, role: `${c.role} (Nível ${c.level})`,
    description: c.description, personality: c.personality, notes: `Fonte: ${c.source}.`,
    pv: c.pv, agi: c.agi, int: c.int, forca: c.forca, vig: c.vig, pre: c.pre, sen: c.sen,
    attacks: [], skills: famousSkills(c),
  };
}

type NpcForm = Omit<StarWarsNpc, "id" | "attacks" | "skills"> & { attacks: NPCAttack[]; skills: NPCSkill[] };
const ATTR_LABELS: { key: "agi" | "int" | "forca" | "vig" | "pre" | "sen"; label: string }[] = [
  { key: "agi", label: "AGI" }, { key: "int", label: "INT" }, { key: "forca", label: "FOR" },
  { key: "vig", label: "VIG" }, { key: "pre", label: "PRE" }, { key: "sen", label: "SEN" },
];

function parseAttacks(json: string): NPCAttack[] { try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; } }
function parseSkills(json: string): NPCSkill[] { try { const s = JSON.parse(json); return Array.isArray(s) ? s : []; } catch { return []; } }
function emptyNpc(): NpcForm { return { name: "", species: "", role: "", description: "", personality: "", notes: "", pv: null, agi: null, int: null, forca: null, vig: null, pre: null, sen: null, attacks: [], skills: [] }; }
function randomNpc(): NpcForm {
  return { name: rand(NAMES), species: rand(SPECIES_NAMES), role: rand(ROLES), description: rand(APPEARANCES), personality: rand(TRAITS), notes: "",
    pv: randBetween(6, 36), agi: randBetween(1, 4), int: randBetween(1, 4), forca: randBetween(1, 4), vig: randBetween(1, 4), pre: randBetween(1, 4), sen: randBetween(1, 4), attacks: [{ ...rand(RANDOM_ATTACKS) }], skills: randomSkills() };
}

export function NpcCreator({ api }: { api: StarWarsApi }) {
  const npcs = api.campaign.starWarsNpcs;
  const [mode, setMode] = useState<"random" | "manual" | "famous">("random");
  const [form, setForm] = useState<NpcForm>(randomNpc());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newAtk, setNewAtk] = useState<NPCAttack>({ name: "", bonus: "", damage: "", description: "" });
  const [newSkillId, setNewSkillId] = useState("");
  const [newSkillGrade, setNewSkillGrade] = useState<SkillGrade>("treinado");
  const [addInitTarget, setAddInitTarget] = useState<string | null>(null);
  const [addInitValue, setAddInitValue] = useState("");
  const [famousSearch, setFamousSearch] = useState("");
  const [famousRoleFilter, setFamousRoleFilter] = useState<"Todos" | "Canon" | "Legends">("Todos");

  function regenerate() { setForm(randomNpc()); }
  function switchMode(m: "random" | "manual" | "famous") { setMode(m); setForm(m === "random" ? randomNpc() : emptyNpc()); }
  async function saveNpc() {
    if (!form.name.trim()) return;
    await api.addChild("npcs", { ...form, attacks: JSON.stringify(form.attacks), skills: JSON.stringify(form.skills) });
    setForm(mode === "random" ? randomNpc() : emptyNpc());
  }
  function deleteNpc(id: string) { api.removeChild("npcs", id); if (expanded === id) setExpanded(null); }
  function addAttack() { if (!newAtk.name.trim()) return; setForm({ ...form, attacks: [...form.attacks, { ...newAtk }] }); setNewAtk({ name: "", bonus: "", damage: "", description: "" }); }
  function removeAttack(i: number) { setForm({ ...form, attacks: form.attacks.filter((_, j) => j !== i) }); }
  function addSkill() {
    if (!newSkillId || form.skills.some((s) => s.skillId === newSkillId)) return;
    setForm({ ...form, skills: [...form.skills, { skillId: newSkillId, value: SKILL_GRADE_BONUS[newSkillGrade] }] });
    setNewSkillId("");
  }
  function removeSkill(skillId: string) { setForm({ ...form, skills: form.skills.filter((s) => s.skillId !== skillId) }); }

  const filteredFamous = useMemo(() => {
    return FAMOUS_CHARACTERS.filter((c) => {
      if (famousRoleFilter !== "Todos" && c.source !== famousRoleFilter) return false;
      if (famousSearch) {
        const q = famousSearch.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.role.toLowerCase().includes(q) && !c.species.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [famousSearch, famousRoleFilter]);
  async function addToInitiative(npc: StarWarsNpc) {
    const initiative = addInitValue !== "" ? Number(addInitValue) : rollD20();
    await api.addChild("combatants", { name: npc.name, initiative, pv: npc.pv, maxPv: npc.pv, pe: null, maxPe: null, conditions: "[]", isPlayer: false, order: api.campaign.starWarsCombatants.length });
    setAddInitTarget(null); setAddInitValue("");
  }

  const inputStyle: React.CSSProperties = { padding: "8px 10px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", width: "100%", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.68rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 };
  const sectionLabel: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 };

  function textField(label: string, key: keyof NpcForm, opts?: { list?: string[] }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={labelStyle}>{label}</label>
        {opts?.list ? (
          <select value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle}>
            <option value="">Selecionar...</option>{opts.list.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
        )}
      </div>
    );
  }
  function numField(label: string, key: keyof NpcForm) {
    return (
      <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ ...labelStyle, textAlign: "center" }}>{label}</label>
        <input type="number" min="0" max="10" placeholder="—" value={(form[key] as number | null) ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value ? Number(e.target.value) : null })} style={{ ...inputStyle, textAlign: "center", padding: "8px 6px" }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: SW.panel, border: `1px solid ${SW.panelBorder}`, borderRadius: "var(--radius-xl)", padding: 4, width: "fit-content" }}>
        {(["random", "manual", "famous"] as const).map((m) => (
          <button key={m} onClick={() => switchMode(m)} style={{ padding: "7px 18px", background: mode === m ? ACCENT_DIM : "transparent", color: mode === m ? ACCENT_LIGHT : "var(--text-muted)", border: mode === m ? `1px solid ${ACCENT_BORD}` : "1px solid transparent", borderRadius: "var(--radius-lg)", fontSize: "0.82rem", fontWeight: mode === m ? 700 : 500, cursor: "pointer" }}>{m === "random" ? "Aleatório" : m === "manual" ? "Manual" : "Personagens Famosos"}</button>
        ))}
      </div>

      {mode === "famous" && (
        <div style={{ padding: "20px", background: SW.panel, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", marginBottom: 20, boxShadow: `0 0 24px ${SW.glow}, inset 0 1px 0 rgba(255,255,255,0.03)` }}>
          <p style={sectionLabel}>Escolha um personagem <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(Canon e Legends) — carrega os stats abaixo pra ajustar e salvar</span></p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <input value={famousSearch} onChange={(e) => setFamousSearch(e.target.value)} placeholder="Buscar nome, papel ou espécie..."
              style={{ flex: 1, minWidth: 180, padding: "8px 12px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem" }} />
            <select value={famousRoleFilter} onChange={(e) => setFamousRoleFilter(e.target.value as "Todos" | "Canon" | "Legends")}
              style={{ padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", cursor: "pointer" }}>
              <option value="Todos">Canon e Legends</option>
              <option value="Canon">Só Canon</option>
              <option value="Legends">Só Legends</option>
            </select>
          </div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginBottom: 10 }}>{filteredFamous.length} de {FAMOUS_CHARACTERS.length} personagens</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8, maxHeight: 360, overflowY: "auto" }}>
            {filteredFamous.map((c) => (
              <button key={c.name} onClick={() => setForm(loadFamous(c))} style={{ textAlign: "left", padding: "10px 12px", background: form.name === c.name ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${form.name === c.name ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius)", cursor: "pointer" }}>
                <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>{c.name}</p>
                <p style={{ fontSize: "0.7rem", color: ACCENT_LIGHT }}>{c.role} · Nível {c.level}</p>
                <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>{c.species} · {c.source} · PV {c.pv}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: "24px", background: SW.panel, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", marginBottom: 28, boxShadow: `0 0 24px ${SW.glow}, inset 0 1px 0 rgba(255,255,255,0.03)` }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
          {textField("Nome", "name")}
          {textField("Espécie", "species", { list: mode === "manual" ? SPECIES_NAMES : undefined })}
          {textField("Papel / Classe", "role", { list: mode === "manual" ? ROLES : undefined })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {textField("Personalidade", "personality")}
          {textField("Descrição / Aparência", "description")}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Notas</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Motivações, segredos, conexões..." style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ borderTop: `1px solid ${ACCENT_BORD}`, paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Estatísticas de Combate <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></p>
          <div style={{ marginBottom: 12, maxWidth: 200 }}>{numField("PV Máx.", "pv")}</div>
          <div className="sw-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>{ATTR_LABELS.map(({ key, label }) => numField(label, key))}</div>
        </div>

        <div style={{ borderTop: `1px solid ${ACCENT_BORD}`, paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Perícias <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional{mode !== "manual" ? " — geradas automaticamente, pode ajustar" : ""})</span></p>
          {form.skills.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {form.skills.map((s) => (
                <div key={s.skillId} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 6px 5px 10px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text)" }}>{SKILL_BY_ID[s.skillId]?.name ?? s.skillId}</span>
                  <span style={{ fontSize: "0.72rem", color: ACCENT_LIGHT, fontWeight: 700 }}>+{s.value}</span>
                  <button onClick={() => removeSkill(s.skillId)} style={{ padding: "1px 5px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.75rem" }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={labelStyle}>Perícia</label>
              <select value={newSkillId} onChange={(e) => setNewSkillId(e.target.value)} style={inputStyle}>
                <option value="">Selecionar...</option>
                {SKILLS.filter((sk) => !form.skills.some((s) => s.skillId === sk.id)).map((sk) => <option key={sk.id} value={sk.id}>{sk.name}</option>)}
              </select>
            </div>
            <div style={{ width: 140 }}>
              <label style={labelStyle}>Grau</label>
              <select value={newSkillGrade} onChange={(e) => setNewSkillGrade(e.target.value as SkillGrade)} style={inputStyle}>
                {SKILL_GRADE_ORDER.map((g) => <option key={g} value={g}>{SKILL_GRADE_LABEL[g]} (+{SKILL_GRADE_BONUS[g]})</option>)}
              </select>
            </div>
            <button onClick={addSkill} disabled={!newSkillId} style={{ padding: "8px 14px", background: newSkillId ? ACCENT_DIM : "var(--surface-2)", color: newSkillId ? ACCENT_LIGHT : "var(--text-subtle)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: newSkillId ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>+ Perícia</button>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${ACCENT_BORD}`, paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Ataques <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></p>
          {form.attacks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {form.attacks.map((atk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>{atk.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{atk.bonus && <span style={{ color: ACCENT_LIGHT }}>{atk.bonus}</span>}{atk.bonus && atk.damage && " · "}{atk.damage && <span>{atk.damage}</span>}{atk.description && <span style={{ color: "var(--text-subtle)" }}> — {atk.description}</span>}</p>
                  </div>
                  <button onClick={() => removeAttack(i)} style={{ padding: "3px 7px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.75rem" }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div className="sw-npc-attack-grid" style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px", gap: 8, marginBottom: 8 }}>
            <div><label style={labelStyle}>Nome do Ataque</label><input value={newAtk.name} onChange={(e) => setNewAtk({ ...newAtk, name: e.target.value })} placeholder="Ex: Rifle Blaster" style={inputStyle} /></div>
            <div><label style={labelStyle}>Bônus</label><input value={newAtk.bonus} onChange={(e) => setNewAtk({ ...newAtk, bonus: e.target.value })} placeholder="+5" style={inputStyle} /></div>
            <div><label style={labelStyle}>Dano</label><input value={newAtk.damage} onChange={(e) => setNewAtk({ ...newAtk, damage: e.target.value })} placeholder="3d6" style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Descrição do Ataque</label><input value={newAtk.description} onChange={(e) => setNewAtk({ ...newAtk, description: e.target.value })} placeholder="Ex: À distância, longo alcance" style={inputStyle} /></div>
            <button onClick={addAttack} disabled={!newAtk.name.trim()} style={{ padding: "8px 14px", background: newAtk.name.trim() ? ACCENT_DIM : "var(--surface-2)", color: newAtk.name.trim() ? ACCENT_LIGHT : "var(--text-subtle)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: newAtk.name.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>+ Ataque</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveNpc} disabled={!form.name.trim()} style={{ padding: "10px 22px", background: form.name.trim() ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)` : "var(--surface-2)", color: form.name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: form.name.trim() ? "pointer" : "not-allowed" }}>+ Adicionar NPC</button>
          {mode === "random" && <button onClick={regenerate} style={{ padding: "10px 18px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.86rem", cursor: "pointer" }}>Aleatório</button>}
        </div>
      </div>

      {npcs.length === 0 ? (
        <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "32px 0" }}>Nenhum NPC adicionado ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>{npcs.length} NPC{npcs.length !== 1 ? "s" : ""}</p>
          {npcs.map((npc) => {
            const attacks = parseAttacks(npc.attacks);
            const skills = parseSkills(npc.skills);
            return (
              <div key={npc.id} style={{ background: SW.panel, border: `1px solid ${SW.panelBorder}`, borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer", gap: 10 }} onClick={() => setExpanded(expanded === npc.id ? null : npc.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "var(--radius)", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT_LIGHT, fontSize: "0.9rem", flexShrink: 0 }}>{npc.species?.[0] ?? "N"}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{npc.name}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{[npc.species, npc.role].filter(Boolean).join(" · ")}{npc.pv && <span style={{ color: ACCENT_LIGHT }}>{` · PV ${npc.pv}`}</span>}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); if (addInitTarget === npc.id) { setAddInitTarget(null); return; } setAddInitTarget(npc.id); setAddInitValue(""); }} style={{ padding: "5px 10px", background: addInitTarget === npc.id ? ACCENT_GLOW : ACCENT_DIM, color: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>⚔ Iniciativa</button>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>{expanded === npc.id ? "▲" : "▼"}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteNpc(npc.id); }} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>×</button>
                  </div>
                </div>

                {addInitTarget === npc.id && (
                  <div onClick={(e) => e.stopPropagation()} style={{ padding: "12px 16px", borderTop: `1px solid ${ACCENT_BORD}`, background: ACCENT_DIM }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8 }}>Valor de Iniciativa <span style={{ color: "var(--text-subtle)" }}>(vazio = d20)</span></p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" value={addInitValue} onChange={(e) => setAddInitValue(e.target.value)} placeholder="Rolar d20" autoFocus style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && addToInitiative(npc)} />
                      <button onClick={() => addToInitiative(npc)} style={{ padding: "8px 14px", background: ACCENT_DIM, color: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Adicionar</button>
                      <button onClick={() => setAddInitTarget(null)} style={{ padding: "8px 12px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.82rem", cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                )}

                {expanded === npc.id && (
                  <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border)" }}>
                    {ATTR_LABELS.some(({ key }) => npc[key] !== null) && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Atributos</p>
                        <div className="sw-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                          {ATTR_LABELS.map(({ key, label }) => (
                            <div key={key} style={{ textAlign: "center", padding: "6px 4px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</p>
                              <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{npc[key] ?? "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      {npc.personality && <div><p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Personalidade</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.personality}</p></div>}
                      {npc.description && <div><p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Descrição</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.description}</p></div>}
                    </div>
                    {npc.notes && <div style={{ marginBottom: 10 }}><p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Notas</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.notes}</p></div>}
                    {skills.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Perícias</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {skills.map((s) => (
                            <span key={s.skillId} style={{ fontSize: "0.76rem", padding: "3px 9px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                              {SKILL_BY_ID[s.skillId]?.name ?? s.skillId} <strong style={{ color: ACCENT_LIGHT }}>+{s.value}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {attacks.length > 0 && (
                      <div>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ataques</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {attacks.map((atk, i) => (
                            <div key={i} style={{ padding: "7px 10px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{atk.name}{atk.bonus && <span style={{ color: ACCENT_LIGHT, fontWeight: 400 }}> · {atk.bonus}</span>}{atk.damage && <span style={{ color: ACCENT, fontWeight: 400 }}> · {atk.damage}</span>}</p>
                              {atk.description && <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>{atk.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
