/**
 * Inicializa el avatar de bienvenida
 * Carga el SVG inline para permitir animaciones CSS internas
 */
export function initWelcomeAvatar() {
  const welcomeAvatar = document.getElementById('welcomeAvatar');
  if (!welcomeAvatar) return;

  // ── Cargar SVG inline (necesario para animaciones .avatar-blink, .avatar-mouth, etc.) ──
  const avatarContainer = document.getElementById('avatarContainer');
  if (avatarContainer) {
    fetch('assets/svg/avatar.svg')
      .then(r => r.text())
      .then(svg => {
        avatarContainer.innerHTML = svg;
      })
      .catch(() => {
        // Fallback si falla la carga
        avatarContainer.innerHTML = '<div class="avatar-fallback">HM</div>';
      });
  }

  // ── Cerrar avatar ──
  document.getElementById('welcomeAvatarClose')?.addEventListener('click', () => {
    welcomeAvatar.style.display = 'none';
  });

  // ── Ocultar al hacer scroll, mostrar al detenerse ──
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

