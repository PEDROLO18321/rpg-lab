"use client";

import { useState } from "react";
import type { CthulhuApi } from "@/lib/cthulhu/useCthulhuCampaign";

export function CthulhuSessionNotes({ api }: { api: CthulhuApi }) {
  const [value, setValue] = useState(api.campaign.notes ?? "");
  const [saved, setSaved] = useState(true);
  function commit(v: string) { api.patch({ notes: v }).then(() => setSaved(true)).catch(() => setSaved(false)); }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>Notas do Guardião</h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Segredos, pistas, sanidade perdida, decisões. Salvo ao sair do campo.</p>
        </div>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: saved ? "#4ade80" : "#fbbf24", background: saved ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.1)", border: `1px solid ${saved ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`, borderRadius: "var(--radius-full)", padding: "3px 10px", letterSpacing: "0.06em" }}>{saved ? "Salvo" : "Não salvo"}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
        onBlur={(e) => commit(e.target.value)}
        placeholder={"Escreva suas notas aqui...\n\n• Pistas e evidências\n• Perdas de Sanidade e causas\n• NPCs e reações\n• Segredos do Mythos revelados\n• Próximos ganchos"}
        style={{ width: "100%", minHeight: 420, padding: "20px", background: "var(--surface)", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius-xl)", color: "var(--text)", fontSize: "0.9rem", lineHeight: 1.8, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#7d9c3e")}
      />
      <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 8, textAlign: "right" }}>{value.length} caracteres · salvo no servidor</p>
    </div>
  );
}
