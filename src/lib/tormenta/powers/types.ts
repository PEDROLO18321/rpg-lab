// ─── TORMENTA 20 — Poderes (Capítulo 2 + Poderes de Classe do Capítulo 1) ────
// Tipo compartilhado por todos os catálogos de poder (geral e de classe).
// Poderes são escolhidos ao subir de nível (a partir do 2º) e ficam
// registrados na ficha como referência de regra — o texto mecânico completo
// fica visível para o jogador, mas não é simulado automaticamente (mesmo
// espírito das magias de 2º-5º círculo: escolha real, efeito é aplicado
// manualmente pela mesa). Exceção: "Aumento de Atributo" (ver attributeIncrease.ts)
// altera atributos diretamente e por isso é tratado à parte, fora destes catálogos.

export type PowerCategory = "combate" | "destino" | "magia" | "tormenta" | "concedido" | "classe";

export interface Power {
  id: string;
  name: string;
  category: PowerCategory;
  classId?: string;        // só para category "classe": id da classe dona do poder
  prerequisite: string;    // texto do livro; "—" quando não há pré-requisito
  description: string;     // texto mecânico completo, verbatim do livro
  magic?: boolean;         // poderes marcados com o símbolo "☾" (mágicos) no livro
  special?: "attribute-increase"; // "Aumento de Atributo": altera atributos de verdade, tratado à parte na UI
}

// "Aumento de Atributo" (pág. 37 e repetido em toda classe): +2 num atributo à
// escolha; da 2ª vez em diante no mesmo atributo, o aumento cai para +1. Como o
// texto é idêntico nas 14 classes, fica centralizado aqui em vez de duplicado
// pelos catálogos por classe (os extratores de poder de classe pulam este poder).
export const ATTRIBUTE_INCREASE_POWER: Power = {
  id: "aumento-de-atributo",
  name: "Aumento de Atributo",
  category: "classe",
  prerequisite: "—",
  description:
    "Você recebe +2 em um atributo a sua escolha. Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.",
  special: "attribute-increase",
};
