"use client";

import { useState } from "react";
import type { OperacaoApi } from "@/lib/ordem/useOperacao";
import type { OrdemSanityRecord } from "@/lib/ordem/ordemCampaignClient";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

const TRAUMAS = [
  "Flashbacks do evento traumático", "Paranoia constante", "Insônia severa",
  "Pavor do escuro", "Pavor de sangue", "Compulsão por verificar tudo",
  "Mutismo seletivo sob estresse", "Crises de pânico", "Dissociação da realidade",
  "Obsessão por símbolos do Outro Lado", "Agressividade descontrolada",
  "Negação compulsiva do paranormal", "Fobia de multidões", "Automutilação ritual",
  "Visões e alucinações", "Fé fanática em uma entidade",
];

type Status = OrdemSanityRecord["status"];
const STATUS_LABELS: Record<Status, string> = { normal: "Estável", perturbado: "Perturbado", enlouquecido: "Enlouquecido" };
const STATUS_COLORS: Record<Status, string> = { normal: "#4ade80", perturbado: "#fbbf24", enlouquecido: "#f87171" };

const labelStyle: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, display: "block" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 11px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit" };
const numStyle: React.CSSProperties = { width: 70, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit", textAlign: "center" };

function parseTraumas(json: string): string[] {
  try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; }
}
function computeStatus(currentSan: number, maxSan: number): Status {
  if (currentSan <= 0) return "enlouquecido";
  if (currentSan <= Math.floor(maxSan / 3)) return "perturbado";
  return "normal";
}

export function OrdemSanity({ api }: { api: OperacaoApi }) {
  const records = api.campaign.ordemSanity;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [traumaInput, setTraumaInput] = useState("");

  async function addRecord() {
    const r = await api.addChild<OrdemSanityRecord>("sanity", { agentName: "", currentSan: 12, maxSan: 12 });
    setExpandedId(r.id);
  }
  function removeRecord(id: string) { api.removeChild("sanity", id); if (expandedId === id) setExpandedId(null); }
  function patch(id: string, p: Partial<OrdemSanityRecord>) { api.editChild("sanity", id, p as Record<string, unknown>); }

  function adjustSan(r: OrdemSanityRecord, delta: number) {
    const next = Math.max(0, Math.min(r.maxSan, r.currentSan + delta));
    const lost = delta < 0 ? Math.abs(delta) : 0;
    patch(r.id, { currentSan: next, sessionLoss: r.sessionLoss + lost, status: computeStatus(next, r.maxSan) });
  }
  function setTraumas(r: OrdemSanityRecord, list: string[]) { patch(r.id, { traumas: JSON.stringify(list) }); }
  function addTrauma(r: OrdemSanityRecord, value: string) {
    const v = value.trim(); if (!v) return;
    const cur = parseTraumas(r.traumas); if (cur.includes(v)) return;
    setTraumas(r, [...cur, v]);
  }
  function removeTrauma(r: OrdemSanityRecord, value: string) { setTraumas(r, parseTraumas(r.traumas).filter((t) => t !== value)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: AL }}>🧠</span> Rastreador de Sanidade
            {records.length > 0 && <span style={{ fontSize: "0.72rem", fontWeight: 700, color: AL, background: AD, border: `1px solid ${AB}`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>{records.length}</span>}
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
            SAN baixa: agente perturbado · SAN 0: enlouquece e vira NPC do Mestre. Importe agentes pela aba Ordem de Ação.
          </p>
        </div>
        <button onClick={addRecord} style={{ padding: "8px 18px", background: `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)`, color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>+ Agente</button>
      </div>

      {records.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-xl)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhum agente rastreado. Clique em <strong>+ Agente</strong>.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {records.map((r) => {
            const isOpen = expandedId === r.id;
            const sanPct = r.maxSan > 0 ? Math.round((r.currentSan / r.maxSan) * 100) : 0;
            const statusColor = STATUS_COLORS[r.status];
            const traumas = parseTraumas(r.traumas);
            return (
              <div key={r.id} style={{ background: "var(--surface)", border: `1px solid ${isOpen ? AB : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px" }}>
                  <button onClick={() => setExpandedId(isOpen ? null : r.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", fontSize: "0.82rem", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.agentName || "Agente sem nome"}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{traumas.length > 0 ? `${traumas.length} trauma(s)` : "Sem traumas"}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => adjustSan(r, -1)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", cursor: "pointer", fontSize: "0.9rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", minWidth: 60, textAlign: "center" }}>{r.currentSan}/{r.maxSan} SAN</span>
                      <button onClick={() => adjustSan(r, 1)} style={{ width: 22, height: 22, borderRadius: "50%", background: AD, border: `1px solid ${AB}`, color: AL, cursor: "pointer", fontSize: "0.9rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                    <div style={{ width: 120, height: 5, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${sanPct}%`, height: "100%", background: sanPct > 50 ? "#4ade80" : sanPct > 25 ? "#fbbf24" : "#f87171", borderRadius: 3, transition: "width 0.3s" }} />
                    </div>
                  </div>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: statusColor, background: `${statusColor}22`, border: `1px solid ${statusColor}44`, borderRadius: "var(--radius-xs)", padding: "3px 10px", flexShrink: 0 }}>{STATUS_LABELS[r.status]}</span>
                </div>

                {isOpen && (
                  <SanityEditor r={r} traumas={traumas}
                    onPatch={(p) => patch(r.id, p)}
                    onAddTrauma={(v) => addTrauma(r, v)} onRemoveTrauma={(v) => removeTrauma(r, v)}
                    onRemove={() => removeRecord(r.id)}
                    traumaInput={traumaInput} setTraumaInput={setTraumaInput} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "20px 24px" }}>
        <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem", fontWeight: 700, color: AL, marginBottom: 14 }}>Referência Rápida — Sanidade</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          <div><p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Perda de Sanidade</p><p>Encontros com o Paranormal, rituais e horrores do Outro Lado custam SAN.</p></div>
          <div><p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Agente Perturbado</p><p>Com SAN baixa, o agente sofre surtos e desenvolve traumas (Tabela 5.1).</p></div>
          <div><p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>SAN 0</p><p>O agente enlouquece e vira NPC do Mestre. Recuperar exige tratamento longo.</p></div>
          <div><p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Recuperação</p><p>SAN recupera com descanso entre missões e superação de traumas.</p></div>
        </div>
      </section>
    </div>
  );
}

function SanityEditor({ r, traumas, onPatch, onAddTrauma, onRemoveTrauma, onRemove, traumaInput, setTraumaInput }: {
  r: OrdemSanityRecord; traumas: string[];
  onPatch: (p: Partial<OrdemSanityRecord>) => void;
  onAddTrauma: (v: string) => void; onRemoveTrauma: (v: string) => void; onRemove: () => void;
  traumaInput: string; setTraumaInput: (v: string) => void;
}) {
  const [name, setName] = useState(r.agentName);
  const [notes, setNotes] = useState(r.notes);
  return (
    <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Nome do Agente</label>
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} onBlur={(e) => onPatch({ agentName: e.target.value })} placeholder="Nome..." />
        </div>
        <div>
          <label style={labelStyle}>SAN Atual</label>
          <input type="number" style={numStyle} value={r.currentSan} min={0} max={r.maxSan}
            onChange={(e) => { const v = Math.max(0, Math.min(r.maxSan, Number(e.target.value))); onPatch({ currentSan: v, status: computeStatus(v, r.maxSan) }); }} />
        </div>
        <div>
          <label style={labelStyle}>SAN Máxima</label>
          <input type="number" style={numStyle} value={r.maxSan} min={1}
            onChange={(e) => { const v = Math.max(1, Number(e.target.value)); onPatch({ maxSan: v, currentSan: Math.min(r.currentSan, v), status: computeStatus(Math.min(r.currentSan, v), v) }); }} />
        </div>
        <div>
          <label style={labelStyle}>Perda na Sessão</label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ ...numStyle, width: 50 }}>{r.sessionLoss}</span>
            <button onClick={() => onPatch({ sessionLoss: 0 })} title="Resetar" style={{ padding: "6px 8px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.7rem" }}>↺</button>
          </div>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Estado Mental</label>
        <div style={{ display: "flex", gap: 8 }}>
          {(["normal", "perturbado", "enlouquecido"] as const).map((s) => (
            <button key={s} onClick={() => onPatch({ status: s })}
              style={{ padding: "6px 14px", borderRadius: "var(--radius)", border: `1px solid ${r.status === s ? STATUS_COLORS[s] : "var(--border)"}`, background: r.status === s ? `${STATUS_COLORS[s]}22` : "transparent", color: r.status === s ? STATUS_COLORS[s] : "var(--text-muted)", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Traumas</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {traumas.map((t) => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.28)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", color: "#fca5a5" }}>
              {t}<button onClick={() => onRemoveTrauma(t)} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1, padding: 0 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value="" onChange={(e) => onAddTrauma(e.target.value)} style={{ flex: 1, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.82rem" }}>
            <option value="">Escolher trauma...</option>
            {TRAUMAS.filter((t) => !traumas.includes(t)).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={traumaInput} onChange={(e) => setTraumaInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { onAddTrauma(traumaInput); setTraumaInput(""); } }} placeholder="Trauma personalizado..." style={{ ...inputStyle, width: 180 }} />
          <button onClick={() => { onAddTrauma(traumaInput); setTraumaInput(""); }} style={{ padding: "7px 14px", background: AD, border: `1px solid ${AB}`, borderRadius: "var(--radius)", color: AL, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>+</button>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Notas de Sanidade</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={(e) => onPatch({ notes: e.target.value })} placeholder="Episódios, gatilhos, observações..." style={{ width: "100%", padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", lineHeight: 1.6, resize: "vertical", minHeight: 80, boxSizing: "border-box", fontFamily: "inherit" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onRemove} style={{ padding: "7px 16px", background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: "var(--radius)", color: "#e06c6c", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>Remover Agente</button>
      </div>
    </div>
  );
}
