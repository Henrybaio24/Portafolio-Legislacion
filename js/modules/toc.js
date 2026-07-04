/**
 * Inicializa el TOC lateral (sidebar) con resaltado de sección activa
 */
export function initSideToc(tocEntries) {
  const tocList = document.getElementById('tocList');
  if (!tocList) return;

  // Renderizar items
  tocList.innerHTML = tocEntries.map(entry => `
    <li class="toc-item" data-target="${entry.targetId}">
      <span class="toc-num">${entry.num}</span>
      <span class="toc-topic">${entry.topic}</span>
    </li>
  `).join('');

  // Navegación al hacer click
  tocList.querySelectorAll('.toc-item').forEach(item => {
    item.addEventListener('click', () => {
      document.getElementById(item.dataset.target)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // IntersectionObserver para resaltar sección visible
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

  // Observar cada contenedor de página
  tocEntries.forEach(entry => {
    const el = document.getElementById(entry.targetId);
    if (el) tocObserver.observe(el);
  });
}