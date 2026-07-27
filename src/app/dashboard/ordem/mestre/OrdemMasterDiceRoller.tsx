"use client";

import { useRef, useState } from "react";
import "../ordem-responsive.css";

const A = "#ffffff";
const AL = "#e8e8ef";
const AD = "rgba(255,255,255,0.1)";
const AB = "rgba(255,255,255,0.28)";

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;
type DiceType = typeof DICE_TYPES[number];

type RollResult = {
  id: number;
  total: number;
  dice: DiceType;
  count: number;
  modifier: number;
  rolls: number[];
  kept: number | null;       // d20: maior dado mantido
  isSuccess: boolean | null; // vs DT
  dt: number | null;
};

function rollDie(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

function formatFormula(count: number, die: DiceType, modifier: number) {
  return `${count}d${die}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`;
}

export function OrdemMasterDiceRoller() {
  const rollId = useRef(0);
  const [open, setOpen] = useState(false);
  const [selectedDie, setSelectedDie] = useState<DiceType>(20);
  const [diceCount, setDiceCount] = useState(1);
  const [diceModifier, setDiceModifier] = useState(0);
  const [dt, setDt] = useState("");
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);

  function doRoll() {
    const rolls = Array.from({ length: diceCount }, () => rollDie(selectedDie));
    // Em Ordem, testes de d20 rolam N dados e mantêm o MAIOR. Demais dados somam.
    const isD20 = selectedDie === 20;
    const kept = isD20 ? Math.max(...rolls) : null;
    const base = isD20 ? kept! : rolls.reduce((s, v) => s + v, 0);
    const total = base + diceModifier;
    const target = dt !== "" ? Number(dt) : null;
    const isSuccess = isD20 && target !== null ? total >= target : null;

    setLastRoll({
      id: ++rollId.current,
      total,
      dice: selectedDie,
      count: diceCount,
      modifier: diceModifier,
      rolls,
      kept,
      isSuccess,
      dt: target,
    });
  }

  const resultColor =
    lastRoll?.isSuccess === null || lastRoll == null
      ? "var(--text)"
      : lastRoll.isSuccess
      ? "#4ade80"
      : "#f87171";

  const resultLabel =
    lastRoll == null || lastRoll.isSuccess === null
      ? null
      : lastRoll.kept === 20
      ? "ACERTO CRÍTICO"
      : lastRoll.kept === 1
      ? "FALHA CRÍTICA"
      : lastRoll.isSuccess
      ? "SUCESSO"
      : "FALHA";

  return (
    <div style={{ position: "fixed", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 60, display: "flex", alignItems: "center" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: open ? "280px" : "0px",
          transition: "grid-template-columns 0.34s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 280,
            padding: "16px",
            background: "var(--surface)",
            border: `1px solid ${AB}`,
            borderLeft: "none",
            borderRadius: "0 var(--radius-xl) var(--radius-xl) 0",
            boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
            boxSizing: "border-box",
            opacity: open ? 1 : 0,
            transform: open ? "translateX(0)" : "translateX(-16px)",
            transition: "opacity 0.3s ease, transform 0.34s cubic-bezier(0.4, 0, 0.2, 1)",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 800, color: A, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Dados do Mestre
            </p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              style={{ background: "transparent", border: "none", color: "var(--text-subtle)", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          {/* Die selector */}
          <div className="op-master-dice-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 12 }}>
            {DICE_TYPES.map((die) => (
              <button
                key={die}
                onClick={() => setSelectedDie(die)}
                title={`d${die}`}
                style={{
                  height: 32,
                  borderRadius: "var(--radius)",
                  background: selectedDie === die ? AD : "var(--surface-2)",
                  border: `1px solid ${selectedDie === die ? A : "var(--border)"}`,
                  color: selectedDie === die ? AL : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "0.56rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-cinzel), serif",
                  padding: 0,
                }}
              >
                {die === 100 ? "d%" : `d${die}`}
              </button>
            ))}
          </div>

          {/* Quantity + modifier */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)" }}>
              {selectedDie === 20 ? "Qtd (pega maior)" : "Qtd"}
              <select
                value={diceCount}
                onChange={(e) => setDiceCount(Number(e.target.value))}
                style={{ padding: "7px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Bônus
              <input
                type="number"
                value={diceModifier}
                onChange={(e) => setDiceModifier(Number(e.target.value) || 0)}
                style={{ padding: "7px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </label>
          </div>

          {/* DT (success check for d20) */}
          {selectedDie === 20 && (
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 12 }}>
              DT do Teste (opcional)
              <input
                type="number"
                min={1}
                value={dt}
                onChange={(e) => setDt(e.target.value)}
                placeholder="Ex: 15"
                style={{ padding: "7px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              {dt && (
                <div style={{ fontSize: "0.62rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>
                  Sucesso se o resultado ≥ {dt}
                </div>
              )}
            </label>
          )}

          {/* Roll button */}
          <button
            onClick={doRoll}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "var(--radius-lg)",
              background: `linear-gradient(135deg, ${A} 0%, #b9b9c6 100%)`,
              color: "#06090f",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.86rem",
              fontWeight: 900,
              letterSpacing: "0.05em",
              boxShadow: "0 0 16px rgba(255,255,255,0.18)",
              marginBottom: 12,
            }}
          >
            Rolar {formatFormula(diceCount, selectedDie, diceModifier)}
          </button>

          {/* Result */}
          <div style={{ minHeight: 96, padding: "14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
            {lastRoll ? (
              <>
                <p key={lastRoll.id} style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2.6rem", fontWeight: 900, color: resultColor, lineHeight: 1 }}>
                  {lastRoll.total}
                </p>
                {lastRoll.count > 1 && (
                  <p style={{ fontSize: "0.68rem", color: "var(--text-subtle)", marginTop: 4 }}>
                    [{lastRoll.rolls.join(", ")}]{lastRoll.kept !== null ? ` → maior ${lastRoll.kept}` : ""}
                  </p>
                )}
                {lastRoll.dt !== null && (
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                    vs DT {lastRoll.dt}
                  </p>
                )}
                {resultLabel && (
                  <span style={{
                    display: "inline-block",
                    marginTop: 6,
                    fontSize: "0.64rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    color: resultColor,
                    background: lastRoll.isSuccess ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                    border: `1px solid ${lastRoll.isSuccess ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
                    borderRadius: "var(--radius-xs)",
                    padding: "2px 8px",
                  }}>
                    {resultLabel}
                  </span>
                )}
              </>
            ) : (
              <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", paddingTop: 22 }}>Sem rolagem</p>
            )}
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar dados" : "Abrir dados"}
        title="Dados do Mestre"
        style={{
          width: 44,
          height: 96,
          borderRadius: "0 var(--radius-xl) var(--radius-xl) 0",
          background: open ? A : AD,
          color: open ? "#06090f" : AL,
          border: `1px solid ${AB}`,
          borderLeft: "none",
          cursor: "pointer",
          boxShadow: "0 0 18px rgba(255,255,255,0.18)",
          fontFamily: "var(--font-cinzel), serif",
          fontWeight: 900,
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          letterSpacing: "0.08em",
          fontSize: "0.68rem",
        }}
      >
        Dados
      </button>
    </div>
  );
}
