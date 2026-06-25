"use client";

import { useState } from "react";
import type { CthulhuApi } from "@/lib/cthulhu/useCthulhuCampaign";

const A = "#a3b86c";
const ADIM = "rgba(125,156,62,0.14)";
const ABORD = "rgba(125,156,62,0.32)";

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const FIRST = ["Herbert", "Agatha", "Randolph", "Mildred", "Edward", "Florence", "Charles", "Dorothea", "Walter", "Beatrice", "Howard", "Constance", "George", "Harriet"];
const LAST = ["Whateley", "Marsh", "Armitage", "Pickman", "Carter", "Gilman", "Peaslee", "Ward", "Derby", "Wilmarth"];
const TRAITS = ["cético", "supersticioso", "nervoso", "estoico", "ganancioso", "fanático", "curioso", "paranoico", "gentil", "manipulador"];
const MOTIVES = ["esconder um segredo", "proteger a família", "ganância", "fé num culto", "conhecimento proibido", "vingança", "sobreviver", "fama acadêmica", "curar uma doença", "redenção"];
const SECRETS = ["é membro de um culto", "testemunhou um ritual", "possui um tomo proibido", "está sendo chantageado", "não é totalmente humano", "matou alguém", "vê coisas que não existem", "fez um pacto"];
const HOOKS = ["Um desaparecimento inexplicável numa cidade litorânea.", "Uma herança com cláusulas estranhas.", "Pesadelos compartilhados por desconhecidos.", "Um culto realiza encontros à meia-noite.", "Um professor enlouqueceu após uma expedição.", "Cartas de um parente morto continuam chegando.", "Animais fogem em pânico de uma fazenda.", "Um livro antigo foi roubado da biblioteca."];
const PHENOMENA = ["Cheiro de peixe podre sem fonte.", "Sussurros numa língua desconhecida.", "Sombras que se movem sozinhas.", "A temperatura cai de repente.", "Símbolos aparecem nas paredes.", "Relógios param na mesma hora.", "Um zumbido grave abaixo do limiar da audição.", "Reflexos atrasados nos espelhos."];
const ITEMS = ["Diário manchado de sangue", "Amuleto de pedra esverdeada", "Fotografia adulterada", "Frasco com líquido viscoso", "Mapa de um lugar inexistente", "Estatueta repugnante", "Carta com selo de cera negra", "Chave sem fechadura conhecida"];

interface Roll { label: string; value: string; }

export function CthulhuGenerators({ api }: { api: CthulhuApi }) {
  const [npc, setNpc] = useState<{ name: string; trait: string; motive: string; secret: string } | null>(null);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  function genNpc() { setNpc({ name: `${rand(FIRST)} ${rand(LAST)}`, trait: rand(TRAITS), motive: rand(MOTIVES), secret: rand(SECRETS) }); }
  function push(label: string, value: string) { setRolls((r) => [{ label, value }, ...r].slice(0, 12)); }
  async function saveNpc() {
    if (!npc) return;
    await api.addChild("npcs", { name: npc.name, personality: npc.trait, mythosTies: `Segredo: ${npc.secret}`, notes: `Motivação: ${npc.motive}.`, attacks: "[]" });
    setSaveMsg("✓ NPC adicionado à aba NPCs."); setTimeout(() => setSaveMsg(null), 3000);
  }

  const card: React.CSSProperties = { background: "var(--surface)", border: `1px solid ${ABORD}`, borderRadius: "var(--radius-xl)", padding: "18px 20px" };
  const genBtn: React.CSSProperties = { padding: "8px 16px", background: ADIM, color: A, border: `1px solid ${ABORD}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" };
  const title: React.CSSProperties = { fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: A }}>🎲</span> Geradores Aleatórios</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        <div style={card}>
          <p style={title}>NPC Instantâneo</p>
          {npc ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12, fontSize: "0.84rem", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{npc.name}</p>
              <p><strong style={{ color: A }}>Traço:</strong> {npc.trait}</p>
              <p><strong style={{ color: A }}>Motivação:</strong> {npc.motive}</p>
              <p><strong style={{ color: "#f87171" }}>Segredo:</strong> {npc.secret}</p>
            </div>
          ) : <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", marginBottom: 12 }}>Gere um NPC de época com traço, motivação e segredo.</p>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={genNpc} style={genBtn}>🎲 Gerar NPC</button>
            {npc && <button onClick={saveNpc} style={{ ...genBtn, background: "linear-gradient(135deg, #a3b86c 0%, #7d9c3e 100%)", color: "#06090f", border: "none" }}>+ Salvar em NPCs</button>}
          </div>
          {saveMsg && <p style={{ fontSize: "0.76rem", color: "#4ade80", marginTop: 8 }}>{saveMsg}</p>}
        </div>

        <div style={card}>
          <p style={title}>Tabelas Rápidas</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <button onClick={() => push("Nome", `${rand(FIRST)} ${rand(LAST)}`)} style={genBtn}>Nome</button>
            <button onClick={() => push("Gancho", rand(HOOKS))} style={genBtn}>Gancho</button>
            <button onClick={() => push("Fenômeno", rand(PHENOMENA))} style={genBtn}>Fenômeno</button>
            <button onClick={() => push("Item", rand(ITEMS))} style={genBtn}>Item</button>
          </div>
          {rolls.length === 0 ? <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>Clique para gerar resultados.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {rolls.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: "0.82rem", padding: "4px 0", borderBottom: i === rolls.length - 1 ? "none" : "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.64rem", fontWeight: 700, color: A, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 84 }}>{r.label}</span>
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
