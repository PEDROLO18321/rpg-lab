// ─── CYBERPUNK RED — ciberware ───────────────────────────────────────────────
// Cada peça guarda dois números de Perda de Humanidade (HL): `hl` é o valor FIXO
// usado na criação de personagem; `hlDice` é o que se rola depois dela. "1d6/2"
// significa 1d6 dividido por 2 arredondando para cima (no livro-base). Peças de
// fundação (Neural Link, Cybereye, Cyberarm…) oferecem espaços de opção; moda,
// interno e externo não têm fundação mas aceitam até 7 peças cada.
// Itens do Black Chrome com custo/HL ambíguos na fonte ficaram de fora.

import type { Rng } from "./rules";
import { rollDice } from "./rules";

export type CyberCategory =
  | "fashionware" | "neuralware" | "cyberoptics" | "cyberaudio" | "internal"
  | "external" | "cyberarm" | "cyberleg" | "borgware";

export const CYBER_CATEGORY_LABEL: Record<CyberCategory, string> = {
  fashionware: "Modaware",
  neuralware: "Neuralware",
  cyberoptics: "Ciberópticos",
  cyberaudio: "Ciberáudio",
  internal: "Cibernético Interno",
  external: "Cibernético Externo",
  cyberarm: "Ciberbraço",
  cyberleg: "Ciberperna",
  borgware: "Borgware",
};

export type InstallPlace = "mall" | "clinic" | "hospital" | "chip";

export interface CyberwareDef {
  key: string;
  name: string;
  nameEn: string;
  category: CyberCategory;
  install: InstallPlace;
  cost: number;
  /** HL fixa na criação de personagem. */
  hl: number;
  /** HL rolada depois da criação ("2d6", "1d6/2", ""). */
  hlDice: string;
  /** Espaços de opção que esta peça ocupa na fundação. */
  slots: number;
  /** Se for uma fundação, quantos espaços oferece. */
  provides?: number;
  /** Chave da fundação exigida (ex.: neuralLink para chips). */
  requires?: string;
  paired?: boolean;
  source: "core" | "blackChrome";
  desc: string;
}

const C = (
  category: CyberCategory, key: string, name: string, nameEn: string, install: InstallPlace,
  cost: number, hl: number, hlDice: string, desc: string,
  extra: Partial<Pick<CyberwareDef, "slots" | "provides" | "requires" | "paired" | "source">> = {},
): CyberwareDef => ({
  key, name, nameEn, category, install, cost, hl, hlDice, desc, slots: extra.slots ?? 1,
  provides: extra.provides, requires: extra.requires, paired: extra.paired, source: extra.source ?? "core",
});

/** Capacidade de peças das categorias sem fundação. */
export const NO_FOUNDATION_CAPACITY: Partial<Record<CyberCategory, number>> = {
  fashionware: 7, internal: 7, external: 7,
};

export const CYBERWARE: CyberwareDef[] = [
  // Modaware (HL 0, tudo no shopping)
  C("fashionware", "biomonitor", "Biomonitor", "Biomonitor", "mall", 100, 0, "", "Sinais vitais sob a pele; liga ao Agente."),
  C("fashionware", "chemskin", "Pele Química", "Chemskin", "mall", 100, 0, "", "Tintura permanente da pele; +2 Cuidados Pessoais junto com Techhair."),
  C("fashionware", "empThreading", "Filigrana EMP", "EMP Threading", "mall", 10, 0, "", "Linhas prateadas decorativas."),
  C("fashionware", "lightTattoo", "Tatuagem de Luz", "Light Tattoo", "mall", 100, 0, "", "Tatuagens luminosas; +2 Guarda-Roupa e Estilo com 3 ou mais."),
  C("fashionware", "shiftTacts", "Lentes Camaleão", "Shift Tacts", "mall", 100, 0, "", "Lentes que mudam de cor."),
  C("fashionware", "skinwatch", "Relógio Subdérmico", "Skinwatch", "mall", 100, 0, "", "Relógio de LED sob a pele."),
  C("fashionware", "techhair", "Techhair", "Techhair", "mall", 100, 0, "", "Cabelo artificial que emite luz; +2 Cuidados Pessoais junto com Pele Química."),

  // Neuralware (fundação: Neural Link, 5 espaços)
  C("neuralware", "neuralLink", "Neural Link", "Neural Link", "clinic", 500, 7, "2d6", "Sistema nervoso artificial; base para todo neuralware.", { provides: 5 }),
  C("neuralware", "braindanceRecorder", "Gravador de Braindance", "Braindance Recorder", "clinic", 500, 7, "2d6", "Grava experiências sensoriais.", { requires: "neuralLink" }),
  C("neuralware", "chipwareSocket", "Soquete de Chips", "Chipware Socket", "clinic", 500, 7, "2d6", "Aceita chips de neuralware.", { requires: "neuralLink" }),
  C("neuralware", "interfacePlugs", "Plugues de Interface", "Interface Plugs", "clinic", 500, 7, "2d6", "Plugues nos pulsos/cabeça para conectar a máquinas, smartguns e à NET.", { requires: "neuralLink" }),
  C("neuralware", "kerenzikov", "Kerenzikov", "Kerenzikov", "clinic", 500, 14, "4d6", "Speedware: +2 de Iniciativa permanente; só um speedware por pessoa.", { requires: "neuralLink" }),
  C("neuralware", "sandevistan", "Sandevistan", "Sandevistan", "clinic", 500, 7, "2d6", "Speedware: ativado por uma Ação, +3 de Iniciativa por 1 minuto, descanso de 1 hora.", { requires: "neuralLink" }),
  C("neuralware", "chemicalAnalyzer", "Analisador Químico (chip)", "Chemical Analyzer", "chip", 500, 3, "1d6", "Identifica a composição química.", { requires: "chipwareSocket" }),
  C("neuralware", "memoryChip", "Chip de Memória", "Memory Chip", "chip", 10, 0, "", "Armazena dados.", { requires: "chipwareSocket" }),
  C("neuralware", "olfactoryBoost", "Reforço Olfativo (chip)", "Olfactory Boost", "chip", 100, 7, "2d6", "Rastrear pelo cheiro.", { requires: "chipwareSocket" }),
  C("neuralware", "painEditor", "Editor de Dor (chip)", "Pain Editor", "chip", 1000, 14, "4d6", "Ignora as penalidades de Gravemente Ferido.", { requires: "chipwareSocket" }),
  C("neuralware", "skillChip", "Chip de Perícia", "Skill Chip", "chip", 500, 7, "2d6", "Dá uma perícia no nível 3 se o seu for menor (1.000 eb para perícia ×2).", { requires: "chipwareSocket" }),
  C("neuralware", "tactileBoost", "Reforço Tátil (chip)", "Tactile Boost", "chip", 100, 7, "2d6", "Sente movimento a até 20 m tocando uma superfície.", { requires: "chipwareSocket" }),

  // Ciberópticos (fundação: Cybereye, 3 espaços por olho)
  C("cyberoptics", "cybereye", "Ciberolho", "Cybereye", "clinic", 100, 7, "2d6", "Olho artificial com 3 espaços de opção; opções pareadas pedem dois olhos.", { provides: 3 }),
  C("cyberoptics", "antiDazzle", "Anti-Ofuscamento", "Anti-Dazzle", "mall", 100, 2, "1d6/2", "Imune a clarões.", { requires: "cybereye", paired: true }),
  C("cyberoptics", "chyron", "Chyron", "Chyron", "mall", 100, 2, "1d6/2", "Subtela de HUD na visão.", { requires: "cybereye" }),
  C("cyberoptics", "colorShift", "Troca de Cor", "Color Shift", "mall", 100, 2, "1d6/2", "Muda cor/padrão do olho.", { requires: "cybereye" }),
  C("cyberoptics", "eyeDartgun", "Pistola de Dardos Ocular", "Dartgun", "clinic", 500, 2, "1d6/2", "Pistola de dardos de um tiro, ocupa 3 espaços.", { requires: "cybereye", slots: 3 }),
  C("cyberoptics", "imageEnhance", "Realce de Imagem", "Image Enhance", "mall", 500, 3, "1d6", "+2 em Percepção, Leitura Labial e Ocultar/Revelar.", { requires: "cybereye", paired: true }),
  C("cyberoptics", "lowLightIrUv", "Baixa Luz / Infravermelho / UV", "Low Light / Infrared / UV", "mall", 500, 3, "1d6", "Ignora penalidades de escuridão, fumaça e névoa.", { requires: "cybereye", paired: true, slots: 2 }),
  C("cyberoptics", "microOptics", "MicroÓptica", "MicroOptics", "mall", 100, 2, "1d6/2", "Ampliação de 400×.", { requires: "cybereye" }),
  C("cyberoptics", "microVideo", "MicroVídeo", "MicroVideo", "clinic", 500, 2, "1d6/2", "Câmera embutida; ocupa 2 espaços.", { requires: "cybereye", slots: 2 }),
  C("cyberoptics", "radiationDetector", "Detector de Radiação", "Radiation Detector", "clinic", 1000, 3, "1d6", "Mostra radiação a até 100 m como brilho.", { requires: "cybereye" }),
  C("cyberoptics", "targetingScope", "Mira de Precisão", "Targeting Scope", "clinic", 500, 3, "1d6", "+1 em Tiros Mirados.", { requires: "cybereye" }),
  C("cyberoptics", "teleOptics", "TeleÓptica", "TeleOptics", "clinic", 500, 3, "1d6", "Enxerga até 800 m; +1 em Tiros Mirados a 51 m ou mais.", { requires: "cybereye" }),
  C("cyberoptics", "virtuality", "Virtualidade", "Virtuality", "mall", 100, 2, "1d6/2", "Sobreposição de ciberespaço (invade a NET sem óculos).", { requires: "cybereye", paired: true }),

  // Ciberáudio (fundação: Suite, 3 espaços)
  C("cyberaudio", "cyberaudioSuite", "Suíte de Ciberáudio", "Cyberaudio Suite", "clinic", 500, 7, "2d6", "Base com 3 espaços de opção (máximo 1).", { provides: 3 }),
  C("cyberaudio", "amplifiedHearing", "Audição Amplificada", "Amplified Hearing", "clinic", 100, 3, "1d6", "+2 em Percepção auditiva.", { requires: "cyberaudioSuite" }),
  C("cyberaudio", "audioRecorder", "Gravador de Áudio", "Audio Recorder", "clinic", 100, 2, "1d6/2", "Grava áudio.", { requires: "cyberaudioSuite" }),
  C("cyberaudio", "bugDetector", "Detector de Escuta", "Bug Detector", "mall", 100, 2, "1d6/2", "Apita a até 2 m de um grampo.", { requires: "cyberaudioSuite" }),
  C("cyberaudio", "homingTracer", "Rastreador Teleguiado", "Homing Tracer", "clinic", 100, 2, "1d6/2", "Segue um rastreador ligado até 1,6 km.", { requires: "cyberaudioSuite" }),
  C("cyberaudio", "internalAgent", "Agente Interno", "Internal Agent", "mall", 100, 3, "1d6", "Agente embutido (áudio; imagem com Chyron).", { requires: "cyberaudioSuite" }),
  C("cyberaudio", "levelDamper", "Amortecedor de Volume", "Level Damper", "mall", 100, 2, "1d6/2", "Imune a efeitos de ruído alto.", { requires: "cyberaudioSuite" }),
  C("cyberaudio", "radioCommunicator", "Comunicador de Rádio", "Radio Communicator", "mall", 100, 2, "1d6/2", "Rádio com alcance de 1,6 km.", { requires: "cyberaudioSuite" }),
  C("cyberaudio", "radioScanner", "Rádio/Tocador", "Radio Scanner/Music Player", "mall", 50, 2, "1d6/2", "Música e rádio em até 1,6 km.", { requires: "cyberaudioSuite" }),
  C("cyberaudio", "radarDetector", "Detector de Radar", "Radar Detector", "clinic", 500, 2, "1d6/2", "Apita com radar a até 100 m.", { requires: "cyberaudioSuite" }),
  C("cyberaudio", "scrambler", "Embaralhador/Desembaralhador", "Scrambler/Descrambler", "mall", 100, 2, "1d6/2", "Embaralha e desembaralha comunicações.", { requires: "cyberaudioSuite" }),
  C("cyberaudio", "voiceStressAnalyzer", "Analisador de Estresse Vocal", "Voice Stress Analyzer", "clinic", 100, 3, "1d6", "+2 em Percepção Humana e Interrogatório.", { requires: "cyberaudioSuite" }),

  // Interno (7 peças)
  C("internal", "audioVox", "AudioVox", "AudioVox", "clinic", 500, 3, "1d6", "Sintetizador de voz; +2 em Atuação/Instrumento ao cantar."),
  C("internal", "contraceptiveImplant", "Implante Contraceptivo", "Contraceptive Implant", "mall", 10, 0, "", "Evita gravidez."),
  C("internal", "enhancedAntibodies", "Anticorpos Aprimorados", "Enhanced Antibodies", "clinic", 500, 2, "1d6/2", "Depois de estabilizado, cura CORPO × 2 por dia de descanso."),
  C("internal", "cybersnake", "Ciberserpente", "Cybersnake", "hospital", 1000, 14, "4d6", "Arma branca muito pesada pelo esôfago, ocultável."),
  C("internal", "gills", "Guelras", "Gills", "hospital", 1000, 7, "2d6", "Respira debaixo d'água."),
  C("internal", "graftedMuscle", "Músculo Enxertado e Rendado nos Ossos", "Grafted Muscle and Bone Lace", "hospital", 1000, 14, "4d6", "+2 CORPO (máx. 10); atualiza HP, limiar e salvaguarda."),
  C("internal", "independentAirSupply", "Suprimento de Ar Independente", "Independent Air Supply", "clinic", 1000, 2, "1d6/2", "30 min de oxigênio; 1 h para recarregar."),
  C("internal", "midnightLady", "Implante Sexual Midnight Lady", "Midnight Lady Sexual Implant", "clinic", 100, 7, "2d6", "Implante sexual."),
  C("internal", "mrStudd", "Implante Sexual Mr. Studd", "Mr. Studd Sexual Implant", "clinic", 100, 7, "2d6", "Implante sexual."),
  C("internal", "nasalFilters", "Filtros Nasais", "Nasal Filters", "clinic", 100, 2, "1d6/2", "Imune a gases e fumaças tóxicas."),
  C("internal", "radarSonar", "Implante de Radar/Sonar", "Radar/Sonar Implant", "clinic", 1000, 7, "2d6", "Varre 50 m (não atravessa cobertura)."),
  C("internal", "toxinBinders", "Neutralizador de Toxinas", "Toxin Binders", "clinic", 100, 2, "1d6/2", "+2 em Resistir a Tortura/Drogas."),
  C("internal", "vampyres", "Vampiros", "Vampyres", "clinic", 500, 14, "4d6", "Presas de arma branca leve excelente, ocultáveis; podem levar veneno."),

  // Externo (7 peças)
  C("external", "hiddenHolster", "Coldre Oculto", "Hidden Holster", "clinic", 500, 7, "2d6", "Guarda uma arma ocultável dentro do corpo."),
  C("external", "skinWeave", "Tecido de Pele", "Skin Weave", "clinic", 500, 7, "2d6", "PA 7 em corpo e cabeça; não soma com armadura vestida; ablaciona e recupera 1 PA por dia de descanso."),
  C("external", "subdermalArmor", "Armadura Subdérmica", "Subdermal Armor", "hospital", 1000, 14, "4d6", "PA 11 em corpo e cabeça; mesmas regras do Tecido de Pele."),
  C("external", "subdermalPocket", "Bolso Subdérmico", "Subdermal Pocket", "clinic", 100, 3, "1d6", "Bolso de pele de 5×10 cm com zíper."),

  // Ciberbraço (fundação: Cyberarm, 4 espaços)
  C("cyberarm", "cyberarm", "Ciberbraço", "Cyberarm", "hospital", 500, 7, "2d6", "Braço de reposição com 4 espaços; inclui a Mão Padrão. Briga mínima 2d6.", { provides: 4 }),
  C("cyberarm", "standardHand", "Mão Padrão", "Standard Hand", "clinic", 100, 2, "1d6/2", "Ciberhand; encaixa também em braço natural.", { slots: 0 }),
  C("cyberarm", "bigKnucks", "Nós de Dedo Blindados", "Big Knucks", "clinic", 100, 3, "1d6", "Arma branca média ocultável; vale em braço natural.", { requires: "cyberarm" }),
  C("cyberarm", "armCyberdeck", "Ciberdeck no Braço", "Cyberdeck", "clinic", 500, 3, "1d6", "Ciberdeck embutido (+1 espaço de programa/hardware).", { requires: "cyberarm", slots: 3 }),
  C("cyberarm", "grappleHand", "Mão-Arpão", "Grapple Hand", "clinic", 100, 3, "1d6", "Dispara a mão com cabo de 30 m.", { requires: "cyberarm" }),
  C("cyberarm", "medscanner", "Medscanner", "Medscanner", "clinic", 500, 7, "2d6", "+2 em Primeiros Socorros e Paramédico.", { requires: "cyberarm", slots: 2 }),
  C("cyberarm", "popupGrenadeLauncher", "Lança-Granadas Retrátil", "Popup Grenade Launcher", "clinic", 500, 7, "2d6", "Lança-granadas de um tiro, ocultável.", { requires: "cyberarm", slots: 2 }),
  C("cyberarm", "popupMelee", "Arma Branca Retrátil", "Popup Melee Weapon", "clinic", 500, 7, "2d6", "Arma branca leve/média/pesada ocultável.", { requires: "cyberarm", slots: 2 }),
  C("cyberarm", "popupShield", "Escudo Retrátil", "Popup Shield", "clinic", 500, 7, "2d6", "Escudo à prova de balas ocultável.", { requires: "cyberarm", slots: 3 }),
  C("cyberarm", "popupRanged", "Arma de Fogo Retrátil", "Popup Ranged Weapon", "clinic", 500, 7, "2d6", "Qualquer arma de uma mão, ocultável.", { requires: "cyberarm", slots: 2 }),
  C("cyberarm", "rippers", "Garras de Carbovidro", "Rippers", "clinic", 500, 3, "1d6", "Garras de arma branca média; valem em braço natural.", { requires: "cyberarm" }),
  C("cyberarm", "scratchers", "Unhas-Lâmina", "Scratchers", "mall", 100, 2, "1d6/2", "Lâminas nas unhas, arma branca leve; valem em braço natural.", { requires: "cyberarm" }),
  C("cyberarm", "shoulderCam", "Câmera de Ombro", "Shoulder Cam", "clinic", 500, 7, "2d6", "Câmera de vídeo no ombro.", { requires: "cyberarm", slots: 2 }),
  C("cyberarm", "sliceNDice", "Slice 'N Dice", "Slice 'N Dice", "clinic", 500, 3, "1d6", "Chicote de monofilamento no polegar, arma branca média.", { requires: "cyberarm" }),
  C("cyberarm", "subdermalGrip", "Empunhadura Subdérmica", "Subdermal Grip", "clinic", 100, 3, "1d6", "Usa smartgun sem plugues; exige Neural Link.", { requires: "cyberarm" }),
  C("cyberarm", "toolHand", "Mão de Ferramentas", "Tool Hand", "clinic", 100, 3, "1d6", "Ferramentas embutidas.", { requires: "cyberarm" }),
  C("cyberarm", "wolvers", "Wolvers", "Wolvers", "clinic", 500, 7, "2d6", "Garras de nós de dedo, arma branca pesada ocultável.", { requires: "cyberarm" }),

  // Ciberperna (fundação: Cyberleg, 3 espaços)
  C("cyberleg", "cyberleg", "Ciberperna", "Cyberleg", "hospital", 100, 3, "1d6", "Perna de reposição com 3 espaços; inclui o Pé Padrão.", { provides: 3 }),
  C("cyberleg", "standardFoot", "Pé Padrão", "Standard Foot", "clinic", 100, 2, "1d6/2", "Pé cibernético; encaixa em perna natural.", { slots: 0 }),
  C("cyberleg", "jumpBooster", "Impulsor de Salto", "Jump Booster", "clinic", 500, 3, "1d6", "Sem penalidade de salto.", { requires: "cyberleg", paired: true, slots: 2 }),
  C("cyberleg", "skateFoot", "Pé Patins", "Skate Foot", "clinic", 500, 3, "1d6", "+6 m ao correr.", { requires: "cyberleg", paired: true }),
  C("cyberleg", "hardenedShielding", "Blindagem Reforçada", "Hardened Shielding", "clinic", 1000, 3, "1d6", "Membro imune a EMP e efeitos que não sejam Black ICE.", { requires: "cyberleg" }),
  C("cyberleg", "plasticCovering", "Revestimento de Plástico", "Plastic Covering", "mall", 100, 0, "", "Acabamento cosmético, sem espaço.", { slots: 0 }),
  C("cyberleg", "realSkinn", "Revestimento RealSkinn", "RealSkinn Covering", "mall", 500, 0, "", "Pele artificial, sem espaço.", { slots: 0 }),
  C("cyberleg", "superchromeCovering", "Revestimento Superchrome", "Superchrome Covering", "mall", 1000, 0, "", "Metálico; +2 em Guarda-Roupa e Estilo; sem espaço.", { slots: 0 }),

  // Borgware (hospital)
  C("borgware", "shoulderMount", "Montagem de Ombro Artificial", "Artificial Shoulder Mount", "hospital", 1000, 14, "4d6", "Permite montar 2 ciberbraços extras."),
  C("borgware", "linearFrameSigma", "Estrutura Linear Sigma (implantada)", "Implanted Linear Frame Sigma", "hospital", 1000, 14, "4d6", "CORPO passa a 12; exige CORPO 6 e Músculo Enxertado."),
  C("borgware", "linearFrameBeta", "Estrutura Linear Beta (implantada)", "Implanted Linear Frame Beta", "hospital", 5000, 14, "4d6", "CORPO passa a 14; exige CORPO 8 e Músculo Enxertado."),
  C("borgware", "multiOpticMount", "Montagem MultiÓptica", "MultiOptic Mount", "hospital", 1000, 14, "4d6", "Até 5 ciberolhos extras."),
  C("borgware", "sensorArray", "Matriz de Sensores", "Sensor Array", "clinic", 1000, 14, "4d6", "Até 5 opções de ciberáudio extras; exige a Suíte."),

  // Black Chrome (itens com valores confirmados)
  C("internal", "bcRacerBracer", "RacerBracer (Rocklin)", "RacerBracer (Rocklin)", "hospital", 500, 7, "2d6", "Imune ao ferimento Lesão Cervical (Chicote).", { source: "blackChrome" }),
  C("cyberoptics", "bcSponsoredCybereye", "Ciberolho Patrocinado", "Sponsored Cybereye", "clinic", 50, 7, "2d6", "Olho barato com Chyron e propaganda.", { source: "blackChrome" }),
  C("internal", "bcTraumaNanomatrix", "Nanomatriz de Resposta a Trauma", "Trauma Response Nanomatrix", "hospital", 1000, 7, "2d6", "Restaura toda a PA de Tecido de Pele/Subdérmica uma vez por dia.", { source: "blackChrome" }),
];

export const CYBERWARE_MAP: Record<string, CyberwareDef> = Object.fromEntries(CYBERWARE.map((c) => [c.key, c]));

export function getCyberware(key: string): CyberwareDef | undefined {
  return CYBERWARE_MAP[key];
}

/** Soma da HL fixa de criação para uma lista de chaves. */
export function chargenHumanityLoss(keys: string[]): number {
  return keys.reduce((sum, k) => sum + (CYBERWARE_MAP[k]?.hl ?? 0), 0);
}

/** Rola a HL de uma peça instalada depois da criação ("1d6/2" arredonda para cima). */
export function rollHumanityLoss(def: CyberwareDef, rng?: Rng): number {
  if (!def.hlDice) return 0;
  if (def.hlDice.endsWith("/2")) return Math.ceil(rollDice(def.hlDice.slice(0, -2), rng).total / 2);
  return rollDice(def.hlDice, rng).total;
}

/** Espaços de fundação ainda livres numa lista de peças instaladas (por fundação). */
export function slotsFree(foundationKey: string, installedKeys: string[]): number {
  const base = CYBERWARE_MAP[foundationKey]?.provides ?? 0;
  const used = installedKeys.reduce((n, k) => {
    const c = CYBERWARE_MAP[k];
    return c && c.requires === foundationKey ? n + c.slots : n;
  }, 0);
  return base - used;
}

/** Item da ficha (formato do JSON `cyberware`) a partir do catálogo. */
export function cyberwareToSheetItem(def: CyberwareDef, id: string, humanityLoss = def.hl) {
  return { id, key: def.key, name: def.name, category: def.category, humanityLoss, cost: def.cost, notes: def.desc };
}
