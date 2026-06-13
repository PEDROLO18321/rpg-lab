"use client";

import dynamic from "next/dynamic";
import { usePerformanceTier } from "./usePerformanceTier";

const Dice3D = dynamic(() => import("./Dice3D"), { ssr: false });

/**
 * Dado de vida em 3D (idle spin) para opções de escolha do wizard.
 * Em tier "off" renderiza o `fallback` (badge 2D existente).
 */
export function HitDie3D({
  sides,
  size,
  fallback,
}: {
  sides: number;
  size: number;
  fallback: React.ReactNode;
}) {
  const tier = usePerformanceTier();
  if (tier === null || tier === "off") return <>{fallback}</>;
  return <Dice3D sides={sides} size={size} />;
}
