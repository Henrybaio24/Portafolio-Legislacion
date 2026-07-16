// page-loader.js - Carga las vistas dinámicamente

import { makeIframeLazy } from './lazy-drive.js';

async function loadPage(url, containerId) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const pageLinks = doc.querySelectorAll('link[rel="stylesheet"]');
    pageLinks.forEach(link => {
      let href = link.getAttribute('href');
      href = href.replace(/^(\.\.\/)+/, '');
      if (!document.querySelector(`link[href="${href}"]`)) {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = href;
        document.head.appendChild(newLink);
      }
    });

    const a4 = doc.querySelector('.a4');
    if (a4) {
      a4.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('../')) {
          img.setAttribute('src', src.replace(/^(\.\.\/)+/, ''));
        }
      });

      a4.querySelectorAll('iframe[src*="drive.google.com"]').forEach(makeIframeLazy);

      document.getElementById(containerId).innerHTML = a4.outerHTML;
    }
  } catch (err) {
    console.error('Error cargando', url, err);
  }
}

export { loadPage };