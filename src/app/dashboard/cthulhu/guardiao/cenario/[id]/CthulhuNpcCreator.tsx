"use client";

import { useState } from "react";
import type { CthulhuApi } from "@/lib/cthulhu/useCthulhuCampaign";
import type { CthulhuNpc, CthulhuNPCAttack } from "@/lib/cthulhu/cthulhuCampaignClient";
import "../../../cthulhu-responsive.css";

const A = "#a3b86c";
const ABORD = "rgba(125,156,62,0.32)";
const ADIM = "rgba(125,156,62,0.14)";

const OCCUPATIONS = ["Antiquário", "Artista", "Cientista", "Clérigo", "Criminoso", "Detetive", "Diplomata", "Escritor", "Estudante", "Fazendeiro", "Jornalista", "Médico", "Militar", "Músico", "Navegador", "Ocultista", "Pescador", "Policial", "Professor", "Trabalhador", "Cultista", "Agente Secreto"];
const PERSONALITIES = ["Cético e racional, rejeita o sobrenatural", "Curioso demais para o próprio bem", "Aterrorizado pelo que sabe", "Finge normalidade enquanto despedaça por dentro", "Fanático por um culto", "Calmo sob pressão, corajoso", "Nervoso e propenso a crises", "Pragmático", "Teme a escuridão desde criança", "Obsessivo com teoria sobre o Mythos"];
const NAMES = ["Herbert", "Agatha", "Randolph", "Mildred", "Edward", "Florence", "Charles", "Dorothea", "Walter", "Beatrice", "Howard", "Constance", "George", "Harriet", "Ibrahim", "Chen", "Akira", "Pierre", "Heinrich", "Nikolai"];

const RANDOM_ATTACKS: CthulhuNPCAttack[] = [
  { name: "Punho", skill: "Briga 50%", damage: "1d3+DB", description: "Corpo a corpo" },
  { name: "Faca", skill: "Briga 25%", damage: "1d4+2+DB", description: "Corpo a corpo ou arremesso" },
  { name: "Revólver .38", skill: "Armas de Fogo 40%", damage: "1d10", description: "Alcance 15m, 6 balas" },
  { name: "Rifle", skill: "Armas de Fogo 35%", damage: "2d6+4", description: "Alcance 90m" },
  { name: "Espingarda", skill: "Armas de Fogo 30%", damage: "4d6", description: "Alcance 10m" },
];

type NpcForm = Omit<CthulhuNpc, "id" | "attacks"> & { attacks: CthulhuNPCAttack[] };
const ATTR_LABELS: { key: "str" | "con" | "siz" | "dex" | "int" | "pow" | "app" | "edu"; label: string }[] = [
  { key: "str", label: "FOR" }, { key: "con", label: "CON" }, { key: "siz", label: "TAM" }, { key: "dex", label: "DES" },
  { key: "int", label: "INT" }, { key: "pow", label: "POD" }, { key: "app", label: "APA" }, { key: "edu", label: "EDU" },
];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function parseAttacks(json: string): CthulhuNPCAttack[] { try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; } }

function emptyNpc(): NpcForm { return { name: "", occupation: "", age: null, gender: "", nationality: "", description: "", personality: "", mythosTies: "", notes: "", str: null, con: null, siz: null, dex: null, int: null, pow: null, app: null, edu: null, hp: null, san: null, attacks: [] }; }
function randomNpc(): NpcForm {
  const con = randBetween(30, 80), siz = randBetween(40, 80), pow = randBetween(30, 80);
  return { name: rand(NAMES), occupation: rand(OCCUPATIONS), age: randBetween(20, 65), gender: rand(["Masculino", "Feminino", "Não-binário"]),
    nationality: rand(["Americano", "Britânico", "Francês", "Alemão", "Italiano", "Brasileiro"]),
    description: rand(["Olhos fundos e cansados, sempre nervoso", "Aparência comum que esconde segredos", "Roupas bem cuidadas, postura rígida", "Mãos sempre tremendo", "Cicatrizes inexplicáveis"]),
    personality: rand(PERSONALITIES), mythosTies: rand(["Nenhum (por enquanto)", "Encontrou algo que não deveria", "Membro de culto menor", "Sonhos recorrentes", "Possui tomo proibido"]),
    notes: "", str: randBetween(30, 80), con, siz, dex: randBetween(30, 80), int: randBetween(50, 90), pow, app: randBetween(30, 80), edu: randBetween(40, 90),
    hp: Math.floor((con + siz) / 10), san: pow, attacks: [{ ...rand(RANDOM_ATTACKS) }] };
}

export function CthulhuNpcCreator({ api }: { api: CthulhuApi }) {
  const npcs = api.campaign.cthulhuNpcs;
  const [mode, setMode] = useState<"random" | "manual">("random");
  const [form, setForm] = useState<NpcForm>(randomNpc());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newAtk, setNewAtk] = useState<CthulhuNPCAttack>({ name: "", skill: "", damage: "", description: "" });
  const [addInitTarget, setAddInitTarget] = useState<string | null>(null);
  const [addInitValue, setAddInitValue] = useState("");

  function regenerate() { setForm(randomNpc()); }
  function switchMode(m: "random" | "manual") { setMode(m); setForm(m === "random" ? randomNpc() : emptyNpc()); }
  async function saveNpc() { if (!form.name.trim()) return; await api.addChild("npcs", { ...form, attacks: JSON.stringify(form.attacks) }); setForm(mode === "random" ? randomNpc() : emptyNpc()); }
  function deleteNpc(id: string) { api.removeChild("npcs", id); if (expanded === id) setExpanded(null); }
  function addAttack() { if (!newAtk.name.trim()) return; setForm({ ...form, attacks: [...form.attacks, { ...newAtk }] }); setNewAtk({ name: "", skill: "", damage: "", description: "" }); }
  function removeAttack(i: number) { setForm({ ...form, attacks: form.attacks.filter((_, j) => j !== i) }); }
  async function addToInitiative(npc: CthulhuNpc) {
    const dex = addInitValue !== "" ? Number(addInitValue) : (npc.dex ?? 50);
    await api.addChild("combatants", { name: npc.name, dex, hp: npc.hp, maxHp: npc.hp, san: npc.san, maxSan: npc.san, mp: null, maxMp: null, conditions: "[]", isPlayer: false, order: api.campaign.cthulhuCombatants.length });
    setAddInitTarget(null); setAddInitValue("");
  }

  const inputStyle: React.CSSProperties = { padding: "8px 10px", background: "var(--surface-2)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", width: "100%", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#7d9c3e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 };
  const sectionLabel: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, color: "#7d9c3e", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 };

  function textField(label: string, key: keyof NpcForm, opts?: { list?: string[] }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={labelStyle}>{label}</label>
        {opts?.list ? (
          <select value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle}><option value="">Selecionar...</option>{opts.list.map((o) => <option key={o}>{o}</option>)}</select>
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
        <input type="number" min="1" max="100" placeholder="—" value={(form[key] as number | null) ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value ? Number(e.target.value) : null })} style={{ ...inputStyle, textAlign: "center", padding: "8px 4px" }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 4, width: "fit-content" }}>
        {(["random", "manual"] as const).map((m) => (
          <button key={m} onClick={() => switchMode(m)} style={{ padding: "7px 18px", background: mode === m ? ADIM : "transparent", color: mode === m ? A : "var(--text-muted)", border: mode === m ? `1px solid ${ABORD}` : "1px solid transparent", borderRadius: "var(--radius-lg)", fontSize: "0.82rem", fontWeight: mode === m ? 700 : 500, cursor: "pointer" }}>{m === "random" ? "Aleatório" : "Manual"}</button>
        ))}
      </div>

      <div style={{ padding: "24px", background: "var(--surface)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius-xl)", marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
          {textField("Nome", "name")}
          {textField("Ocupação", "occupation", { list: mode === "random" ? undefined : OCCUPATIONS })}
          {textField("Gênero", "gender")}
          {textField("Nacionalidade", "nationality")}
        </div>
        <div className="cth-npc-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {textField("Personalidade", "personality")}
          {textField("Descrição", "description")}
        </div>
        <div style={{ marginBottom: 12 }}>{textField("Ligação com o Mythos", "mythosTies")}</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Notas</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Segredos, motivações, conexões..." style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ borderTop: `1px solid ${ABORD}`, paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Atributos <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></p>
          <div className="cth-npc-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8, marginBottom: 12 }}>{ATTR_LABELS.map(({ key, label }) => numField(label, key))}</div>
          <div className="cth-npc-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{numField("PV", "hp")}{numField("SAN", "san")}</div>
        </div>

        <div style={{ borderTop: `1px solid ${ABORD}`, paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Ataques <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></p>
          {form.attacks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {form.attacks.map((atk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>{atk.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{atk.skill && <span style={{ color: A }}>{atk.skill}</span>}{atk.skill && atk.damage && " · "}{atk.damage && <span>{atk.damage}</span>}{atk.description && <span style={{ color: "var(--text-subtle)" }}> — {atk.description}</span>}</p>
                  </div>
                  <button onClick={() => removeAttack(i)} style={{ padding: "3px 7px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.75rem" }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div className="cth-npc-atk-row" style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px", gap: 8, marginBottom: 8 }}>
            <div><label style={labelStyle}>Nome</label><input value={newAtk.name} onChange={(e) => setNewAtk({ ...newAtk, name: e.target.value })} placeholder="Ex: Revólver .38" style={inputStyle} /></div>
            <div><label style={labelStyle}>Perícia / %</label><input value={newAtk.skill} onChange={(e) => setNewAtk({ ...newAtk, skill: e.target.value })} placeholder="Briga 50%" style={inputStyle} /></div>
            <div><label style={labelStyle}>Dano</label><input value={newAtk.damage} onChange={(e) => setNewAtk({ ...newAtk, damage: e.target.value })} placeholder="1d10" style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Descrição</label><input value={newAtk.description} onChange={(e) => setNewAtk({ ...newAtk, description: e.target.value })} placeholder="Ex: Alcance 15m, 6 balas" style={inputStyle} /></div>
            <button onClick={addAttack} disabled={!newAtk.name.trim()} style={{ padding: "8px 14px", background: newAtk.name.trim() ? ADIM : "var(--surface-2)", color: newAtk.name.trim() ? A : "var(--text-subtle)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: newAtk.name.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>+ Ataque</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveNpc} disabled={!form.name.trim()} style={{ padding: "10px 22px", background: form.name.trim() ? "linear-gradient(135deg, #a3b86c 0%, #7d9c3e 100%)" : "var(--surface-2)", color: form.name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: form.name.trim() ? "pointer" : "not-allowed" }}>+ Adicionar NPC</button>
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
                    <div style={{ width: 34, height: 34, borderRadius: "var(--radius)", background: ADIM, border: `1px solid ${ABORD}`, display: "flex", alignItems: "center", justifyContent: "center", color: A, fontSize: "0.9rem", flexShrink: 0 }}>{npc.name?.[0] ?? "N"}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{npc.name}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{[npc.occupation, npc.age ? `${npc.age} anos` : null].filter(Boolean).join(" · ")}{(npc.hp || npc.san) && <span style={{ color: A }}>{npc.hp ? ` · PV ${npc.hp}` : ""}{npc.san ? ` · SAN ${npc.san}` : ""}</span>}</p>
                      {npc.mythosTies && npc.mythosTies !== "Nenhum (por enquanto)" && <span style={{ fontSize: "0.63rem", color: A, background: ADIM, border: `1px solid ${ABORD}`, borderRadius: "var(--radius-xs)", padding: "1px 6px", display: "inline-block", marginTop: 2 }}>Mythos</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); if (addInitTarget === npc.id) { setAddInitTarget(null); return; } setAddInitTarget(npc.id); setAddInitValue(""); }} style={{ padding: "5px 10px", background: ADIM, color: A, border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>⚡ Ordem</button>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>{expanded === npc.id ? "▲" : "▼"}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteNpc(npc.id); }} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>×</button>
                  </div>
                </div>

                {addInitTarget === npc.id && (
                  <div onClick={(e) => e.stopPropagation()} style={{ padding: "12px 16px", borderTop: `1px solid ${ABORD}`, background: ADIM }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8 }}>DEX para ordem de ação <span style={{ color: "var(--text-subtle)" }}>(vazio = DEX do NPC)</span></p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" value={addInitValue} onChange={(e) => setAddInitValue(e.target.value)} placeholder={`DEX: ${npc.dex ?? "?"}`} autoFocus style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && addToInitiative(npc)} />
                      <button onClick={() => addToInitiative(npc)} style={{ padding: "8px 14px", background: ADIM, color: A, border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Adicionar</button>
                      <button onClick={() => setAddInitTarget(null)} style={{ padding: "8px 12px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.82rem", cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                )}

                {expanded === npc.id && (
                  <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border)" }}>
                    {ATTR_LABELS.some(({ key }) => npc[key] !== null) && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "#7d9c3e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Atributos</p>
                        <div className="cth-npc-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 6 }}>
                          {ATTR_LABELS.map(({ key, label }) => (
                            <div key={key} style={{ textAlign: "center", padding: "6px 2px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: "0.56rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</p>
                              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>{npc[key] ?? "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="cth-npc-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      {npc.personality && <div><p style={{ fontSize: "0.64rem", fontWeight: 700, color: "#7d9c3e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Personalidade</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.personality}</p></div>}
                      {npc.description && <div><p style={{ fontSize: "0.64rem", fontWeight: 700, color: "#7d9c3e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Descrição</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.description}</p></div>}
                    </div>
                    {npc.mythosTies && <div style={{ marginBottom: 10 }}><p style={{ fontSize: "0.64rem", fontWeight: 700, color: "#7d9c3e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Ligação com o Mythos</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.mythosTies}</p></div>}
                    {npc.notes && <div style={{ marginBottom: 10 }}><p style={{ fontSize: "0.64rem", fontWeight: 700, color: "#7d9c3e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Notas</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.notes}</p></div>}
                    {attacks.length > 0 && (
                      <div>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: "#7d9c3e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ataques</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {attacks.map((atk, i) => (
                            <div key={i} style={{ padding: "7px 10px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{atk.name}{atk.skill && <span style={{ color: A, fontWeight: 400 }}> · {atk.skill}</span>}{atk.damage && <span style={{ color: "#7d9c3e", fontWeight: 400 }}> · {atk.damage}</span>}</p>
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
