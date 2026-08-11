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

const ATTR_KEYS: { key: keyof OfficialCreature["attrs"]; label: string }[] = [
  { key: "for", label: "FOR" }, { key: "des", label: "DES" }, { key: "con", label: "CON" },
  { key: "int", label: "INT" }, { key: "sab", label: "SAB" }, { key: "car", label: "CAR" },
];

function mod(v: string) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const m = Math.floor((n - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function toNum(v: string): number | null {
  if (!v || v === "-" || v === "—") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function ndBadgeColor(nd: number) {
  if (nd <= 1) return "#4ade80";
  if (nd <= 4) return "#fbbf24";
  if (nd <= 10) return "#fb923c";
  if (nd <= 20) return "#f87171";
  return "#e8b84b";
}

export function OfficialBestiary({ api }: { api: TormentaApi }) {
  const [creatures, setCreatures] = useState<OfficialCreature[] | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [ndFilter, setNdFilter] = useState("");
  const [selected, setSelected] = useState<OfficialCreature | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    import("@/lib/tormenta/officialBestiary.json").then((mod) => {
      if (!cancelled) setCreatures(mod.default as unknown as OfficialCreature[]);
    });
    return () => { cancelled = true; };
  }, []);

  const types = useMemo(() => {
    if (!creatures) return [];
    return [...new Set(creatures.map((c) => c.type).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [creatures]);

  const filtered = useMemo(() => {
    if (!creatures) return [];
    let list = creatures;
    if (typeFilter) list = list.filter((c) => c.type === typeFilter);
    if (ndFilter.trim()) { const nd = Number(ndFilter); list = list.filter((c) => c.nd === nd); }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [creatures, search, typeFilter, ndFilter]);

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

  const accent = ACCENT_LIGHT;
  const labelStyle: React.CSSProperties = { fontSize: "0.62rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 };

  if (!creatures) {
    return <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "32px 0" }}>Carregando bestiário...</p>;
  }

  return (
    <div className="tm-bestiary-oficial-layout" style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 20, alignItems: "start" }}>
      {/* Left: list */}
      <div>
        <div style={{ padding: "14px 18px", background: "rgba(160,24,24,0.08)", border: "1px solid rgba(160,24,24,0.28)", borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            Acervo oficial do <strong style={{ color: ACCENT_LIGHT }}>Bestiário de Arton</strong> — 183 criaturas prontas para consulta. Clique numa entrada para ver a ficha completa e, se quiser, adicioná-la à sua campanha.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar criatura..."
            style={{ flex: "1 1 200px", padding: "9px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem", outline: "none" }}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ flex: "1 1 160px", padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem" }}
          >
            <option value="">Todos os tipos</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="number" min="0"
            value={ndFilter}
            onChange={(e) => setNdFilter(e.target.value)}
            placeholder="ND exato"
            style={{ flex: "0 1 120px", padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem" }}
          />
        </div>

        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 12 }}>
          {filtered.length} criatura{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
          {filtered.map((c) => {
            const isActive = selected?.name === c.name;
            const nc = ndBadgeColor(c.nd);
            return (
              <button
                key={c.name}
                onClick={() => setSelected(isActive ? null : c)}
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  background: isActive ? "rgba(160,24,24,0.12)" : "var(--surface)",
                  border: `1px solid ${isActive ? "rgba(160,24,24,0.4)" : "var(--border)"}`,
                  borderRadius: "var(--radius-xl)",
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = "rgba(160,24,24,0.3)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 6 }}>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, color: ACCENT_LIGHT, background: "rgba(160,24,24,0.14)", border: "1px solid rgba(160,24,24,0.3)", borderRadius: "var(--radius-full)", padding: "2px 7px", letterSpacing: "0.06em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: "0.64rem", fontWeight: 700, color: nc, background: `${nc}18`, border: `1px solid ${nc}30`, borderRadius: "var(--radius-full)", padding: "2px 7px", flexShrink: 0 }}>
                    ND {c.nd}
                  </span>
                </div>
                <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)", marginBottom: 4, lineHeight: 1.3 }}>{c.name}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {c.size}{c.pv !== null && ` · PV ${c.pv}`}{c.ca !== null && ` · CA ${c.ca}`}
                </p>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "40px 0" }}>
            Nenhuma criatura encontrada com esses filtros.
          </p>
        )}
      </div>

      {/* Right: detail panel */}
      {selected && (
        <div
          style={{
            position: "sticky",
            top: 80,
            padding: "22px",
            background: "var(--surface)",
            border: `1px solid ${accent}40`,
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            maxHeight: "calc(100vh - 120px)",
            overflowY: "auto",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ display: "inline-block", fontSize: "0.6rem", fontWeight: 700, color: accent, background: `${accent}18`, border: `1px solid ${accent}30`, borderRadius: "var(--radius-full)", padding: "2px 8px", letterSpacing: "0.06em", marginBottom: 6 }}>
                {selected.type.toUpperCase()}
              </span>
              <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.2, marginBottom: 3 }}>
                {selected.name}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                {[selected.size, selected.alignment].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button onClick={() => setSelected(null)} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "1rem", flexShrink: 0 }}>✕</button>
          </div>

          {selected.flavor && (
            <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)", lineHeight: 1.6, fontStyle: "italic", marginBottom: 14 }}>{selected.flavor}</p>
          )}

          <div style={{ height: 1, background: `${accent}30`, marginBottom: 14 }} />

          {/* Key stats row */}
          <div className="tm-bestiary-oficial-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
            {[
              { label: "CA", value: selected.ca !== null ? String(selected.ca) : "—" },
              { label: "PV", value: selected.pv !== null ? String(selected.pv) : "—" },
              { label: "ND", value: String(selected.nd) },
              { label: "Iniciativa", value: selected.init || "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center", padding: "9px 6px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
                <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 1 }}>{value}</p>
                <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
              </div>
            ))}
          </div>

          {selected.speed && (
            <div style={{ marginBottom: 12 }}>
              <p style={labelStyle}>Deslocamento</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text)" }}>{selected.speed}</p>
            </div>
          )}

          {selected.attrs.for && (
            <>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 12 }} />
              <div className="tm-bestiary-oficial-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 14 }}>
                {ATTR_KEYS.map(({ key, label }) => {
                  const val = selected.attrs[key];
                  const m = mod(val);
                  return (
                    <div key={key} style={{ textAlign: "center", padding: "7px 4px", background: "var(--surface-2)", border: `1px solid ${accent}25`, borderRadius: "var(--radius)" }}>
                      <p style={{ fontSize: "0.58rem", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{val || "—"}</p>
                      {m !== null && <p style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>({m})</p>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {selected.skills && (
            <div style={{ marginBottom: 8 }}>
              <p style={labelStyle}>Perícias</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text)" }}>{selected.skills}</p>
            </div>
          )}

          {selected.resistances && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ ...labelStyle, color: "#fbbf24" }}>Resistências</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text)" }}>{selected.resistances}</p>
            </div>
          )}

          {selected.senses && (
            <>
              <div style={{ height: 1, background: "var(--border)", marginTop: 10, marginBottom: 10 }} />
              <div style={{ marginBottom: 14 }}>
                <p style={labelStyle}>Sentidos</p>
                <p style={{ fontSize: "0.76rem", color: "var(--text)", lineHeight: 1.5 }}>{selected.senses}</p>
              </div>
            </>
          )}

          {selected.attacksRaw && (
            <>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 10 }} />
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#fb923c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ataques</p>
              <div style={{ padding: "8px 10px", background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.15)", borderRadius: "var(--radius)", marginBottom: 14 }}>
                <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{selected.attacksRaw}</p>
              </div>
            </>
          )}

          {selected.abilitiesRaw && (
            <>
              <div style={{ height: 1, background: "var(--border)", marginBottom: 10 }} />
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Habilidades Especiais</p>
              <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>{selected.abilitiesRaw}</p>
            </>
          )}

          {selected.treasure && (
            <div style={{ marginBottom: 14 }}>
              <p style={labelStyle}>Tesouro</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text)" }}>{selected.treasure}</p>
            </div>
          )}

          {/* Add to campaign */}
          <div style={{ height: 1, background: `${accent}30`, marginBottom: 12 }} />
          <button
            onClick={() => addToCampaign(selected)}
            disabled={added.has(selected.name)}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: added.has(selected.name) ? "var(--surface-2)" : "var(--accent-dim)",
              color: added.has(selected.name) ? "var(--text-muted)" : "var(--accent-light)",
              border: "1px solid var(--border-accent)",
              borderRadius: "var(--radius)",
              fontSize: "0.84rem",
              fontWeight: 700,
              cursor: added.has(selected.name) ? "default" : "pointer",
            }}
          >
            {added.has(selected.name) ? "✓ Adicionado à campanha" : "+ Adicionar à campanha"}
          </button>
        </div>
      )}
    </div>
  );
}
