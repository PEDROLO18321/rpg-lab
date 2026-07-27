// ─── STAR WARS: ALÉM DA FRONTEIRA — Catálogo de Itens ────────────────────────
// Usa o mesmo motor de combate já estabelecido no sistema: o teste de Acerto
// rola o dado do atributo relevante (regra de dado por atributo, ver
// lib/starwars/creation.ts#attributeDicePool) + bônus de grau da perícia
// indicada. Dano é dado fixo por item (não escala por nível, ao contrário das
// habilidades de classe) — a rolagem em si é feita à mesa, com dados de
// verdade; aqui só ficam os números de referência.

export type ItemCategory =
  | "melee" | "ranged" | "sabre" | "armor" | "shield"
  | "explosive" | "medical" | "gear" | "accessory" | "rare";

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  melee: "Arma Corpo a Corpo",
  ranged: "Arma à Distância",
  sabre: "Sabre de Luz / Arma da Força",
  armor: "Armadura",
  shield: "Escudo/Defesa",
  explosive: "Explosivo",
  medical: "Equipamento Médico",
  gear: "Equipamento Geral",
  accessory: "Acessório/Componente",
  rare: "Item Raro/Artefato",
};

export const CATEGORY_ORDER: ItemCategory[] = [
  "melee", "ranged", "sabre", "armor", "shield", "explosive", "medical", "gear", "accessory", "rare",
];

export type ItemRarity = "Comum" | "Incomum" | "Raro" | "Lendário";

export interface StarWarsItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  price: number; // créditos galácticos
  weight: number; // kg
  description: string;
  /** Atributo do teste de Acerto (arma). "misto" = sabre de luz, regra fixa própria. */
  testAttr?: "agi" | "forca" | "vig" | "sen" | "misto";
  /** Perícia (id de skills.ts) usada no teste de Acerto. */
  skill?: string;
  damage?: string;
  damageType?: string;
  range?: string;
  defenseBonus?: number;
  agiPenalty?: number;
  special?: string;
}

export const ITEMS: StarWarsItem[] = [
  // ─── ARMAS CORPO A CORPO (melee) ────────────────────────────────────────────
  { id: "vibro-adaga", name: "Vibroadaga", category: "melee", rarity: "Comum", price: 50, weight: 0.5,
    testAttr: "agi", skill: "armas_energia", damage: "1d6", damageType: "Corte", range: "Corpo a corpo",
    description: "Lâmina curta com motor vibratório de alta frequência; leve e fácil de ocultar." },
  { id: "vibro-espada", name: "Vibroespada", category: "melee", rarity: "Comum", price: 300, weight: 1.5,
    testAttr: "agi", skill: "armas_energia", damage: "2d6", damageType: "Corte", range: "Corpo a corpo",
    description: "Espada de lâmina vibratória, arma corpo a corpo padrão entre mercenários e soldados." },
  { id: "vibro-machado", name: "Vibromachado", category: "melee", rarity: "Comum", price: 400, weight: 3,
    testAttr: "forca", skill: "armas_energia", damage: "2d6", damageType: "Corte", range: "Corpo a corpo",
    description: "Machado pesado de duas mãos com fio vibratório; exige força bruta pra manejar bem." },
  { id: "bastao-choque", name: "Bastão de choque", category: "melee", rarity: "Comum", price: 150, weight: 1,
    testAttr: "agi", skill: "armas_energia", damage: "1d6", damageType: "Energia (atordoante)", range: "Corpo a corpo",
    special: "Não letal: reduz a 0 PV apenas atordoa, nunca mata.",
    description: "Arma padrão de segurança e policiamento em toda a galáxia." },
  { id: "manopla-vibro", name: "Manopla vibratória", category: "melee", rarity: "Comum", price: 200, weight: 1,
    testAttr: "forca", skill: "armas_energia", damage: "1d8", damageType: "Impacto", range: "Corpo a corpo",
    description: "Luva reforçada com atuadores vibratórios nos nós; torna socos letais." },
  { id: "cajado-gaffi", name: "Cajado gaffi", category: "melee", rarity: "Comum", price: 80, weight: 2,
    testAttr: "forca", skill: "armas_energia", damage: "2d6", damageType: "Impacto/Perfurante", range: "Corpo a corpo",
    special: "Arremessável (curto alcance).",
    description: "Cajado tribal usado por Tusken Raiders, ponta afiada de um lado, cabeça romba do outro." },
  { id: "vibro-machado-pesado", name: "Vibromachado pesado", category: "melee", rarity: "Incomum", price: 900, weight: 5,
    testAttr: "forca", skill: "armas_energia", damage: "3d6", damageType: "Corte", range: "Corpo a corpo",
    special: "–2 no teste de Acerto (pesado e desbalanceado).",
    description: "Versão ampliada do vibromachado, popular entre caçadores de recompensas Trandoshanos." },
  { id: "adaga-envenenada", name: "Adaga envenenada", category: "melee", rarity: "Incomum", price: 350, weight: 0.5,
    testAttr: "agi", skill: "armas_energia", damage: "1d6", damageType: "Perfurante + veneno", range: "Corpo a corpo",
    special: "Acerto força teste de VIG do alvo ou 1d6 de dano contínuo por 2 rodadas.",
    description: "Lâmina com reservatório oco na base, recarregável com toxinas diversas." },
  { id: "lanca-forca", name: "Lança de força", category: "melee", rarity: "Incomum", price: 700, weight: 3,
    testAttr: "forca", skill: "armas_energia", damage: "3d6", damageType: "Perfurante/Energia", range: "Corpo a corpo (alcance 3m)",
    description: "Haste longa terminada numa ponta energizada; comum entre guardas cerimoniais e milícias tribais." },
  { id: "punhal-mandaloriano", name: "Punhal mandaloriano", category: "melee", rarity: "Raro", price: 1200, weight: 0.5,
    testAttr: "agi", skill: "armas_energia", damage: "2d6", damageType: "Corte", range: "Corpo a corpo",
    special: "Forjado em beskar: ignora a Redução de Dano de armaduras comuns.",
    description: "Lâmina cerimonial de beskar, passada entre gerações de um clã mandaloriano." },

  // ─── ARMAS À DISTÂNCIA (ranged) ─────────────────────────────────────────────
  { id: "pistola-blaster", name: "Pistola blaster", category: "ranged", rarity: "Comum", price: 250, weight: 1,
    testAttr: "agi", skill: "pontaria", damage: "2d6", damageType: "Energia", range: "Curto",
    description: "Arma sidearm padrão da galáxia — leve, confiável, munição em células de energia." },
  { id: "pistola-blaster-pesada", name: "Pistola blaster pesada", category: "ranged", rarity: "Incomum", price: 500, weight: 1.5,
    testAttr: "agi", skill: "pontaria", damage: "3d6", damageType: "Energia", range: "Curto",
    description: "Versão robusta da pistola padrão, popular entre caçadores de recompensas." },
  { id: "rifle-blaster", name: "Rifle blaster", category: "ranged", rarity: "Comum", price: 900, weight: 3,
    testAttr: "agi", skill: "pontaria", damage: "3d6", damageType: "Energia", range: "Médio",
    description: "Arma de infantaria padrão de exércitos e milícias por toda a galáxia." },
  { id: "rifle-precisao", name: "Rifle blaster de precisão", category: "ranged", rarity: "Incomum", price: 1800, weight: 4,
    testAttr: "agi", skill: "pontaria", damage: "4d6", damageType: "Energia", range: "Longo",
    special: "Requer 1 ação de mira antes do disparo pra aplicar o dano cheio.",
    description: "Rifle de longo alcance com mira telescópica integrada, arma de atiradores de elite." },
  { id: "rifle-assalto", name: "Rifle blaster de assalto", category: "ranged", rarity: "Incomum", price: 1200, weight: 3.5,
    testAttr: "agi", skill: "pontaria", damage: "3d6", damageType: "Energia", range: "Médio",
    special: "Modo rajada: gasta 2 células de energia, +1d6 de dano.",
    description: "Variante militar do rifle blaster com modo de disparo automático." },
  { id: "carabina-blaster", name: "Carabina blaster", category: "ranged", rarity: "Comum", price: 600, weight: 2.5,
    testAttr: "agi", skill: "pontaria", damage: "2d6", damageType: "Energia", range: "Médio",
    description: "Compacta o suficiente pra uso em espaços fechados sem abrir mão do alcance." },
  { id: "repetidor-pesado", name: "Repetidor blaster pesado", category: "ranged", rarity: "Raro", price: 3500, weight: 12,
    testAttr: "vig", skill: "pontaria", damage: "5d6", damageType: "Energia", range: "Médio",
    special: "Precisa de VIG 2+ ou tripé pra disparar sem penalidade; recarga de 2 rodadas.",
    description: "Arma de suporte pesada, normalmente montada em tripé ou veículo." },
  { id: "besouro-arpao", name: "Lançador de arpão", category: "ranged", rarity: "Incomum", price: 450, weight: 2,
    testAttr: "forca", skill: "pontaria", damage: "2d6", damageType: "Perfurante", range: "Curto",
    special: "Acerto pode agarrar o alvo (teste de FOR oposto pra puxar).",
    description: "Ferramenta de caça e resgate adaptada como arma por contrabandistas." },
  { id: "besouro-arco", name: "Bowcaster Wookiee", category: "ranged", rarity: "Raro", price: 2800, weight: 5,
    testAttr: "forca", skill: "pontaria", damage: "4d6", damageType: "Perfurante/Energia", range: "Médio",
    special: "Recuo forte: exige FOR 1+ ou o usuário sofre –2 no próximo teste de Acerto.",
    description: "Arma tradicional Wookiee, mecanismo semi-mecânico que dispara projéteis de energia comprimida." },
  { id: "pistola-dardos", name: "Pistola de dardos", category: "ranged", rarity: "Incomum", price: 400, weight: 1,
    testAttr: "agi", skill: "pontaria", damage: "1d6 + veneno", damageType: "Perfurante", range: "Curto",
    special: "Acerto força teste de VIG do alvo ou sofre efeito da toxina carregada.",
    description: "Arma discreta usada por assassinos e caçadores de recompensas especializados." },
  { id: "lancador-rede", name: "Lançador de rede", category: "ranged", rarity: "Incomum", price: 350, weight: 2,
    testAttr: "agi", skill: "pontaria", damageType: "Controle", range: "Curto",
    special: "Não causa dano; acerto prende o alvo (Agarrado) até escapar com teste de Atletismo.",
    description: "Dispositivo de captura viva, popular entre caçadores de recompensa e domadores de criaturas." },
  { id: "rifle-ions", name: "Rifle de íons", category: "ranged", rarity: "Incomum", price: 1000, weight: 3.5,
    testAttr: "agi", skill: "pontaria", damage: "3d6", damageType: "Energia (só droides/escudos)", range: "Médio",
    special: "Sem efeito contra alvos orgânicos desprotegidos; ignora escudos de energia.",
    description: "Arma especializada em desativar droides e sistemas eletrônicos, inútil contra carne e osso." },
  { id: "pistola-ions", name: "Pistola de íons", category: "ranged", rarity: "Comum", price: 400, weight: 1,
    testAttr: "agi", skill: "pontaria", damage: "2d6", damageType: "Energia (só droides/escudos)", range: "Curto",
    special: "Sem efeito contra alvos orgânicos desprotegidos; ignora escudos de energia.",
    description: "Versão compacta do rifle de íons, item padrão de equipes de abordagem." },
  { id: "fuzil-caca", name: "Fuzil de caça", category: "ranged", rarity: "Comum", price: 700, weight: 3.5,
    testAttr: "agi", skill: "pontaria", damage: "3d6", damageType: "Perfurante", range: "Longo",
    description: "Arma balística tradicional, popular em mundos onde células de energia são caras ou raras." },
  { id: "lanca-granadas", name: "Lança-granadas", category: "ranged", rarity: "Raro", price: 2200, weight: 4,
    testAttr: "vig", skill: "pontaria", damage: "5d6", damageType: "Explosivo (área curta)", range: "Médio",
    special: "Atinge todos num raio de 3m no ponto de impacto (Reflexos/Acrobacia reduz à metade).",
    description: "Arma de suporte que dispara granadas de fragmentação a distância segura." },

  // ─── SABRES DE LUZ E ARMAS DA FORÇA ─────────────────────────────────────────
  { id: "sabre-luz-padrao", name: "Sabre de luz", category: "sabre", rarity: "Raro", price: 0, weight: 1,
    testAttr: "misto", skill: "sabres_de_luz", damage: "6d6 × maior entre AGI/FOR/SEN + perícia Sabres de Luz", damageType: "Energia", range: "Corpo a corpo",
    special: "Regra fixa do sistema — não usa a tabela de dano por nível. Não é vendido; construído ou herdado.",
    description: "Arma cerimonial e de combate de usuários da Força, lâmina de plasma contida por campo de energia." },
  { id: "sabre-luz-curto", name: "Sabre de luz curto (shoto)", category: "sabre", rarity: "Raro", price: 0, weight: 0.6,
    testAttr: "misto", skill: "sabres_de_luz", damage: "6d6 × maior entre AGI/FOR/SEN + perícia Sabres de Luz", damageType: "Energia", range: "Corpo a corpo",
    special: "Regra fixa do sistema. Mais leve e rápido; costuma ser empunhado como arma secundária.",
    description: "Variante compacta do sabre de luz, popular como segunda lâmina em duelistas de Forma II/Makashi." },
  { id: "sabre-luz-duplo", name: "Sabre de luz duplo", category: "sabre", rarity: "Raro", price: 0, weight: 1.5,
    testAttr: "misto", skill: "sabres_de_luz", damage: "6d6 × maior entre AGI/FOR/SEN + perícia Sabres de Luz", damageType: "Energia", range: "Corpo a corpo",
    special: "Regra fixa do sistema. Pode atacar dois alvos adjacentes na mesma ação (2 ações).",
    description: "Duas lâminas nas pontas de um cabo giratório — arma de Forma IV/Ataru." },
  { id: "lanca-forca-sith", name: "Lança de força sith", category: "sabre", rarity: "Incomum", price: 1500, weight: 3,
    testAttr: "sen", skill: "armas_energia", damage: "3d6", damageType: "Energia", range: "Corpo a corpo (alcance 3m)",
    description: "Haste energizada usada por guardas sith e cultistas — não é um sabre de luz de verdade, mas canaliza a Força." },

  // ─── ARMADURAS ───────────────────────────────────────────────────────────────
  { id: "roupa-viajante", name: "Roupas de viajante", category: "armor", rarity: "Comum", price: 20, weight: 1,
    defenseBonus: 0,
    description: "Vestimenta comum, sem proteção real além do tecido resistente ao clima." },
  { id: "colete-blindado-leve", name: "Colete blindado leve", category: "armor", rarity: "Comum", price: 300, weight: 3,
    defenseBonus: 2,
    description: "Placas leves escondidas sob roupas comuns, discretas e confortáveis." },
  { id: "armadura-leve-batalha", name: "Armadura leve de batalha", category: "armor", rarity: "Incomum", price: 800, weight: 6,
    defenseBonus: 3,
    description: "Armadura modular usada por tropas de choque e mercenários bem equipados." },
  { id: "armadura-pesada-assalto", name: "Armadura pesada de assalto", category: "armor", rarity: "Incomum", price: 1500, weight: 12,
    defenseBonus: 4, agiPenalty: -1,
    description: "Blindagem completa de combate; protege bem, mas atrapalha a mobilidade." },
  { id: "armadura-beskar", name: "Armadura mandaloriana (beskar)", category: "armor", rarity: "Raro", price: 4000, weight: 10,
    defenseBonus: 5, special: "Resistente a sabre de luz: reduz o dano de ataques de sabre em metade.",
    description: "Armadura forjada em beskar, o metal quase indestrutível de Mandalore." },
  { id: "armadura-repulsor", name: "Armadura de repulsor", category: "armor", rarity: "Lendário", price: 9000, weight: 18,
    defenseBonus: 6, special: "Repulsores integrados permitem queda segura de qualquer altura.",
    description: "Armadura motorizada de altíssima tecnologia, rara mesmo entre exércitos regulares." },

  // ─── ESCUDOS E DEFESA ───────────────────────────────────────────────────────
  { id: "gerador-escudo-pessoal", name: "Gerador de escudo pessoal", category: "shield", rarity: "Raro", price: 2500, weight: 1,
    defenseBonus: 2, special: "Absorve os primeiros 15 pontos de dano recebidos antes de desligar; recarrega 1h fora de combate.",
    description: "Dispositivo portátil que projeta um campo de energia defletor ao redor do usuário." },
  { id: "escudo-deflector", name: "Escudo de reflexo", category: "shield", rarity: "Incomum", price: 900, weight: 4,
    defenseBonus: 1, special: "Reflete 25% de chance de qualquer disparo de energia bloqueado de volta ao atirador.",
    description: "Escudo físico com superfície polida tratada para desviar disparos de blaster." },
  { id: "capa-camuflada-termica", name: "Capa térmica camuflada", category: "shield", rarity: "Incomum", price: 600, weight: 1.5,
    defenseBonus: 0, special: "+10 em testes de Furtividade contra sensores térmicos e visão noturna.",
    description: "Tecido que dissipa assinatura de calor, essencial contra caçadores bem equipados." },

  // ─── EXPLOSIVOS ─────────────────────────────────────────────────────────────
  { id: "granada-fragmentacao", name: "Granada de fragmentação", category: "explosive", rarity: "Incomum", price: 150, weight: 0.5,
    testAttr: "agi", skill: "pontaria", damage: "4d6", damageType: "Explosivo (área curta)", range: "Arremesso curto",
    description: "Explosivo padrão militar, estilhaços cobrem um raio de 3m." },
  { id: "granada-choque", name: "Granada de choque", category: "explosive", rarity: "Comum", price: 100, weight: 0.5,
    damageType: "Controle (área curta)", range: "Arremesso curto",
    special: "Não causa dano; todos na área fazem teste de VIG ou ficam Atordoados 1 rodada.",
    description: "Dispositivo não letal usado por forças de segurança pra conter multidões ou capturar vivo." },
  { id: "detonador-termico", name: "Detonador térmico", category: "explosive", rarity: "Raro", price: 800, weight: 1,
    testAttr: "agi", skill: "pontaria", damage: "6d6", damageType: "Explosivo (área média)", range: "Arremesso curto",
    special: "Restrito — posse costuma ser crime na maioria dos sistemas centrais.",
    description: "Explosivo devastador, ícone de contrabandistas e caçadores de recompensas dispostos a negociar alto." },
  { id: "mina-adesiva", name: "Mina adesiva", category: "explosive", rarity: "Incomum", price: 500, weight: 1,
    damage: "5d6", damageType: "Explosivo (ponto único)",
    special: "Precisa ser plantada (ação) e detonada por controle remoto ou gatilho de proximidade.",
    description: "Carga magnética usada para sabotagem furtiva de veículos e portas blindadas." },
  { id: "carga-demolicao", name: "Carga de demolição", category: "explosive", rarity: "Raro", price: 1200, weight: 3,
    damage: "8d6", damageType: "Explosivo (estrutural)",
    special: "Bônus contra estruturas/veículos; detonação remota com atraso configurável.",
    description: "Explosivo de engenharia militar, projetado para derrubar paredes e cascos blindados." },

  // ─── EQUIPAMENTO MÉDICO ─────────────────────────────────────────────────────
  { id: "kit-medico-basico", name: "Kit médico básico", category: "medical", rarity: "Comum", price: 100, weight: 1,
    special: "Ação: restaura 2d6 PV a um alvo (uso único).",
    description: "Bandagens, coagulantes e analgésicos básicos, item padrão de qualquer mochila de aventura." },
  { id: "kit-medico-avancado", name: "Kit médico avançado", category: "medical", rarity: "Incomum", price: 400, weight: 2,
    special: "Ação: restaura 4d6 PV e remove uma condição física (uso único).",
    description: "Kit de campo completo com scanner de diagnóstico e medicamentos de amplo espectro." },
  { id: "spray-bacta", name: "Spray de bacta", category: "medical", rarity: "Comum", price: 150, weight: 0.3,
    special: "Ação rápida: restaura 1d6 PV instantaneamente (uso único).",
    description: "Bacta concentrada em aerossol pra tratamento rápido em combate." },
  { id: "tanque-bacta-portatil", name: "Tanque de bacta portátil", category: "medical", rarity: "Raro", price: 2000, weight: 15,
    special: "1 hora de imersão restaura todo PV e remove todas as condições físicas.",
    description: "Versão compacta e transportável dos tanques de recuperação hospitalares." },
  { id: "estimulante-combate", name: "Estimulante de combate", category: "medical", rarity: "Incomum", price: 250, weight: 0.2,
    special: "Ação rápida: +2 num atributo à escolha por 3 rodadas (uso único, deixa Fatigado depois).",
    description: "Coquetel de adrenalina sintética usado por soldados em situação desesperadora." },
  { id: "antitoxina", name: "Antitoxina", category: "medical", rarity: "Comum", price: 80, weight: 0.2,
    special: "Ação: neutraliza qualquer veneno/toxina ativa no alvo (uso único).",
    description: "Soro de amplo espectro contra venenos comuns da galáxia." },

  // ─── EQUIPAMENTO GERAL / GADGETS ────────────────────────────────────────────
  { id: "comlink", name: "Comlink", category: "gear", rarity: "Comum", price: 25, weight: 0.1,
    description: "Comunicador de curto alcance, item básico de qualquer equipe." },
  { id: "comunicador-longo-alcance", name: "Comunicador de longo alcance", category: "gear", rarity: "Incomum", price: 300, weight: 1,
    description: "Permite contato em alcance planetário ou com naves em órbita baixa." },
  { id: "macrobinoculos", name: "Macrobinóculos", category: "gear", rarity: "Comum", price: 150, weight: 0.5,
    special: "+5 em testes de Percepção à distância.",
    description: "Óptica de longo alcance com zoom digital e visão noturna básica." },
  { id: "kit-ferramentas", name: "Kit de ferramentas (hydrospanner)", category: "gear", rarity: "Comum", price: 100, weight: 2,
    special: "Sem ele, –5 em testes de Mecânica.",
    description: "Conjunto de ferramentas essencial pra reparos de naves, droides e equipamentos." },
  { id: "gancho-cabo", name: "Gancho e cabo de escalada", category: "gear", rarity: "Comum", price: 60, weight: 1.5,
    special: "+5 em testes de Atletismo para escalar; alcance de disparo 15m.",
    description: "Lançador compacto de cabo com gancho magnético ou de garra." },
  { id: "datapad", name: "Datapad", category: "gear", rarity: "Comum", price: 80, weight: 0.3,
    special: "+2 em testes de Computação envolvendo pesquisa ou registros.",
    description: "Dispositivo portátil de armazenamento e processamento de dados." },
  { id: "kit-disfarce", name: "Kit de disfarce", category: "gear", rarity: "Comum", price: 120, weight: 1,
    special: "Sem ele, –5 em Enganação para se passar por outra pessoa.",
    description: "Cosméticos, próteses e roupas trocáveis para disfarces rápidos." },
  { id: "sensor-movimento", name: "Sensor de movimento portátil", category: "gear", rarity: "Incomum", price: 350, weight: 1.5,
    special: "Detecta qualquer criatura Média+ se movendo num raio de 20m.",
    description: "Dispositivo de vigilância tático, item padrão de equipes de reconhecimento." },
  { id: "traje-ambiental", name: "Traje ambiental", category: "gear", rarity: "Incomum", price: 500, weight: 4,
    special: "Permite sobreviver em vácuo, atmosferas tóxicas ou temperaturas extremas por horas.",
    description: "Traje selado completo com suporte de vida autônomo." },
  { id: "kit-sobrevivencia", name: "Kit de sobrevivência", category: "gear", rarity: "Comum", price: 90, weight: 3,
    special: "+5 em testes de Sobrevivência em ambiente hostil.",
    description: "Suprimentos básicos de acampamento, purificação de água e sinalização de emergência." },
  { id: "scanner-tecnologico", name: "Scanner tecnológico", category: "gear", rarity: "Incomum", price: 400, weight: 1,
    special: "+5 em testes de Ciências ou Mecânica pra identificar tecnologia desconhecida.",
    description: "Dispositivo de análise usado por engenheiros e exploradores." },

  // ─── ACESSÓRIOS E COMPONENTES ────────────────────────────────────────────────
  { id: "mira-telescopica", name: "Mira telescópica", category: "accessory", rarity: "Comum", price: 200, weight: 0.3,
    special: "Acoplável a arma à distância: +5 no teste de Acerto contra alvos a alcance Longo.",
    description: "Acessório de precisão para rifles e carabinas." },
  { id: "celula-energia-extra", name: "Célula de energia extra", category: "accessory", rarity: "Comum", price: 30, weight: 0.3,
    description: "Recarga sobressalente para armas blaster — evita ficar sem munição em combate prolongado." },
  { id: "silenciador-blaster", name: "Silenciador de blaster", category: "accessory", rarity: "Incomum", price: 250, weight: 0.2,
    special: "+5 em Furtividade ao disparar; –1d6 no dano da arma equipada.",
    description: "Reduz drasticamente o ruído e o brilho do disparo, ao custo de potência." },
  { id: "estabilizador-mira", name: "Estabilizador de mira", category: "accessory", rarity: "Incomum", price: 300, weight: 0.5,
    special: "Remove a penalidade de disparar em movimento.",
    description: "Sistema giroscópico acoplável que compensa o tremor do disparo." },
  { id: "cristal-kyber-sintetico", name: "Cristal kyber sintético", category: "accessory", rarity: "Raro", price: 3000, weight: 0.1,
    special: "Necessário para construir um sabre de luz novo.",
    description: "Cristal focalizador cultivado artificialmente — funcional, mas sem a ressonância de um cristal natural." },

  // ─── ITENS RAROS / ARTEFATOS ─────────────────────────────────────────────────
  { id: "fragmento-holocron", name: "Fragmento de holocron", category: "rare", rarity: "Lendário", price: 0, weight: 0.2,
    special: "Gancho de campanha — contém conhecimento fragmentado, geralmente protegido/trancado.",
    description: "Pedaço de um holocron Jedi ou Sith danificado, guardando ensinamentos incompletos." },
  { id: "amuleto-noite", name: "Amuleto das Irmãs da Noite", category: "rare", rarity: "Raro", price: 2000, weight: 0.1,
    special: "+1 em SEN enquanto usado (não empilha com outros itens do mesmo tipo).",
    description: "Talismã ritual de Dathomir, entalhado com runas de magia ancestral." },
  { id: "meteorito-ilum", name: "Fragmento de meteorito de Ilum", category: "rare", rarity: "Raro", price: 2500, weight: 0.3,
    special: "Contém um cristal kyber natural — pode ser lapidado para uso em sabre de luz.",
    description: "Fragmento recuperado das cavernas de cristal de Ilum, mundo sagrado dos Jedi." },
  { id: "moeda-jedha", name: "Moeda ancestral de Jedha", category: "rare", rarity: "Incomum", price: 100, weight: 0.05,
    description: "Relíquia religiosa da lua sagrada, valorizada por peregrinos e colecionadores." },
];

export const ITEM_BY_ID: Record<string, StarWarsItem> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export function itemsByCategory(category: ItemCategory): StarWarsItem[] {
  return ITEMS.filter((i) => i.category === category);
}
