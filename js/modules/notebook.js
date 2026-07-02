// notebook.js - Modo Cuaderno (rediseño realista)

const NATURAL_W = 793.7008; // 210mm a 96dpi
const NATURAL_H = 1122.5197; // 297mm a 96dpi
const RING_COUNT = 14; // anillas de espiral
const HINT_DELAY = 3000; // ms antes de mostrar el aviso

let pages = [];
let current = 0;
let animating = false;
let els = {};
let initialized = false;
let hintTimeout = null;

function capturePages() {
  const wrapper = document.querySelector('.page-wrapper');
  const labels = Array.from(wrapper.querySelectorAll('.page-label'));
  const a4s = Array.from(wrapper.querySelectorAll('.a4'));

  pages = a4s.map((a4, i) => {
    const clone = a4.cloneNode(true);
    clone.querySelectorAll('.lightbox-zoom-btn').forEach(btn => btn.remove());
    return {
      label: labels[i] ? labels[i].textContent.replace(/^Página\s*\d+\s*—\s*/, '') : `Página ${i + 1}`,
      html: clone.outerHTML
    };
  });
}

function buildRings() {
  els.spine.innerHTML = '';
  const h = els.bookWrap.clientHeight;
  const count = Math.max(6, Math.min(RING_COUNT, Math.floor(h / 68)));
  for (let i = 0; i < count; i++) {
    const ring = document.createElement('div');
    ring.className = 'notebook-spine-ring';
    els.spine.appendChild(ring);
  }
}

function fitToStage() {
  const availW = els.bookWrap.clientWidth;
  const availH = els.bookWrap.clientHeight;
  const scale = Math.min(availW / NATURAL_W, availH / NATURAL_H);
  const w = NATURAL_W * scale;
  const h = NATURAL_H * scale;

  [els.content, els.flip].forEach(node => {
    node.style.width = w + 'px';
    node.style.height = h + 'px';
  });

  return scale;
}

function renderInto(node, html, scale) {
  node.innerHTML = html;
  const a4 = node.querySelector('.a4');
  if (a4) {
    a4.style.width = NATURAL_W + 'px';
    a4.style.height = NATURAL_H + 'px';
    a4.style.transform = `scale(${scale})`;
    a4.style.transformOrigin = 'top left';
    a4.style.boxShadow = 'none';
  }
}

function updateChrome() {
  els.label.textContent = pages[current].label;
  els.count.textContent = `${current + 1} / ${pages.length}`;
  els.prev.disabled = current === 0;
  els.next.disabled = current === pages.length - 1;
}

function showCurrent() {
  if (!pages.length) return;
  const scale = fitToStage();
  renderInto(els.content, pages[current].html, scale);
  buildRings();
  updateChrome();
}

function flip(direction) {
  if (animating) return;
  const targetIndex = current + direction;
  if (targetIndex < 0 || targetIndex >= pages.length) return;
  animating = true;

  const scale = fitToStage();
  const flipEl = els.flip;

  flipEl.innerHTML = '';
  flipEl.classList.remove('flip-next', 'flip-prev');

  const front = document.createElement('div');
  front.className = 'notebook-face notebook-face-front';
  const back = document.createElement('div');
  back.className = 'notebook-face notebook-face-back';
  flipEl.appendChild(front);
  flipEl.appendChild(back);

  if (direction > 0) {
    renderInto(front, pages[current].html, scale);
    renderInto(back, pages[targetIndex].html, scale);
  } else {
    renderInto(back, pages[current].html, scale);
    renderInto(front, pages[targetIndex].html, scale);
  }

  renderInto(els.content, pages[targetIndex].html, scale);

  flipEl.style.display = 'block';
  void flipEl.offsetWidth;
  flipEl.classList.add(direction > 0 ? 'flip-next' : 'flip-prev');

  const onEnd = () => {
    flipEl.removeEventListener('animationend', onEnd);
    flipEl.style.display = 'none';
    flipEl.classList.remove('flip-next', 'flip-prev');
    current = targetIndex;
    updateChrome();
    animating = false;
  };
  flipEl.addEventListener('animationend', onEnd);
}

function next() { flip(1); }
function prev() { flip(-1); }

function handleKey(e) {
  if (!document.body.classList.contains('notebook-mode')) return;
  if (e.key === 'ArrowRight') next();
  else if (e.key === 'ArrowLeft') prev();
  else if (e.key === 'Escape') closeNotebook();
}

let touchStartX = null;
function handleTouchStart(e) { touchStartX = e.changedTouches[0].clientX; }
function handleTouchEnd(e) {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 45) {
    if (dx < 0) next(); else prev();
  }
  touchStartX = null;
}

function showHint() {
  if (els.hint) els.hint.classList.add('visible');
}

function hideHint() {
  if (els.hint) els.hint.classList.remove('visible');
}

function openNotebook() {
  capturePages();
  if (!pages.length) return;
  current = 0;
  document.body.classList.add('notebook-mode');
  els.openBtn.classList.add('active');
  els.overlay.classList.add('active');
  showCurrent();
  window.addEventListener('resize', showCurrent);

  hideHint();
  clearTimeout(hintTimeout);
  hintTimeout = setTimeout(showHint, HINT_DELAY);
}

function closeNotebook() {
  document.body.classList.remove('notebook-mode');
  els.openBtn.classList.remove('active');
  els.overlay.classList.remove('active');
  els.content.innerHTML = '';
  els.flip.innerHTML = '';
  els.flip.style.display = 'none';
  window.removeEventListener('resize', showCurrent);

  clearTimeout(hintTimeout);
  hideHint();
}

function toggleNotebook() {
  if (document.body.classList.contains('notebook-mode')) {
    closeNotebook();
  } else {
    openNotebook();
  }
}

function buildHint() {
  const hint = document.createElement('div');
  hint.className = 'notebook-hint';
  hint.innerHTML = `
    <div class="notebook-hint-icon">i</div>
    <div class="notebook-hint-text">
      <p>Si no visualizas bien el contenido en esta vista, vuelve a la vista general.</p>
    </div>
    <div class="notebook-hint-actions">
      <button class="notebook-hint-btn" id="notebookHintBack">Vista general</button>
      <button class="notebook-hint-dismiss" id="notebookHintClose" aria-label="Cerrar aviso">✕</button>
    </div>
  `;
  els.overlay.appendChild(hint);
  els.hint = hint;

  hint.querySelector('#notebookHintBack').addEventListener('click', closeNotebook);
  hint.querySelector('#notebookHintClose').addEventListener('click', hideHint);
}

function initNotebook() {
  if (initialized) return;
  initialized = true;

  els = {
    overlay:  document.getElementById('notebookOverlay'),
    bookWrap: document.getElementById('notebookBookWrap'),
    content:  document.getElementById('notebookPageContent'),
    flip:     document.getElementById('notebookPageFlip'),
    spine:    document.querySelector('.notebook-spine'),
    label:    document.getElementById('notebookPageLabel'),
    count:    document.getElementById('notebookPageCount'),
    prev:     document.getElementById('notebookPrev'),
    next:     document.getElementById('notebookNext'),
    close:    document.getElementById('notebookClose'),
    openBtn:  document.getElementById('btnNotebook'),
  };

  if (!els.overlay || !els.openBtn) return;

  buildHint();

  els.openBtn.addEventListener('click', toggleNotebook);
  els.close.addEventListener('click', closeNotebook);
  els.prev.addEventListener('click', prev);
  els.next.addEventListener('click', next);
  document.addEventListener('keydown', handleKey);
  els.bookWrap.addEventListener('touchstart', handleTouchStart, { passive: true });
  els.bookWrap.addEventListener('touchend', handleTouchEnd, { passive: true });
}

export { initNotebook };