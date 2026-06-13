"use client";

import dynamic from "next/dynamic";
import { usePerformanceTier } from "./usePerformanceTier";

// Pré-carrega o chunk imediatamente quando este módulo é importado.
if (typeof window !== "undefined") {
  import("./BackgroundIconViews");
}

// three.js só entra quando o tier permite (lazy + ssr off).
// IconView e IconsStage vêm do MESMO módulo — compartilham o store de
// rastreamento do drei <View> e o canvas único.
const IconView = dynamic(
  () => import("./BackgroundIconViews").then((m) => m.IconView),
  { ssr: false, loading: () => null }
);
const IconsStage = dynamic(
  () => import("./BackgroundIconViews").then((m) => m.IconsStage),
  { ssr: false, loading: () => null }
);

/**
 * Ícone 3D simbólico do card de antecedente (coroa, adaga, livro…).
 * Sempre visível — selecionado ou não, o ícone é o mesmo. Todos os cards
 * desenham num canvas WebGL único (ver BackgroundIconsStage), então não há
 * risco de esgotar contextos.
 */
export function BackgroundIcon3D({
  backgroundId,
  size,
  hovered,
  fallback,
}: {
  backgroundId: string;
  size: number;
  hovered: boolean;
  fallback: React.ReactNode;
}) {
  const tier = usePerformanceTier();
  if (tier !== "high") return <>{fallback}</>;

  let seed = 0;
  for (const ch of backgroundId) seed += ch.charCodeAt(0);
  return <IconView id={backgroundId} size={size} hovered={hovered} seed={seed % 17} />;
}

/**
 * Canvas compartilhado dos ícones de antecedente. Monte UMA vez na página
 * que usa BackgroundIcon3D (a grade do StepBackground). Sem tier alto,
 * não monta nada — os cards mostram o fallback 2D.
 */
export function BackgroundIconsStage() {
  const tier = usePerformanceTier();
  if (tier !== "high") return null;
  return <IconsStage />;
}
