// lightbox.js - Visor de imágenes con zoom

function initLightbox() {

  function abrirLightbox(src) {
    const existente = document.getElementById('lightbox-active');
    if (existente) existente.remove();

    const overlay = document.createElement('div');
    overlay.id = 'lightbox-active';
    overlay.className = 'lightbox-overlay';

    const img = document.createElement('img');
    img.src = src;
    img.className = 'lightbox-image';

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function() {
      overlay.remove();
    });

    document.addEventListener('keydown', function cerrar(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', cerrar);
      }
    });
  }

  function agregarZoom(container) {
    if (container.querySelector('.lightbox-zoom-btn')) return;

    const img = container.querySelector('.magazine-img, .doc-img, img');
    if (!img) return;

    container.style.position = 'relative';

    const btn = document.createElement('button');
    btn.innerHTML = '🔍';
    btn.className = 'lightbox-zoom-btn';
    btn.title = 'Ampliar imagen';
    btn.setAttribute('aria-label', 'Ampliar imagen');

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      abrirLightbox(img.src);
    });

    container.appendChild(btn);
  }

  const ZOOM_SELECTOR = '.magazine-figure, .magazine-figure-span, .doc-card-area, figure';

  document.querySelectorAll(ZOOM_SELECTOR).forEach(agregarZoom);

  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) {
          if (node.matches?.(ZOOM_SELECTOR)) {
            agregarZoom(node);
          }
          const containers = node.querySelectorAll?.(ZOOM_SELECTOR);
          containers?.forEach(agregarZoom);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

export { initLightbox };
