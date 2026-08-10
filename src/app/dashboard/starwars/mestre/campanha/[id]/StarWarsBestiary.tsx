"use client";

import { useState, useMemo } from "react";
import type { StarWarsApi } from "@/lib/starwars/useStarWarsCampaign";
import { BESTIARY, MODULE_GROUPS, BOOK_LABEL, type BestiaryBook, type StarWarsCreature, type ThreatLevel } from "@/lib/starwars/bestiary";
import { SW } from "../../../ui";

const ACCENT = SW.accent;
const ACCENT_LIGHT = SW.accentLight;
const ACCENT_DIM = SW.accentDim;
const ACCENT_BORD = SW.accentBord;

interface Props { api: StarWarsApi; }

const BOOKS: BestiaryBook[] = ["criaturas", "jedi", "sith", "sensitivos", "mandalorianos", "militares", "civis", "fauna"];

const THREAT_ORDER: ThreatLevel[] = [
  "Muito Fraco", "Fraco", "Médio", "Forte", "Elite",
  "Chefe", "Chefe Lendário", "Ameaça Planetária", "Ameaça Galáctica",
];

const THREAT_COLOR: Record<ThreatLevel, string> = {
  "Muito Fraco": "#7d8590",
  "Fraco": "#8fae6b",
  "Médio": "#69a8e0",
  "Forte": "#e0b34d",
  "Elite": "#e08a4d",
  "Chefe": "#e0524c",
  "Chefe Lendário": "#c94dd6",
  "Ameaça Planetária": "#9b4dd6",
  "Ameaça Galáctica": "#f5c451",
};

function attrMod(n: number) { return n >= 0 ? `+${n}` : `${n}`; }

export function StarWarsBestiary({ api }: Props) {
  const [search, setSearch] = useState("");
  const [bookFilter, setBookFilter] = useState<BestiaryBook | "Todos">("Todos");
  const [threatFilter, setThreatFilter] = useState<ThreatLevel | "Todos">("Todos");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addTarget, setAddTarget] = useState<string | null>(null);
  const [addInit, setAddInit] = useState("");
  const [showModules, setShowModules] = useState(false);

  async function addToInitiative(creature: StarWarsCreature) {
    const init = addInit !== "" ? Number(addInit) : creature.initiative + Math.floor(Math.random() * 20) + 1;
    await api.addChild("combatants", {
      name: creature.name, initiative: init, pv: creature.pv, maxPv: creature.pv,
      pe: creature.pe, maxPe: creature.pe, conditions: "[]", isPlayer: false,
      order: api.campaign.starWarsCombatants.length,
    });
    setAddTarget(null);
    setAddInit("");
  }

  const filtered = useMemo(() => {
    return BESTIARY.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.category.toLowerCase().includes(q) && !c.lore.toLowerCase().includes(q)) return false;
      }
      if (bookFilter !== "Todos" && c.book !== bookFilter) return false;
      if (threatFilter !== "Todos" && c.threat !== threatFilter) return false;
      return true;
    }).sort((a, b) => a.level - b.level);
  }, [search, bookFilter, threatFilter]);

  return (
    <div>
      <div style={{ padding: "14px 18px", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Bestiário Oficial de Mestre — {BESTIARY.length} entradas prontas (criaturas, Jedi, Sith, sensitivos da Força, mandalorianos, militares, civis e fauna por planeta). Clique em <strong style={{ color: ACCENT_LIGHT }}>+ Iniciativa</strong> pra adicionar direto ao combate.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar criatura, NPC ou facção..."
          style={{ flex: 1, minWidth: 180, padding: "9px 14px", background: SW.panel, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.86rem" }}
        />
        <select value={bookFilter} onChange={(e) => setBookFilter(e.target.value as BestiaryBook | "Todos")}
          style={{ padding: "9px 12px", background: SW.panel, border: `1px solid ${SW.panelBorder}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", cursor: "pointer" }}>
          <option value="Todos">Todos os Livros</option>
          {BOOKS.map((b) => <option key={b} value={b}>{BOOK_LABEL[b]}</option>)}
        </select>
        <select value={threatFilter} onChange={(e) => setThreatFilter(e.target.value as ThreatLevel | "Todos")}
          style={{ padding: "9px 12px", background: SW.panel, border: `1px solid ${SW.panelBorder}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", cursor: "pointer" }}>
          <option value="Todos">Toda Ameaça</option>
          {THREAT_ORDER.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 16 }}>
        {filtered.length} entrada{filtered.length !== 1 ? "s" : ""} de {BESTIARY.length} no total
      </p>

      {/* Módulos: especializações Jedi/Sith, loadouts mandalorianos */}
      <div style={{ marginBottom: 20, background: SW.panel, border: `1px solid ${SW.panelBorder}`, borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
        <button onClick={() => setShowModules((v) => !v)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>🧩 Módulos (Especializações e Loadouts)</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>Deltas narrativos aplicados sobre uma patente base — nunca empilhe dois no mesmo NPC</p>
          </div>
          <span style={{ color: "var(--text-subtle)", fontSize: "0.82rem", transform: showModules ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s" }}>▾</span>
        </button>
        {showModules && (
          <div style={{ padding: "0 20px 18px", borderTop: "1px solid var(--border)" }}>
            {MODULE_GROUPS.map((group) => (
              <div key={group.id} style={{ marginTop: 14 }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{group.label}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                  {group.modules.map((m) => (
                    <div key={m.id} style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                      <p style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text)", marginBottom: 4 }}>{m.name}</p>
                      <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de criaturas/NPCs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((c) => {
          const isOpen = expanded === c.id;
          const tColor = THREAT_COLOR[c.threat] ?? ACCENT_LIGHT;
          return (
            <div key={c.id} style={{ background: SW.panel, border: `1px solid ${isOpen ? ACCENT_BORD : SW.panelBorder}`, borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <button onClick={() => setExpanded(isOpen ? null : c.id)}
                  style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: tColor, boxShadow: `0 0 6px ${tColor}88`, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>
                      {c.name}{c.epithet && <span style={{ color: "var(--text-subtle)", fontWeight: 400, fontStyle: "italic" }}> — {c.epithet}</span>}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                      {c.category} · {BOOK_LABEL[c.book]} · Nível {c.level} · <span style={{ color: tColor }}>{c.threat}</span>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>PV {c.pv}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>Def {c.defense}</span>
                    <span style={{ color: "var(--text-subtle)", fontSize: "0.82rem", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s" }}>▾</span>
                  </div>
                </button>
                <button onClick={(e) => { e.stopPropagation(); setAddTarget(addTarget === c.id ? null : c.id); setAddInit(""); }}
                  title="Adicionar à Iniciativa"
                  style={{ margin: "0 12px", padding: "6px 12px", background: addTarget === c.id ? "rgba(59,130,196,0.22)" : ACCENT_DIM, color: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                  ⚔ Iniciativa
                </button>
              </div>

              {addTarget === c.id && (
                <div style={{ padding: "12px 20px", borderTop: `1px solid ${ACCENT_BORD}`, background: "rgba(59,130,196,0.06)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", flexShrink: 0 }}>
                    Iniciativa <span style={{ color: "var(--text-subtle)" }}>(vazio = {attrMod(c.initiative)} + d20)</span>
                  </p>
                  <input type="number" value={addInit} onChange={(e) => setAddInit(e.target.value)} placeholder="auto" autoFocus
                    onKeyDown={(e) => e.key === "Enter" && addToInitiative(c)}
                    style={{ width: 80, padding: "6px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem" }} />
                  <button onClick={() => addToInitiative(c)} style={{ padding: "6px 14px", background: ACCENT_DIM, color: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>+ Adicionar</button>
                  <button onClick={() => setAddTarget(null)} style={{ padding: "6px 10px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.78rem", cursor: "pointer" }}>Cancelar</button>
                </div>
              )}

              {isOpen && (
                <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "14px 0" }}>
                    {c.faction} · Papel {c.role} · Tamanho {c.size} · Tipo {c.type} · Planeta {c.planet} · Ambiente {c.environment} · Inteligência {c.intelligence} · Tendência {c.disposition}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 14 }}>
                    {[["PV", c.pv], ["PE", c.pe], ["Defesa", c.defense], ["Iniciativa", attrMod(c.initiative)], ["Deslocamento", c.speed]].map(([label, val]) => (
                      <div key={label as string} style={{ textAlign: "center", padding: "8px 4px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "0.56rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</p>
                        <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text)" }}>{val}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 14 }}>
                    {[["AGI", c.attrs.agi], ["INT", c.attrs.int], ["FOR", c.attrs.forc], ["VIG", c.attrs.vig], ["PRE", c.attrs.pre], ["SEN", c.attrs.sen]].map(([label, val]) => (
                      <div key={label as string} style={{ textAlign: "center", padding: "8px 4px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                        <p style={{ fontSize: "0.56rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</p>
                        <p style={{ fontSize: "0.86rem", fontWeight: 700, color: ACCENT_LIGHT }}>{attrMod(val as number)}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: "0.62rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Perícias</p>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{c.skills}</p>
                  </div>

                  {c.attacks.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Ataques</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {c.attacks.map((atk, i) => (
                          <div key={i} style={{ padding: "8px 12px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                            <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>
                              {atk.name} <span style={{ color: ACCENT_LIGHT, fontWeight: 400 }}>· {atk.range}</span>
                            </p>
                            <p style={{ fontSize: "0.76rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>
                              Acerto {atk.hit} · Dano {atk.damage} ({atk.damageType}){atk.cost !== "—" && ` · Custo ${atk.cost}`}{atk.cooldown !== "—" && ` · Recarga ${atk.cooldown}`}
                            </p>
                            {atk.effect !== "—" && <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5, marginTop: 3 }}>{atk.effect}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {c.powers.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#c94dd6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Poderes</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {c.powers.map((p, i) => (
                          <div key={i} style={{ padding: "8px 12px", background: "rgba(201,77,214,0.06)", borderRadius: "var(--radius)", border: "1px solid rgba(201,77,214,0.22)" }}>
                            <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{p.name}</p>
                            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.55 }}>{p.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {c.passives.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Passivas</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {c.passives.map((p, i) => (
                          <p key={i} style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                            <strong style={{ color: "var(--text)" }}>{p.name}</strong> — {p.effect}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>IA de Combate</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{c.ai}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Loot</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{c.loot}</p>
                    </div>
                  </div>

                  <div style={{ padding: "10px 14px", background: ACCENT_DIM, borderRadius: "var(--radius)", border: `1px solid ${ACCENT_BORD}` }}>
                    <p style={{ fontSize: "0.62rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Lore</p>
                    <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{c.lore}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--text-subtle)", fontSize: "0.9rem", padding: "48px 0" }}>Nenhuma entrada encontrada com esses filtros.</p>
      )}
    </div>
  );
}
