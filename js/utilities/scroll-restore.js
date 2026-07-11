
export function initScrollRestore() {
  const navEntry = performance.getEntriesByType('navigation')[0];
  const navType = navEntry?.type; 

  if (navType === 'back_forward') {
    const savedScroll = localStorage.getItem('scrollPos');
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10));
    }
  } else {
    window.scrollTo(0, 0);
    localStorage.removeItem('scrollPos');
  }

  window.addEventListener('scroll', () => {
    localStorage.setItem('scrollPos', window.scrollY);
  }, { passive: true });
}
