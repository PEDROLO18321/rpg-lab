"use client";

import { useState } from "react";
import type { OperacaoApi } from "@/lib/ordem/useOperacao";
import type { OrdemClue } from "@/lib/ordem/ordemCampaignClient";

const A = "#ffffff";
const AL = "#e8e8ef";
const AB = "rgba(255,255,255,0.28)";

const inputStyle: React.CSSProperties = {
  padding: "9px 12px", background: "var(--surface-2)", border: `1px solid ${AB}`, borderRadius: "var(--radius)",
  color: "var(--text)", fontSize: "0.86rem", width: "100%", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.68rem", fontWeight: 700, color: A, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4,
};

export function OrdemClues({ api }: { api: OperacaoApi }) {
  const clues = api.campaign.ordemClues;
  const sessions = api.campaign.ordemSessions;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"todas" | "reveladas" | "ocultas">("todas");

  async function add() {
    if (!title.trim()) return;
    await api.addChild("clues", { title: title.trim(), content: content.trim(), source: source.trim() });
    setTitle(""); setContent(""); setSource("");
  }

  const filtered = clues.filter((c) =>
    filter === "todas" ? true : filter === "reveladas" ? c.discovered : !c.discovered,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: AL }}>🔍</span> Pistas & Evidências
        </h2>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
          Marque uma pista como <strong>revelada</strong> para que ela apareça na tela dos jogadores.
        </p>
      </div>

      {/* Add form */}
      <div style={{ padding: "18px 20px", background: "var(--surface)", border: `1px solid ${AB}`, borderRadius: "var(--radius-xl)" }}>
        <div className="op-clues-form-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label style={labelStyle}>Título</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Bilhete rasgado" style={inputStyle} /></div>
          <div><label style={labelStyle}>Onde/Como foi achada</label><input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Ex: Cena do crime, NPC X" style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Conteúdo</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="O que a pista revela?" style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} />
        </div>
        <button onClick={add} disabled={!title.trim()} style={{ padding: "9px 20px", background: title.trim() ? `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)` : "var(--surface-2)", color: title.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.84rem", fontWeight: 700, cursor: title.trim() ? "pointer" : "not-allowed" }}>+ Adicionar Pista</button>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6 }}>
        {(["todas", "reveladas", "ocultas"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: "var(--radius-lg)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", background: filter === f ? "rgba(255,255,255,0.12)" : "var(--surface-2)", border: `1px solid ${filter === f ? AB : "var(--border)"}`, color: filter === f ? AL : "var(--text-muted)", textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p style={{ fontSize: "0.84rem", color: "var(--text-subtle)", textAlign: "center", padding: "32px 0" }}>Nenhuma pista{filter !== "todas" ? ` ${filter}` : ""}.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((c: OrdemClue) => {
            const isOpen = expandedId === c.id;
            return (
              <div key={c.id} style={{ background: "var(--surface)", border: `1px solid ${c.discovered ? "rgba(125,211,168,0.35)" : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
                  <button onClick={() => api.editChild("clues", c.id, { discovered: !c.discovered })} title={c.discovered ? "Revelada (clique p/ ocultar)" : "Oculta (clique p/ revelar)"} style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, cursor: "pointer", background: c.discovered ? "rgba(125,211,168,0.16)" : "var(--surface-2)", border: `1px solid ${c.discovered ? "#7dd3a8" : "var(--border)"}`, color: c.discovered ? "#7dd3a8" : "var(--text-subtle)", fontSize: "0.8rem" }}>{c.discovered ? "👁" : "∅"}</button>
                  <button onClick={() => setExpandedId(isOpen ? null : c.id)} style={{ flex: 1, textAlign: "left", background: "transparent", border: "none", cursor: "pointer", minWidth: 0 }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</p>
                    {c.source && <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{c.source}</p>}
                  </button>
                  <span style={{ fontSize: "0.66rem", fontWeight: 700, color: c.discovered ? "#7dd3a8" : "var(--text-subtle)", flexShrink: 0 }}>{c.discovered ? "REVELADA" : "OCULTA"}</span>
                  <button onClick={() => api.removeChild("clues", c.id)} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>✕</button>
                </div>
                {isOpen && <ClueEditor api={api} clue={c} sessions={sessions} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClueEditor({ api, clue, sessions }: { api: OperacaoApi; clue: OrdemClue; sessions: OperacaoApi["campaign"]["ordemSessions"] }) {
  const [d, setD] = useState(clue);
  const set = (p: Partial<OrdemClue>) => setD((c) => ({ ...c, ...p }));
  const commit = (p: Partial<OrdemClue>) => api.editChild("clues", clue.id, p);
  return (
    <div style={{ padding: "0 16px 16px 16px", borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="op-clues-form-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div><label style={labelStyle}>Título</label><input style={inputStyle} value={d.title} onChange={(e) => set({ title: e.target.value })} onBlur={(e) => commit({ title: e.target.value })} /></div>
        <div><label style={labelStyle}>Vínculo à Sessão</label>
          <select style={{ ...inputStyle, cursor: "pointer" }} value={d.sessionId ?? ""} onChange={(e) => { const v = e.target.value || null; set({ sessionId: v }); commit({ sessionId: v }); }}>
            <option value="">Nenhuma</option>
            {sessions.map((s) => <option key={s.id} value={s.id}>Sessão {s.number}</option>)}
          </select>
        </div>
      </div>
      <div><label style={labelStyle}>Onde/Como</label><input style={inputStyle} value={d.source} onChange={(e) => set({ source: e.target.value })} onBlur={(e) => commit({ source: e.target.value })} /></div>
      <div><label style={labelStyle}>Conteúdo</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={d.content} onChange={(e) => set({ content: e.target.value })} onBlur={(e) => commit({ content: e.target.value })} /></div>
    </div>
  );
}
