// notebook.js - Modo Cuaderno

import { activateLazyIframesIn } from './lazy-drive.js';

const NATURAL_W = 793.7008;
const NATURAL_H = 1122.5197;
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

    // Cache de nodos ya renderizados (index -> elemento DOM con el .a4 y sus iframes/PDF ya cargados)
    this.nodeCache = new Map();

    this._onResize = () => this.showCurrent();
  }

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

    // Nuevo set de páginas -> invalida cualquier nodo cacheado de una sesión anterior
    this.nodeCache.clear();
  }

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

  // Ajusta solo la escala (CSS transform) de un nodo ya renderizado, sin volver a parsear su HTML.
  scaleNode(node, scale) {
    const a4 = node.querySelector('.a4');
    if (a4) {
      a4.style.width = `${NATURAL_W}px`;
      a4.style.height = `${NATURAL_H}px`;
      a4.style.transform = `scale(${scale})`;
      a4.style.transformOrigin = 'top left';
      a4.style.boxShadow = 'none';
    }
    return node;
  }

  // Devuelve el nodo cacheado para esa página (sin recrear el iframe/PDF) o lo crea
  // una única vez si todavía no existe.
  getOrRenderNode(index, scale) {
    let node = this.nodeCache.get(index);
    if (!node) {
      node = document.createElement('div');
      node.className = 'notebook-page-inner';
      node.innerHTML = this.pages[index].html; // se parsea (y el PDF/iframe se carga) UNA sola vez
      activateLazyIframesIn(node); // si el PDF de Drive venía diferido, se activa justo ahora
      this.nodeCache.set(index, node);
    } else if (node.parentNode) {
      // Si el nodo ya está montado en otro contenedor (p.ej. seguía en flip), lo liberamos
      node.parentNode.removeChild(node);
    }
    return this.scaleNode(node, scale);
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

    const node = this.getOrRenderNode(this.current, finalScale);
    this.els.content.innerHTML = '';
    this.els.content.appendChild(node);

    this.buildRings();
    this.updateChrome();
    this.preloadNeighbors(finalScale);
  }

  // Precarga silenciosa de la página anterior y siguiente para que el flip sea instantáneo.
  preloadNeighbors(scale) {
    [this.current - 1, this.current + 1].forEach(idx => {
      if (idx < 0 || idx >= this.pages.length) return;
      if (this.nodeCache.has(idx)) return;
      // Renderiza en memoria (sin montar en el DOM visible) para disparar la carga del PDF
      // sin bloquear ni competir por ancho de banda con la página actual.
      const node = document.createElement('div');
      node.className = 'notebook-page-inner';
      node.innerHTML = this.pages[idx].html;
      activateLazyIframesIn(node);
      this.scaleNode(node, scale);
      this.nodeCache.set(idx, node);
    });
  }

  // Render "decorativo" y desechable para las caras del flip. No toca el cache:
  // se descarta al terminar la animación. Es intencional que sea un parseo fresco
  // (igual que el comportamiento original) para no interferir con el nodo real
  // que vive en `content`.
  fillFace(faceEl, index, scale) {
    faceEl.innerHTML = this.pages[index].html;
    activateLazyIframesIn(faceEl);
    const a4 = faceEl.querySelector('.a4');
    if (a4) {
      a4.style.width = `${NATURAL_W}px`;
      a4.style.height = `${NATURAL_H}px`;
      a4.style.transform = `scale(${scale})`;
      a4.style.transformOrigin = 'top left';
      a4.style.boxShadow = 'none';
    }
  }

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

    // Las caras del flip son decorativas (se descartan al terminar la animación).
    if (direction > 0) {
      this.fillFace(front, this.current, finalScale);
      this.fillFace(back, targetIndex, finalScale);
    } else {
      this.fillFace(back, this.current, finalScale);
      this.fillFace(front, targetIndex, finalScale);
    }

    // El nodo REAL y cacheado del destino (sin recargar el PDF si ya se había visitado).
    const targetNode = this.getOrRenderNode(targetIndex, finalScale);

    if (direction > 0) {
      // Igual que el comportamiento original: al avanzar, el contenido de abajo
      // ya muestra la página destino desde el inicio, para que se "revele" al
      // girar la hoja en vez de quedar en blanco.
      this.els.content.innerHTML = '';
      this.els.content.appendChild(targetNode);
    }
    // Si direction < 0, dejamos `content` como está (la página actual) y el swap
    // real ocurre al terminar la animación, igual que en el original.

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

      if (direction < 0) {
        // Recién ahora movemos el nodo real y cacheado al contenedor principal.
        this.els.content.innerHTML = '';
        this.els.content.appendChild(targetNode);
      }

      // Libera las caras decorativas (sus iframes, si los hay, se descartan).
      front.innerHTML = '';
      back.innerHTML = '';

      this.current = targetIndex;
      this.updateChrome();
      this.animating = false;
      this.preloadNeighbors(finalScale);
    };
    flipEl.addEventListener('animationend', onEnd);
  }

  next() { this.flip(1); }
  prev() { this.flip(-1); }

  showHint() {
    this.els.hint?.classList.add('visible');
  }

  hideHint() {
    this.els.hint?.classList.remove('visible');
  }

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
    this.els.bookWrap.style.width = '';
    this.els.bookWrap.style.height = '';
    window.removeEventListener('resize', this._onResize);

    // Libera los PDFs/iframes cargados; la próxima apertura los recargará bajo demanda.
    this.nodeCache.clear();

    clearTimeout(this.hintTimeout);
    this.hideHint();
  }

  toggle() {
    document.body.classList.contains('notebook-mode') ? this.close() : this.open();
  }

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

let notebookInstance = null;

export function initNotebook() {
  if (!notebookInstance) {
    notebookInstance = new Notebook();
    notebookInstance.init();
  }
  return notebookInstance;
}