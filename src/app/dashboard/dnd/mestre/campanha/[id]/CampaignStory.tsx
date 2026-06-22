"use client";

import { useState } from "react";
import type { Campaign, CampaignSession, CampaignStoryData } from "@/lib/dnd/campaignStorage";

const ACCENT = "var(--accent)";
const ACCENT_LIGHT = "var(--accent-light)";
const ACCENT_DIM = "var(--accent-dim)";
const ACCENT_BORD = "var(--border-accent)";

interface Props {
  campaign: Campaign;
  onChange: (c: Campaign) => void;
}

const EMPTY_STORY: CampaignStoryData = {
  objective: "",
  purpose: "",
  generalHistory: "",
  currentArc: "",
};

function blankSession(number: number): CampaignSession {
  return {
    id: crypto.randomUUID(),
    number,
    name: `Sessão ${number}`,
    objective: "",
    events: "",
    summary: "",
    sessionDate: "",
  };
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "var(--text-muted)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 4,
  display: "block",
};

const areaStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--text)",
  fontSize: "0.86rem",
  lineHeight: 1.6,
  resize: "vertical",
  minHeight: 80,
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--text)",
  fontSize: "0.86rem",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export function CampaignStory({ campaign, onChange }: Props) {
  const story = campaign.story ?? EMPTY_STORY;
  const sessions = campaign.sessions ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<CampaignSession | null>(null);

  function updateStory(patch: Partial<CampaignStoryData>) {
    onChange({ ...campaign, story: { ...story, ...patch } });
  }

  function addSession() {
    const s = blankSession(sessions.length + 1);
    const updated = [...sessions, s];
    onChange({ ...campaign, sessions: updated });
    setExpandedId(s.id);
    setEditingSession(s);
  }

  function saveSession(s: CampaignSession) {
    const updated = sessions.map((x) => (x.id === s.id ? s : x));
    onChange({ ...campaign, sessions: updated });
    setEditingSession(s);
  }

  function deleteSession(id: string) {
    const updated = sessions
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, number: i + 1 }));
    onChange({ ...campaign, sessions: updated });
    if (expandedId === id) setExpandedId(null);
    if (editingSession?.id === id) setEditingSession(null);
  }

  function toggleExpand(s: CampaignSession) {
    if (expandedId === s.id) {
      setExpandedId(null);
      setEditingSession(null);
    } else {
      setExpandedId(s.id);
      setEditingSession({ ...s });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Story overview */}
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "24px 28px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ color: ACCENT_LIGHT }}>📖</span> História da Campanha
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <label style={labelStyle}>Objetivo Principal</label>
            <textarea
              style={{ ...areaStyle, minHeight: 72 }}
              value={story.objective}
              onChange={(e) => updateStory({ objective: e.target.value })}
              placeholder="O que os heróis devem alcançar?"
            />
          </div>
          <div>
            <label style={labelStyle}>Propósito / Tema</label>
            <textarea
              style={{ ...areaStyle, minHeight: 72 }}
              value={story.purpose}
              onChange={(e) => updateStory({ purpose: e.target.value })}
              placeholder="Qual o tema central? Redenção, poder, sobrevivência..."
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>História Geral / Lore</label>
            <textarea
              style={{ ...areaStyle, minHeight: 120 }}
              value={story.generalHistory}
              onChange={(e) => updateStory({ generalHistory: e.target.value })}
              placeholder="Contexto do mundo, eventos passados, facções, segredos..."
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Arco Atual</label>
            <textarea
              style={{ ...areaStyle, minHeight: 80 }}
              value={story.currentArc}
              onChange={(e) => updateStory({ currentArc: e.target.value })}
              placeholder="O que está acontecendo agora na campanha?"
            />
          </div>
        </div>
      </section>

      {/* Sessions */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ color: ACCENT_LIGHT }}>🗓</span> Sessões
            {sessions.length > 0 && (
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: ACCENT_LIGHT,
                  background: ACCENT_DIM,
                  border: `1px solid ${ACCENT_BORD}`,
                  borderRadius: "var(--radius-xs)",
                  padding: "2px 8px",
                }}
              >
                {sessions.length}
              </span>
            )}
          </h2>
          <button
            onClick={addSession}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              background: `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`,
              color: "#06090f",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + Nova Sessão
          </button>
        </div>

        {sessions.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              background: "var(--surface)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Nenhuma sessão ainda. Clique em <strong>+ Nova Sessão</strong> para começar.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((s) => {
              const isOpen = expandedId === s.id;
              const editing = editingSession?.id === s.id ? editingSession : s;
              return (
                <div
                  key={s.id}
                  style={{
                    background: "var(--surface)",
                    border: `1px solid ${isOpen ? ACCENT_BORD : "var(--border)"}`,
                    borderRadius: "var(--radius-xl)",
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  {/* Header row */}
                  <button
                    onClick={() => toggleExpand(s)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 20px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius)",
                        background: ACCENT_DIM,
                        border: `1px solid ${ACCENT_BORD}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-cinzel), serif",
                        fontSize: "0.72rem",
                        fontWeight: 900,
                        color: ACCENT_LIGHT,
                        flexShrink: 0,
                      }}
                    >
                      {s.number}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          color: "var(--text)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.name || `Sessão ${s.number}`}
                      </p>
                      {s.objective && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginTop: 2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {s.objective}
                        </p>
                      )}
                    </div>
                    {s.sessionDate && (
                      <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)", flexShrink: 0 }}>
                        {s.sessionDate}
                      </span>
                    )}
                    <span
                      style={{
                        color: "var(--text-subtle)",
                        fontSize: "0.82rem",
                        flexShrink: 0,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.22s",
                      }}
                    >
                      ▾
                    </span>
                  </button>

                  {/* Expanded editor */}
                  {isOpen && editingSession && editingSession.id === s.id && (
                    <div
                      style={{
                        padding: "0 20px 20px",
                        borderTop: "1px solid var(--border)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                        paddingTop: 16,
                      }}
                    >
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                          <label style={labelStyle}>Nome da Sessão</label>
                          <input
                            style={inputStyle}
                            value={editingSession.name}
                            onChange={(e) => {
                              const upd = { ...editingSession, name: e.target.value };
                              setEditingSession(upd);
                              saveSession(upd);
                            }}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Data da Sessão</label>
                          <input
                            type="date"
                            style={inputStyle}
                            value={editingSession.sessionDate}
                            onChange={(e) => {
                              const upd = { ...editingSession, sessionDate: e.target.value };
                              setEditingSession(upd);
                              saveSession(upd);
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Objetivo da Sessão</label>
                        <textarea
                          style={{ ...areaStyle, minHeight: 60 }}
                          value={editingSession.objective}
                          onChange={(e) => {
                            const upd = { ...editingSession, objective: e.target.value };
                            setEditingSession(upd);
                            saveSession(upd);
                          }}
                          placeholder="O que os jogadores devem alcançar nesta sessão?"
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>O que vai acontecer / Roteiro</label>
                        <textarea
                          style={{ ...areaStyle, minHeight: 90 }}
                          value={editingSession.events}
                          onChange={(e) => {
                            const upd = { ...editingSession, events: e.target.value };
                            setEditingSession(upd);
                            saveSession(upd);
                          }}
                          placeholder="Encontros, NPCs, locais, eventos planejados..."
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Resumo (após a sessão)</label>
                        <textarea
                          style={{ ...areaStyle, minHeight: 80 }}
                          value={editingSession.summary}
                          onChange={(e) => {
                            const upd = { ...editingSession, summary: e.target.value };
                            setEditingSession(upd);
                            saveSession(upd);
                          }}
                          placeholder="O que aconteceu? Decisões importantes dos jogadores..."
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => deleteSession(s.id)}
                          style={{
                            padding: "7px 16px",
                            background: "rgba(220,60,60,0.1)",
                            border: "1px solid rgba(220,60,60,0.3)",
                            borderRadius: "var(--radius)",
                            color: "#e06c6c",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
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
