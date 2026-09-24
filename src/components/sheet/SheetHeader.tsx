"use client";

// ─── Cabeçalho comum das fichas ──────────────────────────────────────────────
// Antes eram cinco cópias em dois dialetos: D&D e Tormenta tinham um card único
// com avatar, nome e abas na mesma linha; Ordem, Star Wars e Cthulhu tinham uma
// barra de abas solta acima e o bloco de identidade abaixo. Trocar de sistema
// era reaprender onde ficam os botões.
//
// Aqui vale o dialeto do D&D, que é o mais legível: um card só, identidade à
// esquerda, ações à direita, sempre na mesma ordem — progressão, abas, extras.
//
// A cor entra como custom property na própria subárvore, igual ao PlayShell:
// estilo inline a qualquer profundidade lê `var(--accent)` e pega a cor do
// sistema sem prop nem contexto.

import { PLAY_THEME, type PlaySystem } from "@/components/play/theme";
import "./sheet.css";

export interface SheetTab {
  id: string;
  label: string;
}

/** Editar · Ficha · Jogar — a sequência que os cinco sistemas mostram. */
export const SHEET_TABS: readonly SheetTab[] = [
  { id: "editar", label: "Editar" },
  { id: "ficha", label: "Ficha" },
  { id: "jogar", label: "Jogar" },
];

interface Props {
  system: PlaySystem;
  /** Retrato do personagem; sem ele, caem as iniciais. */
  portraitUrl?: string | null;
  /** Fallback do avatar: sigla da classe ou iniciais do nome. */
  initials: string;
  name: string;
  /** Linha sob o nome: raça · classe · antecedente · nível. */
  subtitle: string;
  mode: string;
  onMode: (id: string) => void;
  /**
   * Abas exibidas. O padrão serve aos cinco; o Star Wars passa a lista com
   * "Regras" no fim, que é o manual do sistema autoral e não tem par nos outros.
   */
  tabs?: readonly SheetTab[];
  /** Botão de progressão: Subir de Nível, Subir NEX, Desenvolvimento. */
  progression?: React.ReactNode;
  /** Exportar, salvar, e o que mais for da ficha. Vai depois das abas. */
  actions?: React.ReactNode;
  /** Indicador de "Salvando…" / "✓ Salvo", à esquerda das ações. */
  status?: React.ReactNode;
}

export function SheetHeader({
  system, portraitUrl, initials, name, subtitle,
  mode, onMode, tabs = SHEET_TABS, progression, actions, status,
}: Props) {
  const t = PLAY_THEME[system];

  return (
    <div
      className="sheet-header no-print"
      style={{
        "--accent": t.accent,
        "--accent-light": t.accentLight,
        "--accent-dim": t.accentDim,
        "--border-accent": t.accentBorder,
        "--accent-glow": t.glow,
        background: "var(--surface)",
        border: "1px solid var(--border-accent)",
        borderRadius: "var(--radius-xl)",
        padding: "20px 24px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      } as React.CSSProperties}
    >
      <div
        className="sheet-header-avatar"
        style={{
          width: 52, height: 52, flexShrink: 0,
          borderRadius: "var(--radius-xl)",
          background: "var(--accent-dim)",
          border: "1px solid var(--border-accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.72rem", fontWeight: 900,
          color: "var(--accent-light)",
          letterSpacing: "0.04em",
        }}
      >
        {portraitUrl
          ? /* eslint-disable-next-line @next/next/no-img-element */
            <img src={portraitUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initials}
      </div>

      <div className="sheet-header-id" style={{ flex: 1, minWidth: 180 }}>
        <h1
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "1.5rem", fontWeight: 700,
            color: "var(--text)", lineHeight: 1.1,
          }}
        >
          {name}
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 4 }}>{subtitle}</p>
      </div>

      <div className="sheet-header-actions" style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center", flexWrap: "wrap" }}>
        {progression}
        {tabs.map((tab) => (
          <SheetTabBtn key={tab.id} active={mode === tab.id} onClick={() => onMode(tab.id)}>
            {tab.label}
          </SheetTabBtn>
        ))}
        {status}
        {actions}
      </div>
    </div>
  );
}

/**
 * Aba do cabeçalho. Exportada porque o estilo do botão ativo é o contrato
 * visual da padronização — quem precisar de um botão irmão usa este, não
 * escreve outro parecido.
 */
export function SheetTabBtn({
  active, onClick, children, title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={active}
      style={{
        padding: "8px 18px",
        borderRadius: "var(--radius-lg)",
        background: active ? "var(--accent-dim)" : "var(--surface-2)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        color: active ? "var(--accent-light)" : "var(--text-muted)",
        fontWeight: active ? 700 : 400,
        fontSize: "0.84rem",
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "inherit",
        boxShadow: active ? "0 0 16px var(--accent-glow)" : "none",
      }}
    >
      {children}
    </button>
  );
}

/**
 * Botão de progressão — Subir de Nível, Subir NEX, Desenvolvimento. Fica antes
 * das abas nos cinco sistemas, e é verde para não competir com a cor do
 * sistema: é a única ação do cabeçalho que muda a ficha de verdade.
 */
export function SheetProgressBtn({
  onClick, children, title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: "8px 18px",
        borderRadius: "var(--radius-lg)",
        background: "rgba(45,139,45,0.18)",
        border: "1px solid #2d8b2d",
        color: "#5fbf7f",
        fontWeight: 700,
        fontSize: "0.84rem",
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}
