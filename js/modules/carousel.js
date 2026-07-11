import { pagesWithContainer } from '../utilities/page-data.js';

export function initCarousel() {
  const carouselOverlay = document.getElementById('carouselOverlay');
  const carouselImg = document.getElementById('carouselImg');
  const carouselCaption = document.getElementById('carouselCaption');
  const carouselClose = document.getElementById('carouselClose');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const carouselCounter = document.getElementById('carouselCounter');
  const btnGallery = document.getElementById('btnGallery');
  const btnTop = document.getElementById('btnTop');

  if (!carouselOverlay || !carouselImg) return;

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
    if (images.length === 0) return;
    currentIndex = index;
    updateCarousel();
    carouselOverlay.classList.add('active');
    btnTop?.classList.remove('visible');
  }

  function updateCarousel() {
    const img = images[currentIndex];
    carouselImg.src = img.src;
    carouselImg.alt = img.alt;
    carouselCaption.textContent = img.caption || '';
    carouselCounter.textContent = `${currentIndex + 1} / ${images.length}`;
    updateNavState();
  }

  function updateNavState() {
    const atStart = currentIndex === 0;
    const atEnd = currentIndex === images.length - 1;

    if (carouselPrev) {
      carouselPrev.disabled = atStart;
      carouselPrev.classList.toggle('is-disabled', atStart);
    }
    if (carouselNext) {
      carouselNext.disabled = atEnd;
      carouselNext.classList.toggle('is-disabled', atEnd);
    }
  }

  function prevSlide() {
    if (currentIndex === 0) return; 
    currentIndex -= 1;
    updateCarousel();
  }

  function nextSlide() {
    if (currentIndex === images.length - 1) return; 
    currentIndex += 1;
    updateCarousel();
  }

  btnGallery?.addEventListener('click', () => openCarousel(0));
  carouselPrev?.addEventListener('click', prevSlide);
  carouselNext?.addEventListener('click', nextSlide);

  carouselClose?.addEventListener('click', () => {
    carouselOverlay.classList.remove('active');
    btnTop?.classList.toggle('visible', window.scrollY > 400);
  });

  document.addEventListener('keydown', (e) => {
    if (!carouselOverlay.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'Escape') {
      carouselOverlay.classList.remove('active');
      btnTop?.classList.toggle('visible', window.scrollY > 400);
    }
  });
}
