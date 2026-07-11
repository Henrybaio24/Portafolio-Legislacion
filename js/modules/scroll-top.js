export function initScrollTop() {
  const btnTop = document.getElementById('btnTop');
  const carouselOverlayEl = document.getElementById('carouselOverlay');

  if (!btnTop) return;

  function updateVisibility() {
    const overlayActive =
      document.body.classList.contains('notebook-mode') ||
      carouselOverlayEl?.classList.contains('active');
    btnTop.classList.toggle('visible', !overlayActive && window.scrollY > 400);
  }

  window.addEventListener('scroll', updateVisibility);
  
  new MutationObserver(updateVisibility).observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });

  if (carouselOverlayEl) {
    new MutationObserver(updateVisibility).observe(carouselOverlayEl, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }
  btnTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

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
