"use client";

import { useState, useEffect } from "react";
import type { CthulhuApi } from "@/lib/cthulhu/useCthulhuCampaign";

const A = "#a3b86c";
const ADIM = "rgba(125,156,62,0.14)";
const ABORD = "rgba(125,156,62,0.32)";

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso); const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function CthulhuAgenda({ api }: { api: CthulhuApi }) {
  const [value, setValue] = useState(toLocalInput(api.campaign.nextSessionAt));
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { setShareUrl(`${window.location.origin}/cthulhu/cenario/${api.campaign.inviteCode}`); }, [api.campaign.inviteCode]);

  function save() { api.patch({ nextSessionAt: value ? new Date(value).toISOString() : null }); }
  function clear() { setValue(""); api.patch({ nextSessionAt: null }); }
  async function copy() { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  const next = api.campaign.nextSessionAt ? new Date(api.campaign.nextSessionAt) : null;
  const sessionsWithDate = api.campaign.cthulhuSessions.filter((s) => s.sessionDate);

  const card: React.CSSProperties = { background: "var(--surface)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius-xl)", padding: "20px 22px" };
  const lab: React.CSSProperties = { display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#7d9c3e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: A }}>📅</span> Agenda do Cenário</h2>

      <div style={card}>
        <label style={lab}>Próxima Sessão</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} style={{ padding: "9px 12px", background: "var(--surface-2)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem" }} />
          <button onClick={save} style={{ padding: "9px 18px", background: "linear-gradient(135deg, #a3b86c 0%, #7d9c3e 100%)", color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}>Salvar</button>
          {api.campaign.nextSessionAt && <button onClick={clear} style={{ padding: "9px 14px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.84rem", cursor: "pointer" }}>Limpar</button>}
        </div>
        {next && <p style={{ fontSize: "0.84rem", color: A, marginTop: 12 }}>🕒 {next.toLocaleString("pt-BR", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}</p>}
      </div>

      <div style={card}>
        <label style={lab}>Tela do Investigador (somente leitura)</label>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.5 }}>Compartilhe com os jogadores. Mostra a cena atual, ordem de ação, relógios e pistas reveladas.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} style={{ flex: 1, minWidth: 220, padding: "9px 12px", background: "var(--surface-2)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.82rem" }} />
          <button onClick={copy} style={{ padding: "9px 18px", background: ADIM, color: A, border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}>{copied ? "✓ Copiado" : "Copiar"}</button>
          <a href={shareUrl} target="_blank" rel="noreferrer" style={{ padding: "9px 18px", background: "transparent", color: A, border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", fontSize: "0.84rem", fontWeight: 700, textDecoration: "none" }}>Abrir ↗</a>
        </div>
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
