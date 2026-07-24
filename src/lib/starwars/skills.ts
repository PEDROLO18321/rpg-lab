// Star Wars: Além da Fronteira — as 25 perícias, cada uma ligada a 1-2 atributos

import type { AttrKey } from "./data";

export interface Skill {
  id: string;
  name: string;
  attrs: AttrKey[];
}

export const SKILLS: Skill[] = [
  { id: "acrobacia", name: "Acrobacia", attrs: ["agi"] },
  { id: "armas_energia", name: "Armas de Energia", attrs: ["agi", "sen"] },
  { id: "astrogacao", name: "Astrogação", attrs: ["int", "sen"] },
  { id: "atletismo", name: "Atletismo", attrs: ["forca", "vig"] },
  { id: "ciencias", name: "Ciências", attrs: ["int"] },
  { id: "computacao", name: "Computação", attrs: ["int"] },
  { id: "conhecimento_forca", name: "Conhecimento da Força", attrs: ["int", "sen"] },
  { id: "conhecimento_galactico", name: "Conhecimento Galáctico", attrs: ["int"] },
  { id: "diplomacia", name: "Diplomacia", attrs: ["pre", "int"] },
  { id: "dominio_forca", name: "Domínio da Força", attrs: ["sen", "pre"] },
  { id: "enganacao", name: "Enganação", attrs: ["pre", "int"] },
  { id: "furtividade", name: "Furtividade", attrs: ["agi", "sen"] },
  { id: "intimidacao", name: "Intimidação", attrs: ["pre", "forca"] },
  { id: "investigacao", name: "Investigação", attrs: ["int", "sen"] },
  { id: "lideranca", name: "Liderança", attrs: ["pre", "int"] },
  { id: "mecanica", name: "Mecânica", attrs: ["int", "agi"] },
  { id: "medicina", name: "Medicina", attrs: ["int", "sen"] },
  { id: "percepcao", name: "Percepção", attrs: ["sen"] },
  { id: "persuasao", name: "Persuasão", attrs: ["pre"] },
  { id: "pilotagem_atmosferica", name: "Pilotagem Atmosférica", attrs: ["agi", "int"] },
  { id: "pilotagem_espacial", name: "Pilotagem Espacial", attrs: ["agi", "int"] },
  { id: "pontaria", name: "Pontaria", attrs: ["agi"] },
  { id: "sabres_de_luz", name: "Sabres de Luz", attrs: ["agi", "forca", "sen"] },
  { id: "sobrevivencia", name: "Sobrevivência", attrs: ["vig", "sen"] },
  { id: "sobrevivencia_espacial", name: "Sobrevivência Espacial", attrs: ["int", "vig"] },
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s])
);
