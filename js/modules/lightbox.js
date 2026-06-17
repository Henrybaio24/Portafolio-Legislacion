// lightbox.js - Visor de imágenes con zoom

function initLightbox() {
  
  // Función para crear el overlay del lightbox
  function abrirLightbox(src) {
    // Cerrar lightbox existente si hay
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
    
    // Cerrar al hacer clic
    overlay.addEventListener('click', function() { 
      overlay.remove(); 
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', function cerrar(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', cerrar);
      }
    });
  }

  // Función para agregar botón de zoom a una imagen
  function agregarZoom(figure) {
    // Evitar duplicar botones
    if (figure.querySelector('.lightbox-zoom-btn')) return;
    
    const img = figure.querySelector('.magazine-img, .doc-img, img');
    if (!img) return;
    
    figure.style.position = 'relative';
    
    const btn = document.createElement('button');
    btn.innerHTML = '🔍';
    btn.className = 'lightbox-zoom-btn';
    btn.title = 'Ampliar imagen';
    btn.setAttribute('aria-label', 'Ampliar imagen');
    
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      abrirLightbox(img.src);
    });
    
    figure.appendChild(btn);
  }

  // Agregar zoom a imágenes existentes
  document.querySelectorAll('.magazine-figure, .doc-card-area').forEach(agregarZoom);

  // Observar nuevas imágenes que se cargan dinámicamente
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Elemento HTML
          // Buscar imágenes dentro del nodo agregado
          const figures = node.querySelectorAll?.('.magazine-figure, .doc-card-area');
          figures?.forEach(agregarZoom);
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