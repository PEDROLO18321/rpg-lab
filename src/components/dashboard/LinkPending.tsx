"use client";

// ─── Sinal de navegação em curso ─────────────────────────────────────────────
// Antes daqui existiu um esqueleto de tela cheia (`dashboard/loading.tsx`). Ele
// dava feedback, mas trocava a tela inteira por uma imitação que não batia com a
// real — e o salto de volta era pior que a espera.
//
// Este é o oposto: fica no próprio cartão clicado, não desloca nada, e **só
// aparece se a navegação demorar**. Com o prefetch que o <Link> traz, o caso
// comum é a rota já estar pronta e o indicador nunca chegar a existir.
//
// O truque contra a piscada está no CSS: o elemento existe sempre, invisível, e
// a animação que o revela tem 120ms de atraso. Navegação rápida termina antes
// disso e não mostra nada. É o padrão da documentação do Next 16
// (use-link-status.md, "Preventing flicker with a delay").

import { useLinkStatus } from "next/link";

export function LinkPending() {
  const { pending } = useLinkStatus();

  return (
    <span
      className={pending ? "link-pending is-pending" : "link-pending"}
      aria-hidden="true"
    />
  );
}
