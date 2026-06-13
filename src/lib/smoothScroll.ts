/**
 * Scroll suave com easing controlado — substitui scrollIntoView("smooth")
 * que usa velocidade do browser sem controle de duração.
 *
 * topOffset: espaço reservado para headers fixos (header 56px + tabs ~48px + folga).
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothScrollTo(
  el: HTMLElement,
  { duration = 900, topOffset = 120 }: { duration?: number; topOffset?: number } = {}
) {
  const start = window.scrollY;
  const target = start + el.getBoundingClientRect().top - topOffset;
  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, start + (target - start) * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
