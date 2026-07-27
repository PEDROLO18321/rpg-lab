"use client";

import { useState } from "react";
import type { OperacaoApi } from "@/lib/ordem/useOperacao";
import type { OrdemNpc, OrdemNPCAttack } from "@/lib/ordem/ordemCampaignClient";
import { randomOrdemName } from "@/lib/ordem/names";
import "../../../ordem-responsive.css";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

const ROLES = [
  "Civil", "Policial", "Médico", "Jornalista", "Professor", "Estudante", "Empresário",
  "Segurança", "Político", "Cientista", "Religioso", "Criminoso", "Detetive", "Militar",
  "Cultista", "Membro de Seita", "Agente da Ordo Realitas", "Ocultista", "Sobrevivente",
];
const AFFILIATIONS = [
  "Civil sem ligação", "Ordo Realitas", "Culto do Outro Lado", "Seita do Sangue",
  "Devoto da Morte", "Buscador de Conhecimento", "Vítima do Paranormal", "Testemunha",
  "Informante", "Cético hostil",
];
const PERSONALITIES = [
  "Desconfiado e fechado, esconde o que sabe", "Curioso demais para o próprio bem",
  "Aterrorizado pelo que viu mas não esquece", "Finge normalidade enquanto se despedaça por dentro",
  "Fanático por uma entidade do Outro Lado", "Calmo sob pressão, corajoso",
  "Nervoso e propenso a surtos", "Pragmático, faz o necessário",
  "Obcecado por uma teoria sobre o Paranormal", "Manipulador, busca poder",
];
const RANDOM_ATTACKS: OrdemNPCAttack[] = [
  { name: "Soco", test: "Luta", damage: "1d3+FOR", description: "Corpo a corpo" },
  { name: "Faca", test: "Luta", damage: "1d6+FOR", description: "Corpo a corpo, leve" },
  { name: "Pistola", test: "Pontaria", damage: "2d6", description: "À distância, alcance médio" },
  { name: "Submetralhadora", test: "Pontaria", damage: "3d6", description: "À distância, automática" },
  { name: "Cassetete", test: "Luta", damage: "1d6+FOR", description: "Corpo a corpo, contundente" },
  { name: "Espingarda", test: "Pontaria", damage: "4d6", description: "À distância, curta" },
];

type NpcForm = {
  name: string; role: string; age: number | null; gender: string; affiliation: string;
  description: string; personality: string; paranormalTies: string; notes: string;
  agi: number | null; forca: number | null; int: number | null; pre: number | null; vig: number | null;
  pv: number | null; pe: number | null; san: number | null; defense: number | null;
  attacks: OrdemNPCAttack[];
};

const ATTR_LABELS: { key: "agi" | "forca" | "int" | "pre" | "vig"; label: string }[] = [
  { key: "agi", label: "AGI" }, { key: "forca", label: "FOR" }, { key: "int", label: "INT" },
  { key: "pre", label: "PRE" }, { key: "vig", label: "VIG" },
];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function parseAttacks(json: string): OrdemNPCAttack[] {
  try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; }
}

function emptyNpc(): NpcForm {
  return { name: "", role: "", age: null, gender: "", affiliation: "", description: "", personality: "", paranormalTies: "", notes: "", agi: null, forca: null, int: null, pre: null, vig: null, pv: null, pe: null, san: null, defense: null, attacks: [] };
}
function randomNpc(): NpcForm {
  const vig = randBetween(1, 3); const agi = randBetween(1, 3);
  return {
    name: randomOrdemName(), role: rand(ROLES), age: randBetween(18, 65),
    gender: rand(["Masculino", "Feminino", "Não-binário"]), affiliation: rand(AFFILIATIONS),
    description: rand(["Aparência comum, fácil de esquecer", "Olhar cansado e desconfiado", "Bem vestido, postura rígida", "Mãos trêmulas, sempre nervoso", "Cicatrizes inexplicáveis"]),
    personality: rand(PERSONALITIES),
    paranormalTies: rand(["Nenhuma (por enquanto)", "Testemunhou algo que não devia", "Membro de culto menor", "Pesadelos recorrentes", "Possui item paranormal"]),
    notes: "", agi, forca: randBetween(1, 3), int: randBetween(1, 3), pre: randBetween(1, 3), vig,
    pv: 10 + vig * 5 + randBetween(0, 5), pe: 2 + randBetween(0, 4), san: 10 + randBetween(0, 10),
    defense: 10 + agi, attacks: [{ ...rand(RANDOM_ATTACKS) }],
  };
}

export function OrdemNpcCreator({ api }: { api: OperacaoApi }) {
  const npcs = api.campaign.ordemNpcs;
  const [mode, setMode] = useState<"random" | "manual">("random");
  const [form, setForm] = useState<NpcForm>(randomNpc());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newAtk, setNewAtk] = useState<OrdemNPCAttack>({ name: "", test: "", damage: "", description: "" });
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
  function addAttack() { if (!newAtk.name.trim()) return; setForm({ ...form, attacks: [...form.attacks, { ...newAtk }] }); setNewAtk({ name: "", test: "", damage: "", description: "" }); }
  function removeAttack(i: number) { setForm({ ...form, attacks: form.attacks.filter((_, j) => j !== i) }); }

  async function addToInitiative(npc: OrdemNpc) {
    const init = addInitValue !== "" ? Number(addInitValue) : (npc.agi ?? 1) + Math.floor(Math.random() * 20) + 1;
    await api.addChild("combatants", {
      name: npc.name, init, pv: npc.pv, maxPv: npc.pv, pe: npc.pe, maxPe: npc.pe,
      san: npc.san, maxSan: npc.san, rd: 0, isPlayer: false, conditions: "[]", order: api.campaign.ordemCombatants.length,
    });
    setAddInitTarget(null); setAddInitValue("");
  }

  const inputStyle: React.CSSProperties = { padding: "8px 10px", background: "var(--surface-2)", border: `1px solid ${AB}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", width: "100%", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.68rem", fontWeight: 700, color: A, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 };
  const sectionLabel: React.CSSProperties = { fontSize: "0.7rem", fontWeight: 700, color: A, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 };

  function textField(label: string, key: keyof NpcForm, opts?: { list?: string[] }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={labelStyle}>{label}</label>
        {opts?.list ? (
          <select value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle}>
            <option value="">Selecionar...</option>
            {opts.list.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
        )}
      </div>
    );
  }
  function numField(label: string, key: keyof NpcForm, max = 99) {
    return (
      <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ ...labelStyle, textAlign: "center" }}>{label}</label>
        <input type="number" min="0" max={max} placeholder="—" value={(form[key] as number | null) ?? ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value ? Number(e.target.value) : null })}
          style={{ ...inputStyle, textAlign: "center", padding: "8px 4px" }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 4, width: "fit-content" }}>
        {(["random", "manual"] as const).map((m) => (
          <button key={m} onClick={() => switchMode(m)} style={{ padding: "7px 18px", background: mode === m ? AD : "transparent", color: mode === m ? AL : "var(--text-muted)", border: mode === m ? `1px solid ${AB}` : "1px solid transparent", borderRadius: "var(--radius-lg)", fontSize: "0.82rem", fontWeight: mode === m ? 700 : 500, cursor: "pointer" }}>
            {m === "random" ? "Aleatório" : "Manual"}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px", background: "var(--surface)", border: `1px solid ${AB}`, borderRadius: "var(--radius-xl)", marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
          {textField("Nome", "name")}
          {textField("Ocupação", "role", { list: mode === "random" ? undefined : ROLES })}
          {textField("Gênero", "gender")}
          {textField("Afiliação", "affiliation", { list: mode === "random" ? undefined : AFFILIATIONS })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {textField("Personalidade", "personality")}
          {textField("Descrição", "description")}
        </div>
        <div style={{ marginBottom: 12 }}>{textField("Ligação com o Paranormal", "paranormalTies")}</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Notas</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Segredos, motivações, conexões com os agentes..." style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ borderTop: `1px solid ${AB}`, paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Atributos <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></p>
          <div className="op-npc-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
            {ATTR_LABELS.map(({ key, label }) => numField(label, key, 9))}
          </div>
          <div className="op-npc-vitals-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {numField("PV", "pv")}{numField("PE", "pe")}{numField("SAN", "san")}{numField("DEFESA", "defense")}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${AB}`, paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Ataques <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></p>
          {form.attacks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {form.attacks.map((atk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>{atk.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {atk.test && <span style={{ color: AL }}>{atk.test}</span>}
                      {atk.test && atk.damage && " · "}{atk.damage && <span>{atk.damage}</span>}
                      {atk.description && <span style={{ color: "var(--text-subtle)" }}> — {atk.description}</span>}
                    </p>
                  </div>
                  <button onClick={() => removeAttack(i)} style={{ padding: "3px 7px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.75rem" }}>×</button>
                </div>
              ))}
            </div>
          )}
          <div className="op-npc-attack-row" style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px", gap: 8, marginBottom: 8 }}>
            <div><label style={labelStyle}>Nome</label><input value={newAtk.name} onChange={(e) => setNewAtk({ ...newAtk, name: e.target.value })} placeholder="Ex: Pistola" style={inputStyle} /></div>
            <div><label style={labelStyle}>Teste</label><input value={newAtk.test} onChange={(e) => setNewAtk({ ...newAtk, test: e.target.value })} placeholder="Pontaria" style={inputStyle} /></div>
            <div><label style={labelStyle}>Dano</label><input value={newAtk.damage} onChange={(e) => setNewAtk({ ...newAtk, damage: e.target.value })} placeholder="2d6" style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Descrição</label>
              <input value={newAtk.description} onChange={(e) => setNewAtk({ ...newAtk, description: e.target.value })} placeholder="Ex: Alcance médio, perfurante" style={inputStyle} />
            </div>
            <button onClick={addAttack} disabled={!newAtk.name.trim()} style={{ padding: "8px 14px", background: newAtk.name.trim() ? AD : "var(--surface-2)", color: newAtk.name.trim() ? AL : "var(--text-subtle)", border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: newAtk.name.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>+ Ataque</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveNpc} disabled={!form.name.trim()} style={{ padding: "10px 22px", background: form.name.trim() ? `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)` : "var(--surface-2)", color: form.name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: form.name.trim() ? "pointer" : "not-allowed" }}>+ Adicionar NPC</button>
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
                    <div style={{ width: 34, height: 34, borderRadius: "var(--radius)", background: AD, border: `1px solid ${AB}`, display: "flex", alignItems: "center", justifyContent: "center", color: AL, fontSize: "0.9rem", flexShrink: 0 }}>{npc.name?.[0] ?? "N"}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{npc.name}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {[npc.role, npc.age ? `${npc.age} anos` : null].filter(Boolean).join(" · ")}
                        {(npc.pv || npc.san) && <span style={{ color: AL }}>{npc.pv ? ` · PV ${npc.pv}` : ""}{npc.san ? ` · SAN ${npc.san}` : ""}</span>}
                      </p>
                      {npc.paranormalTies && npc.paranormalTies !== "Nenhuma (por enquanto)" && (
                        <span style={{ fontSize: "0.63rem", color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "var(--radius-xs)", padding: "1px 6px", display: "inline-block", marginTop: 2 }}>Paranormal</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); if (addInitTarget === npc.id) { setAddInitTarget(null); return; } setAddInitTarget(npc.id); setAddInitValue(""); }} style={{ padding: "5px 10px", background: AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>⚡ Ordem</button>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>{expanded === npc.id ? "▲" : "▼"}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteNpc(npc.id); }} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>×</button>
                  </div>
                </div>

                {addInitTarget === npc.id && (
                  <div onClick={(e) => e.stopPropagation()} style={{ padding: "12px 16px", borderTop: `1px solid ${AB}`, background: AD }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8 }}>Iniciativa para ordem de ação <span style={{ color: "var(--text-subtle)" }}>(vazio = AGI + d20)</span></p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" value={addInitValue} onChange={(e) => setAddInitValue(e.target.value)} placeholder={`AGI: ${npc.agi ?? "?"}`} autoFocus style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && addToInitiative(npc)} />
                      <button onClick={() => addToInitiative(npc)} style={{ padding: "8px 14px", background: AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Adicionar</button>
                      <button onClick={() => setAddInitTarget(null)} style={{ padding: "8px 12px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.82rem", cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                )}

                {expanded === npc.id && (
                  <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border)" }}>
                    {ATTR_LABELS.some(({ key }) => npc[key] !== null) && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: A, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Atributos</p>
                        <div className="op-npc-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                          {ATTR_LABELS.map(({ key, label }) => (
                            <div key={key} style={{ textAlign: "center", padding: "6px 2px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: "0.56rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</p>
                              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>{npc[key] ?? "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      {npc.personality && <div><p style={{ fontSize: "0.64rem", fontWeight: 700, color: A, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Personalidade</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.personality}</p></div>}
                      {npc.description && <div><p style={{ fontSize: "0.64rem", fontWeight: 700, color: A, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Descrição</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.description}</p></div>}
                    </div>
                    {npc.paranormalTies && <div style={{ marginBottom: 10 }}><p style={{ fontSize: "0.64rem", fontWeight: 700, color: A, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Ligação com o Paranormal</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.paranormalTies}</p></div>}
                    {npc.notes && <div style={{ marginBottom: 10 }}><p style={{ fontSize: "0.64rem", fontWeight: 700, color: A, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Notas</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.notes}</p></div>}
                    {attacks.length > 0 && (
                      <div>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: A, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ataques</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {attacks.map((atk, i) => (
                            <div key={i} style={{ padding: "7px 10px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                                {atk.name}{atk.test && <span style={{ color: AL, fontWeight: 400 }}> · {atk.test}</span>}{atk.damage && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}> · {atk.damage}</span>}
                              </p>
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
