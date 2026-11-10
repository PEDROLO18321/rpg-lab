// ─── CYBERPUNK RED — armas ───────────────────────────────────────────────────
// Catálogo do livro-base (corpo a corpo, à distância, exóticas) e uma seleção do
// Black Chrome. Itens do Black Chrome cujo nome/preço estavam ambíguos na fonte
// foram deixados de fora de propósito, em vez de chutar valores. Notas são
// paráfrases curtas. Sem I/O.

import type { RangedType, Rng } from "./rules";
import { isCritical, rollDice } from "./rules";

export type WeaponQuality = "poor" | "standard" | "excellent";
export type AmmoType = "mPistol" | "hPistol" | "vhPistol" | "rifle" | "slug" | "shell" | "arrow" | "grenade" | "rocket";

export interface WeaponDef {
  key: string;
  name: string;
  nameEn: string;
  group: "melee" | "ranged" | "exotic" | "blackChrome";
  /** Chave de perícia (data.ts SKILLS). */
  skill: string;
  /** Dados de dano, ex. "3d6". */
  damage: string;
  rof: number;
  /** Tamanho do carregador; null = sem carregador (arco, corpo a corpo). */
  mag: number | null;
  ammo: AmmoType | null;
  hands: number;
  concealable: boolean;
  cost: number;
  quality: WeaponQuality;
  /** Linha da tabela de alcance (rules.ts) para armas de tiro simples. */
  rangeClass?: RangedType;
  /** Multiplicador máximo de fogo automático (SMG 3, fuzil 4). */
  autofire?: number;
  meleeWeapon?: boolean;
  notes: string;
}

const W = (w: Omit<WeaponDef, "quality" | "notes" | "group"> & Partial<Pick<WeaponDef, "quality" | "notes" | "group">>): WeaponDef => ({
  quality: "standard", notes: "", group: "ranged", ...w,
});

// ─── Corpo a corpo (livro-base) ─────────────────────────────────────────────
export const MELEE_WEAPONS: WeaponDef[] = [
  W({ key: "lightMelee", name: "Arma Branca Leve", nameEn: "Light Melee Weapon", group: "melee", skill: "meleeWeapon", damage: "1d6", rof: 2, mag: null, ammo: null, hands: 1, concealable: true, cost: 50, meleeWeapon: true, notes: "Faca de combate, machadinha." }),
  W({ key: "mediumMelee", name: "Arma Branca Média", nameEn: "Medium Melee Weapon", group: "melee", skill: "meleeWeapon", damage: "2d6", rof: 2, mag: null, ammo: null, hands: 1, concealable: false, cost: 50, meleeWeapon: true, notes: "Taco, pé de cabra, facão." }),
  W({ key: "heavyMelee", name: "Arma Branca Pesada", nameEn: "Heavy Melee Weapon", group: "melee", skill: "meleeWeapon", damage: "3d6", rof: 2, mag: null, ammo: null, hands: 1, concealable: false, cost: 100, meleeWeapon: true, notes: "Cano de chumbo, espada, taco com pregos." }),
  W({ key: "veryHeavyMelee", name: "Arma Branca Muito Pesada", nameEn: "Very Heavy Melee Weapon", group: "melee", skill: "meleeWeapon", damage: "4d6", rof: 1, mag: null, ammo: null, hands: 2, concealable: false, cost: 500, meleeWeapon: true, notes: "Motosserra, marreta, naginata. Com CORPO 8+ dá para usar com uma mão." }),
];

// ─── Armas de fogo e arcos (livro-base) ────────────────────────────────────
export const RANGED_WEAPONS: WeaponDef[] = [
  W({ key: "mPistol", name: "Pistola Média", nameEn: "Medium Pistol", skill: "handgun", damage: "2d6", rof: 2, mag: 12, ammo: "mPistol", hands: 1, concealable: true, cost: 50, rangeClass: "pistol" }),
  W({ key: "hPistol", name: "Pistola Pesada", nameEn: "Heavy Pistol", skill: "handgun", damage: "3d6", rof: 2, mag: 8, ammo: "hPistol", hands: 1, concealable: true, cost: 100, rangeClass: "pistol" }),
  W({ key: "vhPistol", name: "Pistola Muito Pesada", nameEn: "Very Heavy Pistol", skill: "handgun", damage: "4d6", rof: 1, mag: 8, ammo: "vhPistol", hands: 1, concealable: false, cost: 100, rangeClass: "pistol" }),
  W({ key: "smg", name: "Submetralhadora", nameEn: "SMG", skill: "handgun", damage: "2d6", rof: 1, mag: 30, ammo: "mPistol", hands: 1, concealable: true, cost: 100, rangeClass: "smg", autofire: 3, notes: "Fogo automático (×3) e fogo de supressão." }),
  W({ key: "hSmg", name: "Submetralhadora Pesada", nameEn: "Heavy SMG", skill: "handgun", damage: "3d6", rof: 1, mag: 40, ammo: "hPistol", hands: 1, concealable: false, cost: 100, rangeClass: "smg", autofire: 3, notes: "Fogo automático (×3) e fogo de supressão." }),
  W({ key: "shotgun", name: "Escopeta", nameEn: "Shotgun", skill: "shoulderArms", damage: "5d6", rof: 1, mag: 4, ammo: "slug", hands: 2, concealable: false, cost: 500, rangeClass: "shotgun", notes: "Modo cartucho: 3d6 em área à frente, um só dano para todos." }),
  W({ key: "assaultRifle", name: "Fuzil de Assalto", nameEn: "Assault Rifle", skill: "shoulderArms", damage: "5d6", rof: 1, mag: 25, ammo: "rifle", hands: 2, concealable: false, cost: 500, rangeClass: "assaultRifle", autofire: 4, notes: "Fogo automático (×4) e fogo de supressão." }),
  W({ key: "sniperRifle", name: "Rifle de Precisão", nameEn: "Sniper Rifle", skill: "shoulderArms", damage: "5d6", rof: 1, mag: 4, ammo: "rifle", hands: 2, concealable: false, cost: 500, rangeClass: "sniperRifle" }),
  W({ key: "bow", name: "Arco e Besta", nameEn: "Bows & Crossbows", skill: "archery", damage: "4d6", rof: 1, mag: null, ammo: "arrow", hands: 2, concealable: false, cost: 100, rangeClass: "bow", notes: "Não precisa de ação de recarga; flechas básicas podem ser recuperadas." }),
  W({ key: "grenadeLauncher", name: "Lança-Granadas", nameEn: "Grenade Launcher", skill: "heavyWeapons", damage: "6d6", rof: 1, mag: 2, ammo: "grenade", hands: 2, concealable: false, cost: 500, rangeClass: "grenadeLauncher", notes: "Explosivo: área de 10×10 m, um dano para todos." }),
  W({ key: "rocketLauncher", name: "Lança-Foguetes", nameEn: "Rocket Launcher", skill: "heavyWeapons", damage: "8d6", rof: 1, mag: 1, ammo: "rocket", hands: 2, concealable: false, cost: 500, rangeClass: "rocketLauncher", notes: "Explosivo: área de 10×10 m, um dano para todos." }),
];

// ─── Exóticas (livro-base) ──────────────────────────────────────────────────
// Qualidade padrão e incompatíveis com acessórios/munição especial, salvo nota.
export const EXOTIC_WEAPONS: WeaponDef[] = [
  W({ key: "airPistol", name: "Pistola de Ar", nameEn: "Air Pistol", group: "exotic", skill: "handgun", damage: "4d6", rof: 1, mag: 8, ammo: "vhPistol", hands: 1, concealable: false, cost: 100, notes: "Dispara bolas de tinta ou ácido." }),
  W({ key: "battleglove", name: "Luva de Batalha", nameEn: "Battleglove", group: "exotic", skill: "brawling", damage: "3d6", rof: 2, mag: null, ammo: null, hands: 1, concealable: false, cost: 1000, notes: "Manopla pesada com três encaixes de opção de ciberbraço." }),
  W({ key: "hurricane", name: "Arma de Assalto Hurricane (Constitution Arms)", nameEn: "Constitution Arms Hurricane Assault Weapon", group: "exotic", skill: "shoulderArms", damage: "5d6", rof: 2, mag: 4, ammo: "slug", hands: 2, concealable: false, cost: 5000, rangeClass: "shotgun", notes: "Escopeta com ROF 2; exige CORPO 11+." }),
  W({ key: "dartgun", name: "Pistola de Dardos", nameEn: "Dartgun", group: "exotic", skill: "handgun", damage: "4d6", rof: 1, mag: 8, ammo: "arrow", hands: 1, concealable: false, cost: 100, notes: "Dispara flechas especiais (não básicas)." }),
  W({ key: "flamethrower", name: "Lança-Chamas", nameEn: "Flamethrower", group: "exotic", skill: "heavyWeapons", damage: "5d6", rof: 1, mag: 4, ammo: "shell", hands: 2, concealable: false, cost: 500, notes: "Escopeta que dispara cartuchos incendiários." }),
  W({ key: "monoThree", name: "Kendachi Mono-Three", nameEn: "Kendachi Mono-Three", group: "exotic", skill: "meleeWeapon", damage: "4d6", rof: 1, mag: null, ammo: null, hands: 2, concealable: false, cost: 5000, meleeWeapon: true, notes: "Ignora armadura com PA menor que 11." }),
  W({ key: "malorian3516", name: "Malorian Arms 3516", nameEn: "Malorian Arms 3516", group: "exotic", skill: "handgun", damage: "5d6", rof: 1, mag: 8, ammo: "vhPistol", hands: 1, concealable: false, cost: 10000, quality: "excellent", rangeClass: "pistol", notes: "Pistola muito pesada de qualidade excelente (super luxo)." }),
  W({ key: "microwaver", name: "Microondas Portátil", nameEn: "Microwaver", group: "exotic", skill: "handgun", damage: "4d6", rof: 1, mag: 8, ammo: "vhPistol", hands: 1, concealable: false, cost: 500, notes: "Pode desativar ciberware e eletrônicos." }),
  W({ key: "cowboyU56", name: "Militech \"Cowboy\" U-56", nameEn: "Militech \"Cowboy\" U-56 Grenade Launcher", group: "exotic", skill: "heavyWeapons", damage: "6d6", rof: 2, mag: 2, ammo: "grenade", hands: 2, concealable: false, cost: 5000, rangeClass: "grenadeLauncher", notes: "Lança-granadas com ROF 2; exige CORPO 11+." }),
  W({ key: "emg86", name: "Rhinemetall EMG-86 Railgun", nameEn: "Rhinemetall EMG-86 Railgun", group: "exotic", skill: "heavyWeapons", damage: "5d6", rof: 1, mag: 25, ammo: "rifle", hands: 2, concealable: false, cost: 5000, notes: "Ignora armadura com PA menor que 11; exige CORPO 11+." }),
  W({ key: "shrieker", name: "Gritador", nameEn: "Shrieker", group: "exotic", skill: "handgun", damage: "4d6", rof: 1, mag: 8, ammo: "vhPistol", hands: 1, concealable: false, cost: 500, notes: "Causa o ferimento Ouvido Danificado." }),
  W({ key: "stunBaton", name: "Bastão de Choque", nameEn: "Stun Baton", group: "exotic", skill: "meleeWeapon", damage: "2d6", rof: 2, mag: null, ammo: null, hands: 1, concealable: false, cost: 100, meleeWeapon: true, notes: "Arma branca média não letal." }),
  W({ key: "stunGun", name: "Pistola de Choque", nameEn: "Stun Gun", group: "exotic", skill: "handgun", damage: "3d6", rof: 2, mag: 8, ammo: "hPistol", hands: 1, concealable: true, cost: 100, notes: "Pistola pesada não letal." }),
  W({ key: "helix", name: "Tsunami Arms Helix", nameEn: "Tsunami Arms Helix", group: "exotic", skill: "autofire", damage: "5d6", rof: 1, mag: 25, ammo: "rifle", hands: 2, concealable: false, cost: 5000, notes: "Só dispara em fogo automático, com multiplicador maior; exige CORPO 11+." }),
];

// ─── Black Chrome (apenas itens com nome e preço confirmados) ──────────────
export const BLACK_CHROME_WEAPONS: WeaponDef[] = [
  W({ key: "bcWeepingReaver", name: "Katana Weeping Reaver (Arasaka)", nameEn: "Arasaka Weeping Reaver Katana", group: "blackChrome", skill: "meleeWeapon", damage: "4d6", rof: 2, mag: null, ammo: null, hands: 1, concealable: false, cost: 5000, quality: "excellent", meleeWeapon: true, notes: "Pode ser revestida com fluidos especiais." }),
  W({ key: "bcMagnaKnuckles", name: "Magna Knuckles (Faisal)", nameEn: "Faisal's Magna Knuckles", group: "blackChrome", skill: "brawling", damage: "2d6", rof: 2, mag: null, ammo: null, hands: 1, concealable: false, cost: 1000, notes: "Pode desativar ciberware após dois acertos; usa bateria." }),
  W({ key: "bcMonoGuard", name: "Mono-Guard (Kendachi)", nameEn: "Kendachi Mono-Guard", group: "blackChrome", skill: "meleeWeapon", damage: "3d6", rof: 2, mag: null, ammo: null, hands: 1, concealable: true, cost: 1000, meleeWeapon: true, notes: "Maior chance de ferimento crítico." }),
  W({ key: "bcMonoKatana", name: "Mono-Katana (Kendachi)", nameEn: "Kendachi Mono-Katana", group: "blackChrome", skill: "meleeWeapon", damage: "4d6", rof: 1, mag: null, ammo: null, hands: 2, concealable: false, cost: 1000, meleeWeapon: true, notes: "Ignora armadura com PA menor que 7." }),
  W({ key: "bcMonoWakizashi", name: "Mono-Wakizashi (Kendachi)", nameEn: "Kendachi Mono-Wakizashi", group: "blackChrome", skill: "meleeWeapon", damage: "3d6", rof: 2, mag: null, ammo: null, hands: 1, concealable: false, cost: 1000, meleeWeapon: true, notes: "Ignora armadura com PA menor que 7." }),
  W({ key: "bcKleaver", name: "Kleaver (Rostovi)", nameEn: "Rostovi Kleaver", group: "blackChrome", skill: "meleeWeapon", damage: "4d6", rof: 1, mag: null, ammo: null, hands: 2, concealable: false, cost: 1000, meleeWeapon: true, notes: "Exige CORPO 11+; carregada, causa 5d6 com fogo." }),
  W({ key: "bcFangFist", name: "FangFist (SlamDance)", nameEn: "SlamDance FangFist", group: "blackChrome", skill: "meleeWeapon", damage: "2d6", rof: 2, mag: null, ammo: null, hands: 1, concealable: false, cost: 1000, quality: "excellent", meleeWeapon: true, notes: "Com a lâmina virada, age como arma muito pesada (4d6, ROF 1)." }),
  W({ key: "bcVariableAR", name: "Fuzil Variável Protótipo (Arasaka)", nameEn: "Arasaka Prototype Variable AR", group: "blackChrome", skill: "shoulderArms", damage: "5d6", rof: 1, mag: 25, ammo: "rifle", hands: 2, concealable: false, cost: 15000, quality: "excellent", rangeClass: "assaultRifle", autofire: 4, notes: "Modo railgun ignora PA menor que 7." }),
  W({ key: "bcPublicDefender", name: "Public Defender (E-TACK)", nameEn: "E-TACK Public Defender", group: "blackChrome", skill: "handgun", damage: "3d6", rof: 2, mag: 8, ammo: "hPistol", hands: 1, concealable: true, cost: 500, quality: "poor", rangeClass: "pistol", notes: "Smartgun; alterna entre letal e não letal." }),
  W({ key: "bcSurvivalist", name: "Survivalist (Eagletech)", nameEn: "Eagletech Survivalist", group: "blackChrome", skill: "archery", damage: "4d6", rof: 1, mag: null, ammo: "arrow", hands: 2, concealable: false, cost: 500, rangeClass: "bow", notes: "Arco combinado com rifle (5d6) e luneta." }),
  W({ key: "bcDeadOrAlive", name: "Dead or Alive (Faisal)", nameEn: "Faisal's Dead or Alive", group: "blackChrome", skill: "shoulderArms", damage: "5d6", rof: 1, mag: 4, ammo: "slug", hands: 2, concealable: false, cost: 500, quality: "poor", rangeClass: "shotgun", notes: "Escopeta com lançador de rede acoplado." }),
  W({ key: "bcPepperShaker", name: "Pepper Shaker (Federated Arms)", nameEn: "Federated Arms Pepper Shaker", group: "blackChrome", skill: "autofire", damage: "2d6", rof: 1, mag: 30, ammo: "mPistol", hands: 1, concealable: true, cost: 500, autofire: 3, notes: "Só fogo automático e supressão; gasta 6 balas por rajada." }),
  W({ key: "bcMatchmaker", name: "Matchmaker (Georgia Arms)", nameEn: "Georgia Arms Matchmaker", group: "blackChrome", skill: "shoulderArms", damage: "5d6", rof: 1, mag: 1, ammo: "slug", hands: 2, concealable: false, cost: 20, quality: "poor", rangeClass: "shotgun" }),
  W({ key: "bcBubbaBuster", name: "Bubba Buster (GunMart)", nameEn: "GunMart Bubba Buster", group: "blackChrome", skill: "shoulderArms", damage: "5d6", rof: 1, mag: 4, ammo: "slug", hands: 2, concealable: false, cost: 50, quality: "poor", rangeClass: "shotgun", notes: "Autodestrói se disparada 3 vezes por minuto." }),
  W({ key: "bcEngageRocket", name: "Foguete Engage (GunMart)", nameEn: "GunMart Engage Rocket Launcher", group: "blackChrome", skill: "heavyWeapons", damage: "8d6", rof: 1, mag: 1, ammo: "rocket", hands: 2, concealable: false, cost: 100, quality: "poor", rangeClass: "rocketLauncher", notes: "Pré-carregado; explode em um 1 natural." }),
  W({ key: "bcSmartSpecial", name: "Smart Special (GunMart)", nameEn: "GunMart Smart Special", group: "blackChrome", skill: "handgun", damage: "3d6", rof: 2, mag: 8, ammo: "hPistol", hands: 1, concealable: true, cost: 100, quality: "poor", rangeClass: "pistol", notes: "Smartgun; quebra em um 1 natural." }),
  W({ key: "bcGunmartSpecial", name: "Special (GunMart)", nameEn: "GunMart Special", group: "blackChrome", skill: "handgun", damage: "3d6", rof: 2, mag: 8, ammo: "hPistol", hands: 1, concealable: true, cost: 20, quality: "poor", rangeClass: "pistol", notes: "Quebra em um 1 natural." }),
  W({ key: "bcBeastShotgun", name: "Beast Shotgun (Midnight Arms)", nameEn: "Midnight Arms Beast Shotgun", group: "blackChrome", skill: "shoulderArms", damage: "5d6", rof: 1, mag: 40, ammo: "slug", hands: 2, concealable: false, cost: 1000, rangeClass: "shotgun", notes: "Exige CORPO 10+; recarga custa 2 ações." }),
  W({ key: "bcFox", name: "Fox (Militech)", nameEn: "Militech Fox Dual Ammo Pistol", group: "blackChrome", skill: "handgun", damage: "3d6", rof: 2, mag: 10, ammo: "hPistol", hands: 1, concealable: true, cost: 1000, rangeClass: "pistol", notes: "Dois carregadores com tipos de munição diferentes." }),
  W({ key: "bcPerseus", name: "Perseus (Militech)", nameEn: "Militech Perseus", group: "blackChrome", skill: "handgun", damage: "4d6", rof: 1, mag: 11, ammo: "vhPistol", hands: 1, concealable: false, cost: 5000, quality: "excellent", rangeClass: "pistol", notes: "ROF 2 se disparada na rodada anterior." }),
  W({ key: "bcHelloCutie", name: "Hello Cutie Ultra-K8 (Sanroo)", nameEn: "Sanroo Hello Cutie Ultra-K8", group: "blackChrome", skill: "handgun", damage: "4d6", rof: 1, mag: 30, ammo: "vhPistol", hands: 1, concealable: false, cost: 5000, quality: "excellent", rangeClass: "pistol", notes: "Alterna entre pistola muito pesada e submetralhadora pesada (3d6)." }),
  W({ key: "bcGlamRifle", name: "Glam Rifle (Superchrome)", nameEn: "Superchrome Glam Rifle", group: "blackChrome", skill: "shoulderArms", damage: "5d6", rof: 1, mag: 25, ammo: "rifle", hands: 2, concealable: false, cost: 1000, rangeClass: "assaultRifle", autofire: 4, notes: "+2 em Guarda-Roupa e Estilo." }),
  W({ key: "bcJavelin", name: "Javelin (Superchrome)", nameEn: "Superchrome Javelin", group: "blackChrome", skill: "shoulderArms", damage: "5d6", rof: 1, mag: 4, ammo: "rifle", hands: 2, concealable: false, cost: 1000, rangeClass: "sniperRifle", notes: "+2 em Guarda-Roupa e Estilo." }),
  W({ key: "bcSidearm", name: "Sidearm (Superchrome)", nameEn: "Superchrome Sidearm", group: "blackChrome", skill: "handgun", damage: "4d6", rof: 1, mag: 8, ammo: "vhPistol", hands: 1, concealable: false, cost: 1000, rangeClass: "pistol", notes: "+2 em Guarda-Roupa e Estilo." }),
  W({ key: "bcBmg500", name: "Russia BMG-500 (Techtronika)", nameEn: "Techtronika Russia BMG-500", group: "blackChrome", skill: "heavyWeapons", damage: "5d6", rof: 1, mag: 500, ammo: "rifle", hands: 2, concealable: false, cost: 1000, autofire: 4, notes: "Exige CORPO 11+ ou montagem." }),
];

export const WEAPONS: WeaponDef[] = [...MELEE_WEAPONS, ...RANGED_WEAPONS, ...EXOTIC_WEAPONS, ...BLACK_CHROME_WEAPONS];
export const WEAPONS_MAP: Record<string, WeaponDef> = Object.fromEntries(WEAPONS.map((w) => [w.key, w]));

export function getWeapon(key: string): WeaponDef | undefined {
  return WEAPONS_MAP[key];
}

/** Rola o dano de uma arma e já avisa se foi crítico (dois ou mais 6). */
export function rollWeaponDamage(damage: string, rng?: Rng): { dice: number[]; total: number; critical: boolean } {
  const r = rollDice(damage, rng);
  return { ...r, critical: isCritical(r.dice) };
}
