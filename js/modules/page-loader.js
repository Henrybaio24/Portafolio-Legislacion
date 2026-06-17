// page-loader.js - Carga las vistas dinámicamente

async function loadPage(url, containerId) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Inyectar los <link> de CSS de esta página al head del index
    const pageLinks = doc.querySelectorAll('link[rel="stylesheet"]');
    pageLinks.forEach(link => {
      let href = link.getAttribute('href');
      // Convertir ../css/ → css/
      href = href.replace(/^\.\.\//, '');
      // Solo agregar si no existe ya
      if (!document.querySelector(`link[href="${href}"]`)) {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = href;
        document.head.appendChild(newLink);
      }
    });

    const a4 = doc.querySelector('.a4');
    if (a4) {
      document.getElementById(containerId).innerHTML = a4.outerHTML;
    }
  } catch (err) {
    console.error('Error cargando', url, err);
  }
}

// Exportar para usar en otros archivos
export { loadPage };