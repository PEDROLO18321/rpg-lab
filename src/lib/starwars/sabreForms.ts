// Star Wars: Além da Fronteira — as 7 Formas de Sabre de Luz + matriz circular de vantagem
// Só usadas por Padawan Jedi, Acólito Sith e Andarilho da Força (classes-base ligadas à Força)

export interface SabreForm {
  id: string;
  numeral: string;
  name: string;
  style: string;
  /** ids das formas que esta vence */
  beats: string[];
  /** ids das formas que vencem esta */
  losesTo: string[];
}

export const SABRE_FORMS: SabreForm[] = [
  { id: "shii_cho", numeral: "I", name: "Shii-Cho", style: "Básica, ampla, contra múltiplos oponentes", beats: ["makashi", "soresu", "ataru"], losesTo: ["djem_so", "niman", "vaapad"] },
  { id: "makashi", numeral: "II", name: "Makashi", style: "Precisão, duelo elegante, economia de movimento", beats: ["soresu", "ataru", "djem_so"], losesTo: ["niman", "vaapad", "shii_cho"] },
  { id: "soresu", numeral: "III", name: "Soresu", style: "Defensiva pura, resistência, contra-ataque mínimo", beats: ["ataru", "djem_so", "niman"], losesTo: ["vaapad", "shii_cho", "makashi"] },
  { id: "ataru", numeral: "IV", name: "Ataru", style: "Acrobática, agressiva, alta mobilidade", beats: ["djem_so", "niman", "vaapad"], losesTo: ["shii_cho", "makashi", "soresu"] },
  { id: "djem_so", numeral: "V", name: "Djem So / Shien", style: "Contra-ataque de força, converte defesa em ofensiva pesada", beats: ["niman", "vaapad", "shii_cho"], losesTo: ["makashi", "soresu", "ataru"] },
  { id: "niman", numeral: "VI", name: "Niman", style: "Híbrida, eclética, combina sabre com outras técnicas", beats: ["vaapad", "shii_cho", "makashi"], losesTo: ["soresu", "ataru", "djem_so"] },
  { id: "vaapad", numeral: "VII", name: "Juyo / Vaapad", style: "Agressão pura, imprevisível, ligada à emoção intensa", beats: ["shii_cho", "makashi", "soresu"], losesTo: ["ataru", "djem_so", "niman"] },
];

export const SABRE_FORM_BY_ID: Record<string, SabreForm> = Object.fromEntries(
  SABRE_FORMS.map((f) => [f.id, f])
);

/** Progressão de aprendizado por classe-base ligada à Força (círculo → ids de forma aprendidas). */
export const FORM_PROGRESSION: Record<string, Record<1 | 2 | 3, string[]>> = {
  padawan_jedi: { 1: ["shii_cho", "soresu"], 2: ["makashi", "ataru"], 3: ["djem_so", "niman", "vaapad"] },
  acolito_sith: { 1: ["djem_so", "vaapad"], 2: ["makashi", "shii_cho"], 3: ["soresu", "ataru", "niman"] },
  andarilho_forca: { 1: ["ataru", "niman"], 2: ["soresu", "djem_so"], 3: ["shii_cho", "makashi", "vaapad"] },
};

/** As 2 formas que viram "dominantes" no 4º círculo, por classe. */
export const DOMINANT_FORMS: Record<string, string[]> = {
  padawan_jedi: ["soresu", "ataru"],
  acolito_sith: ["djem_so", "vaapad"],
  andarilho_forca: ["niman", "djem_so"],
};
