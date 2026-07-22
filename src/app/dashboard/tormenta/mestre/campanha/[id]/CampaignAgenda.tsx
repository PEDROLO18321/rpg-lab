"use client";

import { useState } from "react";
import type { TormentaApi } from "@/lib/tormenta/useTormentaCampaign";

const ACCENT = "#a01818";
const ACCENT_LIGHT = "#c94040";
const ACCENT_BORD = "rgba(160,24,24,0.28)";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso); const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function CampaignAgenda({ api }: { api: TormentaApi }) {
  const [value, setValue] = useState(toLocalInput(api.campaign.nextSessionAt));

  function save() { api.patch({ nextSessionAt: value ? new Date(value).toISOString() : null }); }
  function clear() { setValue(""); api.patch({ nextSessionAt: null }); }

  const next = api.campaign.nextSessionAt ? new Date(api.campaign.nextSessionAt) : null;
  const sessionsWithDate = api.campaign.tormentaSessions.filter((s) => s.sessionDate);

  const card: React.CSSProperties = { background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: "20px 22px" };
  const lab: React.CSSProperties = { display: "block", fontSize: "0.68rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: ACCENT_LIGHT }}>📅</span> Agenda da Campanha</h2>

      <div style={card}>
        <label style={lab}>Próxima Sessão</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} style={{ padding: "9px 12px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem" }} />
          <button onClick={save} style={{ padding: "9px 18px", background: `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`, color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}>Salvar</button>
          {api.campaign.nextSessionAt && <button onClick={clear} style={{ padding: "9px 14px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.84rem", cursor: "pointer" }}>Limpar</button>}
        </div>
        {next && <p style={{ fontSize: "0.84rem", color: ACCENT_LIGHT, marginTop: 12 }}>🕒 {next.toLocaleString("pt-BR", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}</p>}
      </div>

      {sessionsWithDate.length > 0 && (
        <div style={card}>
          <label style={lab}>Datas Registradas</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sessionsWithDate.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", color: "var(--text-muted)", padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text)" }}>Sessão {s.number}{s.name ? ` · ${s.name}` : ""}</span><span>{s.sessionDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
