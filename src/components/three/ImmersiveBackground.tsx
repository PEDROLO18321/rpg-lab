"use client";

import dynamic from "next/dynamic";
import { usePerformanceTier } from "./usePerformanceTier";

// three.js só entra no bundle quando o dispositivo aguenta (ssr off + lazy).
const AmbientBackground = dynamic(() => import("./AmbientBackground"), {
  ssr: false,
});

/**
 * Fundo imersivo global. Monta o cenário 3D apenas em dispositivos capazes;
 * em tier "off" (reduced-motion, sem WebGL, hardware fraco) não renderiza
 * nada — os orbs/gradientes CSS existentes permanecem como fallback.
 */
export function ImmersiveBackground() {
  const tier = usePerformanceTier();
  if (tier === null || tier === "off") return null;
  return <AmbientBackground tier={tier} />;
}
