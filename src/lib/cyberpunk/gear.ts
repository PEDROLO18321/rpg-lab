// ─── CYBERPUNK RED — equipamento, munição, drogas, moradia e custo de vida ──
// Preços em eurodólares (eb). Categorias de preço: Barato 10, Comum 20,
// Custoso 50, Premium 100, Caro 500, Muito Caro 1.000, Luxo 5.000,
// Super Luxo 10.000+. Descrições são paráfrases curtas. Sem I/O.

export const PRICE_CATEGORIES = [
  { key: "cheap", name: "Barato", cost: 10 },
  { key: "everyday", name: "Comum", cost: 20 },
  { key: "costly", name: "Custoso", cost: 50 },
  { key: "premium", name: "Premium", cost: 100 },
  { key: "expensive", name: "Caro", cost: 500 },
  { key: "veryExpensive", name: "Muito Caro", cost: 1000 },
  { key: "luxury", name: "Luxo", cost: 5000 },
  { key: "superLuxury", name: "Super Luxo", cost: 10000 },
] as const;

export interface GearDef {
  key: string;
  name: string;
  nameEn: string;
  cost: number;
  desc: string;
}

const G = (key: string, name: string, nameEn: string, cost: number, desc: string): GearDef => ({ key, name, nameEn, cost, desc });

export const GEAR: GearDef[] = [
  G("agent", "Agente", "Agent", 100, "Smartphone com IA; +2 em Pesquisa."),
  G("airhypo", "Injetor Pneumático", "Airhypo", 50, "Aplica drogas e fármacos."),
  G("antiSmogMask", "Máscara Anti-Smog", "Anti-Smog Breathing Mask", 20, "Filtra toxinas do ar."),
  G("audioRecorder", "Gravador de Áudio", "Audio Recorder", 100, "24 horas de áudio por chip."),
  G("earProtectors", "Protetores Auriculares", "Auto Level Dampening Ear Protectors", 1000, "Imune a sons altos."),
  G("binoculars", "Binóculos", "Binoculars", 50, "Aumento de ×2 ou ×3."),
  G("braindanceViewer", "Visor de Braindance", "Braindance Viewer", 1000, "Para viver braindances."),
  G("bugDetector", "Detector de Escuta", "Bug Detector", 500, "Apita a até 2 m de um grampo."),
  G("carryall", "Bolsa", "Carryall", 20, "Uma bolsa de carga."),
  G("chemicalAnalyzer", "Analisador Químico", "Chemical Analyzer", 1000, "Compara a composição com um banco de dados."),
  G("computer", "Computador", "Computer", 50, "Notebook ou desktop."),
  G("cyberdeck", "Ciberdeck", "Cyberdeck", 500, "Deck básico de netrunner com 7 espaços."),
  G("disposablePhone", "Celular Descartável", "Disposable Cell Phone", 50, "Ligações; fácil de jogar fora."),
  G("drumSynth", "Sintetizador de Bateria", "Drum Synthesizer", 500, "Qualquer som de bateria; precisa de amplificador."),
  G("ductTape", "Fita Silver Tape", "Duct Tape", 20, "Rolo de fita."),
  G("electricGuitar", "Guitarra/Instrumento", "Electric Guitar/Other Instrument", 500, "Um instrumento musical."),
  G("flashlight", "Lanterna", "Flashlight", 20, "Feixe de 100 m, 10 horas."),
  G("foodStick", "Barra de Comida", "Food Stick", 10, "Uma refeição horrível."),
  G("glowPaint", "Tinta Neon", "Glow Paint", 20, "Spray que brilha."),
  G("glowStick", "Bastão Luminoso", "Glow Stick", 10, "Luz de 4 m por 10 horas."),
  G("grappleGun", "Arpão de Escalada", "Grapple Gun", 100, "Cabo de 30 m; não é arma."),
  G("handcuffs", "Algemas", "Handcuffs", 50, "Só quebram com CORPO acima de 10."),
  G("homingTracer", "Rastreador", "Homing Tracer", 500, "Segue um rastreador ligado até 1,6 km."),
  G("inflatableBed", "Colchão Inflável e Saco de Dormir", "Inflatable Bed & Sleep-bag", 20, "Cama portátil."),
  G("kibblePack", "Pacote de Ração", "Kibble Pack", 10, "Uma refeição."),
  G("lockPickSet", "Kit de Gazuas", "Lock Picking Set", 20, "Para fechaduras mecânicas."),
  G("medscanner", "Medscanner", "Medscanner", 1000, "+2 em Primeiros Socorros e Paramédico."),
  G("medtechBag", "Maleta Médica", "Medtech Bag", 100, "Kit médico."),
  G("memoryChip", "Chip de Memória", "Memory Chip", 10, "Armazenamento."),
  G("mre", "Ração Militar", "MRE", 10, "Refeição que se aquece sozinha."),
  G("personalCarePak", "Kit de Higiene", "Personal CarePak", 20, "Itens de higiene."),
  G("pocketAmp", "Amplificador de Bolso", "Pocket Amplifier", 50, "Amplifica 2 instrumentos por 6 horas."),
  G("radarDetector", "Detector de Radar", "Radar Detector", 500, "Apita com radar a até 100 m."),
  G("radiationSuit", "Traje Antirradiação", "Radiation Suit", 1000, "Proteção contra radiação."),
  G("radioCommunicator", "Comunicador de Rádio", "Radio Communicator", 100, "Fone de ouvido com alcance de 1,6 km."),
  G("radioScanner", "Rádio/Tocador", "Radio Scanner/Music Player", 50, "Música e rádio em até 1,6 km."),
  G("roadFlare", "Sinalizador", "Road Flare", 10, "Ilumina 100 m por 1 hora."),
  G("rope", "Corda (60 m)", "Rope (60 m)", 20, "Corda de nylon."),
  G("scrambler", "Embaralhador", "Scrambler/Descrambler", 500, "Embaralha comunicações."),
  G("smartGlasses", "Óculos Inteligentes", "Smart Glasses", 500, "Dois espaços de opção ciberóptica."),
  G("techBag", "Maleta de Técnico", "Tech Bag", 500, "Ferramentas de conserto."),
  G("techscanner", "Techscanner", "Techscanner", 1000, "+2 em várias perícias de Técnica."),
  G("techtool", "Ferramenta Multiuso", "Techtool", 100, "Ferramenta multifunção."),
  G("tent", "Barraca e Equipamento de Camping", "Tent and Camping Equipment", 50, "Equipamento de acampamento para uma pessoa."),
  G("vialBiotoxin", "Frasco de Biotoxina", "Vial of Biotoxin", 500, "3d6; resistido por Resistir a Tortura/Drogas; ignora armadura."),
  G("vialPoison", "Frasco de Veneno", "Vial of Poison", 100, "2d6; resistido; ignora armadura."),
  G("videoCamera", "Câmera de Vídeo", "Video Camera", 100, "12 horas de áudio e vídeo por chip."),
  G("virtualityGoggles", "Óculos de Virtualidade", "Virtuality Goggles", 100, "Mostra o ciberespaço."),
];

// ─── Munição ────────────────────────────────────────────────────────────────
// Básica: 10 eb por 10 unidades. Granadas e foguetes são vendidos um a um.
export const BASIC_AMMO: GearDef[] = [
  G("ammo_mPistol", "Munição Básica de Pistola Média (10)", "Basic M Pistol Ammo", 10, "Dez balas."),
  G("ammo_hPistol", "Munição Básica de Pistola Pesada (10)", "Basic H Pistol Ammo", 10, "Dez balas."),
  G("ammo_vhPistol", "Munição Básica de Pistola Muito Pesada (10)", "Basic VH Pistol Ammo", 10, "Dez balas."),
  G("ammo_rifle", "Munição Básica de Fuzil (10)", "Basic Rifle Ammo", 10, "Dez balas."),
  G("ammo_slug", "Munição Básica de Projétil de Escopeta (10)", "Basic Slug Ammo", 10, "Dez projéteis."),
  G("ammo_shell", "Cartuchos Básicos de Escopeta (10)", "Basic Shotgun Shells", 10, "Dez cartuchos."),
  G("ammo_arrow", "Flechas Básicas (10)", "Basic Arrows", 10, "Dez flechas; recuperáveis."),
];

/** Munição especial: custo por 10 unidades (ou unitário para granada/foguete). */
export const SPECIAL_AMMO: (GearDef & { available: string })[] = [
  { ...G("ammoArmorPiercing", "Munição Perfurante", "Armor-Piercing Ammunition", 100, "Ablaciona a armadura em 2 em vez de 1."), available: "todas menos cartucho" },
  { ...G("ammoBiotoxin", "Munição de Biotoxina", "Biotoxin Ammunition", 500, "Sem dano; teste DV15 de Resistir a Tortura/Drogas ou 3d6 direto no HP."), available: "flechas e granadas" },
  { ...G("ammoEmp", "Munição EMP", "EMP Ammunition", 500, "Sem dano; teste DV15 de Cibertecnologia ou 2 itens de ciberware param por 1 minuto."), available: "granadas" },
  { ...G("ammoExpansive", "Munição Expansiva", "Expansive Ammunition", 100, "Objeto Estranho rola um segundo ferimento crítico."), available: "flechas, balas e projéteis" },
  { ...G("ammoFlashbang", "Munição de Estouro de Luz", "Flashbang Ammunition", 100, "Sem dano; teste DV15; falha causa Olho e Ouvido Danificados por 1 minuto."), available: "granadas" },
  { ...G("ammoIncendiary", "Munição Incendiária", "Incendiary Ammunition", 100, "Ao atravessar a armadura, incendeia: 2 de dano direto por turno."), available: "flechas, balas, granadas e cartuchos" },
  { ...G("ammoPoison", "Munição Envenenada", "Poison Ammunition", 100, "Sem dano; teste DV13; falha causa 2d6 direto no HP."), available: "flechas e granadas" },
  { ...G("ammoRubber", "Munição de Borracha", "Rubber Ammunition", 10, "Munição não letal."), available: "flechas, balas e projéteis" },
  { ...G("ammoSleep", "Munição Sonífera", "Sleep Ammunition", 500, "Faz o alvo adormecer."), available: "flechas e granadas" },
  { ...G("ammoSmart", "Munição Inteligente", "Smart Ammunition", 500, "Corrige a mira com smartgun."), available: "flechas, balas e foguetes" },
  { ...G("ammoSmoke", "Munição de Fumaça", "Smoke Ammunition", 50, "Nuvem de fumaça."), available: "granadas" },
  { ...G("ammoTeargas", "Munição de Gás Lacrimogêneo", "Teargas Ammunition", 50, "Nuvem de gás lacrimogêneo."), available: "granadas" },
];

/** Granadas de mão (unitárias), usadas nos kits iniciais. */
export const GRENADES: GearDef[] = [
  G("grenadeFlashbang", "Granada de Estouro de Luz", "Flashbang Grenade", 100, "Cega e ensurdece quem falhar no teste."),
  G("grenadeTeargas", "Granada de Gás Lacrimogêneo", "Teargas Grenade", 50, "Nuvem de gás lacrimogêneo."),
  G("grenadeSmoke", "Granada de Fumaça", "Smoke Grenade", 50, "Nuvem de fumaça."),
];

/** Escudo à prova de balas entra aqui como item (existe também em armor.ts como bloco de HP). */
export const SHIELD_ITEM: GearDef = G("bulletproofShield", "Escudo à Prova de Balas", "Bulletproof Shield", 100, "Absorve 10 de dano antes de você; ocupa um braço.");

export const ALL_GEAR: GearDef[] = [...GEAR, ...BASIC_AMMO, ...SPECIAL_AMMO, ...GRENADES, SHIELD_ITEM];
export const GEAR_MAP: Record<string, GearDef> = Object.fromEntries(ALL_GEAR.map((g) => [g.key, g]));

export function getGear(key: string): GearDef | undefined {
  return GEAR_MAP[key];
}

// ─── Drogas de rua ──────────────────────────────────────────────────────────
// Ao fim do efeito: VON + Resistir a Tortura/Drogas + 1d10 contra a DV
// secundária; falhou, vicia (até terapia).
export interface DrugDef {
  key: string;
  name: string;
  nameEn: string;
  cost: number;
  duration: string;
  primary: string;
  secondaryDv: number;
  secondary: string;
}

export const DRUGS: DrugDef[] = [
  { key: "blackLace", name: "Renda Negra", nameEn: "Black Lace", cost: 50, duration: "24 h", primary: "Perde 2d6 de Humanidade (devolvida se não viciar); ignora penalidades de Gravemente Ferido.", secondaryDv: 17, secondary: "Perda mantida; viciado sofre -2 REF sem a droga." },
  { key: "blueGlass", name: "Vidro Azul", nameEn: "Blue Glass", cost: 20, duration: "4 h", primary: "Alucinações aleatórias que custam a Ação.", secondaryDv: 15, secondary: "Viciado tem alucinações sem a droga." },
  { key: "boost", name: "Boost", nameEn: "Boost", cost: 50, duration: "24 h", primary: "+2 INT (pode passar de 8).", secondaryDv: 17, secondary: "Viciado sofre -2 INT sem a droga." },
  { key: "smash", name: "Smash", nameEn: "Smash", cost: 10, duration: "4 h", primary: "+2 em Dança, Contorcionismo, Conversação, Percepção Humana, Persuasão e Atuação.", secondaryDv: 15, secondary: "Viciado sofre -2 nessas perícias sem a droga." },
  { key: "synthcoke", name: "Synthcoke", nameEn: "Synthcoke", cost: 20, duration: "4 h", primary: "+1 REF (pode passar de 8); paranoia.", secondaryDv: 15, secondary: "Viciado sofre -2 REF sem a droga." },
];

// ─── Custo de vida e moradia (por mês) ──────────────────────────────────────
export const LIFESTYLES = [
  { key: "kibble", name: "Ração", nameEn: "Kibble", cost: 100 },
  { key: "genericPrepak", name: "Pré-pronto Genérico", nameEn: "Generic Prepak", cost: 300 },
  { key: "goodPrepak", name: "Pré-pronto Bom", nameEn: "Good Prepak", cost: 600 },
  { key: "freshFood", name: "Comida Fresca", nameEn: "Fresh Food", cost: 1500 },
] as const;

/** rent/buy null = não se aplica; "corp" = fornecido pela corporação. */
export const HOUSING: { key: string; name: string; nameEn: string; rent: number | null | "corp"; buy: number | null }[] = [
  { key: "street", name: "Morar na Rua", nameEn: "Living on The Street", rent: null, buy: null },
  { key: "streetVehicle", name: "Morar no Veículo", nameEn: "Living on The Street in a Vehicle", rent: null, buy: null },
  { key: "cubeHotel", name: "Hotel Cápsula", nameEn: "Cube Hotel", rent: 500, buy: null },
  { key: "cargoContainer", name: "Contêiner", nameEn: "Cargo Container", rent: 1000, buy: 15000 },
  { key: "studio", name: "Quitinete", nameEn: "Studio Apartment", rent: 1500, buy: 25000 },
  { key: "twoBedroom", name: "Apartamento de 2 Quartos", nameEn: "Two-Bedroom Apartment", rent: 2500, buy: 35000 },
  { key: "corpConapt", name: "Conapt Corporativo", nameEn: "Corporate Conapt", rent: "corp", buy: null },
  { key: "upscaleConapt", name: "Conapt de Luxo", nameEn: "Upscale Conapt", rent: 7500, buy: 85000 },
  { key: "penthouse", name: "Cobertura de Luxo", nameEn: "Luxury Penthouse", rent: 15000, buy: 500000 },
  { key: "beaverville", name: "Casa em Beaverville", nameEn: "Corporate Beaverville House", rent: "corp", buy: 200000 },
  { key: "mcmansion", name: "Mansão em Beaverville", nameEn: "Corporate Beaverville McMansion", rent: "corp", buy: 500000 },
];

/** Terapia de Humanidade (livro, p.229): custo, DV e dados recuperados. */
export const THERAPY = [
  { key: "addiction", name: "Terapia de Vício", cost: 1000, dv: 15, regains: "cura um vício" },
  { key: "standard", name: "Perda Padrão de Humanidade", cost: 500, dv: 15, regains: "2d6 de Humanidade" },
  { key: "extreme", name: "Perda Extrema de Humanidade", cost: 1000, dv: 17, regains: "4d6 de Humanidade" },
] as const;

export function sheetGearItem(def: GearDef, id: string, qty = 1) {
  return { id, name: def.name, qty, cost: def.cost, notes: def.desc };
}
