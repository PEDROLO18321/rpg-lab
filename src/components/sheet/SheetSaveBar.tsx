"use client";

// ─── Barra de salvar do modo Editar ──────────────────────────────────────────
// Estava escrita quatro vezes, quase igual, em D&D, Tormenta, Ordem e Star Wars —
// e não existia no Cthulhu, que tinha um "✓ Salvar" solto no topo e era o único
// dos cinco onde salvar ficava em outro lugar.
//
// Fica grudada no rodapé (`sticky`) porque o formulário de edição é longo: sem
// isso, salvar exige rolar até o fim de uma ficha inteira.

import { sheetLabelStyle } from "./SheetSection";

interface Props {
  onSave: () => void;
  /** Requisição em voo: o botão desabilita e troca o rótulo. */
  saving: boolean;
  /** Mostra "✓ Salvo" depois que a gravação confirma. */
  saved?: boolean;
  /** Mensagem de falha, quando a rota devolve erro. */
  error?: string | null;
  /** Dica à direita, para o que só aquele sistema precisa explicar. */
  hint?: React.ReactNode;
}

export function SheetSaveBar({ onSave, saving, saved, error, hint }: Props) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        padding: "14px 16px",
        background: "var(--surface)",
        border: "1px solid var(--border-accent)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.25)",
      }}
    >
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          padding: "10px 24px",
          borderRadius: "var(--radius-lg)",
          background: "var(--accent-dim)",
          border: "1px solid var(--accent)",
          color: "var(--accent-light)",
          fontWeight: 700,
          fontSize: "0.9rem",
          cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          boxShadow: "0 0 16px var(--accent-glow)",
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? "Salvando…" : "💾 Salvar alterações"}
      </button>

      {saved && <span style={{ fontSize: "0.82rem", color: "#5fbf7f", fontWeight: 700 }}>✓ Salvo</span>}
      {error && <span style={{ fontSize: "0.82rem", color: "#ff6b6b" }}>{error}</span>}
      {hint && <span style={{ ...sheetLabelStyle, marginLeft: "auto" }}>{hint}</span>}
    </div>
  );
}
