"use client";

import { useState } from "react";

interface Row { term: string; text: string; }
interface Block { heading?: string; intro?: string; rows: Row[]; }
interface Section { id: string; icon: string; title: string; note?: string; blocks: Block[]; }

const SECTIONS: Section[] = [
  {
    id: "ambiente",
    icon: "🏔️",
    title: "Ambiente & Perigos",
    note: "Livro do Jogador, cap. 8 — regras de sobrevivência.",
    blocks: [
      {
        rows: [
          { term: "Queda", text: "1d6 de dano de concussão por 3m caídos, máximo 20d6. A criatura fica caída, a menos que evite o dano." },
          { term: "Asfixia", text: "Prende a respiração por 1 + mod. CON minutos (mín. 30s). Sem ar: sobrevive mod. CON rodadas (mín. 1). Depois cai a 0 PV e está morrendo." },
          { term: "Luz Plena", text: "Visão normal." },
          { term: "Penumbra", text: "Desvantagem em Sabedoria (Percepção) que depende de visão." },
          { term: "Escuridão Total", text: "Bloqueia a visão — a criatura fica efetivamente cega para tudo ali dentro." },
          { term: "Comida", text: "0,5kg/dia. Sem comida por 3 + mod. CON dias (mín. 1): 1 nível de exaustão por dia excedente." },
          { term: "Água", text: "3L/dia (6L em calor). Metade da água: CD 15 CON ou exaustão. Menos que isso: exaustão automática. Já exausto: dobra os níveis." },
        ],
      },
      {
        heading: "Clima Extremo (Guia do Mestre)",
        rows: [
          { term: "Frio Extremo (≤ −17°C)", text: "CD 10 CON por hora ou 1 nível de exaustão. Resistência/imunidade a frio ou traje adequado: sucesso automático." },
          { term: "Calor Extremo (≥ 38°C)", text: "CD 5 CON por hora (+1/hora) sem água, ou 1 nível de exaustão. Armadura média/pesada = desvantagem." },
          { term: "Vento Forte", text: "Desvantagem em ataques à distância e Percepção (audição). Apaga chamas, dispersa névoa. Criatura voadora deve pousar no fim do turno ou cai." },
          { term: "Precipitação Pesada", text: "Escuridão leve na área + desvantagem em Percepção (visão e audição). Apaga chamas expostas." },
          { term: "Altitude Elevada (≥3000m)", text: "Cada hora viajando conta como 2h. Aclimatação: 30+ dias no local (impossível acima de 6000m sem ser nativo)." },
        ],
      },
    ],
  },
  {
    id: "exaustao-morte",
    icon: "💀",
    title: "Exaustão & Morte",
    note: "Apêndice A / cap. 9 — condições especiais.",
    blocks: [
      {
        heading: "Exaustão (6 níveis, acumulativos)",
        rows: [
          { term: "1", text: "Desvantagem em testes de habilidade." },
          { term: "2", text: "Deslocamento reduzido à metade." },
          { term: "3", text: "Desvantagem em ataques e testes de resistência." },
          { term: "4", text: "PV máximo reduzido à metade." },
          { term: "5", text: "Deslocamento reduzido a 0." },
          { term: "6", text: "Morte." },
        ],
      },
      {
        heading: "Regras",
        rows: [
          { term: "Remover Exaustão", text: "Descanso longo reduz 1 nível, desde que tenha comido e bebido." },
          { term: "Caindo a 0 PV", text: "Morte instantânea se o dano excedente ≥ PV máximo. Senão, fica inconsciente." },
          { term: "Teste contra a Morte", text: "d20 no início do turno com 0 PV: 10+ sucesso, <10 fracasso. 3 sucessos = estabiliza. 3 fracassos = morre. Nat 1 = 2 fracassos. Nat 20 = recupera 1 PV." },
          { term: "Dano com 0 PV", text: "Sofrer dano = 1 fracasso automático. Crítico = 2 fracassos. Dano ≥ PV máximo = morte instantânea." },
          { term: "Estabilizar", text: "Ação + Sabedoria (Medicina) CD 10 numa criatura inconsciente. Estabilizada não testa mais contra a morte, mas segue inconsciente; recupera 1 PV após 1d4 horas." },
        ],
      },
    ],
  },
  {
    id: "cobertura",
    icon: "🛡️",
    title: "Cobertura & Combate",
    note: "Cap. 9 — lembretes rápidos de mesa.",
    blocks: [
      {
        rows: [
          { term: "Meia-Cobertura", text: "+2 CA e testes de Reflexo/Destreza. Obstáculo bloqueia ao menos metade do corpo (ex.: outra criatura, tronco baixo)." },
          { term: "Três-Quartos de Cobertura", text: "+5 CA e testes de Reflexo/Destreza. Ex.: portal estreito, ameia." },
          { term: "Cobertura Total", text: "Não pode ser alvo direto. Bloqueado completamente por um obstáculo." },
          { term: "Inconsciente", text: "Caída, falha automática em testes de Força/Destreza, sofre vantagem contra ela, e crítico automático se o atacante estiver adjacente." },
        ],
      },
    ],
  },
];

export function CampaignGuide() {
  const [open, setOpen] = useState<string | null>("ambiente");

  const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "var(--accent-light)" }}>📖</span> Guia do Mestre — Lembretes de Regras
      </h2>
      <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", marginTop: -6 }}>
        Referência rápida de ambiente, exaustão, morte e cobertura. Consulte o livro para o texto completo.
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
                      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, paddingTop: 4, borderTop: "1px solid var(--border-accent)" }}>{b.heading}</p>
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
