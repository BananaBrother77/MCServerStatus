import { toggleLanguage } from './translations.js';

const COOKIE_DOMAIN = '.bananabrother77.online';

function getThemeCookie() {
  const match = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/);
  return match ? match[1] : null;
}

function setThemeCookie(theme) {
  document.cookie = `theme=${theme}; domain=${COOKIE_DOMAIN}; path=/; max-age=31536000; SameSite=Lax`;
}

export function applyTheme(theme) {
  document.documentElement.classList.remove('theme-green', 'theme-red', 'theme-yellow', 'theme-blue');
  document.body.classList.remove('theme-green', 'theme-red', 'theme-yellow', 'theme-blue');
  if (theme !== 'purple') {
    document.documentElement.classList.add(`theme-${theme}`);
    document.body.classList.add(`theme-${theme}`);
  }
  localStorage.setItem('theme', theme);
  setThemeCookie(theme);
  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

// ============================================================
// STATE
// ============================================================

const cookieTheme = getThemeCookie();
const localTheme = localStorage.getItem('theme');
const savedTheme = cookieTheme || localTheme || 'purple';

if (cookieTheme && cookieTheme !== localTheme) {
  localStorage.setItem('theme', cookieTheme);
}

applyTheme(savedTheme);

// ============================================================
// ELEMENTS
// ============================================================

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const themeBtns = document.querySelectorAll('.theme-btn');
const langSwitchBtn = document.getElementById('langSwitchBtn');

// ============================================================
// SETTINGS MODAL
// ============================================================

if (settingsBtn && settingsModal) {
  settingsBtn.addEventListener('click', () => settingsModal.classList.add('show'));
}

if (closeModalBtn && settingsModal) {
  closeModalBtn.addEventListener('click', () => settingsModal.classList.remove('show'));
}

themeBtns.forEach((btn) => {
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
});

if (langSwitchBtn) {
  langSwitchBtn.addEventListener('click', toggleLanguage);
}
