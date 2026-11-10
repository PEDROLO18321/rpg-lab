// ─── CYBERPUNK RED — bestiário do Mestre (capangas e chefes do livro-base) ───
// Fichas rápidas. `skillBases` já traz ATRIBUTO + perícia somados (é só rolar
// + 1d10). HP, limiar e salvaguarda estão como impressos: o livro usa HP fixo
// por tipo de capanga, então eles NÃO seguem sempre a fórmula de jogador.
// Valores marcados com `armorPenalty` são os impressos sem a penalidade da
// armadura. Armas e equipamentos são texto livre. Sem I/O.

import type { Stats } from "./data";

export type ThreatTier = "mook" | "lieutenant" | "miniboss" | "boss";

export const THREAT_LABEL: Record<ThreatTier, string> = {
  mook: "Capanga",
  lieutenant: "Tenente",
  miniboss: "Chefe Menor",
  boss: "Chefe",
};

export interface BestiaryWeapon { name: string; damage: string; poor?: boolean }

export interface BestiaryEntry {
  key: string;
  name: string;
  nameEn: string;
  tier: ThreatTier;
  /** Sem SORTE: capangas do livro não usam. */
  stats: Omit<Stats, "luck">;
  hp: number;
  seriousThreshold: number;
  deathSave: number;
  spHead: number;
  spBody: number;
  armorName: string;
  /** Penalidade a REF/DES/MOV da armadura, já fora dos valores de `stats`. */
  armorPenalty: number;
  weapons: BestiaryWeapon[];
  /** Habilidade de papel própria, quando houver (ex.: Interface 4). */
  roleAbility?: { name: string; rank: number };
  skillBases: Record<string, number>;
  gear: string[];
  cyberware: string[];
  /** Programas do ciberdeck (só netrunner). */
  programs?: string[];
}

const st = (int: number, ref: number, dex: number, tech: number, cool: number, will: number, move: number, body: number, emp: number) =>
  ({ int, ref, dex, tech, cool, will, move, body, emp });

export const BESTIARY: BestiaryEntry[] = [
  {
    key: "bodyguard", name: "Guarda-costas", nameEn: "Bodyguard", tier: "mook",
    stats: st(3, 6, 5, 2, 4, 4, 4, 6, 3), hp: 35, seriousThreshold: 18, deathSave: 6,
    spHead: 7, spBody: 7, armorName: "Kevlar", armorPenalty: 0,
    weapons: [{ name: "Escopeta", damage: "5d6", poor: true }, { name: "Pistola Muito Pesada", damage: "4d6" }],
    skillBases: { athletics: 9, brawling: 11, concentration: 6, conversation: 5, driveLand: 10, education: 5, endurance: 9, evasion: 7, firstAid: 4, handgun: 10, humanPerception: 5, interrogation: 6, "language:native": 5, "language:streetslang": 5, "localExpert:yourHome": 5, perception: 9, persuasion: 6, resistTorture: 8, shoulderArms: 10, stealth: 7 },
    gear: ["Projéteis ×25", "Munição de pistola muito pesada ×25", "Comunicador de rádio"], cyberware: [],
  },
  {
    key: "boosterganger", name: "Boosterganger", nameEn: "Boosterganger", tier: "mook",
    stats: st(2, 6, 5, 2, 4, 2, 4, 4, 3), hp: 20, seriousThreshold: 10, deathSave: 4,
    spHead: 4, spBody: 4, armorName: "Couro", armorPenalty: 0,
    weapons: [{ name: "Pistola Muito Pesada", damage: "4d6", poor: true }, { name: "Rippers", damage: "2d6" }],
    skillBases: { athletics: 9, brawling: 9, concealReveal: 4, concentration: 4, conversation: 5, driveLand: 10, education: 4, endurance: 6, evasion: 7, firstAid: 4, handgun: 12, humanPerception: 5, interrogation: 6, "language:native": 4, "language:streetslang": 4, "localExpert:yourHome": 4, meleeWeapon: 11, perception: 6, persuasion: 6, resistTorture: 4, stealth: 7 },
    gear: ["Munição de pistola muito pesada ×30", "Celular descartável", "Techhair"], cyberware: ["Rippers"],
  },
  {
    key: "roadGanger", name: "Gangue de Estrada", nameEn: "Road Ganger", tier: "mook",
    stats: st(4, 6, 4, 4, 3, 3, 3, 3, 3), hp: 25, seriousThreshold: 13, deathSave: 3,
    spHead: 4, spBody: 4, armorName: "Couro", armorPenalty: 0,
    weapons: [{ name: "Pistola Muito Pesada", damage: "4d6" }, { name: "Besta", damage: "4d6" }, { name: "Arma Branca Leve", damage: "1d6", poor: true }],
    skillBases: { archery: 10, athletics: 10, brawling: 6, concentration: 5, conversation: 6, driveLand: 12, education: 6, endurance: 5, evasion: 6, firstAid: 6, handgun: 10, humanPerception: 5, landVehicleTech: 10, "language:native": 6, "language:streetslang": 6, "localExpert:yourHome": 6, meleeWeapon: 8, perception: 6, persuasion: 5, stealth: 8, tracking: 8, wildernessSurvival: 8 },
    gear: ["Munição de pistola muito pesada ×20", "Flechas ×20", "Corda", "Lanterna"], cyberware: ["Neural Link (Plugues de Interface)"],
  },
  {
    key: "securityOperative", name: "Operador de Segurança", nameEn: "Security Operative", tier: "mook",
    stats: st(3, 7, 4, 2, 2, 3, 3, 5, 3), hp: 30, seriousThreshold: 15, deathSave: 5,
    spHead: 7, spBody: 7, armorName: "Kevlar", armorPenalty: 0,
    weapons: [{ name: "Fuzil de Assalto", damage: "5d6", poor: true }, { name: "Arma Branca Média", damage: "2d6" }, { name: "Pistola Muito Pesada", damage: "4d6" }],
    skillBases: { athletics: 8, autofire: 10, brawling: 6, concentration: 7, conversation: 5, education: 5, evasion: 6, firstAid: 4, handgun: 10, humanPerception: 5, interrogation: 6, "language:native": 5, "language:streetslang": 5, "localExpert:yourHome": 5, meleeWeapon: 6, perception: 5, persuasion: 4, resistTorture: 5, shoulderArms: 10, stealth: 6 },
    gear: ["Munição de fuzil ×40", "Munição de pistola muito pesada ×20", "Comunicador de rádio"], cyberware: [],
  },
  {
    key: "netrunnerNpc", name: "Netrunner", nameEn: "Netrunner", tier: "lieutenant",
    stats: st(7, 5, 4, 7, 4, 5, 5, 3, 4), hp: 30, seriousThreshold: 15, deathSave: 3,
    spHead: 11, spBody: 11, armorName: "Traje Bodyweight", armorPenalty: 0,
    weapons: [{ name: "Pistola Muito Pesada", damage: "4d6", poor: true }],
    roleAbility: { name: "Interface", rank: 4 },
    skillBases: { athletics: 9, basicTech: 13, brawling: 6, concealReveal: 11, concentration: 9, conversation: 6, cryptography: 11, deduction: 11, education: 11, electronicsSecurity: 11, evasion: 6, firstAid: 9, forgery: 13, handgun: 10, humanPerception: 6, "language:native": 9, "language:streetslang": 9, "localExpert:yourHome": 13, librarySearch: 9, perception: 11, persuasion: 6, pickLock: 11, resistTorture: 7, stealth: 8 },
    gear: ["Munição de pistola muito pesada ×50", "Lanterna", "Óculos de Virtualidade"], cyberware: ["Neural Link (Plugues de Interface)"],
    programs: ["banhammer", "deckKrash", "eraser", "hellbolt", "shield", "sword", "worm"],
  },
  {
    key: "reclaimerChief", name: "Chefe Recuperador", nameEn: "Reclaimer Chief", tier: "lieutenant",
    stats: st(3, 6, 6, 5, 4, 5, 4, 6, 4), hp: 40, seriousThreshold: 20, deathSave: 6,
    spHead: 11, spBody: 11, armorName: "Armorjack Leve", armorPenalty: 0,
    weapons: [{ name: "Escopeta", damage: "5d6", poor: true }, { name: "Arma Branca Leve", damage: "1d6" }, { name: "Pistola Pesada", damage: "3d6" }],
    skillBases: { athletics: 12, basicTech: 9, brawling: 8, concentration: 7, conversation: 6, deduction: 7, driveLand: 10, education: 5, electronicsSecurity: 9, endurance: 11, evasion: 8, firstAid: 7, handgun: 10, humanPerception: 6, landVehicleTech: 7, "language:native": 5, "language:streetslang": 5, "localExpert:yourHome": 5, meleeWeapon: 10, paramedic: 7, perception: 8, persuasion: 6, pickLock: 7, resistTorture: 10, shoulderArms: 10, stealth: 10, weaponstech: 9, wildernessSurvival: 7 },
    gear: ["Projéteis ×25", "Munição de pistola pesada ×25", "Agente", "Arpão de Escalada", "Comunicador de rádio", "Barraca", "Filtros Nasais"], cyberware: ["Neural Link (Soquete de Chips, Reforço Tátil)"],
  },
  {
    key: "securityOfficer", name: "Oficial de Segurança", nameEn: "Security Officer", tier: "lieutenant",
    // REF, DES e MOV impressos já sem a penalidade (-2) da armadura média.
    stats: st(4, 8, 6, 4, 6, 5, 6, 7, 4), hp: 40, seriousThreshold: 20, deathSave: 7,
    spHead: 13, spBody: 13, armorName: "Armorjack Médio", armorPenalty: -2,
    weapons: [{ name: "Fuzil de Assalto", damage: "5d6" }, { name: "Arma Branca Média", damage: "2d6" }, { name: "Pistola Muito Pesada", damage: "4d6" }],
    skillBases: { athletics: 10, autofire: 12, brawling: 10, concentration: 7, conversation: 6, deduction: 6, driveLand: 12, education: 6, evasion: 10, firstAid: 6, handgun: 10, humanPerception: 6, interrogation: 8, "language:native": 6, "language:streetslang": 6, "localExpert:yourHome": 6, meleeWeapon: 10, perception: 6, persuasion: 8, resistTorture: 10, shoulderArms: 10, stealth: 6 },
    gear: ["Munição de fuzil ×50", "Munição de pistola muito pesada ×30", "Escudo à Prova de Balas", "Binóculos", "Celular descartável", "Lanterna", "Algemas ×2", "Comunicador de rádio", "Rádio/Tocador"], cyberware: ["Neural Link (Kerenzikov)"],
  },
  {
    key: "outrider", name: "Batedor Nômade", nameEn: "Outrider", tier: "miniboss",
    stats: st(6, 8, 8, 3, 5, 6, 6, 6, 6), hp: 40, seriousThreshold: 20, deathSave: 6,
    spHead: 11, spBody: 11, armorName: "Armorjack Leve", armorPenalty: 0,
    weapons: [{ name: "Fuzil de Assalto", damage: "5d6" }, { name: "Arma Branca Leve", damage: "1d6" }, { name: "Pistola Muito Pesada", damage: "4d6" }],
    roleAbility: { name: "Moto", rank: 4 },
    skillBases: { animalHandling: 8, athletics: 14, autofire: 12, basicTech: 5, brawling: 14, concentration: 10, conversation: 6, criminology: 10, driveLand: 14, education: 8, endurance: 10, evasion: 14, firstAid: 5, handgun: 14, humanPerception: 8, landVehicleTech: 7, "language:native": 8, "language:streetslang": 8, "localExpert:badlands": 10, "localExpert:yourHome": 8, meleeWeapon: 12, perception: 14, persuasion: 7, resistTorture: 12, shoulderArms: 14, stealth: 12, streetwise: 9, tracking: 10 },
    gear: ["Munição de fuzil ×60", "Munição de pistola muito pesada ×40", "Algemas ×2", "Rastreadores", "Comunicador de rádio"],
    cyberware: ["Suíte de Ciberáudio (Audição Amplificada)", "Ciberolho (Mira de Precisão, TeleÓptica)", "Neural Link (Plugues de Interface)"],
  },
  {
    key: "pyro", name: "Piromaníaco", nameEn: "Pyro", tier: "miniboss",
    stats: st(5, 8, 6, 7, 4, 4, 6, 5, 3), hp: 35, seriousThreshold: 18, deathSave: 5,
    spHead: 11, spBody: 11, armorName: "Armorjack Leve", armorPenalty: 0,
    weapons: [{ name: "Lança-Chamas", damage: "3d6" }, { name: "Arma Branca Pesada", damage: "3d6" }, { name: "Pistola Pesada", damage: "3d6" }],
    roleAbility: { name: "Percepção de Combate", rank: 4 },
    skillBases: { athletics: 11, basicTech: 12, brawling: 10, concentration: 8, conversation: 5, demolitions: 13, driveLand: 10, education: 7, evasion: 13, firstAid: 9, handgun: 14, heavyWeapons: 14, humanPerception: 5, interrogation: 10, "language:native": 7, "language:streetslang": 7, "localExpert:yourHome": 7, meleeWeapon: 13, perception: 12, persuasion: 6, resistTorture: 14, "science:chemistry": 10, stealth: 10, streetwise: 8, tactics: 8 },
    gear: ["Cartuchos incendiários ×8", "Munição de pistola muito pesada ×50", "Granada incendiária", "Granada de estouro de luz", "Filtros Nasais"],
    cyberware: ["Ciberáudio (Amortecedor de Volume)", "Ciberolhos ×2 (Anti-Ofuscamento ×2)"],
  },
  {
    key: "cyberpsycho", name: "Ciberpsicopata", nameEn: "Cyberpsycho", tier: "boss",
    stats: st(5, 8, 8, 5, 4, 7, 8, 10, 0), hp: 55, seriousThreshold: 28, deathSave: 10,
    spHead: 11, spBody: 11, armorName: "Armadura Subdérmica", armorPenalty: 0,
    weapons: [{ name: "Lança-Granadas Retrátil", damage: "6d6" }, { name: "Ciberserpente", damage: "4d6" }, { name: "SMG Pesada Retrátil", damage: "3d6" }, { name: "Wolvers", damage: "3d6" }],
    skillBases: { athletics: 16, autofire: 14, basicTech: 11, brawling: 15, concentration: 6, conversation: 2, driveLand: 10, education: 7, endurance: 10, evasion: 13, firstAid: 6, handgun: 12, heavyWeapons: 14, humanPerception: 2, interrogation: 13, "language:native": 7, "language:streetslang": 7, "localExpert:yourHome": 7, meleeWeapon: 17, perception: 9, persuasion: 6, resistTorture: 15, stealth: 10, tracking: 10 },
    gear: ["Granada perfurante ×2", "Munição de pistola pesada ×100"],
    cyberware: ["Ciberbraços ×2 (Lança-Granadas Retrátil ×2, SMG Pesada Retrátil, Wolvers)", "Ciberpernas ×2 (Impulsor de Salto)", "Ciberserpente", "Músculo Enxertado e Rendado nos Ossos", "Neural Link (Soquete de Chips, Editor de Dor)", "Armadura Subdérmica"],
  },
];

export const BESTIARY_MAP: Record<string, BestiaryEntry> = Object.fromEntries(BESTIARY.map((b) => [b.key, b]));

export function getBestiaryEntry(key: string): BestiaryEntry | undefined {
  return BESTIARY_MAP[key];
}

/** Valores de CyberpunkNpc a partir de uma entrada do bestiário (SORTE fixa em 0). */
export function bestiaryToNpcDraft(e: BestiaryEntry) {
  return {
    name: e.name, role: e.roleAbility ? e.roleAbility.name : "", threat: e.tier,
    hp: e.hp, hpMax: e.hp, spHead: e.spHead, spBody: e.spBody,
    ...e.stats, luck: 0,
    skills: e.skillBases, weapons: e.weapons, cyberware: e.cyberware,
  };
}
