"use client";

import { useEffect, useMemo, useState } from "react";
import type { TormentaApi } from "@/lib/tormenta/useTormentaCampaign";

interface OfficialCreature {
  name: string; nd: number; type: string; size: string; alignment: string; typeLine: string;
  flavor: string; init: string; senses: string; ca: number | null; pv: number | null;
  resistances: string; speed: string; attacksRaw: string;
  attrs: { for: string; des: string; con: string; int: string; sab: string; car: string };
  skills: string; abilitiesRaw: string; treasure: string;
}

const ACCENT = "#a01818";
const ACCENT_LIGHT = "#c94040";
const ATTR_LABELS: { key: keyof OfficialCreature["attrs"]; label: string }[] = [
  { key: "for", label: "FOR" }, { key: "des", label: "DES" }, { key: "con", label: "CON" },
  { key: "int", label: "INT" }, { key: "sab", label: "SAB" }, { key: "car", label: "CAR" },
];

function toNum(v: string): number | null {
  if (!v || v === "-" || v === "—") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function OfficialBestiary({ api }: { api: TormentaApi }) {
  const [creatures, setCreatures] = useState<OfficialCreature[] | null>(null);
  const [query, setQuery] = useState("");
  const [ndFilter, setNdFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    import("@/lib/tormenta/officialBestiary.json").then((mod) => {
      if (!cancelled) setCreatures(mod.default as unknown as OfficialCreature[]);
    });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!creatures) return [];
    const q = query.trim().toLowerCase();
    const nd = ndFilter.trim() ? Number(ndFilter) : null;
    return creatures.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.type.toLowerCase().includes(q)) return false;
      if (nd !== null && c.nd !== nd) return false;
      return true;
    });
  }, [creatures, query, ndFilter]);

  async function addToCampaign(c: OfficialCreature) {
    const attacks = c.attacksRaw ? [{ name: "Ataques", bonus: "", damage: "", description: c.attacksRaw }] : [];
    await api.addChild("npcs", {
      name: c.name,
      race: c.type || "Monstro",
      role: `ND ${c.nd}`,
      description: [c.size, c.alignment].filter(Boolean).join(" · "),
      personality: c.flavor,
      notes: [
        c.senses && `Sentidos: ${c.senses}`,
        c.resistances && `Resistências: ${c.resistances}`,
        c.speed && `Deslocamento: ${c.speed}`,
        c.skills && `Perícias: ${c.skills}`,
        c.abilitiesRaw && `Habilidades Especiais: ${c.abilitiesRaw}`,
        c.treasure && `Tesouro: ${c.treasure}`,
      ].filter(Boolean).join("\n\n"),
      pv: c.pv,
      defense: c.ca,
      forca: toNum(c.attrs.for), des: toNum(c.attrs.des), con: toNum(c.attrs.con),
      int: toNum(c.attrs.int), sab: toNum(c.attrs.sab), car: toNum(c.attrs.car),
      attacks: JSON.stringify(attacks),
    });
    setAdded((prev) => new Set(prev).add(c.name));
  }

  const inputStyle: React.CSSProperties = { padding: "8px 10px", background: "var(--surface-2)", border: "1px solid rgba(160,24,24,0.28)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, display: "block" };

  return (
    <div>
      <div style={{ padding: "14px 18px", background: "rgba(160,24,24,0.08)", border: "1px solid rgba(160,24,24,0.28)", borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Acervo oficial do <strong style={{ color: ACCENT_LIGHT }}>Bestiário de Arton</strong> — 183 criaturas prontas para consulta. Clique numa entrada para ver a ficha completa e, se quiser, adicioná-la à sua campanha.
        </p>
      </div>

      <div className="tm-bestiary-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Buscar por nome ou tipo</label>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex: dragão, morto-vivo, lobo..." style={{ ...inputStyle, width: "100%" }} />
        </div>
        <div>
          <label style={labelStyle}>ND exato</label>
          <input type="number" min="0" value={ndFilter} onChange={(e) => setNdFilter(e.target.value)} placeholder="—" style={{ ...inputStyle, width: "100%" }} />
        </div>
      </div>

      {!creatures ? (
        <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "32px 0" }}>Carregando bestiário...</p>
      ) : (
        <>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10 }}>{filtered.length} de {creatures.length} criaturas</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 640, overflowY: "auto", paddingRight: 4 }}>
            {filtered.map((c) => {
              const isOpen = expanded === c.name;
              const isAdded = added.has(c.name);
              return (
                <div key={c.name} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                  <div
                    onClick={() => setExpanded(isOpen ? null : c.name)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer", gap: 10 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "var(--radius)", background: "rgba(160,24,24,0.12)", border: "1px solid rgba(160,24,24,0.28)", display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT_LIGHT, fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>
                        {c.nd}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{c.name}</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {[c.type, c.size].filter(Boolean).join(" · ")}
                          {c.pv !== null && <span style={{ color: ACCENT_LIGHT }}> · PV {c.pv}</span>}
                          {c.ca !== null && <span style={{ color: ACCENT_LIGHT }}> · CA {c.ca}</span>}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
                  </div>

                  {isOpen && (
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
                      {c.flavor && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "12px 0" }}>{c.flavor}</p>}

                      <div className="tm-bestiary-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12, fontSize: "0.8rem" }}>
                        {c.init && <p><strong style={{ color: ACCENT }}>Iniciativa:</strong> <span style={{ color: "var(--text-muted)" }}>{c.init}</span></p>}
                        {c.speed && <p><strong style={{ color: ACCENT }}>Deslocamento:</strong> <span style={{ color: "var(--text-muted)" }}>{c.speed}</span></p>}
                        {c.senses && <p style={{ gridColumn: "1 / -1" }}><strong style={{ color: ACCENT }}>Sentidos:</strong> <span style={{ color: "var(--text-muted)" }}>{c.senses}</span></p>}
                        {c.resistances && <p style={{ gridColumn: "1 / -1" }}><strong style={{ color: ACCENT }}>Resistências:</strong> <span style={{ color: "var(--text-muted)" }}>{c.resistances}</span></p>}
                      </div>

                      {c.attrs.for && (
                        <div style={{ marginBottom: 14 }}>
                          <p style={labelStyle}>Atributos</p>
                          <div className="tm-attr-grid-6" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                            {ATTR_LABELS.map(({ key, label }) => (
                              <div key={key} style={{ textAlign: "center", padding: "6px 4px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                                <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</p>
                                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{c.attrs[key] || "—"}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {c.attacksRaw && (
                        <div style={{ marginBottom: 12 }}>
                          <p style={labelStyle}>Ataques</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{c.attacksRaw}</p>
                        </div>
                      )}

                      {c.skills && (
                        <div style={{ marginBottom: 12 }}>
                          <p style={labelStyle}>Perícias</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{c.skills}</p>
                        </div>
                      )}

                      {c.abilitiesRaw && (
                        <div style={{ marginBottom: 12 }}>
                          <p style={labelStyle}>Habilidades Especiais</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{c.abilitiesRaw}</p>
                        </div>
                      )}

                      {c.treasure && (
                        <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginBottom: 14 }}><strong style={{ color: ACCENT }}>Tesouro:</strong> {c.treasure}</p>
                      )}

                      <button
                        onClick={() => addToCampaign(c)}
                        disabled={isAdded}
                        style={{
                          padding: "9px 18px",
                          background: isAdded ? "var(--surface-2)" : `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`,
                          color: isAdded ? "var(--text-muted)" : "#06090f",
                          border: "none",
                          borderRadius: "var(--radius)",
                          fontSize: "0.84rem",
                          fontWeight: 700,
                          cursor: isAdded ? "default" : "pointer",
                        }}
                      >
                        {isAdded ? "✓ Adicionado à campanha" : "+ Adicionar à campanha"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "32px 0" }}>Nenhuma criatura encontrada.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
