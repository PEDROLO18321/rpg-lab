"use client";

import { useState } from "react";
import type { CthulhuApi } from "@/lib/cthulhu/useCthulhuCampaign";
import type { CthulhuStory, CthulhuGameSession } from "@/lib/cthulhu/cthulhuCampaignClient";

const A = "#a3b86c";
const ABORD = "rgba(125,156,62,0.32)";

const EMPTY_STORY: CthulhuStory = { objective: "", hook: "", generalHistory: "", currentArc: "", mainCult: "" };

const labelStyle: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, display: "block" };
const areaStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", lineHeight: 1.6, resize: "vertical", minHeight: 80, boxSizing: "border-box", fontFamily: "inherit" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit" };

export function CthulhuScenario({ api }: { api: CthulhuApi }) {
  const story = api.campaign.cthulhuStory ?? EMPTY_STORY;
  const sessions = api.campaign.cthulhuSessions;
  const [draft, setDraft] = useState<CthulhuStory>(story);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const setField = (p: Partial<CthulhuStory>) => setDraft((d) => ({ ...d, ...p }));
  const commit = (p: Partial<CthulhuStory>) => api.patch({ story: p });

  async function addSession() {
    const number = sessions.length + 1;
    const s = await api.addChild<CthulhuGameSession>("sessions", { number, name: `Sessão ${number}` });
    setExpandedId(s.id);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "24px 28px" }}>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: A }}>📜</span> Cenário</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div><label style={labelStyle}>Objetivo dos Investigadores</label><textarea style={{ ...areaStyle, minHeight: 72 }} value={draft.objective} onChange={(e) => setField({ objective: e.target.value })} onBlur={(e) => commit({ objective: e.target.value })} placeholder="O que precisam descobrir ou impedir?" /></div>
          <div><label style={labelStyle}>Gancho Inicial</label><textarea style={{ ...areaStyle, minHeight: 72 }} value={draft.hook} onChange={(e) => setField({ hook: e.target.value })} onBlur={(e) => commit({ hook: e.target.value })} placeholder="Como são envolvidos? Contrato, desaparecimento..." /></div>
          <div><label style={labelStyle}>Principal Culto / Ameaça</label><textarea style={{ ...areaStyle, minHeight: 60 }} value={draft.mainCult} onChange={(e) => setField({ mainCult: e.target.value })} onBlur={(e) => commit({ mainCult: e.target.value })} placeholder="Entidade ou culto central, objetivos, membros-chave..." /></div>
          <div><label style={labelStyle}>Arco Atual</label><textarea style={{ ...areaStyle, minHeight: 60 }} value={draft.currentArc} onChange={(e) => setField({ currentArc: e.target.value })} onBlur={(e) => commit({ currentArc: e.target.value })} placeholder="O que está acontecendo agora?" /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>História Geral / Lore</label><textarea style={{ ...areaStyle, minHeight: 120 }} value={draft.generalHistory} onChange={(e) => setField({ generalHistory: e.target.value })} onBlur={(e) => commit({ generalHistory: e.target.value })} placeholder="Contexto do Mythos, história do local, segredos ocultos..." /></div>
        </div>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: A }}>🕯</span> Sessões
            {sessions.length > 0 && <span style={{ fontSize: "0.72rem", fontWeight: 700, color: A, background: "rgba(125,156,62,0.14)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>{sessions.length}</span>}
          </h2>
          <button onClick={addSession} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "linear-gradient(135deg, #a3b86c 0%, #7d9c3e 100%)", color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>+ Nova Sessão</button>
        </div>

        {sessions.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-xl)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhuma sessão ainda. Clique em <strong>+ Nova Sessão</strong>.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((s) => {
              const isOpen = expandedId === s.id;
              return (
                <div key={s.id} style={{ background: "var(--surface)", border: `1px solid ${isOpen ? ABORD : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
                  <button onClick={() => setExpandedId(isOpen ? null : s.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ width: 32, height: 32, borderRadius: "var(--radius)", background: "rgba(125,156,62,0.14)", border: `1px solid ${ABORD}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-cinzel), serif", fontSize: "0.72rem", fontWeight: 900, color: A, flexShrink: 0 }}>{s.number}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name || `Sessão ${s.number}`}</p>
                      {s.objective && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.objective}</p>}
                    </div>
                    {s.sessionDate && <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", flexShrink: 0 }}>{s.sessionDate}</span>}
                    <span style={{ color: "var(--text-subtle)", fontSize: "0.82rem", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s" }}>▾</span>
                  </button>
                  {isOpen && <SessionEditor api={api} session={s} />}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function SessionEditor({ api, session }: { api: CthulhuApi; session: CthulhuGameSession }) {
  const [s, setS] = useState(session);
  const set = (p: Partial<CthulhuGameSession>) => setS((c) => ({ ...c, ...p }));
  const commit = (p: Partial<CthulhuGameSession>) => api.editChild("sessions", session.id, p);
  return (
    <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div><label style={labelStyle}>Nome da Sessão</label><input style={inputStyle} value={s.name} onChange={(e) => set({ name: e.target.value })} onBlur={(e) => commit({ name: e.target.value })} /></div>
        <div><label style={labelStyle}>Data</label><input type="date" style={inputStyle} value={s.sessionDate} onChange={(e) => set({ sessionDate: e.target.value })} onBlur={(e) => commit({ sessionDate: e.target.value })} /></div>
      </div>
      <div><label style={labelStyle}>Objetivo da Sessão</label><textarea style={{ ...areaStyle, minHeight: 60 }} value={s.objective} onChange={(e) => set({ objective: e.target.value })} onBlur={(e) => commit({ objective: e.target.value })} placeholder="O que devem descobrir ou impedir?" /></div>
      <div><label style={labelStyle}>Roteiro / O que vai acontecer</label><textarea style={{ ...areaStyle, minHeight: 90 }} value={s.events} onChange={(e) => set({ events: e.target.value })} onBlur={(e) => commit({ events: e.target.value })} placeholder="Encontros, pistas, locais, revelações do Mythos..." /></div>
      <div><label style={labelStyle}>Resumo (após a sessão)</label><textarea style={{ ...areaStyle, minHeight: 80 }} value={s.summary} onChange={(e) => set({ summary: e.target.value })} onBlur={(e) => commit({ summary: e.target.value })} placeholder="O que aconteceu? Sanidade perdida, decisões..." /></div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => api.removeChild("sessions", session.id)} style={{ padding: "7px 16px", background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: "var(--radius)", color: "#e06c6c", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>Excluir Sessão</button>
      </div>
    </div>
  );
}
