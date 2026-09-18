"use client";

// Alguns elementos clicáveis não podem virar <button>: cabeçalhos de painel que
// já contêm botões dentro (botão dentro de botão é markup inválido). Nesses
// casos o caminho correto é `role="button"` + `tabIndex={0}` + este handler, que
// dá ao teclado o mesmo que o mouse já tinha (WCAG 2.1.1).
import type { KeyboardEvent } from "react";

/** Enter e Espaço acionam o elemento, como num botão nativo. */
export function activateOnKey(action: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault(); // Espaço rolaria a página
    action();
  };
}
