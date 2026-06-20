// main.js - Punto de entrada de la aplicación
import { loadPage } from './modules/page-loader.js';
import { printAll } from './modules/printer.js';
import { initLightbox } from './modules/lightbox.js';
import { initNotebook } from './modules/notebook.js';

window.printAll = printAll;
initNotebook();

// ⚠️ ÚNICO lugar que tienes que tocar al agregar una página nueva:
// solo agrega un objeto con url y label. El número de página y el
// id del contenedor se generan automáticamente según la posición.
const pages = [
  { url: 'views/portada.html', label: 'Portada' },
  { url: 'views/indice.html', label: 'Índice' },
  { url: 'views/datos_informativos.html', label: 'Sección 1' },
  { url: 'views/documentos.html', label: 'Documentos' },
  { url: 'views/apuntes_diarios.html', label: 'Sección 2' },
  { url: 'views/apunte1.html', label: 'Sección 2.1' },
  { url: 'views/apunte2.html', label: 'Sección 2.2' },
  { url: 'views/apunte3.html', label: 'Sección 2.3' },
  { url: 'views/trabajos_individuales.html', label: 'Sección 3' },
  { url: 'views/trabajo1.html', label: 'Sección 3.1' },
  { url: 'views/trabajo2.html', label: 'Sección 3.2' },
  { url: 'views/trabajo3.html', label: 'Sección 3.3' },
  { url: 'views/trabajo4.html', label: 'Sección 3.4' },
  { url: 'views/trabajo5.html', label: 'Sección 3.5' },
  { url: 'views/evaluaciones.html', label: 'Sección 4' },
  { url: 'views/anexos.html', label: 'Sección 5' },
  { url: 'views/silabo.html', label: 'Sección 5.1' },
  { url: 'views/filosofia.html', label: 'Sección 5.2' },
  { url: 'views/filosofia_fac.html', label: 'Sección 5.3' },
];

// Genera el id de contenedor automáticamente (page-1, page-2, ...)
const pagesWithContainer = pages.map((p, i) => ({
  ...p,
  container: `page-${i + 1}`,
}));

// Construye el HTML del wrapper (las etiquetas + los divs vacíos)
function renderPageSlots() {
  const wrapper = document.getElementById('pageWrapper');
  wrapper.innerHTML = pagesWithContainer
    .map((p, i) => `
      <span class="page-label">Página ${i + 1} — ${p.label}</span>
      <div id="${p.container}"></div>
    `)
    .join('');
}

renderPageSlots();

// Carga todas las páginas y luego inicializa el lightbox
Promise.all(
  pagesWithContainer.map(p => loadPage(p.url, p.container))
).then(() => {
  initLightbox();
});