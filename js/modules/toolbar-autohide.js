export function initToolbarAutoHide() {
  const toolbar = document.getElementById('toolbar');
  if (!toolbar) return;

  let scrollTimeout = null;
  const HIDE_DELAY_AFTER_STOP = 400;

  window.addEventListener('scroll', () => {
    toolbar.classList.add('toolbar-hidden');

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      toolbar.classList.remove('toolbar-hidden');
    }, HIDE_DELAY_AFTER_STOP);
  }, { passive: true });
}
