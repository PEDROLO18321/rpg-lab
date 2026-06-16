"use client";

import { useState, useCallback } from "react";
import { type Campaign } from "@/lib/dnd/campaignStorage";

interface Props { campaign: Campaign; onChange: (c: Campaign) => void; }

export function SessionNotes({ campaign, onChange }: Props) {
  const [saved, setSaved] = useState(true);

  const handleChange = useCallback(
    (value: string) => {
      setSaved(false);
      onChange({ ...campaign, notes: value });
      setSaved(true);
    },
    [campaign, onChange],
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            Notas da Sessão
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Anote observações, segredos revelados, ganchos de história e acontecimentos importantes.
          </p>
        </div>
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            color: saved ? "#4ade80" : "#fbbf24",
            background: saved ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.1)",
            border: `1px solid ${saved ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`,
            borderRadius: "var(--radius-full)",
            padding: "3px 10px",
            letterSpacing: "0.06em",
            transition: "all 0.3s",
          }}
        >
          {saved ? "Salvo" : "Salvando..."}
        </span>
      </div>

      <textarea
        value={campaign.notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={"Escreva suas notas aqui...\n\nExemplos de coisas para anotar:\n• Segredos que os jogadores descobriram\n• NPCs importantes que apareceram\n• Próximos eventos da história\n• Itens entregues ou perdidos\n• Ganchos para a próxima sessão"}
        style={{
          width: "100%",
          minHeight: 420,
          padding: "20px",
          background: "var(--surface)",
          border: "1px solid var(--border-accent)",
          borderRadius: "var(--radius-xl)",
          color: "var(--text)",
          fontSize: "0.9rem",
          lineHeight: 1.8,
          resize: "vertical",
          boxSizing: "border-box",
          fontFamily: "inherit",
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-accent)")}
      />

      <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 8, textAlign: "right" }}>
        {campaign.notes.length} caracteres · salvo automaticamente no navegador
      </p>
    </div>
  );
}
