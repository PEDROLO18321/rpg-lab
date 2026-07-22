"use client";

import { useRef, useState } from "react";

const ACCENT = "#a01818";
const ACCENT_LIGHT = "#c94040";
const ACCENT_DIM = "rgba(160,24,24,0.12)";
const ACCENT_BORD = "rgba(160,24,24,0.28)";
const ACCENT_GLOW = "rgba(160,24,24,0.22)";

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;
type DiceType = typeof DICE_TYPES[number];
type AdvantageMode = "normal" | "advantage" | "disadvantage";
type PickMode = "sum" | "max";

type RollResult = {
  id: number;
  total: number;
  dice: DiceType;
  count: number;
  modifier: number;
  isCrit: boolean;
  isFumble: boolean;
};

function rollDie(sides: number) {
  return Math.floor(Math.random() * sides) + 1;
}

function formatFormula(count: number, die: DiceType, modifier: number) {
  return `${count}d${die}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`;
}

export function MasterDiceRoller() {
  const rollId = useRef(0);
  const [open, setOpen] = useState(false);
  const [selectedDie, setSelectedDie] = useState<DiceType>(20);
  const [diceCount, setDiceCount] = useState(1);
  const [diceModifier, setDiceModifier] = useState(0);
  const [advantage, setAdvantage] = useState<AdvantageMode>("normal");
  const [advExtraDice, setAdvExtraDice] = useState(1);
  const [pickMode, setPickMode] = useState<PickMode>("sum");
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null);

  function doRoll() {
    const mode = selectedDie === 20 ? advantage : "normal";
    let rolls: number[];

    if (selectedDie === 20 && mode !== "normal") {
      const allRolls = Array.from({ length: 1 + advExtraDice }, () => rollDie(20));
      rolls = [mode === "advantage" ? Math.max(...allRolls) : Math.min(...allRolls)];
    } else {
      rolls = Array.from({ length: diceCount }, () => rollDie(selectedDie));
    }

    const diceTotal = pickMode === "max" && mode === "normal" && rolls.length > 1
      ? Math.max(...rolls)
      : rolls.reduce((sum, value) => sum + value, 0);

    setLastRoll({
      id: ++rollId.current,
      total: diceTotal + diceModifier,
      dice: selectedDie,
      count: selectedDie === 20 && mode !== "normal" ? 1 : diceCount,
      modifier: diceModifier,
      isCrit: selectedDie === 20 && rolls[0] === 20,
      isFumble: selectedDie === 20 && rolls[0] === 1,
    });
  }

  return (
    <div style={{ position: "fixed", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 60, display: "flex", alignItems: "center" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: open ? "260px" : "0px",
          transition: "grid-template-columns 0.34s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 260,
            padding: "16px",
            background: "var(--surface)",
            border: `1px solid ${ACCENT_BORD}`,
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
            <p style={{ fontSize: "0.72rem", fontWeight: 800, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Dados do Mestre
            </p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar rolagem de dados"
              style={{ background: "transparent", border: "none", color: "var(--text-subtle)", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}
            >
              x
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 12 }}>
            {DICE_TYPES.map((die) => (
              <button
                key={die}
                onClick={() => setSelectedDie(die)}
                title={`d${die}`}
                style={{
                  height: 32,
                  borderRadius: "var(--radius)",
                  background: selectedDie === die ? ACCENT_DIM : "var(--surface-2)",
                  border: `1px solid ${selectedDie === die ? ACCENT : "var(--border)"}`,
                  color: selectedDie === die ? ACCENT_LIGHT : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "0.66rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-cinzel), serif",
                }}
              >
                {die === 100 ? "d%" : `d${die}`}
              </button>
            ))}
          </div>

          {selectedDie === 20 && (
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
              {(["normal", "advantage", "disadvantage"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAdvantage(mode)}
                  style={{
                    flex: 1,
                    padding: "6px 4px",
                    borderRadius: "var(--radius-xs)",
                    background: advantage === mode ? ACCENT_DIM : "var(--surface-2)",
                    border: `1px solid ${advantage === mode ? ACCENT : "var(--border)"}`,
                    color: advantage === mode ? ACCENT_LIGHT : "var(--text-subtle)",
                    cursor: "pointer",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                  }}
                >
                  {mode === "normal" ? "Normal" : mode === "advantage" ? "Vant." : "Desv."}
                </button>
              ))}
            </div>
          )}

          {selectedDie === 20 && advantage !== "normal" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Extras</span>
              <input
                type="number"
                min={1}
                max={5}
                value={advExtraDice}
                onChange={(event) => setAdvExtraDice(Math.max(1, Math.min(5, Number(event.target.value) || 1)))}
                style={{ width: 54, padding: "5px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Qtd
              <select
                value={diceCount}
                onChange={(event) => setDiceCount(Number(event.target.value))}
                disabled={selectedDie === 20 && advantage !== "normal"}
                style={{ padding: "7px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                {[1, 2, 3, 4, 6, 8, 10, 12].map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Mod
              <input
                type="number"
                value={diceModifier}
                onChange={(event) => setDiceModifier(Number(event.target.value) || 0)}
                style={{ padding: "7px 8px", borderRadius: "var(--radius)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </label>
          </div>

          {!(selectedDie === 20 && advantage !== "normal") && (
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {(["sum", "max"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPickMode(mode)}
                  disabled={diceCount <= 1}
                  style={{
                    flex: 1,
                    padding: "7px 8px",
                    borderRadius: "var(--radius)",
                    background: pickMode === mode ? ACCENT_DIM : "var(--surface-2)",
                    border: `1px solid ${pickMode === mode ? ACCENT : "var(--border)"}`,
                    color: pickMode === mode ? ACCENT_LIGHT : "var(--text-muted)",
                    cursor: diceCount <= 1 ? "default" : "pointer",
                    opacity: diceCount <= 1 ? 0.45 : 1,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {mode === "sum" ? "Soma" : "Maior"}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={doRoll}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "var(--radius-lg)",
              background: `linear-gradient(135deg, ${ACCENT_LIGHT} 0%, ${ACCENT} 100%)`,
              color: "#06090f",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.86rem",
              fontWeight: 900,
              letterSpacing: "0.05em",
              boxShadow: `0 0 16px ${ACCENT_GLOW}`,
            }}
          >
            Rolar {formatFormula(selectedDie === 20 && advantage !== "normal" ? 1 : diceCount, selectedDie, diceModifier)}
          </button>

          <div style={{ minHeight: 86, marginTop: 14, padding: "14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", textAlign: "center" }}>
            {lastRoll ? (
              <>
                <p style={{ fontSize: "0.62rem", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Resultado
                </p>
                <p key={lastRoll.id} style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "2.5rem", fontWeight: 900, color: lastRoll.isCrit ? ACCENT_LIGHT : lastRoll.isFumble ? "#ff6b6b" : "var(--text)", lineHeight: 1 }}>
                  {lastRoll.total}
                </p>
              </>
            ) : (
              <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", paddingTop: 20 }}>
                Sem rolagem
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar rolagem de dados" : "Abrir rolagem de dados"}
        title="Dados do Mestre"
        style={{
          width: 44,
          height: 96,
          borderRadius: "0 var(--radius-xl) var(--radius-xl) 0",
          background: open ? ACCENT : ACCENT_DIM,
          color: open ? "#06090f" : ACCENT_LIGHT,
          border: `1px solid ${ACCENT_BORD}`,
          borderLeft: "none",
          cursor: "pointer",
          boxShadow: `0 0 18px ${ACCENT_GLOW}`,
          fontFamily: "var(--font-cinzel), serif",
          fontWeight: 900,
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          letterSpacing: "0.08em",
        }}
      >
        Dados
      </button>
    </div>
  );
}
