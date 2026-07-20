"use client";

import { useState } from "react";

const A = "#a3b86c";
const ABORD = "rgba(125,156,62,0.32)";

interface Row { term: string; text: string; }
interface Block { heading?: string; intro?: string; rows: Row[]; }
interface Section { id: string; icon: string; title: string; note?: string; blocks: Block[]; }

const SECTIONS: Section[] = [
  {
    id: "sanidade",
    icon: "🧠",
    title: "Sanidade & Insanidade",
    note: "Cap. 8 — lembretes de mesa para o Guardião.",
    blocks: [
      {
        rows: [
          { term: "Sanidade Máxima", text: "Começa em 99. Sempre = 99 − pontos na perícia Mythos de Cthulhu. Ganhar Mythos reduz a SAN máxima na mesma quantidade." },
          { term: "Insanidade Temporária", text: "Perdeu 5+ SAN de uma única fonte. Teste de INT: falha = reprime a memória (não fica insano); sucesso = fica insano por 1d10 horas." },
          { term: "Insanidade Indefinida", text: "Perdeu 1/5 ou mais da SAN atual em um único 'dia' de jogo. Dura até tratamento/recuperação (cap. 8, pág. 164)." },
          { term: "Insanidade Permanente", text: "SAN chega a 0. Personagem incurável, deixa de ser jogável (aposentado)." },
          { term: "Acesso de Loucura (fase 1)", text: "Controle passa ao Guardião por 1d10 rodadas (tempo real). O investigador não perde mais SAN durante o acesso." },
          { term: "Insanidade Latente (fase 2)", text: "Controle volta ao jogador, mas com fobias/manias/delírios possíveis até a recuperação." },
          { term: "Perícias 90%+", text: "Ao atingir 90%+ numa perícia na fase de desenvolvimento, ganha +2d6 de SAN atual (recompensa de domínio)." },
        ],
      },
      {
        heading: "Exemplos de Custo de SAN (perda normal/desastre)",
        rows: [
          { term: "0/1d2", text: "Encontrar de surpresa a carcaça de um animal mutilado." },
          { term: "0/1d3", text: "Encontrar de surpresa um cadáver ou parte de um corpo." },
          { term: "0/1d4", text: "Ver um fluxo de sangue num riacho." },
          { term: "1/1d4+1", text: "Encontrar um cadáver humano horrivelmente mutilado." },
          { term: "0/1d6", text: "Acordar preso em um caixão · Testemunhar morte violenta de um amigo · Ver um carniçal." },
          { term: "1/1d6+1", text: "Encontrar alguém que você sabe estar morto." },
          { term: "0/1d10", text: "Ser submetido a tortura severa." },
          { term: "1/1d10", text: "Ver um cadáver se erguer da cova." },
          { term: "2/2d10+1", text: "Ver uma cabeça decapitada gigante cair do céu." },
          { term: "1d10/1d100", text: "Ver o Grande Cthulhu." },
        ],
      },
    ],
  },
  {
    id: "testes",
    icon: "🎲",
    title: "Testes & Combate",
    note: "Lembretes de teste forçado, agonia e ferimento grave.",
    blocks: [
      {
        rows: [
          { term: "Teste Forçado", text: "Jogador arrisca falhar de novo por um resultado melhor. Se falhar o teste forçado, o Guardião tem liberdade total sobre a consequência (dano, perda de SAN, item, isolamento…)." },
          { term: "Ferimento Grave", text: "Dano de uma vez ≥ metade do PV máximo. Teste de Constituição (Sorte) ou cai; role recuperação." },
          { term: "Morrendo", text: "PV chega a 0 após ferimento grave. Primeiros socorros estabilizam; senão, teste de CON por rodada." },
          { term: "Ação de Combate Involuntária", text: "Se um teste de Sanidade falha durante o combate, o Guardião pode decidir a ação da rodada (atacar aleatoriamente, apertar o gatilho, se esconder…)." },
        ],
      },
    ],
  },
  {
    id: "fobias",
    icon: "👁️",
    title: "Fobias & Manias",
    note: "Efeitos colaterais da insanidade — referência rápida.",
    blocks: [
      {
        rows: [
          { term: "Fobia — Exposição", text: "Proximidade física ao objeto causa pânico. Outras ações (que não lutar/fugir) só com dado de penalidade. Não afeta testes de Sanidade/Exame da Realidade." },
          { term: "Mania — Exposição", text: "Provoca reação obsessiva. Em insanidade latente, exposição gera resposta irresistível; se resistir à obsessão, sofre dado de penalidade em tudo até saciar ou se afastar." },
          { term: "Exame da Realidade", text: "Teste de Sanidade pedido para 'ver através' de algo que parece alucinação/ilusão — normalmente para investigadores insanos, mas jogador pode solicitar." },
          { term: "Tratamento", text: "Só insanidade indefinida tem chance real de tratamento. Fobias/manias só somem com Psicoterapia." },
        ],
      },
    ],
  },
];

export function CthulhuGuide() {
  const [open, setOpen] = useState<string | null>("sanidade");

  const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: A }}>📖</span> Guia do Guardião — Lembretes de Regras
      </h2>
      <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", marginTop: -6 }}>
        Referência rápida de sanidade, testes forçados e fobias/manias. Consulte o livro para o texto completo.
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
                      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: A, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, paddingTop: 4, borderTop: `1px solid ${ABORD}` }}>{b.heading}</p>
                    )}
                    {b.intro && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10, fontStyle: "italic" }}>{b.intro}</p>}
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {b.rows.map((r, ri) => (
                        <div key={ri} style={{ display: "flex", gap: 10, alignItems: "baseline", fontSize: "0.82rem", lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 700, color: "var(--text)", minWidth: 132, flexShrink: 0 }}>{r.term}</span>
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
