"use client";

// ─── Campo numérico com botões de passo ──────────────────────────────────────
// Genérico: não sabe de sistema nem de ficha. Quem usa decide o que fazer a
// cada `onChange` (o chamador é que adia a gravação no servidor; aqui só
// emitimos valores já limitados a [min, max]).
//
// Segurar o botão repete a ação: começa devagar (~400 ms) e acelera até ~50 ms
// entre disparos; depois de ~1,5 s o passo cresce. Cliques rápidos em sequência
// também aceleram. O ganho é limitado pela faixa do campo, senão um atributo
// de 1 a 10 passaria direto de 3 para 10 num toque mais demorado.

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

interface Props {
  /** Nome do campo, usado nos aria-labels dos botões. */
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  /**
   * Passos que viram botões (−N … +N). Sem isto, saem da faixa (ver stepsFor).
   */
  steps?: number[];
  disabled?: boolean;
}

const AUTO_STEPS = [1, 5, 10];

/** Passos que cabem pelo menos duas vezes na faixa: 1 a 10 fica só com ±1. */
export function stepsFor(min: number, max: number): number[] {
  const span = max - min;
  return AUTO_STEPS.filter((s) => s === 1 || s * 2 <= span);
}

const FIRST_DELAY = 400;
const MIN_DELAY = 50;
const BOOST_AFTER = 1500;
const STREAK_GAP = 350;

export function Stepper({ label, value, onChange, min, max, steps, disabled }: Props) {
  const list = steps ?? stepsFor(min, max);
  const span = max - min;
  const cur = useRef(value);
  const [draft, setDraft] = useState<string | null>(null);
  const hold = useRef<{ timer: ReturnType<typeof setTimeout> | null; start: number }>({ timer: null, start: 0 });
  const streak = useRef({ n: 0, at: 0 });

  // O valor "vivo" fica em ref: o intervalo do segurar dispara vários ticks
  // antes de o pai re-renderizar, e cada um precisa partir do último resultado.
  useEffect(() => { cur.current = value; }, [value]);

  const apply = useCallback((delta: number) => {
    const next = Math.max(min, Math.min(max, cur.current + delta));
    if (next === cur.current) return false;
    cur.current = next;
    onChange(next);
    return true;
  }, [min, max, onChange]);

  const stop = useCallback(() => {
    if (hold.current.timer) clearTimeout(hold.current.timer);
    hold.current.timer = null;
  }, []);

  useEffect(() => stop, [stop]);

  function multiplier(step: number, heldMs: number, fast: boolean) {
    let m = 1;
    if (heldMs > BOOST_AFTER) m = 5;
    if (heldMs > BOOST_AFTER * 2) m = 10;
    if (fast) m = Math.max(m, 5);
    return Math.max(1, Math.min(m, Math.floor(span / 10 / step)));
  }

  function press(e: ReactPointerEvent<HTMLButtonElement>, signed: number) {
    if (disabled || (e.pointerType === "mouse" && e.button !== 0)) return;
    // Captura: o pointerup chega ao botão mesmo se o dedo escorregar para fora.
    e.currentTarget.setPointerCapture?.(e.pointerId);
    stop();

    const step = Math.abs(signed);
    const dir = signed < 0 ? -1 : 1;
    const now = e.timeStamp;
    streak.current = { n: now - streak.current.at < STREAK_GAP ? streak.current.n + 1 : 0, at: now };
    apply(dir * step * multiplier(step, 0, streak.current.n >= 4));

    hold.current.start = now;
    let delay = FIRST_DELAY;
    const tick = () => {
      const held = performance.now() - hold.current.start;
      if (!apply(dir * step * multiplier(step, held, false))) { stop(); return; }
      delay = Math.max(MIN_DELAY, delay * 0.78);
      hold.current.timer = setTimeout(tick, delay);
    };
    hold.current.timer = setTimeout(tick, delay);
  }

  function release() {
    stop();
    streak.current.at = performance.now();
  }

  function commitDraft() {
    if (draft === null) return;
    const n = parseInt(draft.replace(/[^\d-]/g, ""), 10);
    setDraft(null);
    if (Number.isFinite(n)) apply(Math.max(min, Math.min(max, n)) - cur.current);
  }

  const btn = (signed: number) => {
    const word = signed < 0 ? "menos" : "mais";
    const atLimit = signed < 0 ? value <= min : value >= max;
    return (
      <button
        key={signed}
        type="button"
        disabled={disabled || atLimit}
        aria-label={`${label} ${word} ${Math.abs(signed)}`}
        onPointerDown={(e) => press(e, signed)}
        onPointerUp={release}
        onPointerCancel={release}
        // Teclado (Enter/Espaço) gera click com detail 0; o mouse e o toque já
        // agiram no pointerdown e não podem contar duas vezes.
        onClick={(e) => { if (e.detail === 0) apply(signed); }}
        onContextMenu={(e) => e.preventDefault()}
        style={{ ...btnStyle, ...(Math.abs(signed) === 1 ? null : bigBtnStyle), opacity: disabled || atLimit ? 0.4 : 1 }}
      >
        {signed < 0 ? "−" : "+"}{Math.abs(signed)}
      </button>
    );
  };

  const down = [...list].sort((a, b) => b - a).map((s) => btn(-s));
  const up = [...list].sort((a, b) => a - b).map((s) => btn(s));

  const input = (
    <input
      type="text" inputMode="numeric" aria-label={label} disabled={disabled}
      value={draft ?? String(value)}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commitDraft}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setDraft(null); }}
      style={inputStyle}
    />
  );

  // Muitos botões não cabem numa linha em 320 px: o valor sobe e os botões
  // ficam numa fileira só, menores à esquerda do zero e maiores à direita.
  if (list.length > 2) {
    return (
      <div role="group" aria-label={label} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "stretch", minWidth: 0 }}>
        {input}
        <div style={{ display: "flex", gap: 4, justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4 }}>{down}</div>
          <div style={{ display: "flex", gap: 4 }}>{up}</div>
        </div>
      </div>
    );
  }

  return (
    <div role="group" aria-label={label} style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "space-between", minWidth: 0 }}>
      <div style={{ display: "flex", gap: 4 }}>{down}</div>
      <div style={{ flex: 1, minWidth: 44, maxWidth: 96 }}>{input}</div>
      <div style={{ display: "flex", gap: 4 }}>{up}</div>
    </div>
  );
}

const btnStyle: CSSProperties = {
  minWidth: 36, height: 36, padding: "0 6px", borderRadius: "var(--radius-full)",
  background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--text)", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  fontFamily: "inherit",
  // Segurar o botão no celular não pode selecionar texto, abrir o menu de
  // contexto nem iniciar rolagem (o pointercancel mataria o repetir).
  userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none", touchAction: "none",
};

const bigBtnStyle: CSSProperties = { minWidth: 40, fontSize: "0.72rem", borderRadius: "var(--radius)" };

const inputStyle: CSSProperties = {
  width: "100%", height: 36, boxSizing: "border-box", textAlign: "center",
  background: "var(--surface)", border: "1px solid var(--border-accent, var(--border))",
  borderRadius: "var(--radius)", color: "var(--accent-light, var(--text))",
  fontFamily: "var(--font-cinzel), serif", fontSize: "1.05rem", fontWeight: 800,
};
