"use client";

import { useState } from "react";

const ACCENT_LIGHT = "#69a8e0";
const ACCENT_BORD = "rgba(59,130,196,0.28)";

interface Row { term: string; text: string }
interface Block { heading?: string; intro?: string; rows: Row[] }
interface Section { id: string; icon: string; title: string; note?: string; blocks: Block[] }

const SECTIONS: Section[] = [
  {
    id: "atributos",
    icon: "🎲",
    title: "Atributos e Criação",
    note: "6 atributos, 7 pontos de criação, modificador de espécie.",
    blocks: [{
      rows: [
        { term: "Atributos", text: "Agilidade (AGI), Inteligência (INT), Força (FOR), Vigor (VIG), Presença (PRE), Sensitividade (SEN)." },
        { term: "Criação", text: "7 pontos distribuídos livremente entre os 6 atributos, começando de 0." },
        { term: "Modificador de espécie", text: "Cada uma das 35 espécies soma net +2 (a maioria +2/+1/−1); Humano é exceção: +2 em 2, +1 em 3, −1 em 1, à escolha do jogador." },
        { term: "Atributos negativos", text: "O modificador de espécie pode deixar um atributo abaixo de 0 — é permitido e afeta a rolagem de dados (ver abaixo)." },
      ],
    }],
  },
  {
    id: "dados",
    icon: "🎲",
    title: "Rolagem de Dados por Atributo",
    note: "Mesma regra de Ordem Paranormal — o valor do atributo define o pool de d20.",
    blocks: [{
      rows: [
        { term: "Atributo positivo", text: "Rola N d20 (N = valor do atributo) e usa o MAIOR resultado." },
        { term: "Atributo 0", text: "Rola 1d20 normal." },
        { term: "Atributo negativo", text: "Rola (|valor| + 1) d20 e usa o MENOR resultado. Ex.: atributo −1 rola 2d20 e fica com o pior." },
        { term: "Perícia", text: "Soma-se o grau de treinamento (+0 a +25) e a Habilidade Natal do planeta (+5, se aplicável) ao resultado do dado escolhido." },
      ],
    }],
  },
  {
    id: "pericias",
    icon: "📜",
    title: "Perícias e Graus de Treinamento",
    note: "25 perícias, graus de Inexperiente a Mestre.",
    blocks: [{
      rows: [
        { term: "25 perícias", text: "Cada uma ligada a 1-2 atributos (ex.: Pontaria = AGI, Diplomacia = PRE+INT)." },
        { term: "Graus", text: "Inexperiente +0 · Iniciante +5 · Treinado +10 · Expert +15 · Veterano +20 · Mestre +25." },
        { term: "Perícias treinadas na criação", text: "= arredondar pra cima (INT final × multiplicador do arquétipo): Marcial 1,5x · Especialista 3x · Sensível à Força 2x." },
      ],
    }],
  },
  {
    id: "classes",
    icon: "🛡️",
    title: "Classes e Arquétipos",
    note: "23 classes: 20 iniciais + 3 avançadas no nível 30.",
    blocks: [
      {
        heading: "Arquétipos (PV/PE por nível)",
        rows: [
          { term: "Marcial", text: "PV 20 (+4/nível), PE 2 (+1/nível). Mandaloriano, Soldado da República, Mercenário, Pirata Espacial, Guarda Planetário, Vigilante, Caçador de Recompensas, Explorador." },
          { term: "Especialista", text: "PV 16 (+3/nível), PE 4 (+2/nível). Engenheiro, Piloto, Espião, Contrabandista, Comerciante, Diplomata, Arqueólogo, Cientista, Médico." },
          { term: "Sensível à Força", text: "PV 14 (+2/nível), PE 6 (+3/nível). Padawan Jedi, Acólito Sith, Andarilho da Força + evoluções." },
        ],
      },
      {
        heading: "Classes avançadas (nível 30)",
        rows: [
          { term: "O Lado da Luz", text: "Requer Padawan Jedi nível 30. Progressão em graus: 30/40/50/70/99." },
          { term: "O Lado Negro", text: "Requer Acólito Sith nível 30." },
          { term: "Xamã da Força", text: "Requer Andarilho da Força nível 30." },
        ],
      },
    ],
  },
  {
    id: "sabre",
    icon: "⚔️",
    title: "Formas de Sabre de Luz",
    note: "Só Padawan Jedi, Acólito Sith e Andarilho da Força.",
    blocks: [{
      intro: "Sistema circular de vantagem: cada forma vence exatamente 3 e perde para exatamente 3 — nenhuma é superior no geral.",
      rows: [
        { term: "I. Shii-Cho", text: "Vence II,III,IV — perde para V,VI,VII." },
        { term: "II. Makashi", text: "Vence III,IV,V — perde para VI,VII,I." },
        { term: "III. Soresu", text: "Vence IV,V,VI — perde para VII,I,II." },
        { term: "IV. Ataru", text: "Vence V,VI,VII — perde para I,II,III." },
        { term: "V. Djem So", text: "Vence VI,VII,I — perde para II,III,IV." },
        { term: "VI. Niman", text: "Vence VII,I,II — perde para III,IV,V." },
        { term: "VII. Vaapad", text: "Vence I,II,III — perde para IV,V,VI." },
      ],
    }],
  },
  {
    id: "poderes",
    icon: "✨",
    title: "Pontos de Poder e Poderes Gerais",
    note: "50 Poderes Gerais (18 básicos + 32 avançados), usáveis por qualquer classe/espécie.",
    blocks: [{
      rows: [
        { term: "PP nível 1", text: "= 2 + PRE + modificador da classe (0 a +3)." },
        { term: "PP por nível", text: "= +1 + PRE." },
        { term: "Limite por turno", text: "= 3 + (nível ÷ 2, arredondado pra cima)." },
        { term: "Instantâneo vs Sustentado", text: "Instantâneo: paga uma vez. Sustentado: paga a ativação + 1 PP/turno pra manter." },
      ],
    }],
  },
  {
    id: "nivel",
    icon: "📈",
    title: "Subida de Nível",
    note: "PV/PE/PP sempre sobem; o resto é escolha.",
    blocks: [{
      rows: [
        { term: "Sempre obrigatório", text: "PV, PE e PP sobem todo nível." },
        { term: "Ímpar → Par", text: "Escolha: +1 atributo OU habilidade de classe." },
        { term: "Par → Ímpar", text: "Escolha: Poder Geral OU habilidade de classe." },
        { term: "Sempre disponível", text: "Subir 1 grau de treinamento numa perícia." },
      ],
    }],
  },
  {
    id: "escala-dano",
    icon: "📊",
    title: "Escala de Dano por Nível",
    note: "Dano de habilidades de classe e itens equipados sobe com o nível do personagem.",
    blocks: [
      {
        heading: "A fórmula",
        rows: [
          { term: "Fórmula", text: "Dano Final = Dano Base × (1 + Nível ÷ 5). \"Base\" é o dano no nível 1 — o valor cadastrado na habilidade ou no item." },
          { term: "O que escala", text: "Dano de habilidades de classe, de Poderes Gerais (quando tiverem valor numérico) e de itens equipados." },
          { term: "O que NÃO escala", text: "O golpe de sabre \"cru\" sem Forma (Investida de Sabre, Corte Duplo, Arremesso de Sabre etc.) mantém sua regra própria — 6d6 × maior atributo (AGI/FOR/SEN) + perícia — pra não empilhar dois multiplicadores." },
          { term: "Dado puro", text: "Dano em dado (ex. 4d6) usa a média do dado como base antes de multiplicar (4d6 = 14). O resultado final é arredondado." },
          { term: "Sem teto", text: "A fórmula funciona pra qualquer nível, incluindo além de 99, se a mesa permitir." },
        ],
      },
      {
        heading: "Multiplicador por nível (referência)",
        rows: [
          { term: "Nível 1", text: "× 1.2" },
          { term: "Nível 5", text: "× 2.0" },
          { term: "Nível 10", text: "× 3.0" },
          { term: "Nível 20", text: "× 5.0" },
          { term: "Nível 50", text: "× 11.0" },
        ],
      },
      {
        heading: "Exemplo: Sabre de Luz (item, base 4d6 ≈ 14)",
        rows: [
          { term: "Nível 1", text: "14 × 1.2 = 17" },
          { term: "Nível 5", text: "14 × 2.0 = 28" },
          { term: "Nível 10", text: "14 × 3.0 = 42" },
          { term: "Nível 20", text: "14 × 5.0 = 70" },
          { term: "Nível 50", text: "14 × 11.0 = 154" },
        ],
      },
      {
        heading: "Exemplo: Habilidade de Forma de Sabre (base 10)",
        rows: [
          { term: "Nível 1", text: "10 × 1.2 = 12" },
          { term: "Nível 5", text: "10 × 2.0 = 20" },
          { term: "Nível 10", text: "10 × 3.0 = 30" },
          { term: "Nível 20", text: "10 × 5.0 = 50" },
          { term: "Nível 50", text: "10 × 11.0 = 110" },
        ],
      },
      {
        heading: "Onde consultar em jogo",
        rows: [
          { term: "Habilidades de Classe", text: "Área do teste — verifica se o personagem passa no teste necessário (atributo + perícia, ou DT) pra usar o poder/habilidade." },
          { term: "Área de Danos", text: "Logo abaixo, na aba Jogar: lista o dano de toda habilidade e de todo item equipado já calculado (base → final) no nível atual do personagem." },
        ],
      },
    ],
  },
  {
    id: "multiclasse",
    icon: "🔀",
    title: "Multiclasse",
    note: "Janela grátis no nível 2; depois exige perícias Expert.",
    blocks: [{
      rows: [
        { term: "Nível 2", text: "Multiclasse grátis, sem pré-requisito — única vez." },
        { term: "Depois disso", text: "2 perícias em grau Expert (+15) por cada multiclasse nova." },
        { term: "Restrição de Força", text: "Padawan Jedi, Acólito Sith e Andarilho da Força não podem coexistir entre si (só um caminho de Força por personagem)." },
        { term: "Nível dividido", text: "O nível total é a soma dos níveis em cada classe, não duplicado." },
      ],
    }],
  },
];

export function StarWarsGuide() {
  const [open, setOpen] = useState<string | null>("atributos");

  const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: ACCENT_LIGHT }}>📖</span> Guia do Mestre — Star Wars: Além da Fronteira
      </h2>
      <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", marginTop: -6 }}>
        Referência rápida do sistema autoral — atributos, perícias, classes, formas de sabre, poderes e progressão.
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
