"use client";

import { useState } from "react";
import { type OrdemCampaign, type OrdemSanityRecord } from "@/lib/ordem/ordemCampaignStorage";

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

const STATUS_LABELS: Record<OrdemSanityRecord["status"], string> = {
  normal: "Estável",
  perturbado: "Perturbado",
  enlouquecido: "Enlouquecido",
};

const STATUS_COLORS: Record<OrdemSanityRecord["status"], string> = {
  normal: "#4ade80",
  perturbado: "#fbbf24",
  enlouquecido: "#f87171",
};

interface Props { campaign: OrdemCampaign; onChange: (c: OrdemCampaign) => void; }

function blank(): OrdemSanityRecord {
  return { id: crypto.randomUUID(), agentName: "", currentSan: 12, maxSan: 12, sessionLoss: 0, status: "normal", traumas: [], notes: "" };
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, display: "block",
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 11px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit",
};
const numStyle: React.CSSProperties = {
  width: 70, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit", textAlign: "center",
};

export function OrdemSanity({ campaign, onChange }: Props) {
  const records = campaign.sanityRecords ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [traumaInput, setTraumaInput] = useState("");

  function save(updated: OrdemSanityRecord[]) {
    onChange({ ...campaign, sanityRecords: updated });
  }

  function addRecord() {
    const r = blank();
    save([...records, r]);
    setExpandedId(r.id);
  }

  function removeRecord(id: string) {
    save(records.filter((r) => r.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function patchRecord(id: string, patch: Partial<OrdemSanityRecord>) {
    save(records.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function computeStatus(r: OrdemSanityRecord): OrdemSanityRecord["status"] {
    if (r.currentSan <= 0) return "enlouquecido";
    if (r.currentSan <= Math.floor(r.maxSan / 3)) return "perturbado";
    return "normal";
  }

  function adjustSan(id: string, delta: number) {
    const r = records.find((x) => x.id === id);
    if (!r) return;
    const next = Math.max(0, Math.min(r.maxSan, r.currentSan + delta));
    const lost = delta < 0 ? Math.abs(delta) : 0;
    const updated = { ...r, currentSan: next, sessionLoss: r.sessionLoss + lost };
    updated.status = computeStatus(updated);
    save(records.map((x) => (x.id === id ? updated : x)));
  }

  function resetSessionLoss(id: string) {
    patchRecord(id, { sessionLoss: 0 });
  }

  function addTrauma(id: string, value: string) {
    const v = value.trim();
    if (!v) return;
    const r = records.find((x) => x.id === id);
    if (!r || r.traumas.includes(v)) return;
    patchRecord(id, { traumas: [...r.traumas, v] });
  }

  function removeTrauma(id: string, value: string) {
    const r = records.find((x) => x.id === id);
    if (!r) return;
    patchRecord(id, { traumas: r.traumas.filter((t) => t !== value) });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: AL }}>🧠</span> Rastreador de Sanidade
            {records.length > 0 && (
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: AL, background: AD, border: `1px solid ${AB}`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>
                {records.length}
              </span>
            )}
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
            SAN baixa: agente perturbado · SAN 0: enlouquece e vira NPC do Mestre
          </p>
        </div>
        <button onClick={addRecord} style={{ padding: "8px 18px", background: `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)`, color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
          + Agente
        </button>
      </div>

      {records.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-xl)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Nenhum agente rastreado. Clique em <strong>+ Agente</strong> para começar.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {records.map((r) => {
            const isOpen = expandedId === r.id;
            const sanPct = r.maxSan > 0 ? Math.round((r.currentSan / r.maxSan) * 100) : 0;
            const statusColor = STATUS_COLORS[r.status];

            return (
              <div key={r.id} style={{ background: "var(--surface)", border: `1px solid ${isOpen ? AB : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
                {/* Row header */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px" }}>
                  <button onClick={() => setExpandedId(isOpen ? null : r.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", fontSize: "0.82rem", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    ▾
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.agentName || "Agente sem nome"}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                      {r.traumas.length > 0 ? `${r.traumas.length} trauma(s)` : "Sem traumas"}
                    </p>
                  </div>

                  {/* SAN bar */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => adjustSan(r.id, -1)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", cursor: "pointer", fontSize: "0.9rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", minWidth: 60, textAlign: "center" }}>{r.currentSan}/{r.maxSan} SAN</span>
                      <button onClick={() => adjustSan(r.id, 1)} style={{ width: 22, height: 22, borderRadius: "50%", background: AD, border: `1px solid ${AB}`, color: AL, cursor: "pointer", fontSize: "0.9rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                    <div style={{ width: 120, height: 5, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${sanPct}%`, height: "100%", background: sanPct > 50 ? "#4ade80" : sanPct > 25 ? "#fbbf24" : "#f87171", borderRadius: 3, transition: "width 0.3s" }} />
                    </div>
                  </div>

                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: statusColor, background: `${statusColor}22`, border: `1px solid ${statusColor}44`, borderRadius: "var(--radius-xs)", padding: "3px 10px", flexShrink: 0 }}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>

                {/* Expanded editor */}
                {isOpen && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Nome do Agente</label>
                        <input style={inputStyle} value={r.agentName} onChange={(e) => patchRecord(r.id, { agentName: e.target.value })} placeholder="Nome..." />
                      </div>
                      <div>
                        <label style={labelStyle}>SAN Atual</label>
                        <input type="number" style={numStyle} value={r.currentSan} min={0} max={r.maxSan}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(r.maxSan, Number(e.target.value)));
                            const lost = val < r.currentSan ? r.sessionLoss + (r.currentSan - val) : r.sessionLoss;
                            const updated = { ...r, currentSan: val, sessionLoss: lost };
                            updated.status = computeStatus(updated);
                            save(records.map((x) => (x.id === r.id ? updated : x)));
                          }}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>SAN Máxima</label>
                        <input type="number" style={numStyle} value={r.maxSan} min={1}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value));
                            const updated = { ...r, maxSan: val, currentSan: Math.min(r.currentSan, val) };
                            updated.status = computeStatus(updated);
                            save(records.map((x) => (x.id === r.id ? updated : x)));
                          }}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Perda na Sessão</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ ...numStyle, width: 50 }}>{r.sessionLoss}</span>
                          <button onClick={() => resetSessionLoss(r.id)} title="Resetar para nova sessão" style={{ padding: "6px 8px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.7rem" }}>↺</button>
                        </div>
                      </div>
                    </div>

                    {/* Status override */}
                    <div>
                      <label style={labelStyle}>Estado Mental</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["normal", "perturbado", "enlouquecido"] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => patchRecord(r.id, { status: s })}
                            style={{
                              padding: "6px 14px", borderRadius: "var(--radius)", border: `1px solid ${r.status === s ? STATUS_COLORS[s] : "var(--border)"}`,
                              background: r.status === s ? `${STATUS_COLORS[s]}22` : "transparent",
                              color: r.status === s ? STATUS_COLORS[s] : "var(--text-muted)", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700,
                            }}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Traumas */}
                    <div>
                      <label style={labelStyle}>Traumas</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {r.traumas.map((t) => (
                          <span key={t} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.28)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", color: "#fca5a5" }}>
                            {t}
                            <button onClick={() => removeTrauma(r.id, t)} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1, padding: 0 }}>×</button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <select
                          value=""
                          onChange={(e) => { addTrauma(r.id, e.target.value); }}
                          style={{ flex: 1, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.82rem" }}
                        >
                          <option value="">Escolher trauma...</option>
                          {TRAUMAS.filter((t) => !r.traumas.includes(t)).map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input
                          value={traumaInput}
                          onChange={(e) => setTraumaInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { addTrauma(r.id, traumaInput); setTraumaInput(""); } }}
                          placeholder="Trauma personalizado..."
                          style={{ ...inputStyle, width: 180 }}
                        />
                        <button onClick={() => { addTrauma(r.id, traumaInput); setTraumaInput(""); }} style={{ padding: "7px 14px", background: AD, border: `1px solid ${AB}`, borderRadius: "var(--radius)", color: AL, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>+</button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label style={labelStyle}>Notas de Sanidade</label>
                      <textarea
                        value={r.notes}
                        onChange={(e) => patchRecord(r.id, { notes: e.target.value })}
                        placeholder="Episódios, gatilhos, observações sobre o estado mental..."
                        style={{ width: "100%", padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", lineHeight: 1.6, resize: "vertical", minHeight: 80, boxSizing: "border-box", fontFamily: "inherit" }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button onClick={() => removeRecord(r.id)} style={{ padding: "7px 16px", background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: "var(--radius)", color: "#e06c6c", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
                        Remover Agente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reference card */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "20px 24px" }}>
        <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem", fontWeight: 700, color: AL, marginBottom: 14 }}>
          Referência Rápida — Sanidade em Ordem Paranormal
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Perda de Sanidade</p>
            <p>Encontros com o Paranormal, rituais e horrores do Outro Lado custam SAN. O Mestre define a perda conforme a intensidade da exposição.</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Agente Perturbado</p>
            <p>Com SAN baixa, o agente pode sofrer penalidades, surtos e desenvolver traumas que afetam testes em situações de estresse.</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>SAN 0</p>
            <p>O agente enlouquece e fica fora do controle do jogador, tornando-se um NPC do Mestre. Recuperar exige tratamento longo.</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Recuperação</p>
            <p>SAN é recuperada com descanso prolongado entre missões e cuidado adequado. Confrontar e superar um trauma também pode restaurar Sanidade.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
