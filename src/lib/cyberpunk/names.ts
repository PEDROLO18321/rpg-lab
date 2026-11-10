// ─── CYBERPUNK RED — gerador de nomes de rua ────────────────────────────────
// Nomes e alcunhas inventados para este projeto (nenhum copiado do material
// oficial). Mistura de origens, porque a cidade é um caldeirão: o nome de
// batismo é de um canto do mundo, o sobrenome de outro, e a alcunha é o que
// a Rua realmente usa.

import type { Rng } from "./rules";

const FIRST = [
  "Kaito", "Mirela", "Dante", "Zuri", "Anselmo", "Ines", "Tavian", "Lenka", "Ronan", "Safira",
  "Joaquim", "Noor", "Caio", "Yara", "Bruno", "Ilya", "Marisol", "Teo", "Ayumi", "Rafael",
  "Soraya", "Dmitri", "Luana", "Okoye", "Valentina", "Hiro", "Beatriz", "Emeka", "Selene", "Arjun",
];

const LAST = [
  "Vasquez", "Ibarra", "Nakahara", "Drummond", "Okafor", "Lindqvist", "Moraes", "Kowalczyk", "Haddad", "Tanaka",
  "Albuquerque", "Reyes", "Volkov", "Santoro", "Mbeki", "Park", "Cavalcanti", "Duarte", "Sorensen", "Bianchi",
  "Quintana", "Farias", "Ashworth", "Zhou", "Pereira", "Castellan", "Nwosu", "Braga", "Lacerda", "Ferrer",
];

const HANDLES = [
  "Cinza", "Faísca", "Corvo", "Neon", "Ferrugem", "Sombra", "Estática", "Navalha", "Pixel", "Víbora",
  "Chumbo", "Eco", "Tilt", "Lâmpada", "Cobalto", "Rastro", "Sucata", "Vertigem", "Pulso", "Zênite",
  "Ruído", "Cacto", "Brasa", "Fantasma", "Glitch", "Prisma", "Mola", "Latão", "Trovão", "Argola",
];

function pick<T>(arr: readonly T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function randomHandle(rng: Rng = Math.random): string {
  return pick(HANDLES, rng);
}

/** Nome de personagem: `Nome "Alcunha" Sobrenome`. */
export function randomCyberpunkName(rng: Rng = Math.random): string {
  return `${pick(FIRST, rng)} "${pick(HANDLES, rng)}" ${pick(LAST, rng)}`;
}

export const NAME_POOLS = { first: FIRST, last: LAST, handles: HANDLES };
