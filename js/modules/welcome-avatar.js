export function initWelcomeAvatar() {
  const welcomeAvatar = document.getElementById('welcomeAvatar');
  if (!welcomeAvatar) return;

  const avatarContainer = document.getElementById('avatarContainer');
  if (avatarContainer) {
    fetch('assets/svg/avatar.svg')
      .then(r => r.text())
      .then(svg => {
        avatarContainer.innerHTML = svg;
      })
      .catch(() => {
        avatarContainer.innerHTML = '<div class="avatar-fallback">HM</div>';
      });
  }

  document.getElementById('welcomeAvatarClose')?.addEventListener('click', () => {
    welcomeAvatar.style.display = 'none';
  });

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (welcomeAvatar.style.display === 'none') return;

    welcomeAvatar.classList.add('hidden-scroll');

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      welcomeAvatar.classList.remove('hidden-scroll');
    }, 400);
  });
}

