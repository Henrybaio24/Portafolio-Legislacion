export function initIndexPage(tocEntries) {
  const indexList = document.querySelector('.index-list');
  if (!indexList) return;

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
