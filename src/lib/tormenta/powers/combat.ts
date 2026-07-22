// ─── TORMENTA 20 — Poderes de Combate (Capítulo 2, pág. 124-129) ─────────────
import type { Power } from "./types";

export const COMBAT_POWERS: Power[] = [
  {
    id: "acuidade-com-arma",
    name: "Acuidade com Arma",
    category: "combate",
    prerequisite: "Des 13",
    description:
      "Quando usa uma arma leve de corpo a corpo ou uma arma de arremesso, você pode usar seu modificador de Destreza em vez de Força nos testes de ataque e rolagens de dano.",
  },
  {
    id: "arma-secundaria-grande",
    name: "Arma Secundária Grande",
    category: "combate",
    prerequisite: "Estilo de Duas Armas",
    description:
      "Você pode usar duas armas de uma mão com o poder Estilo de Duas Armas.",
  },
  {
    id: "arremesso-potente",
    name: "Arremesso Potente",
    category: "combate",
    prerequisite: "For 13, Estilo de Arremesso",
    description:
      "Quando usa uma arma de arremesso, você pode usar seu modificador de Força em vez de Destreza nos testes de ataque. Se você possuir o poder Ataque Poderoso, poderá usá-lo com armas de arremesso.",
  },
  {
    id: "ataque-pesado",
    name: "Ataque Pesado",
    category: "combate",
    prerequisite: "Estilo de Duas Mãos",
    description:
      "Quando faz um ataque corpo a corpo com uma arma de duas mãos, você pode pagar 1 PM. Se fizer isso e acertar o ataque, além do dano você faz uma manobra derrubar ou empurrar contra o alvo como uma ação livre (use o resultado do ataque como o teste de manobra).",
  },
  {
    id: "ataque-poderoso",
    name: "Ataque Poderoso",
    category: "combate",
    prerequisite: "For 13",
    description:
      "Declare que está usando este poder antes de fazer um ataque corpo a corpo. Você sofre –2 no teste de ataque, mas recebe +5 na rolagem de dano.",
  },
  {
    id: "ataque-preciso",
    name: "Ataque Preciso",
    category: "combate",
    prerequisite: "Estilo de Uma Arma",
    description:
      "Se estiver usando uma arma corpo a corpo em uma das mãos e nada na outra, você recebe +2 na margem de ameaça e +1 no multiplicador de crítico.",
  },
  {
    id: "bloqueio-com-escudo",
    name: "Bloqueio com Escudo",
    category: "combate",
    prerequisite: "Estilo de Arma e Escudo",
    description:
      "Quando é atingido por um ataque, habilidade ou magia, você pode gastar 1 PM para receber resistência a dano contra este ataque igual ao bônus na Defesa que seu escudo fornece. Você só pode usar este poder se estiver usando um escudo.",
  },
  {
    id: "carga-de-cavalaria",
    name: "Carga de Cavalaria",
    category: "combate",
    prerequisite: "Ginete",
    description:
      "Quando faz uma investida montada, você causa +2d8 pontos de dano. Além disso, pode continuar se movendo depois do ataque. Você deve se mover em linha reta e seu movimento máximo ainda é o dobro do seu deslocamento.",
  },
  {
    id: "combate-defensivo",
    name: "Combate Defensivo",
    category: "combate",
    prerequisite: "Int 13",
    description:
      "Quando usa a ação atacar, você pode usar este poder. Se fizer isso, até seu próximo turno, sofre –2 em todos os testes de ataque, mas recebe +5 na Defesa.",
  },
  {
    id: "derrubar-aprimorado",
    name: "Derrubar Aprimorado",
    category: "combate",
    prerequisite: "Combate Defensivo",
    description:
      "Você recebe +2 em testes de ataque para derrubar. Quando derruba uma criatura com essa manobra, pode gastar 1 PM para fazer um ataque extra contra ela.",
  },
  {
    id: "desarmar-aprimorado",
    name: "Desarmar Aprimorado",
    category: "combate",
    prerequisite: "Combate Defensivo",
    description:
      'Você recebe +2 em testes de ataque para desarmar. Quando desarma uma criatura, pode gastar 1 PM para arremessar a arma dela para longe. Para definir onde a arma cai, role 1d8 para a direção (sendo "1" diretamente à sua frente, "2" à frente e à direita e assim por diante, em sentido horário) e 1d6 para a distância (medida em quadrados de 1,5m a partir da criatura desarmada).',
  },
  {
    id: "disparo-preciso",
    name: "Disparo Preciso",
    category: "combate",
    prerequisite: "Estilo de Disparo ou Estilo de Arremesso",
    description:
      "Você pode fazer ataques à distância contra oponentes envolvidos em combate corpo a corpo sem sofrer a penalidade padrão de –5 no teste de ataque.",
  },
  {
    id: "disparo-rapido",
    name: "Disparo Rápido",
    category: "combate",
    prerequisite: "Des 13, Estilo de Disparo ou Estilo de Arremesso",
    description:
      "Se estiver usando uma arma de ataque à distância e gastar uma ação completa para atacar, você pode fazer um ataque adicional com ela (se puder recarregá-la como ação livre). Se fizer isso, sofre –2 em todos os testes de ataque até o seu próximo turno.",
  },
  {
    id: "empunhadura-poderosa",
    name: "Empunhadura Poderosa",
    category: "combate",
    prerequisite: "For 17",
    description:
      "Ao usar uma arma feita para uma categoria de tamanho maior que a sua, a penalidade que você sofre nos testes de ataque diminui para –2 (normalmente, uma criatura que use uma arma feita para uma categoria de tamanho maior sofre uma penalidade de –5 nos testes de ataque).",
  },
  {
    id: "encouracado",
    name: "Encouraçado",
    category: "combate",
    prerequisite: "Proficiência com armaduras pesadas",
    description:
      "Se estiver usando uma armadura pesada, você recebe +2 na Defesa. Esse bônus aumenta em +2 para cada outro poder que você possua que tenha Encouraçado como pré-requisito.",
  },
  {
    id: "esquiva",
    name: "Esquiva",
    category: "combate",
    prerequisite: "Des 13",
    description: "Você recebe +2 em Defesa e Reflexos.",
  },
  {
    id: "estilo-de-arma-e-escudo",
    name: "Estilo de Arma e Escudo",
    category: "combate",
    prerequisite: "Treinado em Luta, proficiência com escudos",
    description:
      "Se você estiver usando um escudo, o bônus na Defesa que ele fornece aumenta em +2.",
  },
  {
    id: "estilo-de-arremesso",
    name: "Estilo de Arremesso",
    category: "combate",
    prerequisite: "Treinado em Pontaria",
    description:
      "Você pode sacar armas de arremesso como uma ação livre e recebe +2 nas rolagens de dano com elas.",
  },
  {
    id: "estilo-de-disparo",
    name: "Estilo de Disparo",
    category: "combate",
    prerequisite: "Treinado em Pontaria",
    description:
      "Se estiver usando uma arma de disparo, você soma o bônus de Destreza nas rolagens de dano.",
  },
  {
    id: "estilo-de-duas-armas",
    name: "Estilo de Duas Armas",
    category: "combate",
    prerequisite: "Des 15, treinado em Luta",
    description:
      "Se estiver usando duas armas (e pelo menos uma delas for leve) e fizer a ação atacar, você pode fazer dois ataques, um com cada arma. Se fizer isso, sofre –2 em todos os testes de ataque até o seu próximo turno. Se você possuir Ambidestria, não sofre essa penalidade.",
  },
  {
    id: "estilo-de-duas-maos",
    name: "Estilo de Duas Mãos",
    category: "combate",
    prerequisite: "For 15, treinado em Luta",
    description:
      "Se estiver usando uma arma corpo a corpo com as duas mãos, você recebe +5 nas rolagens de dano. Este poder não pode ser usado com armas leves.",
  },
  {
    id: "estilo-de-uma-arma",
    name: "Estilo de Uma Arma",
    category: "combate",
    prerequisite: "Treinado em Luta",
    description:
      "Se estiver usando uma arma corpo a corpo em uma das mãos e nada na outra, você recebe +2 na Defesa e nos testes de ataque com essa arma (exceto ataques desarmados).",
  },
  {
    id: "estilo-desarmado",
    name: "Estilo Desarmado",
    category: "combate",
    prerequisite: "Treinado em Luta",
    description:
      "Seus ataques desarmados causam 1d6 pontos de dano e podem causar dano letal ou não letal (sem penalidades).",
  },
  {
    id: "fanatico",
    name: "Fanático",
    category: "combate",
    prerequisite: "12º nível de personagem, Encouraçado",
    description: "Seu deslocamento não é reduzido por usar armaduras pesadas.",
  },
  {
    id: "finta-aprimorada",
    name: "Finta Aprimorada",
    category: "combate",
    prerequisite: "Treinado em Enganação e Luta",
    description:
      "Você recebe +2 em testes de Enganação para fintar e pode fintar como uma ação de movimento.",
  },
  {
    id: "foco-em-arma",
    name: "Foco em Arma",
    category: "combate",
    prerequisite: "Proficiência com a arma",
    description:
      "Escolha uma arma. Você recebe +2 em testes de ataque com essa arma. Você pode escolher este poder outras vezes para armas diferentes.",
  },
  {
    id: "ginete",
    name: "Ginete",
    category: "combate",
    prerequisite: "Treinado em Cavalgar",
    description:
      "Você passa automaticamente em testes de Cavalgar para não cair da montaria quando sofre dano. Além disso, não sofre penalidades para atacar à distância ou lançar magias quando montado.",
  },
  {
    id: "inexpugnavel",
    name: "Inexpugnável",
    category: "combate",
    prerequisite: "Encouraçado, 6º nível de personagem",
    description:
      "Se estiver usando uma armadura pesada, você recebe +2 em todos os testes de resistência.",
  },
  {
    id: "mira-apurada",
    name: "Mira Apurada",
    category: "combate",
    prerequisite: "Sab 13, Disparo Preciso",
    description:
      "Você pode gastar uma ação de movimento para mirar. Se fizer isso, recebe +2 em testes de ataque e na margem de ameaça com ataques à distância até o fim do turno.",
  },
  {
    id: "presenca-aterradora",
    name: "Presença Aterradora",
    category: "combate",
    prerequisite: "Treinado em Intimidação",
    description:
      "Você pode gastar uma ação padrão e 1 PM para assustar todas as criaturas a sua escolha em alcance curto. Veja a perícia Intimidação para as regras de assustar.",
  },
  {
    id: "proficiencia",
    name: "Proficiência",
    category: "combate",
    prerequisite: "—",
    description:
      "Escolha uma proficiência: armas marciais, armas de fogo, armaduras pesadas ou escudos (se for proficiente em armas marciais, você também pode escolher armas exóticas). Você recebe essa proficiência. Você pode escolher este poder outras vezes para proficiências diferentes.",
  },
  {
    id: "quebrar-aprimorado",
    name: "Quebrar Aprimorado",
    category: "combate",
    prerequisite: "Ataque Poderoso",
    description:
      "Você recebe +2 em testes de ataque para quebrar. Quando reduz os PV de uma arma para 0 ou menos, você pode gastar 1 PM para realizar um ataque extra contra o usuário dela. O ataque adicional usa os mesmos valores de ataque e dano, mas os dados devem ser rolados novamente.",
  },
  {
    id: "reflexos-de-combate",
    name: "Reflexos de Combate",
    category: "combate",
    prerequisite: "Des 13",
    description:
      "Você ganha uma ação de movimento extra no seu primeiro turno de cada combate.",
  },
  {
    id: "saque-rapido",
    name: "Saque Rápido",
    category: "combate",
    prerequisite: "Treinado em Iniciativa",
    description:
      "Você recebe +2 em Iniciativa e pode sacar ou guardar itens como uma ação livre (em vez de ação de movimento). Além disso, a ação que você gasta para recarregar uma arma de disparo diminui em uma categoria (ação completa para padrão, padrão para movimento, movimento para livre).",
  },
  {
    id: "trespassar",
    name: "Trespassar",
    category: "combate",
    prerequisite: "Ataque Poderoso",
    description:
      "Quando você faz um ataque corpo a corpo e reduz os pontos de vida do alvo para 0 ou menos, pode gastar 1 PM para fazer um ataque adicional contra outra criatura dentro do seu alcance. O ataque adicional usa os mesmos valores de ataque e dano, mas os dados devem ser rolados novamente.",
  },
  {
    id: "vitalidade",
    name: "Vitalidade",
    category: "combate",
    prerequisite: "Con 13",
    description: "Você recebe +1 PV por nível de personagem e +2 em Fortitude.",
  },
];
