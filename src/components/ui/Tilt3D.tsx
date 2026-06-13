"use client";

import { useRef } from "react";
import { useReducedMotion } from "@/components/three/usePerformanceTier";

/**
 * Micro-interação de tilt 3D (CSS perspective) para cards de escolha.
 * Segue o mouse; ignora touch (pointer coarse) e prefers-reduced-motion.
 * Envolva o card — o filho recebe rotateX/rotateY suavizado via
 * `.tilt-wrap > *` (transition em globals.css).
 */
export function Tilt3D({
  children,
  max = 8,
  style,
}: {
  children: React.ReactNode;
  max?: number; // graus máximos de inclinação
  style?: React.CSSProperties;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType !== "mouse") return;
    const el = inner.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${(px * max).toFixed(2)}deg) rotateX(${(-py * max).toFixed(2)}deg)`;
  }

  function onLeave() {
    const el = inner.current;
    if (el) el.style.transform = "";
  }

  return (
    <div className="tilt-wrap" style={style} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={inner} style={{ height: "100%" }}>
        {children}
      </div>
    </div>
  );
}
