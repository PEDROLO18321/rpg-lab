// ─── ORDEM PARANORMAL — Sanidade & Insanidade (Cap. 4 e 5) ───────────────────

// Efeitos de insanidade (TABELA 5.1). Rolados quando o personagem fica
// perturbado (SAN < metade) pela primeira vez em uma cena. Sem efeito mecânico
// direto — alteram a interpretação.
export const INSANITY_EFFECTS: string[] = [
  "Você busca dor. Seja sentir dor ou causar dor.",
  "Ao olhar o rosto de alguém, vê sua imagem distorcida, com pedaços de animais ou monstros.",
  "Todas as vozes ficam deturpadas, como se fossem faladas por um monstro.",
  "Uma voz na sua cabeça repete constantemente que você está mentindo.",
  "Seu sangue parece estar quente, como se quisesse sair de dentro do seu corpo.",
  "Você vê rostos humanos e monstruosos nas sombras, sempre encarando você.",
  "Uma fome constante domina seu corpo, como se não pudesse ser saciado.",
  "Um gosto permanente de ferro domina seu paladar, como se sua boca estivesse tomada por sangue.",
  "A luz incomoda seus olhos a ponto de você precisar escondê-los o tempo todo.",
  "Falar é praticamente impossível. Algo externo controla o que você fala.",
  "Seus olhos coçam violentamente, e só parece que vão parar quando forem arrancados.",
  "Sua memória começa a falhar. Eventos de mais de uma hora atrás ficam nebulosos.",
  "As emoções ficam confusas. Algo feliz desperta raiva e algo dolorido desperta felicidade.",
  "Você sente a necessidade de descrever todas as ações da maneira mais grotesca possível.",
  "Existem vermes dentro de seu corpo, correndo por suas veias. Você sente debaixo da pele.",
  "Você acha que está sob efeito constante de um ritual que o deixa mais poderoso.",
  "Suas mãos estão furadas e as coisas caem de seus bolsos.",
  "Você acredita que tudo é fruto da sorte, deixando suas decisões para o acaso.",
  "As coisas estão fervendo, mas você gosta da dor.",
  "Apenas o fim das coisas deve ser celebrado. E você precisa dar fim.",
];

// Rola 1d20 e retorna um efeito de insanidade.
export function rollInsanity(): { roll: number; effect: string } {
  const roll = Math.floor(Math.random() * 20) + 1;
  return { roll, effect: INSANITY_EFFECTS[roll - 1] };
}

// ─── Estados de sanidade ─────────────────────────────────────────────────────

export type SanityStatus = "estavel" | "perturbado" | "enlouquecendo" | "insano";

export const SANITY_STATUS_LABEL: Record<SanityStatus, string> = {
  estavel: "Estável",
  perturbado: "Perturbado",
  enlouquecendo: "Enlouquecendo",
  insano: "Insano",
};

// Perturbado: SAN < metade da máxima. Enlouquecendo: SAN 0.
export function sanityStatus(sanCurrent: number, sanMax: number): SanityStatus {
  if (sanCurrent <= 0) return "enlouquecendo";
  if (sanCurrent < sanMax / 2) return "perturbado";
  return "estavel";
}

export function isPerturbado(sanCurrent: number, sanMax: number): boolean {
  return sanCurrent > 0 && sanCurrent < sanMax / 2;
}

// ─── Estados de vida (PV) ────────────────────────────────────────────────────

export type LifeStatus = "saudavel" | "machucado" | "morrendo" | "inconsciente";

// Machucado: PV <= metade. Morrendo/inconsciente: PV 0.
export function lifeStatus(pvCurrent: number, pvMax: number): LifeStatus {
  if (pvCurrent <= 0) return "morrendo";
  if (pvCurrent <= pvMax / 2) return "machucado";
  return "saudavel";
}
