// ─── Tema das áreas de Jogar ─────────────────────────────────────────────────
// Cada sistema tem sua paleta. Os valores saem das constantes ACCENT* que já
// viviam espalhadas em cada ficha — aqui viram uma fonte única.
//
// Por que TS e não só CSS: o dado 3D repassa a cor direto para o material do
// three.js (components/three/Dice3D.tsx), e `new THREE.Color("var(--accent)")`
// não funciona. Então este objeto é a fonte de verdade, e o PlayShell projeta
// os mesmos valores como custom properties para o CSS inline consumir.

export type PlaySystem = "dnd" | "tormenta" | "ordem" | "starwars" | "cthulhu";

export interface PlayTheme {
  /** Cor principal: bordas ativas, botões de ação. */
  accent: string;
  /** Variante clara: texto sobre fundo escuro, resultado em destaque. */
  accentLight: string;
  /** Preenchimento translúcido de elemento ativo. */
  accentDim: string;
  /** Borda translúcida de cartão em destaque. */
  accentBorder: string;
  /** Halo de `box-shadow`. */
  glow: string;
  /** Brilho interno do dado 3D. */
  dieEmissive: string;
  /** Cor do número no dado 3D, quando a do tema não contrasta (Ordem é branca). */
  dieResult?: string;
  /** Pontos temporários. */
  temp: string;
}

export const PLAY_THEME: Record<PlaySystem, PlayTheme> = {
  // Dourado do tema global — o D&D sempre usou os tokens padrão.
  dnd: {
    accent: "#c9941f",
    accentLight: "#e8b84b",
    accentDim: "rgba(201,148,31,0.12)",
    accentBorder: "rgba(201,148,31,0.32)",
    glow: "rgba(201,148,31,0.25)",
    dieEmissive: "#2a1d06",
    temp: "#4fc3f7",
  },
  tormenta: {
    accent: "#a01818",
    accentLight: "#d56c6c",
    accentDim: "rgba(160,24,24,0.12)",
    accentBorder: "rgba(160,24,24,0.32)",
    glow: "rgba(160,24,24,0.28)",
    dieEmissive: "#2a0606",
    temp: "#4fc3f7",
  },
  // Branco puro: o tema "noite/sigilo" da Ordem. O número do dado precisa ser
  // escuro, senão some no dado branco.
  ordem: {
    accent: "#ffffff",
    accentLight: "#ffffff",
    accentDim: "rgba(255,255,255,0.14)",
    accentBorder: "rgba(255,255,255,0.32)",
    glow: "rgba(255,255,255,0.18)",
    dieEmissive: "#2a2a30",
    dieResult: "#1a1a22",
    temp: "#ffffff",
  },
  starwars: {
    accent: "#5d9ed6",
    accentLight: "#8fc4f5",
    accentDim: "rgba(93,158,214,0.14)",
    accentBorder: "rgba(93,158,214,0.35)",
    glow: "rgba(93,158,214,0.28)",
    dieEmissive: "#12202e",
    temp: "#5ec8e8",
  },
  cthulhu: {
    accent: "#7d9c3e",
    accentLight: "#a3b86c",
    accentDim: "rgba(125,156,62,0.12)",
    accentBorder: "rgba(125,156,62,0.28)",
    glow: "rgba(125,156,62,0.25)",
    dieEmissive: "#1a2010",
    temp: "#4fc3f7",
  },
};
