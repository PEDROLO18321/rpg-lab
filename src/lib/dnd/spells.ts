export interface Spell {
  id: string;
  name: string;
  level: number; // 0 = cantrip
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  description: string;
  classes: string[];
}

export interface SpellcastingConfig {
  cantripsKnown: number;
  spellsKnown: number;
  spellSlots1st: number;
  ability: string;
  type: "known" | "prepare";
}

// Classes that are spellcasters at level 1 (Ranger gets spells at level 2, not included)
export const SPELLCASTING: Record<string, SpellcastingConfig> = {
  bardo:      { cantripsKnown: 2, spellsKnown: 4, spellSlots1st: 2, ability: "Carisma",      type: "known"   },
  clerigo:    { cantripsKnown: 3, spellsKnown: 4, spellSlots1st: 2, ability: "Sabedoria",    type: "prepare" },
  druida:     { cantripsKnown: 2, spellsKnown: 4, spellSlots1st: 2, ability: "Sabedoria",    type: "prepare" },
  feiticeiro: { cantripsKnown: 4, spellsKnown: 2, spellSlots1st: 2, ability: "Carisma",      type: "known"   },
  mago:       { cantripsKnown: 3, spellsKnown: 6, spellSlots1st: 2, ability: "Inteligência", type: "known"   },
  bruxo:      { cantripsKnown: 2, spellsKnown: 2, spellSlots1st: 1, ability: "Carisma",      type: "known"   },
  // Paladino: conjuração começa no nível 2, não no nível 1 (PHB p.84)
};

export const SPELLS: Spell[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // CANTRIPS (nível 0)
  // ─────────────────────────────────────────────────────────────────────────

  // Abjuração
  {
    id: "resistencia", name: "Resistência", level: 0, school: "Abjuração",
    castingTime: "1 ação", range: "Toque", duration: "Concentração, até 1 min",
    description: "Toque em criatura consentida. Uma vez antes do término ela pode rolar 1d4 e adicionar o resultado a um teste de resistência.",
    classes: ["clerigo"],
  },

  // Adivinhação
  {
    id: "guia", name: "Guia", level: 0, school: "Adivinhação",
    castingTime: "1 ação", range: "Toque", duration: "Concentração, até 1 min",
    description: "Toque em criatura consentida. Uma vez antes do término ela pode rolar 1d4 e adicionar o resultado a um teste de atributo.",
    classes: ["clerigo", "druida"],
  },
  {
    id: "golpe-certeiro", name: "Golpe Certeiro", level: 0, school: "Adivinhação",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 1 rodada",
    description: "O próximo ataque de arma contra o alvo tem vantagem se você não se mover antes de atacar.",
    classes: ["feiticeiro", "mago", "bruxo"],
  },

  // Conjuração
  {
    id: "mao-magica", name: "Mão Mágica", level: 0, school: "Conjuração",
    castingTime: "1 ação", range: "9m", duration: "1 minuto",
    description: "Mão espectral a até 9m realiza tarefas simples: carregar, abrir, usar itens. Não pode atacar.",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "prestidigitacao", name: "Prestidigitação", level: 0, school: "Conjuração",
    castingTime: "1 ação", range: "3m", duration: "Até 1 hora",
    description: "Truques mágicos triviais: acender/apagar, limpar/sujar, aquecer/resfriar, criar marca, cheiro ou símbolo.",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "arte-druidica", name: "Arte Druídica", level: 0, school: "Conjuração",
    castingTime: "1 ação", range: "9m", duration: "Instantâneo / 1 hora",
    description: "Truques naturais: prever clima, brotar flores, acender chama, criar perfume ou outros pequenos efeitos.",
    classes: ["druida"],
  },
  {
    id: "produzir-chamas", name: "Produzir Chamas", level: 0, school: "Conjuração",
    castingTime: "1 ação", range: "Próprio / 9m (arremesso)", duration: "10 minutos",
    description: "Chamas nas suas mãos iluminam 3m. Pode arremessar: ataque mágico à distância, acerto = 1d8 de fogo.",
    classes: ["druida"],
  },

  // Encantamento
  {
    id: "amizade", name: "Amizade", level: 0, school: "Encantamento",
    castingTime: "1 ação", range: "Próprio", duration: "Concentração, até 1 min",
    description: "Vantagem em testes de Carisma contra criatura não hostil. Ao terminar, ela percebe e fica hostil.",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "escarnio-vicioso", name: "Escárnio Vicioso", level: 0, school: "Encantamento",
    castingTime: "1 ação", range: "18m", duration: "Instantâneo",
    description: "Insultos mágicos. TR Sabedoria ou 1d4 de dano psíquico e desvantagem no próximo ataque antes do seu próximo turno.",
    classes: ["bardo"],
  },

  // Evocação
  {
    id: "chama-sagrada", name: "Chama Sagrada", level: 0, school: "Evocação",
    castingTime: "1 ação", range: "18m", duration: "Instantâneo",
    description: "Energia radiante desce em coluna. TR Destreza (sem bônus de cobertura) ou 1d8 de dano radiante.",
    classes: ["clerigo"],
  },
  {
    id: "palavra-de-radiancia", name: "Palavra de Radiância", level: 0, school: "Evocação",
    castingTime: "1 ação", range: "1,5m", duration: "Instantâneo",
    description: "Criaturas hostis a sua escolha a 1,5m fazem TR Constituição ou sofrem 1d6 de dano radiante.",
    classes: ["clerigo"],
  },
  {
    id: "raio-de-fogo", name: "Raio de Fogo", level: 0, school: "Evocação",
    castingTime: "1 ação", range: "36m", duration: "Instantâneo",
    description: "Ataque mágico à distância. Acerto: 1d10 de dano de fogo. Pode incendiar objetos inflamáveis.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "raio-de-gelo", name: "Raio de Gelo", level: 0, school: "Evocação",
    castingTime: "1 ação", range: "18m", duration: "Instantâneo",
    description: "Ataque mágico à distância. Acerto: 1d8 de dano frio e reduz deslocamento do alvo em 3m até próximo turno.",
    classes: ["feiticeiro", "mago", "bruxo"],
  },
  {
    id: "esguicho-de-acido", name: "Esguicho de Ácido", level: 0, school: "Evocação",
    castingTime: "1 ação", range: "18m", duration: "Instantâneo",
    description: "Bolhas de ácido em até 2 criaturas a 1,5m uma da outra. TR Destreza ou 1d6 de dano ácido cada.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "sopro-de-veneno", name: "Sopro de Veneno", level: 0, school: "Evocação",
    castingTime: "1 ação", range: "3m", duration: "Instantâneo",
    description: "Sopro de gás venenoso. TR Constituição ou 1d12 de dano de veneno.",
    classes: ["feiticeiro", "mago", "bruxo", "druida"],
  },
  {
    id: "choque", name: "Choque", level: 0, school: "Evocação",
    castingTime: "1 ação", range: "Toque", duration: "Instantâneo",
    description: "Ataque de toque mágico. Acerto: 1d8 de dano de raio. Armaduras metálicas: desvantagem no teste.",
    classes: ["feiticeiro", "mago", "bruxo"],
  },
  {
    id: "explosao-magica", name: "Explosão Mágica", level: 0, school: "Evocação",
    castingTime: "1 ação", range: "36m", duration: "Instantâneo",
    description: "Feixe de energia disruptiva: ataque mágico à distância. Acerto: 1d10 de dano de força.",
    classes: ["bruxo"],
  },

  // Ilusão
  {
    id: "ilusao-menor", name: "Ilusão Menor", level: 0, school: "Ilusão",
    castingTime: "1 ação", range: "9m", duration: "1 minuto",
    description: "Som ou imagem ilusória (objeto de até 1,5m³). Investigar requer TR de Investigação contra sua CD.",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },

  // Necromancia
  {
    id: "toque-da-morte", name: "Toque da Morte", level: 0, school: "Necromancia",
    castingTime: "1 ação", range: "18m", duration: "Instantâneo",
    description: "TR Sabedoria. Falha: 1d8 necrótico (2d8 se alvo tiver 0 PV). Sucesso: metade.",
    classes: ["clerigo", "mago", "bruxo"],
  },
  {
    id: "toque-gelado", name: "Toque Gelado", level: 0, school: "Necromancia",
    castingTime: "1 ação", range: "36m", duration: "1 rodada",
    description: "Ataque mágico à distância. Acerto: 1d8 necrótico e alvo não pode recuperar PV até próximo turno.",
    classes: ["feiticeiro", "mago", "bruxo"],
  },
  {
    id: "estabilizar", name: "Estabilizar", level: 0, school: "Necromancia",
    castingTime: "1 ação", range: "Toque", duration: "Instantâneo",
    description: "Estabiliza criatura com 0 PV, impedindo testes de morte. Fica estável com 0 PV.",
    classes: ["clerigo", "druida"],
  },

  // Transmutação
  {
    id: "luz", name: "Luz", level: 0, school: "Transmutação",
    castingTime: "1 ação", range: "Toque", duration: "1 hora",
    description: "Objeto emite luz brilhante (6m) e penumbra (mais 6m). TR Destreza para criaturas hostis.",
    classes: ["bardo", "clerigo", "feiticeiro", "mago"],
  },
  {
    id: "chicote-de-espinhos", name: "Chicote de Espinhos", level: 0, school: "Transmutação",
    castingTime: "1 ação", range: "9m", duration: "Instantâneo",
    description: "Ataque mágico corpo-a-corpo. Acerto: 1d6 perfurante. Criaturas até tamanho Grande se movem 3m em sua direção.",
    classes: ["druida"],
  },
  {
    id: "shillelagh", name: "Shillelagh", level: 0, school: "Transmutação",
    castingTime: "1 ação bônus", range: "Toque", duration: "1 minuto",
    description: "Cajado ou clava mágico: usa Sabedoria nos ataques e dano, causa 1d8 em vez do normal.",
    classes: ["druida"],
  },
  {
    id: "taumaturgia", name: "Taumaturgia", level: 0, school: "Transmutação",
    castingTime: "1 ação", range: "9m", duration: "Até 1 min",
    description: "Manifesta portento menor: voz retumba, chamas crepitam, tremor fraco, olhos brilham, porta abre/fecha.",
    classes: ["clerigo"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MAGIAS DE 1º NÍVEL
  // ─────────────────────────────────────────────────────────────────────────

  // Abjuração
  {
    id: "escudo", name: "Escudo", level: 1, school: "Abjuração",
    castingTime: "1 reação", range: "Próprio", duration: "1 rodada",
    description: "+5 de CA até início do próximo turno (inclui o ataque que desencadeou). Imune a Mísseis Mágicos.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "escudo-da-fe", name: "Escudo da Fé", level: 1, school: "Abjuração",
    castingTime: "1 ação bônus", range: "18m", duration: "Concentração, até 10 min",
    description: "Aura protetora dá +2 de CA a uma criatura.",
    classes: ["clerigo", "paladino"],
  },
  {
    id: "armadura-magica", name: "Armadura Mágica", level: 1, school: "Abjuração",
    castingTime: "1 ação", range: "Toque", duration: "8 horas",
    description: "CA = 13 + mod. Destreza enquanto sem armadura. Termina se vestir armadura.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "armadura-de-agathys", name: "Armadura de Agathys", level: 1, school: "Abjuração",
    castingTime: "1 ação", range: "Próprio", duration: "1 hora",
    description: "Ganha 5 PV temporários. Enquanto durar, atacantes corpo-a-corpo sofrem 5 de dano frio.",
    classes: ["bruxo"],
  },
  {
    id: "santuario", name: "Santuário", level: 1, school: "Abjuração",
    castingTime: "1 ação bônus", range: "9m", duration: "1 minuto",
    description: "Protege uma criatura. Quem tentar atacá-la faz TR Sabedoria ou precisa escolher outro alvo.",
    classes: ["clerigo"],
  },
  {
    id: "protecao-contra-o-mal", name: "Proteção contra o Mal e o Bem", level: 1, school: "Abjuração",
    castingTime: "1 ação", range: "Toque", duration: "Concentração, até 10 min",
    description: "Proteção contra aberrações, celestiais, elementais, fadas, diabos e mortos-vivos: sem vantagem em ataques, sem possessão.",
    classes: ["clerigo", "druida", "paladino", "mago"],
  },
  {
    id: "absorver-elementos", name: "Absorver Elementos", level: 1, school: "Abjuração",
    castingTime: "1 reação", range: "Próprio", duration: "1 rodada",
    description: "Reação a dano elemental (ácido/frio/fogo/raio/trovão): resistência a ele. Próximo ataque +1d6 desse tipo.",
    classes: ["druida", "mago"],
  },

  // Adivinhação
  {
    id: "detectar-magia", name: "Detectar Magia", level: 1, school: "Adivinhação",
    castingTime: "1 ação", range: "Próprio (9m)", duration: "Concentração, até 10 min",
    description: "Percebe presença de magia em 9m. Pode ver aura colorida ao redor de objetos/criaturas mágicos.",
    classes: ["bardo", "clerigo", "druida", "paladino", "mago", "feiticeiro", "bruxo"],
  },
  {
    id: "identificar", name: "Identificar", level: 1, school: "Adivinhação",
    castingTime: "1 min (ritual)", range: "Toque", duration: "Instantâneo",
    description: "Aprende propriedades de item mágico, como usá-las, feitiços ativos em criaturas e magias em vigor.",
    classes: ["bardo", "mago"],
  },
  {
    id: "marca-do-cacador", name: "Marca do Caçador", level: 1, school: "Adivinhação",
    castingTime: "1 ação bônus", range: "36m", duration: "Concentração, até 1 hora",
    description: "Marca uma criatura: ataques causam +1d6. Vantagem em Percepção e Sobrevivência para rastreá-la.",
    classes: ["ranger"],
  },

  // Conjuração
  {
    id: "servo-invisivel", name: "Servo Invisível", level: 1, school: "Conjuração",
    castingTime: "1 ação (ritual)", range: "18m", duration: "1 hora",
    description: "Força invisível realiza tarefas simples (carregar, limpar, segurar). Força 2, não pode atacar.",
    classes: ["bardo", "mago", "bruxo"],
  },
  {
    id: "encontrar-familiar", name: "Encontrar Familiar", level: 1, school: "Conjuração",
    castingTime: "1 hora (ritual)", range: "3m", duration: "Instantâneo",
    description: "Invoca familiar espiritual (animal). Pode ver por seus sentidos. Pode lançar magias de Toque por ele.",
    classes: ["mago"],
  },
  {
    id: "disco-flutuante", name: "Disco Flutuante", level: 1, school: "Conjuração",
    castingTime: "1 ação (ritual)", range: "9m", duration: "1 hora",
    description: "Disco de força (1,5m de diâmetro) carrega até 250kg. Segue 1,5m atrás de você.",
    classes: ["mago"],
  },
  {
    id: "bagas-bondosas", name: "Bagas Bondosas", level: 1, school: "Conjuração",
    castingTime: "1 ação", range: "Toque", duration: "24 horas",
    description: "Cria até 10 bagas mágicas. Cada baga restaura 1 PV e fornece nutrição para 1 dia.",
    classes: ["druida", "ranger"],
  },
  {
    id: "neblina", name: "Névoa", level: 1, school: "Conjuração",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 1 hora",
    description: "Esfera de névoa (6m de raio) bloqueia visão. Área fortemente obscurecida.",
    classes: ["feiticeiro", "mago", "druida"],
  },
  {
    id: "enredar", name: "Enredar", level: 1, school: "Conjuração",
    castingTime: "1 ação", range: "27m", duration: "Concentração, até 1 min",
    description: "Ervas enredam criaturas em área de 6m². TR Força ou ficam restringidas. Repete no fim de cada turno.",
    classes: ["druida", "ranger"],
  },
  {
    id: "gordura", name: "Gordura", level: 1, school: "Conjuração",
    castingTime: "1 ação", range: "18m", duration: "1 minuto",
    description: "Cobre 3m² de chão com gordura escorregadia. TR Destreza ou derrubado. Terreno difícil.",
    classes: ["mago"],
  },
  {
    id: "chuva-de-espinhos", name: "Chuva de Espinhos", level: 1, school: "Conjuração",
    castingTime: "1 ação bônus", range: "Próprio", duration: "Concentração, até 1 min",
    description: "Próximo acerto com arma de projétil: munição vira espinhos (1d6) e TR Destreza ou 1d6 extra.",
    classes: ["ranger"],
  },

  // Encantamento
  {
    id: "enfeiticar-pessoas", name: "Enfeitiçar Pessoas", level: 1, school: "Encantamento",
    castingTime: "1 ação", range: "9m", duration: "Concentração, até 1 hora",
    description: "TR Sabedoria ou humanoide é enfeitiçado: tratado como amigo, desvantagem em ataques contra você.",
    classes: ["bardo", "druida", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "heroismo", name: "Heroísmo", level: 1, school: "Encantamento",
    castingTime: "1 ação", range: "Toque", duration: "Concentração, até 1 min",
    description: "Criatura fica imune a medo e ganha PV temporários = mod. Carisma do conjurador por turno.",
    classes: ["bardo", "paladino"],
  },
  {
    id: "sono", name: "Sono", level: 1, school: "Encantamento",
    castingTime: "1 ação", range: "27m", duration: "1 minuto",
    description: "Rola 5d8 PV. Criaturas mais fracas adormecem primeiro até o total ser atingido. Acordam se feridas.",
    classes: ["bardo", "feiticeiro", "mago"],
  },
  {
    id: "comando", name: "Comando", level: 1, school: "Encantamento",
    castingTime: "1 ação", range: "18m", duration: "1 rodada",
    description: "TR Sabedoria ou criatura obedece a um comando de uma palavra (fuja, deite, abaixe, aproxime, pare).",
    classes: ["clerigo", "paladino"],
  },
  {
    id: "maldição", name: "Maldição", level: 1, school: "Encantamento",
    castingTime: "1 ação bônus", range: "27m", duration: "Concentração, até 1 hora",
    description: "Marca criatura: ataques causam +1d6 necrótico. Pode penalizar um atributo. Se morrer, redireciona.",
    classes: ["bruxo"],
  },
  {
    id: "amizade-animal", name: "Amizade com Animais", level: 1, school: "Encantamento",
    castingTime: "1 ação", range: "9m", duration: "24 horas",
    description: "TR Sabedoria ou animal fica encantado. Termina se você ou aliados prejudicarem o alvo.",
    classes: ["bardo", "druida", "ranger"],
  },

  // Evocação
  {
    id: "misseis-magicos", name: "Mísseis Mágicos", level: 1, school: "Evocação",
    castingTime: "1 ação", range: "45m", duration: "Instantâneo",
    description: "3 dardos de força mágica que acertam automaticamente, causando 1d4+1 cada. Podem ser direcionados livremente.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "maos-flamejantes", name: "Mãos Flamejantes", level: 1, school: "Evocação",
    castingTime: "1 ação", range: "Próprio (cone 4,5m)", duration: "Instantâneo",
    description: "Cone de chamas. TR Destreza: falha = 3d6 de fogo; sucesso = metade.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "onda-de-trovao", name: "Onda de Trovão", level: 1, school: "Evocação",
    castingTime: "1 ação", range: "Próprio (cubo 4,5m)", duration: "Instantâneo",
    description: "Cubo de trovão. TR Constituição: falha = 2d8 trovão e empurrado 3m; sucesso = metade.",
    classes: ["bardo", "druida", "feiticeiro", "mago"],
  },
  {
    id: "raio-guiado", name: "Raio Guiado", level: 1, school: "Evocação",
    castingTime: "1 ação", range: "36m", duration: "Instantâneo",
    description: "Ataque mágico à distância. Acerto: 4d6 radiante e próximo ataque contra o alvo tem vantagem.",
    classes: ["clerigo"],
  },
  {
    id: "infligir-ferimentos", name: "Infligir Ferimentos", level: 1, school: "Necromancia",
    castingTime: "1 ação", range: "Toque", duration: "Instantâneo",
    description: "Ataque de toque mágico. Acerto: 3d10 de dano necrótico.",
    classes: ["clerigo"],
  },
  {
    id: "raio-da-bruxa", name: "Raio da Bruxa", level: 1, school: "Evocação",
    castingTime: "1 ação", range: "9m", duration: "Concentração, até 1 min",
    description: "Ataque mágico. Acerto: 1d12 de raio. Ação bônus para manter dano em turnos seguintes.",
    classes: ["feiticeiro", "bruxo"],
  },
  {
    id: "favor-divino", name: "Favor Divino", level: 1, school: "Evocação",
    castingTime: "1 ação bônus", range: "Próprio", duration: "Concentração, até 1 min",
    description: "Seus ataques de arma causam +1d4 de dano radiante enquanto durar.",
    classes: ["paladino"],
  },
  {
    id: "golpe-trovejante", name: "Golpe Trovejante", level: 1, school: "Evocação",
    castingTime: "1 ação bônus", range: "Próprio", duration: "Concentração, até 1 min",
    description: "Próximo acerto com arma: +2d6 trovão e TR Força ou o alvo é derrubado.",
    classes: ["paladino"],
  },
  {
    id: "golpe-ardente", name: "Golpe Ardente", level: 1, school: "Evocação",
    castingTime: "1 ação bônus", range: "Próprio", duration: "Concentração, até 1 min",
    description: "Próximo acerto com arma: +1d6 fogo. Alvo continua queimando (1d6/rodada, TR Constituição para apagar).",
    classes: ["paladino"],
  },
  {
    id: "golpe-da-ira", name: "Golpe da Ira", level: 1, school: "Encantamento",
    castingTime: "1 ação bônus", range: "Próprio", duration: "Concentração, até 1 min",
    description: "Próximo acerto com arma: +1d6 psíquico e TR Sabedoria ou alvo fica assustado até próximo turno.",
    classes: ["paladino"],
  },
  {
    id: "fogo-de-fada", name: "Fogo de Fada", level: 1, school: "Evocação",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 min",
    description: "Contorno de luz azul/verde/violeta em criaturas e objetos na área. TR Destreza. Falha: ataques têm vantagem.",
    classes: ["bardo", "druida"],
  },
  {
    id: "orbe-cromatico", name: "Orbe Cromático", level: 1, school: "Evocação",
    castingTime: "1 ação", range: "27m", duration: "Instantâneo",
    description: "Ataque mágico à distância. Acerto: 3d8 de dano de tipo à escolha (ácido/frio/fogo/raio/trovão/veneno).",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "golpe-enredante", name: "Golpe Enredante", level: 1, school: "Conjuração",
    castingTime: "1 ação bônus", range: "Próprio", duration: "Concentração, até 1 min",
    description: "Próximo acerto com arma: galhos enrolam. TR Força ou alvo fica restringido. Repete no fim de cada turno.",
    classes: ["ranger"],
  },

  // Ilusão
  {
    id: "disfarcar-se", name: "Disfarçar-se", level: 1, school: "Ilusão",
    castingTime: "1 ação", range: "Próprio", duration: "1 hora",
    description: "Altera aparência física e vestimentas (apenas visual). Investigar requer TR de Investigação.",
    classes: ["bardo", "feiticeiro", "mago"],
  },
  {
    id: "imagem-silenciosa", name: "Imagem Silenciosa", level: 1, school: "Ilusão",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 10 min",
    description: "Imagem ilusória de até 4,5m³. Sem som. Interagir ou inspecionar revela a ilusão.",
    classes: ["bardo", "feiticeiro", "mago"],
  },

  // Necromancia
  {
    id: "vida-falsa", name: "Vida Falsa", level: 1, school: "Necromancia",
    castingTime: "1 ação", range: "Próprio", duration: "1 hora",
    description: "Ganha 1d4+4 PV temporários. Não é cumulativo com outros lançamentos da mesma magia.",
    classes: ["mago", "feiticeiro"],
  },

  // Transmutação
  {
    id: "curar-ferimentos", name: "Curar Ferimentos", level: 1, school: "Transmutação",
    castingTime: "1 ação", range: "Toque", duration: "Instantâneo",
    description: "Criatura recupera 1d8 + mod. de habilidade de magia em PV.",
    classes: ["bardo", "clerigo", "druida", "paladino", "ranger"],
  },
  {
    id: "palavra-de-cura", name: "Palavra de Cura", level: 1, school: "Evocação",
    castingTime: "1 ação bônus", range: "18m", duration: "Instantâneo",
    description: "Criatura a distância recupera 1d4 + mod. Sabedoria em PV.",
    classes: ["bardo", "clerigo", "druida"],
  },
  {
    id: "aben-çoar", name: "Abençoar", level: 1, school: "Encantamento",
    castingTime: "1 ação", range: "9m", duration: "Concentração, até 1 min",
    description: "Até 3 criaturas adicionam 1d4 a ataques e testes de resistência.",
    classes: ["clerigo", "paladino"],
  },
  {
    id: "recuo-expedito", name: "Recuo Expedito", level: 1, school: "Transmutação",
    castingTime: "1 ação bônus", range: "Próprio", duration: "Concentração, até 10 min",
    description: "Pode Desengajar como ação bônus a cada turno enquanto durar.",
    classes: ["feiticeiro", "bruxo"],
  },
  {
    id: "salto", name: "Salto", level: 1, school: "Transmutação",
    castingTime: "1 ação", range: "Toque", duration: "1 minuto",
    description: "Distância de salto da criatura triplica.",
    classes: ["druida", "feiticeiro", "mago", "ranger"],
  },
  {
    id: "passada-longa", name: "Passada Longa", level: 1, school: "Transmutação",
    castingTime: "1 ação", range: "Toque", duration: "1 hora",
    description: "Velocidade de movimento da criatura aumenta em 3m.",
    classes: ["bardo", "druida", "feiticeiro", "mago", "ranger"],
  },
  {
    id: "queda-em-pluma", name: "Queda em Pluma", level: 1, school: "Transmutação",
    castingTime: "1 reação", range: "18m", duration: "1 minuto",
    description: "Até 5 criaturas caem a 18m/rodada e não sofrem dano de queda.",
    classes: ["bardo", "feiticeiro", "mago"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NÍVEL 2
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "auxilio", name: "Auxílio", level: 2, school: "Abjuração",
    castingTime: "1 ação", range: "9m", duration: "8 horas",
    description: "Até 3 criaturas ganham +5 PV máximos e atuais pela duração.",
    classes: ["clerigo", "paladino"],
  },
  {
    id: "protecao-contra-veneno", name: "Proteção contra Veneno", level: 2, school: "Abjuração",
    castingTime: "1 ação", range: "Toque", duration: "1 hora",
    description: "Neutraliza um veneno; alvo tem vantagem contra envenenamento e resistência a dano de veneno.",
    classes: ["clerigo", "druida", "paladino", "ranger"],
  },
  {
    id: "restauracao-menor", name: "Restauração Menor", level: 2, school: "Abjuração",
    castingTime: "1 ação", range: "Toque", duration: "Instantânea",
    description: "Cura uma doença ou condição: cego, surdo, paralisado ou envenenado.",
    classes: ["bardo", "clerigo", "druida", "paladino", "ranger"],
  },
  {
    id: "silencio", name: "Silêncio", level: 2, school: "Ilusão",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 10 min",
    description: "Esfera de 6m de raio onde nenhum som pode ser criado ou atravessar. Impede conjuração com componente verbal.",
    classes: ["bardo", "clerigo", "ranger"],
  },
  {
    id: "detectar-pensamentos", name: "Detectar Pensamentos", level: 2, school: "Adivinhação",
    castingTime: "1 ação", range: "Pessoal", duration: "Concentração, até 1 min",
    description: "Lê pensamentos superficiais de criaturas a até 9m; pode sondar mais fundo (resistência SAB).",
    classes: ["bardo", "feiticeiro", "mago"],
  },
  {
    id: "visao-no-escuro", name: "Visão no Escuro", level: 2, school: "Transmutação",
    castingTime: "1 ação", range: "Toque", duration: "8 horas",
    description: "Concede visão no escuro de 18m a uma criatura tocada.",
    classes: ["druida", "feiticeiro", "mago", "ranger"],
  },
  {
    id: "teia", name: "Teia", level: 2, school: "Conjuração",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 hora",
    description: "Cubo de 6m de teias grudentas. Criaturas na área ficam restritas (resistência DES). Inflamável: 2d4 de fogo.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "passo-nebuloso", name: "Passo Nebuloso", level: 2, school: "Conjuração",
    castingTime: "1 ação bônus", range: "Pessoal", duration: "Instantânea",
    description: "Teletransporta-se até 9m para um espaço desocupado que possa ver.",
    classes: ["feiticeiro", "mago", "bruxo"],
  },
  {
    id: "encontrar-corcel", name: "Encontrar Corcel", level: 2, school: "Conjuração",
    castingTime: "10 minutos", range: "9m", duration: "Instantânea",
    description: "Invoca um espírito na forma de corcel leal e inteligente que serve de montaria.",
    classes: ["paladino"],
  },
  {
    id: "imobilizar-pessoa", name: "Imobilizar Pessoa", level: 2, school: "Encantamento",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 min",
    description: "Humanoide fica paralisado (resistência SAB no fim de cada turno para encerrar).",
    classes: ["bardo", "clerigo", "druida", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "sugestao", name: "Sugestão", level: 2, school: "Encantamento",
    castingTime: "1 ação", range: "9m", duration: "Concentração, até 8 horas",
    description: "Sugere magicamente uma ação razoável a uma criatura (resistência SAB), que a segue até concluir.",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "raio-ardente", name: "Raio Ardente", level: 2, school: "Evocação",
    castingTime: "1 ação", range: "36m", duration: "Instantânea",
    description: "Três raios de fogo (ataques separados), 2d6 de dano de fogo cada. +1 raio por nível de espaço acima do 2°.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "quebrar", name: "Quebrar", level: 2, school: "Evocação",
    castingTime: "1 ação", range: "18m", duration: "Instantânea",
    description: "Estrondo numa esfera de 3m: 3d8 de dano trovejante (resistência CON para metade). Danifica objetos.",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "arma-espiritual", name: "Arma Espiritual", level: 2, school: "Evocação",
    castingTime: "1 ação bônus", range: "18m", duration: "1 minuto",
    description: "Arma espectral flutuante: ataque mágico corpo-a-corpo, 1d8 + mod. de conjuração de dano de energia. Move 6m por ação bônus.",
    classes: ["clerigo"],
  },
  {
    id: "prece-de-cura", name: "Prece de Cura", level: 2, school: "Evocação",
    castingTime: "10 minutos", range: "9m", duration: "Instantânea",
    description: "Até 6 criaturas recuperam 2d8 + mod. de conjuração PV.",
    classes: ["clerigo"],
  },
  {
    id: "raio-da-lua", name: "Raio da Lua", level: 2, school: "Evocação",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 1 min",
    description: "Cilindro de luz prateada (raio 1,5m): 2d10 radiante (resistência CON para metade) ao entrar ou começar o turno nele.",
    classes: ["druida"],
  },
  {
    id: "lamina-flamejante", name: "Lâmina Flamejante", level: 2, school: "Evocação",
    castingTime: "1 ação bônus", range: "Pessoal", duration: "Concentração, até 10 min",
    description: "Cimitarra de fogo na mão: ataque mágico, 3d6 de dano de fogo; ilumina 3m.",
    classes: ["druida"],
  },
  {
    id: "invisibilidade", name: "Invisibilidade", level: 2, school: "Ilusão",
    castingTime: "1 ação", range: "Toque", duration: "Concentração, até 1 hora",
    description: "Criatura tocada fica invisível até atacar ou conjurar. Equipamento carregado também.",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "imagem-espelhada", name: "Imagem Espelhada", level: 2, school: "Ilusão",
    castingTime: "1 ação", range: "Pessoal", duration: "1 minuto",
    description: "Três duplicatas ilusórias de você; ataques podem atingi-las (CA 10 + mod. DES) e destruí-las.",
    classes: ["feiticeiro", "mago", "bruxo"],
  },
  {
    id: "raio-enfraquecedor", name: "Raio Enfraquecedor", level: 2, school: "Necromancia",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 min",
    description: "Ataque mágico à distância: alvo causa metade do dano com ataques que usam Força.",
    classes: ["mago", "bruxo"],
  },
  {
    id: "cegueira-surdez", name: "Cegueira/Surdez", level: 2, school: "Necromancia",
    castingTime: "1 ação", range: "9m", duration: "1 minuto",
    description: "Alvo fica cego ou surdo (resistência CON no fim de cada turno para encerrar).",
    classes: ["bardo", "clerigo", "feiticeiro", "mago"],
  },
  {
    id: "levitar", name: "Levitar", level: 2, school: "Transmutação",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 10 min",
    description: "Criatura ou objeto (até 250 kg) levita até 6m de altura (resistência CON se involuntário).",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "aprimorar-habilidade", name: "Aprimorar Habilidade", level: 2, school: "Transmutação",
    castingTime: "1 ação", range: "Toque", duration: "Concentração, até 1 hora",
    description: "Alvo ganha vantagem em testes de um atributo escolhido (+ efeito extra conforme o atributo).",
    classes: ["bardo", "clerigo", "druida", "feiticeiro"],
  },
  {
    id: "esquentar-metal", name: "Esquentar Metal", level: 2, school: "Transmutação",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 min",
    description: "Objeto de metal brilha em brasa: 2d8 de dano de fogo a quem o toca; pode repetir por ação bônus.",
    classes: ["bardo", "druida"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NÍVEL 3
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "bola-de-fogo", name: "Bola de Fogo", level: 3, school: "Evocação",
    castingTime: "1 ação", range: "45m", duration: "Instantânea",
    description: "Explosão numa esfera de 6m de raio: 8d6 de dano de fogo (resistência DES para metade). +1d6 por nível de espaço acima do 3°.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "relampago", name: "Relâmpago", level: 3, school: "Evocação",
    castingTime: "1 ação", range: "Pessoal (linha de 30m)", duration: "Instantânea",
    description: "Linha de 30m × 1,5m: 8d6 de dano elétrico (resistência DES para metade). +1d6 por nível acima do 3°.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "contramagica", name: "Contramágica", level: 3, school: "Abjuração",
    castingTime: "1 reação", range: "18m", duration: "Instantânea",
    description: "Interrompe magia de 3° nível ou menor sendo conjurada; níveis maiores exigem teste de habilidade (CD 10 + nível da magia).",
    classes: ["feiticeiro", "mago", "bruxo"],
  },
  {
    id: "dissipar-magia", name: "Dissipar Magia", level: 3, school: "Abjuração",
    castingTime: "1 ação", range: "36m", duration: "Instantânea",
    description: "Encerra magias de 3° nível ou menor num alvo; níveis maiores exigem teste (CD 10 + nível da magia).",
    classes: ["bardo", "clerigo", "druida", "feiticeiro", "mago", "bruxo", "paladino"],
  },
  {
    id: "protecao-contra-energia", name: "Proteção contra Energia", level: 3, school: "Abjuração",
    castingTime: "1 ação", range: "Toque", duration: "Concentração, até 1 hora",
    description: "Alvo ganha resistência a um tipo de dano: ácido, elétrico, fogo, frio ou trovejante.",
    classes: ["clerigo", "druida", "feiticeiro", "mago", "ranger"],
  },
  {
    id: "farol-de-esperanca", name: "Farol de Esperança", level: 3, school: "Abjuração",
    castingTime: "1 ação", range: "9m", duration: "Concentração, até 1 min",
    description: "Criaturas escolhidas têm vantagem em resistências de SAB e contra morte, e curam o máximo possível.",
    classes: ["clerigo"],
  },
  {
    id: "circulo-magico", name: "Círculo Mágico", level: 3, school: "Abjuração",
    castingTime: "1 minuto", range: "3m", duration: "1 hora",
    description: "Cilindro de 3m: impede entrada/efeitos de celestiais, elementais, fadas, corruptores ou mortos-vivos escolhidos.",
    classes: ["clerigo", "mago", "bruxo", "paladino"],
  },
  {
    id: "clarividencia", name: "Clarividência", level: 3, school: "Adivinhação",
    castingTime: "10 minutos", range: "1,5 km", duration: "Concentração, até 10 min",
    description: "Cria sensor invisível em local conhecido: você vê OU ouve através dele.",
    classes: ["bardo", "clerigo", "feiticeiro", "mago"],
  },
  {
    id: "enviar-mensagem", name: "Enviar Mensagem", level: 3, school: "Adivinhação",
    castingTime: "1 ação", range: "Ilimitado", duration: "1 rodada",
    description: "Mensagem de até 25 palavras a criatura conhecida em qualquer lugar; ela pode responder.",
    classes: ["bardo", "clerigo", "mago"],
  },
  {
    id: "conjurar-animais", name: "Conjurar Animais", level: 3, school: "Conjuração",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 hora",
    description: "Invoca espíritos feéricos em forma de bestas (ex.: 1 de ND 2, 2 de ND 1, 4 de ND 1/2) que obedecem você.",
    classes: ["druida", "ranger"],
  },
  {
    id: "chamar-relampagos", name: "Chamar Relâmpagos", level: 3, school: "Conjuração",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 10 min",
    description: "Nuvem tempestuosa: raio em ponto escolhido, 3d10 elétrico (resistência DES para metade); repete por ação.",
    classes: ["druida"],
  },
  {
    id: "espiritos-guardioes", name: "Espíritos Guardiões", level: 3, school: "Conjuração",
    castingTime: "1 ação", range: "Pessoal (raio de 4,5m)", duration: "Concentração, até 10 min",
    description: "Espíritos protetores ao seu redor: inimigos na área têm deslocamento reduzido e sofrem 3d8 radiante/necrótico (resistência SAB para metade).",
    classes: ["clerigo"],
  },
  {
    id: "tempestade-de-granizo", name: "Tempestade de Granizo", level: 3, school: "Conjuração",
    castingTime: "1 ação", range: "45m", duration: "Concentração, até 1 min",
    description: "Cilindro de 12m: terreno difícil escorregadio, apaga chamas, criaturas caem (resistência DES) e concentração é ameaçada.",
    classes: ["druida", "feiticeiro", "mago"],
  },
  {
    id: "medo", name: "Medo", level: 3, school: "Ilusão",
    castingTime: "1 ação", range: "Pessoal (cone de 9m)", duration: "Concentração, até 1 min",
    description: "Criaturas no cone ficam amedrontadas (resistência SAB), largam o que seguram e fogem.",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "padrao-hipnotico", name: "Padrão Hipnótico", level: 3, school: "Ilusão",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 1 min",
    description: "Cubo de 9m de cores hipnóticas: criaturas ficam enfeitiçadas e incapacitadas (resistência SAB).",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "imagem-maior", name: "Imagem Maior", level: 3, school: "Ilusão",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 10 min",
    description: "Ilusão de objeto/criatura/fenômeno em cubo de 6m, com som, cheiro e temperatura.",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "toque-vampirico", name: "Toque Vampírico", level: 3, school: "Necromancia",
    castingTime: "1 ação", range: "Pessoal", duration: "Concentração, até 1 min",
    description: "Ataque mágico corpo-a-corpo: 3d6 necrótico; você recupera metade do dano causado em PV.",
    classes: ["mago", "bruxo"],
  },
  {
    id: "animar-mortos", name: "Animar Mortos", level: 3, school: "Necromancia",
    castingTime: "1 minuto", range: "3m", duration: "Instantânea",
    description: "Cria esqueleto ou zumbi de ossos/cadáver; obedece comandos por 24h (reconjure para manter controle).",
    classes: ["clerigo", "mago"],
  },
  {
    id: "revivificar", name: "Revivificar", level: 3, school: "Necromancia",
    castingTime: "1 ação", range: "Toque", duration: "Instantânea",
    description: "Retorna à vida criatura morta há menos de 1 minuto, com 1 PV. Componente: diamantes (300 PO).",
    classes: ["clerigo", "paladino"],
  },
  {
    id: "palavra-de-cura-em-massa", name: "Palavra de Cura em Massa", level: 3, school: "Evocação",
    castingTime: "1 ação bônus", range: "18m", duration: "Instantânea",
    description: "Até 6 criaturas recuperam 1d4 + mod. de conjuração PV.",
    classes: ["clerigo"],
  },
  {
    id: "luz-do-dia", name: "Luz do Dia", level: 3, school: "Evocação",
    castingTime: "1 ação", range: "18m", duration: "1 hora",
    description: "Esfera de luz de 18m de raio. Dissipa escuridão mágica de 3° nível ou menor.",
    classes: ["clerigo", "druida", "feiticeiro", "paladino", "ranger"],
  },
  {
    id: "voo", name: "Voo", level: 3, school: "Transmutação",
    castingTime: "1 ação", range: "Toque", duration: "Concentração, até 10 min",
    description: "Alvo ganha deslocamento de voo de 18m. +1 criatura por nível de espaço acima do 3°.",
    classes: ["feiticeiro", "mago", "bruxo"],
  },
  {
    id: "velocidade", name: "Velocidade", level: 3, school: "Transmutação",
    castingTime: "1 ação", range: "9m", duration: "Concentração, até 1 min",
    description: "Alvo: deslocamento dobrado, +2 CA, vantagem em DES, +1 ação limitada por turno. Letargia ao terminar.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "lentidao", name: "Lentidão", level: 3, school: "Transmutação",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 1 min",
    description: "Até 6 criaturas (resistência SAB): metade do deslocamento, −2 CA e DES, sem reações, ações limitadas.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "forma-gasosa", name: "Forma Gasosa", level: 3, school: "Transmutação",
    castingTime: "1 ação", range: "Toque", duration: "Concentração, até 1 hora",
    description: "Alvo vira névoa: voo 3m, resistência a dano não-mágico, passa por frestas.",
    classes: ["feiticeiro", "mago", "bruxo"],
  },
  {
    id: "respirar-na-agua", name: "Respirar na Água", level: 3, school: "Transmutação",
    castingTime: "1 ação", range: "9m", duration: "24 horas",
    description: "Até 10 criaturas conseguem respirar debaixo d'água.",
    classes: ["druida", "feiticeiro", "mago", "ranger"],
  },
  {
    id: "crescimento-vegetal", name: "Crescimento Vegetal", level: 3, school: "Transmutação",
    castingTime: "1 ação ou 8 horas", range: "45m", duration: "Instantânea",
    description: "Plantas num raio de 30m ficam densas (terreno muito difícil) ou enriquece a terra por 1 ano.",
    classes: ["bardo", "druida", "ranger"],
  },
  {
    id: "piscar", name: "Piscar", level: 3, school: "Transmutação",
    castingTime: "1 ação", range: "Pessoal", duration: "1 minuto",
    description: "No fim de cada turno (11+ no d20), você some para o Plano Etéreo e retorna no próximo turno.",
    classes: ["feiticeiro", "mago"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NÍVEL 4
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "banimento", name: "Banimento", level: 4, school: "Abjuração",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 min",
    description: "Bane uma criatura para outro plano (resistência CAR). Extraplanares banidos por 1 min não retornam.",
    classes: ["clerigo", "feiticeiro", "mago", "bruxo", "paladino"],
  },
  {
    id: "pele-de-pedra", name: "Pele de Pedra", level: 4, school: "Abjuração",
    castingTime: "1 ação", range: "Toque", duration: "Concentração, até 1 hora",
    description: "Alvo ganha resistência a dano contundente, cortante e perfurante não-mágico.",
    classes: ["druida", "feiticeiro", "mago", "ranger"],
  },
  {
    id: "protecao-contra-a-morte", name: "Proteção contra a Morte", level: 4, school: "Abjuração",
    castingTime: "1 ação", range: "Toque", duration: "8 horas",
    description: "Na 1ª vez que o alvo cairia a 0 PV, fica com 1 PV; magias de morte instantânea são negadas.",
    classes: ["clerigo", "paladino"],
  },
  {
    id: "movimentacao-livre", name: "Movimentação Livre", level: 4, school: "Abjuração",
    castingTime: "1 ação", range: "Toque", duration: "1 hora",
    description: "Alvo ignora terreno difícil; magias não reduzem seu deslocamento nem o paralisam/restringem.",
    classes: ["bardo", "clerigo", "druida", "ranger"],
  },
  {
    id: "olho-arcano", name: "Olho Arcano", level: 4, school: "Adivinhação",
    castingTime: "1 ação", range: "9m", duration: "Concentração, até 1 hora",
    description: "Olho mágico invisível flutuante com visão no escuro; move 9m por ação, passa por frestas.",
    classes: ["mago"],
  },
  {
    id: "localizar-criatura", name: "Localizar Criatura", level: 4, school: "Adivinhação",
    castingTime: "1 ação", range: "Pessoal", duration: "Concentração, até 1 hora",
    description: "Sente a direção de uma criatura conhecida a até 300m.",
    classes: ["bardo", "clerigo", "druida", "mago", "paladino", "ranger"],
  },
  {
    id: "porta-dimensional", name: "Porta Dimensional", level: 4, school: "Conjuração",
    castingTime: "1 ação", range: "150m", duration: "Instantânea",
    description: "Teletransporta você (e 1 criatura voluntária) para ponto a até 150m que possa ver ou descrever.",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "guardiao-da-fe", name: "Guardião da Fé", level: 4, school: "Conjuração",
    castingTime: "1 ação", range: "9m", duration: "8 horas",
    description: "Guardião espectral: inimigos que se aproximam a 3m sofrem 20 de dano radiante (resistência DES para metade).",
    classes: ["clerigo"],
  },
  {
    id: "tentaculos-negros", name: "Tentáculos Negros", level: 4, school: "Conjuração",
    castingTime: "1 ação", range: "27m", duration: "Concentração, até 1 min",
    description: "Quadrado de 6m: criaturas ficam restritas e sofrem 3d6 contundente por turno (resistência DES/FOR).",
    classes: ["mago"],
  },
  {
    id: "confusao", name: "Confusão", level: 4, school: "Encantamento",
    castingTime: "1 ação", range: "27m", duration: "Concentração, até 1 min",
    description: "Esfera de 3m: criaturas agem aleatoriamente (resistência SAB) — vagam, atacam aliados ou nada fazem.",
    classes: ["bardo", "druida", "feiticeiro", "mago"],
  },
  {
    id: "dominar-besta", name: "Dominar Besta", level: 4, school: "Encantamento",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 min",
    description: "Controla uma besta (resistência SAB); comanda telepaticamente e pode usar reação para controle total.",
    classes: ["druida", "feiticeiro"],
  },
  {
    id: "tempestade-de-gelo", name: "Tempestade de Gelo", level: 4, school: "Evocação",
    castingTime: "1 ação", range: "90m", duration: "Instantânea",
    description: "Cilindro de 6m: 2d8 contundente + 4d6 frio (resistência DES para metade); terreno vira difícil.",
    classes: ["druida", "feiticeiro", "mago"],
  },
  {
    id: "escudo-de-fogo", name: "Escudo de Fogo", level: 4, school: "Evocação",
    castingTime: "1 ação", range: "Pessoal", duration: "10 minutos",
    description: "Chamas o envolvem: resistência a fogo OU frio; quem o acerta corpo-a-corpo sofre 2d8 do dano oposto.",
    classes: ["mago"],
  },
  {
    id: "muralha-de-fogo", name: "Muralha de Fogo", level: 4, school: "Evocação",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 1 min",
    description: "Muro de fogo de 18m: 5d8 de fogo ao atravessar ou estar a 3m do lado quente (resistência DES para metade).",
    classes: ["druida", "feiticeiro", "mago"],
  },
  {
    id: "invisibilidade-maior", name: "Invisibilidade Maior", level: 4, school: "Ilusão",
    castingTime: "1 ação", range: "Toque", duration: "Concentração, até 1 min",
    description: "Alvo fica invisível mesmo ao atacar ou conjurar.",
    classes: ["bardo", "feiticeiro", "mago"],
  },
  {
    id: "assassino-fantasmagorico", name: "Assassino Fantasmagórico", level: 4, school: "Ilusão",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 1 min",
    description: "Manifestação dos piores medos do alvo: amedrontado e 4d10 psíquico por turno (resistência SAB).",
    classes: ["mago"],
  },
  {
    id: "praga", name: "Praga", level: 4, school: "Necromancia",
    castingTime: "1 ação", range: "9m", duration: "Instantânea",
    description: "Energia necrótica: 8d8 de dano (resistência CON para metade). Plantas têm desvantagem e dano máximo.",
    classes: ["druida", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "polimorfia", name: "Polimorfia", level: 4, school: "Transmutação",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 hora",
    description: "Transforma criatura em besta de ND ≤ nível/ND dela (resistência SAB). Ganha os PV da nova forma.",
    classes: ["bardo", "druida", "feiticeiro", "mago"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NÍVEL 5
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "restauracao-maior", name: "Restauração Maior", level: 5, school: "Abjuração",
    castingTime: "1 ação", range: "Toque", duration: "Instantânea",
    description: "Remove exaustão, enfeitiçamento, petrificação, maldição ou redução de atributo/PV máximo.",
    classes: ["bardo", "clerigo", "druida"],
  },
  {
    id: "comunhao", name: "Comunhão", level: 5, school: "Adivinhação",
    castingTime: "1 minuto", range: "Pessoal", duration: "1 minuto",
    description: "Faça até 3 perguntas de sim/não à sua divindade.",
    classes: ["clerigo"],
  },
  {
    id: "comunhao-com-a-natureza", name: "Comunhão com a Natureza", level: 5, school: "Adivinhação",
    castingTime: "1 minuto", range: "Pessoal", duration: "Instantânea",
    description: "Conhecimento do terreno num raio de 4,5 km: criaturas, água, edifícios, etc. (3 fatos).",
    classes: ["druida", "ranger"],
  },
  {
    id: "videncia", name: "Vidência", level: 5, school: "Adivinhação",
    castingTime: "10 minutos", range: "Pessoal", duration: "Concentração, até 10 min",
    description: "Vê e ouve uma criatura específica em qualquer lugar (resistência SAB, modificada por familiaridade).",
    classes: ["bardo", "clerigo", "druida", "bruxo", "mago"],
  },
  {
    id: "circulo-de-teletransporte", name: "Círculo de Teletransporte", level: 5, school: "Conjuração",
    castingTime: "1 minuto", range: "3m", duration: "1 rodada",
    description: "Portal para círculo de teletransporte permanente conhecido em outro lugar.",
    classes: ["bardo", "feiticeiro", "mago"],
  },
  {
    id: "praga-de-insetos", name: "Praga de Insetos", level: 5, school: "Conjuração",
    castingTime: "1 ação", range: "90m", duration: "Concentração, até 10 min",
    description: "Esfera de 6m de gafanhotos: 4d10 perfurante (resistência CON para metade); terreno difícil.",
    classes: ["clerigo", "druida", "feiticeiro"],
  },
  {
    id: "imobilizar-monstro", name: "Imobilizar Monstro", level: 5, school: "Encantamento",
    castingTime: "1 ação", range: "27m", duration: "Concentração, até 1 min",
    description: "Criatura fica paralisada (resistência SAB no fim de cada turno).",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "dominar-pessoa", name: "Dominar Pessoa", level: 5, school: "Encantamento",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 min",
    description: "Controla um humanoide (resistência SAB); comando telepático e controle total via reação.",
    classes: ["bardo", "feiticeiro", "mago", "bruxo"],
  },
  {
    id: "cone-de-frio", name: "Cone de Frio", level: 5, school: "Evocação",
    castingTime: "1 ação", range: "Pessoal (cone de 18m)", duration: "Instantânea",
    description: "Rajada gélida: 8d8 de dano de frio (resistência CON para metade). Mortos viram estátuas de gelo.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "coluna-de-chamas", name: "Coluna de Chamas", level: 5, school: "Evocação",
    castingTime: "1 ação", range: "18m", duration: "Instantânea",
    description: "Coluna divina: 4d6 fogo + 4d6 radiante num cilindro de 3m (resistência DES para metade).",
    classes: ["clerigo"],
  },
  {
    id: "curar-ferimentos-em-massa", name: "Curar Ferimentos em Massa", level: 5, school: "Evocação",
    castingTime: "1 ação", range: "18m", duration: "Instantânea",
    description: "Até 6 criaturas numa esfera de 9m recuperam 3d8 + mod. de conjuração PV.",
    classes: ["bardo", "clerigo", "druida"],
  },
  {
    id: "muralha-de-pedra", name: "Muralha de Pedra", level: 5, school: "Evocação",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 10 min",
    description: "Muro de pedra sólida (10 painéis de 3×3m); torna-se permanente se mantido a concentração inteira.",
    classes: ["druida", "feiticeiro", "mago"],
  },
  {
    id: "sonho", name: "Sonho", level: 5, school: "Ilusão",
    castingTime: "1 minuto", range: "Especial", duration: "8 horas",
    description: "Molda os sonhos de criatura conhecida; mensageiro onírico ou pesadelo (3d6 psíquico, sem descanso).",
    classes: ["bardo", "bruxo", "mago"],
  },
  {
    id: "reviver-os-mortos", name: "Reviver os Mortos", level: 5, school: "Necromancia",
    castingTime: "1 hora", range: "Toque", duration: "Instantânea",
    description: "Retorna à vida criatura morta há até 10 dias, com 1 PV. Componente: diamante (500 PO).",
    classes: ["bardo", "clerigo", "paladino"],
  },
  {
    id: "telecinesia", name: "Telecinésia", level: 5, school: "Transmutação",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 10 min",
    description: "Move criatura (teste de FOR contestado) ou objeto de até 500 kg pela mente, 9m por turno.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "passo-das-arvores", name: "Passo das Árvores", level: 5, school: "Conjuração",
    castingTime: "1 ação", range: "Pessoal", duration: "Concentração, até 1 min",
    description: "Entre numa árvore e saia por outra do mesmo tipo a até 150m, 1×/rodada.",
    classes: ["druida", "ranger"],
  },
  {
    id: "despertar", name: "Despertar", level: 5, school: "Transmutação",
    castingTime: "8 horas", range: "Toque", duration: "Instantânea",
    description: "Besta ou planta ganha Inteligência 10, fala e mobilidade; encantada por você por 30 dias.",
    classes: ["bardo", "druida"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NÍVEL 6
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "globo-de-invulnerabilidade", name: "Globo de Invulnerabilidade", level: 6, school: "Abjuração",
    castingTime: "1 ação", range: "Pessoal (raio de 3m)", duration: "Concentração, até 1 min",
    description: "Barreira imóvel: magias de 5° nível ou menor não afetam o interior.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "visao-da-verdade", name: "Visão da Verdade", level: 6, school: "Adivinhação",
    castingTime: "1 ação", range: "Toque", duration: "1 hora",
    description: "Alvo enxerga a forma verdadeira: invisível, ilusões, metamorfos e o Plano Etéreo (36m).",
    classes: ["bardo", "clerigo", "feiticeiro", "bruxo", "mago"],
  },
  {
    id: "aliado-planar", name: "Aliado Planar", level: 6, school: "Conjuração",
    castingTime: "10 minutos", range: "18m", duration: "Instantânea",
    description: "Sua divindade envia um celestial, elemental ou corruptor para ajudar (mediante pagamento).",
    classes: ["clerigo"],
  },
  {
    id: "danca-irresistivel", name: "Dança Irresistível", level: 6, school: "Encantamento",
    castingTime: "1 ação", range: "9m", duration: "Concentração, até 1 min",
    description: "Alvo dança sem parar: desvantagem em ataques e resistências; inimigos têm vantagem (SAB encerra).",
    classes: ["bardo", "mago"],
  },
  {
    id: "relampago-em-cadeia", name: "Relâmpago em Cadeia", level: 6, school: "Evocação",
    castingTime: "1 ação", range: "45m", duration: "Instantânea",
    description: "Raio salta para até 3 alvos adicionais: 10d8 elétrico cada (resistência DES para metade).",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "esfera-congelante", name: "Esfera Congelante", level: 6, school: "Evocação",
    castingTime: "1 ação", range: "90m", duration: "Instantânea",
    description: "Globo de frio explode em esfera de 18m: 10d6 de frio (resistência CON para metade). Congela líquidos.",
    classes: ["mago"],
  },
  {
    id: "cura-completa", name: "Cura Completa", level: 6, school: "Evocação",
    castingTime: "1 ação", range: "18m", duration: "Instantânea",
    description: "Alvo recupera 70 PV e fica livre de cegueira, surdez e doenças.",
    classes: ["clerigo", "druida"],
  },
  {
    id: "barreira-de-laminas", name: "Barreira de Lâminas", level: 6, school: "Evocação",
    castingTime: "1 ação", range: "27m", duration: "Concentração, até 10 min",
    description: "Muro de lâminas giratórias: 6d10 cortante a quem atravessa (resistência DES para metade); ¾ de cobertura.",
    classes: ["clerigo"],
  },
  {
    id: "raio-solar", name: "Raio Solar", level: 6, school: "Evocação",
    castingTime: "1 ação", range: "Pessoal (linha de 18m)", duration: "Concentração, até 1 min",
    description: "Linha de luz: 6d8 radiante e cegueira (resistência CON); reutilizável por ação durante a duração.",
    classes: ["druida", "feiticeiro", "mago"],
  },
  {
    id: "muralha-de-espinhos", name: "Muralha de Espinhos", level: 6, school: "Conjuração",
    castingTime: "1 ação", range: "36m", duration: "Concentração, até 10 min",
    description: "Muro de arbustos espinhosos: 7d8 perfurante ao atravessar (resistência DES para metade).",
    classes: ["druida"],
  },
  {
    id: "desintegrar", name: "Desintegrar", level: 6, school: "Transmutação",
    castingTime: "1 ação", range: "18m", duration: "Instantânea",
    description: "Raio verde: 10d6+40 de dano de energia (resistência DES); reduzido a 0 PV, o alvo vira pó.",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "contingencia", name: "Contingência", level: 6, school: "Evocação",
    castingTime: "10 minutos", range: "Pessoal", duration: "10 dias",
    description: "Magia de até 5° nível fica armazenada e dispara automaticamente sob a condição que você definir.",
    classes: ["mago"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NÍVEL 7
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dedo-da-morte", name: "Dedo da Morte", level: 7, school: "Necromancia",
    castingTime: "1 ação", range: "18m", duration: "Instantânea",
    description: "Dor lancinante: 7d8+30 necrótico (resistência CON para metade). Humanoide morto vira zumbi seu.",
    classes: ["feiticeiro", "mago", "bruxo"],
  },
  {
    id: "bola-de-fogo-de-explosao-retardada", name: "Bola de Fogo de Explosão Retardada", level: 7, school: "Evocação",
    castingTime: "1 ação", range: "45m", duration: "Concentração, até 1 min",
    description: "Esfera adormecida que acumula poder: 12d6 de fogo +1d6 por turno de espera (resistência DES).",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "teletransporte", name: "Teletransporte", level: 7, school: "Conjuração",
    castingTime: "1 ação", range: "3m", duration: "Instantânea",
    description: "Transporta você e até 8 criaturas para destino conhecido no mesmo plano (chance de erro por familiaridade).",
    classes: ["bardo", "feiticeiro", "mago"],
  },
  {
    id: "forma-eterea", name: "Forma Etérea", level: 7, school: "Transmutação",
    castingTime: "1 ação", range: "Pessoal", duration: "Até 8 horas",
    description: "Você entra no Plano Etéreo: atravessa objetos e criaturas, invisível para o plano material.",
    classes: ["bardo", "clerigo", "feiticeiro", "bruxo", "mago"],
  },
  {
    id: "inverter-gravidade", name: "Inverter Gravidade", level: 7, school: "Transmutação",
    castingTime: "1 ação", range: "30m", duration: "Concentração, até 1 min",
    description: "Cilindro de 15m: tudo cai para CIMA (resistência DES para se agarrar).",
    classes: ["druida", "feiticeiro", "mago"],
  },
  {
    id: "palavra-divina", name: "Palavra Divina", level: 7, school: "Evocação",
    castingTime: "1 ação bônus", range: "9m", duration: "Instantânea",
    description: "Palavra do poder criador: criaturas com poucos PV ficam surdas/cegas/atordoadas ou morrem (resistência CAR).",
    classes: ["clerigo"],
  },
  {
    id: "ressurreicao", name: "Ressurreição", level: 7, school: "Necromancia",
    castingTime: "1 hora", range: "Toque", duration: "Instantânea",
    description: "Retorna à vida criatura morta há até 100 anos, com todos os PV. Componente: diamante (1.000 PO).",
    classes: ["bardo", "clerigo"],
  },
  {
    id: "espada-arcana", name: "Espada Arcana", level: 7, school: "Evocação",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 min",
    description: "Espada de força espectral: ataque mágico, 3d10 de energia; move 6m por ação bônus.",
    classes: ["bardo", "mago"],
  },
  {
    id: "jaula-de-forca", name: "Jaula de Força", level: 7, school: "Evocação",
    castingTime: "1 ação", range: "30m", duration: "1 hora",
    description: "Prisão invisível de força (jaula ou caixa sólida); impossível escapar por teletransporte (resistência CAR).",
    classes: ["bruxo", "mago"],
  },
  {
    id: "tempestade-de-fogo", name: "Tempestade de Fogo", level: 7, school: "Evocação",
    castingTime: "1 ação", range: "45m", duration: "Instantânea",
    description: "10 cubos de 3m de chamas: 7d10 de fogo (resistência DES para metade).",
    classes: ["clerigo", "druida", "feiticeiro"],
  },
  {
    id: "simulacro", name: "Simulacro", level: 7, school: "Ilusão",
    castingTime: "12 horas", range: "Toque", duration: "Até ser dissipada",
    description: "Cópia de neve e gelo de uma criatura, com metade dos PV; obedece você. Não recupera magias.",
    classes: ["mago"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NÍVEL 8
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "campo-antimagia", name: "Campo Antimagia", level: 8, school: "Abjuração",
    castingTime: "1 ação", range: "Pessoal (esfera de 3m)", duration: "Concentração, até 1 hora",
    description: "Esfera onde nenhuma magia funciona: itens mágicos viram mundanos, magias são suprimidas.",
    classes: ["clerigo", "mago"],
  },
  {
    id: "aura-sagrada", name: "Aura Sagrada", level: 8, school: "Abjuração",
    castingTime: "1 ação", range: "Pessoal", duration: "Concentração, até 1 min",
    description: "Aliados a 9m: vantagem em resistências, inimigos com desvantagem; corruptores/mortos-vivos que acertam ficam cegos.",
    classes: ["clerigo"],
  },
  {
    id: "mente-em-branco", name: "Mente em Branco", level: 8, school: "Abjuração",
    castingTime: "1 ação", range: "Pessoal", duration: "24 horas",
    description: "Imune a dano psíquico, leitura de mente, adivinhação e enfeitiçamento — até contra desejo.",
    classes: ["bardo", "mago"],
  },
  {
    id: "dominar-monstro", name: "Dominar Monstro", level: 8, school: "Encantamento",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 hora",
    description: "Controla qualquer criatura (resistência SAB); comando telepático e controle total via reação.",
    classes: ["bardo", "feiticeiro", "bruxo", "mago"],
  },
  {
    id: "palavra-de-poder-atordoar", name: "Palavra de Poder: Atordoar", level: 8, school: "Encantamento",
    castingTime: "1 ação", range: "18m", duration: "Instantânea",
    description: "Criatura com 150 PV ou menos fica atordoada (resistência CON no fim de cada turno).",
    classes: ["bardo", "feiticeiro", "bruxo", "mago"],
  },
  {
    id: "explosao-solar", name: "Explosão Solar", level: 8, school: "Evocação",
    castingTime: "1 ação", range: "45m", duration: "Instantânea",
    description: "Luz solar brilhante num raio de 18m: 12d6 radiante e cegueira por 1 min (resistência CON).",
    classes: ["druida", "feiticeiro", "mago"],
  },
  {
    id: "terremoto", name: "Terremoto", level: 8, school: "Evocação",
    castingTime: "1 ação", range: "150m", duration: "Concentração, até 1 min",
    description: "Tremor num raio de 30m: derruba criaturas, abre fissuras, desaba estruturas.",
    classes: ["clerigo", "druida", "feiticeiro"],
  },
  {
    id: "labirinto", name: "Labirinto", level: 8, school: "Conjuração",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 10 min",
    description: "Bane o alvo para um labirinto extradimensional; escapa com teste de INT CD 20.",
    classes: ["mago"],
  },
  {
    id: "semiplano", name: "Semiplano", level: 8, school: "Conjuração",
    castingTime: "1 ação", range: "18m", duration: "1 hora",
    description: "Porta sombria para um semiplano de 9m: sala vazia ou um semiplano criado antes.",
    classes: ["bruxo", "mago"],
  },
  {
    id: "clone", name: "Clone", level: 8, school: "Necromancia",
    castingTime: "1 hora", range: "Toque", duration: "Instantânea",
    description: "Cresce uma cópia inerte de uma criatura; se ela morrer, a alma desperta no clone.",
    classes: ["mago"],
  },
  {
    id: "controlar-o-clima", name: "Controlar o Clima", level: 8, school: "Transmutação",
    castingTime: "10 minutos", range: "Pessoal (raio de 7,5 km)", duration: "Concentração, até 8 horas",
    description: "Muda precipitação, temperatura e vento na região, gradualmente.",
    classes: ["clerigo", "druida", "mago"],
  },
  {
    id: "forma-animal", name: "Forma Animal", level: 8, school: "Transmutação",
    castingTime: "1 ação", range: "9m", duration: "Concentração, até 24 horas",
    description: "Transforma criaturas voluntárias em bestas de ND 4 ou menor; pode mudar as formas por ação.",
    classes: ["druida"],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NÍVEL 9
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "desejo", name: "Desejo", level: 9, school: "Conjuração",
    castingTime: "1 ação", range: "Pessoal", duration: "Instantânea",
    description: "A magia mais poderosa: duplica qualquer magia de 8° nível ou menor, ou altera a realidade (com riscos).",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "chuva-de-meteoros", name: "Chuva de Meteoros", level: 9, school: "Evocação",
    castingTime: "1 ação", range: "1,5 km", duration: "Instantânea",
    description: "4 meteoros: esferas de 12m com 20d6 fogo + 20d6 contundente (resistência DES para metade).",
    classes: ["feiticeiro", "mago"],
  },
  {
    id: "palavra-de-poder-matar", name: "Palavra de Poder: Matar", level: 9, school: "Encantamento",
    castingTime: "1 ação", range: "18m", duration: "Instantânea",
    description: "Criatura com 100 PV ou menos morre instantaneamente, sem resistência.",
    classes: ["bardo", "feiticeiro", "bruxo", "mago"],
  },
  {
    id: "portal", name: "Portal", level: 9, school: "Conjuração",
    castingTime: "1 ação", range: "18m", duration: "Concentração, até 1 min",
    description: "Portal para outro plano de existência; pode trazer uma criatura específica pelo nome.",
    classes: ["clerigo", "feiticeiro", "mago"],
  },
  {
    id: "parar-o-tempo", name: "Parar o Tempo", level: 9, school: "Transmutação",
    castingTime: "1 ação", range: "Pessoal", duration: "Instantânea",
    description: "O tempo para para todos menos você: 1d4+1 turnos seguidos (encerra se afetar outra criatura).",
    classes: ["mago"],
  },
  {
    id: "metamorfose-verdadeira", name: "Metamorfose Verdadeira", level: 9, school: "Transmutação",
    castingTime: "1 ação", range: "9m", duration: "Concentração, até 1 hora",
    description: "Transforma criatura em outra criatura/objeto, ou objeto em criatura; permanente se concentrar 1h.",
    classes: ["bardo", "bruxo", "mago"],
  },
  {
    id: "premonicao", name: "Premonição", level: 9, school: "Adivinhação",
    castingTime: "1 minuto", range: "Toque", duration: "8 horas",
    description: "Alvo não pode ser surpreendido: vantagem em ataques, testes e resistências; inimigos com desvantagem.",
    classes: ["bardo", "druida", "bruxo", "mago"],
  },
  {
    id: "ressurreicao-verdadeira", name: "Ressurreição Verdadeira", level: 9, school: "Necromancia",
    castingTime: "1 hora", range: "Toque", duration: "Instantânea",
    description: "Retorna à vida criatura morta há até 200 anos, mesmo sem corpo. Componente: diamantes (25.000 PO).",
    classes: ["clerigo", "druida"],
  },
  {
    id: "cura-completa-em-massa", name: "Cura Completa em Massa", level: 9, school: "Evocação",
    castingTime: "1 ação", range: "18m", duration: "Instantânea",
    description: "Distribui 700 PV de cura entre criaturas escolhidas; remove cegueira, surdez e doenças.",
    classes: ["clerigo"],
  },
  {
    id: "tempestade-da-vinganca", name: "Tempestade da Vingança", level: 9, school: "Conjuração",
    castingTime: "1 ação", range: "Visão", duration: "Concentração, até 1 min",
    description: "Nuvem colossal: trovão ensurdecedor, ácido, raios (10d6), granizo e frio a cada rodada.",
    classes: ["druida"],
  },
  {
    id: "projecao-astral", name: "Projeção Astral", level: 9, school: "Necromancia",
    castingTime: "1 hora", range: "3m", duration: "Especial",
    description: "Você e até 8 criaturas projetam-se no Plano Astral com corpos astrais ligados por cordão prateado.",
    classes: ["bardo", "clerigo", "bruxo", "mago"],
  },
  {
    id: "aprisionamento", name: "Aprisionamento", level: 9, school: "Abjuração",
    castingTime: "1 minuto", range: "9m", duration: "Até ser dissipada",
    description: "Prisão mágica eterna (resistência SAB): enterrado, acorrentado, encolhido ou adormecido.",
    classes: ["bruxo", "mago"],
  },
];

/** classes.ts usa "patrulheiro"; o catálogo de magias usa "ranger". */
const CLASS_SPELL_ALIAS: Record<string, string> = { patrulheiro: "ranger" };

export function spellClassKey(classId: string): string {
  return CLASS_SPELL_ALIAS[classId] ?? classId;
}

export function getSpellsForClass(classId: string, level: number): Spell[] {
  const key = spellClassKey(classId);
  return SPELLS.filter((s) => s.level === level && s.classes.includes(key));
}

export const SCHOOL_COLORS: Record<string, string> = {
  "Abjuração":    "#4a90d9",
  "Adivinhação":  "#9b59b6",
  "Conjuração":   "#2ecc71",
  "Encantamento": "#e91e8c",
  "Evocação":     "#e74c3c",
  "Ilusão":       "#1abc9c",
  "Necromancia":  "#8e44ad",
  "Transmutação": "#f39c12",
};
