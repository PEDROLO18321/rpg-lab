"use client";

import { useState } from "react";
import type { OperacaoApi } from "@/lib/ordem/useOperacao";

const A = "#ffffff";

export function OrdemSessionNotes({ api }: { api: OperacaoApi }) {
  const [value, setValue] = useState(api.campaign.notes ?? "");
  const [saved, setSaved] = useState(true);

  function commit(v: string) {
    api.patch({ notes: v }).then(() => setSaved(true)).catch(() => setSaved(false));
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            Notas do Mestre
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Segredos, decisões dos agentes, lembretes. Salvo ao sair do campo.
          </p>
        </div>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: saved ? "#4ade80" : "#fbbf24", background: saved ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.1)", border: `1px solid ${saved ? "rgba(74,222,128,0.2)" : "rgba(251,191,36,0.2)"}`, borderRadius: "var(--radius-full)", padding: "3px 10px", letterSpacing: "0.06em", transition: "all 0.3s" }}>
          {saved ? "Salvo" : "Não salvo"}
        </span>
      </div>

      <textarea
        value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
        onBlur={(e) => commit(e.target.value)}
        placeholder={"Escreva suas notas aqui...\n\n• Pistas e evidências\n• Perdas de Sanidade e causas\n• NPCs e reações\n• Segredos revelados\n• Próximos ganchos"}
        style={{ width: "100%", minHeight: 420, padding: "20px", background: "var(--surface)", border: "1px solid rgba(255,255,255,0.28)", borderRadius: "var(--radius-xl)", color: "var(--text)", fontSize: "0.9rem", lineHeight: 1.8, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = A)}
      />
      <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 8, textAlign: "right" }}>
        {value.length} caracteres · salvo no servidor
      </p>
    </div>
  );
}
