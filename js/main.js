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
  { url: 'views/apuntes/apunte4.html', label: 'Sección 2.4' },
  { url: 'views/apuntes/apunte5.html', label: 'Sección 2.5' },
  { url: 'views/apuntes/apunte6.html', label: 'Sección 2.6' },
  { url: 'views/apuntes/apunte7.html', label: 'Sección 2.7' },
  { url: 'views/apuntes/apunte8.html', label: 'Sección 2.8' },
  { url: 'views/apuntes/apunte9.html', label: 'Sección 2.9' },
  { url: 'views/apuntes/apunte10.html', label: 'Sección 2.10' },
  { url: 'views/apuntes/apunte11.html', label: 'Sección 2.11' },
  { url: 'views/apuntes/apunte12.html', label: 'Sección 2.12' },
  { url: 'views/apuntes/apunte13.html', label: 'Sección 2.13' },
  { url: 'views/apuntes/apunte14.html', label: 'Sección 2.14' },
  { url: 'views/portadas/trabajos_individuales.html', label: 'Sección 3' },
  { url: 'views/trabajos/trabajo1.html', label: 'Sección 3.1' },
  { url: 'views/trabajos/trabajo2.html', label: 'Sección 3.2' },
  { url: 'views/trabajos/trabajo3.html', label: 'Sección 3.3' },
  { url: 'views/trabajos/trabajo4.html', label: 'Sección 3.4' },
  { url: 'views/trabajos/trabajo5.html', label: 'Sección 3.5' },
  { url: 'views/portadas/evaluaciones.html', label: 'Sección 4' },
  { url: 'views/otros/prueba1.html', label: 'Sección 4.1' },
  { url: 'views/portadas/anexos.html', label: 'Sección 5' },
  { url: 'views/anexos/silabo.html', label: 'Sección 5.1' },
  { url: 'views/anexos/filosofia.html', label: 'Sección 5.2' },
  //{ url: 'views/anexos/filosofia_fac.html', label: 'Sección 5.3' },
  //{ url: 'views/anexos/filosofia_carr.html', label: 'Sección 5.4' },
  { url: 'views/anexos/filosofia_carr1.html', label: 'Sección 5.4.1' },
  { url: 'views/anexos/filosofia_carr2.html', label: 'Sección 5.4.2' },
  { url: 'views/anexos/filosofia_carr3.html', label: 'Sección 5.4.3' },
  { url: 'views/portadas/referencias.html', label: 'Sección 6' },
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

// Carga todas las páginas y luego inicializa numeración, índice y lightbox
Promise.all(
  pagesWithContainer.map(p => loadPage(p.url, p.container))
).then(() => {
  let pageCounter = 0;    // Cuenta TODAS las páginas en orden (portadas incluidas)
  let sectionCounter = 0; // Cuenta solo las portadas de sección
  const tocEntries = [];  // Aquí guardamos los datos para el índice

  pagesWithContainer.forEach((p) => {
    const container = document.getElementById(p.container);
    if (!container) return;

    pageCounter++;
    const formattedPage = String(pageCounter).padStart(2, '0');

    // --- Caso 1: páginas de contenido (apuntes, trabajos, anexos, documentos) ---
    const footerPage = container.querySelector('.footer-page');
    if (footerPage) {
      footerPage.textContent = formattedPage;
    }

    // --- Caso 2: portadas de sección ---
    const sectionNumBg = container.querySelector('.section-num-bg');
    const sectionFooterNum = container.querySelector('.section-footer-num');

    if (sectionNumBg || sectionFooterNum) {
      sectionCounter++;
      const formattedSection = String(sectionCounter).padStart(2, '0');

      if (sectionNumBg) sectionNumBg.textContent = formattedSection;
      if (sectionFooterNum) sectionFooterNum.textContent = formattedPage;

      // Extrae el título real de la portada (sin tocar nada a mano)
      const titleEl = container.querySelector('.section-title-main');
      const topic = titleEl
        ? titleEl.textContent.replace(/\s+/g, ' ').trim()
        : p.label;

      tocEntries.push({
        num: formattedSection,
        topic,
        page: formattedPage,
        targetId: p.container,
      });
    }
  });

  // --- Construye el índice dinámicamente con datos reales ---
  const indexList = document.querySelector('.index-list');
  if (indexList) {
    indexList.innerHTML = tocEntries
      .map(
        (entry) => `
        <li class="index-item" data-target="${entry.targetId}">
          <span class="index-num">${entry.num}</span>
          <span class="index-dots"></span>
          <span class="index-topic">${entry.topic}</span>
          <span class="index-dots"></span>
          <span class="index-page">${entry.page}</span>
        </li>
      `
      )
      .join('');

    // Click en cualquier entrada del índice -> navega a esa sección
    indexList.querySelectorAll('.index-item').forEach((item) => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const target = document.getElementById(item.dataset.target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  initLightbox();
});