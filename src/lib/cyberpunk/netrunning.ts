// ─── CYBERPUNK RED — Netrunning ──────────────────────────────────────────────
// Programas, Black ICE, hardware de ciberdeck e habilidades de Interface.
// REZ é a "vida" de um programa/ICE: chegou a 0, ele é desintegrado. O combate
// na NET compara Interface + ATQ do programa + 1d10 contra Interface/DEF do
// alvo + 1d10. Sem I/O; DVs de arquitetura e Demônios não foram extraídos.

export type ProgramClass = "booster" | "defender" | "antiProgram" | "antiPersonnel";

export interface ProgramDef {
  key: string;
  name: string;
  nameEn: string;
  cls: ProgramClass;
  atk: number;
  def: number;
  rez: number;
  cost: number;
  effect: string;
}

const P = (key: string, name: string, cls: ProgramClass, atk: number, def: number, rez: number, cost: number, effect: string, nameEn = name): ProgramDef =>
  ({ key, name, nameEn, cls, atk, def, rez, cost, effect });

export const PROGRAMS: ProgramDef[] = [
  P("eraser", "Eraser", "booster", 0, 0, 7, 20, "+2 em testes de Cloak."),
  P("seeYa", "See Ya", "booster", 0, 0, 7, 20, "+2 em testes de Pathfinder."),
  P("speedyGonzalvez", "Speedy Gonzalvez", "booster", 0, 0, 7, 100, "+2 de Velocidade."),
  P("worm", "Worm", "booster", 0, 0, 7, 50, "+2 em testes de Backdoor."),
  P("armor", "Armor", "defender", 0, 0, 7, 50, "Reduz em 4 o dano cerebral sofrido; uma cópia; uma vez por netrun."),
  P("flak", "Flak", "defender", 0, 0, 7, 50, "O ATQ de atacantes que não sejam Black ICE vira 0; uma cópia; uma vez por netrun."),
  P("shield", "Shield", "defender", 0, 0, 7, 20, "Barra o primeiro dano cerebral de não-Black-ICE e então se desintegra; uma vez por netrun."),
  P("banhammer", "Banhammer", "antiProgram", 1, 0, 0, 50, "3d6 de REZ em programa comum, 2d6 em Black ICE."),
  P("sword", "Sword", "antiProgram", 1, 0, 0, 50, "3d6 de REZ em Black ICE, 2d6 em programa comum."),
  P("deckKrash", "DeckKRASH", "antiPersonnel", 0, 0, 0, 100, "Força o netrunner inimigo a sair da NET de modo inseguro.", "DeckKRASH"),
  P("hellbolt", "Hellbolt", "antiPersonnel", 2, 0, 0, 100, "2d6 de dano cerebral; o deck e as roupas pegam fogo (2 HP por turno)."),
  P("nervescrub", "Nervescrub", "antiPersonnel", 0, 0, 0, 100, "INT, REF e DES -1d6 por 1 hora (mínimo 1)."),
  P("poisonFlatline", "Poison Flatline", "antiPersonnel", 0, 0, 0, 100, "Destrói um programa aleatório (não Black ICE) do deck alvo."),
  P("superglue", "Superglue", "antiPersonnel", 2, 0, 0, 100, "O alvo não desce nem sai com segurança por 1d6 rodadas; uma vez por netrun."),
  P("vrizzbolt", "Vrizzbolt", "antiPersonnel", 1, 0, 0, 50, "1d6 de dano cerebral; -1 Ação de NET no turno seguinte (mínimo 2)."),
];

export interface BlackIceDef {
  key: string;
  name: string;
  cls: "antiPersonnel" | "antiProgram";
  per: number;
  spd: number;
  atk: number;
  def: number;
  rez: number;
  cost: number;
  effect: string;
}

const B = (key: string, name: string, cls: BlackIceDef["cls"], per: number, spd: number, atk: number, def: number, rez: number, cost: number, effect: string): BlackIceDef =>
  ({ key, name, cls, per, spd, atk, def, rez, cost, effect });

export const BLACK_ICE: BlackIceDef[] = [
  B("asp", "Asp", "antiPersonnel", 4, 6, 2, 2, 15, 100, "Destrói um programa aleatório do deck inimigo."),
  B("giant", "Giant", "antiPersonnel", 2, 2, 8, 4, 25, 1000, "3d6 de dano cerebral e saída insegura forçada."),
  B("hellhound", "Hellhound", "antiPersonnel", 6, 6, 6, 2, 20, 500, "2d6 de dano cerebral e fogo (2 HP por turno)."),
  B("kraken", "Kraken", "antiPersonnel", 6, 2, 8, 4, 30, 1000, "3d6 cerebral; impede descer ou sair com segurança até o fim do turno seguinte."),
  B("liche", "Liche", "antiPersonnel", 8, 2, 6, 2, 25, 500, "INT, REF e DES -1d6 por 1 hora."),
  B("raven", "Raven", "antiPersonnel", 6, 4, 4, 2, 15, 50, "Desintegra um Defensor aleatório e causa 1d6 cerebral."),
  B("scorpion", "Scorpion", "antiPersonnel", 2, 6, 2, 2, 15, 100, "MOVIMENTO -1d6 por 1 hora."),
  B("skunk", "Skunk", "antiPersonnel", 2, 4, 4, 2, 10, 500, "-2 em testes de Slide até ser desintegrado; acumula."),
  B("wisp", "Wisp", "antiPersonnel", 4, 4, 4, 2, 15, 50, "1d6 cerebral e -1 Ação de NET no turno seguinte (mínimo 2)."),
  B("dragon", "Dragon", "antiProgram", 6, 4, 6, 6, 30, 1000, "6d6 em um programa; se desintegrar, destrói."),
  B("killer", "Killer", "antiProgram", 4, 8, 6, 2, 20, 500, "4d6 em um programa; se desintegrar, destrói."),
  B("sabertooth", "Sabertooth", "antiProgram", 8, 6, 6, 2, 25, 1000, "6d6 em um programa; se desintegrar, destrói."),
];

export const CYBERDECK_HARDWARE = [
  { key: "backupDrive", name: "Unidade de Backup", cost: 100, effect: "Guarda cópia de programas destruídos." },
  { key: "dnaLock", name: "Trava de DNA", cost: 100, effect: "Só funciona com o DNA do dono." },
] as const;

export const CYBERDECK = { name: "Ciberdeck", cost: 500, slots: 7 };

export interface InterfaceAbility { key: string; name: string; desc: string }

export const INTERFACE_ABILITIES: InterfaceAbility[] = [
  { key: "scanner", name: "Scanner", desc: "Localiza pontos de acesso." },
  { key: "backdoor", name: "Backdoor", desc: "Contorna uma Senha." },
  { key: "cloak", name: "Cloak", desc: "Esconde suas ações na arquitetura." },
  { key: "control", name: "Control", desc: "Opera Nós de Controle." },
  { key: "eyeDee", name: "Eye-Dee", desc: "Identifica Arquivos e dados." },
  { key: "pathfinder", name: "Pathfinder", desc: "Mapeia a arquitetura." },
  { key: "slide", name: "Slide", desc: "Escapa de um Black ICE que não seja Demônio (Interface + 1d10 contra PER + 1d10)." },
  { key: "virus", name: "Virus", desc: "Deixa um vírus no último andar." },
  { key: "zap", name: "Zap", desc: "Ataque: 1d6 de dano cerebral a um netrunner ou 1d6 de REZ a um programa/ICE." },
];

/** Ações de NET por turno: Grau 1-3 → 2, 4-6 → 3, 7-9 → 4, 10 → 5. */
export function netActionsForRank(rank: number): number {
  if (rank >= 10) return 5;
  if (rank >= 7) return 4;
  if (rank >= 4) return 3;
  return 2;
}

export function getProgram(key: string): ProgramDef | undefined {
  return PROGRAMS.find((p) => p.key === key);
}
export function getBlackIce(key: string): BlackIceDef | undefined {
  return BLACK_ICE.find((b) => b.key === key);
}

/** Black ICE ocupa 2 espaços do deck; programas, 1. */
export const BLACK_ICE_SLOTS = 2;
