"use client";

import { useState } from "react";

const AL = "#e8e8ef";
const AB = "rgba(255,255,255,0.28)";

// ─── Conteúdo (Livro de Regras — Cap. 5, 6 e 7) ──────────────────────────────

interface Row { term: string; text: string; }
interface Block { heading?: string; intro?: string; rows: Row[]; }
interface Section { id: string; icon: string; title: string; note?: string; blocks: Block[]; }

const SECTIONS: Section[] = [
  {
    id: "perigos",
    icon: "☠️",
    title: "Perigos Ambientais",
    note: "Cap. 7 — riscos que não são seres.",
    blocks: [
      {
        heading: "Exposições",
        rows: [
          { term: "Ácido", text: "1d6 dano químico/rodada. Imersão total: 10d6/rodada + 1 rodada residual." },
          { term: "Lava", text: "2d6 dano de fogo/rodada. Imersão total: 20d6/rodada + 1 rodada residual." },
          { term: "Fogo", text: "Reflexos DT 15 ou fica em chamas (1d6 fogo no início do turno). Ação padrão ou água apaga." },
          { term: "Queda", text: "1d6 impacto por 1,5m, máx 40d6 (60m). Na água: −4d6." },
          { term: "Eletricidade", text: "Mínima 1d6 · Baixa 2d8 · Média 4d10 · Alta 8d12 (raio)." },
          { term: "Fumaça", text: "Fortitude DT 10 (+1/turno) no início do turno; falha perde o turno. 2 falhas seguidas: 1d6 PV." },
          { term: "Sufocamento", text: "Prende o fôlego por Vigor rodadas. Depois Fort DT 5 (+5/teste); falha = inconsciente e 1d6 PV/rodada." },
          { term: "Fome e Sede", text: "Após 1 dia: Fort DT 15 (+1/dia). Falhas: fraco → debilitado → inconsciente → morte." },
          { term: "Sono", text: "Após 1 noite: Fort DT 15 (+1/dia). Falhas: fatigado → exausto → inconsciente (8h de sono)." },
          { term: "Calor/Frio", text: ">50°C ou <−10°C: Fort DT 5 (+5) por dia, falha 1d6 fogo/frio. Extremo (>60°/<−20°): por minuto." },
        ],
      },
      {
        heading: "Clima — Precipitação e Vento",
        rows: [
          { term: "Chuva", text: "−5 em Percepção + efeitos de vento forte." },
          { term: "Granizo", text: "Como chuva + 1 impacto em todos no início da rodada." },
          { term: "Neve", text: "Como chuva + cria terreno difícil." },
          { term: "Tempestade", text: "−10 Percepção. 1d10/rodada: em 1, alguém aleatório leva raio (8d12 elet.)." },
          { term: "Vento Forte", text: "−5 ataque à distância; 50%/rodada de apagar chamas/névoas." },
          { term: "Vendaval", text: "−10 ataque à distância; apaga chamas e névoas." },
          { term: "Furacão", text: "Ataque à distância impossível. Fort DT 15 ou cai, é arrastado 1d4×1,5m e sofre 1d6/1,5m." },
          { term: "Tornado", text: "Ataque à distância impossível. Fort DT 25 ou cai, arrastado 1d12×1,5m (direção aleatória)." },
        ],
      },
      {
        heading: "Doenças",
        intro: "Ao contato: teste de resistência. Falha = estágio I. Ao fim de cada cena repete; falha avança um estágio. 2 sucessos seguidos curam.",
        rows: [
          { term: "Febre Hemorrágica (Fort 15)", text: "I fraco · II debilitado · III+ sangrando ao sofrer dano de corte/balístico/perfuração." },
          { term: "Mente Embaralhada (Vontade 20)", text: "I −1 INT · II INT DT 15 ou perde movimento · III mente parcialmente controlada." },
          { term: "Putrefação Acelerada (Fort 20)", text: "I −1 VIG · II −2 VIG + metade do desloc. · III VIG 0, desloc. 1,5m e ganha lesão." },
          { term: "Sangue Quente (Fort 15)", text: "I +1 FOR/AGI · II confuso · III confuso + vulnerável a todo dano." },
          { term: "Vírus do Infecticídio (Fort 30)", text: "Só cura em <0°C. I −2d10 PV máx (0 PV = morte) · II −2d10 · III+ −2d10 + transmite por contato." },
        ],
      },
      {
        heading: "Venenos",
        intro: "Fort na DT do veneno. Tipos: Contato · Ferimento · Inalação · Ingestão. (Entre parênteses = efeito ao passar.)",
        rows: [
          { term: "Arsênico (Ingestão 15)", text: "1d12/rodada por 1d4 rodadas." },
          { term: "Beladona (Ferimento 20)", text: "Fica fraca." },
          { term: "Clorofórmio (Inalação 25)", text: "Inconsciente (enjoada por 1 rodada)." },
          { term: "Curare (Ferimento 20)", text: "Imóvel (lenta) por 1d6 rodadas." },
          { term: "Estricnina (Ferimento 25)", text: "2d12/rodada por 2d4 rodadas (metade)." },
          { term: "Inseticida (Inalação 15)", text: "Fica enjoada." },
          { term: "Lixo químico (Contato 20)", text: "Debilitada (fraca)." },
          { term: "Peçonha fraca (Ferimento 15)", text: "1d12 (metade)." },
          { term: "Peçonha mortal (Ferimento 25)", text: "Cai com 0 PV (10d6)." },
          { term: "Peçonha potente (Ferimento 20)", text: "1d12/rodada por 1d4 rodadas (metade)." },
          { term: "Sonífero (Ingestão 20)", text: "Inconsciente (enjoada por 1 rodada)." },
        ],
      },
      {
        heading: "Armadilhas",
        intro: "DT de Investigação/Crime para encontrar e desarmar.",
        rows: [
          { term: "Alarme (DT 20)", text: "Alerta sobre intrusos (som ou central)." },
          { term: "Arame Farpado (DT 20)", text: "Terreno difícil + 1d6+2 corte a quem atravessar." },
          { term: "Armadilha de Caça", text: "4d6 corte, fica lenta e imóvel. Reflexos DT 20 reduz à metade. Soltar-se: Força DT 15 (falha 1d6)." },
          { term: "Descarga Elétrica (DT 25)", text: "6d6 eletricidade a 3m; Reflexos DT 20 metade (quem ativou não tem direito)." },
          { term: "Fosso Camuflado (DT 20)", text: "Queda de 3m (2d6); Reflexos DT 20 evita; Atletismo DT 20 para escalar." },
        ],
      },
    ],
  },
  {
    id: "opcionais",
    icon: "⚙️",
    title: "Regras Opcionais",
    note: "Cap. 6 — variantes para ajustar o tom do jogo.",
    blocks: [
      {
        rows: [
          { term: "Contagem de Munição", text: "Pacote = 20 ataques. Capacidade: Pistola 12 · Revólver 6 · Fuzil de Caça 4 · SMG 20 · Espingarda 6 · Fuzil de Assalto 30 · Precisão 1 · Metralhadora 50. Rajada gasta 10 balas e causa +2 dados (em vez de +1)." },
          { term: "Lesões", text: "Ao iniciar o turno morrendo pela 2ª vez na cena: Vigor DT 10. Falha = −1 em atributo permanente (1d6: 1 AGI, 2 FOR, 3 INT, 4 PRE, 5 VIG, 6 nada)." },
          { term: "Personagens NEX 0%", text: "3 pontos de atributo (em vez de 4). Classe Mundano: 8+VIG PV, 1+PRE PE, 8 SAN, 1+INT perícias, habilidade Empenho (1 PE = +2 num teste). Ao NEX 5% escolhe classe (com treinamento)." },
          { term: "Idade Variada", text: "Criança/Adolescente = mais frágeis, bônus próprios. Adulto/Maduro/Idoso ganham poder/NEX extra mas escolhem 1/2/3 desvantagens de 'Peso da Idade' (catarata, frágil, gota, etc.)." },
          { term: "Inspiração Resoluta", text: "Quando um personagem morre, o jogador rola 1d10/rodada até o fim da cena e dá o efeito a outro agente (vingança, cura, ação extra…)." },
          { term: "Loucura Não Letal", text: "Insano continua jogável, mas sofre efeito severo e irreversível (1d6): 1 A culpa é toda sua · 2 Euforia catatônica · 3 Alucinações · 4 Loucura homicida · 5 Amnésia total · 6 Descontrole alucinado." },
        ],
      },
    ],
  },
  {
    id: "sanidade",
    icon: "🧠",
    title: "Sanidade & Exposição Paranormal",
    note: "Cap. 5 — lembretes de dano mental e insanidade.",
    blocks: [
      {
        rows: [
          { term: "Dano Mental", text: "Reduz SAN em vez de PV. Só é reduzido por resistência mental (raro), o que o torna muito letal." },
          { term: "Perturbado", text: "Menos da metade da SAN. Sem penalidade mecânica direta; na 1ª vez na cena, role 1d20 na Tabela 5.1 para um efeito de insanidade temporário." },
          { term: "Enlouquecendo", text: "SAN 0. Deve ser estabilizado em 3 rodadas ou fica insano." },
          { term: "Insano", text: "Mente destruída, injogável — jogador entrega a ficha ao mestre. Equivale a morrer. Efeito temporário passa a durar até o fim da missão." },
          { term: "Múltiplos Efeitos", text: "Um personagem pode acumular vários efeitos de insanidade na mesma missão." },
          { term: "Transcender", text: "Ao receber um poder paranormal, o personagem não ganha a Sanidade daquele aumento de NEX." },
        ],
      },
      {
        heading: "Tabela 5.1 — Efeitos de Insanidade (1d20)",
        rows: [
          { term: "1", text: "Você busca dor — sentir ou causar dor." },
          { term: "2", text: "Vê rostos distorcidos, mesclados com animais ou monstros." },
          { term: "3", text: "Todas as vozes soam deturpadas, como faladas por um monstro." },
          { term: "4", text: "Uma voz na cabeça repete que você está mentindo." },
          { term: "5", text: "Seu sangue parece quente, querendo sair do corpo." },
          { term: "6", text: "Vê rostos nas sombras sempre encarando você." },
          { term: "7", text: "Fome constante, como se nunca pudesse ser saciado." },
          { term: "8", text: "Gosto permanente de ferro/sangue na boca." },
          { term: "9", text: "A luz queima seus olhos; precisa escondê-los." },
          { term: "10", text: "Falar é quase impossível, como se algo controlasse sua fala." },
          { term: "11", text: "Olhos coçam violentamente, como se fossem arrancados." },
          { term: "12", text: "Memória falha: eventos de mais de 1h ficam nebulosos." },
          { term: "13", text: "Emoções trocadas: alegria vira raiva, dor vira felicidade." },
          { term: "14", text: "Necessidade de descrever tudo do modo mais grotesco." },
          { term: "15", text: "Sente vermes correndo sob a pele, veias e órgãos." },
          { term: "16", text: "Acredita estar sob efeito constante de um ritual que o fortalece." },
          { term: "17", text: "Mãos furadas: coisas caem dos bolsos." },
          { term: "18", text: "Acredita que tudo é sorte; deixa decisões ao acaso." },
          { term: "19", text: "As coisas fervem, mas você gosta da dor." },
          { term: "20", text: "Só o fim deve ser celebrado — e você precisa dar fim." },
        ],
      },
    ],
  },
];

// ─── UI ──────────────────────────────────────────────────────────────────────

export function OrdemGuide() {
  const [open, setOpen] = useState<string | null>("perigos");

  const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: AL }}>📖</span> Guia do Mestre — Lembretes de Regras
      </h2>
      <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", marginTop: -6 }}>
        Referência rápida de perigos ambientais, regras opcionais e sanidade. Consulte o livro para o texto completo.
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
                      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: AL, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, paddingTop: 4, borderTop: `1px solid ${AB}` }}>{b.heading}</p>
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
