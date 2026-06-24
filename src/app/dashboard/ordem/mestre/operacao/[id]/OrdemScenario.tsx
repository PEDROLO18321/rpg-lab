"use client";

import { useState } from "react";
import type { OrdemCampaign, OrdemSession, OrdemStoryData } from "@/lib/ordem/ordemCampaignStorage";
import { MEMBRANA_STATES } from "@/lib/ordem/ordemCampaignStorage";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

const EMPTY_STORY: OrdemStoryData = {
  objective: "",
  hook: "",
  generalHistory: "",
  currentArc: "",
  mainThreat: "",
};

function blankSession(number: number): OrdemSession {
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

interface Props { campaign: OrdemCampaign; onChange: (c: OrdemCampaign) => void; }

export function OrdemScenario({ campaign, onChange }: Props) {
  const story = campaign.story ?? EMPTY_STORY;
  const sessions = campaign.sessions ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<OrdemSession | null>(null);

  function updateStory(patch: Partial<OrdemStoryData>) {
    onChange({ ...campaign, story: { ...story, ...patch } });
  }

  function addSession() {
    const s = blankSession(sessions.length + 1);
    onChange({ ...campaign, sessions: [...sessions, s] });
    setExpandedId(s.id);
    setEditingSession(s);
  }

  function saveSession(s: OrdemSession) {
    onChange({ ...campaign, sessions: sessions.map((x) => (x.id === s.id ? s : x)) });
    setEditingSession(s);
  }

  function deleteSession(id: string) {
    const updated = sessions.filter((s) => s.id !== id).map((s, i) => ({ ...s, number: i + 1 }));
    onChange({ ...campaign, sessions: updated });
    if (expandedId === id) setExpandedId(null);
    if (editingSession?.id === id) setEditingSession(null);
  }

  function toggleExpand(s: OrdemSession) {
    if (expandedId === s.id) { setExpandedId(null); setEditingSession(null); }
    else { setExpandedId(s.id); setEditingSession({ ...s }); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Scenario overview */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "24px 28px" }}>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: AL }}>📋</span> Cena da Operação
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <label style={labelStyle}>Objetivo dos Agentes</label>
            <textarea style={{ ...areaStyle, minHeight: 72 }} value={story.objective} onChange={(e) => updateStory({ objective: e.target.value })} placeholder="O que os agentes precisam descobrir ou impedir?" />
          </div>
          <div>
            <label style={labelStyle}>Gancho Inicial</label>
            <textarea style={{ ...areaStyle, minHeight: 72 }} value={story.hook} onChange={(e) => updateStory({ hook: e.target.value })} placeholder="Como a Ordo Realitas envolve os agentes? Convocação, evento paranormal, desaparecimento..." />
          </div>
          <div>
            <label style={labelStyle}>Ameaça Principal / Outro Lado</label>
            <textarea style={{ ...areaStyle, minHeight: 60 }} value={story.mainThreat} onChange={(e) => updateStory({ mainThreat: e.target.value })} placeholder="Qual entidade, culto ou fenômeno é a ameaça central? Elemento (Sangue, Morte, Conhecimento, Energia, Medo), objetivos..." />
          </div>
          <div>
            <label style={labelStyle}>Arco Atual</label>
            <textarea style={{ ...areaStyle, minHeight: 60 }} value={story.currentArc} onChange={(e) => updateStory({ currentArc: e.target.value })} placeholder="O que está acontecendo agora? Pistas ativas, NPCs em jogo..." />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>História Geral / Lore</label>
            <textarea style={{ ...areaStyle, minHeight: 120 }} value={story.generalHistory} onChange={(e) => updateStory({ generalHistory: e.target.value })} placeholder="Contexto do Paranormal, história do local, eventos passados relevantes, segredos que os agentes ainda não sabem..." />
          </div>
          {/* Estado da Membrana */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Estado da Membrana</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MEMBRANA_STATES.map((m) => {
                const on = (story.membrana ?? "danificada") === m.id;
                return (
                  <button key={m.id} onClick={() => updateStory({ membrana: m.id })}
                    style={{ padding: "5px 14px", borderRadius: "var(--radius-lg)", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: on ? `${m.color}22` : "var(--surface-2)", border: `1px solid ${on ? m.color : "var(--border)"}`, color: on ? m.color : "var(--text-muted)" }}>
                    {m.label}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", lineHeight: 1.55, marginTop: 8 }}>
              {(MEMBRANA_STATES.find((m) => m.id === (story.membrana ?? "danificada")) ?? MEMBRANA_STATES[2]).effect}
            </p>
          </div>
        </div>
      </section>

      {/* Sessions */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: AL }}>🗂</span> Sessões
            {sessions.length > 0 && (
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: AL, background: AD, border: `1px solid ${AB}`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>
                {sessions.length}
              </span>
            )}
          </h2>
          <button onClick={addSession} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)`, color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
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
                <div key={s.id} style={{ background: "var(--surface)", border: `1px solid ${isOpen ? AB : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
                  <button onClick={() => toggleExpand(s)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ width: 32, height: 32, borderRadius: "var(--radius)", background: AD, border: `1px solid ${AB}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-cinzel), serif", fontSize: "0.72rem", fontWeight: 900, color: AL, flexShrink: 0 }}>
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
                        <textarea style={{ ...areaStyle, minHeight: 60 }} value={editing.objective} onChange={(e) => { const u = { ...editing, objective: e.target.value }; setEditingSession(u); saveSession(u); }} placeholder="O que os agentes devem descobrir ou impedir nesta sessão?" />
                      </div>
                      <div>
                        <label style={labelStyle}>Roteiro / O que vai acontecer</label>
                        <textarea style={{ ...areaStyle, minHeight: 90 }} value={editing.events} onChange={(e) => { const u = { ...editing, events: e.target.value }; setEditingSession(u); saveSession(u); }} placeholder="Encontros, pistas, locais, criaturas do Outro Lado, revelações planejadas..." />
                      </div>
                      <div>
                        <label style={labelStyle}>Resumo (após a sessão)</label>
                        <textarea style={{ ...areaStyle, minHeight: 80 }} value={editing.summary} onChange={(e) => { const u = { ...editing, summary: e.target.value }; setEditingSession(u); saveSession(u); }} placeholder="O que aconteceu? Sanidade perdida, decisões dos agentes, revelações..." />
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
