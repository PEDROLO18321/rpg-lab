"use client";

import { useState } from "react";
import type { CthulhuCampaign, CthulhuSession, CthulhuStoryData } from "@/lib/cthulhu/cthulhuCampaignStorage";

const EMPTY_STORY: CthulhuStoryData = {
  objective: "",
  hook: "",
  generalHistory: "",
  currentArc: "",
  mainCult: "",
};

function blankSession(number: number): CthulhuSession {
  return { id: crypto.randomUUID(), number, name: `Sessão ${number}`, objective: "", events: "", summary: "", sessionDate: "" };
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, display: "block",
};
const areaStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", lineHeight: 1.6, resize: "vertical", minHeight: 80, boxSizing: "border-box", fontFamily: "inherit",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit",
};

interface Props { campaign: CthulhuCampaign; onChange: (c: CthulhuCampaign) => void; }

export function CthulhuScenario({ campaign, onChange }: Props) {
  const story = campaign.story ?? EMPTY_STORY;
  const sessions = campaign.sessions ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<CthulhuSession | null>(null);

  function updateStory(patch: Partial<CthulhuStoryData>) {
    onChange({ ...campaign, story: { ...story, ...patch } });
  }

  function addSession() {
    const s = blankSession(sessions.length + 1);
    onChange({ ...campaign, sessions: [...sessions, s] });
    setExpandedId(s.id);
    setEditingSession(s);
  }

  function saveSession(s: CthulhuSession) {
    onChange({ ...campaign, sessions: sessions.map((x) => (x.id === s.id ? s : x)) });
    setEditingSession(s);
  }

  function deleteSession(id: string) {
    const updated = sessions.filter((s) => s.id !== id).map((s, i) => ({ ...s, number: i + 1 }));
    onChange({ ...campaign, sessions: updated });
    if (expandedId === id) setExpandedId(null);
    if (editingSession?.id === id) setEditingSession(null);
  }

  function toggleExpand(s: CthulhuSession) {
    if (expandedId === s.id) { setExpandedId(null); setEditingSession(null); }
    else { setExpandedId(s.id); setEditingSession({ ...s }); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Scenario overview */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "24px 28px" }}>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#a3b86c" }}>📜</span> Cenário
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <label style={labelStyle}>Objetivo dos Investigadores</label>
            <textarea style={{ ...areaStyle, minHeight: 72 }} value={story.objective} onChange={(e) => updateStory({ objective: e.target.value })} placeholder="O que os investigadores precisam descobrir ou impedir?" />
          </div>
          <div>
            <label style={labelStyle}>Gancho Inicial</label>
            <textarea style={{ ...areaStyle, minHeight: 72 }} value={story.hook} onChange={(e) => updateStory({ hook: e.target.value })} placeholder="Como os investigadores são envolvidos? Contrato, desaparecimento, coincidência..." />
          </div>
          <div>
            <label style={labelStyle}>Principal Culto / Ameaça</label>
            <textarea style={{ ...areaStyle, minHeight: 60 }} value={story.mainCult} onChange={(e) => updateStory({ mainCult: e.target.value })} placeholder="Qual entidade ou culto é a ameaça central? Seus objetivos, rituais, membros-chave..." />
          </div>
          <div>
            <label style={labelStyle}>Arco Atual</label>
            <textarea style={{ ...areaStyle, minHeight: 60 }} value={story.currentArc} onChange={(e) => updateStory({ currentArc: e.target.value })} placeholder="O que está acontecendo agora? Pistas ativas, NPCs em jogo..." />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>História Geral / Lore</label>
            <textarea style={{ ...areaStyle, minHeight: 120 }} value={story.generalHistory} onChange={(e) => updateStory({ generalHistory: e.target.value })} placeholder="Contexto do Mythos, história do local, eventos passados relevantes, segredos que os investigadores ainda não sabem..." />
          </div>
        </div>
      </section>

      {/* Sessions */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#a3b86c" }}>🕯</span> Sessões
            {sessions.length > 0 && (
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#a3b86c", background: "rgba(125,156,62,0.14)", border: "1px solid rgba(125,156,62,0.32)", borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>
                {sessions.length}
              </span>
            )}
          </h2>
          <button onClick={addSession} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "linear-gradient(135deg, #a3b86c 0%, #7d9c3e 100%)", color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
            + Nova Sessão
          </button>
        </div>

        {sessions.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-xl)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhuma sessão ainda. Clique em <strong>+ Nova Sessão</strong> para começar.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((s) => {
              const isOpen = expandedId === s.id;
              const editing = editingSession?.id === s.id ? editingSession : s;
              return (
                <div key={s.id} style={{ background: "var(--surface)", border: `1px solid ${isOpen ? "rgba(125,156,62,0.32)" : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
                  <button onClick={() => toggleExpand(s)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ width: 32, height: 32, borderRadius: "var(--radius)", background: "rgba(125,156,62,0.14)", border: "1px solid rgba(125,156,62,0.32)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-cinzel), serif", fontSize: "0.72rem", fontWeight: 900, color: "#a3b86c", flexShrink: 0 }}>
                      {s.number}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name || `Sessão ${s.number}`}</p>
                      {s.objective && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.objective}</p>}
                    </div>
                    {s.sessionDate && <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", flexShrink: 0 }}>{s.sessionDate}</span>}
                    <span style={{ color: "var(--text-subtle)", fontSize: "0.82rem", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s" }}>▾</span>
                  </button>

                  {isOpen && editingSession?.id === s.id && (
                    <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                          <label style={labelStyle}>Nome da Sessão</label>
                          <input style={inputStyle} value={editing.name} onChange={(e) => { const u = { ...editing, name: e.target.value }; setEditingSession(u); saveSession(u); }} />
                        </div>
                        <div>
                          <label style={labelStyle}>Data</label>
                          <input type="date" style={inputStyle} value={editing.sessionDate} onChange={(e) => { const u = { ...editing, sessionDate: e.target.value }; setEditingSession(u); saveSession(u); }} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Objetivo da Sessão</label>
                        <textarea style={{ ...areaStyle, minHeight: 60 }} value={editing.objective} onChange={(e) => { const u = { ...editing, objective: e.target.value }; setEditingSession(u); saveSession(u); }} placeholder="O que os investigadores devem descobrir ou impedir nesta sessão?" />
                      </div>
                      <div>
                        <label style={labelStyle}>Roteiro / O que vai acontecer</label>
                        <textarea style={{ ...areaStyle, minHeight: 90 }} value={editing.events} onChange={(e) => { const u = { ...editing, events: e.target.value }; setEditingSession(u); saveSession(u); }} placeholder="Encontros, pistas, locais, criaturas, revelações do Mythos planejadas..." />
                      </div>
                      <div>
                        <label style={labelStyle}>Resumo (após a sessão)</label>
                        <textarea style={{ ...areaStyle, minHeight: 80 }} value={editing.summary} onChange={(e) => { const u = { ...editing, summary: e.target.value }; setEditingSession(u); saveSession(u); }} placeholder="O que aconteceu? Sanidade perdida, decisões dos investigadores, revelações..." />
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button onClick={() => deleteSession(s.id)} style={{ padding: "7px 16px", background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: "var(--radius)", color: "#e06c6c", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
                          Excluir Sessão
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
