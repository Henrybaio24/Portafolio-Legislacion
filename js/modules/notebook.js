// notebook.js - Modo Cuaderno (rediseño realista)

const NATURAL_W = 793.7008;   // 210mm a 96dpi
const NATURAL_H = 1122.5197;  // 297mm a 96dpi
const RING_COUNT = 14;
const HINT_DELAY = 3000;

// Constantes de zoom
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4.5;
const ZOOM_STEP = 0.2;

class Notebook {
  constructor() {
    this.pages = [];
    this.current = 0;
    this.animating = false;
    this.els = {};
    this.hintTimeout = null;
    this.touchStartX = null;
    this.initialized = false;
    this.zoom = 1.0;

    // Bind único para poder añadir/quitar el mismo listener de resize
    this._onResize = () => this.showCurrent();
  }

  // ── Referencias al DOM ──
  cacheElements() {
    this.els = {
      overlay:  document.getElementById('notebookOverlay'),
      stage:    document.querySelector('.notebook-stage'),
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
      zoomIn:     document.getElementById('notebookZoomIn'),
      zoomOut:    document.getElementById('notebookZoomOut'),
      zoomReset:  document.getElementById('notebookZoomReset'),
      zoomLevel:  document.getElementById('notebookZoomLevel'),
    };
  }

  // ── Captura de páginas ──
  capturePages() {
    const wrapper = document.querySelector('.page-wrapper');
    const labels = Array.from(wrapper.querySelectorAll('.page-label'));
    const a4s = Array.from(wrapper.querySelectorAll('.a4'));

    this.pages = a4s.map((a4, i) => {
      const clone = a4.cloneNode(true);
      clone.querySelectorAll('.lightbox-zoom-btn').forEach(btn => btn.remove());
      return {
        label: labels[i]?.textContent.replace(/^Página\s*\d+\s*—\s*/, '') || `Página ${i + 1}`,
        html: clone.outerHTML
      };
    });
  }

  // ── Renderizado ──
  buildRings() {
    this.els.spine.innerHTML = '';
    const h = this.els.bookWrap.clientHeight;
    const count = Math.max(6, Math.min(RING_COUNT, Math.floor(h / 68)));

    for (let i = 0; i < count; i++) {
      const ring = document.createElement('div');
      ring.className = 'notebook-spine-ring';
      this.els.spine.appendChild(ring);
    }
  }

  computeStageBox() {
    const stage = this.els.stage;
    const cs = getComputedStyle(stage);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    return {
      w: stage.clientWidth - padX,
      h: stage.clientHeight - padY
    };
  }

  getBaseScale() {
    const { w: availW, h: availH } = this.computeStageBox();
    return Math.min(availW / NATURAL_W, availH / NATURAL_H);
  }

  applySize(scale) {
    const w = NATURAL_W * scale;
    const h = NATURAL_H * scale;

    this.els.bookWrap.style.width = `${w}px`;
    this.els.bookWrap.style.height = `${h}px`;

    [this.els.content, this.els.flip].forEach(node => {
      node.style.width = `${w}px`;
      node.style.height = `${h}px`;
    });

    return scale;
  }

  renderInto(node, html, scale) {
    node.innerHTML = html;
    const a4 = node.querySelector('.a4');
    if (a4) {
      a4.style.width = `${NATURAL_W}px`;
      a4.style.height = `${NATURAL_H}px`;
      a4.style.transform = `scale(${scale})`;
      a4.style.transformOrigin = 'top left';
      a4.style.boxShadow = 'none';
    }
  }

  updateChrome() {
    this.els.label.textContent = this.pages[this.current].label;
    this.els.count.textContent = `${this.current + 1} / ${this.pages.length}`;
    this.els.prev.disabled = this.current === 0;
    this.els.next.disabled = this.current === this.pages.length - 1;
  }

  // ── Zoom ──
  applyZoom() {
    this.els.zoomLevel.textContent = `${Math.round(this.zoom * 100)}%`;
    this.els.zoomOut.disabled = this.zoom <= ZOOM_MIN;
    this.els.zoomIn.disabled = this.zoom >= ZOOM_MAX;
    this.showCurrent();
  }

  zoomIn() {
    if (this.zoom >= ZOOM_MAX) return;
    this.zoom = Math.min(ZOOM_MAX, parseFloat((this.zoom + ZOOM_STEP).toFixed(2)));
    this.applyZoom();
  }

  zoomOut() {
    if (this.zoom <= ZOOM_MIN) return;
    this.zoom = Math.max(ZOOM_MIN, parseFloat((this.zoom - ZOOM_STEP).toFixed(2)));
    this.applyZoom();
  }

  zoomReset() {
    this.zoom = 1.0;
    this.applyZoom();
  }

  showCurrent() {
    if (!this.pages.length) return;
    const baseScale = this.getBaseScale();
    const finalScale = this.applySize(baseScale * this.zoom);
    this.renderInto(this.els.content, this.pages[this.current].html, finalScale);
    this.buildRings();
    this.updateChrome();
  }

  // ── Animación de giro de página ──
  

  flip(direction) {
    if (this.animating) return;
    const targetIndex = this.current + direction;
    if (targetIndex < 0 || targetIndex >= this.pages.length) return;

    this.animating = true;
    const baseScale = this.getBaseScale();
    const finalScale = this.applySize(baseScale * this.zoom);
    const flipEl = this.els.flip;

    flipEl.innerHTML = '';
    flipEl.classList.remove('flip-next', 'flip-prev');

    const front = document.createElement('div');
    front.className = 'notebook-face notebook-face-front';
    const back = document.createElement('div');
    back.className = 'notebook-face notebook-face-back';
    flipEl.append(front, back);

    if (direction > 0) {
      this.renderInto(front, this.pages[this.current].html, finalScale);
      this.renderInto(back, this.pages[targetIndex].html, finalScale);
    } else {
      this.renderInto(back, this.pages[this.current].html, finalScale);
      this.renderInto(front, this.pages[targetIndex].html, finalScale);
    }

    if (direction > 0) {
      this.renderInto(this.els.content, this.pages[targetIndex].html, finalScale);
    }

    flipEl.style.transform = direction > 0 ? 'rotateY(0deg)' : 'rotateY(-180deg)';
    flipEl.style.display = 'block';
    flipEl.getBoundingClientRect();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flipEl.classList.add(direction > 0 ? 'flip-next' : 'flip-prev');
      });
    });

    const onEnd = () => {
      flipEl.removeEventListener('animationend', onEnd);
      flipEl.style.display = 'none';
      flipEl.classList.remove('flip-next', 'flip-prev');
      
      // ── SOLO PARA REGRESAR: actualizar content al terminar ──
      if (direction < 0) {
        this.renderInto(this.els.content, this.pages[targetIndex].html, finalScale);
      }
      
      this.current = targetIndex;
      this.updateChrome();
      this.animating = false;
    };
    flipEl.addEventListener('animationend', onEnd);
  }

  next() { this.flip(1); }
  prev() { this.flip(-1); }

  // ── Aviso/Hint ──
  showHint() {
    this.els.hint?.classList.add('visible');
  }

  hideHint() {
    this.els.hint?.classList.remove('visible');
  }

  // ── Apertura/Cierre ──
  open() {
    this.capturePages();
    if (!this.pages.length) return;

    this.current = 0;
    this.zoom = 1.0;
    document.body.classList.add('notebook-mode');
    this.els.openBtn.classList.add('active');
    this.els.overlay.classList.add('active');

    this.showCurrent();
    window.addEventListener('resize', this._onResize);

    this.hideHint();
    clearTimeout(this.hintTimeout);
    this.hintTimeout = setTimeout(() => this.showHint(), HINT_DELAY);
  }

  close() {
    document.body.classList.remove('notebook-mode');
    this.els.openBtn.classList.remove('active');
    this.els.overlay.classList.remove('active');
    this.els.content.innerHTML = '';
    this.els.flip.innerHTML = '';
    this.els.flip.style.display = 'none';
    // Restaura el tamaño por defecto del CSS al cerrar
    this.els.bookWrap.style.width = '';
    this.els.bookWrap.style.height = '';
    window.removeEventListener('resize', this._onResize);

    clearTimeout(this.hintTimeout);
    this.hideHint();
  }

  toggle() {
    document.body.classList.contains('notebook-mode') ? this.close() : this.open();
  }

  // ── Event Handlers ──
  handleKey(e) {
    if (!document.body.classList.contains('notebook-mode')) return;
    if (e.key === 'ArrowRight') this.next();
    else if (e.key === 'ArrowLeft') this.prev();
    else if (e.key === 'Escape') this.close();
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); this.zoomIn(); }
    else if (e.key === '-') { e.preventDefault(); this.zoomOut(); }
    else if (e.key === '0') { e.preventDefault(); this.zoomReset(); }
  }

  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].clientX;
  }

  handleTouchEnd(e) {
    if (this.touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(dx) > 45) {
      dx < 0 ? this.next() : this.prev();
    }
    this.touchStartX = null;
  }

  handleWheel(e) {
    if (!document.body.classList.contains('notebook-mode')) return;
    if (!e.ctrlKey) return;
    e.preventDefault();
    if (e.deltaY < 0) this.zoomIn();
    else this.zoomOut();
  }

  // ── Construcción del hint ──
  buildHint() {
    const hint = document.createElement('div');
    hint.className = 'notebook-hint';
    hint.innerHTML = `
      <div class="notebook-hint-icon">i</div>
      <div class="notebook-hint-text">
        <p>Si no visualizas bien el contenido en esta vista, vuelve a la vista general. (Espera hasta que se carguen los PDF)</p>
      </div>
      <div class="notebook-hint-actions">
        <button class="notebook-hint-btn" id="notebookHintBack">Vista general</button>
        <button class="notebook-hint-dismiss" id="notebookHintClose" aria-label="Cerrar aviso">✕</button>
      </div>
    `;

    this.els.overlay.appendChild(hint);
    this.els.hint = hint;

    hint.querySelector('#notebookHintBack').addEventListener('click', () => this.close());
    hint.querySelector('#notebookHintClose').addEventListener('click', () => this.hideHint());
  }

  // ── Inicialización ──
  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.cacheElements();

    if (!this.els.overlay || !this.els.openBtn) return;

    this.buildHint();

    this.els.openBtn.addEventListener('click', () => this.toggle());
    this.els.close.addEventListener('click', () => this.close());
    this.els.prev.addEventListener('click', () => this.prev());
    this.els.next.addEventListener('click', () => this.next());

    this.els.zoomIn.addEventListener('click', () => this.zoomIn());
    this.els.zoomOut.addEventListener('click', () => this.zoomOut());
    this.els.zoomReset.addEventListener('click', () => this.zoomReset());

    document.addEventListener('keydown', (e) => this.handleKey(e));
    document.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

    this.els.bookWrap.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.els.bookWrap.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
  }
}

// Singleton
let notebookInstance = null;

export function initNotebook() {
  if (!notebookInstance) {
    notebookInstance = new Notebook();
    notebookInstance.init();
  }
  return notebookInstance;
}