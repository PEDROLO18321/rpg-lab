"use client";

import "../../../tormenta-responsive.css";
import { useState } from "react";
import type { TormentaApi } from "@/lib/tormenta/useTormentaCampaign";
import type { TormentaNpc, NPCAttack } from "@/lib/tormenta/tormentaCampaignClient";
import { OfficialBestiary } from "./OfficialBestiary";

const ACCENT = "#a01818";
const ACCENT_LIGHT = "#c94040";

const ATTR_LABELS: { key: "forca" | "des" | "con" | "int" | "sab" | "car"; label: string }[] = [
  { key: "forca", label: "FOR" }, { key: "des", label: "DES" }, { key: "con", label: "CON" },
  { key: "int", label: "INT" }, { key: "sab", label: "SAB" }, { key: "car", label: "CAR" },
];

function rollD20() { return Math.floor(Math.random() * 20) + 1; }
function mod(s: number) { const m = Math.floor((s - 10) / 2); return m >= 0 ? `+${m}` : `${m}`; }
function parseAttacks(json: string): NPCAttack[] { try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; } }

export function Bestiary({ api }: { api: TormentaApi }) {
  const npcs = api.campaign.tormentaNpcs;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addInitTarget, setAddInitTarget] = useState<string | null>(null);
  const [addInitValue, setAddInitValue] = useState("");

  function deleteCreature(id: string) { api.removeChild("npcs", id); if (expanded === id) setExpanded(null); }
  async function addToInitiative(npc: TormentaNpc) {
    const initiative = addInitValue !== "" ? Number(addInitValue) : rollD20();
    await api.addChild("combatants", { name: npc.name, initiative, pv: npc.pv, maxPv: npc.pv, pm: null, maxPm: null, defense: npc.defense, conditions: "[]", isPlayer: false, order: api.campaign.tormentaCombatants.length });
    setAddInitTarget(null); setAddInitValue("");
  }

  const inputStyle: React.CSSProperties = { padding: "8px 10px", background: "var(--surface-2)", border: "1px solid rgba(160,24,24,0.28)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", width: "100%", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ padding: "14px 18px", background: "rgba(160,24,24,0.08)", border: "1px solid rgba(160,24,24,0.28)", borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Use esta aba para criaturas e monstros de Arton. NPCs sociais (aldeões, nobres, mercadores) ficam na aba <strong style={{ color: ACCENT_LIGHT }}>NPCs</strong> — ambas compartilham a mesma lista, então tudo aparece nas duas abas.
        </p>
      </div>

      <div style={{ marginBottom: 28 }}><OfficialBestiary api={api} /></div>

      {npcs.length === 0 ? (
        <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "32px 0" }}>Nenhuma criatura ou NPC adicionado ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>{npcs.length} entrada{npcs.length !== 1 ? "s" : ""}</p>
          {npcs.map((npc) => {
            const attacks = parseAttacks(npc.attacks);
            return (
              <div key={npc.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer", gap: 10 }} onClick={() => setExpanded(expanded === npc.id ? null : npc.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "var(--radius)", background: "rgba(160,24,24,0.12)", border: "1px solid rgba(160,24,24,0.28)", display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT_LIGHT, fontSize: "0.9rem", flexShrink: 0 }}>{npc.race?.[0] ?? "?"}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{npc.name}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{[npc.race, npc.role].filter(Boolean).join(" · ")}{(npc.pv || npc.defense) && <span style={{ color: ACCENT_LIGHT }}>{npc.pv ? ` · PV ${npc.pv}` : ""}{npc.defense ? ` · Defesa ${npc.defense}` : ""}</span>}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); if (addInitTarget === npc.id) { setAddInitTarget(null); return; } setAddInitTarget(npc.id); setAddInitValue(""); }} style={{ padding: "5px 10px", background: addInitTarget === npc.id ? "rgba(160,24,24,0.22)" : "rgba(160,24,24,0.12)", color: ACCENT_LIGHT, border: "1px solid rgba(160,24,24,0.28)", borderRadius: "var(--radius)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>⚔ Iniciativa</button>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>{expanded === npc.id ? "▲" : "▼"}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteCreature(npc.id); }} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>×</button>
                  </div>
                </div>

                {addInitTarget === npc.id && (
                  <div onClick={(e) => e.stopPropagation()} style={{ padding: "12px 16px", borderTop: "1px solid rgba(160,24,24,0.28)", background: "rgba(160,24,24,0.12)" }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8 }}>Valor de Iniciativa <span style={{ color: "var(--text-subtle)" }}>(vazio = d20)</span></p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" value={addInitValue} onChange={(e) => setAddInitValue(e.target.value)} placeholder="Rolar d20" autoFocus style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && addToInitiative(npc)} />
                      <button onClick={() => addToInitiative(npc)} style={{ padding: "8px 14px", background: "rgba(160,24,24,0.12)", color: ACCENT_LIGHT, border: "1px solid rgba(160,24,24,0.28)", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Adicionar</button>
                      <button onClick={() => setAddInitTarget(null)} style={{ padding: "8px 12px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.82rem", cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                )}

                {expanded === npc.id && (
                  <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border)" }}>
                    {ATTR_LABELS.some(({ key }) => npc[key] !== null) && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Atributos</p>
                        <div className="tm-attr-grid-6" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                          {ATTR_LABELS.map(({ key, label }) => (
                            <div key={key} style={{ textAlign: "center", padding: "6px 4px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</p>
                              <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{npc[key] ?? "—"}</p>
                              {npc[key] !== null && <p style={{ fontSize: "0.64rem", color: ACCENT_LIGHT }}>{mod(npc[key] as number)}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="tm-bestiary-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      {npc.personality && <div><p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Comportamento</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.personality}</p></div>}
                      {npc.description && <div><p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Descrição</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.description}</p></div>}
                    </div>
                    {npc.notes && <div style={{ marginBottom: 10 }}><p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Notas</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.notes}</p></div>}
                    {attacks.length > 0 && (
                      <div>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ataques</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {attacks.map((atk, i) => (
                            <div key={i} style={{ padding: "7px 10px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{atk.name}{atk.bonus && <span style={{ color: ACCENT_LIGHT, fontWeight: 400 }}> · {atk.bonus}</span>}{atk.damage && <span style={{ color: ACCENT, fontWeight: 400 }}> · {atk.damage}</span>}</p>
                              {atk.description && <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>{atk.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
