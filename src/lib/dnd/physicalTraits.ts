export interface PhysicalTraitTable {
  ageRange: [number, number];
  heights: string[];
  weights: string[];
  eyes: string[];
  skin: string[];
  hair: string[];
}

export const PHYSICAL_TRAITS: Record<string, PhysicalTraitTable> = {
  anao: {
    ageRange: [40, 350],
    heights: ["1,20 m", "1,25 m", "1,30 m", "1,35 m", "1,40 m", "1,45 m", "1,50 m"],
    weights: ["60 kg", "65 kg", "70 kg", "75 kg", "80 kg", "85 kg", "90 kg", "100 kg"],
    eyes: ["Castanhos", "Cinzas", "Pretos", "Azuis", "Verdes"],
    skin: ["Clara", "Rosada", "Morena", "Bronzeada", "Acinzentada"],
    hair: ["Preto", "Castanho", "Ruivo", "Loiro", "Grisalho", "Branco"],
  },
  elfo: {
    ageRange: [100, 750],
    heights: ["1,50 m", "1,55 m", "1,60 m", "1,65 m", "1,70 m", "1,75 m", "1,80 m", "1,85 m"],
    weights: ["45 kg", "50 kg", "55 kg", "60 kg", "65 kg", "70 kg", "75 kg"],
    eyes: ["Azuis", "Verdes", "Dourados", "Prateados", "Violetas", "Âmbar", "Cinzas"],
    skin: ["Pálida", "Clara", "Bronzeada", "Castanha", "Cor de cobre", "Escura"],
    hair: ["Preto", "Castanho", "Loiro", "Prata", "Dourado", "Branco", "Verde-musgo"],
  },
  halfling: {
    ageRange: [20, 250],
    heights: ["0,85 m", "0,90 m", "0,95 m", "1,00 m", "1,05 m", "1,10 m"],
    weights: ["18 kg", "20 kg", "22 kg", "25 kg", "28 kg"],
    eyes: ["Castanhos", "Avelã", "Verdes", "Azuis", "Pretos"],
    skin: ["Clara", "Rosada", "Morena", "Bronzeada", "Sardenta"],
    hair: ["Castanho", "Preto", "Ruivo", "Loiro", "Ruivo-acobreado"],
  },
  humano: {
    ageRange: [18, 80],
    heights: ["1,55 m", "1,60 m", "1,65 m", "1,70 m", "1,75 m", "1,80 m", "1,85 m", "1,90 m"],
    weights: ["55 kg", "60 kg", "65 kg", "70 kg", "75 kg", "80 kg", "85 kg", "90 kg"],
    eyes: ["Castanhos", "Azuis", "Verdes", "Avelã", "Cinzas", "Âmbar", "Pretos"],
    skin: ["Pálida", "Clara", "Rosada", "Morena", "Bronzeada", "Castanha", "Escura", "Negra"],
    hair: ["Preto", "Castanho", "Loiro", "Ruivo", "Grisalho", "Branco", "Acobreado"],
  },
  draconato: {
    ageRange: [15, 80],
    heights: ["1,75 m", "1,80 m", "1,85 m", "1,90 m", "1,95 m", "2,00 m", "2,10 m"],
    weights: ["100 kg", "110 kg", "120 kg", "130 kg", "140 kg", "150 kg"],
    eyes: ["Dourados", "Vermelhos", "Âmbar", "Pretos", "Prateados"],
    skin: ["Escamas vermelhas", "Escamas azuis", "Escamas verdes", "Escamas negras", "Escamas brancas", "Escamas douradas", "Escamas prateadas", "Escamas de latão", "Escamas de bronze", "Escamas de cobre"],
    hair: ["Sem cabelo", "Cristas ósseas", "Cristas escamosas"],
  },
  gnomo: {
    ageRange: [40, 500],
    heights: ["0,90 m", "0,95 m", "1,00 m", "1,05 m", "1,10 m", "1,15 m"],
    weights: ["16 kg", "18 kg", "20 kg", "22 kg", "25 kg"],
    eyes: ["Azuis", "Verdes", "Castanhos", "Pretos", "Dourados", "Prateados"],
    skin: ["Clara", "Rosada", "Bronzeada", "Acinzentada", "Castanha"],
    hair: ["Castanho", "Preto", "Loiro", "Branco", "Cinza", "Tons pastéis"],
  },
  "meio-elfo": {
    ageRange: [18, 180],
    heights: ["1,55 m", "1,60 m", "1,65 m", "1,70 m", "1,75 m", "1,80 m", "1,85 m"],
    weights: ["55 kg", "60 kg", "65 kg", "70 kg", "75 kg", "80 kg"],
    eyes: ["Azuis", "Verdes", "Dourados", "Violetas", "Cinzas", "Castanhos"],
    skin: ["Pálida", "Clara", "Morena", "Bronzeada", "Castanha"],
    hair: ["Preto", "Castanho", "Loiro", "Prata", "Ruivo", "Dourado"],
  },
  "meio-orc": {
    ageRange: [14, 75],
    heights: ["1,75 m", "1,80 m", "1,85 m", "1,90 m", "1,95 m", "2,00 m"],
    weights: ["90 kg", "100 kg", "110 kg", "120 kg", "130 kg"],
    eyes: ["Vermelhos", "Verdes", "Pretos", "Cinzas", "Acinzentados"],
    skin: ["Esverdeada", "Oliva escura", "Acinzentada", "Cinza-esverdeada", "Parda"],
    hair: ["Preto", "Castanho escuro", "Cinza", "Sem cabelo"],
  },
  tiefling: {
    ageRange: [18, 100],
    heights: ["1,55 m", "1,60 m", "1,65 m", "1,70 m", "1,75 m", "1,80 m", "1,85 m"],
    weights: ["55 kg", "60 kg", "65 kg", "70 kg", "75 kg", "80 kg"],
    eyes: ["Pretos sólidos", "Vermelhos", "Dourados", "Prateados", "Púrpura"],
    skin: ["Vermelha", "Escarlate", "Violeta", "Azul escura", "Rosa", "Carmim", "Avermelhada"],
    hair: ["Preto", "Roxo escuro", "Vermelho escuro", "Bordô", "Branco-azulado"],
  },
};

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomPhysical(raceId: string | null): {
  age: string; height: string; weight: string; eyes: string; skin: string; hair: string;
} | null {
  if (!raceId) return null;
  const t = PHYSICAL_TRAITS[raceId];
  if (!t) return null;
  const [min, max] = t.ageRange;
  return {
    age:    `${Math.floor(Math.random() * (max - min + 1)) + min} anos`,
    height: pick(t.heights),
    weight: pick(t.weights),
    eyes:   pick(t.eyes),
    skin:   pick(t.skin),
    hair:   pick(t.hair),
  };
}
