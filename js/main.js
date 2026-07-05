import { loadPage } from './modules/page-loader.js';
import { initLightbox } from './modules/lightbox.js';
import { initNotebook } from './modules/notebook.js';
import { initWelcomeAvatar } from './modules/welcome-avatar.js';
import { initIntro } from './modules/intro.js';
import { initScrollTop } from './modules/scroll-top.js';
import { initIndexPage } from './modules/index-page.js';
import { initSideToc } from './modules/toc.js';
import { initCarousel } from './modules/carousel.js';
import { initToolbarAutoHide } from './modules/toolbar-autohide.js';
import { initScrollRestore } from './utilities/scroll-restore.js';
import { pagesWithContainer } from './utilities/page-data.js';
import { renderPageSlots, generateTocEntries } from './utilities/page-numbering.js';
import { actualizarFecha } from './modules/date.js';

// Inicialización inmediata
initNotebook();
initWelcomeAvatar();
initIntro(); 
initScrollTop();
initToolbarAutoHide();
renderPageSlots();

// Carga de páginas + post-procesamiento
Promise.all(
  pagesWithContainer.map(p => loadPage(p.url, p.container))
).then(() => {
  const tocEntries = generateTocEntries();
  initIndexPage(tocEntries);
  initSideToc(tocEntries);
  initLightbox();
  initCarousel();
  initScrollRestore();
  actualizarFecha();
});