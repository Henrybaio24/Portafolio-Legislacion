// main.js - Punto de entrada de la aplicación

import { loadPage } from './modules/page-loader.js';
import { printAll } from './modules/printer.js';
import { initLightbox } from './modules/lightbox.js';
import { initNotebook } from './modules/notebook.js';

// Hacer printAll disponible globalmente para el botón
window.printAll = printAll;

// El modo cuaderno no depende de que las páginas ya hayan cargado
initNotebook();

// Cargar todas las páginas
const pages = [
  { url: 'views/portada.html', container: 'page-1' },
  { url: 'views/indice.html', container: 'page-2' },
  { url: 'views/datos_informativos.html', container: 'page-3' },
  { url: 'views/documentos.html', container: 'page-4' },
  { url: 'views/apuntes_diarios.html', container: 'page-5' },
  { url: 'views/apunte1.html', container: 'page-6' },
  { url: 'views/apunte2.html', container: 'page-7' },
  { url: 'views/apunte3.html', container: 'page-8' },
  { url: 'views/trabajos_individuales.html', container: 'page-9' },
  { url: 'views/trabajo1.html', container: 'page-10' },
  { url: 'views/trabajo2.html', container: 'page-11' },
  { url: 'views/trabajo3.html', container: 'page-12' },
  { url: 'views/trabajo4.html', container: 'page-13' },
  { url: 'views/evaluaciones.html', container: 'page-14' },
  { url: 'views/anexos.html', container: 'page-15' },
];

// Cargar todas las páginas y luego inicializar lightbox
Promise.all(
  pages.map(p => loadPage(p.url, p.container))
).then(() => {
  // Inicializar lightbox después de que todo cargue
  initLightbox();
});