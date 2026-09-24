"use client";

// ─── Corpo comum das fichas ──────────────────────────────────────────────────
// Mesma grade das áreas de Jogar (components/play/PlayShell): faixa de vitais
// em largura cheia, depois duas colunas `1.4fr / 1fr`. Ficha e Jogar passam a
// ter o mesmo esqueleto, então alternar entre as abas não reposiciona nada.
//
// Antes eram três formatos: D&D e Cthulhu em `1fr 1fr`, Ordem e Star Wars em
// `1.4fr / 1fr`, e o Tormenta sem colunas nenhuma, só empilhando.

import { PLAY_THEME, type PlaySystem } from "@/components/play/theme";
import "./sheet.css";

interface Props {
  /**
   * Projeta a cor do sistema na subárvore do corpo. O `SheetHeader` faz o
   * mesmo na dele, mas os dois são irmãos: sem isto, `var(--accent-light)` no
   * meio da ficha cairia no dourado global e o Star Wars sairia dourado.
   */
  system: PlaySystem;
  /** Vitais, chips derivados e alertas — largura cheia, no topo. */
  band?: React.ReactNode;
  /** Coluna larga: atributos, perícias, poderes, magias, inventário. */
  left: React.ReactNode;
  /** Coluna estreita: identidade, antecedentes, equipamento, notas. */
  right: React.ReactNode;
  /** Blocos que ocupam a largura toda, abaixo das colunas. */
  full?: React.ReactNode;
}

export function SheetShell({ system, band, left, right, full }: Props) {
  const t = PLAY_THEME[system];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        "--accent": t.accent,
        "--accent-light": t.accentLight,
        "--accent-dim": t.accentDim,
        "--border-accent": t.accentBorder,
        "--accent-glow": t.glow,
      } as React.CSSProperties}
    >
      {band}

      <div
        className="sheet-two-col"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>{left}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>{right}</div>
      </div>

      {full}
    </div>
  );
}

/** Faixa de vitais: PV, PM, Sanidade, Sorte — os cartões grandes do topo. */
export function SheetVitals({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="sheet-vitals"
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}
    >
      {children}
    </div>
  );
}

/** Linha de chips derivados: Defesa, Deslocamento, NEX, dinheiro. */
export function SheetChips({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{children}</div>;
}
