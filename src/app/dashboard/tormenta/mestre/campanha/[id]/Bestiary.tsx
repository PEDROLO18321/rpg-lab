"use client";

import "../../../tormenta-responsive.css";
import { useState } from "react";
import type { TormentaApi } from "@/lib/tormenta/useTormentaCampaign";
import type { TormentaNpc, NPCAttack } from "@/lib/tormenta/tormentaCampaignClient";
import { OfficialBestiary } from "./OfficialBestiary";

const ACCENT = "#a01818";
const ACCENT_LIGHT = "#c94040";

const CREATURE_TYPES = ["Besta", "Morto-vivo", "Corruptor", "Espírito", "Monstruosidade", "Aberração da Tormenta", "Elemental", "Construto", "Dragão", "Gigante", "Fada", "Planta"];
const CREATURE_ROLES = ["Batedor", "Guardião de Ruína", "Predador", "Servo da Tormenta", "Ameaça de Estrada", "Fera de Masmorra", "Chefe de Covil", "Enxame"];
const TRAITS = ["Ataca em bando, cercando as presas", "Emboscada nas sombras antes de atacar", "Foge quando ferido gravemente", "Defende ferozmente seu território", "Obedece cegamente a um mestre maior", "Odeia luz e fogo", "Devora tudo que se move", "Guarda um tesouro ou ninho"];
const APPEARANCES = ["Pele escamosa e escura, olhos brilhantes", "Corpo deformado pela Tormenta", "Presas e garras enormes", "Coberto de limo e fungos", "Restos de armadura enferrujada no corpo", "Chifres retorcidos e pele cinzenta", "Asas membranosas e cheiro de podridão", "Silhueta translúcida, quase espectral"];
const NAMES = ["Grak", "Zurr", "Morfeu", "Skarn", "Ur'khal", "Vhalgorr", "Nix", "Threx", "Kaash", "Molok", "Drevas", "Ossuun"];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rollD20() { return Math.floor(Math.random() * 20) + 1; }
function mod(s: number) { const m = Math.floor((s - 10) / 2); return m >= 0 ? `+${m}` : `${m}`; }

const RANDOM_ATTACKS: NPCAttack[] = [
  { name: "Garras", bonus: "+5", damage: "1d6+3", description: "Corpo a corpo, alcance pessoal" },
  { name: "Mordida", bonus: "+6", damage: "1d8+4", description: "Corpo a corpo, alcance pessoal" },
  { name: "Investida", bonus: "+4", damage: "2d6+2", description: "Corpo a corpo, alcance pessoal" },
  { name: "Sopro Corrosivo", bonus: "+5", damage: "3d6", description: "Mágico em cone, 9m" },
  { name: "Ferrão", bonus: "+5", damage: "1d4+3", description: "Corpo a corpo + veneno" },
];

type NpcForm = Omit<TormentaNpc, "id" | "attacks"> & { attacks: NPCAttack[] };
const ATTR_LABELS: { key: "forca" | "des" | "con" | "int" | "sab" | "car"; label: string }[] = [
  { key: "forca", label: "FOR" }, { key: "des", label: "DES" }, { key: "con", label: "CON" },
  { key: "int", label: "INT" }, { key: "sab", label: "SAB" }, { key: "car", label: "CAR" },
];

function parseAttacks(json: string): NPCAttack[] { try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; } }
function emptyCreature(): NpcForm { return { name: "", race: "", role: "", description: "", personality: "", notes: "", pv: null, defense: null, forca: null, des: null, con: null, int: null, sab: null, car: null, attacks: [] }; }
function randomCreature(): NpcForm {
  return { name: rand(NAMES), race: rand(CREATURE_TYPES), role: rand(CREATURE_ROLES), description: rand(APPEARANCES), personality: rand(TRAITS), notes: "",
    pv: randBetween(10, 60), defense: randBetween(12, 20), forca: randBetween(10, 20), des: randBetween(8, 18), con: randBetween(10, 20), int: randBetween(2, 12), sab: randBetween(8, 16), car: randBetween(4, 14), attacks: [{ ...rand(RANDOM_ATTACKS) }] };
}

export function Bestiary({ api }: { api: TormentaApi }) {
  const npcs = api.campaign.tormentaNpcs;
  const [mode, setMode] = useState<"random" | "manual" | "oficial">("random");
  const [form, setForm] = useState<NpcForm>(randomCreature());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newAtk, setNewAtk] = useState<NPCAttack>({ name: "", bonus: "", damage: "", description: "" });
  const [addInitTarget, setAddInitTarget] = useState<string | null>(null);
  const [addInitValue, setAddInitValue] = useState("");

  function regenerate() { setForm(randomCreature()); }
  function switchMode(m: "random" | "manual" | "oficial") { setMode(m); if (m !== "oficial") setForm(m === "random" ? randomCreature() : emptyCreature()); }
  async function saveCreature() {
    if (!form.name.trim()) return;
    await api.addChild("npcs", { ...form, attacks: JSON.stringify(form.attacks) });
    setForm(mode === "random" ? randomCreature() : emptyCreature());
  }
  function deleteCreature(id: string) { api.removeChild("npcs", id); if (expanded === id) setExpanded(null); }
  function addAttack() { if (!newAtk.name.trim()) return; setForm({ ...form, attacks: [...form.attacks, { ...newAtk }] }); setNewAtk({ name: "", bonus: "", damage: "", description: "" }); }
  function removeAttack(i: number) { setForm({ ...form, attacks: form.attacks.filter((_, j) => j !== i) }); }
  async function addToInitiative(npc: TormentaNpc) {
    const initiative = addInitValue !== "" ? Number(addInitValue) : rollD20();
    await api.addChild("combatants", { name: npc.name, initiative, pv: npc.pv, maxPv: npc.pv, pm: null, maxPm: null, defense: npc.defense, conditions: "[]", isPlayer: false, order: api.campaign.tormentaCombatants.length });
    setAddInitTarget(null); setAddInitValue("");
  }

  const inputStyle: React.CSSProperties = { padding: "8px 10px", background: "var(--surface-2)", border: "1px solid rgba(160,24,24,0.28)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", width: "100%", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.68rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 };
  const sectionLabel: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 };

  function textField(label: string, key: keyof NpcForm, opts?: { list?: string[] }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={labelStyle}>{label}</label>
        {opts?.list ? (
          <select value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle}>
            <option value="">Selecionar...</option>{opts.list.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
        )}
      </div>
    );
  }
  function numField(label: string, key: keyof NpcForm) {
    return (
      <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ ...labelStyle, textAlign: "center" }}>{label}</label>
        <input type="number" min="1" max="40" placeholder="—" value={(form[key] as number | null) ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value ? Number(e.target.value) : null })} style={{ ...inputStyle, textAlign: "center", padding: "8px 6px" }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: "14px 18px", background: "rgba(160,24,24,0.08)", border: "1px solid rgba(160,24,24,0.28)", borderRadius: "var(--radius-lg)", marginBottom: 20 }}>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Use esta aba para criaturas e monstros de Arton. NPCs sociais (aldeões, nobres, mercadores) ficam na aba <strong style={{ color: ACCENT_LIGHT }}>NPCs</strong> — ambas compartilham a mesma lista, então tudo aparece nas duas abas.
        </p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 4, width: "fit-content" }}>
        {(["random", "manual", "oficial"] as const).map((m) => (
          <button key={m} onClick={() => switchMode(m)} style={{ padding: "7px 18px", background: mode === m ? "rgba(160,24,24,0.12)" : "transparent", color: mode === m ? ACCENT_LIGHT : "var(--text-muted)", border: mode === m ? "1px solid rgba(160,24,24,0.28)" : "1px solid transparent", borderRadius: "var(--radius-lg)", fontSize: "0.82rem", fontWeight: mode === m ? 700 : 500, cursor: "pointer" }}>{m === "random" ? "Aleatório" : m === "manual" ? "Manual" : "Bestiário Oficial"}</button>
        ))}
      </div>

      {mode === "oficial" && <div style={{ marginBottom: 28 }}><OfficialBestiary api={api} /></div>}

      {mode !== "oficial" && (
      <div style={{ padding: "24px", background: "var(--surface)", border: "1px solid rgba(160,24,24,0.28)", borderRadius: "var(--radius-xl)", marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
          {textField("Nome", "name")}
          {textField("Tipo de Criatura", "race", { list: mode === "random" ? undefined : CREATURE_TYPES })}
          {textField("Papel de Combate", "role", { list: mode === "random" ? undefined : CREATURE_ROLES })}
        </div>
        <div className="tm-bestiary-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {textField("Comportamento", "personality")}
          {textField("Descrição / Aparência", "description")}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Notas</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Habilidades especiais, fraquezas, covil..." style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ borderTop: "1px solid rgba(160,24,24,0.28)", paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Estatísticas de Combate <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></p>
          <div className="tm-bestiary-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>{numField("PV Máx.", "pv")}{numField("Defesa", "defense")}</div>
          <div className="tm-attr-grid-6" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>{ATTR_LABELS.map(({ key, label }) => numField(label, key))}</div>
        </div>

        <div style={{ borderTop: "1px solid rgba(160,24,24,0.28)", paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Ataques <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></p>
          {form.attacks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {form.attacks.map((atk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>{atk.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{atk.bonus && <span style={{ color: ACCENT_LIGHT }}>{atk.bonus}</span>}{atk.bonus && atk.damage && " · "}{atk.damage && <span>{atk.damage}</span>}{atk.description && <span style={{ color: "var(--text-subtle)" }}> — {atk.description}</span>}</p>
                  </div>
                  <button onClick={() => removeAttack(i)} style={{ padding: "3px 7px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.75rem" }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div className="tm-npc-attack-grid" style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px", gap: 8, marginBottom: 8 }}>
            <div><label style={labelStyle}>Nome do Ataque</label><input value={newAtk.name} onChange={(e) => setNewAtk({ ...newAtk, name: e.target.value })} placeholder="Ex: Mordida" style={inputStyle} /></div>
            <div><label style={labelStyle}>Bônus</label><input value={newAtk.bonus} onChange={(e) => setNewAtk({ ...newAtk, bonus: e.target.value })} placeholder="+6" style={inputStyle} /></div>
            <div><label style={labelStyle}>Dano</label><input value={newAtk.damage} onChange={(e) => setNewAtk({ ...newAtk, damage: e.target.value })} placeholder="1d8+4" style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Descrição do Ataque</label><input value={newAtk.description} onChange={(e) => setNewAtk({ ...newAtk, description: e.target.value })} placeholder="Ex: Corpo a corpo, alcance pessoal" style={inputStyle} /></div>
            <button onClick={addAttack} disabled={!newAtk.name.trim()} style={{ padding: "8px 14px", background: newAtk.name.trim() ? "rgba(160,24,24,0.12)" : "var(--surface-2)", color: newAtk.name.trim() ? ACCENT_LIGHT : "var(--text-subtle)", border: "1px solid rgba(160,24,24,0.28)", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: newAtk.name.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>+ Ataque</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveCreature} disabled={!form.name.trim()} style={{ padding: "10px 22px", background: form.name.trim() ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)` : "var(--surface-2)", color: form.name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: form.name.trim() ? "pointer" : "not-allowed" }}>+ Adicionar Criatura</button>
          {mode === "random" && <button onClick={regenerate} style={{ padding: "10px 18px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.86rem", cursor: "pointer" }}>Aleatório</button>}
        </div>
      </div>
      )}

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
