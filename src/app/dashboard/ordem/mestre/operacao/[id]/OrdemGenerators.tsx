"use client";

import { useState } from "react";
import type { OperacaoApi } from "@/lib/ordem/useOperacao";
import { randomOrdemName } from "@/lib/ordem/names";
import { ELEMENT_LABEL, type Element } from "@/lib/ordem/data";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const TRAITS = ["desconfiado", "tagarela", "assustado", "frio e calculista", "ingênuo", "agressivo", "melancólico", "fanático", "pragmático", "evasivo"];
const MOTIVES = ["proteger a família", "dinheiro fácil", "vingança pessoal", "esconder um segredo", "poder paranormal", "fé numa entidade", "curiosidade mórbida", "sobreviver mais um dia", "ascensão social", "redenção"];
const SECRETS = ["testemunhou um ritual", "deve favores a um culto", "carrega um item amaldiçoado", "matou alguém e encobriu", "é um agente infiltrado", "está possuído parcialmente", "viu o rosto da entidade", "não é quem diz ser"];
const ELEMENTS: Element[] = ["conhecimento", "energia", "morte", "sangue", "medo"];

const COMPLICATIONS = [
  "A polícia chega antes do esperado.",
  "Um civil inocente entra na cena.",
  "Um equipamento essencial falha.",
  "Uma testemunha começa a gritar.",
  "A membrana enfraquece de repente.",
  "Um aliado some sem deixar rastro.",
  "Uma pista crucial foi destruída.",
  "Outro grupo paranormal disputa o objetivo.",
  "Um agente reconhece alguém da cena.",
  "O tempo começa a se distorcer.",
  "Um cheiro de sangue toma o ambiente.",
  "As luzes piscam e apagam.",
];

const PHENOMENA = [
  "Relógios param na mesma hora.",
  "Sangue escorre das paredes.",
  "Vozes sussurram nomes em latim.",
  "Sombras se movem sem dono.",
  "Animais fogem em pânico do local.",
  "Espelhos mostram reflexos diferentes.",
  "Um frio impossível domina a sala.",
  "Plantas apodrecem instantaneamente.",
  "Eletrônicos exibem mensagens distorcidas.",
  "O ar fica denso e difícil de respirar.",
];

const LOOT = [
  "Munição (1 pacote)", "Kit médico básico", "Dinheiro em espécie", "Celular com pistas",
  "Documento confidencial", "Frasco de Lodo", "Amuleto de origem duvidosa", "Chave sem fechadura aparente",
  "Caderno de anotações de um cultista", "Arma branca improvisada", "Dose de adrenalina", "Pen drive criptografado",
];

interface GenState { label: string; value: string; }

export function OrdemGenerators({ api }: { api: OperacaoApi }) {
  const [npc, setNpc] = useState<{ name: string; trait: string; motive: string; secret: string; element: Element } | null>(null);
  const [rolls, setRolls] = useState<GenState[]>([]);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  function genNpc() {
    setNpc({ name: randomOrdemName(), trait: rand(TRAITS), motive: rand(MOTIVES), secret: rand(SECRETS), element: rand(ELEMENTS) });
  }
  function push(label: string, value: string) { setRolls((r) => [{ label, value }, ...r].slice(0, 12)); }

  async function saveNpc() {
    if (!npc) return;
    await api.addChild("npcs", {
      name: npc.name, role: "", personality: npc.trait,
      paranormalTies: `Segredo: ${npc.secret}`,
      notes: `Motivação: ${npc.motive}. Elemento associado: ${ELEMENT_LABEL[npc.element]}.`,
      attacks: "[]",
    });
    setSaveMsg("✓ NPC adicionado à aba NPCs.");
    setTimeout(() => setSaveMsg(null), 3000);
  }

  const card: React.CSSProperties = { background: "var(--surface)", border: `1px solid ${AB}`, borderRadius: "var(--radius-xl)", padding: "18px 20px" };
  const genBtn: React.CSSProperties = { padding: "8px 16px", background: AD, color: AL, border: `1px solid ${AB}`, borderRadius: "var(--radius)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" };
  const title: React.CSSProperties = { fontFamily: "var(--font-cinzel), serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: AL }}>🎲</span> Geradores Aleatórios
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {/* NPC generator */}
        <div style={card}>
          <p style={title}>NPC Instantâneo</p>
          {npc ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12, fontSize: "0.84rem", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{npc.name}</p>
              <p><strong style={{ color: AL }}>Traço:</strong> {npc.trait}</p>
              <p><strong style={{ color: AL }}>Motivação:</strong> {npc.motive}</p>
              <p><strong style={{ color: "#f87171" }}>Segredo:</strong> {npc.secret}</p>
              <p><strong style={{ color: "#9b7ce0" }}>Elemento:</strong> {ELEMENT_LABEL[npc.element]}</p>
            </div>
          ) : (
            <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", marginBottom: 12 }}>Gere um NPC com traço, motivação e segredo.</p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={genNpc} style={genBtn}>🎲 Gerar NPC</button>
            {npc && <button onClick={saveNpc} style={{ ...genBtn, background: `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)`, color: "#06090f", border: "none" }}>+ Salvar em NPCs</button>}
          </div>
          {saveMsg && <p style={{ fontSize: "0.76rem", color: "#4ade80", marginTop: 8 }}>{saveMsg}</p>}
        </div>

        {/* Quick tables */}
        <div style={card}>
          <p style={title}>Tabelas Rápidas</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            <button onClick={() => push("Nome", randomOrdemName())} style={genBtn}>Nome</button>
            <button onClick={() => push("Complicação", rand(COMPLICATIONS))} style={genBtn}>Complicação</button>
            <button onClick={() => push("Fenômeno", rand(PHENOMENA))} style={genBtn}>Fenômeno</button>
            <button onClick={() => push("Loot", rand(LOOT))} style={genBtn}>Loot</button>
          </div>
          {rolls.length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>Clique para gerar resultados.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {rolls.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: "0.82rem", padding: "4px 0", borderBottom: i === rolls.length - 1 ? "none" : "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.64rem", fontWeight: 700, color: AL, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 84 }}>{r.label}</span>
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
