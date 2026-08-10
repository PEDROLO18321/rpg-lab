"use client";

import { useState } from "react";
import type { StarWarsApi } from "@/lib/starwars/useStarWarsCampaign";
import { SPECIES } from "@/lib/starwars/species";
import { PLANETS } from "@/lib/starwars/planets";
import { CLASSES } from "@/lib/starwars/classes";
import { SW } from "../../../ui";

const ACCENT = SW.accent;
const ACCENT_LIGHT = SW.accentLight;
const ACCENT_DIM = SW.accentDim;
const ACCENT_BORD = SW.accentBord;

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const SPECIES_NAMES = SPECIES.map((s) => s.name);
const PLANET_NAMES = PLANETS.map((p) => p.name);
const CLASS_NAMES = CLASSES.map((c) => c.name);

const FIRST = ["Kael", "Rook", "Dax", "Bren", "Kira", "Vash", "Tarn", "Nova", "Riel", "Orin", "Sable", "Zeth", "Mira", "Jaxen", "Talyn", "Corin", "Ashka", "Doven", "Yssa", "Praxis"];
const LAST = ["Sarn", "Veyne", "Kestrel", "Ordo", "Nightsong", "Vantris", "Ohara", "Drex", "Illarion", "Wex", "Calrissian", "Farro", "Brakka", "Sunder", "Miraj", "Toth"];
const TRAITS = ["Fala demais sobre assuntos sem importância", "Sempre mantém a palavra, custe o que custar", "Desconfia de estranhos mas é leal aos aliados", "Busca aventura e emoção a todo custo", "É obcecado com créditos e riquezas", "Vive segundo um código de honra rígido", "Prefere agir sozinho e não confia em grupos", "É curioso sobre tudo que vê", "É gentil com os fracos e duro com os poderosos", "Guarda rancor por muito tempo", "Nunca tira o capuz ou máscara perto de estranhos", "Trata droides como se fossem gente"];
const MOTIVES = ["proteger sua tripulação", "créditos e riqueza", "vingança contra o Império", "poder e influência na galáxia", "conhecimento proibido da Força", "fé na Força", "fama entre contrabandistas", "sobreviver mais um dia", "redenção por um passado sombrio", "encontrar um ente querido perdido"];
const CANTINAS = ["A Lua de Nar Shaddaa", "O Beco do Contrabandista", "Cantina do Outer Rim", "O Poço de Jabba", "Posto Avançado da Orla", "A Estação Perdida", "O Salão dos Piratas", "Refúgio do Hutt"];
const HOOKS = ["Um contrabandista pede ajuda pra despistar patrulhas Imperiais.", "Uma nave desconhecida caiu em órbita e ninguém sabe o que carrega.", "Um Hutt oferece recompensa alta demais pra ser honesta.", "Rebeldes locais somem após uma reunião secreta.", "Um droide antigo carrega uma mensagem incompleta.", "Uma facção pede escolta através de território disputado.", "Um planeta inteiro perdeu contato com a HoloRede.", "Um ex-membro do grupo reaparece do outro lado da guerra."];
const COMPLICATIONS = ["Uma patrulha Imperial chega de surpresa.", "Um aliado se revela informante.", "O motor da nave falha no pior momento.", "Uma tempestade de areia corta toda visibilidade.", "Um sistema essencial da nave é sabotado.", "Reforços inimigos saem do hiperespaço.", "Um civil fica preso no fogo cruzado.", "O comunicador é interceptado pelo inimigo."];
const LOOT = ["Créditos imperiais (2d6 x100)", "Carregador de energia extra", "Datapad com coordenadas cifradas", "Peça rara de nave (mercado negro)", "Kit médico de campo", "Sabre de luz desativado, de origem desconhecida", "Mapa de rota de contrabando", "Chip de identificação falsificado", "Cristal kyber sem lapidar", "Holograma com mensagem incompleta"];

interface Roll { label: string; value: string; }
interface StepNpc { name?: string; species?: string; planet?: string; classe?: string; trait?: string; motive?: string; }

const STEPS: { key: keyof StepNpc; label: string; roll: () => string }[] = [
  { key: "name", label: "Nome", roll: () => `${rand(FIRST)} ${rand(LAST)}` },
  { key: "species", label: "Espécie", roll: () => rand(SPECIES_NAMES) },
  { key: "planet", label: "Planeta Natal", roll: () => rand(PLANET_NAMES) },
  { key: "classe", label: "Classe / Papel", roll: () => rand(CLASS_NAMES) },
  { key: "trait", label: "Traço", roll: () => rand(TRAITS) },
  { key: "motive", label: "Motivação", roll: () => rand(MOTIVES) },
];

export function CampaignGenerators({ api }: { api: StarWarsApi }) {
  const [npc, setNpc] = useState<StepNpc>({});
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  function rollStep(key: keyof StepNpc) {
    const step = STEPS.find((s) => s.key === key)!;
    setNpc((n) => ({ ...n, [key]: step.roll() }));
  }
  function resetNpc() { setNpc({}); }
  function push(label: string, value: string) { setRolls((r) => [{ label, value }, ...r].slice(0, 12)); }
  async function saveNpc() {
    if (!npc.name?.trim()) return;
    await api.addChild("npcs", {
      name: npc.name,
      species: npc.species ?? "",
      role: npc.classe ?? "",
      description: npc.planet ? `Natural de ${npc.planet}.` : "",
      personality: npc.trait ?? "",
      notes: npc.motive ? `Motivação: ${npc.motive}.` : "",
      attacks: "[]",
    });
    setSaveMsg("✓ NPC adicionado à aba NPCs.");
    setTimeout(() => setSaveMsg(null), 3000);
    setNpc({});
  }

  const card: React.CSSProperties = { background: SW.panel, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius-xl)", padding: "18px 20px", boxShadow: `0 0 24px ${SW.glow}, inset 0 1px 0 rgba(255,255,255,0.03)` };
  const genBtn: React.CSSProperties = { padding: "8px 16px", background: ACCENT_DIM, color: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" };
  const title: React.CSSProperties = { fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 };
  const rerollBtn: React.CSSProperties = { padding: "5px 10px", background: "var(--surface-2)", color: ACCENT_LIGHT, border: `1px solid ${ACCENT_BORD}`, borderRadius: "var(--radius)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", flexShrink: 0 };

  const hasAny = STEPS.some((s) => !!npc[s.key]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: ACCENT_LIGHT }}>🎲</span> Geradores Aleatórios</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <div style={card}>
          <p style={title}>NPC Passo a Passo</p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginBottom: 14 }}>Sorteie cada campo separadamente. Repita o que não gostar, mantenha o resto, e conclua quando estiver satisfeito.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {STEPS.map((s) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.64rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 92, flexShrink: 0 }}>{s.label}</span>
                <span style={{ fontSize: "0.82rem", color: npc[s.key] ? "var(--text)" : "var(--text-subtle)", flex: 1, fontStyle: npc[s.key] ? "normal" : "italic" }}>{npc[s.key] ?? "não sorteado"}</span>
                <button onClick={() => rollStep(s.key)} style={rerollBtn}>{npc[s.key] ? "🎲 Rerolar" : "🎲 Sortear"}</button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={saveNpc} disabled={!npc.name?.trim()} style={{ ...genBtn, background: npc.name?.trim() ? `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)` : "var(--surface-2)", color: npc.name?.trim() ? "#06090f" : "var(--text-subtle)", border: npc.name?.trim() ? "none" : `1px solid ${ACCENT_BORD}`, cursor: npc.name?.trim() ? "pointer" : "not-allowed" }}>+ Concluir e Salvar em NPCs</button>
            {hasAny && <button onClick={resetNpc} style={{ ...genBtn, background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)" }}>Reiniciar</button>}
          </div>
          {saveMsg && <p style={{ fontSize: "0.76rem", color: "#4ade80", marginTop: 8 }}>{saveMsg}</p>}
        </div>

        <div style={card}>
          <p style={title}>Tabelas Rápidas</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <button onClick={() => push("Nome", `${rand(FIRST)} ${rand(LAST)}`)} style={genBtn}>Nome</button>
            <button onClick={() => push("Espécie", rand(SPECIES_NAMES))} style={genBtn}>Espécie</button>
            <button onClick={() => push("Planeta", rand(PLANET_NAMES))} style={genBtn}>Planeta</button>
            <button onClick={() => push("Cantina", rand(CANTINAS))} style={genBtn}>Cantina</button>
            <button onClick={() => push("Gancho", rand(HOOKS))} style={genBtn}>Gancho</button>
            <button onClick={() => push("Complicação", rand(COMPLICATIONS))} style={genBtn}>Complicação</button>
            <button onClick={() => push("Espólio", rand(LOOT))} style={genBtn}>Espólio</button>
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
