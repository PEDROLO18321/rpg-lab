"use client";

import { useRef, useState } from "react";
import "../cthulhu-responsive.css";

const DICE_TYPES = [3, 6, 8, 10, 100] as const;
type DiceType = typeof DICE_TYPES[number];

type RollResult = {
  id: number;
  total: number;
  dice: DiceType;
  count: number;
  modifier: number;
  isSuccess: boolean | null;
  skillTarget: number | null;
};

function rollDie(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

function formatFormula(count: number, die: DiceType, modifier: number) {
  return `${count}d${die === 100 ? "%" : die}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`;
}

export function GuardianDiceRoller() {
  const rollId = useRef(0);
  const [open, setOpen] = useState(false);
  const [selectedDie, setSelectedDie] = useState<DiceType>(100);
  const [diceCount, setDiceCount] = useState(1);
  const [diceModifier, setDiceModifier] = useState(0);
  const [skillTarget, setSkillTarget] = useState("");
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);

  function doRoll() {
    const rolls = Array.from({ length: diceCount }, () => rollDie(selectedDie));
    const diceTotal = rolls.reduce((s, v) => s + v, 0) + diceModifier;
    const target = skillTarget !== "" ? Number(skillTarget) : null;
    const isSuccess = target !== null ? diceTotal <= target : null;

    setLastRoll({
      id: ++rollId.current,
      total: diceTotal,
      dice: selectedDie,
      count: diceCount,
      modifier: diceModifier,
      isSuccess,
      skillTarget: target,
    });
  }

  const resultColor =
    lastRoll?.isSuccess === null
      ? "var(--text)"
      : lastRoll?.isSuccess
      ? "#4ade80"
      : "#f87171";

  const resultLabel =
    lastRoll === null || lastRoll.isSuccess === null
      ? null
      : lastRoll.isSuccess
      ? lastRoll.total <= Math.floor((lastRoll.skillTarget ?? 0) / 5)
        ? "EXTREMO"
        : lastRoll.total <= Math.floor((lastRoll.skillTarget ?? 0) / 2)
        ? "DIFÍCIL"
        : "SUCESSO"
      : lastRoll.total === 100
      ? "FALHA CRÍTICA"
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
            border: "1px solid rgba(125,156,62,0.32)",
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
            <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#7d9c3e", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Dados do Guardião
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
          <div className="cth-dice-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginBottom: 12 }}>
            {DICE_TYPES.map((die) => (
              <button
                key={die}
                onClick={() => setSelectedDie(die)}
                title={`d${die}`}
                style={{
                  height: 34,
                  borderRadius: "var(--radius)",
                  background: selectedDie === die ? "rgba(125,156,62,0.14)" : "var(--surface-2)",
                  border: `1px solid ${selectedDie === die ? "#7d9c3e" : "var(--border)"}`,
                  color: selectedDie === die ? "#a3b86c" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "0.64rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-cinzel), serif",
                }}
              >
                {die === 100 ? "d%" : `d${die}`}
              </button>
            ))}
          </div>

          {/* Quantity + modifier */}
          <div className="cth-dice-mod-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Qtd
              <select
                value={diceCount}
                onChange={(e) => setDiceCount(Number(e.target.value))}
                style={{ padding: "7px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                {[1, 2, 3, 4, 6, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
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

          {/* Skill target (for d% success checks) */}
          {selectedDie === 100 && (
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 12 }}>
              Alvo da Perícia (opcional)
              <input
                type="number"
                min={1}
                max={100}
                value={skillTarget}
                onChange={(e) => setSkillTarget(e.target.value)}
                placeholder="Ex: 65"
                style={{ padding: "7px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              {skillTarget && (
                <div style={{ fontSize: "0.62rem", color: "var(--text-subtle)", lineHeight: 1.5 }}>
                  Difícil ≤{Math.floor(Number(skillTarget) / 2)} · Extremo ≤{Math.floor(Number(skillTarget) / 5)}
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
              background: "linear-gradient(135deg, #a3b86c 0%, #7d9c3e 100%)",
              color: "#06090f",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.86rem",
              fontWeight: 900,
              letterSpacing: "0.05em",
              boxShadow: "0 0 16px rgba(125,156,62,0.22)",
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
                {lastRoll.skillTarget !== null && (
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 4 }}>
                    vs {lastRoll.skillTarget}
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
        title="Dados do Guardião"
        style={{
          width: 44,
          height: 96,
          borderRadius: "0 var(--radius-xl) var(--radius-xl) 0",
          background: open ? "#7d9c3e" : "rgba(125,156,62,0.14)",
          color: open ? "#06090f" : "#a3b86c",
          border: "1px solid rgba(125,156,62,0.32)",
          borderLeft: "none",
          cursor: "pointer",
          boxShadow: "0 0 18px rgba(125,156,62,0.22)",
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
