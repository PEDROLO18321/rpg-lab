"use client";

// Fechar com Esc é o caminho de teclado equivalente ao clique no fundo do modal.
// Sem ele, quem não usa mouse fica preso no diálogo (WCAG 2.1.2, sem armadilha
// de teclado). O listener só existe enquanto o diálogo está aberto.
import { useEffect, useRef } from "react";

export function useEscapeKey(active: boolean, onEscape: () => void) {
  // A callback costuma ser recriada a cada render; guardá-la numa ref evita
  // desinscrever e reinscrever o listener sem necessidade.
  const handler = useRef(onEscape);
  useEffect(() => { handler.current = onEscape; });

  useEffect(() => {
    if (!active) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handler.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);
}
