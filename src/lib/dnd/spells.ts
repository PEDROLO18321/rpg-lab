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
];

export function getSpellsForClass(classId: string, level: number): Spell[] {
  return SPELLS.filter((s) => s.level === level && s.classes.includes(classId));
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
