"use client";

import { useState, useCallback } from "react";
import { type OrdemCampaign } from "@/lib/ordem/ordemCampaignStorage";

const A = "#ffffff";

interface Props { campaign: OrdemCampaign; onChange: (c: OrdemCampaign) => void; }

export function OrdemSessionNotes({ campaign, onChange }: Props) {
  const [saved, setSaved] = useState(true);

  const handleChange = useCallback((value: string) => {
    setSaved(false);
    onChange({ ...campaign, notes: value });
    setSaved(true);
  }, [campaign, onChange]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            Notas do Mestre
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Segredos revelados, pistas encontradas, sanidade perdida, decisões dos agentes.
          </p>
        </div>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: saved ? "#4ade80" : "#fbbf24", background: saved ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.1)", border: `1px solid ${saved ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`, borderRadius: "var(--radius-full)", padding: "3px 10px", letterSpacing: "0.06em", transition: "all 0.3s" }}>
          {saved ? "Salvo" : "Salvando..."}
        </span>
      </div>

      <textarea
        value={campaign.notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={"Escreva suas notas aqui...\n\nSugestões:\n• Pistas e evidências encontradas pelos agentes\n• Perdas de Sanidade sofridas e suas causas\n• NPCs encontrados e reações\n• Segredos do Paranormal revelados\n• Próximos eventos e ganchos\n• Itens e rituais adquiridos"}
        style={{ width: "100%", minHeight: 420, padding: "20px", background: "var(--surface)", border: "1px solid rgba(255,255,255,0.28)", borderRadius: "var(--radius-xl)", color: "var(--text)", fontSize: "0.9rem", lineHeight: 1.8, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = A)}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)")}
      />

      <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 8, textAlign: "right" }}>
        {campaign.notes.length} caracteres · salvo automaticamente no navegador
      </p>
    </div>
  );
}
