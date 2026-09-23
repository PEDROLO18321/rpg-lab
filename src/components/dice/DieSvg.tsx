// ─── Silhueta de dado em SVG ─────────────────────────────────────────────────
// Usada pelos painéis de rolagem das fichas. As cores vêm do tema por padrão
// (D&D, que usa o dourado global); sistemas com paleta própria — Tormenta no
// vermelho, Cthulhu no verde — passam as suas.

export const DICE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;
export type DieSides = (typeof DICE_SIDES)[number];

/** Rolagem única. Devolve 1..sides. */
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

interface Props {
  sides: number;
  size?: number;
  active?: boolean;
  /** Resultado a exibir no lugar do rótulo "d20". */
  result?: number | null;
  /** Cor da borda quando ativo. */
  accent?: string;
  /** Cor do texto quando ativo e do resultado máximo. */
  accentLight?: string;
  /** Preenchimento quando ativo. */
  accentDim?: string;
}

export function DieSvg({
  sides, size = 44, active = false, result,
  accent = "var(--accent)",
  accentLight = "var(--accent-light)",
  accentDim = "var(--accent-dim)",
}: Props) {
  const stroke = active ? accent : "var(--border)";
  const fill = active ? accentDim : "var(--surface-2)";
  const centerY = sides === 4 ? 65 : 56;
  const fontSize = result != null
    ? (result >= 100 ? 20 : result >= 10 ? 24 : 28)
    : (sides === 100 ? 16 : 18);
  const text = result != null ? String(result) : (sides === 100 ? "d%" : `d${sides}`);
  const textFill = result != null
    ? (result === sides ? accentLight : result === 1 && sides === 20 ? "#ff6b6b" : "var(--text)")
    : (active ? accentLight : "var(--text-muted)");

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible" }} aria-hidden>
      {sides === 4   && <polygon points="50,8 92,87 8,87"                  fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 6   && <rect x="10" y="10" width="80" height="80" rx="12" fill={fill} stroke={stroke} strokeWidth="3" />}
      {sides === 8   && <polygon points="50,5 95,50 50,95 5,50"            fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 10  && <polygon points="50,5 93,40 76,90 24,90 7,40"      fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 12  && <polygon points="50,5 93,32 78,88 22,88 7,32"      fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 20  && <polygon points="50,5 93,27 93,73 50,95 7,73 7,27" fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />}
      {sides === 100 && <circle cx="50" cy="50" r="44"                     fill={fill} stroke={stroke} strokeWidth="3" />}
      <text
        x="50" y={centerY}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="900"
        fill={textFill}
        fontFamily="var(--font-cinzel), serif"
        style={{ userSelect: "none" }}
      >
        {text}
      </text>
    </svg>
  );
}
