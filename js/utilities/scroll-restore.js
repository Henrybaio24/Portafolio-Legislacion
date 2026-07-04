/**
 * Guarda y restaura la posición de scroll.
 * - Al recargar la página (F5 o recarga forzada): siempre va al inicio.
 * - Al navegar con los botones atrás/adelante del navegador: restaura el scroll.
 */
export function initScrollRestore() {
  const navEntry = performance.getEntriesByType('navigation')[0];
  const navType = navEntry?.type; // 'navigate' | 'reload' | 'back_forward' | 'prerender'

  if (navType === 'back_forward') {
    const savedScroll = localStorage.getItem('scrollPos');
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10));
    }
  } else {
    // Recarga (F5, forzada) o entrada nueva: siempre al inicio
    window.scrollTo(0, 0);
    localStorage.removeItem('scrollPos');
  }

  window.addEventListener('scroll', () => {
    localStorage.setItem('scrollPos', window.scrollY);
  }, { passive: true });
}