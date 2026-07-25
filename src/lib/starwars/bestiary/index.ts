// ─── STAR WARS: ALÉM DA FRONTEIRA — Bestiário Oficial de Mestre ─────────────
// Agrega os 8 livros de criaturas/NPCs (StarWars-Teste/10 a 17) em dados
// estruturados usáveis pela ficha de Mestre (aba Bestiário + Iniciativa).

import { CRIATURAS } from "./criaturas";
import { JEDI, JEDI_SPECIALIZATIONS } from "./jedi";
import { SITH, SITH_SPECIALIZATIONS } from "./sith";
import { SENSITIVOS } from "./sensitivos";
import { MANDALORIANOS, MANDALORIAN_LOADOUTS } from "./mandalorianos";
import { MILITARES } from "./militares";
import { CIVIS } from "./civis";
import { FAUNA_PLANETAS } from "./fauna";

export * from "./types";
export { CRIATURAS, JEDI, JEDI_SPECIALIZATIONS, SITH, SITH_SPECIALIZATIONS, SENSITIVOS, MANDALORIANOS, MANDALORIAN_LOADOUTS, MILITARES, CIVIS, FAUNA_PLANETAS };

export const BESTIARY = [
  ...CRIATURAS,
  ...JEDI,
  ...SITH,
  ...SENSITIVOS,
  ...MANDALORIANOS,
  ...MILITARES,
  ...CIVIS,
  ...FAUNA_PLANETAS,
];

export const MODULE_GROUPS = [
  { id: "jedi-spec", label: "Especializações Jedi", modules: JEDI_SPECIALIZATIONS },
  { id: "sith-spec", label: "Especializações Sith", modules: SITH_SPECIALIZATIONS },
  { id: "mandaloriano-loadout", label: "Loadouts Mandalorianos", modules: MANDALORIAN_LOADOUTS },
];
