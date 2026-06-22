// ─── CALL OF CTHULHU — gerador de nomes por era ──────────────────────────────

const POOLS = {
  "1920s": {
    first: [
      "Henry", "Arthur", "Edward", "Walter", "Howard", "Charles", "George", "Albert",
      "Frank", "Ernest", "Harold", "Wilbur", "Clarence", "Raymond", "Herbert",
      "Margaret", "Dorothy", "Helen", "Ruth", "Florence", "Edith", "Mabel", "Agnes",
      "Eleanor", "Beatrice", "Clara", "Mildred", "Gertrude", "Vivian", "Lillian",
    ],
    last: [
      "Armitage", "Whateley", "Carter", "Pickman", "Marsh", "Gilman", "Peaslee",
      "Wilmarth", "Akeley", "Derby", "Ward", "Thurston", "Angell", "Lake", "Dyer",
      "Danforth", "Olmstead", "Harris", "Blake", "West", "Willett", "Trevor",
      "Ashton", "Holloway", "Crowninshield",
    ],
  },
  modern: {
    first: [
      "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Sam", "Chris",
      "Jamie", "Sarah", "Michael", "Emily", "David", "Laura", "James", "Olivia",
      "Daniel", "Sophie", "Ryan", "Megan", "Ethan", "Chloe", "Nathan", "Hannah",
    ],
    last: [
      "Walker", "Bennett", "Foster", "Hughes", "Coleman", "Reed", "Russell",
      "Griffin", "Hayes", "Porter", "Sullivan", "Fletcher", "Grant", "Doyle",
      "Brooks", "Shaw", "Lambert", "Quinn", "Mercer", "Vance", "Sawyer", "Cole",
    ],
  },
} as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomCthulhuName(era: "1920s" | "modern" = "1920s"): string {
  const pool = POOLS[era] ?? POOLS["1920s"];
  return `${pick(pool.first)} ${pick(pool.last)}`;
}
