import { pagesWithContainer } from './page-data.js';

/**
 * Renderiza los slots de página en el wrapper
 */
export function renderPageSlots() {
  const wrapper = document.getElementById('pageWrapper');
  if (!wrapper) return;

  wrapper.innerHTML = pagesWithContainer
    .map((p, i) => `
      <span class="page-label">Página ${i + 1} — ${p.label}</span>
      <div id="${p.container}"></div>
    `)
    .join('');
}

/**
 * Genera las entradas del índice/TOC con numeración automática
 * @returns {Array} Array de objetos con num, topic, page, targetId
 */
export function generateTocEntries() {
  let pageCounter = 0;
  let sectionCounter = 0;
  const tocEntries = [];

  pagesWithContainer.forEach((p) => {
    const container = document.getElementById(p.container);
    if (!container) return;

    pageCounter++;
    const formattedPage = String(pageCounter).padStart(2, '0');

    // Número de página en el footer
    const footerPage = container.querySelector('.footer-page');
    if (footerPage) footerPage.textContent = formattedPage;

    // Numeración de secciones (solo en páginas que tienen section-num-bg)
    const sectionNumBg = container.querySelector('.section-num-bg');
    const sectionFooterNum = container.querySelector('.section-footer-num');

    if (sectionNumBg || sectionFooterNum) {
      sectionCounter++;
      const formattedSection = String(sectionCounter).padStart(2, '0');

      if (sectionNumBg) sectionNumBg.textContent = formattedSection;
      if (sectionFooterNum) sectionFooterNum.textContent = formattedPage;

      // Extrae el título de la sección
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

  return tocEntries;
}