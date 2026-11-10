"use client";

// Rolador fixo do Mestre. Dois modos: "Teste" (base + 1d10 que explode e
// implode, contra uma DV opcional) e "Dados" (NdX + bônus, para dano e tabelas).

import { useRef, useState } from "react";
import { rollCheck, beatsDv, rollD } from "@/lib/cyberpunk/rules";
import { CP, inputStyle } from "../ui";

const DICE = [4, 6, 8, 10, 12, 20, 100] as const;

interface Result {
  id: number;
  total: number;
  line: string;
  tone: "crit" | "fumble" | "success" | "fail" | null;
  badge: string | null;
}

export function CyberpunkMasterDiceRoller() {
  const rollId = useRef(0);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"test" | "dice">("test");
  const [base, setBase] = useState(10);
  const [dv, setDv] = useState("");
  const [die, setDie] = useState<(typeof DICE)[number]>(6);
  const [count, setCount] = useState(2);
  const [bonus, setBonus] = useState(0);
  const [last, setLast] = useState<Result | null>(null);

  function doRoll() {
    const id = ++rollId.current;
    if (mode === "test") {
      const r = rollCheck(base, 0, bonus);
      const target = dv.trim() === "" ? null : Number(dv);
      const hit = target === null ? null : beatsDv(r.total, target);
      const dice = r.kind === "explode" ? `d10 ${r.natural} + ${r.extra}` : r.kind === "implode" ? `d10 ${r.natural} − ${r.extra}` : `d10 ${r.natural}`;
      setLast({
        id, total: r.total, line: `${dice} + base ${base}${bonus ? ` ${bonus > 0 ? "+" : ""}${bonus}` : ""}`,
        tone: r.kind === "explode" ? "crit" : r.kind === "implode" ? "fumble" : hit === null ? null : hit ? "success" : "fail",
        badge: hit === null ? (r.kind === "explode" ? "EXPLODIU" : r.kind === "implode" ? "IMPLODIU" : null) : hit ? `ACERTA (DV ${target})` : `ERRA (DV ${target})`,
      });
      return;
    }
    const rolls = Array.from({ length: count }, () => rollD(die));
    const total = rolls.reduce((a, b) => a + b, 0) + bonus;
    // Dois ou mais 6 num dado de dano abrem a tabela de ferimento crítico.
    const sixes = die === 6 ? rolls.filter((v) => v === 6).length : 0;
    setLast({
      id, total, line: `[${rolls.join(", ")}]${bonus ? ` ${bonus > 0 ? "+" : ""}${bonus}` : ""}`,
      tone: sixes >= 2 ? "crit" : null, badge: sixes >= 2 ? "CRÍTICO" : null,
    });
  }

  const color = last?.tone === "crit" || last?.tone === "success" ? CP.success : last?.tone === "fumble" || last?.tone === "fail" ? CP.danger : "var(--text)";
  const small: React.CSSProperties = { ...inputStyle, padding: "7px 8px" };

  return (
    <div style={{ position: "fixed", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 60, display: "flex", alignItems: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: open ? "min(280px, calc(100vw - 44px))" : "0px", transition: "grid-template-columns 0.34s cubic-bezier(0.4, 0, 0.2, 1)", overflow: "hidden" }}>
        <div
         
          style={{
            width: "min(280px, calc(100vw - 44px))", padding: 16, background: "var(--surface)",
            border: `1px solid ${CP.accentBord}`, borderLeft: "none", borderRadius: "0 var(--radius-xl) var(--radius-xl) 0",
            boxShadow: "0 12px 36px rgba(0,0,0,0.35)", boxSizing: "border-box",
            opacity: open ? 1 : 0, transform: open ? "translateX(0)" : "translateX(-16px)",
            transition: "opacity 0.3s ease, transform 0.34s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: open ? "auto" : "none", visibility: open ? "visible" : "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 800, color: CP.accentLight, letterSpacing: "0.08em", textTransform: "uppercase" }}>Dados do Mestre</p>
            <button onClick={() => setOpen(false)} aria-label="Fechar" style={{ background: "transparent", border: "none", color: "var(--text-subtle)", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1, width: 28, height: 28 }}>×</button>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {(["test", "dice"] as const).map((m) => (
              <button
                key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
                style={{ flex: 1, minHeight: 32, borderRadius: "var(--radius)", background: mode === m ? CP.accentDim : "var(--surface-2)", border: `1px solid ${mode === m ? CP.accent : "var(--border)"}`, color: mode === m ? CP.accentLight : "var(--text-muted)", fontWeight: 700, fontSize: "0.74rem", cursor: "pointer", fontFamily: "inherit" }}
              >
                {m === "test" ? "Teste d10" : "Dados"}
              </button>
            ))}
          </div>

          {mode === "test" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)" }}>
                Base (atrib.+perícia)
                <input type="number" value={base} onChange={(e) => setBase(Number(e.target.value) || 0)} style={small} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)" }}>
                DV (opcional)
                <input type="number" value={dv} onChange={(e) => setDv(e.target.value)} style={small} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)", gridColumn: "1 / -1" }}>
                Modificador
                <input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value) || 0)} style={small} />
              </label>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                {DICE.map((d) => (
                  <button
                    key={d} onClick={() => setDie(d)} aria-pressed={die === d}
                    style={{ minWidth: 36, minHeight: 32, borderRadius: "var(--radius)", background: die === d ? CP.accentDim : "var(--surface-2)", border: `1px solid ${die === d ? CP.accent : "var(--border)"}`, color: die === d ? CP.accentLight : "var(--text-muted)", cursor: "pointer", fontSize: "0.68rem", fontWeight: 800, fontFamily: "var(--font-cinzel), serif" }}
                  >
                    {d === 100 ? "d%" : `d${d}`}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)" }}>
                  Qtd
                  <select value={count} onChange={(e) => setCount(Number(e.target.value))} style={small}>
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)" }}>
                  Bônus
                  <input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value) || 0)} style={small} />
                </label>
              </div>
            </>
          )}

          <button
            onClick={doRoll}
            style={{ width: "100%", padding: 10, minHeight: 40, borderRadius: "var(--radius-lg)", background: `linear-gradient(135deg, ${CP.accentLight} 0%, ${CP.accent} 100%)`, color: "#0b0614", border: "none", cursor: "pointer", fontFamily: "var(--font-cinzel), serif", fontSize: "0.86rem", fontWeight: 900, letterSpacing: "0.05em", boxShadow: `0 0 16px ${CP.glow}`, marginBottom: 12 }}
          >
            {mode === "test" ? "Rolar teste" : `Rolar ${count}d${die === 100 ? "%" : die}`}
          </button>

          <div style={{ minHeight: 96, padding: 14, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
            {last ? (
              <>
                <p key={last.id} style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2.6rem", fontWeight: 900, color, lineHeight: 1 }}>{last.total}</p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 4 }}>{last.line}</p>
                {last.badge && <span style={{ display: "inline-block", marginTop: 6, fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.08em", color, border: `1px solid ${color}`, borderRadius: "var(--radius-xs)", padding: "2px 8px" }}>{last.badge}</span>}
              </>
            ) : (
              <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", paddingTop: 22 }}>Sem rolagem</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar dados" : "Abrir dados"} aria-expanded={open} title="Dados do Mestre"
        style={{ width: 44, height: 96, borderRadius: "0 var(--radius-xl) var(--radius-xl) 0", background: open ? CP.accent : CP.accentDim, color: open ? "#0b0614" : CP.accentLight, border: `1px solid ${CP.accentBord}`, borderLeft: "none", cursor: "pointer", boxShadow: `0 0 18px ${CP.glow}`, fontFamily: "var(--font-cinzel), serif", fontWeight: 900, writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.08em", fontSize: "0.68rem" }}
      >
        Dados
      </button>
    </div>
  );
}
