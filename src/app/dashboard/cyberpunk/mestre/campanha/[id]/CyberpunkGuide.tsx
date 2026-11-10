"use client";

import { useState } from "react";
import { RANGE_BANDS, RANGED_DV } from "@/lib/cyberpunk/rules";
import { CP, SectionTitle } from "../../../ui";
import "../../../cyberpunk-responsive.css";

const RANGE_LABEL: Record<string, string> = { pistol: "Pistola", smg: "Submetralhadora", shotgun: "Escopeta", assaultRifle: "Fuzil de assalto", sniperRifle: "Fuzil de precisão", bow: "Arco", grenadeLauncher: "Lança-granadas", rocketLauncher: "Lança-foguetes" };

const DV_TABLE: [string, number][] = [["Simples", 9], ["Cotidiano", 13], ["Difícil", 15], ["Profissional", 17], ["Heroico", 21], ["Incrível", 24], ["Lendário", 29]];

const RULES: { title: string; lines: string[] }[] = [
  { title: "O teste básico", lines: ["ATRIBUTO + nível da perícia + 1d10 + modificadores, e o total precisa SUPERAR a DV (empate favorece a DV).", "10 natural: role outro d10 e some (uma vez). 1 natural: role outro d10 e subtraia (uma vez).", "Testes opostos: o maior vence; empate fica com o defensor."] },
  { title: "Vida e ferimentos", lines: ["HP = 10 + 5 × (média de CORPO e VONTADE, arredondada para cima).", "Abaixo do HP máximo: levemente ferido, sem penalidade. Abaixo da metade: gravemente ferido, −2 em todas as Ações.", "HP 0 ou menos: mortalmente ferido, −4 nas Ações e −6 em MOVIMENTO; salvaguarda a cada turno.", "Estabilizar: Primeiros Socorros/Paramédico com DV 10 (leve), 13 (grave) ou 15 (mortal)."] },
  { title: "Salvaguarda contra a Morte", lines: ["Role 1d10 e some a penalidade acumulada: precisa ficar ESTRITAMENTE abaixo do CORPO.", "Um 10 natural sempre falha. Cada nova salvaguarda aumenta a penalidade em +1.", "Alguns ferimentos críticos já começam com +1 de penalidade."] },
  { title: "Armadura e dano", lines: ["Cabeça e corpo têm PA separados; camadas não somam, vale a maior.", "O dano que passa da PA vai para o HP, e a armadura perde 1 ponto se algo atravessou.", "Tiro na cabeça: o dano que passa vale o dobro. Armas brancas ignoram metade da PA (arredondada para cima).", "Dois ou mais 6 nos dados de dano: ferimento crítico, +5 de dano direto ao HP."] },
  { title: "Iniciativa e movimento", lines: ["Iniciativa = REF + 1d10. A cada turno: uma Ação de Movimento (MOV × 2 m) e uma Ação.", "Correr usa as duas ações de movimento: MOV × 4 m no turno."] },
  { title: "Humanidade", lines: ["Humanidade = EMP × 10. A EMP atual é a dezena da Humanidade: HUM 44 → EMP 4.", "Cada peça de ciberware tira Humanidade (valor fixo na criação, rolado depois).", "Abaixo de zero: ciberpsicose. Terapia recupera pontos, a um custo em eurobucks."] },
];

export function CyberpunkGuide() {
  const [open, setOpen] = useState<string | null>(RULES[0].title);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionTitle eyebrow="Guia" title="Resumo de regras do Mestre" desc="Consulta rápida com números e fórmulas; as regras completas estão no livro." />

      {RULES.map((r) => {
        const isOpen = open === r.title;
        return (
          <div key={r.title} style={{ background: CP.panel, border: `1px solid ${isOpen ? CP.accentBord : CP.panelBorder}`, borderRadius: "var(--radius-xl)" }}>
            <button type="button" onClick={() => setOpen(isOpen ? null : r.title)} aria-expanded={isOpen} style={{ width: "100%", minHeight: 44, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", background: "none", border: "none", cursor: "pointer", color: "var(--text)", fontFamily: "var(--font-cinzel), serif", fontWeight: 700, fontSize: "0.92rem", textAlign: "left" }}>
              {r.title}<span aria-hidden style={{ transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>
            </button>
            {isOpen && <ul style={{ margin: 0, padding: "0 18px 16px 34px", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{r.lines.map((l) => <li key={l}>{l}</li>)}</ul>}
          </div>
        );
      })}

      <div style={{ background: CP.panel, border: `1px solid ${CP.panelBorder}`, borderRadius: "var(--radius-xl)", padding: "14px 18px" }}>
        <p style={{ fontFamily: "var(--font-cinzel), serif", fontWeight: 700, marginBottom: 8 }}>Dificuldades (DV)</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {DV_TABLE.map(([n, v]) => <span key={n} style={{ padding: "4px 10px", background: CP.accentDim, border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius-full)", fontSize: "0.78rem" }}>{n} <b style={{ color: CP.accentLight }}>{v}</b></span>)}
        </div>
      </div>

      <div style={{ background: CP.panel, border: `1px solid ${CP.panelBorder}`, borderRadius: "var(--radius-xl)", padding: "14px 18px" }}>
        <p style={{ fontFamily: "var(--font-cinzel), serif", fontWeight: 700, marginBottom: 8 }}>DV de tiro por distância (m)</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: "0.76rem", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 6, color: CP.textSubtle }}>Arma</th>
                {RANGE_BANDS.map((b) => <th key={b} style={{ padding: 6, color: CP.accentLight }}>≤{b}</th>)}
              </tr>
            </thead>
            <tbody>
              {Object.entries(RANGED_DV).map(([k, row]) => (
                <tr key={k} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: 6, whiteSpace: "nowrap" }}>{RANGE_LABEL[k] ?? k}</td>
                  {row.map((v, i) => <td key={i} style={{ padding: 6, textAlign: "center", color: v === null ? CP.textSubtle : "var(--text)" }}>{v ?? "—"}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
