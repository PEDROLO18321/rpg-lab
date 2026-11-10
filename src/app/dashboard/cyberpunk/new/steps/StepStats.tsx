"use client";

import {
  COMPLETE_STAT_POINTS, STATS, STAT_KEYS, STAT_MAX, STAT_MIN, STREETRAT_STATS, statsFromRow, type Stats,
} from "@/lib/cyberpunk/data";
import { hpMax, humanityMax, rollD, seriousThreshold } from "@/lib/cyberpunk/rules";
import { CP, GhostButton, PrimaryButton, SectionTitle, SelectCard, pillBtn } from "../../ui";
import { INITIAL, defaultCompleteSkills, type Method, type WizardData } from "../wizardModel";

interface Props {
  data: WizardData;
  onChange: (p: Partial<WizardData>) => void;
}

const METHODS: { id: Method; label: string; sub: string; desc: string }[] = [
  { id: "streetrat", label: "Streetrat", sub: "Rápido", desc: "Escolha (ou sorteie com 1d10) uma linha inteira da tabela do seu papel." },
  { id: "edgerunner", label: "Edgerunner", sub: "Aleatório por atributo", desc: "Role 1d10 para cada atributo; o resultado aponta a linha da tabela daquela coluna." },
  { id: "complete", label: "Pacote Completo", sub: "Total controle", desc: `Distribua ${COMPLETE_STAT_POINTS} pontos entre os 10 atributos, de ${STAT_MIN} a ${STAT_MAX} cada.` },
];

export function sumStats(s: Stats) {
  return STAT_KEYS.reduce((n, k) => n + s[k], 0);
}

const BASE_COMPLETE = Object.fromEntries(STAT_KEYS.map((k) => [k, STAT_MIN])) as Stats;

export function StepStats({ data, onChange }: Props) {
  const table = STREETRAT_STATS[data.role];

  function setMethod(m: Method) {
    // Trocar de método descarta o que o outro produziu: misturar linhas de
    // tabela com pontos distribuídos não tem regra no livro.
    onChange({
      method: m, stats: m === "complete" ? { ...BASE_COMPLETE } : null,
      edgeRolls: INITIAL.edgeRolls, streetratRow: null,
      skills: m === "complete" ? defaultCompleteSkills() : {},
    });
  }

  function pickRow(i: number) {
    onChange({ streetratRow: i, stats: statsFromRow(table[i]) });
  }

  function rollEdge(col: number | "all") {
    const rolls = [...data.edgeRolls];
    if (col === "all") STAT_KEYS.forEach((_, c) => { rolls[c] = rollD(10); });
    else rolls[col] = rollD(10);
    const complete = rolls.every((r) => r !== null);
    onChange({
      edgeRolls: rolls,
      stats: complete ? statsFromRow(STAT_KEYS.map((_, c) => table[(rolls[c] as number) - 1][c])) : null,
    });
  }

  function step(k: (typeof STAT_KEYS)[number], d: number) {
    const cur = data.stats ?? BASE_COMPLETE;
    const v = cur[k] + d;
    if (v < STAT_MIN || v > STAT_MAX) return;
    if (d > 0 && sumStats(cur) >= COMPLETE_STAT_POINTS) return;
    onChange({ stats: { ...cur, [k]: v } });
  }

  const stats = data.stats;
  const used = stats ? sumStats(stats) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle eyebrow="Passo 2" title="Atributos" desc="Escolha o método de criação. O papel só altera as tabelas dos métodos Streetrat e Edgerunner." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 10 }}>
        {METHODS.map((m) => (
          <SelectCard key={m.id} label={m.label} sublabel={m.sub} selected={data.method === m.id} onClick={() => setMethod(m.id)}>
            <span style={{ fontSize: "0.74rem", color: CP.textMuted, lineHeight: 1.5 }}>{m.desc}</span>
          </SelectCard>
        ))}
      </div>

      {data.method === "streetrat" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <PrimaryButton onClick={() => pickRow(rollD(10) - 1)}>🎲 Rolar 1d10</PrimaryButton>
            <span style={{ fontSize: "0.78rem", color: CP.textMuted }}>ou toque numa linha da tabela.</span>
          </div>
          <StatTable
            rows={table.map((r, i) => ({ label: String(i + 1), values: r, active: data.streetratRow === i, onPick: () => pickRow(i) }))}
          />
        </div>
      )}

      {data.method === "edgerunner" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <PrimaryButton onClick={() => rollEdge("all")}>🎲 Rolar todos</PrimaryButton>
            <span style={{ fontSize: "0.78rem", color: CP.textMuted }}>Cada atributo usa o próprio d10; rerole um só se quiser.</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(150px, 100%), 1fr))", gap: 8 }}>
            {STATS.map((s, c) => {
              const r = data.edgeRolls[c];
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 800, color: CP.accentLight, minWidth: 34 }}>{s.short}</span>
                  <span style={{ flex: 1, fontSize: "0.8rem", color: "var(--text)" }}>
                    {r === null ? "—" : <>d10 <b>{r}</b> → <b style={{ color: CP.accentLight }}>{table[r - 1][c]}</b></>}
                  </span>
                  <button type="button" onClick={() => rollEdge(c)} aria-label={`Rolar ${s.name}`} style={pillBtn}>🎲</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.method === "complete" && stats && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: "0.84rem", color: used === COMPLETE_STAT_POINTS ? CP.success : CP.warn, fontWeight: 700 }}>
            {used}/{COMPLETE_STAT_POINTS} pontos gastos — restam {COMPLETE_STAT_POINTS - used}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(190px, 100%), 1fr))", gap: 8 }}>
            {STATS.map((s) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: CP.accentLight }}>{s.short}</span>
                  <span style={{ display: "block", fontSize: "0.68rem", color: CP.textSubtle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                </span>
                <button type="button" onClick={() => step(s.key, -1)} aria-label={`Diminuir ${s.name}`} style={{ ...pillBtn, width: 30, padding: 0 }}>−</button>
                <b style={{ minWidth: 20, textAlign: "center", fontFamily: "var(--font-cinzel), serif" }}>{stats[s.key]}</b>
                <button type="button" onClick={() => step(s.key, 1)} aria-label={`Aumentar ${s.name}`} style={{ ...pillBtn, width: 30, padding: 0 }}>+</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && data.method !== "complete" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(110px, 100%), 1fr))", gap: 8 }}>
          {STATS.map((s) => (
            <div key={s.key} style={{ padding: "8px 10px", background: CP.accentDim, border: `1px solid ${CP.accentBord}`, borderRadius: "var(--radius)", textAlign: "center" }}>
              <div style={{ fontSize: "0.66rem", fontWeight: 800, color: CP.accentLight }}>{s.short}</div>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.2rem", fontWeight: 800 }}>{stats[s.key]}</div>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Derived label="HP" value={hpMax(stats.body, stats.will)} hint={`Gravemente ferido abaixo de ${seriousThreshold(hpMax(stats.body, stats.will))}`} />
          <Derived label="Humanidade" value={humanityMax(stats.emp)} hint="EMP × 10" />
          <Derived label="Salvaguarda" value={stats.body} hint="rolar abaixo do CORPO" />
        </div>
      )}

      {data.method !== "complete" && stats && (
        <div><GhostButton onClick={() => onChange({ stats: null, streetratRow: null, edgeRolls: INITIAL.edgeRolls })}>Limpar atributos</GhostButton></div>
      )}
    </div>
  );
}

function Derived({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div style={{ padding: "8px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", minWidth: 120 }}>
      <div style={{ fontSize: "0.6rem", fontWeight: 700, color: CP.textSubtle, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "1.1rem", fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: "0.64rem", color: CP.textMuted }}>{hint}</div>
    </div>
  );
}

/** Tabela de 10 linhas × 10 colunas; rola na horizontal dentro do próprio contêiner. */
function StatTable({ rows }: { rows: { label: string; values: number[]; active: boolean; onPick: () => void }[] }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.8rem" }}>
        <thead>
          <tr>
            <th style={{ padding: "6px 8px", textAlign: "left", color: CP.textSubtle }}>d10</th>
            {STATS.map((s) => <th key={s.key} style={{ padding: "6px 8px", color: CP.accentLight, fontSize: "0.7rem" }}>{s.short}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.label}
              role="button" tabIndex={0} aria-pressed={r.active}
              onClick={r.onPick}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); r.onPick(); } }}
              style={{ cursor: "pointer", background: r.active ? CP.accentDim : "transparent", outline: r.active ? `1px solid ${CP.accentBord}` : "none" }}
            >
              <td style={{ padding: "8px", fontWeight: 700, color: r.active ? CP.accentLight : CP.textMuted }}>{r.label}</td>
              {r.values.map((v, i) => <td key={i} style={{ padding: "8px", textAlign: "center" }}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
