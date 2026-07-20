"use client";

import { useState } from "react";
import type { CthulhuApi } from "@/lib/cthulhu/useCthulhuCampaign";
import type { CthulhuInsanityRecord } from "@/lib/cthulhu/cthulhuCampaignClient";

const G = "#7d9c3e";
const GL = "#a3b86c";
const GD = "rgba(125,156,62,0.14)";
const GB = "rgba(125,156,62,0.32)";

const PHOBIAS = [
  "Acrofobia (alturas)", "Agorafobia (espaços abertos)", "Aracnofobia (aranhas)",
  "Claustrofobia (espaços fechados)", "Cinofobia (cães)", "Coulrofobia (palhaços)",
  "Entomofobia (insetos)", "Hematofobia (sangue)", "Hidrofobia (água profunda)",
  "Misofobia (germes/sujeira)", "Necrofobia (cadáveres)", "Noctifobia (escuridão)",
  "Ofidiofobia (cobras)", "Talassofobia (oceano profundo)", "Xenofobia (estranhos)",
  "Batofobia (profundidades)", "Medo de fogo", "Medo de símbolos do Mythos",
];
const MANIAS = [
  "Ablutomania (lavagem compulsiva)", "Aritmomania (contar objetos)", "Bibliofilia (coletar livros)",
  "Cleptomania (roubar)", "Dipsomania (beber álcool)", "Fascínio por fogo",
  "Fascínio por símbolos ocultos", "Grafomania (escrever compulsivamente)", "Hipocondria",
  "Misantropia (evitar humanos)", "Obsessão por um Grande Antigo", "Paranoia generalizada",
  "Sadismo", "Taciturnia (silêncio absoluto)", "Xenofilia (fascínio por estranhos)",
];

type Status = CthulhuInsanityRecord["status"];
const STATUS_LABELS: Record<Status, string> = { normal: "Normal", temp_insane: "Temp. Insano", indef_insane: "Indef. Insano" };
const STATUS_COLORS: Record<Status, string> = { normal: G, temp_insane: "#fbbf24", indef_insane: "#f87171" };

const labelStyle: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, display: "block" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 11px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit" };
const numStyle: React.CSSProperties = { width: 70, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", boxSizing: "border-box", fontFamily: "inherit", textAlign: "center" };

function parseTags(json: string): string[] { try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; } }
// Indefinida: perdeu 1/5+ da SAN que tinha no início da sessão (não da SAN máxima).
function computeStatus(sessionLoss: number, sanAtSessionStart: number): Status {
  if (sessionLoss >= Math.floor(sanAtSessionStart / 5)) return "indef_insane";
  if (sessionLoss >= 5) return "temp_insane";
  return "normal";
}

export function CthulhuInsanity({ api }: { api: CthulhuApi }) {
  const records = api.campaign.cthulhuInsanity;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [phobiaInput, setPhobiaInput] = useState("");
  const [maniaInput, setManiaInput] = useState("");

  async function addRecord() {
    const r = await api.addChild<CthulhuInsanityRecord>("insanity", { investigatorName: "", currentSan: 50, maxSan: 50 });
    setExpandedId(r.id);
  }
  function removeRecord(id: string) { api.removeChild("insanity", id); if (expandedId === id) setExpandedId(null); }
  function patch(id: string, p: Partial<CthulhuInsanityRecord>) { api.editChild("insanity", id, p as Record<string, unknown>); }

  function adjustSan(r: CthulhuInsanityRecord, delta: number) {
    const next = Math.max(0, Math.min(r.maxSan, r.currentSan + delta));
    const lost = delta < 0 ? Math.abs(delta) : 0;
    const newLoss = r.sessionLoss + lost;
    const sanAtSessionStart = r.currentSan + r.sessionLoss;
    patch(r.id, { currentSan: next, sessionLoss: newLoss, status: computeStatus(newLoss, sanAtSessionStart) });
  }
  function setTags(r: CthulhuInsanityRecord, field: "phobias" | "manias", list: string[]) { patch(r.id, { [field]: JSON.stringify(list) }); }
  function addTag(r: CthulhuInsanityRecord, field: "phobias" | "manias", value: string) {
    const v = value.trim(); if (!v) return;
    const cur = parseTags(r[field]); if (cur.includes(v)) return;
    setTags(r, field, [...cur, v]);
  }
  function removeTag(r: CthulhuInsanityRecord, field: "phobias" | "manias", value: string) { setTags(r, field, parseTags(r[field]).filter((t) => t !== value)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: GL }}>🧠</span> Rastreador de Insanidade
            {records.length > 0 && <span style={{ fontSize: "0.72rem", fontWeight: 700, color: GL, background: GD, border: `1px solid ${GB}`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>{records.length}</span>}
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>Temp. insano: perde 5+ SAN numa rolagem · Indef.: perde SAN/5 numa sessão. Importe investigadores pela aba Ordem de Ação.</p>
        </div>
        <button onClick={addRecord} style={{ padding: "8px 18px", background: `linear-gradient(135deg, ${GL} 0%, ${G} 100%)`, color: "#06090f", border: "none", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>+ Investigador</button>
      </div>

      {records.length === 0 ? (
        <div style={{ padding: "48px 24px", textAlign: "center", background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "var(--radius-xl)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhum investigador rastreado. Clique em <strong>+ Investigador</strong>.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {records.map((r) => {
            const isOpen = expandedId === r.id;
            const sanPct = r.maxSan > 0 ? Math.round((r.currentSan / r.maxSan) * 100) : 0;
            const statusColor = STATUS_COLORS[r.status];
            const phobias = parseTags(r.phobias), manias = parseTags(r.manias);
            return (
              <div key={r.id} style={{ background: "var(--surface)", border: `1px solid ${isOpen ? GB : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px" }}>
                  <button onClick={() => setExpandedId(isOpen ? null : r.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-subtle)", fontSize: "0.82rem", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.investigatorName || "Investigador sem nome"}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{phobias.length > 0 && `${phobias.length} fobia(s)`}{phobias.length > 0 && manias.length > 0 && " · "}{manias.length > 0 && `${manias.length} mania(s)`}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => adjustSan(r, -1)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", cursor: "pointer", fontSize: "0.9rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", minWidth: 60, textAlign: "center" }}>{r.currentSan}/{r.maxSan} SAN</span>
                      <button onClick={() => adjustSan(r, 1)} style={{ width: 22, height: 22, borderRadius: "50%", background: GD, border: `1px solid ${GB}`, color: GL, cursor: "pointer", fontSize: "0.9rem", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    </div>
                    <div style={{ width: 120, height: 5, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${sanPct}%`, height: "100%", background: sanPct > 50 ? GL : sanPct > 25 ? "#fbbf24" : "#f87171", borderRadius: 3, transition: "width 0.3s" }} /></div>
                  </div>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: statusColor, background: `${statusColor}22`, border: `1px solid ${statusColor}44`, borderRadius: "var(--radius-xs)", padding: "3px 10px", flexShrink: 0 }}>{STATUS_LABELS[r.status]}</span>
                </div>

                {isOpen && (
                  <InsanityEditor r={r} phobias={phobias} manias={manias}
                    onPatch={(p) => patch(r.id, p)} onAddTag={(f, v) => addTag(r, f, v)} onRemoveTag={(f, v) => removeTag(r, f, v)} onRemove={() => removeRecord(r.id)}
                    phobiaInput={phobiaInput} setPhobiaInput={setPhobiaInput} maniaInput={maniaInput} setManiaInput={setManiaInput} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "20px 24px" }}>
        <h3 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.85rem", fontWeight: 700, color: GL, marginBottom: 14 }}>Referência Rápida — Sanidade CoC 7e</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
          <div><p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Insanidade Temporária</p><p>Perde 5+ SAN numa rolagem. Dura 1d10 rodadas/horas. Reação à escolha do Guardião.</p></div>
          <div><p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Insanidade Indefinida</p><p>Perde SAN/5 numa sessão. Adquire fobia ou mania. Recuperação por psicoterapia.</p></div>
          <div><p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>SAN 0</p><p>Investigador vira NPJ insano permanente.</p></div>
          <div><p style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Recuperação</p><p>Psicoterapia restaura 1d3 SAN/sessão. SAN máx = 99 − Mythos%.</p></div>
        </div>
      </section>
    </div>
  );
}

function InsanityEditor({ r, phobias, manias, onPatch, onAddTag, onRemoveTag, onRemove, phobiaInput, setPhobiaInput, maniaInput, setManiaInput }: {
  r: CthulhuInsanityRecord; phobias: string[]; manias: string[];
  onPatch: (p: Partial<CthulhuInsanityRecord>) => void;
  onAddTag: (f: "phobias" | "manias", v: string) => void; onRemoveTag: (f: "phobias" | "manias", v: string) => void; onRemove: () => void;
  phobiaInput: string; setPhobiaInput: (v: string) => void; maniaInput: string; setManiaInput: (v: string) => void;
}) {
  const [name, setName] = useState(r.investigatorName);
  const [notes, setNotes] = useState(r.notes);
  const indefiniteThreshold = Math.floor((r.currentSan + r.sessionLoss) / 5);
  return (
    <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
        <div><label style={labelStyle}>Nome do Investigador</label><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} onBlur={(e) => onPatch({ investigatorName: e.target.value })} placeholder="Nome..." /></div>
        <div><label style={labelStyle}>SAN Atual</label><input type="number" style={numStyle} value={r.currentSan} min={0} max={r.maxSan} onChange={(e) => { const v = Math.max(0, Math.min(r.maxSan, Number(e.target.value))); onPatch({ currentSan: v }); }} /></div>
        <div><label style={labelStyle}>SAN Máxima</label><input type="number" style={numStyle} value={r.maxSan} min={1} max={99} onChange={(e) => { const v = Math.max(1, Number(e.target.value)); onPatch({ maxSan: v, currentSan: Math.min(r.currentSan, v) }); }} /></div>
        <div><label style={labelStyle}>Perda na Sessão</label><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ ...numStyle, width: 50, color: r.sessionLoss >= indefiniteThreshold ? "#f87171" : "var(--text)" }}>{r.sessionLoss}</span><button onClick={() => onPatch({ sessionLoss: 0, status: "normal" })} title="Resetar" style={{ padding: "6px 8px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.7rem" }}>↺</button></div></div>
      </div>

      <div style={{ padding: "10px 14px", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: "var(--radius)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
        Limiar de insanidade indefinida: <strong style={{ color: r.sessionLoss >= indefiniteThreshold ? "#f87171" : "var(--text)" }}>{indefiniteThreshold} pontos por sessão</strong>{r.sessionLoss >= indefiniteThreshold && <span style={{ color: "#f87171", marginLeft: 8 }}>— LIMITE ATINGIDO</span>}
      </div>

      <div>
        <label style={labelStyle}>Estado Mental</label>
        <div style={{ display: "flex", gap: 8 }}>
          {(["normal", "temp_insane", "indef_insane"] as const).map((s) => (
            <button key={s} onClick={() => onPatch({ status: s })} style={{ padding: "6px 14px", borderRadius: "var(--radius)", border: `1px solid ${r.status === s ? STATUS_COLORS[s] : "var(--border)"}`, background: r.status === s ? `${STATUS_COLORS[s]}22` : "transparent", color: r.status === s ? STATUS_COLORS[s] : "var(--text-muted)", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700 }}>{STATUS_LABELS[s]}</button>
          ))}
        </div>
      </div>

      <TagField label="Fobias" options={PHOBIAS} tags={phobias} field="phobias" color="#fca5a5" inputVal={phobiaInput} setInputVal={setPhobiaInput} onAdd={onAddTag} onRemove={onRemoveTag} />
      <TagField label="Manias" options={MANIAS} tags={manias} field="manias" color="#fde68a" inputVal={maniaInput} setInputVal={setManiaInput} onAdd={onAddTag} onRemove={onRemoveTag} />

      <div><label style={labelStyle}>Notas de Insanidade</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={(e) => onPatch({ notes: e.target.value })} placeholder="Episódios, traumas, observações..." style={{ width: "100%", padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", lineHeight: 1.6, resize: "vertical", minHeight: 80, boxSizing: "border-box", fontFamily: "inherit" }} /></div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onRemove} style={{ padding: "7px 16px", background: "rgba(220,60,60,0.1)", border: "1px solid rgba(220,60,60,0.3)", borderRadius: "var(--radius)", color: "#e06c6c", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>Remover Investigador</button>
      </div>
    </div>
  );
}

function TagField({ label, options, tags, field, color, inputVal, setInputVal, onAdd, onRemove }: {
  label: string; options: string[]; tags: string[]; field: "phobias" | "manias"; color: string;
  inputVal: string; setInputVal: (v: string) => void;
  onAdd: (f: "phobias" | "manias", v: string) => void; onRemove: (f: "phobias" | "manias", v: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {tags.map((t) => (
          <span key={t} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", background: `${color}1a`, border: `1px solid ${color}47`, borderRadius: "var(--radius-xs)", fontSize: "0.75rem", color }}>
            {t}<button onClick={() => onRemove(field, t)} style={{ background: "transparent", border: "none", color, cursor: "pointer", fontSize: "0.8rem", lineHeight: 1, padding: 0 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <select value="" onChange={(e) => onAdd(field, e.target.value)} style={{ flex: 1, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: "0.82rem" }}>
          <option value="">Escolher {field === "phobias" ? "fobia" : "mania"}...</option>
          {options.filter((o) => !tags.includes(o)).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <input value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { onAdd(field, inputVal); setInputVal(""); } }} placeholder="Personalizada..." style={{ ...inputStyle, width: 180 }} />
        <button onClick={() => { onAdd(field, inputVal); setInputVal(""); }} style={{ padding: "7px 14px", background: GD, border: `1px solid ${GB}`, borderRadius: "var(--radius)", color: GL, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>+</button>
      </div>
    </div>
  );
}
