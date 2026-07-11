export function initSideToc(tocEntries) {
  const tocList = document.getElementById('tocList');
  if (!tocList) return;

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
