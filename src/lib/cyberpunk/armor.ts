// ─── CYBERPUNK RED — armaduras ──────────────────────────────────────────────
// Armadura é comprada por local (cabeça/corpo) e o custo é por peça. PA não
// soma: vale a camada mais alta. A penalidade em REF/DES/MOV vem da pior peça
// vestida e se aplica uma única vez. Sem I/O.

export interface ArmorDef {
  key: string;
  name: string;
  nameEn: string;
  /** Pontos de armadura (PA). */
  sp: number;
  /** Penalidade a REF, DES e MOV (0, -2 ou -4). */
  penalty: number;
  cost: number;
  /** Onde pode ser vestida. */
  slots: ("head" | "body")[];
  source: "core" | "blackChrome";
  notes: string;
}

const A = (a: Omit<ArmorDef, "slots" | "source" | "notes"> & Partial<Pick<ArmorDef, "slots" | "source" | "notes">>): ArmorDef => ({
  slots: ["head", "body"], source: "core", notes: "", ...a,
});

export const ARMORS: ArmorDef[] = [
  A({ key: "leathers", name: "Couro", nameEn: "Leathers", sp: 4, penalty: 0, cost: 20 }),
  A({ key: "kevlar", name: "Kevlar", nameEn: "Kevlar", sp: 7, penalty: 0, cost: 50 }),
  A({ key: "lightArmorjack", name: "Armorjack Leve", nameEn: "Light Armorjack", sp: 11, penalty: 0, cost: 100 }),
  A({ key: "bodyweightSuit", name: "Traje Bodyweight", nameEn: "Bodyweight Suit", sp: 11, penalty: 0, cost: 1000, slots: ["body"], notes: "Comporta um ciberdeck e dá +1 espaço de hardware." }),
  A({ key: "mediumArmorjack", name: "Armorjack Médio", nameEn: "Medium Armorjack", sp: 12, penalty: -2, cost: 100 }),
  A({ key: "heavyArmorjack", name: "Armorjack Pesado", nameEn: "Heavy Armorjack", sp: 13, penalty: -2, cost: 500 }),
  A({ key: "flak", name: "Flak", nameEn: "Flak", sp: 15, penalty: -4, cost: 500 }),
  A({ key: "metalgear", name: "Metalgear", nameEn: "Metalgear", sp: 18, penalty: -4, cost: 5000 }),
  // Black Chrome
  A({ key: "bcCorporateIsland", name: "Corporate Island", nameEn: "Corporate Island", sp: 11, penalty: 0, cost: 500, slots: ["body"], source: "blackChrome" }),
  A({ key: "bcDirkCombatJacket", name: "Jaqueta de Combate Dirk", nameEn: "Dirk Combat Jacket", sp: 11, penalty: 0, cost: 500, slots: ["body"], source: "blackChrome" }),
  A({ key: "bcExecutiveArmor", name: "Armadura Executiva", nameEn: "Executive Armor", sp: 11, penalty: 0, cost: 1000, slots: ["body"], source: "blackChrome", notes: "Se conserta sozinha." }),
  A({ key: "bcBunkerGear", name: "Roupa de Bunker Fire Brand", nameEn: "Fire Brand Bunker Gear", sp: 15, penalty: -4, cost: 1000, source: "blackChrome", notes: "À prova de fogo." }),
  A({ key: "bcStreetJacket", name: "Jaqueta Laser Light", nameEn: "Laser Light Street Jacket", sp: 11, penalty: 0, cost: 500, slots: ["body"], source: "blackChrome" }),
  A({ key: "bcLotosNetsuit", name: "Netsuit Lotos", nameEn: "Lotos Netsuit", sp: 13, penalty: -2, cost: 5000, slots: ["body"], source: "blackChrome", notes: "Bodyweight com espaço de hardware extra e deck excelente." }),
  A({ key: "bcAirRider", name: "AirRider (Masetto)", nameEn: "Masetto AirRider", sp: 7, penalty: 0, cost: 100, slots: ["body"], source: "blackChrome", notes: "Anti-chicote cervical." }),
  A({ key: "bcMotorcycleHelmet", name: "Capacete MechaMan", nameEn: "MechaMan Motorcycle Helmet", sp: 15, penalty: -4, cost: 5000, slots: ["head"], source: "blackChrome", notes: "Inclui óculos inteligentes." }),
  A({ key: "bcMimicKit", name: "Kit de Roupa Mimic", nameEn: "Mimic Clothing Kit", sp: 11, penalty: 0, cost: 100, slots: ["body"], source: "blackChrome" }),
  A({ key: "bcMontage", name: "Linha Montage", nameEn: "Montage Variable Clothing Line", sp: 11, penalty: 0, cost: 500, slots: ["body"], source: "blackChrome" }),
  A({ key: "bcShockArmor", name: "Armadura de Choque", nameEn: "Shock Armor", sp: 7, penalty: 0, cost: 500, slots: ["body"], source: "blackChrome", notes: "Descarga elétrica para escapar de agarrões." }),
  A({ key: "bcSkidRowTrench", name: "Sobretudo SkidRow", nameEn: "SkidRow Trench", sp: 13, penalty: -4, cost: 100, slots: ["body"], source: "blackChrome" }),
  A({ key: "bcRidingSuit", name: "Traje de Piloto Street Viper", nameEn: "Street Viper Riding Suit", sp: 7, penalty: 0, cost: 100, slots: ["body"], source: "blackChrome" }),
  A({ key: "bcTacticalSmart", name: "Armadura Tática Inteligente", nameEn: "Tactical Smart Armor", sp: 12, penalty: -2, cost: 1000, source: "blackChrome", notes: "Inclui óculos inteligentes." }),
];

export const ARMORS_MAP: Record<string, ArmorDef> = Object.fromEntries(ARMORS.map((a) => [a.key, a]));

export function getArmor(key: string): ArmorDef | undefined {
  return ARMORS_MAP[key];
}

/** Escudo à prova de balas: não é PA, é um bloco de 10 HP que absorve o dano antes do usuário. */
export const BULLETPROOF_SHIELD = { key: "bulletproofShield", name: "Escudo à Prova de Balas", nameEn: "Bulletproof Shield", hp: 10, cost: 100 };

export interface WornPiece {
  sp: number;
  penalty: number;
}

/** PA não soma entre camadas: vale a maior. */
export function highestSp(pieces: { sp: number }[]): number {
  return pieces.reduce((m, p) => Math.max(m, p.sp), 0);
}

/** Penalidade de REF/DES/MOV: só a pior peça conta, uma vez (valores são ≤ 0). */
export function worstPenalty(pieces: { penalty: number }[]): number {
  return pieces.reduce((m, p) => Math.min(m, p.penalty), 0);
}

/** Valor inicial da ficha para um slot de armadura. */
export function armorToSheetSlot(a: ArmorDef) {
  return { name: a.name, sp: a.sp, spMax: a.sp, penalty: a.penalty };
}
