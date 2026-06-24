"use client";

import { useState, useMemo } from "react";
import { type OrdemCampaign } from "@/lib/ordem/ordemCampaignStorage";
import { BESTIARY, ORDEM_ALLIES, type Element, type OrdemCreature } from "@/lib/ordem/bestiary";

const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

interface Props { campaign: OrdemCampaign; onChange: (c: OrdemCampaign) => void; }

const ELEMENT_COLOR: Record<Element, string> = {
  Sangue: "#e0524c",
  Morte: "#9aa0a8",
  Conhecimento: "#f5c451",
  Energia: "#9b7ce0",
  Realidade: "#7dd3a8",
};

const ELEMENTS: Element[] = ["Sangue", "Morte", "Conhecimento", "Energia", "Realidade"];
const PV_OPTIONS = [
  { id: "Todos" },
  { id: "1-50", min: 0, max: 50 },
  { id: "51-200", min: 51, max: 200 },
  { id: "201-500", min: 201, max: 500 },
  { id: "501-1000", min: 501, max: 1000 },
  { id: "1001+", min: 1001, max: Infinity },
];

function vdNum(vd: string) {
  const n = parseInt(vd.replace(/[^\d]/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

export function OrdemBestiary({ campaign, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [elementFilter, setElementFilter] = useState<Element | "Todos">("Todos");
  const [pvFilter, setPvFilter] = useState("Todos");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addTarget, setAddTarget] = useState<string | null>(null);
  const [addInit, setAddInit] = useState("");
  const [showAllies, setShowAllies] = useState(false);

  function addToInitiative(creature: OrdemCreature) {
    const init = addInit !== "" ? Number(addInit) : creature.agi + Math.floor(Math.random() * 20) + 1;
    onChange({
      ...campaign,
      combatants: [
        ...campaign.combatants,
        { id: crypto.randomUUID(), name: creature.name, init, pv: creature.pv, maxPv: creature.pv, pe: null, maxPe: null, san: null, maxSan: null, isPlayer: false },
      ],
    });
    setAddTarget(null);
    setAddInit("");
  }

  const filtered = useMemo(() => {
    return BESTIARY.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (elementFilter !== "Todos" && c.element !== elementFilter) return false;
      const pv = PV_OPTIONS.find((h) => h.id === pvFilter);
      if (pv && "min" in pv && pv.min !== undefined && pv.max !== undefined && (c.pv < pv.min || c.pv > pv.max)) return false;
      return true;
    }).sort((a, b) => vdNum(a.vd) - vdNum(b.vd));
  }, [search, elementFilter, pvFilter]);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ameaça..."
          style={{ flex: 1, minWidth: 180, padding: "9px 14px", background: "var(--surface)", border: `1px solid ${AB}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem" }}
        />
        <select
          value={elementFilter}
          onChange={(e) => setElementFilter(e.target.value as Element | "Todos")}
          style={{ padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", cursor: "pointer" }}
        >
          <option value="Todos">Todos os Elementos</option>
          {ELEMENTS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select
          value={pvFilter}
          onChange={(e) => setPvFilter(e.target.value)}
          style={{ padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", cursor: "pointer" }}
        >
          {PV_OPTIONS.map((h) => <option key={h.id} value={h.id}>{h.id === "Todos" ? "Todos os PV" : `PV ${h.id}`}</option>)}
        </select>
      </div>

      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 16 }}>
        {filtered.length} ameaça{filtered.length !== 1 ? "s" : ""} de {BESTIARY.length} no total
      </p>

      {/* Aliados */}
      <div style={{ marginBottom: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        <button onClick={() => setShowAllies((v) => !v)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>🤝 Aliados</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>NPCs auxiliares — só Bônus + Habilidade, sem PV/PE ou turno próprio</p>
          </div>
          <span style={{ color: "var(--text-subtle)", fontSize: "0.82rem", transform: showAllies ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s" }}>▾</span>
        </button>
        {showAllies && (
          <div style={{ padding: "0 20px 16px", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10, marginTop: 4 }}>
            {ORDEM_ALLIES.map((a) => (
              <div key={a.id} style={{ padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                <p style={{ fontWeight: 700, fontSize: "0.86rem", color: AL }}>{a.name}</p>
                <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", fontStyle: "italic", margin: "3px 0 8px", lineHeight: 1.45 }}>{a.concept}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5 }}><strong style={{ color: "#7dd3a8" }}>Bônus:</strong> {a.bonus}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5, marginTop: 5 }}><strong style={{ color: "#9b7ce0" }}>Habilidade:</strong> {a.ability}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((creature) => {
          const isOpen = expanded === creature.name;
          const elColor = ELEMENT_COLOR[creature.element];
          return (
            <div key={creature.name} style={{ background: "var(--surface)", border: `1px solid ${isOpen ? AB : "var(--border)"}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : creature.name)}
                  style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: elColor, boxShadow: `0 0 6px ${elColor}88`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{creature.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                      {creature.size} · Elemento {creature.element} · VD {creature.vd}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>
                      PV {creature.pv}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>
                      DEF {creature.defense}
                    </span>
                    <span style={{ color: "var(--text-subtle)", fontSize: "0.82rem", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s" }}>▾</span>
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setAddTarget(addTarget === creature.name ? null : creature.name); setAddInit(""); }}
                  title="Adicionar à Ordem de Ação"
                  style={{ margin: "0 12px", padding: "6px 12px", background: addTarget === creature.name ? "rgba(255,255,255,0.18)" : AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  Ordem
                </button>
              </div>

              {/* Add to initiative popover */}
              {addTarget === creature.name && (
                <div style={{ padding: "12px 20px", borderTop: `1px solid ${AB}`, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", flexShrink: 0 }}>
                    Iniciativa <span style={{ color: "var(--text-subtle)" }}>(vazio = AGI {creature.agi} + d20)</span>
                  </p>
                  <input
                    type="number"
                    value={addInit}
                    onChange={(e) => setAddInit(e.target.value)}
                    placeholder="auto"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && addToInitiative(creature)}
                    style={{ width: 80, padding: "6px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem" }}
                  />
                  <button onClick={() => addToInitiative(creature)} style={{ padding: "6px 14px", background: AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
                    + Adicionar
                  </button>
                  <button onClick={() => setAddTarget(null)} style={{ padding: "6px 10px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.78rem", cursor: "pointer" }}>
                    Cancelar
                  </button>
                </div>
              )}

              {/* Expanded stats */}
              {isOpen && (
                <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, margin: "16px 0 14px" }}>
                    {[["AGI", creature.agi], ["FOR", creature.forc], ["INT", creature.int], ["PRE", creature.pre], ["VIG", creature.vig], ["PV", creature.pv], ["DEF", creature.defense]].map(([label, val]) => (
                      <div key={label} style={{ textAlign: "center", padding: "8px 4px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "0.56rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</p>
                        <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>{val}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div style={{ padding: "10px 14px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: AL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Deslocamento</p>
                      <p style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>{creature.displacement}</p>
                    </div>
                    <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.06)", borderRadius: "var(--radius)", border: "1px solid rgba(248,113,113,0.2)" }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Presença Perturbadora</p>
                      <p style={{ fontSize: "0.84rem", color: "#f87171", fontWeight: 700 }}>
                        {creature.sanLoss === "—" ? "Mundana (sem PP)" : `DT ${creature.pp} · ${creature.sanLoss} mental`}
                      </p>
                    </div>
                  </div>

                  {(creature.resistances !== "—" || creature.vulnerabilities !== "—") && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                      <div style={{ padding: "10px 14px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#7dd3a8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Resistências / Imunidades</p>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{creature.resistances}</p>
                      </div>
                      <div style={{ padding: "10px 14px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Vulnerabilidades</p>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{creature.vulnerabilities}</p>
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: "0.62rem", fontWeight: 700, color: AL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Ações / Ataques</p>
                    <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                      {creature.attacks.map((atk, i) => (
                        <li key={i} style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{atk}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: "0.62rem", fontWeight: 700, color: AL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Descrição</p>
                    <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{creature.description}</p>
                  </div>

                  {creature.abilities && (
                    <div style={{ padding: "10px 14px", background: AD, borderRadius: "var(--radius)", border: `1px solid ${AB}`, marginTop: 12 }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: AL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Habilidades Especiais</p>
                      <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{creature.abilities}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--text-subtle)", fontSize: "0.9rem", padding: "48px 0" }}>
          Nenhuma ameaça encontrada com esses filtros.
        </p>
      )}
    </div>
  );
}
