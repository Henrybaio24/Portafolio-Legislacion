// main.js - Punto de entrada de la aplicación
import { loadPage } from './modules/page-loader.js';
import { initLightbox } from './modules/lightbox.js';
import { initNotebook } from './modules/notebook.js';

initNotebook();

// --- Avatar de bienvenida ---
const welcomeAvatar = document.getElementById('welcomeAvatar');

document.getElementById('welcomeAvatarClose')?.addEventListener('click', () => {
  welcomeAvatar.style.display = 'none';
});

let scrollTimeout;
window.addEventListener('scroll', () => {
  if (!welcomeAvatar || welcomeAvatar.style.display === 'none') return;

  welcomeAvatar.classList.add('hidden-scroll');

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    welcomeAvatar.classList.remove('hidden-scroll');
  }, 400);
});

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

const pagesWithContainer = pages.map((p, i) => ({
  ...p,
  container: `page-${i + 1}`,
}));

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

// --- Botón ir al inicio (solo en vista general) ---
const btnTop = document.getElementById('btnTop');
const carouselOverlayEl = document.getElementById('carouselOverlay');

function updateBtnTop() {
  const overlayActive =
    document.body.classList.contains('notebook-mode') ||
    carouselOverlayEl.classList.contains('active');
  btnTop.classList.toggle('visible', !overlayActive && window.scrollY > 400);
}

window.addEventListener('scroll', updateBtnTop);

new MutationObserver(updateBtnTop).observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
});
new MutationObserver(updateBtnTop).observe(carouselOverlayEl, {
  attributes: true,
  attributeFilter: ['class'],
});

btnTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

Promise.all(
  pagesWithContainer.map(p => loadPage(p.url, p.container))
).then(() => {
  let pageCounter = 0;
  let sectionCounter = 0;
  const tocEntries = [];

  pagesWithContainer.forEach((p) => {
    const container = document.getElementById(p.container);
    if (!container) return;

    pageCounter++;
    const formattedPage = String(pageCounter).padStart(2, '0');

    const footerPage = container.querySelector('.footer-page');
    if (footerPage) footerPage.textContent = formattedPage;

    const sectionNumBg = container.querySelector('.section-num-bg');
    const sectionFooterNum = container.querySelector('.section-footer-num');

    if (sectionNumBg || sectionFooterNum) {
      sectionCounter++;
      const formattedSection = String(sectionCounter).padStart(2, '0');

      if (sectionNumBg) sectionNumBg.textContent = formattedSection;
      if (sectionFooterNum) sectionFooterNum.textContent = formattedPage;

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

  // --- Índice de página ---
  const indexList = document.querySelector('.index-list');
  if (indexList) {
    indexList.innerHTML = tocEntries.map(entry => `
      <li class="index-item" data-target="${entry.targetId}">
        <span class="index-num">${entry.num}</span>
        <span class="index-dots"></span>
        <span class="index-topic">${entry.topic}</span>
        <span class="index-dots"></span>
        <span class="index-page">${entry.page}</span>
      </li>
    `).join('');

    indexList.querySelectorAll('.index-item').forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        document.getElementById(item.dataset.target)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  initLightbox();

  // --- Restaura posición al recargar ---
  const savedScroll = localStorage.getItem('scrollPos');
  if (savedScroll) window.scrollTo(0, parseInt(savedScroll));
  window.addEventListener('scroll', () => {
    localStorage.setItem('scrollPos', window.scrollY);
  });

  // --- TOC lateral ---
  const tocList = document.getElementById('tocList');
  if (tocList) {
    tocList.innerHTML = tocEntries.map(entry => `
      <li class="toc-item" data-target="${entry.targetId}">
        <span class="toc-num">${entry.num}</span>
        <span class="toc-topic">${entry.topic}</span>
      </li>
    `).join('');

    tocList.querySelectorAll('.toc-item').forEach(item => {
      item.addEventListener('click', () => {
        document.getElementById(item.dataset.target)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    const tocObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocList.querySelectorAll('.toc-item').forEach(i => i.classList.remove('active'));
          const active = tocList.querySelector(`[data-target="${entry.target.id}"]`);
          active?.classList.add('active');
          active?.scrollIntoView({ block: 'nearest' });
        }
      });
    }, { threshold: 0.1, rootMargin: '0px' });

    tocEntries.forEach(entry => {
      const el = document.getElementById(entry.targetId);
      if (el) tocObserver.observe(el);
    });
  }

  // --- Carrusel de imágenes ---
  const carouselOverlay = document.getElementById('carouselOverlay');
  const carouselImg = document.getElementById('carouselImg');
  const carouselCaption = document.getElementById('carouselCaption');
  const carouselClose = document.getElementById('carouselClose');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const carouselCounter = document.getElementById('carouselCounter');

  // Recopila imágenes de los apuntes
  const images = [];
  pagesWithContainer
    .filter(p => p.url.includes('apuntes/'))
    .forEach(p => {
      const container = document.getElementById(p.container);
      if (!container) return;
      container.querySelectorAll('img').forEach(img => {
        images.push({
          src: img.src,
          alt: img.alt || '',
          caption: img.closest('figure')?.querySelector('figcaption')?.textContent || ''
        });
      });
    });

  let currentIndex = 0;

  function openCarousel(index) {
    currentIndex = index;
    updateCarousel();
    carouselOverlay.classList.add('active');
    btnTop.classList.remove('visible');
  }

  function updateCarousel() {
    const img = images[currentIndex];
    carouselImg.src = img.src;
    carouselImg.alt = img.alt;
    carouselCaption.textContent = img.caption || '';
    carouselCounter.textContent = `${currentIndex + 1} / ${images.length}`;
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateCarousel();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
  }

  // Botón galería -> abre carrusel directo
  const btnGallery = document.getElementById('btnGallery');
  btnGallery.addEventListener('click', () => openCarousel(0));

  carouselPrev.addEventListener('click', prevSlide);
  carouselNext.addEventListener('click', nextSlide);

  carouselClose.addEventListener('click', () => {
    carouselOverlay.classList.remove('active');
    btnTop.classList.toggle('visible', window.scrollY > 400);
  });

  document.addEventListener('keydown', (e) => {
    if (carouselOverlay.classList.contains('active')) {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'Escape') {
        carouselOverlay.classList.remove('active');
        btnTop.classList.toggle('visible', window.scrollY > 400);
      }
    }
  });
});