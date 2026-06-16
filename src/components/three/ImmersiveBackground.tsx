"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { usePerformanceTier } from "./usePerformanceTier";
import type { ParticleSystem } from "./AmbientBackground";

const AmbientBackground = dynamic(() => import("./AmbientBackground"), {
  ssr: false,
});

function detectSystem(pathname: string): ParticleSystem {
  if (pathname.startsWith("/dashboard/dnd"))      return "dnd";
  if (pathname.startsWith("/dashboard/tormenta")) return "tormenta";
  if (pathname.startsWith("/dashboard/cthulhu"))  return "cthulhu";
  return null;
}

const FADE_MS = 280;

export function ImmersiveBackground() {
  const tier     = usePerformanceTier();
  const pathname = usePathname();

  const targetSystem = detectSystem(pathname);
  const [system,  setSystem]  = useState<ParticleSystem>(targetSystem);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (targetSystem === system) return;
    // fade out → troca cores → fade in
    setOpacity(0);
    const t = setTimeout(() => {
      setSystem(targetSystem);
      setOpacity(1);
    }, FADE_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSystem]);

  if (tier === null || tier === "off") return null;

  return (
    <div style={{ opacity, transition: `opacity ${FADE_MS}ms ease-out` }}>
      <AmbientBackground tier={tier} system={system} />
    </div>
  );
}
