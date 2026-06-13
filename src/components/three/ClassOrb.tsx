"use client";

import dynamic from "next/dynamic";
import { usePerformanceTier } from "./usePerformanceTier";

// Pré-carrega o chunk imediatamente quando este módulo é importado.
if (typeof window !== "undefined") {
  import("./ClassOrbViews");
}

// three.js só entra quando o tier permite (lazy + ssr off).
// ClassOrbView e ClassOrbsStage vêm do MESMO módulo — compartilham o store
// de rastreamento do drei <View> e o canvas único.
const ClassOrbView = dynamic(
  () => import("./ClassOrbViews").then((m) => m.ClassOrbView),
  { ssr: false, loading: () => null }
);
const Stage = dynamic(
  () => import("./ClassOrbViews").then((m) => m.ClassOrbsStage),
  { ssr: false, loading: () => null }
);

/**
 * Orbe 3D do card de classe: esfera facetada (a mesma que finaliza o passo
 * de raça) em idle → vira o dado de vida ao selecionar. Todos os cards
 * desenham num canvas WebGL único (ver ClassOrbsStage), então não há risco
 * de esgotar contextos.
 */
export function ClassOrb({
  classId,
  sides,
  size,
  selected,
  hovered,
  fallback,
}: {
  classId: string;
  sides: number;
  size: number;
  selected: boolean;
  hovered: boolean;
  fallback: React.ReactNode;
}) {
  const tier = usePerformanceTier();
  if (tier !== "high") return <>{fallback}</>;

  let seed = 0;
  for (const ch of classId) seed += ch.charCodeAt(0);
  return (
    <ClassOrbView
      sides={sides}
      size={size}
      selected={selected}
      hovered={hovered}
      seed={seed % 17}
    />
  );
}

/**
 * Canvas compartilhado dos orbes de classe. Monte UMA vez na página que
 * usa ClassOrb (a grade do StepClass). Sem tier alto, não monta nada —
 * os cards mostram o fallback 2D.
 */
export function ClassOrbsStage() {
  const tier = usePerformanceTier();
  if (tier !== "high") return null;
  return <Stage />;
}
