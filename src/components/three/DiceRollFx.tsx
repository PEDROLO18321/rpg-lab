"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePerformanceTier } from "./usePerformanceTier";
import { TUMBLE_MS } from "./diceConstants";

// three.js entra só quando o tier permite (lazy + ssr off).
const Dice3D = dynamic(() => import("./Dice3D"), { ssr: false });

/** Subconjunto de RollEntry que os efeitos precisam. */
export type DiceFxRoll = {
  id: number;
  label: string;
  dice: number;
  total: number;
  isCrit?: boolean;
  isFumble?: boolean;
};

const cinzel = "var(--font-cinzel), serif";

/**
 * Dado central do painel de rolagem: 3D giratório que dá tumble ao rolar
 * e revela o total em HTML (nítido + aria-live). Em tier "off" renderiza
 * o `fallback` (DieSvg existente) — comportamento idêntico ao atual.
 */
export function RollResultDie({
  sides,
  size,
  roll,
  fallback,
}: {
  sides: number;
  size: number;
  roll: DiceFxRoll | null;
  fallback: React.ReactNode;
}) {
  const tier = usePerformanceTier();
  // Derivado por id (sem setState síncrono em effect): rolagem nova fica
  // "não assentada" até o timeout do tumble marcar o id como assentado.
  const [settledId, setSettledId] = useState<number | null>(roll?.id ?? null);

  useEffect(() => {
    if (!roll) return;
    const t = setTimeout(() => setSettledId(roll.id), TUMBLE_MS);
    return () => clearTimeout(t);
  }, [roll]);

  const settled = !roll || settledId === roll.id;

  if (tier === null || tier === "off") return <>{fallback}</>;

  const showResult = roll != null && settled;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <Dice3D sides={sides} size={size} rollToken={roll?.id ?? 0} />
      <div
        aria-live="polite"
        style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center", pointerEvents: "none",
        }}
      >
        {showResult ? (
          <span
            key={roll.id}
            className="dice-result-pop"
            style={{
              fontFamily: cinzel, fontWeight: 900, fontSize: size * 0.3,
              color: roll.isCrit ? "var(--accent-light)" : roll.isFumble ? "#ff6b6b" : "#fff",
              textShadow: "0 2px 12px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.6)",
            }}
          >
            {roll.total}
          </span>
        ) : !roll ? (
          <span
            style={{
              fontFamily: cinzel, fontWeight: 700, fontSize: size * 0.17,
              color: "var(--accent-light)", opacity: 0.9,
              textShadow: "0 1px 8px rgba(0,0,0,0.8)",
            }}
          >
            {sides === 100 ? "d%" : `d${sides}`}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Toast flutuante de rolagem — feedback imediato para testes de perícia,
 * ataques e saves disparados fora do painel de dados. Tumble 3D → resultado
 * → fade out. Em tier "off" mostra o resultado sem 3D (ainda anima o pop).
 */
type ToastPhase = "rolling" | "result" | "exit" | "done";

export function RollToast({ roll }: { roll: DiceFxRoll | null }) {
  const tier = usePerformanceTier();
  // Fase derivada por id de rolagem: roll novo começa "rolling" sem precisar
  // de setState síncrono; os timeouts só avançam a fase (callbacks async).
  const [phaseFor, setPhaseFor] = useState<{ id: number; phase: ToastPhase } | null>(null);

  useEffect(() => {
    if (!roll) return;
    const settleMs = tier === "high" || tier === "low" ? TUMBLE_MS : 250;
    const t1 = setTimeout(() => setPhaseFor({ id: roll.id, phase: "result" }), settleMs);
    const t2 = setTimeout(() => setPhaseFor({ id: roll.id, phase: "exit" }), settleMs + 1600);
    const t3 = setTimeout(() => setPhaseFor({ id: roll.id, phase: "done" }), settleMs + 1950);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [roll, tier]);

  const phase: ToastPhase =
    roll && phaseFor?.id === roll.id ? phaseFor.phase : "rolling";
  if (!roll || phase === "done") return null;
  const visible = roll;

  const show3d = tier === "high" || tier === "low";
  const resultColor = visible.isCrit
    ? "var(--accent-light)"
    : visible.isFumble
    ? "#ff6b6b"
    : "var(--text)";

  return (
    <div
      aria-live="polite"
      className={phase === "exit" ? "roll-overlay-exit" : "roll-overlay-enter"}
      style={{
        position: "fixed", bottom: 24, left: "50%", zIndex: 4000,
        transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 14,
        padding: "10px 20px 10px 12px",
        background: "rgba(13, 17, 26, 0.92)",
        border: `1px solid ${visible.isCrit ? "var(--accent)" : visible.isFumble ? "rgba(255,107,107,0.5)" : "var(--border-accent)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: visible.isCrit && phase === "result"
          ? "0 8px 32px rgba(0,0,0,0.55), 0 0 32px var(--accent-glow-lg)"
          : "0 8px 32px rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        pointerEvents: "none",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      {show3d ? (
        <Dice3D sides={visible.dice} size={56} rollToken={visible.id} />
      ) : (
        <span style={{ fontSize: "1.6rem" }} aria-hidden>🎲</span>
      )}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span
          style={{
            fontSize: "0.66rem", fontWeight: 700, color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.08em",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}
        >
          {visible.label}
        </span>
        {phase === "rolling" ? (
          <span style={{ fontFamily: cinzel, fontSize: "1.35rem", fontWeight: 900, color: "var(--text-subtle)" }}>
            …
          </span>
        ) : (
          <span
            key={visible.id}
            className="dice-result-pop"
            style={{ fontFamily: cinzel, fontSize: "1.35rem", fontWeight: 900, color: resultColor, lineHeight: 1.1 }}
          >
            {visible.total}
            {visible.isCrit && <span style={{ fontSize: "0.6rem", marginLeft: 8, letterSpacing: "0.12em", verticalAlign: "middle" }}>✦ CRÍTICO</span>}
            {visible.isFumble && <span style={{ fontSize: "0.6rem", marginLeft: 8, letterSpacing: "0.12em", verticalAlign: "middle" }}>FALHA</span>}
          </span>
        )}
      </div>
    </div>
  );
}
