// ─── TORMENTA 20 — Magias (Capítulo 4) ───────────────────────────────────────
// Lista arcana + divina, 1º–5º círculo, com escola e descrição resumida
// (fonte: índice de magias do livro). Custo em PM segue SPELL_PM_COST (data.ts).
// Apenas magias de 1º círculo são selecionáveis na criação (nível 1); círculos
// superiores ficam disponíveis como referência para o Guia do Mestre.

import type { MagicSchool, MagicTradition } from "./data";

export interface Spell {
  id: string;
  name: string;
  tradition: MagicTradition;
  school: MagicSchool;
  circle: 1 | 2 | 3 | 4 | 5;
  description: string;
}

const SCHOOL_MAP: Record<string, MagicSchool> = {
  Abjur: "Abjuração", Adiv: "Adivinhação", Conv: "Convocação", Encan: "Encantamento",
  Evoc: "Evocação", Ilusão: "Ilusão", Necro: "Necromancia", Trans: "Transmutação",
};

function slug(name: string): string {
  return name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type RawEntry = [circle: 1 | 2 | 3 | 4 | 5, school: string, name: string, description: string];

const ARCANE_RAW: RawEntry[] = [
  [1, "Abjur", "Alarme", "Avisa quando alguém invadir uma área protegida."],
  [1, "Abjur", "Armadura Arcana", "Aumenta sua Defesa."],
  [1, "Abjur", "Resistência a Energia", "Fornece resistência contra um tipo de energia a sua escolha."],
  [1, "Abjur", "Tranca Arcana", "Tranca um item que possa ser aberto ou fechado."],
  [1, "Adiv", "Aviso", "Envia um alerta telepático para uma criatura."],
  [1, "Adiv", "Compreensão", "Você entende qualquer coisa escrita ou falada e pode ouvir pensamentos."],
  [1, "Adiv", "Concentração de Combate", "Ao atacar, você pode rolar dois dados e ficar com o melhor."],
  [1, "Adiv", "Visão Mística", "Você pode ver auras mágicas."],
  [1, "Conv", "Área Escorregadia", "Criaturas na área podem cair ou objeto afetado pode ser derrubado."],
  [1, "Conv", "Conjurar Monstro", "Convoca um monstro sob seu comando."],
  [1, "Conv", "Névoa", "Cria uma névoa que oferece camuflagem."],
  [1, "Conv", "Teia", "Criaturas na área ficam enredadas."],
  [1, "Encan", "Adaga Mental", "Alvo sofre dano mental e pode ficar pasmo."],
  [1, "Encan", "Enfeitiçar", "Alvo se torna prestativo e pode realizar um pedido seu."],
  [1, "Encan", "Hipnotismo", "Alvos ficam fascinados."],
  [1, "Encan", "Sono", "Alvo fica fatigado ou cai em um sono profundo."],
  [1, "Evoc", "Explosão de Chamas", "Cone causa dano de fogo."],
  [1, "Evoc", "Luz", "Objeto ilumina como uma tocha."],
  [1, "Evoc", "Seta Infalível de Talude", "Dispara setas de energia que acertam automaticamente."],
  [1, "Evoc", "Toque Chocante", "Toque causa dano de eletricidade."],
  [1, "Ilusão", "Criar Ilusão", "Cria uma ilusão visual ou sonora."],
  [1, "Ilusão", "Disfarce Ilusório", "Muda a aparência de uma ou mais criaturas."],
  [1, "Ilusão", "Imagem Espelhada", "Cria duplicatas para confundir os inimigos, oferecendo bônus na Defesa."],
  [1, "Ilusão", "Leque Cromático", "Criaturas na área ficam ofuscadas ou atordoadas."],
  [1, "Necro", "Amedrontar", "O alvo fica abalado ou apavorado."],
  [1, "Necro", "Escuridão", "Objeto emana uma área de escuridão."],
  [1, "Necro", "Raio do Enfraquecimento", "O alvo fica fatigado ou vulnerável."],
  [1, "Necro", "Vitalidade Fantasma", "Você recebe pontos de vida temporários."],
  [1, "Trans", "Arma Mágica", "Arma recebe bônus ou poderes mágicos."],
  [1, "Trans", "Primor Atlético", "Alvo recebe bônus no deslocamento e em testes de Atletismo."],
  [1, "Trans", "Queda Suave", "Alvo cai lentamente."],
  [1, "Trans", "Transmutar Objetos", "Pode consertar ou fabricar um objeto temporário."],

  [2, "Abjur", "Campo de Força", "Cria uma película protetora que absorve dano."],
  [2, "Abjur", "Dissipar Magia", "Cancela os efeitos de magias ativas em um alvo ou área."],
  [2, "Abjur", "Refúgio", "Cria um domo para abrigar o conjurador e seus aliados."],
  [2, "Abjur", "Runa de Proteção", "Runa protege passagem ou objeto."],
  [2, "Adiv", "Ligação Telepática", "Estabelece um vínculo telepático entre duas ou mais criaturas."],
  [2, "Adiv", "Localização", "Determina em que direção está um objeto ou criatura a sua escolha."],
  [2, "Adiv", "Mapear", "Traça um esboço de mapa dos arredores."],
  [2, "Conv", "Amarras Etéreas", "Laços de energia prendem o alvo."],
  [2, "Conv", "Montaria Arcana", "Convoca uma criatura que serve como montaria."],
  [2, "Conv", "Salto Dimensional", "Teletransporta você e outras criaturas para um ponto dentro do alcance."],
  [2, "Conv", "Servos Invisíveis", "Seres invisíveis realizam tarefas para você."],
  [2, "Encan", "Desespero Esmagador", "Criaturas na área perdem a vontade de lutar."],
  [2, "Encan", "Marca da Obediência", "Símbolo mágico obriga o alvo a cumprir uma ordem."],
  [2, "Encan", "Sussurros Insanos", "Deixa o alvo confuso."],
  [2, "Evoc", "Bola de Fogo", "Esfera incandescente explode, causando dano em todas as criaturas na área."],
  [2, "Evoc", "Flecha Ácida", "Dispara um projétil de ácido que corrói armaduras e outros objetos."],
  [2, "Evoc", "Relâmpago", "Causa dano de eletricidade em criaturas numa linha."],
  [2, "Evoc", "Sopro das Uivantes", "Explosão em cone causa dano de frio e empurra alvos."],
  [2, "Ilusão", "Aparência Perfeita", "Aumenta o Carisma e concede bônus em perícias sociais."],
  [2, "Ilusão", "Camuflagem Ilusória", "A imagem do alvo fica distorcida, concedendo camuflagem."],
  [2, "Ilusão", "Esculpir Sons", "Altera os sons emitidos pelos alvos."],
  [2, "Ilusão", "Invisibilidade", "Você se torna invisível por um curto período."],
  [2, "Necro", "Conjurar Mortos-Vivos", "Ergue mortos-vivos para lutar por você."],
  [2, "Necro", "Crânio Voador de Vladislav", "Crânio flutuante causa dano em um alvo."],
  [2, "Necro", "Toque Vampírico", "Toque causa dano e absorve pontos de vida."],
  [2, "Trans", "Alterar Tamanho", "Aumenta ou diminui o tamanho de objetos e criaturas."],
  [2, "Trans", "Metamorfose", "Transforma o corpo do alvo."],
  [2, "Trans", "Velocidade", "Alvo pode fazer ações adicionais."],

  [3, "Abjur", "Âncora Dimensional", "Impede o alvo de se afastar de um ponto, mesmo com teletransporte."],
  [3, "Abjur", "Dificultar Detecção", "Protege uma criatura ou objeto contra detecção e vidência."],
  [3, "Abjur", "Globo de Invulnerabilidade", "Esfera protege contra magias de 1º e 2º círculos."],
  [3, "Adiv", "Contato Extraplanar", "Você barganha com criaturas de outros planos para obter ajuda."],
  [3, "Adiv", "Lendas e Histórias", "Descobre detalhes sobre criaturas, objetos e lugares."],
  [3, "Adiv", "Vidência", "Pode ver e ouvir os arredores de uma criatura."],
  [3, "Conv", "Convocação Instantânea", "Teletransporta um objeto marcado para suas mãos."],
  [3, "Conv", "Enxame Rubro de Ichabod", "Invoca uma massa rastejante de demônios da Tormenta."],
  [3, "Conv", "Teletransporte", "Transporta você e outras criaturas e objetos para um local instantaneamente."],
  [3, "Encan", "Imobilizar", "Alvo fica lento ou paralisado."],
  [3, "Encan", "Selo de Mana", "Você sela a energia de uma criatura, impedindo que use pontos de mana."],
  [3, "Evoc", "Erupção Glacial", "Estacas de gelo explodem do chão, ferindo e derrubando os alvos."],
  [3, "Evoc", "Lança Ígnea de Aleph", "Projétil de magma explode no alvo, causando dano por rodada."],
  [3, "Evoc", "Muralha Elemental", "Evoca um muro feito de fogo ou gelo."],
  [3, "Ilusão", "Ilusão Lacerante", "Cria uma ilusão perigosa que pode causar dano real."],
  [3, "Ilusão", "Manto de Sombras", "Conjurador se cobre de sombras mágicas para vários efeitos."],
  [3, "Ilusão", "Miragem", "Altera uma área de forma ilusória."],
  [3, "Necro", "Ferver Sangue", "Criatura tem seu sangue aquecido até borbulhar, causando dano."],
  [3, "Necro", "Servo Morto-Vivo", "Cria um aliado morto-vivo sob seu comando."],
  [3, "Necro", "Tentáculos de Trevas", "Tentáculos de energia negativa atacam e agarram criaturas na área."],
  [3, "Trans", "Pele de Pedra", "Endurece sua pele, fornecendo resistência a dano."],
  [3, "Trans", "Telecinesia", "Move e arremessa criaturas e objetos com a mente."],
  [3, "Trans", "Transformação de Guerra", "Você recebe habilidades superiores de combate, mas perde a habilidade de lançar magias."],
  [3, "Trans", "Voo", "Você recebe deslocamento voo 12m."],

  [4, "Abjur", "Campo Antimagia", "Barreira anula todos os efeitos mágicos."],
  [4, "Abjur", "Libertação", "O alvo fica imune a efeitos que impeçam ou restrinjam movimentação."],
  [4, "Adiv", "Sonho", "Você entra nos sonhos de uma criatura e pode interagir com ela lá."],
  [4, "Adiv", "Visão da Verdade", "Você enxerga através de camuflagem, escuridão, ilusão e transmutação."],
  [4, "Conv", "Conjurar Elemental", "Convoca um elemental como aliado."],
  [4, "Conv", "Mão Poderosa de Talude", "Mão gigante feita de energia pode realizar várias ações."],
  [4, "Conv", "Viagem Planar", "Viaja até outro plano de existência."],
  [4, "Encan", "Alterar Memória", "Pode apagar ou modificar a memória recente do alvo."],
  [4, "Encan", "Marionete", "Controla o corpo do alvo."],
  [4, "Evoc", "Raio Polar", "Causa dano de frio e congela alvo."],
  [4, "Evoc", "Relâmpago Flamejante de Reynard", "Dispara rajadas de fogo e relâmpago."],
  [4, "Evoc", "Talho Invisível de Edauros", "Lâmina de ar em alta velocidade corta os alvos."],
  [4, "Ilusão", "Duplicata Ilusória", "Imagem projetada copia seus movimentos e ações."],
  [4, "Ilusão", "Explosão Caleidoscópica", "Explosão de luzes e sons desabilita os alvos."],
  [4, "Necro", "Assassino Fantasmagórico", "Conjura um fantasma que persegue e tenta matar o alvo."],
  [4, "Necro", "Muralha de Ossos", "Barreira de ossos afiados impede o avanço dos inimigos."],
  [4, "Trans", "Animar Objetos", "Objetos comuns ganham vida e obedecem a seus comandos."],
  [4, "Trans", "Controlar a Gravidade", "Manipula os efeitos da gravidade em uma área."],
  [4, "Trans", "Desintegrar", "Raio transforma um alvo em pó."],
  [4, "Trans", "Forma Etérea", "Você pode se tornar etéreo enquanto a magia durar."],

  [5, "Abjur", "Aprisionamento", "Prende o alvo de diversas formas poderosas."],
  [5, "Abjur", "Engenho de Mana", "Disco de energia flutuante é capaz de absorver magias e gerar PM."],
  [5, "Abjur", "Invulnerabilidade", "Recebe uma série de imunidades físicas ou mentais a sua escolha."],
  [5, "Adiv", "Alterar Destino", "Enxerga o futuro, podendo alterar o resultado de um teste."],
  [5, "Adiv", "Projetar Consciência", "Pode observar qualquer local ou criatura."],
  [5, "Conv", "Buraco Negro", "Abre uma ruptura no espaço que suga tudo ao redor."],
  [5, "Conv", "Chuva de Meteoros", "Convoca um enorme meteorito incandescente."],
  [5, "Conv", "Semiplano", "Cria uma pequena dimensão."],
  [5, "Encan", "Legião", "Você pode dominar a mente de vários alvos ao mesmo tempo e comandar suas vontades."],
  [5, "Encan", "Palavra Primordial", "Palavras mágicas podem atordoar, cegar e até matar uma criatura."],
  [5, "Encan", "Possessão", "Transfere sua consciência para o corpo do alvo, tomando controle total."],
  [5, "Evoc", "Barragem Elemental de Vectorius", "Lança esferas elementais explosivas."],
  [5, "Evoc", "Deflagração de Mana", "Explosão de energia bruta causa dano e afeta magias e itens mágicos."],
  [5, "Evoc", "Mata-Dragão", "Dispara uma rajada de energia destruidora."],
  [5, "Ilusão", "Réquiem", "Prende os alvos em uma realidade ilusória que se repete infinitamente."],
  [5, "Ilusão", "Sombra Assassina", "Manifesta uma cópia ilusória do alvo, que luta contra ele."],
  [5, "Necro", "Roubar a Alma", "Arranca a alma do alvo e a prende em um objeto."],
  [5, "Necro", "Toque da Morte", "Pode matar uma criatura instantaneamente."],
  [5, "Trans", "Controlar o Tempo", "Acelera, avança ou para o tempo."],
  [5, "Trans", "Desejo", "Modifica a realidade a seu bel-prazer."],
];

const DIVINE_RAW: RawEntry[] = [
  [1, "Abjur", "Escudo da Fé", "Protege uma criatura."],
  [1, "Abjur", "Proteção Divina", "Alvo recebe bônus em testes de resistência."],
  [1, "Abjur", "Resistência a Energia", "Fornece resistência contra um tipo de energia a sua escolha."],
  [1, "Abjur", "Santuário", "Inimigos devem passar num teste de Vontade para atacá-lo."],
  [1, "Abjur", "Suporte Ambiental", "Ignora efeitos de calor e frio e pode respirar na água."],
  [1, "Adiv", "Aviso", "Envia um alerta telepático para uma criatura."],
  [1, "Adiv", "Compreensão", "Você entende qualquer coisa escrita ou falada e pode ouvir pensamentos."],
  [1, "Adiv", "Detectar Ameaças", "Detecta a presença, quantidade e poder de criaturas na área."],
  [1, "Adiv", "Orientação", "Alvo recebe bônus nos testes de perícia."],
  [1, "Adiv", "Visão Mística", "Você pode ver auras mágicas."],
  [1, "Conv", "Arma Espiritual", "Cria uma arma de energia que ataca seus inimigos."],
  [1, "Conv", "Caminhos da Natureza", "Convoca um espírito que guia você e seus aliados em terreno selvagem."],
  [1, "Conv", "Criar Elementos", "Cria uma quantidade Minúscula de água, ar, fogo ou terra."],
  [1, "Conv", "Névoa", "Cria uma névoa que oferece camuflagem."],
  [1, "Encan", "Acalmar Animal", "Um animal fica prestativo."],
  [1, "Encan", "Bênção", "Fornece bônus em ataques e dano."],
  [1, "Encan", "Comando", "Força o alvo a obedecer a uma ordem."],
  [1, "Encan", "Tranquilidade", "Acalma criaturas na área."],
  [1, "Evoc", "Consagrar", "Abençoa a área, maximizando efeitos de cura."],
  [1, "Evoc", "Curar Ferimentos", "Seu toque recupera pontos de vida."],
  [1, "Evoc", "Despedaçar", "Som alto e agudo causa atordoamento e dano de impacto."],
  [1, "Evoc", "Luz", "Objeto ilumina como uma tocha."],
  [1, "Necro", "Escuridão", "Objeto emana uma área de escuridão."],
  [1, "Necro", "Infligir Ferimentos", "Seu toque causa dano de trevas e pode deixar fraco."],
  [1, "Necro", "Perdição", "Inimigos sofrem penalidade nos ataques e danos."],
  [1, "Necro", "Profanar", "Conspurca a área, dobrando o dano de trevas."],
  [1, "Trans", "Abençoar Alimentos", "Purifica refeição, que também fornece bônus temporários."],
  [1, "Trans", "Arma Mágica", "Arma recebe bônus ou poderes mágicos."],
  [1, "Trans", "Armamento da Natureza", "Arma natural ou primitiva causa dano como se fosse maior."],
  [1, "Trans", "Controlar Plantas", "Vegetação enreda criaturas."],

  [2, "Abjur", "Círculo da Justiça", "Causa penalidades em Enganação, Furtividade e Ladinagem."],
  [2, "Abjur", "Dissipar Magia", "Cancela os efeitos de uma magia ativa em um alvo ou área."],
  [2, "Abjur", "Runa de Proteção", "Runa protege passagem ou objeto."],
  [2, "Abjur", "Vestimenta da Fé", "Traje, armadura ou escudo recebe bônus na Defesa."],
  [2, "Adiv", "Augúrio", "Diz se uma ação trará resultados bons, ruins ou ambos."],
  [2, "Adiv", "Condição", "Monitora a condição (PV, condições, magias afetando) de criaturas tocadas."],
  [2, "Adiv", "Globo da Verdade de Gwen", "Globo revela cena vista pelo conjurador."],
  [2, "Adiv", "Mente Divina", "Fornece bônus em um ou mais atributos mentais."],
  [2, "Adiv", "Voz Divina", "Converse com criaturas variadas, plantas, rochas e cadáveres."],
  [2, "Conv", "Enxame de Pestes", "Alvo sofre dano de veneno toda rodada."],
  [2, "Conv", "Soco de Arsenal", "Alvo sofre dano de impacto e é empurrado."],
  [2, "Encan", "Aliado Animal", "Um animal prestativo se torna um aliado."],
  [2, "Encan", "Marca da Obediência", "Símbolo mágico obriga o alvo a cumprir uma ordem."],
  [2, "Encan", "Oração", "Aliados recebem bônus e inimigos sofrem penalidades em testes e rolagens."],
  [2, "Evoc", "Controlar Fogo", "Move ou apaga uma chama, esquenta um objeto ou cria armas flamejantes."],
  [2, "Evoc", "Purificação", "Toque remove condições prejudiciais."],
  [2, "Evoc", "Raio Solar", "Linha causa dano de luz e deixa criaturas ofuscadas."],
  [2, "Evoc", "Tempestade Divina", "Causa efeitos de vento, precipitações e penalidades para criaturas voadoras."],
  [2, "Ilusão", "Silêncio", "Cria uma área em que é impossível ouvir sons ou lançar magias."],
  [2, "Necro", "Conjurar Mortos-Vivos", "Ergue mortos-vivos para lutar por você."],
  [2, "Necro", "Miasma Mefítico", "Nuvem causa dano de veneno e enjoo."],
  [2, "Necro", "Rogar Maldição", "O alvo sofre efeitos prejudiciais variados."],
  [2, "Trans", "Controlar Madeira", "Fortalece, molda, repele ou deforma um objeto de madeira."],
  [2, "Trans", "Físico Divino", "Fornece bônus em um ou mais atributos físicos."],

  [3, "Abjur", "Banimento", "Expulsa criaturas de outros planos e destrói mortos-vivos."],
  [3, "Abjur", "Proteção contra Magia", "Concede bônus em testes de resistência contra magias."],
  [3, "Adiv", "Comunhão com a Natureza", "Você recebe dados para usar como bônus em testes de perícias."],
  [3, "Adiv", "Lendas e Histórias", "Descobre detalhes sobre criaturas, objetos e magias."],
  [3, "Adiv", "Vidência", "Pode ver e ouvir os arredores de uma criatura."],
  [3, "Conv", "Servo Divino", "Invoca um espírito para realizar uma tarefa, por um preço."],
  [3, "Conv", "Viagem Arbórea", "Você pode usar árvores e plantas para se teletransportar."],
  [3, "Encan", "Despertar Consciência", "Plantas e animais ganham consciência e se tornam aliados."],
  [3, "Encan", "Heroísmo", "Alvo fica imune a medo e ganha bônus contra inimigos mais poderosos do que ele."],
  [3, "Encan", "Imobilizar", "Alvo fica lento ou paralisado."],
  [3, "Encan", "Missão Divina", "Alvo deve cumprir uma tarefa, ou sofrer penalidades em testes."],
  [3, "Encan", "Selo de Mana", "Você sela a energia de uma criatura, impedindo que use Pontos de Mana."],
  [3, "Evoc", "Coluna de Chamas", "Os céus despejam luz e fogo sobre seus inimigos."],
  [3, "Evoc", "Dispersar as Trevas", "Dispersão anula magias, protege aliados e cega inimigos."],
  [3, "Evoc", "Sopro da Salvação", "Cone cura aliados e remove condições prejudiciais."],
  [3, "Ilusão", "Manto de Sombras", "Conjurador se cobre de sombras mágicas para vários efeitos."],
  [3, "Necro", "Anular a Luz", "Explosão anula magias, protege aliados e enjoa inimigos."],
  [3, "Necro", "Poeira da Podridão", "Nuvem causa dano de trevas e impede magia de cura."],
  [3, "Necro", "Servo Morto-Vivo", "Cria um aliado morto-vivo sob seu comando."],
  [3, "Trans", "Controlar Água", "Congela, derrete, evapora, aumenta ou reduz o nível de um corpo d'água."],
  [3, "Trans", "Controlar Terra", "Amolece, molda ou solidifica uma área de terra, pedra ou similar."],
  [3, "Trans", "Pele de Pedra", "Endurece sua pele, fornecendo resistência a dano."],
  [3, "Trans", "Potência Divina", "Você aumenta de tamanho e recebe bônus de Força e resistência a dano, mas perde habilidade de lançar magias."],

  [4, "Abjur", "Cúpula de Repulsão", "Campo de força invisível impede a aproximação de um tipo de criatura."],
  [4, "Abjur", "Libertação", "O alvo fica imune a efeitos que impeçam ou restrinjam movimentação."],
  [4, "Adiv", "Premonição", "Você vislumbra o futuro e pode refazer testes."],
  [4, "Adiv", "Visão da Verdade", "Você enxerga através de camuflagem, escuridão, ilusão e transmutação."],
  [4, "Conv", "Guardião Divino", "Elemental de luz cura aliados."],
  [4, "Conv", "Viagem Planar", "Viaja até outro plano de existência."],
  [4, "Encan", "Conceder Milagre", "Alvo pode lançar uma de suas magias de 2º círculo ou menor."],
  [4, "Evoc", "Círculo da Restauração", "Círculo de energia luminosa restaura PV e PM."],
  [4, "Evoc", "Cólera de Azgher", "Explosão solar cega, incendeia e causa dano."],
  [4, "Evoc", "Manto do Cruzado", "Invoca um manto de energia que concede poderes a quem o vestir."],
  [4, "Evoc", "Terremoto", "Tremor de terra causa dano de impacto."],
  [4, "Necro", "Ligação Sombria", "Alvo sofre todo dano e efeitos negativos que você sofrer."],
  [4, "Necro", "Muralha de Ossos", "Barreira de ossos afiados impede o avanço dos inimigos."],
  [4, "Trans", "Controlar o Clima", "Muda o clima de uma área."],

  [5, "Abjur", "Aura Divina", "Emana poder divino bruto, afetando as criaturas na área."],
  [5, "Abjur", "Invulnerabilidade", "Recebe uma série de imunidades físicas ou mentais a sua escolha."],
  [5, "Abjur", "Lágrimas de Wynna", "Alvo perde a capacidade de lançar magias arcanas."],
  [5, "Adiv", "Projetar Consciência", "Pode observar qualquer local ou criatura."],
  [5, "Conv", "Buraco Negro", "Abre uma ruptura no espaço que suga tudo ao redor."],
  [5, "Conv", "Intervenção Divina", "Convoca sua divindade para que realize um milagre."],
  [5, "Encan", "Palavra Primordial", "Palavras mágicas podem atordoar, cegar e até matar uma criatura."],
  [5, "Evoc", "Fúria do Panteão", "Nuvem gera efeitos destrutivos."],
  [5, "Evoc", "Segunda Chance", "Cura e ressuscita aliados."],
  [5, "Necro", "Reanimação Impura", "Ressuscita uma criatura morta, mas como um zumbi sob seu controle."],
  [5, "Necro", "Roubar a Alma", "Arranca a alma do alvo e a prende em um objeto."],
  [5, "Necro", "Toque da Morte", "Pode matar uma criatura instantaneamente."],
];

function build(raw: RawEntry[], tradition: MagicTradition): Spell[] {
  return raw.map(([circle, school, name, description]) => ({
    id: `${tradition}-${slug(name)}`,
    name,
    tradition,
    school: SCHOOL_MAP[school],
    circle,
    description,
  }));
}

export const SPELLS: Spell[] = [
  ...build(ARCANE_RAW, "arcana"),
  ...build(DIVINE_RAW, "divina"),
];

export function getSpellsForTradition(tradition: MagicTradition, circle?: number): Spell[] {
  return SPELLS.filter((s) => s.tradition === tradition && (circle === undefined || s.circle === circle));
}

export function getSpellsForSchools(tradition: MagicTradition, schools: MagicSchool[], circle?: number): Spell[] {
  return getSpellsForTradition(tradition, circle).filter((s) => schools.includes(s.school));
}

export const MAGIC_SCHOOLS: MagicSchool[] = ["Abjuração", "Adivinhação", "Convocação", "Encantamento", "Evocação", "Ilusão", "Necromancia", "Transmutação"];
