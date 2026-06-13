"use client";

import dynamic from "next/dynamic";
import { usePerformanceTier } from "./usePerformanceTier";

// three.js só entra quando o tier permite (lazy + ssr off).
const RaceBlob = dynamic(() => import("./RaceMorphScene"), { ssr: false, loading: () => null });

// Pré-carrega o chunk imediatamente quando este módulo é importado pelo wizard.
if (typeof window !== "undefined") {
  import("./RaceMorphScene");
}

/**
 * Blob 3D do card de raça (mutação contínua; selecionado brilha mais).
 * Um canvas pequeno por card — só em tier "high" (desktop capaz); em
 * low/off/SSR renderiza o `fallback` (imagem 2D) para não pesar em mobile.
 */
export function RaceMorphSlot({
  raceId,
  size,
  selected,
  hovered,
  fallback,
}: {
  raceId: string;
  size: number;
  selected: boolean;
  hovered: boolean;
  fallback: React.ReactNode;
}) {
  const tier = usePerformanceTier();
  if (tier !== "high") return <>{fallback}</>;
  // seed estável por raça → cards não pulsam em sincronia
  let seed = 0;
  for (const ch of raceId) seed += ch.charCodeAt(0);
  // detail 3 → esfera lê redonda quando o blob "assenta" ao selecionar
  return <RaceBlob size={size} detail={3} selected={selected} hovered={hovered} seed={seed % 17} />;
}
