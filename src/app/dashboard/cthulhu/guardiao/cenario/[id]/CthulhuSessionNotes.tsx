"use client";

import { useState, useCallback } from "react";
import { type CthulhuCampaign } from "@/lib/cthulhu/cthulhuCampaignStorage";

interface Props { campaign: CthulhuCampaign; onChange: (c: CthulhuCampaign) => void; }

export function CthulhuSessionNotes({ campaign, onChange }: Props) {
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
            Notas do Guardião
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Segredos revelados, pistas encontradas, sanidade perdida, decisões dos investigadores.
          </p>
        </div>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: saved ? "#4ade80" : "#fbbf24", background: saved ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.1)", border: `1px solid ${saved ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`, borderRadius: "var(--radius-full)", padding: "3px 10px", letterSpacing: "0.06em", transition: "all 0.3s" }}>
          {saved ? "Salvo" : "Salvando..."}
        </span>
      </div>

      <textarea
        value={campaign.notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={"Escreva suas notas aqui...\n\nSugestões:\n• Pistas e evidências encontradas pelos investigadores\n• Perdas de Sanidade sofridas e suas causas\n• NPCs encontrados e reações\n• Segredos do Mythos revelados\n• Próximos eventos e ganchos\n• Itens adquiridos ou perdidos"}
        style={{ width: "100%", minHeight: 420, padding: "20px", background: "var(--surface)", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius-xl)", color: "var(--text)", fontSize: "0.9rem", lineHeight: 1.8, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#7d9c3e")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(125,156,62,0.32)")}
      />

      <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 8, textAlign: "right" }}>
        {campaign.notes.length} caracteres · salvo automaticamente no navegador
      </p>
    </div>
  );
}
