// Star Wars: Além da Fronteira — as 25 perícias, cada uma ligada a 1-2 atributos

import type { AttrKey } from "./data";

export interface Skill {
  id: string;
  name: string;
  attrs: AttrKey[];
}

export const SKILLS: Skill[] = [
  { id: "acrobacia", name: "Acrobacia", attrs: ["agi", "vig", "sen"] },
  { id: "armas_energia", name: "Armas de Energia", attrs: ["agi", "int"] },
  { id: "astrogacao", name: "Astrogação", attrs: ["int", "agi", "sen"] },
  { id: "atletismo", name: "Atletismo", attrs: ["forca", "vig"] },
  { id: "ciencias", name: "Ciências", attrs: ["int", "pre"] },
  { id: "computacao", name: "Computação", attrs: ["int", "agi"] },
  { id: "conhecimento_forca", name: "Conhecimento da Força", attrs: ["int", "pre", "sen"] },
  { id: "conhecimento_galactico", name: "Conhecimento Galáctico", attrs: ["int", "pre"] },
  { id: "diplomacia", name: "Diplomacia", attrs: ["pre", "int"] },
  { id: "dominio_forca", name: "Domínio da Força", attrs: ["sen"] },
  { id: "enganacao", name: "Enganação", attrs: ["pre", "int", "sen"] },
  { id: "furtividade", name: "Furtividade", attrs: ["agi", "pre", "sen"] },
  { id: "intimidacao", name: "Intimidação", attrs: ["pre", "forca", "sen"] },
  { id: "investigacao", name: "Investigação", attrs: ["int", "pre", "sen"] },
  { id: "lideranca", name: "Liderança", attrs: ["pre", "int"] },
  { id: "mecanica", name: "Mecânica", attrs: ["int", "agi"] },
  { id: "medicina", name: "Medicina", attrs: ["int", "pre", "sen"] },
  { id: "percepcao", name: "Percepção", attrs: ["pre", "int"] },
  { id: "persuasao", name: "Persuasão", attrs: ["pre", "int", "sen"] },
  { id: "pilotagem_atmosferica", name: "Pilotagem Atmosférica", attrs: ["agi", "int"] },
  { id: "pilotagem_espacial", name: "Pilotagem Espacial", attrs: ["agi", "int"] },
  { id: "pontaria", name: "Pontaria", attrs: ["agi", "int"] },
  { id: "sabres_de_luz", name: "Sabres de Luz", attrs: ["agi", "forca", "sen"] },
  { id: "sobrevivencia", name: "Sobrevivência", attrs: ["vig", "pre"] },
  { id: "sobrevivencia_espacial", name: "Sobrevivência Espacial", attrs: ["int", "vig"] },
  { id: "vontade", name: "Vontade", attrs: ["vig", "int"] },
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s])
);
