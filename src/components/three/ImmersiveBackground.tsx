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
  if (pathname.startsWith("/dashboard/ordem"))    return "ordem";
  if (pathname.startsWith("/dashboard/starwars")) return "starwars";
  return null;
}

const FADE_MS = 280;

export function ImmersiveBackground() {
  const tier     = usePerformanceTier();
  const pathname = usePathname();

  const targetSystem = detectSystem(pathname);
  const [system, setSystem] = useState<ParticleSystem>(targetSystem);
  // Sistema aguardando a troca. Enquanto houver um pendente, o fundo está em
  // fade-out; a troca de cores acontece no fim da transição.
  const [pending, setPending] = useState<ParticleSystem | null>(null);

  if (targetSystem !== system && pending !== targetSystem) {
    setPending(targetSystem);
  }

  const opacity = pending ? 0 : 1;

  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => {
      setSystem(pending);
      setPending(null);
    }, FADE_MS);
    return () => clearTimeout(t);
  }, [pending]);

  if (tier === null || tier === "off") return null;

  return (
    <div className="no-print" style={{ opacity, transition: `opacity ${FADE_MS}ms ease-out` }}>
      <AmbientBackground tier={tier} system={system} />
    </div>
  );
}
