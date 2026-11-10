// ─── CYBERPUNK RED — dados-base: atributos, papéis, perícias e pacotes ──────
// Só dados tipados, nada de I/O. Os números (tabelas de Streetrat, pacotes de
// perícia) vêm do livro-base; as descrições são paráfrases curtas, nunca o
// texto do livro. Chaves de perícia especializada usam "base:especialidade"
// (ex.: "language:streetslang"), igual ao JSON `skills` da ficha no banco.

export const STAT_KEYS = ["int", "ref", "dex", "tech", "cool", "will", "luck", "move", "body", "emp"] as const;
export type StatKey = (typeof STAT_KEYS)[number];
export type Stats = Record<StatKey, number>;

export interface StatDef {
  key: StatKey;
  name: string;
  nameEn: string;
  short: string;
  group: "mental" | "combate" | "fortuna" | "fisico";
  desc: string;
}

export const STATS: StatDef[] = [
  { key: "int", name: "Inteligência", nameEn: "Intelligence", short: "INT", group: "mental", desc: "Conhecimento, percepção e perícias de educação; também move os programas da NET." },
  { key: "ref", name: "Reflexos", nameEn: "Reflexes", short: "REF", group: "combate", desc: "Ataques à distância, direção e pilotagem; base da iniciativa. Com REF 8+ dá para desviar de balas." },
  { key: "dex", name: "Destreza", nameEn: "Dexterity", short: "DES", group: "combate", desc: "Combate corpo a corpo, evasão, atletismo e furtividade." },
  { key: "tech", name: "Técnica", nameEn: "Technique", short: "TEC", group: "mental", desc: "Consertos, fabricação, tecnologia médica e instrumentos." },
  { key: "cool", name: "Autocontrole", nameEn: "Cool", short: "AUT", group: "mental", desc: "Pressão social, persuasão, suborno, estilo e interrogatório." },
  { key: "will", name: "Vontade", nameEn: "Willpower", short: "VON", group: "mental", desc: "Concentração e resistência; entra na fórmula do HP." },
  { key: "luck", name: "Sorte", nameEn: "Luck", short: "SOR", group: "fortuna", desc: "Reserva de pontos gastos para somar +1 por ponto numa rolagem; recarrega a cada sessão." },
  { key: "move", name: "Movimento", nameEn: "Move", short: "MOV", group: "fisico", desc: "Distância andada: MOVIMENTO × 2 m por Ação de Movimento." },
  { key: "body", name: "Corpo", nameEn: "Body", short: "COR", group: "fisico", desc: "HP, Salvaguarda contra a Morte e dano de briga." },
  { key: "emp", name: "Empatia", nameEn: "Empathy", short: "EMP", group: "mental", desc: "Perícias sociais de leitura de pessoas; Humanidade = EMP × 10." },
];

// ─── Papéis ─────────────────────────────────────────────────────────────────

export type RoleKey =
  | "rockerboy" | "solo" | "netrunner" | "tech" | "medtech"
  | "media" | "exec" | "lawman" | "fixer" | "nomad";

export interface RoleDef {
  key: RoleKey;
  name: string;
  nameEn: string;
  abilityKey: string;
  abilityName: string;
  abilityNameEn: string;
  /** Paráfrase curta do que a habilidade de papel faz. */
  abilityShort: string;
}

export const ROLES: RoleDef[] = [
  { key: "rockerboy", name: "Roqueiro", nameEn: "Rockerboy", abilityKey: "charismaticImpact", abilityName: "Impacto Carismático", abilityNameEn: "Charismatic Impact", abilityShort: "Conquista fãs e convence plateias: Grau + 1d10 contra uma DV que cresce com o tamanho do grupo." },
  { key: "solo", name: "Solo", nameEn: "Solo", abilityKey: "combatAwareness", abilityName: "Percepção de Combate", abilityNameEn: "Combat Awareness", abilityShort: "Distribui pontos de Grau entre habilidades de combate (deflexão de dano, iniciativa, ataque de precisão, detectar ameaças)." },
  { key: "netrunner", name: "Netrunner", nameEn: "Netrunner", abilityKey: "interface", abilityName: "Interface", abilityNameEn: "Interface", abilityShort: "Invade a NET: o Grau soma nas habilidades de Interface e define as Ações de NET por turno (2 a 5)." },
  { key: "tech", name: "Técnico", nameEn: "Tech", abilityKey: "maker", abilityName: "Inventor", abilityNameEn: "Maker", abilityShort: "Cada Grau melhora duas especialidades de conserto, melhoria, fabricação e invenção." },
  { key: "medtech", name: "Médico", nameEn: "Medtech", abilityKey: "medicine", abilityName: "Medicina", abilityNameEn: "Medicine", abilityShort: "Cada Grau dá 1 ponto numa especialidade: Cirurgia, Farmacêuticos ou Criossistemas." },
  { key: "media", name: "Mídia", nameEn: "Media", abilityKey: "credibility", abilityName: "Credibilidade", abilityNameEn: "Credibility", abilityShort: "Chance de ser acreditado (em d10) e alcance de audiência crescem com o Grau; permite espalhar boatos." },
  { key: "exec", name: "Executivo", nameEn: "Exec", abilityKey: "teamwork", abilityName: "Trabalho em Equipe", abilityNameEn: "Teamwork", abilityShort: "Recursos e cargos da corporação (moradia, plano de saúde) e até três membros de equipe com lealdade." },
  { key: "lawman", name: "Policial", nameEn: "Lawman", abilityKey: "backup", abilityName: "Reforços", abilityNameEn: "Backup", abilityShort: "Chama reforços rolando d10 ≤ Grau; a qualidade da equipe cresce com o Grau e chega em 1d6 rodadas." },
  { key: "fixer", name: "Fixer", nameEn: "Fixer", abilityKey: "operator", abilityName: "Operador", abilityNameEn: "Operator", abilityShort: "Barganha preços e paga mais por trabalhos; o Grau define o alcance de fontes, contatos e itens obtidos." },
  { key: "nomad", name: "Nômade", nameEn: "Nomad", abilityKey: "moto", abilityName: "Moto", abilityNameEn: "Moto", abilityShort: "Soma o Grau a testes de dirigir/pilotar e de mecânica de veículos; cada Grau dá ou melhora um veículo da Família." },
];

export const ROLE_KEYS = ROLES.map((r) => r.key) as RoleKey[];

export function getRole(key: string): RoleDef | undefined {
  return ROLES.find((r) => r.key === key);
}

/** Todo personagem inicial começa com Grau de Papel 4. */
export const STARTING_ROLE_RANK = 4;
export const STARTING_EUROBUCKS_STREETRAT = 500;
export const COMPLETE_PACKAGE_GEAR_EB = 2550;
export const COMPLETE_PACKAGE_FASHION_EB = 800;
export const COMPLETE_STAT_POINTS = 62;
export const COMPLETE_SKILL_POINTS = 86;
export const STAT_MIN = 2;
export const STAT_MAX = 8;
export const SKILL_MAX_AT_CREATION = 6;

// ─── Perícias ───────────────────────────────────────────────────────────────

export type SkillCategory =
  | "awareness" | "body" | "control" | "education" | "fighting"
  | "performance" | "ranged" | "social" | "technique";

export const SKILL_CATEGORIES: Record<SkillCategory, string> = {
  awareness: "Percepção",
  body: "Corpo",
  control: "Controle",
  education: "Educação",
  fighting: "Luta",
  performance: "Atuação",
  ranged: "Armas de Longo Alcance",
  social: "Social",
  technique: "Técnica",
};

export interface SkillDef {
  key: string;
  name: string;
  nameEn: string;
  category: SkillCategory;
  stat: StatKey;
  /** Perícias ×2 custam o dobro por nível. */
  x2: boolean;
  /** Perícias básicas começam em nível 2 para todo mundo. */
  basic: boolean;
  /** Pede uma especialidade (idioma, ciência, instrumento…): a chave vira "base:especialidade". */
  specialised?: boolean;
}

const S = (
  key: string, name: string, nameEn: string, category: SkillCategory, stat: StatKey,
  extra: { x2?: boolean; basic?: boolean; specialised?: boolean } = {},
): SkillDef => ({ key, name, nameEn, category, stat, x2: !!extra.x2, basic: !!extra.basic, specialised: extra.specialised });

export const SKILLS: SkillDef[] = [
  // Percepção
  S("concentration", "Concentração", "Concentration", "awareness", "will", { basic: true }),
  S("concealReveal", "Ocultar/Revelar Objeto", "Conceal/Reveal Object", "awareness", "int"),
  S("lipReading", "Leitura Labial", "Lip Reading", "awareness", "int"),
  S("perception", "Percepção", "Perception", "awareness", "int", { basic: true }),
  S("tracking", "Rastrear", "Tracking", "awareness", "int"),
  // Corpo
  S("athletics", "Atletismo", "Athletics", "body", "dex", { basic: true }),
  S("contortionist", "Contorcionismo", "Contortionist", "body", "dex"),
  S("dance", "Dança", "Dance", "body", "dex"),
  S("endurance", "Resistência", "Endurance", "body", "will"),
  S("resistTorture", "Resistir a Tortura/Drogas", "Resist Torture/Drugs", "body", "will"),
  S("stealth", "Furtividade", "Stealth", "body", "dex", { basic: true }),
  // Controle
  S("driveLand", "Dirigir Veículo Terrestre", "Drive Land Vehicle", "control", "ref"),
  S("pilotAir", "Pilotar Veículo Aéreo", "Pilot Air Vehicle", "control", "ref", { x2: true }),
  S("pilotSea", "Pilotar Veículo Aquático", "Pilot Sea Vehicle", "control", "ref"),
  S("riding", "Montaria", "Riding", "control", "ref"),
  // Educação
  S("accounting", "Contabilidade", "Accounting", "education", "int"),
  S("animalHandling", "Lidar com Animais", "Animal Handling", "education", "int"),
  S("bureaucracy", "Burocracia", "Bureaucracy", "education", "int"),
  S("business", "Negócios", "Business", "education", "int"),
  S("composition", "Composição", "Composition", "education", "int"),
  S("criminology", "Criminologia", "Criminology", "education", "int"),
  S("cryptography", "Criptografia", "Cryptography", "education", "int"),
  S("deduction", "Dedução", "Deduction", "education", "int"),
  S("education", "Educação", "Education", "education", "int", { basic: true }),
  S("gamble", "Jogatina", "Gamble", "education", "int"),
  S("language", "Idioma (especificar)", "Language (specify)", "education", "int", { specialised: true, basic: true }),
  S("librarySearch", "Pesquisa", "Library Search", "education", "int"),
  S("localExpert", "Conhecimento Local (especificar)", "Local Expert (specify)", "education", "int", { specialised: true, basic: true }),
  S("science", "Ciência (especificar)", "Science (specify)", "education", "int", { specialised: true }),
  S("tactics", "Táticas", "Tactics", "education", "int"),
  S("wildernessSurvival", "Sobrevivência na Natureza", "Wilderness Survival", "education", "int"),
  // Luta
  S("brawling", "Briga", "Brawling", "fighting", "dex", { basic: true }),
  S("evasion", "Evasão", "Evasion", "fighting", "dex", { basic: true }),
  S("martialArts", "Artes Marciais (especificar)", "Martial Arts (specify)", "fighting", "dex", { x2: true, specialised: true }),
  S("meleeWeapon", "Arma Branca", "Melee Weapon", "fighting", "dex"),
  // Atuação
  S("acting", "Atuação", "Acting", "performance", "cool"),
  S("playInstrument", "Tocar Instrumento (especificar)", "Play Instrument (specify)", "performance", "tech", { specialised: true }),
  // Armas de longo alcance
  S("archery", "Arquearia", "Archery", "ranged", "ref"),
  S("autofire", "Fogo Automático", "Autofire", "ranged", "ref", { x2: true }),
  S("handgun", "Arma de Mão", "Handgun", "ranged", "ref"),
  S("heavyWeapons", "Armas Pesadas", "Heavy Weapons", "ranged", "ref", { x2: true }),
  S("shoulderArms", "Armas de Ombro", "Shoulder Arms", "ranged", "ref"),
  // Social
  S("bribery", "Suborno", "Bribery", "social", "cool"),
  S("conversation", "Conversação", "Conversation", "social", "emp", { basic: true }),
  S("humanPerception", "Percepção Humana", "Human Perception", "social", "emp", { basic: true }),
  S("interrogation", "Interrogatório", "Interrogation", "social", "cool"),
  S("persuasion", "Persuasão", "Persuasion", "social", "cool", { basic: true }),
  S("personalGrooming", "Cuidados Pessoais", "Personal Grooming", "social", "cool"),
  S("streetwise", "Malandragem", "Streetwise", "social", "cool"),
  S("trading", "Comércio", "Trading", "social", "cool"),
  S("wardrobeStyle", "Guarda-Roupa e Estilo", "Wardrobe & Style", "social", "cool"),
  // Técnica
  S("airVehicleTech", "Mecânica de Veículos Aéreos", "Air Vehicle Tech", "technique", "tech"),
  S("basicTech", "Tecnologia Básica", "Basic Tech", "technique", "tech"),
  S("cybertech", "Cibertecnologia", "Cybertech", "technique", "tech"),
  S("demolitions", "Demolição", "Demolitions", "technique", "tech", { x2: true }),
  S("electronicsSecurity", "Eletrônica/Segurança", "Electronics/Security Tech", "technique", "tech", { x2: true }),
  S("firstAid", "Primeiros Socorros", "First Aid", "technique", "tech", { basic: true }),
  S("forgery", "Falsificação", "Forgery", "technique", "tech"),
  S("landVehicleTech", "Mecânica de Veículos Terrestres", "Land Vehicle Tech", "technique", "tech"),
  S("paintDrawSculpt", "Pintura/Desenho/Escultura", "Paint/Draw/Sculpt", "technique", "tech"),
  S("paramedic", "Paramédico", "Paramedic", "technique", "tech", { x2: true }),
  S("photographyFilm", "Fotografia/Filmagem", "Photography/Film", "technique", "tech"),
  S("pickLock", "Arrombamento", "Pick Lock", "technique", "tech"),
  S("pickPocket", "Punga", "Pick Pocket", "technique", "tech"),
  S("seaVehicleTech", "Mecânica de Veículos Aquáticos", "Sea Vehicle Tech", "technique", "tech"),
  S("weaponstech", "Armeiro", "Weaponstech", "technique", "tech"),
];

export const SKILLS_MAP: Record<string, SkillDef> = Object.fromEntries(SKILLS.map((s) => [s.key, s]));

export const BASIC_SKILL_KEYS = SKILLS.filter((s) => s.basic).map((s) => s.key);

/** Perícias exclusivas de papel (não se compram normalmente): Cirurgia e Tecnologia Médica do Médico. */
export const ROLE_ONLY_SKILLS = [
  { key: "surgery", name: "Cirurgia", nameEn: "Surgery", stat: "tech" as StatKey },
  { key: "medicalTech", name: "Tecnologia Médica", nameEn: "Medical Tech", stat: "tech" as StatKey },
];

/** "language:streetslang" → "language". */
export function skillBaseKey(key: string): string {
  const i = key.indexOf(":");
  return i < 0 ? key : key.slice(0, i);
}

export function getSkillDef(key: string): SkillDef | undefined {
  return SKILLS_MAP[skillBaseKey(key)];
}

/** Custo em pontos de um nível de perícia na criação: 1 por nível, 2 se for ×2. */
export function skillPointCost(key: string, level: number): number {
  const def = getSkillDef(key);
  return level * (def?.x2 ? 2 : 1);
}

// ─── Streetrat (Método 1): rola 1d10 e copia a linha inteira ───────────────
// Ordem das colunas: INT REF DES TEC AUT VON SOR MOV COR EMP (STAT_KEYS).

export const STREETRAT_STATS: Record<RoleKey, number[][]> = {
  rockerboy: [
    [7, 6, 6, 5, 6, 8, 7, 7, 3, 8], [3, 7, 7, 7, 7, 6, 7, 7, 5, 8], [4, 5, 7, 7, 6, 6, 7, 7, 5, 8],
    [4, 5, 7, 7, 6, 8, 7, 6, 3, 8], [3, 7, 7, 7, 6, 8, 6, 5, 4, 7], [5, 6, 7, 5, 7, 8, 5, 7, 3, 7],
    [5, 6, 6, 7, 7, 8, 7, 6, 3, 6], [5, 7, 7, 5, 6, 6, 6, 6, 4, 8], [3, 5, 5, 6, 7, 8, 7, 5, 5, 7],
    [4, 5, 6, 5, 8, 8, 7, 6, 4, 7],
  ],
  solo: [
    [6, 7, 7, 3, 8, 6, 5, 5, 6, 5], [7, 8, 6, 3, 6, 6, 7, 5, 6, 6], [5, 8, 7, 4, 7, 7, 6, 7, 8, 5],
    [5, 8, 6, 4, 6, 7, 6, 5, 7, 6], [6, 6, 7, 5, 7, 6, 7, 6, 8, 4], [7, 7, 6, 5, 7, 6, 6, 7, 7, 5],
    [7, 7, 6, 5, 6, 7, 7, 6, 6, 6], [7, 8, 7, 5, 6, 6, 5, 6, 8, 4], [7, 7, 6, 4, 6, 6, 6, 5, 6, 5],
    [6, 6, 8, 5, 6, 6, 5, 6, 6, 5],
  ],
  netrunner: [
    [5, 8, 7, 7, 7, 4, 8, 7, 7, 4], [5, 6, 7, 5, 8, 3, 8, 7, 5, 5], [5, 6, 8, 6, 6, 4, 7, 6, 7, 4],
    [5, 7, 7, 7, 7, 5, 8, 6, 5, 5], [5, 8, 8, 5, 7, 3, 7, 5, 5, 6], [6, 6, 6, 7, 8, 4, 7, 7, 6, 6],
    [6, 6, 6, 7, 6, 5, 7, 7, 7, 6], [5, 7, 8, 6, 8, 4, 8, 5, 7, 4], [7, 6, 7, 7, 6, 3, 6, 5, 6, 5],
    [7, 8, 6, 6, 6, 4, 7, 7, 5, 6],
  ],
  tech: [
    [6, 7, 7, 8, 4, 4, 5, 5, 7, 6], [7, 6, 6, 7, 5, 3, 7, 7, 5, 5], [8, 6, 5, 7, 5, 4, 7, 7, 5, 7],
    [7, 8, 7, 8, 4, 4, 6, 5, 6, 7], [6, 6, 7, 6, 4, 3, 7, 7, 6, 6], [8, 7, 5, 6, 3, 3, 7, 6, 6, 7],
    [8, 6, 7, 8, 4, 4, 7, 6, 7, 6], [8, 8, 7, 8, 5, 4, 6, 5, 6, 6], [6, 6, 7, 8, 3, 3, 5, 7, 7, 7],
    [8, 8, 5, 6, 4, 4, 6, 5, 6, 6],
  ],
  medtech: [
    [7, 5, 6, 7, 5, 3, 8, 5, 5, 7], [6, 7, 7, 7, 4, 4, 6, 7, 7, 7], [6, 5, 5, 8, 5, 3, 8, 5, 7, 8],
    [8, 7, 6, 8, 3, 5, 6, 6, 5, 7], [6, 7, 5, 7, 5, 5, 8, 7, 6, 8], [8, 5, 5, 8, 5, 5, 6, 6, 5, 6],
    [8, 6, 5, 8, 5, 4, 8, 5, 7, 7], [6, 5, 7, 7, 3, 5, 8, 5, 5, 8], [6, 6, 7, 7, 5, 4, 6, 6, 5, 6],
    [8, 7, 6, 6, 3, 4, 8, 7, 6, 7],
  ],
  media: [
    [6, 6, 5, 5, 8, 7, 5, 7, 5, 7], [8, 7, 7, 3, 6, 6, 6, 5, 6, 8], [6, 7, 7, 5, 6, 8, 5, 5, 5, 7],
    [6, 5, 7, 5, 6, 7, 5, 5, 6, 6], [6, 6, 7, 4, 8, 7, 6, 7, 5, 8], [7, 5, 5, 4, 8, 7, 6, 7, 5, 8],
    [8, 5, 6, 3, 7, 6, 6, 5, 6, 7], [6, 5, 6, 5, 6, 8, 6, 6, 7, 8], [7, 7, 5, 4, 6, 7, 6, 5, 6, 7],
    [7, 6, 6, 3, 7, 6, 7, 6, 7, 6],
  ],
  lawman: [
    [5, 6, 7, 5, 7, 8, 5, 6, 5, 6], [6, 6, 6, 5, 6, 8, 5, 7, 5, 5], [5, 7, 7, 7, 6, 7, 5, 5, 7, 6],
    [6, 6, 7, 6, 6, 8, 5, 7, 7, 6], [6, 6, 7, 6, 7, 7, 6, 5, 5, 6], [7, 6, 5, 5, 7, 8, 5, 6, 7, 4],
    [7, 8, 7, 5, 6, 8, 7, 6, 5, 4], [5, 6, 6, 5, 6, 8, 5, 7, 6, 4], [7, 7, 5, 5, 7, 7, 6, 5, 5, 6],
    [6, 6, 5, 6, 8, 7, 5, 7, 6, 6],
  ],
  exec: [
    [8, 5, 5, 3, 8, 6, 6, 5, 5, 7], [8, 6, 6, 4, 7, 6, 7, 7, 5, 7], [8, 7, 6, 3, 8, 6, 7, 6, 4, 5],
    [8, 5, 7, 5, 6, 5, 6, 5, 5, 7], [7, 7, 6, 5, 8, 5, 7, 7, 5, 6], [5, 7, 7, 3, 6, 7, 6, 5, 5, 7],
    [6, 6, 7, 5, 8, 7, 6, 7, 4, 6], [6, 7, 7, 3, 7, 5, 7, 5, 5, 7], [7, 6, 7, 5, 7, 5, 7, 6, 5, 5],
    [7, 7, 5, 5, 8, 6, 6, 7, 4, 7],
  ],
  fixer: [
    [8, 5, 7, 4, 6, 5, 8, 5, 5, 8], [8, 5, 5, 5, 6, 7, 8, 7, 5, 7], [6, 6, 6, 4, 5, 6, 8, 6, 3, 8],
    [7, 7, 5, 5, 7, 6, 7, 7, 5, 8], [8, 6, 6, 3, 6, 5, 8, 7, 5, 6], [8, 7, 5, 5, 6, 7, 7, 5, 3, 6],
    [8, 6, 6, 5, 6, 5, 6, 7, 5, 8], [6, 6, 7, 4, 7, 6, 7, 7, 4, 7], [8, 7, 7, 5, 5, 5, 7, 6, 5, 7],
    [6, 5, 6, 5, 5, 6, 8, 6, 4, 7],
  ],
  nomad: [
    [6, 6, 8, 3, 6, 7, 6, 6, 6, 4], [5, 7, 6, 5, 8, 8, 8, 7, 5, 4], [5, 8, 6, 3, 8, 7, 6, 5, 6, 5],
    [5, 8, 7, 4, 8, 6, 7, 7, 7, 5], [6, 6, 6, 3, 6, 7, 6, 7, 7, 4], [7, 6, 8, 4, 6, 7, 6, 5, 6, 5],
    [6, 7, 8, 4, 6, 6, 7, 5, 7, 5], [5, 7, 8, 3, 8, 6, 7, 5, 5, 5], [6, 7, 6, 4, 8, 6, 6, 6, 6, 6],
    [5, 6, 7, 4, 7, 8, 7, 7, 7, 4],
  ],
};

/** Converte uma linha da tabela (ordem STAT_KEYS) em objeto de atributos. */
export function statsFromRow(row: number[]): Stats {
  const out = {} as Stats;
  STAT_KEYS.forEach((k, i) => { out[k] = row[i]; });
  return out;
}

// ─── Pacotes de perícia (Streetrat = Edgerunner: 20 perícias, 86 pontos) ───
// Tabela das 13 básicas: uma linha por perícia, colunas na ordem de TABLE_ROLES.

const TABLE_ROLES: RoleKey[] = ["rockerboy", "solo", "netrunner", "tech", "medtech", "media", "lawman", "exec", "fixer", "nomad"];

const BASIC_TABLE: Record<string, number[]> = {
  athletics: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  brawling: [6, 2, 2, 2, 2, 2, 6, 2, 2, 6],
  concentration: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  conversation: [2, 2, 2, 2, 6, 6, 6, 6, 6, 2],
  education: [2, 2, 6, 6, 6, 2, 2, 6, 2, 2],
  evasion: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  firstAid: [6, 6, 2, 6, 2, 2, 2, 2, 2, 6],
  humanPerception: [6, 2, 2, 2, 6, 6, 2, 6, 6, 2],
  "language:streetslang": [2, 2, 2, 2, 2, 2, 2, 2, 4, 2],
  "localExpert:yourHome": [4, 2, 2, 2, 2, 6, 2, 2, 6, 2],
  perception: [2, 6, 2, 2, 2, 6, 2, 2, 2, 4],
  persuasion: [6, 2, 2, 2, 2, 6, 2, 6, 4, 2],
  stealth: [2, 2, 6, 2, 2, 2, 2, 2, 2, 6],
};

/** Perícias de papel com nível fixo (as ×2 já são contadas em dobro no custo). */
const ROLE_SKILLS: Record<RoleKey, Record<string, number>> = {
  rockerboy: { composition: 6, handgun: 6, meleeWeapon: 6, personalGrooming: 4, streetwise: 6, wardrobeStyle: 4 },
  solo: { autofire: 6, handgun: 6, interrogation: 6, meleeWeapon: 6, resistTorture: 6, shoulderArms: 6, tactics: 6 },
  netrunner: { basicTech: 6, concealReveal: 6, cryptography: 6, cybertech: 6, electronicsSecurity: 6, handgun: 6, librarySearch: 6 },
  tech: { basicTech: 6, cybertech: 6, electronicsSecurity: 6, landVehicleTech: 6, shoulderArms: 6, weaponstech: 6 },
  medtech: { basicTech: 6, cybertech: 4, deduction: 6, paramedic: 6, resistTorture: 4, shoulderArms: 6 },
  media: { bribery: 6, composition: 6, deduction: 6, handgun: 6, librarySearch: 4, lipReading: 4, photographyFilm: 4 },
  lawman: { autofire: 6, criminology: 6, deduction: 6, handgun: 6, interrogation: 6, shoulderArms: 6, tracking: 6 },
  exec: { accounting: 6, bureaucracy: 6, business: 6, deduction: 6, handgun: 6, lipReading: 6, personalGrooming: 4 },
  fixer: { bribery: 6, business: 6, forgery: 6, handgun: 6, pickLock: 4, streetwise: 6, trading: 6 },
  nomad: { animalHandling: 6, driveLand: 6, handgun: 6, meleeWeapon: 6, tracking: 6, trading: 6, wildernessSurvival: 6 },
};

/** Perícias cuja especialidade o jogador escolhe (entra no pacote só depois da escolha). */
export const ROLE_SKILL_CHOICES: Record<RoleKey, { skill: string; level: number; hint: string }[]> = {
  rockerboy: [{ skill: "playInstrument", level: 6, hint: "Instrumento à escolha" }],
  solo: [],
  netrunner: [],
  tech: [{ skill: "science", level: 6, hint: "Ciência à escolha" }],
  medtech: [{ skill: "science", level: 6, hint: "Ciência à escolha" }],
  media: [],
  lawman: [],
  exec: [],
  fixer: [],
  nomad: [],
};

function buildPackage(role: RoleKey): Record<string, number> {
  const col = TABLE_ROLES.indexOf(role);
  const pkg: Record<string, number> = {};
  for (const [k, row] of Object.entries(BASIC_TABLE)) pkg[k] = row[col];
  return { ...pkg, ...ROLE_SKILLS[role] };
}

/** Pacote fixo de cada papel (sem as perícias de especialidade escolhida e sem o idioma cultural +4). */
export const ROLE_SKILL_PACKAGES: Record<RoleKey, Record<string, number>> = Object.fromEntries(
  ROLE_KEYS.map((r) => [r, buildPackage(r)]),
) as Record<RoleKey, Record<string, number>>;

// ─── Kits iniciais (Streetrat/Edgerunner) ──────────────────────────────────
// Cada linha referencia chaves dos catálogos (weapons/armor/gear/cyberware).
// `alt` são as alternativas do "ou" impresso no livro. A integridade das chaves
// é verificada no teste.

export interface KitEntry {
  key: string;
  qty?: number;
  alt?: string[];
}

export interface RoleKit {
  weapons: KitEntry[];
  armor: KitEntry[];
  gear: KitEntry[];
  cyberware: KitEntry[];
  /** Roupas/moda: texto livre (não é catalogado). */
  fashion: string;
}

const LA: KitEntry[] = [{ key: "lightArmorjack", qty: 2 }]; // 1 corpo + 1 cabeça

export const ROLE_KITS: Record<RoleKey, RoleKit> = {
  rockerboy: {
    weapons: [{ key: "vhPistol" }, { key: "ammo_vhPistol", qty: 50 }, { key: "heavyMelee", alt: ["grenadeFlashbang"] }, { key: "grenadeTeargas", qty: 2 }],
    armor: LA,
    gear: [{ key: "agent" }, { key: "computer" }, { key: "electricGuitar", alt: ["bugDetector"] }, { key: "glowPaint", qty: 5 }, { key: "pocketAmp" }, { key: "radioScanner" }, { key: "videoCamera" }],
    cyberware: [{ key: "audioRecorder" }, { key: "biomonitor" }, { key: "chemskin" }, { key: "cyberaudioSuite" }, { key: "techhair" }],
    fashion: "Chique Genérico (jaqueta, 3 joias, 4 blusas); Casual (joia, óculos espelhados, calçado); Urbano Chamativo (calça, blusa)",
  },
  solo: {
    weapons: [{ key: "assaultRifle" }, { key: "vhPistol" }, { key: "heavyMelee", alt: ["bulletproofShield"] }, { key: "ammo_vhPistol", qty: 30 }, { key: "ammo_rifle", qty: 70 }],
    armor: LA,
    gear: [{ key: "agent" }],
    cyberware: [{ key: "biomonitor" }, { key: "neuralLink" }, { key: "sandevistan", alt: ["wolvers"] }],
    fashion: "Casual (2 calçados, 3 jaquetas, óculos espelhados, 2 calças, 2 blusas)",
  },
  netrunner: {
    weapons: [{ key: "vhPistol" }, { key: "ammo_vhPistol", qty: 30 }],
    armor: LA,
    gear: [{ key: "agent" }, { key: "cyberdeck" }, { key: "virtualityGoggles" }],
    cyberware: [{ key: "interfacePlugs" }, { key: "neuralLink" }, { key: "shiftTacts" }],
    fashion: "Chique Genérico (10 blusas); Casual (2 calçados, joia, 2 calças); Urbano Chamativo (jaqueta)",
  },
  tech: {
    weapons: [{ key: "shotgun", alt: ["assaultRifle"] }, { key: "ammo_slug", qty: 100, alt: ["ammo_rifle"] }, { key: "grenadeFlashbang" }],
    armor: LA,
    gear: [{ key: "agent" }, { key: "antiSmogMask" }, { key: "disposablePhone" }, { key: "ductTape", qty: 5 }, { key: "flashlight" }, { key: "roadFlare", qty: 6 }, { key: "techBag" }],
    cyberware: [{ key: "cybereye" }, { key: "microOptics" }, { key: "skinwatch" }, { key: "toolHand" }],
    fashion: "Chique Genérico (8 calças, 10 blusas); Casual (2 calçados)",
  },
  medtech: {
    weapons: [{ key: "shotgun", alt: ["assaultRifle"] }, { key: "ammo_slug", qty: 100, alt: ["ammo_rifle"] }, { key: "ammoIncendiary", qty: 10 }, { key: "grenadeSmoke", qty: 2 }],
    armor: [{ key: "lightArmorjack", qty: 2 }, { key: "bulletproofShield" }],
    gear: [{ key: "agent" }, { key: "airhypo" }, { key: "handcuffs" }, { key: "flashlight" }, { key: "glowPaint" }, { key: "medtechBag" }],
    cyberware: [{ key: "biomonitor" }, { key: "cybereye" }, { key: "nasalFilters", alt: ["toxinBinders"] }, { key: "teleOptics" }],
    fashion: "Chique Genérico (3 jaquetas); Casual (calçado, 3 calças, 5 blusas)",
  },
  media: {
    weapons: [{ key: "hPistol", alt: ["vhPistol"] }, { key: "ammo_hPistol", qty: 50, alt: ["ammo_vhPistol"] }],
    armor: LA,
    gear: [{ key: "agent" }, { key: "audioRecorder" }, { key: "binoculars" }, { key: "disposablePhone", qty: 2, alt: ["grappleGun"] }, { key: "flashlight" }, { key: "computer" }, { key: "radioScanner" }, { key: "scrambler" }, { key: "videoCamera" }],
    cyberware: [{ key: "amplifiedHearing", alt: ["voiceStressAnalyzer"] }, { key: "cyberaudioSuite" }, { key: "lightTattoo" }],
    fashion: "Chique Genérico (calçado, calça, blusa); Casual (jaqueta); Urbano Chamativo (óculos espelhados)",
  },
  lawman: {
    weapons: [{ key: "assaultRifle", alt: ["shotgun"] }, { key: "hPistol" }, { key: "ammo_rifle", qty: 100, alt: ["ammo_shell", "ammo_slug"] }, { key: "ammo_hPistol", qty: 30 }, { key: "bulletproofShield", alt: ["grenadeSmoke"] }],
    armor: LA,
    gear: [{ key: "agent" }, { key: "flashlight" }, { key: "handcuffs", qty: 2 }, { key: "radioCommunicator" }, { key: "roadFlare", qty: 10 }],
    cyberware: [{ key: "hiddenHolster" }, { key: "subdermalPocket" }],
    fashion: "Chique Genérico (jaqueta, 2 calças, 3 blusas); Casual (2 calçados, 2 jaquetas, 2 calças, óculos espelhados, 2 blusas)",
  },
  exec: {
    weapons: [{ key: "vhPistol" }, { key: "ammo_vhPistol", qty: 50 }],
    armor: LA,
    gear: [{ key: "agent" }, { key: "radioCommunicator", qty: 4 }, { key: "scrambler" }],
    cyberware: [{ key: "biomonitor", alt: ["techhair"] }, { key: "cyberaudioSuite" }, { key: "internalAgent" }, { key: "toxinBinders", alt: ["nasalFilters"] }],
    fashion: "Social (calçado, jaqueta, calça, óculos espelhados, blusa, 2 joias)",
  },
  fixer: {
    weapons: [{ key: "hPistol", alt: ["vhPistol"] }, { key: "hPistol", alt: ["vhPistol"] }, { key: "lightMelee" }, { key: "ammo_hPistol", qty: 100, alt: ["ammo_vhPistol"] }],
    armor: LA,
    gear: [{ key: "agent" }, { key: "bugDetector" }, { key: "computer" }, { key: "disposablePhone", qty: 2 }],
    cyberware: [{ key: "cyberaudioSuite" }, { key: "internalAgent" }, { key: "subdermalPocket" }, { key: "voiceStressAnalyzer", alt: ["amplifiedHearing"] }],
    fashion: "Chique Genérico (lentes, joia); Casual (óculos espelhados); Urbano Chamativo (calçado, jaqueta, calça, blusa)",
  },
  nomad: {
    weapons: [{ key: "hPistol", alt: ["vhPistol"] }, { key: "ammo_hPistol", qty: 100, alt: ["ammo_vhPistol"] }, { key: "heavyMelee", alt: ["hPistol"] }],
    armor: LA,
    gear: [{ key: "agent" }, { key: "antiSmogMask" }, { key: "ductTape" }, { key: "flashlight" }, { key: "grappleGun" }, { key: "inflatableBed" }, { key: "medtechBag" }, { key: "radioCommunicator", qty: 2 }, { key: "rope" }, { key: "techtool" }, { key: "tent" }],
    cyberware: [{ key: "interfacePlugs", alt: ["wolvers"] }, { key: "neuralLink" }],
    fashion: "Boêmio (joia); Couro Nômade (4 blusas, 2 calças, 2 calçados, jaqueta, chapéu)",
  },
};
