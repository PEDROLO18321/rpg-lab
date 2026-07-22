"use client";

import { useState } from "react";

const ACCENT_LIGHT = "#c94040";
const ACCENT_BORD = "rgba(160,24,24,0.28)";

interface Row { term: string; text: string; }
interface Block { heading?: string; intro?: string; rows: Row[]; }
interface Section { id: string; icon: string; title: string; note?: string; blocks: Block[]; }

const SECTIONS: Section[] = [
  {
    id: "resistencia",
    icon: "🛡️",
    title: "Testes de Resistência",
    note: "Livro Básico, cap. 3 — Fortitude, Reflexos e Vontade.",
    blocks: [
      {
        rows: [
          { term: "CD do Teste", text: "10 + metade do nível de quem causa o efeito (arred. baixo) + modificador do atributo relevante." },
          { term: "Fortitude", text: "Resiste a venenos, doenças, efeitos físicos e de Constituição." },
          { term: "Reflexos", text: "Resiste a explosões, armadilhas e efeitos de área — geralmente reduz o efeito pela metade." },
          { term: "Vontade", text: "Resiste a efeitos mentais, medo e ilusões." },
          { term: "Sucesso/Fracasso", text: "Resultado do d20 + bônus de resistência ≥ CD = sucesso (efeito anulado ou reduzido, conforme o poder)." },
        ],
      },
    ],
  },
  {
    id: "magia",
    icon: "✨",
    title: "Custo de Magias",
    note: "Cap. 4 — Pontos de Mana (PM) por círculo.",
    blocks: [
      {
        rows: [
          { term: "1º Círculo", text: "1 PM." },
          { term: "2º Círculo", text: "3 PM." },
          { term: "3º Círculo", text: "6 PM." },
          { term: "4º Círculo", text: "10 PM." },
          { term: "5º Círculo", text: "15 PM." },
          { term: "Tradições", text: "Arcana (Int/Car conforme classe) e Divina (Sab) — CD de resistência = 10 + metade do nível + mod. do atributo de conjuração." },
        ],
      },
    ],
  },
  {
    id: "pericias",
    icon: "📜",
    title: "Perícias & Testes",
    note: "Cap. 2 — Tabela 2-1, 29 perícias.",
    blocks: [
      {
        rows: [
          { term: "Fórmula do Teste", text: "d20 + metade do nível (arred. baixo) + mod. do atributo + bônus de treino (se treinado)." },
          { term: "Treino: 1º–6º nível", text: "+2 na perícia treinada." },
          { term: "Treino: 7º–14º nível", text: "+4 na perícia treinada." },
          { term: "Treino: 15º nível+", text: "+6 na perícia treinada." },
          { term: "Somente Treinada", text: "Algumas perícias (ex.: Conhecimento, Misticismo, Ofício, Nobreza) só podem ser usadas se treinadas." },
          { term: "Penalidade de Armadura", text: "Armaduras pesadas aplicam penalidade a perícias como Acrobacia e Furtividade." },
        ],
      },
    ],
  },
  {
    id: "combate",
    icon: "⚔️",
    title: "Ações em Combate",
    note: "Cap. 3 — tipos de ação por rodada.",
    blocks: [
      {
        rows: [
          { term: "Ação Padrão", text: "Ataques, a maioria das magias, uso de itens, manobras." },
          { term: "Ação de Movimento", text: "Deslocar-se, levantar-se do chão caído, sacar uma arma." },
          { term: "Ação Completa", text: "Ocupa toda a rodada — ataques múltiplos, corrida, algumas magias." },
          { term: "Ação Livre", text: "Falar, largar um item — praticamente sem custo, uso limitado pelo mestre." },
          { term: "Reação", text: "Resposta a um gatilho específico fora do próprio turno; 1 por rodada." },
        ],
      },
    ],
  },
  {
    id: "condicoes",
    icon: "🌀",
    title: "Condições Comuns",
    note: "Cap. 3 — lembretes rápidos de mesa.",
    blocks: [
      {
        rows: [
          { term: "Abalado", text: "-2 em testes de perícia, ataque, dano e resistência." },
          { term: "Apavorado", text: "Abalado e deve fugir da fonte do medo por meios não prejudiciais." },
          { term: "Atordoado", text: "Não pode agir; perde a Defesa de Destreza e escudo." },
          { term: "Caído", text: "-2 para atacar; corpo a corpo contra tem +2, à distância tem -2." },
          { term: "Cego", text: "Falha em testes que exijam visão; -5 para atacar; risco de errar por completo em corpo a corpo." },
          { term: "Confuso", text: "Ação determinada ao acaso a cada rodada: atacar aliado, atacar a esmo, fugir ou agir normalmente." },
          { term: "Desprevenido", text: "Perde a Defesa de Destreza e escudo contra quem o pegou de surpresa." },
          { term: "Enjoado", text: "Só pode realizar uma ação padrão ou de movimento por rodada, não ambas." },
          { term: "Fatigado", text: "-2 em Força e Destreza; não pode correr." },
          { term: "Pasmo", text: "Perde a próxima ação; não pode reagir." },
          { term: "Surdo", text: "Falha em testes que exijam audição; -4 em Iniciativa." },
        ],
      },
    ],
  },
  {
    id: "perigos",
    icon: "☠️",
    title: "Perigos Ambientais",
    note: "Cap. 3 — riscos que não são criaturas.",
    blocks: [
      {
        rows: [
          { term: "Queda", text: "1d6 de dano por 3m caídos, máximo 20d6. A criatura fica caída ao final." },
          { term: "Afogamento", text: "Prende a respiração por 2 + mod. Con rodadas; depois, Fortitude ou perde ações e começa a se afogar (perda progressiva de PV)." },
          { term: "Fogo", text: "1d6 de dano por rodada em contato com chamas; tocar algo em brasa também causa dano. Rolar no chão ou água apaga." },
        ],
      },
    ],
  },
  {
    id: "patamares",
    icon: "🏆",
    title: "Patamares de Jogo",
    note: "Cap. 1 — evolução de poder ao longo da campanha.",
    blocks: [
      {
        rows: [
          { term: "Iniciante", text: "Níveis 1 a 4 — heróis comuns, ameaças locais." },
          { term: "Veterano", text: "Níveis 5 a 10 — heróis experientes, ameaças regionais." },
          { term: "Campeão", text: "Níveis 11 a 16 — heróis lendários, ameaças que abalam reinos." },
          { term: "Lenda", text: "Níveis 17 a 20 — heróis semidivinos, ameaças que decidem o destino de Arton." },
        ],
      },
    ],
  },
];

export function TormentaGuide() {
  const [open, setOpen] = useState<string | null>("resistencia");

  const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: ACCENT_LIGHT }}>📖</span> Guia do Mestre — Lembretes de Regras
      </h2>
      <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", marginTop: -6 }}>
        Referência rápida de Tormenta 20 — testes de resistência, magia, perícias, combate e condições. Consulte o livro para o texto completo.
      </p>

      {SECTIONS.map((s) => {
        const active = open === s.id;
        return (
          <div key={s.id} style={card}>
            <button
              onClick={() => setOpen(active ? null : s.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1rem" }}>{s.icon}</span>
                <span>
                  <span style={{ display: "block", fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{s.title}</span>
                  {s.note && <span style={{ display: "block", fontSize: "0.74rem", color: "var(--text-subtle)" }}>{s.note}</span>}
                </span>
              </span>
              <span style={{ color: "var(--text-subtle)", fontSize: "0.82rem", transform: active ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.22s" }}>▾</span>
            </button>

            {active && (
              <div style={{ padding: "0 20px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
                {s.blocks.map((b, bi) => (
                  <div key={bi}>
                    {b.heading && (
                      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: ACCENT_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, paddingTop: 4, borderTop: `1px solid ${ACCENT_BORD}` }}>{b.heading}</p>
                    )}
                    {b.intro && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10, fontStyle: "italic" }}>{b.intro}</p>}
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {b.rows.map((r, ri) => (
                        <div key={ri} style={{ display: "flex", gap: 10, alignItems: "baseline", fontSize: "0.82rem", lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 700, color: "var(--text)", minWidth: 156, flexShrink: 0 }}>{r.term}</span>
                          <span style={{ color: "var(--text-muted)", flex: 1 }}>{r.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
