// ─── TORMENTA 20 — gerador de nomes (Arton) ──────────────────────────────────

const MALE = [
  "Broktar", "Ingram", "Fren", "Dok", "Ichabod", "Artorius", "Kadeen", "Nagard",
  "Ripp", "Rufus", "Vectorius", "Vladislav", "Talude", "Reynard", "Arsenal",
  "Rhogar", "Gorack", "Masaru", "Sir Porti", "Garibaldo", "Aleph", "Edauros",
];

const FEMALE = [
  "Golinda", "Lisandra", "Gwen", "Asha", "Niala", "Yadallina", "Raven", "Salini",
  "Aivy", "Sima", "Kiim", "Leona", "Drikka", "Vallen", "Gradda", "Val", "Ledd",
];

const SURNAME = [
  "de Doherimm", "Cachimbo Caído", "Steelblade", "Blackmoon", "Hellpipes",
  "Nomi", "Karter", "a Astuta", "o Filósofo", "Wyrmslayer", "Domat", "Tpish",
  "Yudai", "Volkomenn",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomTormentaName(gender: "m" | "f" = pick(["m", "f"])): string {
  const first = gender === "m" ? pick(MALE) : pick(FEMALE);
  return `${first} ${pick(SURNAME)}`;
}
