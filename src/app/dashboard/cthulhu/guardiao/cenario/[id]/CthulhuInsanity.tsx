"use client";

import { useState } from "react";
import { type CthulhuCampaign, type CthulhuInsanityRecord } from "@/lib/cthulhu/cthulhuCampaignStorage";

const G = "#7d9c3e";
const GL = "#a3b86c";
const GD = "rgba(125,156,62,0.14)";
const GB = "rgba(125,156,62,0.32)";

const PHOBIAS = [
  "Acrofobia (alturas)", "Agorafobia (espaços abertos)", "Aracnofobia (aranhas)",
  "Claustrofobia (espaços fechados)", "Cinofobia (cães)", "Coulrofobia (palhaços)",
  "Entomofobia (insetos)", "Hematofobia (sangue)", "Hidrofobia (água profunda)",
  "Misofobia (germes/sujeira)", "Necrofobia (cadáveres)", "Noctifobia (escuridão)",
  "Nyctofobia (noite)", "Ofidiofobia (cobras)", "Talassofobia (oceano profundo)",
  "Xenofobia (estranhos/alienígenas)", "Algofobia (dor)", "Batofobia (profundidades)",
  "Criofobia (frio extremo)", "Limnofobia (lagos e pântanos)", "Medo de fogo",
  "Medo de sons estranhos", "Medo de livros estranhos", "Medo de símbolos do Mythos",
];

const MANIAS = [
  "Ablutomania (lavagem compulsiva)", "Aritmomania (contar objetos)", "Bibliofilia (coletar livros)",
  "Cleptomania (roubar)", "Dipsomania (beber álcool)", "Erotofobia (evitar intimidade)",
  "Fascínio por fogo", "Fascínio por símbolos ocultos", "Fascínio por mapas antigos",
  "Germofobia compulsiva", "Grafofilia (escrever compulsivamente)", "Hipocondria",
  "Jogar compulsivamente", "Misantropia (evitar humanos)", "Obsessão por datas e horários",
  "Obsessão por um Grande Antigo específico", "Paranoia generalizada",
  "Sadismo (prazer em causar dor)", "Taciturnia (silêncio absoluto)", "Xenofilia (fascínio por estranhos)",
];

const STATUS_LABELS: Record<CthulhuInsanityRecord["status"], string> = {
  normal: "Normal",
  temp_insane: "Temp. Insano",
  indef_insane: "Indef. Insano",
};

const STATUS_COLORS: Record<CthulhuInsanityRecord["status"], string> = {
  normal: G,
  temp_insane: "#fbbf24",
  indef_insane: "#f87171",
};

interface Props { campaign: CthulhuCampaign; onChange: (c: CthulhuCampaign) => void; }

function blank(): CthulhuInsanityRecord {
  return {
    id: crypto.randomUUID(),
    investigatorName: "",
    currentSan: 50,
    maxSan: 50,
    sessionLoss: 0,
    status: "normal",
    phobias: [],
    manias: [],
    notes: "",
  };
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)",
  letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 11px", background: "var(--surface-2)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)",
  color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit",
};

const numStyle: React.CSSProperties = {
  width: 70, padding: "8px 10px", background: "var(--surface-2)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)",
  color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box",
  fontFamily: "inherit", textAlign: "center",
};

export function CthulhuInsanity({ campaign, onChange }: Props) {
  const records = campaign.insanityRecords ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [phobiaInput, setPhobiaInput] = useState("");
  const [maniaInput, setManiaInput] = useState("");

  function save(updated: CthulhuInsanityRecord[]) {
    onChange({ ...campaign, insanityRecords: updated });
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

  function patchRecord(id: string, patch: Partial<CthulhuInsanityRecord>) {
    save(records.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function computeStatus(r: CthulhuInsanityRecord): CthulhuInsanityRecord["status"] {
    if (r.sessionLoss >= Math.floor(r.maxSan / 5)) return "indef_insane";
    if (r.sessionLoss >= 5) return "temp_insane";
    return "normal";
  }

  function adjustSan(id: string, delta: number) {
    const r = records.find((x) => x.id === id);
    if (!r) return;
    const prev = r.currentSan;
    const next = Math.max(0, Math.min(r.maxSan, prev + delta));
    const lost = delta < 0 ? Math.abs(delta) : 0;
    const newLoss = r.sessionLoss + lost;
    const updated = { ...r, currentSan: next, sessionLoss: newLoss };
    updated.status = computeStatus(updated);
    save(records.map((x) => (x.id === id ? updated : x)));
  }

  function resetSessionLoss(id: string) {
    const r = records.find((x) => x.id === id);
    if (!r) return;
    const updated = { ...r, sessionLoss: 0, status: computeStatus({ ...r, sessionLoss: 0 }) };
    save(records.map((x) => (x.id === id ? updated : x)));
  }

  function addTag(id: string, field: "phobias" | "manias", value: string) {
    const v = value.trim();
    if (!v) return;
    const r = records.find((x) => x.id === id);
    if (!r || r[field].includes(v)) return;
    patchRecord(id, { [field]: [...r[field], v] });
  }

  function removeTag(id: string, field: "phobias" | "manias", value: string) {
    const r = records.find((x) => x.id === id);
    if (!r) return;
    patchRecord(id, { [field]: r[field].filter((t) => t !== value) });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: GL }}>🧠</span> Rastreador de Insanidade
            {records.length > 0 && (
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: GL, background: GD, border: `1px solid ${GB}`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>
                {records.length}
              </span>
            )}
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>
            Temp. insano: perde 5+ SAN em 1 rolagem · Indef. insano: perde SAN/5 em 1 sessão
          </p>
        </div>
        <button
          onClick={addRecord}
          style={{ padding: "8px 18px", background: `linear-gradient(135deg, ${GL} 0%, ${G} 100%)`, color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
        >
          + Investigador
        </button>
      </div>

      {records.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-xl)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Nenhum investigador rastreado. Clique em <strong>+ Investigador</strong> para começar.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {records.map((r) => {
            const isOpen = expandedId === r.id;
            const sanPct = r.maxSan > 0 ? Math.round((r.currentSan / r.maxSan) * 100) : 0;
            const indefiniteThreshold = Math.floor(r.maxSan / 5);
            const statusColor = STATUS_COLORS[r.status];

            return (
              <div
                key={r.id}
                style={{ background: "var(--surface)", border: `1px solid ${isOpen ? GB : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}
              >
                {/* Row header */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px" }}>
                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedId(isOpen ? null : r.id)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", fontSize: "0.82rem", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  >
                    ▾
                  </button>

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.investigatorName || "Investigador sem nome"}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                      {r.phobias.length > 0 && `${r.phobias.length} fobia(s)`}
                      {r.phobias.length > 0 && r.manias.length > 0 && " · "}
                      {r.manias.length > 0 && `${r.manias.length} mania(s)`}
                    </p>
                  </div>

                  {/* SAN bar */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => adjustSan(r.id, -1)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", cursor: "pointer", fontSize: "0.9rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", minWidth: 60, textAlign: "center" }}>{r.currentSan}/{r.maxSan} SAN</span>
                      <button onClick={() => adjustSan(r.id, 1)} style={{ width: 22, height: 22, borderRadius: "50%", background: GD, border: `1px solid ${GB}`, color: GL, cursor: "pointer", fontSize: "0.9rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                    <div style={{ width: 120, height: 5, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${sanPct}%`, height: "100%", background: sanPct > 50 ? GL : sanPct > 25 ? "#fbbf24" : "#f87171", borderRadius: 3, transition: "width 0.3s" }} />
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: statusColor, background: `${statusColor}22`, border: `1px solid ${statusColor}44`, borderRadius: "var(--radius-xs)", padding: "3px 10px", flexShrink: 0 }}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>

                {/* Expanded editor */}
                {isOpen && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Name + SAN fields */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Nome do Investigador</label>
                        <input style={inputStyle} value={r.investigatorName} onChange={(e) => patchRecord(r.id, { investigatorName: e.target.value })} placeholder="Nome..." />
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
                        <input type="number" style={numStyle} value={r.maxSan} min={1} max={99}
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
                          <span style={{ ...numStyle, width: 50, color: r.sessionLoss >= indefiniteThreshold ? "#f87171" : "var(--text)" }}>
                            {r.sessionLoss}
                          </span>
                          <button onClick={() => resetSessionLoss(r.id)} title="Resetar para nova sessão" style={{ padding: "6px 8px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.7rem" }}>↺</button>
                        </div>
                      </div>
                    </div>

                    {/* Indefinite threshold info */}
                    <div style={{ padding: "10px 14px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "var(--radius)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Limiar de insanidade indefinida: <strong style={{ color: r.sessionLoss >= indefiniteThreshold ? "#f87171" : "var(--text)" }}>{indefiniteThreshold} pontos por sessão</strong>
                      {r.sessionLoss >= indefiniteThreshold && <span style={{ color: "#f87171", marginLeft: 8 }}>— LIMITE ATINGIDO</span>}
                    </div>

                    {/* Status override */}
                    <div>
                      <label style={labelStyle}>Estado Mental</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["normal", "temp_insane", "indef_insane"] as const).map((s) => (
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

                    {/* Phobias */}
                    <div>
                      <label style={labelStyle}>Fobias</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {r.phobias.map((p) => (
                          <span key={p} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.28)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", color: "#fca5a5" }}>
                            {p}
                            <button onClick={() => removeTag(r.id, "phobias", p)} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1, padding: 0 }}>×</button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <select
                          value=""
                          onChange={(e) => { addTag(r.id, "phobias", e.target.value); }}
                          style={{ flex: 1, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.82rem" }}
                        >
                          <option value="">Escolher fobia...</option>
                          {PHOBIAS.filter((p) => !r.phobias.includes(p)).map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <input
                          value={phobiaInput}
                          onChange={(e) => setPhobiaInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { addTag(r.id, "phobias", phobiaInput); setPhobiaInput(""); } }}
                          placeholder="Fobia personalizada..."
                          style={{ ...inputStyle, width: 180 }}
                        />
                        <button onClick={() => { addTag(r.id, "phobias", phobiaInput); setPhobiaInput(""); }} style={{ padding: "7px 14px", background: GD, border: `1px solid ${GB}`, borderRadius: "var(--radius)", color: GL, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>+</button>
                      </div>
                    </div>

                    {/* Manias */}
                    <div>
                      <label style={labelStyle}>Manias</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {r.manias.map((m) => (
                          <span key={m} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.28)", borderRadius: "var(--radius-xs)", fontSize: "0.75rem", color: "#fde68a" }}>
                            {m}
                            <button onClick={() => removeTag(r.id, "manias", m)} style={{ background: "transparent", border: "none", color: "#fbbf24", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1, padding: 0 }}>×</button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <select
                          value=""
                          onChange={(e) => { addTag(r.id, "manias", e.target.value); }}
                          style={{ flex: 1, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.82rem" }}
                        >
                          <option value="">Escolher mania...</option>
                          {MANIAS.filter((m) => !r.manias.includes(m)).map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input
                          value={maniaInput}
                          onChange={(e) => setManiaInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { addTag(r.id, "manias", maniaInput); setManiaInput(""); } }}
                          placeholder="Mania personalizada..."
                          style={{ ...inputStyle, width: 180 }}
                        />
                        <button onClick={() => { addTag(r.id, "manias", maniaInput); setManiaInput(""); }} style={{ padding: "7px 14px", background: GD, border: `1px solid ${GB}`, borderRadius: "var(--radius)", color: GL, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>+</button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label style={labelStyle}>Notas de Insanidade</label>
                      <textarea
                        value={r.notes}
                        onChange={(e) => patchRecord(r.id, { notes: e.target.value })}
                        placeholder="Episódios, traumas, observações sobre o estado mental..."
                        style={{ width: "100%", padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", lineHeight: 1.6, resize: "vertical", minHeight: 80, boxSizing: "border-box", fontFamily: "inherit" }}
                      />
                    </div>

                    {/* Delete */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => removeRecord(r.id)}
                        style={{ padding: "7px 16px", background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: "var(--radius)", color: "#e06c6c", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        Remover Investigador
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
        <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem", fontWeight: 700, color: GL, marginBottom: 14 }}>
          Referência Rápida — Regras de Sanidade CoC 7e
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Insanidade Temporária</p>
            <p>Perde 5+ SAN em 1 único rolamento. Dura 1d10 rodadas (combate) ou 1d10 horas (exploração). Guardião escolhe uma reação: fuga, ataque, paralisia, histeria, etc.</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Insanidade Indefinida</p>
            <p>Perde SAN/5 em uma única sessão. O investigador adquire uma fobia ou mania permanente. Recuperação requer tratamento profissional (psicoterapia).</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>SAN 0</p>
            <p>Investigador se torna um NPJ insano permanente. Pode ser reabilitado com cuidados extremos, mas raramente volta ao jogo ativo.</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Recuperação</p>
            <p>Psicoterapia bem-sucedida restaura 1d3 SAN por sessão. SAN máxima = 99 − Cthulhu Mythos%. Confrontar o próprio medo: +1 SAN se bem-sucedido.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
