"use client";

// ─── Painel de rolagem livre ─────────────────────────────────────────────────
// O rolador que todos os sistemas têm: escolhe a face, a quantidade e o
// modificador, e rola. O painel é dono do próprio estado e devolve o resultado
// pronto — cada ficha decide o que fazer com ele (empilhar no log, disparar o
// toast, aplicar numa regra).
//
// `features` liga o que só alguns sistemas usam: quantidade e soma/maior
// (D&D, Star Wars, Tormenta) e vantagem/desvantagem (só D&D — não é mecânica
// dos outros e não deve aparecer neles).

import { useRef, useState } from "react";
import { DieSvg, rollDie, DICE_SIDES } from "@/components/dice/DieSvg";
import { RollResultDie } from "@/components/three/DiceRollFx";
import type { PlayTheme } from "./theme";

export interface DiceResult {
  sides: number;
  /** Todos os dados que saíram, na ordem. */
  rolls: number[];
  /** O valor que valeu, antes do modificador. */
  kept: number;
  mod: number;
  total: number;
  /** "3d6+2", "d20 com vantagem". */
  label: string;
}

interface Props {
  theme: PlayTheme;
  features?: { qty?: boolean; pickMode?: boolean; advantage?: boolean };
  onRoll: (result: DiceResult) => void;
  /** Faces oferecidas. O Cthulhu joga d100; o D&D usa a lista inteira. */
  sidesList?: readonly number[];
  defaultSides?: number;
}

type Advantage = "normal" | "advantage" | "disadvantage";

export function DicePanel({
  theme, features = {}, onRoll, sidesList = DICE_SIDES, defaultSides = 20,
}: Props) {
  const [sides, setSides] = useState(defaultSides);
  const [qty, setQty] = useState(1);
  const [pickMode, setPickMode] = useState<"sum" | "max">("sum");
  const [mod, setMod] = useState(0);
  const [advantage, setAdvantage] = useState<Advantage>("normal");
  const [last, setLast] = useState<{ id: number; label: string; dice: number; total: number; isCrit?: boolean; isFumble?: boolean } | null>(null);
  const rollId = useRef(0);

  const useQty = features.qty ?? false;
  const usePick = features.pickMode ?? false;
  const useAdv = (features.advantage ?? false) && sides === 20;

  function roll() {
    const count = useQty ? qty : 1;
    let rolls: number[];
    let kept: number;
    let label: string;

    if (useAdv && advantage !== "normal") {
      rolls = [rollDie(sides), rollDie(sides)];
      kept = advantage === "advantage" ? Math.max(...rolls) : Math.min(...rolls);
      label = `d${sides} com ${advantage === "advantage" ? "vantagem" : "desvantagem"}`;
    } else {
      rolls = Array.from({ length: count }, () => rollDie(sides));
      kept = usePick && pickMode === "max" && rolls.length > 1
        ? Math.max(...rolls)
        : rolls.reduce((a, b) => a + b, 0);
      label = `${count}d${sides === 100 ? "%" : sides}${mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : ""}`;
    }

    const total = kept + mod;
    const result: DiceResult = { sides, rolls, kept, mod, total, label };
    setLast({
      id: ++rollId.current, label, dice: sides, total,
      isCrit: sides === 20 && kept === 20,
      isFumble: sides === 20 && kept === 1,
    });
    onRoll(result);
  }

  return (
    <div>
      <div className="play-dice-grid" style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 10 }}>
        {sidesList.map((d) => (
          <button
            key={d}
            onClick={() => setSides(d)}
            aria-label={d === 100 ? "Dado percentual" : `Dado de ${d} faces`}
            aria-pressed={sides === d}
            style={{
              background: "none", border: "none", padding: 0, cursor: "pointer",
              opacity: sides === d ? 1 : 0.4,
              transform: sides === d ? "scale(1.15) translateY(-2px)" : "scale(1)",
              filter: sides === d ? `drop-shadow(0 0 5px ${theme.accent})` : "none",
              transition: "opacity 0.15s, transform 0.15s",
            }}
          >
            <DieSvg sides={d} active={sides === d} size={38} accent={theme.accent} accentLight={theme.accentLight} accentDim={theme.accentDim} />
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <RollResultDie
          sides={sides}
          size={104}
          roll={last && last.dice === sides ? last : null}
          color={theme.accent}
          edgeColor={theme.accentLight}
          emissive={theme.dieEmissive}
          resultColor={theme.dieResult}
          fallback={
            <DieSvg
              sides={sides} active size={104}
              accent={theme.accent} accentLight={theme.accentLight} accentDim={theme.accentDim}
              result={last && last.dice === sides ? last.total : null}
            />
          }
        />
      </div>

      {useAdv && (
        <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 10 }}>
          {(["normal", "advantage", "disadvantage"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAdvantage(a)}
              aria-pressed={advantage === a}
              style={{
                padding: "4px 10px", borderRadius: "var(--radius-xs)", fontSize: "0.66rem", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                background: advantage === a ? "var(--accent-dim)" : "var(--surface-2)",
                border: `1px solid ${advantage === a ? theme.accent : "var(--border)"}`,
                color: advantage === a ? theme.accentLight : "var(--text-subtle)",
              }}
            >
              {a === "normal" ? "Normal" : a === "advantage" ? "Vantagem" : "Desv."}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", marginBottom: 10, flexWrap: "wrap" }}>
        {useQty && (
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Qtd
            <select
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value))}
              style={selectStyle}
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => <option key={n} value={n}>×{n}</option>)}
            </select>
          </label>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "var(--text-muted)" }}>
          Mod
          <input
            type="number"
            value={mod}
            onChange={(e) => setMod(parseInt(e.target.value) || 0)}
            style={{ ...selectStyle, width: 58 }}
          />
        </label>
        {usePick && qty > 1 && (
          <div style={{ display: "flex", gap: 5 }}>
            {(["sum", "max"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPickMode(m)}
                aria-pressed={pickMode === m}
                title={m === "sum" ? "Somar todos os dados" : "Usar o maior dado"}
                style={{
                  padding: "5px 12px", borderRadius: "var(--radius)", fontSize: "0.68rem", fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  background: pickMode === m ? "var(--accent-dim)" : "var(--surface-2)",
                  border: `1px solid ${pickMode === m ? theme.accent : "var(--border)"}`,
                  color: pickMode === m ? theme.accentLight : "var(--text-subtle)",
                }}
              >
                {m === "sum" ? "Soma" : "Maior"}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={roll}
        style={{
          width: "100%", padding: "10px", borderRadius: "var(--radius-lg)",
          background: "var(--accent-dim)", border: `1px solid ${theme.accent}`,
          color: theme.accentLight, fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em",
          boxShadow: `0 0 16px ${theme.glow}`,
        }}
      >
        ROLAR {useQty ? qty : 1}d{sides === 100 ? "%" : sides}{mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : ""}
      </button>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "5px 8px",
  borderRadius: "var(--radius)",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontSize: "0.8rem",
  fontFamily: "inherit",
};
