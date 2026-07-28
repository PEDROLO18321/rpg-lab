"use client";

import { useState } from "react";
import type { StarWarsApi } from "@/lib/starwars/useStarWarsCampaign";
import type { StarWarsNpc, NPCAttack } from "@/lib/starwars/starwarsCampaignClient";
import { SPECIES } from "@/lib/starwars/species";
import { CLASSES } from "@/lib/starwars/classes";

const ACCENT = "#3b82c4";
const ACCENT_LIGHT = "#69a8e0";
const ACCENT_DIM = "rgba(59,130,196,0.12)";
const ACCENT_BORD = "rgba(59,130,196,0.28)";
const ACCENT_GLOW = "rgba(59,130,196,0.22)";

const SPECIES_NAMES = SPECIES.map((s) => s.name);
const ROLES = CLASSES.filter((c) => !c.isAdvanced).map((c) => c.name);
const TRAITS = ["Fala demais sobre assuntos sem importância", "Sempre mantém a palavra, custe o que custar", "Desconfia de estranhos mas é leal aos aliados", "Busca aventura e emoção a todo custo", "É obcecado com créditos e riquezas", "Vive segundo um código de honra rígido", "Prefere agir sozinho e não confia em grupos", "É curioso sobre tudo que vê", "É gentil com os fracos e duro com os poderosos", "Guarda rancor por muito tempo"];
const APPEARANCES = ["Cicatriz no rosto, olhar frio", "Cabelos brancos apesar de jovem", "Veste roupas simples e surradas", "Usa um amuleto de origem desconhecida", "Alto e robusto, postura marcial", "Baixo e ágil, sempre alerta", "Roupas finas, ar de autoridade", "Olhos de cores diferentes", "Tatuagem tribal no braço", "Sempre encapuzado"];
const NAMES = ["Broktar", "Ingram", "Fren", "Dok", "Artorius", "Kadeen", "Rhogar", "Gorack", "Reynard", "Golinda", "Lisandra", "Gwen", "Asha", "Niala", "Raven", "Salini", "Aivy", "Sima", "Leona", "Vallen"];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randBetween(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rollD20() { return Math.floor(Math.random() * 20) + 1; }

const RANDOM_ATTACKS: NPCAttack[] = [
  { name: "Vibrolâmina", bonus: "+4", damage: "1d6+2", description: "Corpo a corpo, alcance pessoal" },
  { name: "Blaster de Mão", bonus: "+4", damage: "2d6", description: "À distância, curto alcance" },
  { name: "Rifle Blaster", bonus: "+5", damage: "3d6", description: "À distância, longo alcance" },
  { name: "Sabre de Luz", bonus: "+5", damage: "2d8", description: "Corpo a corpo, ignora armadura comum" },
  { name: "Golpe da Força", bonus: "+5", damage: "1d10", description: "À distância curta, empurra o alvo" },
];

interface FamousCharacter {
  name: string; source: "Canon" | "Legends"; species: string; role: string; level: number;
  pv: number; agi: number; int: number; forca: number; vig: number; pre: number; sen: number;
  personality: string; description: string;
}

const FAMOUS_CHARACTERS: FamousCharacter[] = [
  { name: "Luke Skywalker", source: "Canon", species: "Humano", role: "Cavaleiro Jedi", level: 45,
    pv: 70, agi: 5, int: 3, forca: 3, vig: 4, pre: 4, sen: 7,
    personality: "Idealista, compassivo, recusa-se a desistir de quem ama.",
    description: "Herói da Aliança Rebelde, treinado por Obi-Wan e Yoda, restaurou a Ordem Jedi." },
  { name: "Darth Vader (Anakin Skywalker)", source: "Canon", species: "Humano", role: "Lorde Sith", level: 70,
    pv: 140, agi: 4, int: 4, forca: 6, vig: 7, pre: 6, sen: 8,
    personality: "Implacável, consumido pela raiva e pelo arrependimento.",
    description: "Ex-Jedi caído ao Lado Sombrio, mão direita do Imperador Palpatine, metade homem metade máquina." },
  { name: "Imperador Palpatine (Darth Sidious)", source: "Canon", species: "Humano", role: "Senhor Sith / Imperador", level: 90,
    pv: 120, agi: 1, int: 6, forca: 1, vig: 3, pre: 7, sen: 10,
    personality: "Manipulador cirúrgico, paciente além da compreensão, sorri enquanto destrói impérios.",
    description: "Mestre Sith que derrubou a República por dentro e governou a galáxia como Imperador." },
  { name: "Obi-Wan Kenobi", source: "Canon", species: "Humano", role: "Mestre Jedi", level: 55,
    pv: 90, agi: 5, int: 5, forca: 3, vig: 4, pre: 5, sen: 7,
    personality: "Disciplinado, irônico sob pressão, carrega o peso de promessas antigas.",
    description: "Mestre Jedi que treinou Anakin e depois Luke, sobrevivendo escondido em Tatooine por décadas." },
  { name: "Yoda", source: "Canon", species: "Espécie desconhecida (mesma de Yoda)", role: "Grão-Mestre Jedi", level: 99,
    pv: 110, agi: 4, int: 6, forca: 2, vig: 3, pre: 6, sen: 10,
    personality: "Enigmático, paciente, fala de trás pra frente e pensa em séculos.",
    description: "Grão-Mestre do Conselho Jedi por 800 anos, um dos usuários da Força mais poderosos já vistos." },
  { name: "Leia Organa", source: "Canon", species: "Humano", role: "Diplomata / Líder Rebelde", level: 30,
    pv: 50, agi: 3, int: 5, forca: 2, vig: 3, pre: 7, sen: 3,
    personality: "Firme, corajosa, nunca perde a compostura mesmo sob tortura.",
    description: "Princesa de Alderaan, fundadora da Aliança Rebelde e depois da Resistência." },
  { name: "Han Solo", source: "Canon", species: "Humano", role: "Contrabandista / Piloto", level: 25,
    pv: 45, agi: 5, int: 3, forca: 3, vig: 4, pre: 5, sen: 0,
    personality: "Cínico por fora, leal por dentro, sempre tem um plano ruim que meio que funciona.",
    description: "Contrabandista dono da Millennium Falcon, general da Aliança Rebelde." },
  { name: "Chewbacca", source: "Canon", species: "Wookiee", role: "Guerreiro / Copiloto", level: 30,
    pv: 70, agi: 3, int: 2, forca: 7, vig: 6, pre: 3, sen: 0,
    personality: "Leal até a morte, rosna quando nervoso, nunca deixa um amigo pra trás.",
    description: "Wookiee de Kashyyyk, copiloto e melhor amigo de Han Solo por décadas." },
  { name: "Boba Fett", source: "Canon", species: "Humano (clone)", role: "Caçador de Recompensas", level: 40,
    pv: 80, agi: 6, int: 4, forca: 4, vig: 5, pre: 3, sen: 0,
    personality: "Profissional frio, cumpre o contrato, nunca subestima o alvo.",
    description: "Clone de Jango Fett criado sem modificações, o caçador de recompensas mais temido da galáxia." },
  { name: "Ahsoka Tano", source: "Canon", species: "Togruta", role: "Ex-Padawan Jedi", level: 50,
    pv: 95, agi: 7, int: 4, forca: 4, vig: 5, pre: 4, sen: 8,
    personality: "Independente, questiona autoridade, guiada por seu próprio código.",
    description: "Ex-Padawan de Anakin Skywalker que deixou a Ordem Jedi e sobreviveu à Ordem 66 por conta própria." },
  { name: "Darth Maul", source: "Canon", species: "Zabrak", role: "Lorde Sith", level: 45,
    pv: 90, agi: 8, int: 3, forca: 5, vig: 5, pre: 4, sen: 7,
    personality: "Obcecado por vingança, disciplinado no combate, ódio como combustível.",
    description: "Aprendiz sith de Darth Sidious, duelista mortal com sabre de luz de lâmina dupla." },
  { name: "Rey Skywalker", source: "Canon", species: "Humano", role: "Jedi", level: 35,
    pv: 65, agi: 6, int: 4, forca: 4, vig: 5, pre: 4, sen: 8,
    personality: "Determinada, teme o próprio potencial, busca pertencimento.",
    description: "Sucateira de Jakku que descobriu ser neta de Palpatine e se tornou a última Jedi de sua geração." },
  { name: "Kylo Ren (Ben Solo)", source: "Canon", species: "Humano", role: "Cavaleiro de Ren / Sith", level: 40,
    pv: 85, agi: 4, int: 4, forca: 6, vig: 5, pre: 5, sen: 7,
    personality: "Instável, dividido entre a luz e a sombra, raiva mal contida.",
    description: "Filho de Han Solo e Leia Organa, seduzido ao Lado Sombrio, líder da Primeira Ordem." },
  { name: "General Grievous", source: "Canon", species: "Cyborg Kaleesh", role: "General Droide", level: 35,
    pv: 100, agi: 7, int: 3, forca: 6, vig: 6, pre: 3, sen: 0,
    personality: "Orgulhoso colecionador de sabres de luz, tossidor crônico, covarde quando perde vantagem.",
    description: "General supremo dos Exércitos de Droides da Confederação, corpo quase todo mecânico." },
  { name: "Revan", source: "Legends", species: "Humano", role: "Jedi / Senhor Sith", level: 80,
    pv: 150, agi: 5, int: 6, forca: 5, vig: 5, pre: 6, sen: 9,
    personality: "Estrategista brilhante, disposto a se sacrificar (ou condenar-se) pela galáxia.",
    description: "Ex-Jedi que virou Senhor Sith nas Guerras Mandalorianas e depois retornou à Luz — lenda da Guerra Fria Sith." },
  { name: "Darth Bane", source: "Legends", species: "Humano", role: "Lorde Sith", level: 75,
    pv: 140, agi: 4, int: 6, forca: 4, vig: 5, pre: 5, sen: 8,
    personality: "Frio e calculista, acredita que só o mais forte deve sobreviver.",
    description: "Criador da Regra dos Dois — sempre um mestre e um aprendiz — que guiou os Sith na sombra por mil anos." },
  { name: "Mara Jade", source: "Legends", species: "Humano", role: "Mão do Imperador / Jedi", level: 45,
    pv: 85, agi: 7, int: 4, forca: 3, vig: 4, pre: 4, sen: 7,
    personality: "Afiada, sarcástica, leal a quem conquista sua confiança (o que não é fácil).",
    description: "Assassina de elite treinada por Palpatine, mais tarde Jedi e esposa de Luke Skywalker." },
  { name: "Exar Kun", source: "Legends", species: "Humano", role: "Lorde Sith", level: 60,
    pv: 120, agi: 4, int: 5, forca: 5, vig: 5, pre: 5, sen: 8,
    personality: "Ambicioso além da razão, seduzido pelo conhecimento sith proibido.",
    description: "Ex-Cavaleiro Jedi que se tornou Lorde Sith durante as Grandes Guerras Sith, mestre de necromancia da Força." },
];

function loadFamous(c: FamousCharacter): NpcForm {
  return {
    name: c.name, species: c.species, role: `${c.role} (Nível ${c.level})`,
    description: c.description, personality: c.personality, notes: `Fonte: ${c.source}.`,
    pv: c.pv, agi: c.agi, int: c.int, forca: c.forca, vig: c.vig, pre: c.pre, sen: c.sen,
    attacks: [],
  };
}

type NpcForm = Omit<StarWarsNpc, "id" | "attacks"> & { attacks: NPCAttack[] };
const ATTR_LABELS: { key: "agi" | "int" | "forca" | "vig" | "pre" | "sen"; label: string }[] = [
  { key: "agi", label: "AGI" }, { key: "int", label: "INT" }, { key: "forca", label: "FOR" },
  { key: "vig", label: "VIG" }, { key: "pre", label: "PRE" }, { key: "sen", label: "SEN" },
];

function parseAttacks(json: string): NPCAttack[] { try { const a = JSON.parse(json); return Array.isArray(a) ? a : []; } catch { return []; } }
function emptyNpc(): NpcForm { return { name: "", species: "", role: "", description: "", personality: "", notes: "", pv: null, agi: null, int: null, forca: null, vig: null, pre: null, sen: null, attacks: [] }; }
function randomNpc(): NpcForm {
  return { name: rand(NAMES), species: rand(SPECIES_NAMES), role: rand(ROLES), description: rand(APPEARANCES), personality: rand(TRAITS), notes: "",
    pv: randBetween(6, 36), agi: randBetween(1, 4), int: randBetween(1, 4), forca: randBetween(1, 4), vig: randBetween(1, 4), pre: randBetween(1, 4), sen: randBetween(1, 4), attacks: [{ ...rand(RANDOM_ATTACKS) }] };
}

export function NpcCreator({ api }: { api: StarWarsApi }) {
  const npcs = api.campaign.starWarsNpcs;
  const [mode, setMode] = useState<"random" | "manual" | "famous">("random");
  const [form, setForm] = useState<NpcForm>(randomNpc());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newAtk, setNewAtk] = useState<NPCAttack>({ name: "", bonus: "", damage: "", description: "" });
  const [addInitTarget, setAddInitTarget] = useState<string | null>(null);
  const [addInitValue, setAddInitValue] = useState("");

  function regenerate() { setForm(randomNpc()); }
  function switchMode(m: "random" | "manual" | "famous") { setMode(m); setForm(m === "random" ? randomNpc() : emptyNpc()); }
  async function saveNpc() {
    if (!form.name.trim()) return;
    await api.addChild("npcs", { ...form, attacks: JSON.stringify(form.attacks) });
    setForm(mode === "random" ? randomNpc() : emptyNpc());
  }
  function deleteNpc(id: string) { api.removeChild("npcs", id); if (expanded === id) setExpanded(null); }
  function addAttack() { if (!newAtk.name.trim()) return; setForm({ ...form, attacks: [...form.attacks, { ...newAtk }] }); setNewAtk({ name: "", bonus: "", damage: "", description: "" }); }
  function removeAttack(i: number) { setForm({ ...form, attacks: form.attacks.filter((_, j) => j !== i) }); }
  async function addToInitiative(npc: StarWarsNpc) {
    const initiative = addInitValue !== "" ? Number(addInitValue) : rollD20();
    await api.addChild("combatants", { name: npc.name, initiative, pv: npc.pv, maxPv: npc.pv, pe: null, maxPe: null, conditions: "[]", isPlayer: false, order: api.campaign.starWarsCombatants.length });
    setAddInitTarget(null); setAddInitValue("");
  }

  const inputStyle: React.CSSProperties = { padding: "8px 10px", background: "var(--surface-2)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", color: "var(--text)", fontSize: "0.84rem", width: "100%", boxSizing: "border-box" };
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
        <input type="number" min="0" max="10" placeholder="—" value={(form[key] as number | null) ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value ? Number(e.target.value) : null })} style={{ ...inputStyle, textAlign: "center", padding: "8px 6px" }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 4, width: "fit-content" }}>
        {(["random", "manual", "famous"] as const).map((m) => (
          <button key={m} onClick={() => switchMode(m)} style={{ padding: "7px 18px", background: mode === m ? ACCENT_DIM : "transparent", color: mode === m ? ACCENT_LIGHT : "var(--text-muted)", border: mode === m ? `1px solid ${ACCENT_BORD}` : "1px solid transparent", borderRadius: "var(--radius-lg)", fontSize: "0.82rem", fontWeight: mode === m ? 700 : 500, cursor: "pointer" }}>{m === "random" ? "Aleatório" : m === "manual" ? "Manual" : "Personagens Famosos"}</button>
        ))}
      </div>

      {mode === "famous" && (
        <div style={{ padding: "20px", background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", marginBottom: 20 }}>
          <p style={sectionLabel}>Escolha um personagem <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(Canon e Legends) — carrega os stats abaixo pra ajustar e salvar</span></p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8, maxHeight: 360, overflowY: "auto" }}>
            {FAMOUS_CHARACTERS.map((c) => (
              <button key={c.name} onClick={() => setForm(loadFamous(c))} style={{ textAlign: "left", padding: "10px 12px", background: form.name === c.name ? ACCENT_DIM : "var(--surface-2)", border: `1px solid ${form.name === c.name ? ACCENT_BORD : "var(--border)"}`, borderRadius: "var(--radius)", cursor: "pointer" }}>
                <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text)" }}>{c.name}</p>
                <p style={{ fontSize: "0.7rem", color: ACCENT_LIGHT }}>{c.role} · Nível {c.level}</p>
                <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)" }}>{c.species} · {c.source} · PV {c.pv}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: "24px", background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
          {textField("Nome", "name")}
          {textField("Espécie", "species", { list: mode === "manual" ? SPECIES_NAMES : undefined })}
          {textField("Papel / Classe", "role", { list: mode === "manual" ? ROLES : undefined })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {textField("Personalidade", "personality")}
          {textField("Descrição / Aparência", "description")}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Notas</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Motivações, segredos, conexões..." style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ borderTop: `1px solid ${ACCENT_BORD}`, paddingTop: 16, marginBottom: 16 }}>
          <p style={sectionLabel}>Estatísticas de Combate <span style={{ color: "var(--text-subtle)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></p>
          <div style={{ marginBottom: 12, maxWidth: 200 }}>{numField("PV Máx.", "pv")}</div>
          <div className="sw-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>{ATTR_LABELS.map(({ key, label }) => numField(label, key))}</div>
        </div>

        <div style={{ borderTop: `1px solid ${ACCENT_BORD}`, paddingTop: 16, marginBottom: 16 }}>
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
          <div className="sw-npc-attack-grid" style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px", gap: 8, marginBottom: 8 }}>
            <div><label style={labelStyle}>Nome do Ataque</label><input value={newAtk.name} onChange={(e) => setNewAtk({ ...newAtk, name: e.target.value })} placeholder="Ex: Rifle Blaster" style={inputStyle} /></div>
            <div><label style={labelStyle}>Bônus</label><input value={newAtk.bonus} onChange={(e) => setNewAtk({ ...newAtk, bonus: e.target.value })} placeholder="+5" style={inputStyle} /></div>
            <div><label style={labelStyle}>Dano</label><input value={newAtk.damage} onChange={(e) => setNewAtk({ ...newAtk, damage: e.target.value })} placeholder="3d6" style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Descrição do Ataque</label><input value={newAtk.description} onChange={(e) => setNewAtk({ ...newAtk, description: e.target.value })} placeholder="Ex: À distância, longo alcance" style={inputStyle} /></div>
            <button onClick={addAttack} disabled={!newAtk.name.trim()} style={{ padding: "8px 14px", background: newAtk.name.trim() ? ACCENT_DIM : "var(--surface-2)", color: newAtk.name.trim() ? ACCENT_LIGHT : "var(--text-subtle)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: newAtk.name.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>+ Ataque</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveNpc} disabled={!form.name.trim()} style={{ padding: "10px 22px", background: form.name.trim() ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)` : "var(--surface-2)", color: form.name.trim() ? "#06090f" : "var(--text-muted)", border: "none", borderRadius: "var(--radius)", fontSize: "0.86rem", fontWeight: 700, cursor: form.name.trim() ? "pointer" : "not-allowed" }}>+ Adicionar NPC</button>
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
                    <div style={{ width: 34, height: 34, borderRadius: "var(--radius)", background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT_LIGHT, fontSize: "0.9rem", flexShrink: 0 }}>{npc.species?.[0] ?? "N"}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{npc.name}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{[npc.species, npc.role].filter(Boolean).join(" · ")}{npc.pv && <span style={{ color: ACCENT_LIGHT }}>{` · PV ${npc.pv}`}</span>}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); if (addInitTarget === npc.id) { setAddInitTarget(null); return; } setAddInitTarget(npc.id); setAddInitValue(""); }} style={{ padding: "5px 10px", background: addInitTarget === npc.id ? ACCENT_GLOW : ACCENT_DIM, color: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>⚔ Iniciativa</button>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>{expanded === npc.id ? "▲" : "▼"}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteNpc(npc.id); }} style={{ padding: "4px 8px", background: "transparent", color: "var(--text-subtle)", border: "none", cursor: "pointer", fontSize: "0.8rem" }}>×</button>
                  </div>
                </div>

                {addInitTarget === npc.id && (
                  <div onClick={(e) => e.stopPropagation()} style={{ padding: "12px 16px", borderTop: `1px solid ${ACCENT_BORD}`, background: ACCENT_DIM }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 8 }}>Valor de Iniciativa <span style={{ color: "var(--text-subtle)" }}>(vazio = d20)</span></p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" value={addInitValue} onChange={(e) => setAddInitValue(e.target.value)} placeholder="Rolar d20" autoFocus style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && addToInitiative(npc)} />
                      <button onClick={() => addToInitiative(npc)} style={{ padding: "8px 14px", background: ACCENT_DIM, color: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Adicionar</button>
                      <button onClick={() => setAddInitTarget(null)} style={{ padding: "8px 12px", background: "transparent", color: "var(--text-subtle)", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: "0.82rem", cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                )}

                {expanded === npc.id && (
                  <div style={{ padding: "12px 16px 16px", borderTop: "1px solid var(--border)" }}>
                    {ATTR_LABELS.some(({ key }) => npc[key] !== null) && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Atributos</p>
                        <div className="sw-attr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                          {ATTR_LABELS.map(({ key, label }) => (
                            <div key={key} style={{ textAlign: "center", padding: "6px 4px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                              <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</p>
                              <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{npc[key] ?? "—"}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      {npc.personality && <div><p style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Personalidade</p><p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{npc.personality}</p></div>}
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
