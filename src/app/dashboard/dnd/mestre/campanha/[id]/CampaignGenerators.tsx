"use client";

import { useState } from "react";
import type { DndApi } from "@/lib/dnd/useDndCampaign";

const ACCENT = "var(--accent)";
const ACCENT_LIGHT = "var(--accent-light)";
const ACCENT_DIM = "var(--accent-dim)";
const ACCENT_BORD = "var(--border-accent)";

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const FIRST = ["Aldric", "Brennan", "Caelum", "Dorian", "Isolde", "Jorin", "Kira", "Lena", "Mira", "Orin", "Petra", "Soren", "Vera", "Wren", "Zara", "Elara", "Lyra", "Maren"];
const LAST = ["Pé-de-Ferro", "Corvonegro", "da Colina", "Mãolesta", "Punho-de-Pedra", "Sussurro", "Lobосinza", "do Vale", "Chama-Brilhante", "Sombria"];
const TRAITS = ["desconfiado", "tagarela", "ganancioso", "covarde", "honrado", "arrogante", "supersticioso", "leal", "vingativo", "bondoso"];
const MOTIVES = ["proteger a família", "ouro e riquezas", "vingança", "poder político", "conhecimento proibido", "fé devota", "fama e glória", "sobreviver", "redenção", "amor perdido"];
const TAVERNS = ["O Dragão Adormecido", "A Caneca Rachada", "O Javali Dourado", "A Lua Prateada", "O Porto Seguro", "A Espada Enferrujada", "O Grifo Vermelho", "A Roda do Destino"];
const HOOKS = ["Um nobre contrata o grupo para recuperar um item roubado.", "Aldeões somem perto de ruínas antigas.", "Uma caravana foi atacada na estrada.", "Um culto realiza rituais à meia-noite.", "Um mapa do tesouro aparece em circunstâncias suspeitas.", "Crianças têm o mesmo pesadelo profético.", "Um morto-vivo é visto rondando o cemitério.", "Uma ponte essencial foi destruída — quem e por quê?"];
const COMPLICATIONS = ["A guarda chega de surpresa.", "Um aliado trai o grupo.", "Uma armadilha é acionada.", "O clima muda drasticamente.", "Um item essencial quebra.", "Reforços inimigos chegam.", "Um inocente fica no fogo cruzado.", "O chão começa a ceder."];
const LOOT = ["Poção de cura (2d4+2)", "10 po em moedas", "Pergaminho de magia de 1º círculo", "Adaga +1", "Gema (50 po)", "Chave enferrujada", "Mapa rasgado", "Anel sem encanto aparente", "Frasco de óleo", "Corda de seda (15 m)"];

interface Roll { label: string; value: string; }

export function CampaignGenerators({ api }: { api: DndApi }) {
  const [npc, setNpc] = useState<{ name: string; trait: string; motive: string } | null>(null);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  function genNpc() { setNpc({ name: `${rand(FIRST)} ${rand(LAST)}`, trait: rand(TRAITS), motive: rand(MOTIVES) }); }
  function push(label: string, value: string) { setRolls((r) => [{ label, value }, ...r].slice(0, 12)); }
  async function saveNpc() {
    if (!npc) return;
    await api.addChild("npcs", { name: npc.name, trait: npc.trait, notes: `Motivação: ${npc.motive}.`, attacks: "[]" });
    setSaveMsg("✓ NPC adicionado à aba NPCs."); setTimeout(() => setSaveMsg(null), 3000);
  }

  const card: React.CSSProperties = { background: "var(--surface)", border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: "18px 20px" };
  const genBtn: React.CSSProperties = { padding: "8px 16px", background: ACCENT_DIM, color: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" };
  const title: React.CSSProperties = { fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: ACCENT_LIGHT }}>🎲</span> Geradores Aleatórios</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        <div style={card}>
          <p style={title}>NPC Instantâneo</p>
          {npc ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12, fontSize: "0.84rem", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{npc.name}</p>
              <p><strong style={{ color: ACCENT_LIGHT }}>Traço:</strong> {npc.trait}</p>
              <p><strong style={{ color: ACCENT_LIGHT }}>Motivação:</strong> {npc.motive}</p>
            </div>
          ) : <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", marginBottom: 12 }}>Gere um NPC com nome, traço e motivação.</p>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={genNpc} style={genBtn}>🎲 Gerar NPC</button>
            {npc && <button onClick={saveNpc} style={{ ...genBtn, background: `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`, color: "#06090f", border: "none" }}>+ Salvar em NPCs</button>}
          </div>
          {saveMsg && <p style={{ fontSize: "0.76rem", color: "#4ade80", marginTop: 8 }}>{saveMsg}</p>}
        </div>

        <div style={card}>
          <p style={title}>Tabelas Rápidas</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <button onClick={() => push("Nome", `${rand(FIRST)} ${rand(LAST)}`)} style={genBtn}>Nome</button>
            <button onClick={() => push("Taverna", rand(TAVERNS))} style={genBtn}>Taverna</button>
            <button onClick={() => push("Gancho", rand(HOOKS))} style={genBtn}>Gancho</button>
            <button onClick={() => push("Complicação", rand(COMPLICATIONS))} style={genBtn}>Complicação</button>
            <button onClick={() => push("Tesouro", rand(LOOT))} style={genBtn}>Tesouro</button>
          </div>
          {rolls.length === 0 ? <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>Clique para gerar resultados.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {rolls.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: "0.82rem", padding: "4px 0", borderBottom: i === rolls.length - 1 ? "none" : "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 84 }}>{r.label}</span>
                  <span style={{ color: "var(--text-muted)", flex: 1 }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
