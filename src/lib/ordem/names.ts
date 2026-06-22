// ─── ORDEM PARANORMAL — gerador de nomes (Brasil contemporâneo) ──────────────

const FIRST = [
  "Ana", "Beatriz", "Bruno", "Camila", "Carlos", "Daniel", "Eduardo", "Fernanda",
  "Gabriel", "Helena", "Igor", "Joana", "João", "Larissa", "Lucas", "Mariana",
  "Mateus", "Natália", "Otávio", "Paula", "Rafael", "Renata", "Rodrigo", "Sofia",
  "Thiago", "Vitória", "Vinícius", "Yasmin", "Felipe", "Letícia", "André", "Clara",
  "Murilo", "Isadora", "Leonardo", "Aline", "Pedro", "Bianca", "Gustavo", "Marina",
];

const LAST = [
  "Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira", "Almeida", "Ferreira",
  "Rodrigues", "Gomes", "Martins", "Araújo", "Ribeiro", "Carvalho", "Lima", "Barbosa",
  "Rocha", "Dias", "Monteiro", "Cardoso", "Teixeira", "Moraes", "Nunes", "Mendes",
  "Freitas", "Azevedo", "Cavalcanti", "Pinheiro", "Macedo", "Vasconcelos",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomOrdemName(): string {
  return `${pick(FIRST)} ${pick(LAST)}`;
}
