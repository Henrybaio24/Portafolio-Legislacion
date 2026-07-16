let observer = null;

function ensureObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      activateIframe(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '600px 0px', threshold: 0 });
  return observer;
}

export function activateIframe(iframe) {
  if (!iframe || !iframe.dataset || !iframe.dataset.src) return;
  iframe.src = iframe.dataset.src;
  delete iframe.dataset.src;
  iframe.classList.remove('iframe-lazy');
}

export function activateLazyIframesIn(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('iframe.iframe-lazy[data-src]').forEach(activateIframe);
}

export function makeIframeLazy(iframe) {
  const src = iframe.getAttribute('src');
  if (!src) return;
  iframe.dataset.src = src;
  iframe.removeAttribute('src');
  iframe.classList.add('iframe-lazy');
}

export function observeLazyIframes(root = document) {
  const obs = ensureObserver();
  root.querySelectorAll('iframe.iframe-lazy[data-src]').forEach(iframe => obs.observe(iframe));
}