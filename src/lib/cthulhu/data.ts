// ─── ATTRIBUTES ──────────────────────────────────────────────────────────────

export type AttrKey = "for" | "con" | "tam" | "des" | "apa" | "int" | "pod" | "edu";

export interface CthulhuAttrs {
  for: number; con: number; tam: number; des: number;
  apa: number; int: number; pod: number; edu: number;
  sorte: number;
}

// Dice formula: count×Dsides + add, then ×5
export const ATTR_DICE: Record<AttrKey, { count: number; sides: number; add: number }> = {
  for: { count: 3, sides: 6, add: 0 },
  con: { count: 3, sides: 6, add: 0 },
  tam: { count: 2, sides: 6, add: 6 },
  des: { count: 3, sides: 6, add: 0 },
  apa: { count: 3, sides: 6, add: 0 },
  int: { count: 2, sides: 6, add: 6 },
  pod: { count: 3, sides: 6, add: 0 },
  edu: { count: 2, sides: 6, add: 6 },
};

export const ATTR_LABELS: Record<AttrKey, string> = {
  for: "Força",
  con: "Constituição",
  tam: "Tamanho",
  des: "Destreza",
  apa: "Aparência",
  int: "Inteligência",
  pod: "Poder",
  edu: "Educação",
};

export const ATTR_ABBR: Record<AttrKey, string> = {
  for: "FOR", con: "CON", tam: "TAM", des: "DES",
  apa: "APA", int: "INT", pod: "POD", edu: "EDU",
};

function rollDice(count: number, sides: number): number {
  let total = 0;
  for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
  return total;
}

export function rollAttr(key: AttrKey): number {
  const { count, sides, add } = ATTR_DICE[key];
  return (rollDice(count, sides) + add) * 5;
}

export function rollSorte(): number {
  return rollDice(3, 6) * 5;
}

// Book 7e: investigadores jovens (15-19) rolam Sorte duas vezes e usam o maior.
export function rollSorteForAge(age: number): number {
  if (age < 20) return Math.max(rollDice(3, 6), rollDice(3, 6)) * 5;
  return rollDice(3, 6) * 5;
}

export function rollAll(): CthulhuAttrs {
  return {
    for: rollAttr("for"), con: rollAttr("con"), tam: rollAttr("tam"),
    des: rollAttr("des"), apa: rollAttr("apa"), int: rollAttr("int"),
    pod: rollAttr("pod"), edu: rollAttr("edu"),
    sorte: rollSorte(),
  };
}

export function applyAgeModifiers(attrs: CthulhuAttrs, age: number): CthulhuAttrs {
  const a = { ...attrs };

  if (age < 20) {
    // Book 7e: -5 EDU flat, -5 distributed between FOR and TAM (auto: FOR-3, TAM-2)
    // Roll Luck twice and use higher — handled in UI hint
    a.edu = Math.max(1, a.edu - 5);
    a.for = Math.max(1, a.for - 3);
    a.tam = Math.max(1, a.tam - 2);
    return a;
  }

  let eduChecks = 0, reduction = 0, apaReduction = 0;
  if (age >= 80)      { eduChecks = 4; reduction = 80; apaReduction = 25; }
  else if (age >= 70) { eduChecks = 4; reduction = 40; apaReduction = 20; }
  else if (age >= 60) { eduChecks = 4; reduction = 20; apaReduction = 15; }
  else if (age >= 50) { eduChecks = 3; reduction = 10; apaReduction = 10; }
  else if (age >= 40) { eduChecks = 2; reduction = 5;  apaReduction = 5;  }
  else if (age >= 20) { eduChecks = 1; }  // 20-39: 1 EDU improvement check

  for (let i = 0; i < eduChecks; i++) {
    const roll = Math.floor(Math.random() * 100) + 1;
    if (roll > a.edu) a.edu = Math.min(99, a.edu + rollDice(1, 10));
  }

  const perAttr = Math.floor(reduction / 3);
  const rem = reduction - perAttr * 3;
  a.for = Math.max(1, a.for - perAttr - (rem > 0 ? 1 : 0));
  a.con = Math.max(1, a.con - perAttr - (rem > 1 ? 1 : 0));
  a.des = Math.max(1, a.des - perAttr);
  a.apa = Math.max(1, a.apa - apaReduction);

  return a;
}

export function calcMOV(attrs: CthulhuAttrs, age: number): number {
  const { for: f, des: d, tam: t } = attrs;
  let mov = f < t && d < t ? 7 : f > t && d > t ? 9 : 8;
  if (age >= 80)      mov -= 5;
  else if (age >= 70) mov -= 4;
  else if (age >= 60) mov -= 3;
  else if (age >= 50) mov -= 2;
  else if (age >= 40) mov -= 1;
  return Math.max(1, mov);
}

export function calcPV(attrs: CthulhuAttrs): number {
  return Math.floor((attrs.con + attrs.tam) / 10);
}

export function calcPM(attrs: CthulhuAttrs): number {
  return Math.floor(attrs.pod / 5);
}

export function calcDamageBonus(attrs: CthulhuAttrs): string {
  const s = attrs.for + attrs.tam;
  if (s <= 64)  return "-2";
  if (s <= 84)  return "-1";
  if (s <= 124) return "Nenhum";
  if (s <= 164) return "+1D4";
  if (s <= 204) return "+1D6";
  return "+2D6";
}

export function calcCorpo(attrs: CthulhuAttrs): number {
  const s = attrs.for + attrs.tam;
  if (s <= 64)  return -2;
  if (s <= 84)  return -1;
  if (s <= 124) return 0;
  if (s <= 164) return 1;
  if (s <= 204) return 2;
  return 3;
}

export function half(v: number) { return Math.floor(v / 2); }
export function fifth(v: number) { return Math.floor(v / 5); }

// ─── SKILLS ──────────────────────────────────────────────────────────────────

export interface Skill {
  id: string;
  name: string;
  base: number; // base percentage (0 if dynamic, e.g. lingua_nativa = EDU)
  era?: "modern";
  // base derivada de atributo: "edu" = EDU; "des_half" = metade de DES (Esquivar)
  dynamic?: "edu" | "des_half";
}

export const SKILLS: Skill[] = [
  { id: "contabilidade",      name: "Contabilidade",           base: 5  },
  { id: "antropologia",       name: "Antropologia",            base: 1  },
  { id: "avaliacao",          name: "Avaliação",               base: 5  },
  { id: "arqueologia",        name: "Arqueologia",             base: 1  },
  { id: "arte_escrita",       name: "Arte/Ofício (Escrita)",   base: 5  },
  { id: "arte_fotografia",    name: "Arte/Ofício (Fotografia)",base: 5  },
  { id: "arte_pintura",       name: "Arte/Ofício (Pintura)",   base: 5  },
  { id: "arte_musica",        name: "Arte/Ofício (Música)",    base: 5  },
  { id: "charme",             name: "Charme",                  base: 15 },
  { id: "escalar",            name: "Escalar",                 base: 20 },
  { id: "disfarce",           name: "Disfarce",                base: 5  },
  { id: "conduzir_auto",      name: "Conduzir Automóvel",      base: 20 },
  { id: "eletrica",           name: "Elétrica",                base: 10 },
  { id: "eletronica",         name: "Eletrônica",              base: 1,  era: "modern" },
  { id: "encontrar",          name: "Encontrar",               base: 25 },
  { id: "primeiros_socorros", name: "Primeiros Socorros",      base: 30 },
  { id: "historia",           name: "História",                base: 5  },
  { id: "intimidacao",        name: "Intimidação",             base: 15 },
  { id: "saltar",             name: "Saltar",                  base: 20 },
  { id: "direito",            name: "Direito",                 base: 5  },
  { id: "usar_bibliotecas",   name: "Usar Bibliotecas",        base: 20 },
  { id: "escutar",            name: "Escutar",                 base: 20 },
  { id: "labia",              name: "Lábia",                   base: 5  },
  { id: "mecanica",           name: "Mecânica",                base: 10 },
  { id: "medicina",           name: "Medicina",                base: 1  },
  { id: "ocultismo",          name: "Ocultismo",               base: 5  },
  { id: "outras_linguas",     name: "Outras Línguas",          base: 1  },
  { id: "lingua_nativa",      name: "Língua Nativa",           base: 0, dynamic: "edu" },
  { id: "natureza",           name: "Natureza",                base: 10 },
  { id: "navegar",            name: "Navegar",                 base: 10 },
  { id: "perceber",           name: "Perceber",                base: 25 },
  { id: "persuasao",          name: "Persuasão",               base: 10 },
  { id: "pilotar_aeronaves",  name: "Pilotar Aeronaves",       base: 1  },
  { id: "psicologia",         name: "Psicologia",              base: 10 },
  { id: "leitura_labios",     name: "Leitura de Lábios",       base: 1  },
  { id: "lutar_briga",        name: "Lutar (Briga)",           base: 25 },
  { id: "armas_pistola",      name: "Armas de Fogo (Pistola)", base: 20 },
  { id: "armas_rifle",        name: "Armas de Fogo (Rifle)",   base: 25 },
  { id: "arremessar",         name: "Arremessar",              base: 20 },
  { id: "nadar",              name: "Nadar",                   base: 20 },
  { id: "rastrear",           name: "Rastrear",                base: 10 },
  { id: "furtividade",        name: "Furtividade",             base: 20 },
  { id: "esquivar",           name: "Esquivar",                base: 0, dynamic: "des_half" },
  { id: "sobrevivencia",      name: "Sobrevivência",           base: 10 },
  { id: "usar_computadores",  name: "Usar Computadores",       base: 5,  era: "modern" },
  { id: "ciencias_biologia",  name: "Ciências (Biologia)",     base: 1  },
  { id: "ciencias_quimica",   name: "Ciências (Química)",      base: 1  },
  { id: "ciencias_astro",     name: "Ciências (Astronomia)",   base: 1  },
  { id: "ciencias_fisica",    name: "Ciências (Física)",       base: 1  },
  { id: "ciencias_geologia",  name: "Ciências (Geologia)",     base: 1  },
  { id: "nivel_credito",      name: "Nível de Crédito",        base: 0  },
  { id: "mythos",             name: "Mythos de Cthulhu",       base: 0  },
];

export function getSkillBase(skill: Skill, eduValue = 50, desValue = 50): number {
  if (skill.dynamic === "edu") return eduValue;
  if (skill.dynamic === "des_half") return Math.floor(desValue / 2);
  return skill.base;
}

// Improvement check (fim de cenário): se 1D100 > valor atual, ganha +1D10 (máx 99).
export interface ImprovementResult {
  roll:     number;
  improved: boolean;
  gain:     number;
  newValue: number;
}

export function rollImprovement(current: number): ImprovementResult {
  const roll = rollPercentile();
  // Sucesso na melhoria: rolar acima do valor atual (ou valor < 95, sempre chance).
  const improved = roll > current;
  const gain = improved ? Math.floor(Math.random() * 10) + 1 : 0;
  const newValue = Math.min(99, current + gain);
  return { roll, improved, gain, newValue };
}

export function getSkillsForEra(era: "1920s" | "modern"): Skill[] {
  if (era === "modern") return SKILLS;
  return SKILLS.filter((s) => !s.era);
}

// ─── OCCUPATIONS ─────────────────────────────────────────────────────────────

export type PointsFormula =
  | "EDU×4"
  | "EDU×2+APA×2" | "EDU×2+FOR×2" | "EDU×2+DES×2" | "EDU×2+INT×2" | "EDU×2+POD×2"
  // Fórmulas com escolha de atributo (livro 7e) — usa o maior, pois o jogador escolhe.
  | "EDU×2+(DES²|FOR²)" | "EDU×2+(DES²|POD²)" | "EDU×2+(APA²|DES²)";

export interface Occupation {
  id: string;
  name: string;
  desc: string;
  formula: PointsFormula;
  creditRange: [number, number];
  fixedSkills: string[];
  freeSkillCount: number;
}

export function calcOccupationPoints(formula: PointsFormula, attrs: CthulhuAttrs): number {
  switch (formula) {
    case "EDU×4":        return attrs.edu * 4;
    case "EDU×2+APA×2": return attrs.edu * 2 + attrs.apa * 2;
    case "EDU×2+FOR×2": return attrs.edu * 2 + attrs.for * 2;
    case "EDU×2+DES×2": return attrs.edu * 2 + attrs.des * 2;
    case "EDU×2+INT×2": return attrs.edu * 2 + attrs.int * 2;
    case "EDU×2+POD×2": return attrs.edu * 2 + attrs.pod * 2;
    case "EDU×2+(DES²|FOR²)": return attrs.edu * 2 + Math.max(attrs.des, attrs.for) * 2;
    case "EDU×2+(DES²|POD²)": return attrs.edu * 2 + Math.max(attrs.des, attrs.pod) * 2;
    case "EDU×2+(APA²|DES²)": return attrs.edu * 2 + Math.max(attrs.apa, attrs.des) * 2;
  }
}

export const OCCUPATIONS: Occupation[] = [
  {
    id: "antiquario", name: "Antiquário",
    desc: "Compra e vende objetos antigos e arte. Especialista em história e avaliação.",
    formula: "EDU×4", creditRange: [30, 70],
    fixedSkills: ["avaliacao", "historia", "usar_bibliotecas", "outras_linguas", "encontrar"],
    freeSkillCount: 3,
  },
  {
    id: "arqueólogo", name: "Arqueólogo",
    desc: "Estuda artefatos e sítios históricos para desvendar o passado da humanidade.",
    formula: "EDU×4", creditRange: [10, 40],
    fixedSkills: ["antropologia", "arqueologia", "conduzir_auto", "historia", "outras_linguas", "perceber", "sobrevivencia", "rastrear"],
    freeSkillCount: 0,
  },
  {
    id: "artista", name: "Artista",
    desc: "Cria obras de arte. Pintor, músico, escultor ou performer.",
    formula: "EDU×2+(DES²|POD²)", creditRange: [9, 50],
    fixedSkills: ["arte_pintura", "historia", "charme", "disfarce", "psicologia", "perceber", "persuasao"],
    freeSkillCount: 1,
  },
  {
    id: "autor", name: "Autor",
    desc: "Escritor de ficção, não-ficção, jornalismo ou poesia.",
    formula: "EDU×4", creditRange: [9, 30],
    fixedSkills: ["arte_escrita", "historia", "usar_bibliotecas", "ocultismo", "outras_linguas", "psicologia", "persuasao"],
    freeSkillCount: 1,
  },
  {
    id: "cientista", name: "Cientista",
    desc: "Pesquisador dedicado a biologia, física, química, astronomia ou outra área.",
    formula: "EDU×4", creditRange: [9, 50],
    fixedSkills: ["usar_bibliotecas", "outras_linguas", "ciencias_biologia", "ciencias_quimica"],
    freeSkillCount: 4,
  },
  {
    id: "criminoso", name: "Criminoso",
    desc: "Opera à margem da lei. Ladrão, golpista ou gângster.",
    formula: "EDU×2+(DES²|FOR²)", creditRange: [5, 65],
    fixedSkills: ["disfarce", "armas_pistola", "lutar_briga", "furtividade", "perceber", "labia"],
    freeSkillCount: 2,
  },
  {
    id: "detetive", name: "Detetive Particular",
    desc: "Investiga casos privados, rastreia pessoas e coleta evidências.",
    formula: "EDU×2+(DES²|FOR²)", creditRange: [9, 30],
    fixedSkills: ["arte_fotografia", "direito", "usar_bibliotecas", "psicologia", "encontrar", "perceber"],
    freeSkillCount: 2,
  },
  {
    id: "diletante", name: "Diletante",
    desc: "Pessoa de posses que se envolve em atividades por prazer pessoal.",
    formula: "EDU×2+APA×2", creditRange: [50, 99],
    fixedSkills: ["arte_pintura", "conduzir_auto", "armas_pistola", "outras_linguas", "persuasao", "perceber"],
    freeSkillCount: 2,
  },
  {
    id: "enfermeiro", name: "Enfermeiro/a",
    desc: "Profissional de saúde que cuida de pacientes e auxilia médicos.",
    formula: "EDU×4", creditRange: [9, 30],
    fixedSkills: ["primeiros_socorros", "medicina", "psicologia", "persuasao", "escutar", "perceber"],
    freeSkillCount: 2,
  },
  {
    id: "estudante", name: "Estudante",
    desc: "Cursa universidade ou escola superior. Conhecimento amplo, pouca experiência.",
    formula: "EDU×4", creditRange: [5, 10],
    fixedSkills: ["usar_bibliotecas", "lingua_nativa", "psicologia"],
    freeSkillCount: 5,
  },
  {
    id: "investigador_policial", name: "Investigador Policial",
    desc: "Investiga crimes pela polícia. Experiente com evidências e interrogatórios.",
    formula: "EDU×2+(DES²|FOR²)", creditRange: [20, 50],
    fixedSkills: ["arte_fotografia", "conduzir_auto", "armas_pistola", "primeiros_socorros", "direito", "psicologia", "intimidacao", "escutar"],
    freeSkillCount: 0,
  },
  {
    id: "jornalista", name: "Jornalista",
    desc: "Repórter investigativo ou escritor de mídia impressa e rádio.",
    formula: "EDU×4", creditRange: [9, 30],
    fixedSkills: ["arte_escrita", "historia", "usar_bibliotecas", "outras_linguas", "persuasao", "psicologia"],
    freeSkillCount: 2,
  },
  {
    id: "advogado", name: "Advogado",
    desc: "Representa clientes em processos legais e aconselha sobre a lei.",
    formula: "EDU×4", creditRange: [30, 80],
    fixedSkills: ["contabilidade", "direito", "usar_bibliotecas", "psicologia", "persuasao"],
    freeSkillCount: 3,
  },
  {
    id: "marinheiro", name: "Marinheiro/Capitão",
    desc: "Navegador experiente em oceanos e rios. Conhece os mares e suas criaturas.",
    formula: "EDU×2+(DES²|FOR²)", creditRange: [9, 40],
    fixedSkills: ["primeiros_socorros", "lutar_briga", "armas_pistola", "navegar", "perceber", "nadar", "sobrevivencia"],
    freeSkillCount: 1,
  },
  {
    id: "mecanico", name: "Mecânico/Engenheiro",
    desc: "Projeta, constrói e repara máquinas e estruturas.",
    formula: "EDU×4", creditRange: [9, 40],
    fixedSkills: ["eletrica", "mecanica", "conduzir_auto", "usar_bibliotecas"],
    freeSkillCount: 4,
  },
  {
    id: "medico", name: "Médico",
    desc: "Profissional de saúde treinado em diagnóstico e tratamento de enfermidades.",
    formula: "EDU×4", creditRange: [30, 80],
    fixedSkills: ["primeiros_socorros", "medicina", "psicologia", "ciencias_biologia", "outras_linguas", "persuasao"],
    freeSkillCount: 2,
  },
  {
    id: "militar", name: "Militar",
    desc: "Soldado, oficial ou veterano de guerra. Treinado para combate e sobrevivência.",
    formula: "EDU×2+(DES²|FOR²)", creditRange: [9, 40],
    fixedSkills: ["primeiros_socorros", "lutar_briga", "armas_rifle", "armas_pistola", "sobrevivencia", "rastrear"],
    freeSkillCount: 2,
  },
  {
    id: "ocultista", name: "Ocultista",
    desc: "Estudioso de ciências ocultas, magia e o sobrenatural.",
    formula: "EDU×4", creditRange: [9, 65],
    fixedSkills: ["antropologia", "historia", "usar_bibliotecas", "ocultismo", "outras_linguas", "psicologia"],
    freeSkillCount: 2,
  },
  {
    id: "professor", name: "Professor/Acadêmico",
    desc: "Ensina e pesquisa em universidades ou escolas.",
    formula: "EDU×4", creditRange: [20, 70],
    fixedSkills: ["antropologia", "historia", "usar_bibliotecas", "outras_linguas", "persuasao", "psicologia"],
    freeSkillCount: 2,
  },
  {
    id: "religioso", name: "Padre/Ministro/Clérigo",
    desc: "Líder espiritual de uma congregação religiosa.",
    formula: "EDU×4", creditRange: [9, 60],
    fixedSkills: ["contabilidade", "historia", "usar_bibliotecas", "escutar", "outras_linguas", "persuasao", "psicologia"],
    freeSkillCount: 1,
  },
];

// ─── DICE ENGINE ─────────────────────────────────────────────────────────────

export interface RollResult {
  total: number;
  rolls: number[];
  expr: string;
}

// Parse and roll a dice expression like "2D6+4", "1D10", "1D4+2", "1D6-1".
export function rollExpr(expr: string): RollResult {
  const clean = expr.replace(/\s+/g, "").toUpperCase();
  // tokens: optional sign, then NdM or constant
  const re = /([+-]?)(\d*)D(\d+)|([+-]?\d+)/g;
  let total = 0;
  const rolls: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    if (m[3]) {
      const sign  = m[1] === "-" ? -1 : 1;
      const count = m[2] === "" ? 1 : parseInt(m[2], 10);
      const sides = parseInt(m[3], 10);
      for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * sides) + 1;
        rolls.push(r);
        total += sign * r;
      }
    } else if (m[4]) {
      total += parseInt(m[4], 10);
    }
  }
  return { total, rolls, expr };
}

// Roll 1D100 (percentile). Returns 1–100.
export function rollPercentile(): number {
  return Math.floor(Math.random() * 100) + 1;
}

export type CheckLevel = "critico" | "extremo" | "dificil" | "normal" | "falha" | "desastre";

export const CHECK_LABELS: Record<CheckLevel, string> = {
  critico:  "Crítico",
  extremo:  "Sucesso Extremo",
  dificil:  "Sucesso Difícil",
  normal:   "Sucesso Normal",
  falha:    "Falha",
  desastre: "Desastre",
};

export interface SkillCheck {
  roll:    number;
  target:  number;
  level:   CheckLevel;
  success: boolean;
}

// Resolve a 1D100 skill/attribute check per CoC 7e success levels.
export function resolveCheck(target: number, roll = rollPercentile()): SkillCheck {
  const t = Math.max(0, Math.min(99, target));
  // Fumble: 100 always; 96–99 when skill < 50.
  const fumble = roll === 100 || (roll >= 96 && t < 50);
  let level: CheckLevel;
  let success: boolean;

  if (roll === 1) {
    level = "critico"; success = true;
  } else if (roll <= fifth(t)) {
    level = "extremo"; success = true;
  } else if (roll <= half(t)) {
    level = "dificil"; success = true;
  } else if (roll <= t) {
    level = "normal"; success = true;
  } else if (fumble) {
    level = "desastre"; success = false;
  } else {
    level = "falha"; success = false;
  }
  return { roll, target: t, level, success };
}

// ─── WEAPONS (Tabela XVII) ────────────────────────────────────────────────────

export type WeaponCategory = "corpo" | "arremesso" | "pistola" | "rifle" | "espingarda";

export interface Weapon {
  id:       string;
  name:     string;
  category: WeaponCategory;
  skillId:  string;        // perícia usada (id de SKILLS)
  skillName: string;       // rótulo da perícia/especialização
  damage:   string;        // dado base, ex.: "1D10", "1D8+1", "4D6/2D6/1D6"
  addDB:    boolean;       // soma o Dano Extra (corpo a corpo)
  halfDB?:  boolean;       // soma metade do Dano Extra (armas de arremesso)
  range:    string;        // alcance base
  attacks:  string;        // usos por rodada
  ammo?:    number;        // munição na arma
  cost1920?: string;
  costModern?: string;
  eras:     ("1920s" | "modern")[];
}

export const WEAPONS: Weapon[] = [
  // Corpo a corpo
  { id: "desarmado",   name: "Desarmado",            category: "corpo", skillId: "lutar_briga", skillName: "Lutar (Briga)",   damage: "1D3", addDB: true,  range: "Toque", attacks: "1", eras: ["1920s", "modern"] },
  { id: "soqueira",    name: "Soqueira",             category: "corpo", skillId: "lutar_briga", skillName: "Lutar (Briga)",   damage: "1D3+1", addDB: true, range: "Toque", attacks: "1", cost1920: "$1", costModern: "$10", eras: ["1920s", "modern"] },
  { id: "faca_peq",    name: "Faca pequena (canivete)", category: "corpo", skillId: "lutar_briga", skillName: "Lutar (Briga)", damage: "1D4", addDB: true, range: "Toque", attacks: "1", cost1920: "$2", costModern: "$6", eras: ["1920s", "modern"] },
  { id: "faca_med",    name: "Faca média (cozinha)", category: "corpo", skillId: "lutar_briga", skillName: "Lutar (Briga)",   damage: "1D4+2", addDB: true, range: "Toque", attacks: "1", cost1920: "$2", costModern: "$15", eras: ["1920s", "modern"] },
  { id: "faca_gra",    name: "Faca grande (facão)",  category: "corpo", skillId: "lutar_briga", skillName: "Lutar (Briga)",   damage: "1D8", addDB: true, range: "Toque", attacks: "1", cost1920: "$4", costModern: "$50", eras: ["1920s", "modern"] },
  { id: "porrete_peq", name: "Porrete pequeno (cassetete)", category: "corpo", skillId: "lutar_briga", skillName: "Lutar (Briga)", damage: "1D6", addDB: true, range: "Toque", attacks: "1", cost1920: "$3", costModern: "$35", eras: ["1920s", "modern"] },
  { id: "porrete_gra", name: "Porrete grande (taco)", category: "corpo", skillId: "lutar_briga", skillName: "Lutar (Briga)",  damage: "1D8", addDB: true, range: "Toque", attacks: "1", cost1920: "$3", costModern: "$35", eras: ["1920s", "modern"] },
  { id: "machadinha",  name: "Machadinha",           category: "corpo", skillId: "lutar_briga", skillName: "Lutar (Machados)", damage: "1D6+1", addDB: true, range: "Toque", attacks: "1", cost1920: "$3", costModern: "$9", eras: ["1920s", "modern"] },
  { id: "machado",     name: "Machado de lenhador",  category: "corpo", skillId: "lutar_briga", skillName: "Lutar (Machados)", damage: "1D8+2", addDB: true, range: "Toque", attacks: "1", cost1920: "$5", costModern: "$10", eras: ["1920s", "modern"] },
  { id: "espada_leve", name: "Espada leve (florete)", category: "corpo", skillId: "lutar_briga", skillName: "Lutar (Espadas)", damage: "1D6", addDB: true, range: "Toque", attacks: "1", cost1920: "$25", costModern: "$100", eras: ["1920s", "modern"] },
  { id: "espada_pes",  name: "Espada pesada (sabre)", category: "corpo", skillId: "lutar_briga", skillName: "Lutar (Espadas)", damage: "1D8+1", addDB: true, range: "Toque", attacks: "1", cost1920: "$30", costModern: "$75", eras: ["1920s", "modern"] },
  // Arremesso
  { id: "pedra",       name: "Pedra arremessada",    category: "arremesso", skillId: "arremessar", skillName: "Arremessar", damage: "1D4", addDB: false, halfDB: true, range: "FOR/5 m", attacks: "1", eras: ["1920s", "modern"] },
  // Pistolas
  { id: "rev32",   name: "Revólver .32 / 7.65mm",    category: "pistola", skillId: "armas_pistola", skillName: "Armas de Fogo (Pistolas)", damage: "1D8", addDB: false, range: "15 m", attacks: "1 (3)", ammo: 6, cost1920: "$15", costModern: "$200", eras: ["1920s", "modern"] },
  { id: "rev38",   name: "Revólver .38 / 9mm",       category: "pistola", skillId: "armas_pistola", skillName: "Armas de Fogo (Pistolas)", damage: "1D10", addDB: false, range: "15 m", attacks: "1 (3)", ammo: 6, cost1920: "$25", costModern: "$200", eras: ["1920s", "modern"] },
  { id: "auto38",  name: ".38 automática",           category: "pistola", skillId: "armas_pistola", skillName: "Armas de Fogo (Pistolas)", damage: "1D10", addDB: false, range: "15 m", attacks: "1 (3)", ammo: 8, cost1920: "$30", costModern: "$375", eras: ["1920s", "modern"] },
  { id: "luger",   name: "Luger P08",                category: "pistola", skillId: "armas_pistola", skillName: "Armas de Fogo (Pistolas)", damage: "1D10", addDB: false, range: "15 m", attacks: "1 (3)", ammo: 8, cost1920: "$75", costModern: "$600", eras: ["1920s", "modern"] },
  { id: "rev45",   name: "Revólver .45",             category: "pistola", skillId: "armas_pistola", skillName: "Armas de Fogo (Pistolas)", damage: "1D10+2", addDB: false, range: "15 m", attacks: "1 (3)", ammo: 6, cost1920: "$30", costModern: "$300", eras: ["1920s", "modern"] },
  { id: "auto45",  name: ".45 automática (Colt M1911)", category: "pistola", skillId: "armas_pistola", skillName: "Armas de Fogo (Pistolas)", damage: "1D10+2", addDB: false, range: "15 m", attacks: "1 (3)", ammo: 7, cost1920: "$40", costModern: "$375", eras: ["1920s", "modern"] },
  { id: "beretta", name: "Beretta M9 9mm",           category: "pistola", skillId: "armas_pistola", skillName: "Armas de Fogo (Pistolas)", damage: "1D10", addDB: false, range: "15 m", attacks: "1 (3)", ammo: 15, costModern: "$500", eras: ["modern"] },
  { id: "glock",   name: "Glock 17 9mm",             category: "pistola", skillId: "armas_pistola", skillName: "Armas de Fogo (Pistolas)", damage: "1D10", addDB: false, range: "15 m", attacks: "1 (3)", ammo: 17, costModern: "$500", eras: ["modern"] },
  { id: "mag357",  name: "Revólver .357 Magnum",     category: "pistola", skillId: "armas_pistola", skillName: "Armas de Fogo (Pistolas)", damage: "1D8+1D4", addDB: false, range: "15 m", attacks: "1 (3)", ammo: 6, costModern: "$425", eras: ["modern"] },
  { id: "mag44",   name: "Revólver .44 Magnum",      category: "pistola", skillId: "armas_pistola", skillName: "Armas de Fogo (Pistolas)", damage: "1D10+1D4+2", addDB: false, range: "15 m", attacks: "1 (3)", ammo: 6, costModern: "$475", eras: ["modern"] },
  // Rifles
  { id: "rifle22", name: "Rifle de Ferrolho .22",    category: "rifle", skillId: "armas_rifle", skillName: "Armas de Fogo (Rifles)", damage: "1D6+1", addDB: false, range: "30 m", attacks: "1", ammo: 6, cost1920: "$13", costModern: "$70", eras: ["1920s", "modern"] },
  { id: "carab30", name: "Carabina de Alavanca .30", category: "rifle", skillId: "armas_rifle", skillName: "Armas de Fogo (Rifles)", damage: "2D6", addDB: false, range: "50 m", attacks: "1", ammo: 6, cost1920: "$19", costModern: "$150", eras: ["1920s", "modern"] },
  { id: "leeenf",  name: "Lee-Enfield .303",         category: "rifle", skillId: "armas_rifle", skillName: "Armas de Fogo (Rifles)", damage: "2D6+4", addDB: false, range: "110 m", attacks: "1", ammo: 10, cost1920: "$50", costModern: "$300", eras: ["1920s", "modern"] },
  { id: "bolt3006", name: "Rifle de Ferrolho .30-06", category: "rifle", skillId: "armas_rifle", skillName: "Armas de Fogo (Rifles)", damage: "2D6+4", addDB: false, range: "110 m", attacks: "1", ammo: 5, cost1920: "$75", costModern: "$175", eras: ["1920s", "modern"] },
  { id: "elefante", name: "Rifle de Elefantes",      category: "rifle", skillId: "armas_rifle", skillName: "Armas de Fogo (Rifles)", damage: "3D6+4", addDB: false, range: "100 m", attacks: "1 ou 2", ammo: 2, cost1920: "$400", costModern: "$1.800", eras: ["1920s", "modern"] },
  { id: "ak47",    name: "AK-47 / AKM",              category: "rifle", skillId: "armas_rifle", skillName: "Armas de Fogo (Rifles)", damage: "2D6+1", addDB: false, range: "100 m", attacks: "1 (2) / auto", ammo: 30, costModern: "$200", eras: ["modern"] },
  // Espingardas (dano por faixa: perto / médio / longe)
  { id: "esp12",   name: "Espingarda Calibre 12 (2 canos)", category: "espingarda", skillId: "armas_rifle", skillName: "Armas de Fogo (Espingardas)", damage: "4D6/2D6/1D6", addDB: false, range: "10/20/50 m", attacks: "1 ou 2", ammo: 2, cost1920: "$40", costModern: "$200", eras: ["1920s", "modern"] },
  { id: "escDesl", name: "Escopeta Calibre 12 (deslizante)", category: "espingarda", skillId: "armas_rifle", skillName: "Armas de Fogo (Espingardas)", damage: "4D6/2D6/1D6", addDB: false, range: "10/20/50 m", attacks: "1", ammo: 5, costModern: "$100", eras: ["modern"] },
];

export function getWeaponsForEra(era: "1920s" | "modern"): Weapon[] {
  return WEAPONS.filter((w) => w.eras.includes(era));
}

export const WEAPON_CATEGORY_LABELS: Record<WeaponCategory, string> = {
  corpo:      "Corpo a Corpo",
  arremesso:  "Arremesso",
  pistola:    "Pistolas",
  rifle:      "Rifles",
  espingarda: "Espingardas",
};

// Roll a weapon's damage, applying the character's Damage Bonus (DX) when relevant.
// Returns one segment per "/" in the damage string (shotgun range bands).
export function rollWeaponDamage(weapon: Weapon, attrs: CthulhuAttrs): { label?: string; result: RollResult }[] {
  const db = calcDamageBonus(attrs); // "-2" | "-1" | "Nenhum" | "+1D4" | "+1D6" | "+2D6"
  const dbExpr = db === "Nenhum" ? "" : db.replace("+", "");
  const dbRoll = dbExpr ? rollExpr(dbExpr) : { total: 0, rolls: [] as number[], expr: "" };

  const segments = weapon.damage.split("/");
  const bandLabels = segments.length === 3 ? ["Perto", "Médio", "Longe"] : segments.map(() => undefined);

  return segments.map((seg, i) => {
    const base = rollExpr(seg);
    let total = base.total;
    const rolls = [...base.rolls];
    if (weapon.addDB && dbExpr) {
      total += dbRoll.total;
      rolls.push(...dbRoll.rolls);
    } else if (weapon.halfDB && dbExpr) {
      const h = Math.trunc(dbRoll.total / 2);
      total += h;
    }
    return {
      label: bandLabels[i],
      result: { total: Math.max(0, total), rolls, expr: seg + (weapon.addDB && dbExpr ? `${db}` : "") },
    };
  });
}
