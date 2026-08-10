"use client";

import { useState } from "react";
import type { OperacaoApi } from "@/lib/ordem/useOperacao";
import { MEMBRANA_STATES, type OrdemStory, type OrdemGameSession } from "@/lib/ordem/ordemCampaignClient";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

const EMPTY_STORY: OrdemStory = {
  objective: "", hook: "", generalHistory: "", currentArc: "", mainThreat: "", membrana: "danificada",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, display: "block",
};
const areaStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", lineHeight: 1.6, resize: "vertical", minHeight: 80, boxSizing: "border-box", fontFamily: "inherit",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit",
};

export function OrdemScenario({ api }: { api: OperacaoApi }) {
  const story = api.campaign.ordemStory ?? EMPTY_STORY;
  const sessions = api.campaign.ordemSessions;
  const [draft, setDraft] = useState<OrdemStory>(story);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function setField(patch: Partial<OrdemStory>) { setDraft((d) => ({ ...d, ...patch })); }
  function commit(patch: Partial<OrdemStory>) { api.patch({ story: patch }); }
  function setMembrana(m: OrdemStory["membrana"]) { setField({ membrana: m }); api.patch({ story: { membrana: m } }); }

  async function addSession() {
    const number = sessions.length + 1;
    const s = await api.addChild<OrdemGameSession>("sessions", { number, name: `Sessão ${number}` });
    setExpandedId(s.id);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "24px 28px" }}>
        <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: AL }}>📋</span> Cena da Operação
        </h2>
        <div className="op-scenario-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <label style={labelStyle}>Objetivo dos Agentes</label>
            <textarea style={{ ...areaStyle, minHeight: 72 }} value={draft.objective} onChange={(e) => setField({ objective: e.target.value })} onBlur={(e) => commit({ objective: e.target.value })} placeholder="O que os agentes precisam descobrir ou impedir?" />
          </div>
          <div>
            <label style={labelStyle}>Gancho Inicial</label>
            <textarea style={{ ...areaStyle, minHeight: 72 }} value={draft.hook} onChange={(e) => setField({ hook: e.target.value })} onBlur={(e) => commit({ hook: e.target.value })} placeholder="Como a Ordo Realitas envolve os agentes?" />
          </div>
          <div>
            <label style={labelStyle}>Ameaça Principal / Outro Lado</label>
            <textarea style={{ ...areaStyle, minHeight: 60 }} value={draft.mainThreat} onChange={(e) => setField({ mainThreat: e.target.value })} onBlur={(e) => commit({ mainThreat: e.target.value })} placeholder="Entidade, culto ou fenômeno central; elemento, objetivos..." />
          </div>
          <div>
            <label style={labelStyle}>Arco Atual</label>
            <textarea style={{ ...areaStyle, minHeight: 60 }} value={draft.currentArc} onChange={(e) => setField({ currentArc: e.target.value })} onBlur={(e) => commit({ currentArc: e.target.value })} placeholder="O que está acontecendo agora?" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>História Geral / Lore</label>
            <textarea style={{ ...areaStyle, minHeight: 120 }} value={draft.generalHistory} onChange={(e) => setField({ generalHistory: e.target.value })} onBlur={(e) => commit({ generalHistory: e.target.value })} placeholder="Contexto, história do local, segredos que os agentes ainda não sabem..." />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Estado da Membrana</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MEMBRANA_STATES.map((m) => {
                const on = draft.membrana === m.id;
                return (
                  <button key={m.id} onClick={() => setMembrana(m.id)}
                    style={{ padding: "5px 14px", borderRadius: "var(--radius-lg)", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: on ? `${m.color}22` : "var(--surface-2)", border: `1px solid ${on ? m.color : "var(--border)"}`, color: on ? m.color : "var(--text-muted)" }}>
                    {m.label}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", lineHeight: 1.55, marginTop: 8 }}>
              {(MEMBRANA_STATES.find((m) => m.id === draft.membrana) ?? MEMBRANA_STATES[2]).effect}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: AL }}>🗂</span> Sessões
            {sessions.length > 0 && (
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: AL, background: AD, border: `1px solid ${AB}`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>{sessions.length}</span>
            )}
          </h2>
          <button onClick={addSession} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)`, color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
            + Nova Sessão
          </button>
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
                <div key={s.id} style={{ background: "var(--surface)", border: `1px solid ${isOpen ? AB : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
                  <button onClick={() => setExpandedId(isOpen ? null : s.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ width: 32, height: 32, borderRadius: "var(--radius)", background: AD, border: `1px solid ${AB}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-cinzel), serif", fontSize: "0.72rem", fontWeight: 900, color: AL, flexShrink: 0 }}>{s.number}</span>
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

function SessionEditor({ api, session }: { api: OperacaoApi; session: OrdemGameSession }) {
  const [s, setS] = useState(session);
  const set = (p: Partial<OrdemGameSession>) => setS((cur) => ({ ...cur, ...p }));
  const commit = (p: Partial<OrdemGameSession>) => api.editChild("sessions", session.id, p);

  return (
    <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="op-scenario-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={labelStyle}>Nome da Sessão</label>
          <input style={inputStyle} value={s.name} onChange={(e) => set({ name: e.target.value })} onBlur={(e) => commit({ name: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Data</label>
          <input type="date" style={inputStyle} value={s.sessionDate} onChange={(e) => set({ sessionDate: e.target.value })} onBlur={(e) => commit({ sessionDate: e.target.value })} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Objetivo da Sessão</label>
        <textarea style={{ ...areaStyle, minHeight: 60 }} value={s.objective} onChange={(e) => set({ objective: e.target.value })} onBlur={(e) => commit({ objective: e.target.value })} placeholder="O que os agentes devem descobrir ou impedir?" />
      </div>
      <div>
        <label style={labelStyle}>Roteiro / O que vai acontecer</label>
        <textarea style={{ ...areaStyle, minHeight: 90 }} value={s.events} onChange={(e) => set({ events: e.target.value })} onBlur={(e) => commit({ events: e.target.value })} placeholder="Encontros, pistas, locais, criaturas, revelações..." />
      </div>
      <div>
        <label style={labelStyle}>Resumo (após a sessão)</label>
        <textarea style={{ ...areaStyle, minHeight: 80 }} value={s.summary} onChange={(e) => set({ summary: e.target.value })} onBlur={(e) => commit({ summary: e.target.value })} placeholder="O que aconteceu? Sanidade perdida, decisões..." />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => api.removeChild("sessions", session.id)} style={{ padding: "7px 16px", background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: "var(--radius)", color: "#e06c6c", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
          Excluir Sessão
        </button>
      </div>
    </div>
  );
}
