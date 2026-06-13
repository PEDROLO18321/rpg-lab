"use client";

import { useSyncExternalStore } from "react";

/**
 * Tier de capacidade do dispositivo para efeitos 3D/animações pesadas.
 *
 *  - "off"  → sem WebGL, prefers-reduced-motion ou dispositivo muito fraco.
 *             Componentes 3D não devem montar (fallback CSS estático).
 *  - "low"  → dispositivo modesto (mobile / pouca RAM / poucos cores).
 *             3D permitido com contagem reduzida de partículas e dpr 1.
 *  - "high" → desktop capaz. Efeitos completos.
 *
 * Retorna `null` durante SSR/hidratação (nada 3D deve montar ainda).
 */
export type PerfTier = "off" | "low" | "high";

declare global {
  interface Navigator {
    deviceMemory?: number;
  }
}

function detectTier(): PerfTier {
  // Acessibilidade: usuário pediu menos movimento → desliga tudo.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";

  // Sem WebGL → sem 3D.
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return "off";
  } catch {
    return "off";
  }

  const memory = navigator.deviceMemory ?? 8; // GB (Chrome/Edge; outros assumem 8)
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches; // touch ≈ mobile

  if (memory <= 2 || cores <= 2) return "off";
  if (memory <= 4 || cores <= 4 || coarse) return "low";
  return "high";
}

// Cache para getSnapshot estável (detecção cria canvas — cara demais por render).
let cachedTier: PerfTier | null = null;

function subscribeTier(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => {
    cachedTier = null; // re-detecta se o usuário mudou a preferência
    callback();
  };
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getTierSnapshot(): PerfTier {
  if (cachedTier === null) cachedTier = detectTier();
  return cachedTier;
}

function getTierServerSnapshot(): PerfTier | null {
  return null;
}

export function usePerformanceTier(): PerfTier | null {
  return useSyncExternalStore(subscribeTier, getTierSnapshot, getTierServerSnapshot);
}

// ── Reduced motion isolado (micro-interações CSS/JS sem 3D) ───────────────────

function subscribeReduced(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, getReducedSnapshot, getReducedServerSnapshot);
}
