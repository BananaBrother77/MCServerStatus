import { toggleLanguage } from './translations.js';

const COOKIE_DOMAIN = '.bananabrother77.online';

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

function setCookie(name, value) {
  document.cookie = `${name}=${value}; domain=${COOKIE_DOMAIN}; path=/; max-age=31536000; SameSite=Lax`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; domain=${COOKIE_DOMAIN}; path=/; max-age=0; SameSite=Lax`;
}

function shouldSyncTheme() {
  const cookie = getCookie('syncTheme');
  if (cookie !== null) return cookie === 'true';
  return localStorage.getItem('syncTheme') !== 'false';
}

export function applyTheme(theme) {
  document.documentElement.classList.remove(
    'theme-green',
    'theme-red',
    'theme-yellow',
    'theme-blue',
    'theme-pink',
  );
  document.body.classList.remove(
    'theme-green',
    'theme-red',
    'theme-yellow',
    'theme-blue',
    'theme-pink',
  );

  if (theme !== 'purple') {
    document.documentElement.classList.add(`theme-${theme}`);
    document.body.classList.add(`theme-${theme}`);
  }

  localStorage.setItem('theme', theme);
  if (shouldSyncTheme()) {
    setCookie('theme', theme);
  }

  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

// ============================================================
// STATE
// ============================================================

const syncEnabled = shouldSyncTheme();
const cookieTheme = syncEnabled ? getCookie('theme') : null;
const localTheme = localStorage.getItem('theme');
const savedTheme = cookieTheme || localTheme || 'purple';

if (syncEnabled && cookieTheme && cookieTheme !== localTheme) {
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
const syncThemeSwitch = document.getElementById('syncThemeSwitch');
const privacyToggleBtn = document.getElementById('privacyToggleBtn');

// ============================================================
// SETTINGS MODAL
// ============================================================

if (settingsBtn && settingsModal) {
  settingsBtn.addEventListener('click', () =>
    settingsModal.classList.add('show'),
  );
}

if (closeModalBtn && settingsModal) {
  closeModalBtn.addEventListener('click', () =>
    settingsModal.classList.remove('show'),
  );
}

themeBtns.forEach((btn) => {
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
});

if (langSwitchBtn) {
  langSwitchBtn.addEventListener('click', toggleLanguage);
}

function setSwitchState(btn, on) {
  if (!btn) return;
  btn.classList.toggle('is-on', on);
  btn.setAttribute('aria-checked', String(on));
}

if (syncThemeSwitch) {
  setSwitchState(syncThemeSwitch, syncEnabled);
  syncThemeSwitch.addEventListener('click', () => {
    const enabled = !syncThemeSwitch.classList.contains('is-on');
    localStorage.setItem('syncTheme', enabled);
    setCookie('syncTheme', enabled);
    if (enabled) {
      setCookie('theme', localStorage.getItem('theme') || 'purple');
    } else {
      deleteCookie('theme');
    }
    setSwitchState(syncThemeSwitch, enabled);
  });
}

// ============================================================
// PRIVACY TOGGLE
// ============================================================

const CONSENT_KEY = 'cookie-consent';

function isAnalyticsEnabled() {
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

setSwitchState(privacyToggleBtn, isAnalyticsEnabled());

if (privacyToggleBtn) {
  privacyToggleBtn.addEventListener('click', () => {
    if (isAnalyticsEnabled()) {
      if (typeof window.declineCookies === 'function') window.declineCookies();
    } else if (typeof window.acceptCookies === 'function') {
      window.acceptCookies();
    }

    setSwitchState(privacyToggleBtn, isAnalyticsEnabled());
  });
}
