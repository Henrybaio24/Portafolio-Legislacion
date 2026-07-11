let finished = false;

export function initIntro() {
  const overlay = document.getElementById('introOverlay');
  const avatarWrap = document.getElementById('introAvatarWrap');
  const enterBtn = document.getElementById('introEnterBtn');
  const avatarContainer = document.querySelector('.welcome-avatar-portrait');

  if (!overlay) return;

  document.body.style.overflow = 'hidden';
  if (avatarContainer) avatarContainer.style.opacity = '0';

  const hasVisited = localStorage.getItem('hasVisited');

  fetch('assets/svg/avatar-standing.svg')
    .then(r => {
      if (!r.ok) throw new Error('No se encontró avatar-standing.svg (' + r.status + ')');
      return r.text();
    })
    .then(svg => { avatarWrap.innerHTML = svg; })
    .catch(err => {
      console.warn('Intro: usando avatar de respaldo —', err.message);
      avatarWrap.innerHTML = '<div class="avatar-fallback">HM</div>';
    });

  if (hasVisited) {
    if (enterBtn) enterBtn.style.display = 'none';
    setTimeout(() => {
      overlay.classList.add('intro-closing-return');
      
      try {
        playTransition(overlay, avatarWrap, avatarContainer, true);
      } catch (err) {
        finishIntro(overlay, avatarContainer);
      }
    }, 2000);

  } else {    
    enterBtn?.addEventListener('click', () => {
      localStorage.setItem('hasVisited', 'true');
      
      try {
        playTransition(overlay, avatarWrap, avatarContainer, false);
      } catch (err) {
        console.error('Intro: error en la animación —', err);
        finishIntro(overlay, avatarContainer);
      }
    }, { once: true });
  }
}

function playTransition(overlay, avatarWrap, avatarContainer, isReturnVisit) {
  if (!avatarContainer) {
    finishIntro(overlay, avatarContainer);
    return;
  }

  const startRect = avatarWrap.getBoundingClientRect();
  const endRect = avatarContainer.getBoundingClientRect();

  const scaleX = endRect.width / startRect.width;
  const scaleY = endRect.height / startRect.height;
  const scale = Math.min(scaleX, scaleY) || 0.3;

  const startCenterX = startRect.left + startRect.width / 2;
  const startCenterY = startRect.top + startRect.height / 2;
  const endCenterX = endRect.left + endRect.width / 2;
  const endCenterY = endRect.top + endRect.height / 2;
  const deltaX = endCenterX - startCenterX;
  const deltaY = endCenterY - startCenterY;

  if (!isReturnVisit) {
    overlay.classList.add('intro-closing');
  }

  avatarWrap.classList.add('flying');
  avatarWrap.style.position = 'fixed';
  avatarWrap.style.left = startRect.left + 'px';
  avatarWrap.style.top = startRect.top + 'px';
  avatarWrap.style.width = startRect.width + 'px';
  avatarWrap.style.height = startRect.height + 'px';

  avatarWrap.offsetHeight; 

  requestAnimationFrame(() => {
    avatarWrap.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
    avatarWrap.style.opacity = '0';
  });

  avatarWrap.addEventListener('transitionend', function handler(e) {
    if (e.propertyName !== 'transform') return;
    avatarWrap.removeEventListener('transitionend', handler);
    finishIntro(overlay, avatarContainer);
  });
}

function finishIntro(overlay, avatarContainer) {
  if (finished) return;
  finished = true;

  overlay?.remove();
  document.body.style.overflow = '';

  if (avatarContainer) {
    avatarContainer.style.transition = 'opacity 0.35s ease';
    avatarContainer.style.opacity = '1';
  }
}

export function resetVisit() {
  localStorage.removeItem('hasVisited');
  location.reload();
}
