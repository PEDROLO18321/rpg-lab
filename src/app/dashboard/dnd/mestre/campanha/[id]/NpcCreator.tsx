"use client";

import { useState } from "react";
import type { DndApi } from "@/lib/dnd/useDndCampaign";
import type { DndNpc, NPCAttack } from "@/lib/dnd/dndCampaignClient";
import "../../../dnd-responsive.css";

const RACES = ["Humano", "Elfo", "Anão", "Halfling", "Gnomo", "Meio-Elfo", "Meio-Orc", "Tiefling", "Draconato", "Aasimar", "Orc", "Goblin"];
const ROLES = ["Aldeão", "Guarda da Cidade", "Mercador", "Sacerdote", "Taberneiro", "Ladrão", "Nobre", "Mago", "Guerreiro", "Ladino", "Ferreiro", "Fazendeiro", "Curandeiro", "Explorador", "Espião", "Cultista", "Mendigo", "Artesão", "Pescador", "Soldado", "Cavaleiro", "Mensageiro", "Bardo", "Herói"];
const ALIGNMENTS = ["Leal e Bom", "Neutro e Bom", "Caótico e Bom", "Leal e Neutro", "Neutro", "Caótico e Neutro", "Leal e Mau", "Neutro e Mau", "Caótico e Mau"];
const TRAITS = ["Fala demais sobre assuntos sem importância", "Sempre mantém a palavra, custe o que custar", "Desconfia de estranhos mas é leal aos amigos", "Busca aventura e emoção a todo custo", "É obcecado com ouro e riquezas", "Vive segundo um código de honra rígido", "Prefere agir sozinho e não confia em grupos", "É curioso sobre tudo que vê", "É gentil com os fracos e duro com os poderosos", "Guarda rancor por muito tempo"];
const APPEARANCES = ["Cicatriz no rosto, olhos castanhos", "Cabelos brancos apesar de jovem", "Veste roupas simples e surradas", "Usa um amuleto misterioso", "Alto e robusto, barba desgrenhada", "Baixo e ágil, sempre sorrindo", "Roupas finas, ar de nobreza", "Olhos de cores diferentes", "Tatuagem de serpente no braço", "Sempre de capuz"];
const NAMES = ["Aldric", "Brennan", "Caelum", "Dorian", "Ewen", "Fionn", "Gareth", "Isolde", "Jorin", "Kira", "Lena", "Mira", "Nora", "Orin", "Petra", "Rhian", "Soren", "Tava", "Vera", "Wren", "Zara", "Elara", "Lyra", "Maren"];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rollD20() { return Math.floor(Math.random() * 20) + 1; }
function mod(s: number) { const m = Math.floor((s - 10) / 2); return m >= 0 ? `+${m}` : `${m}`; }

const RANDOM_ATTACKS: NPCAttack[] = [
  { name: "Adaga", bonus: "+4", damage: "1d4+2", description: "Corpo a corpo ou arremesso, 1,5/6 m" },
  { name: "Espada Curta", bonus: "+4", damage: "1d6+2", description: "Corpo a corpo, 1,5 m" },
  { name: "Clava", bonus: "+3", damage: "1d6+1", description: "Corpo a corpo, 1,5 m" },
  { name: "Arco Curto", bonus: "+4", damage: "1d6+2", description: "À distância, 24/96 m" },
  { name: "Raio de Fogo", bonus: "+5", damage: "1d10", description: "Mágico à distância, 36 m" },
];

type NpcForm = Omit<DndNpc, "id" | "attacks"> & { attacks: NPCAttack[] };
const ATTR_LABELS: { key: "str" | "dex" | "con" | "int" | "wis" | "cha"; label: string }[] = [
  { key: "str", label: "FOR" }, { key: "dex", label: "DES" }, { key: "con", label: "CON" },
  { key: "int", label: "INT" }, { key: "wis", label: "SAB" }, { key: "cha", label: "CAR" },
];

function parseAttacks(json: string): NPCAttack[] { try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; } }
function emptyNpc(): NpcForm { return { name: "", race: "", role: "", alignment: "", trait: "", appearance: "", notes: "", hp: null, ac: null, str: null, dex: null, con: null, int: null, wis: null, cha: null, attacks: [] }; }
function randomNpc(): NpcForm {
  return { name: rand(NAMES), race: rand(RACES), role: rand(ROLES), alignment: rand(ALIGNMENTS), trait: rand(TRAITS), appearance: rand(APPEARANCES), notes: "",
    hp: randBetween(6, 36), ac: randBetween(10, 18), str: randBetween(8, 16), dex: randBetween(8, 16), con: randBetween(8, 16), int: randBetween(8, 16), wis: randBetween(8, 16), cha: randBetween(8, 16), attacks: [{ ...rand(RANDOM_ATTACKS) }] };
}

export function NpcCreator({ api }: { api: DndApi }) {
  const npcs = api.campaign.dndNpcs;
  const [mode, setMode] = useState<"random" | "manual">("random");
  const [form, setForm] = useState<NpcForm>(randomNpc());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newAtk, setNewAtk] = useState<NPCAttack>({ name: "", bonus: "", damage: "", description: "" });
  const [addInitTarget, setAddInitTarget] = useState<string | null>(null);
  const [addInitValue, setAddInitValue] = useState("");

  function regenerate() { setForm(randomNpc()); }
  function switchMode(m: "random" | "manual") { setMode(m); setForm(m === "random" ? randomNpc() : emptyNpc()); }
  async function saveNpc() {
    if (!form.name.trim()) return;
    await api.addChild("npcs", { ...form, attacks: JSON.stringify(form.attacks) });
    setForm(mode === "random" ? randomNpc() : emptyNpc());
  }
  function deleteNpc(id: string) { api.removeChild("npcs", id); if (expanded === id) setExpanded(null); }
  function addAttack() { if (!newAtk.name.trim()) return; setForm({ ...form, attacks: [...form.attacks, { ...newAtk }] }); setNewAtk({ name: "", bonus: "", damage: "", description: "" }); }
  function removeAttack(i: number) { setForm({ ...form, attacks: form.attacks.filter((_, j) => j !== i) }); }
  async function addToInitiative(npc: DndNpc) {
    const initiative = addInitValue !== "" ? Number(addInitValue) : rollD20();
    await api.addChild("combatants", { name: npc.name, initiative, hp: npc.hp, maxHp: npc.hp, tempHp: 0, ac: npc.ac, conditions: "[]", concentration: false, isPlayer: false, order: api.campaign.dndCombatants.length });
    setAddInitTarget(null); setAddInitValue("");
  }

  const inputStyle: React.CSSProperties = { padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", width: "100%", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 };
  const sectionLabel: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 };

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
        <input type="number" min="1" max="30" placeholder="—" value={(form[key] as number | null) ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value ? Number(e.target.value) : null })} style={{ ...inputStyle, textAlign: "center", padding: "8px 6px" }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 4, width: "fit-content" }}>
        {(["random", "manual"] as const).map((m) => (
          <button key={m} onClick={() => switchMode(m)} style={{ padding: "7px 18px", background: mode === m ? "var(--accent-dim)" : "transparent", color: mode === m ? "var(--accent-light)" : "var(--text-muted)", border: mode === m ? "1px solid var(--border-accent)" : "1px solid transparent", borderRadius: "var(--radius-lg)", fontSize: "0.82rem", fontWeight: mode === m ? 700 : 500, cursor: "pointer" }}>{m === "random" ? "Aleatório" : "Manual"}</button>
        ))}
      </div>

      <div style={{ padding: "24px", background: "var(--surface)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius-xl)", marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
          {textField("Nome", "name")}
          {textField("Raça", "race", { list: mode === "random" ? undefined : RACES })}
          {textField("Papel / Função", "role", { list: mode === "random" ? undefined : ROLES })}
          {textField("Tendência", "alignment", { list: mode === "random" ? undefined : ALIGNMENTS })}
        </div>
        <div className="dnd-npc-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {textField("Traço de Personalidade", "trait")}
          {textField("Aparência", "appearance")}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Notas</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Motivações, segredos, conexões..." style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ borderTop: "1px solid var(--border-accent)", paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Estatísticas de Combate <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></p>
          <div className="dnd-npc-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>{numField("PV Máx.", "hp")}{numField("CA", "ac")}</div>
          <div className="dnd-npc-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>{ATTR_LABELS.map(({ key, label }) => numField(label, key))}</div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-accent)", paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Ataques <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></p>
          {form.attacks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {form.attacks.map((atk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>{atk.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{atk.bonus && <span style={{ color: "var(--accent-light)" }}>{atk.bonus}</span>}{atk.bonus && atk.damage && " · "}{atk.damage && <span>{atk.damage}</span>}{atk.description && <span style={{ color: "var(--text-subtle)" }}> — {atk.description}</span>}</p>
                  </div>
                  <button onClick={() => removeAttack(i)} style={{ padding: "3px 7px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.75rem" }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div className="dnd-npc-attack-grid" style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px", gap: 8, marginBottom: 8 }}>
            <div><label style={labelStyle}>Nome do Ataque</label><input value={newAtk.name} onChange={(e) => setNewAtk({ ...newAtk, name: e.target.value })} placeholder="Ex: Espada Longa" style={inputStyle} /></div>
            <div><label style={labelStyle}>Bônus</label><input value={newAtk.bonus} onChange={(e) => setNewAtk({ ...newAtk, bonus: e.target.value })} placeholder="+5" style={inputStyle} /></div>
            <div><label style={labelStyle}>Dano</label><input value={newAtk.damage} onChange={(e) => setNewAtk({ ...newAtk, damage: e.target.value })} placeholder="1d8+3" style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Descrição do Ataque</label><input value={newAtk.description} onChange={(e) => setNewAtk({ ...newAtk, description: e.target.value })} placeholder="Ex: Corpo a corpo, alcance 1,5 m" style={inputStyle} /></div>
            <button onClick={addAttack} disabled={!newAtk.name.trim()} style={{ padding: "8px 14px", background: newAtk.name.trim() ? "var(--accent-dim)" : "var(--surface-2)", color: newAtk.name.trim() ? "var(--accent-light)" : "var(--text-subtle)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: newAtk.name.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>+ Ataque</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveNpc} disabled={!form.name.trim()} style={{ padding: "10px 22px", background: form.name.trim() ? "linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%)" : "var(--surface-2)", color: form.name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: form.name.trim() ? "pointer" : "not-allowed" }}>+ Adicionar NPC</button>
          {mode === "random" && <button onClick={regenerate} style={{ padding: "10px 18px", background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.86rem", cursor: "pointer" }}>Aleatório</button>}
        </div>
      </div>

      {npcs.length === 0 ? (
        <p style={{ fontSize: "0.86rem", color: "var(--text-subtle)", textAlign: "center", padding: "32px 0" }}>Nenhum NPC adicionado ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>{npcs.length} NPC{npcs.length !== 1 ? "s" : ""}</p>
          {npcs.map((npc) => {
            const attacks = parseAttacks(npc.attacks);
            return (
              <div key={npc.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer", gap: 10 }} onClick={() => setExpanded(expanded === npc.id ? null : npc.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "var(--radius)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-light)", fontSize: "0.9rem", flexShrink: 0 }}>{npc.race?.[0] ?? "N"}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{npc.name}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{[npc.race, npc.role, npc.alignment].filter(Boolean).join(" · ")}{(npc.hp || npc.ac) && <span style={{ color: "var(--accent-light)" }}>{npc.hp ? ` · PV ${npc.hp}` : ""}{npc.ac ? ` · CA ${npc.ac}` : ""}</span>}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); if (addInitTarget === npc.id) { setAddInitTarget(null); return; } setAddInitTarget(npc.id); setAddInitValue(""); }} style={{ padding: "5px 10px", background: addInitTarget === npc.id ? "var(--accent-glow)" : "var(--accent-dim)", color: "var(--accent-light)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>⚔ Iniciativa</button>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>{expanded === npc.id ? "▲" : "▼"}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteNpc(npc.id); }} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>×</button>
                  </div>
                </div>

                {addInitTarget === npc.id && (
                  <div onClick={(e) => e.stopPropagation()} style={{ padding: "12px 16px", borderTop: "1px solid var(--border-accent)", background: "var(--accent-dim)" }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8 }}>Valor de Iniciativa <span style={{ color: "var(--text-subtle)" }}>(vazio = d20)</span></p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" value={addInitValue} onChange={(e) => setAddInitValue(e.target.value)} placeholder="Rolar d20" autoFocus style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && addToInitiative(npc)} />
                      <button onClick={() => addToInitiative(npc)} style={{ padding: "8px 14px", background: "var(--accent-dim)", color: "var(--accent-light)", border: "1px solid var(--border-accent)", borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Adicionar</button>
                      <button onClick={() => setAddInitTarget(null)} style={{ padding: "8px 12px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.82rem", cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                )}

                {expanded === npc.id && (
                  <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border)" }}>
                    {ATTR_LABELS.some(({ key }) => npc[key] !== null) && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Atributos</p>
                        <div className="dnd-npc-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                          {ATTR_LABELS.map(({ key, label }) => (
                            <div key={key} style={{ textAlign: "center", padding: "6px 4px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</p>
                              <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{npc[key] ?? "—"}</p>
                              {npc[key] !== null && <p style={{ fontSize: "0.64rem", color: "var(--accent-light)" }}>{mod(npc[key] as number)}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="dnd-npc-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      {npc.trait && <div><p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Traço</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.trait}</p></div>}
                      {npc.appearance && <div><p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Aparência</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.appearance}</p></div>}
                    </div>
                    {npc.notes && <div style={{ marginBottom: 10 }}><p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Notas</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.notes}</p></div>}
                    {attacks.length > 0 && (
                      <div>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ataques</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {attacks.map((atk, i) => (
                            <div key={i} style={{ padding: "7px 10px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{atk.name}{atk.bonus && <span style={{ color: "var(--accent-light)", fontWeight: 400 }}> · {atk.bonus}</span>}{atk.damage && <span style={{ color: "var(--accent)", fontWeight: 400 }}> · {atk.damage}</span>}</p>
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
