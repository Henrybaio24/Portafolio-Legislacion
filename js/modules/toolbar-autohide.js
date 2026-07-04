/**
 * Oculta el toolbar mientras se hace scroll,
 * y lo muestra de nuevo cuando el scroll se detiene.
 */
export function initToolbarAutoHide() {
  const toolbar = document.getElementById('toolbar');
  if (!toolbar) return;

  let scrollTimeout = null;
  const HIDE_DELAY_AFTER_STOP = 400; // ms sin scroll para volver a mostrarlo

  window.addEventListener('scroll', () => {
    toolbar.classList.add('toolbar-hidden');

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      toolbar.classList.remove('toolbar-hidden');
    }, HIDE_DELAY_AFTER_STOP);
  }, { passive: true });
}