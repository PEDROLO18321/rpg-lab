"use client";

// ─── Cartão das áreas de Jogar ───────────────────────────────────────────────
// Funde as três molduras que existiam: o PlayCard do D&D e do Tormenta (borda
// + raio grande), o Panel da Ordem e do Star Wars (título em Cinzel com
// hairline no accent) e a Section do Cthulhu.
//
// A moldura com borda venceu porque, na grade de duas colunas, cartões sem
// borda se fundem visualmente e o esqueleto comum some.

import { useState } from "react";
import { activateOnKey } from "@/lib/a11y";

/** Rótulo de subseção dentro de um cartão. */
export const playLabelStyle: React.CSSProperties = {
  fontSize: "0.64rem",
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 8,
};

interface Props {
  title?: string;
  /** Botão à direita do título: "+ Adicionar", "limpar". */
  action?: React.ReactNode;
  /** Borda no accent do sistema — para o cartão principal da coluna. */
  accent?: boolean;
  /** Título vira botão que dobra o conteúdo. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function PlayCard({
  title, action, accent, collapsible, defaultOpen = true, children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const showBody = !collapsible || open;

  return (
    <section
      style={{
        background: "var(--surface)",
        border: `1px solid ${accent ? "var(--border-accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-xl)",
        padding: 16,
      }}
    >
      {title && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: showBody ? 12 : 0,
            paddingBottom: 8,
            borderBottom: "1px solid var(--border-accent)",
          }}
        >
          {collapsible ? (
            // Cabeçalho que dobra: precisa ser botão para o teclado alcançar.
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 8, flex: 1, background: "none", border: "none", padding: 0,
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}
            >
              <h2 style={titleStyle}>{title}</h2>
              <span aria-hidden style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                ▼
              </span>
            </button>
          ) : (
            <h2 style={titleStyle}>{title}</h2>
          )}
          {action}
        </div>
      )}
      {showBody && children}
    </section>
  );
}

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-cinzel), serif",
  fontSize: "0.92rem",
  fontWeight: 700,
  color: "var(--text)",
};

/**
 * Cabeçalho clicável dentro de um cartão — painéis que já contêm botões não
 * podem virar `<button>` (markup inválido), então seguem o padrão role/tabIndex
 * de lib/a11y.ts.
 */
export function PlaySubHeader({
  label, open, onToggle,
}: {
  label: string; open: boolean; onToggle: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={onToggle}
      onKeyDown={activateOnKey(onToggle)}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
    >
      <p style={{ ...playLabelStyle, marginBottom: 0 }}>{label}</p>
      <span aria-hidden style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
        ▼
      </span>
    </div>
  );
}
