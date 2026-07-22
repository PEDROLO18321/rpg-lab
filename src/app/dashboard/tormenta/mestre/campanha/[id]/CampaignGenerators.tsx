"use client";

import { useState } from "react";
import type { TormentaApi } from "@/lib/tormenta/useTormentaCampaign";
import { randomTormentaName } from "@/lib/tormenta/names";

const ACCENT = "#a01818";
const ACCENT_LIGHT = "#c94040";
const ACCENT_DIM = "rgba(160,24,24,0.12)";
const ACCENT_BORD = "rgba(160,24,24,0.28)";

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const TRAITS = ["desconfiado", "tagarela", "ganancioso", "covarde", "honrado", "arrogante", "supersticioso", "leal ao Reinado", "vingativo", "devoto de um deus de Arton"];
const MOTIVES = ["proteger a família", "ouro e tibares", "vingança contra a Tormenta", "poder político no Reinado", "conhecimento arcano proibido", "fé devota a um dos Doze", "fama e glória", "sobreviver à Grande Guerra", "redenção", "amor perdido"];
const TAVERNS = ["A Barrica de Doherimm", "O Javali de Tauran", "A Espada e o Cetro", "A Lua de Wynna", "O Porto de Kallis", "A Adaga Enferrujada", "O Grifo de Arsenal", "A Roda do Destino"];
const HOOKS = ["Um nobre do Reinado contrata o grupo para recuperar uma relíquia roubada.", "Aldeões somem perto de uma fenda da Tormenta.", "Uma caravana de comércio foi atacada por goblins na estrada.", "Um culto a Nizarhut realiza rituais à meia-noite.", "Um mapa para um tesouro perdido de Valkaria aparece em circunstâncias suspeitas.", "Crianças têm o mesmo pesadelo profético sobre a Tormenta.", "Um morto-vivo é visto rondando um cemitério esquecido.", "Uma ponte essencial foi destruída — quem e por quê?"];
const COMPLICATIONS = ["A guarda real chega de surpresa.", "Um aliado trai o grupo.", "Uma armadilha arcana é acionada.", "A Tormenta avança sobre a região.", "Um item essencial se quebra.", "Reforços goblins chegam.", "Um inocente fica no fogo cruzado.", "O chão começa a ceder."];
const LOOT = ["Poção de cura (2d8+2 PV)", "10 T$ (tibares) em moedas", "Pergaminho de magia de 1º círculo", "Adaga +1", "Gema de Arton (50 T$)", "Chave enferrujada", "Mapa rasgado", "Anel sem encanto aparente", "Frasco de óleo", "Corda de seda (15 m)"];

interface Roll { label: string; value: string; }

export function CampaignGenerators({ api }: { api: TormentaApi }) {
  const [npc, setNpc] = useState<{ name: string; trait: string; motive: string } | null>(null);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  function genNpc() { setNpc({ name: randomTormentaName(), trait: rand(TRAITS), motive: rand(MOTIVES) }); }
  function push(label: string, value: string) { setRolls((r) => [{ label, value }, ...r].slice(0, 12)); }
  async function saveNpc() {
    if (!npc) return;
    await api.addChild("npcs", { name: npc.name, personality: npc.trait, notes: `Motivação: ${npc.motive}.`, attacks: "[]" });
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
            <button onClick={() => push("Nome", randomTormentaName())} style={genBtn}>Nome</button>
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
