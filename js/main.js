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
  { url: 'views/portadas/portada.html', label: 'Portada' },
  { url: 'views/otros/indice.html', label: 'Índice' },
  { url: 'views/portadas/datos_informativos.html', label: 'Sección 1' },
  { url: 'views/otros/documentos.html', label: 'Documentos' },
  { url: 'views/portadas/apuntes_diarios.html', label: 'Sección 2' },
  { url: 'views/apuntes/apunte1.html', label: 'Sección 2.1' },
  { url: 'views/apuntes/apunte2.html', label: 'Sección 2.2' },
  { url: 'views/apuntes/apunte3.html', label: 'Sección 2.3' },
  { url: 'views/portadas/trabajos_individuales.html', label: 'Sección 3' },
  { url: 'views/trabajos/trabajo1.html', label: 'Sección 3.1' },
  { url: 'views/trabajos/trabajo2.html', label: 'Sección 3.2' },
  { url: 'views/trabajos/trabajo3.html', label: 'Sección 3.3' },
  { url: 'views/trabajos/trabajo4.html', label: 'Sección 3.4' },
  { url: 'views/trabajos/trabajo5.html', label: 'Sección 3.5' },
  { url: 'views/portadas/evaluaciones.html', label: 'Sección 4' },
  { url: 'views/portadas/anexos.html', label: 'Sección 5' },
  { url: 'views/anexos/silabo.html', label: 'Sección 5.1' },
  { url: 'views/anexos/filosofia.html', label: 'Sección 5.2' },
  { url: 'views/anexos/filosofia_fac.html', label: 'Sección 5.3' },
  { url: 'views/anexos/filosofia_carr.html', label: 'Sección 5.4' },
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