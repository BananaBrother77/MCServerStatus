import { toggleLanguage } from './translations.js';

// ============================================================
// UTILITIES
// ============================================================

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

export function updateIcons() {
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================
// KEYBOARD SHORTCUTS — shared across pages
// ============================================================

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'Escape':
      document.getElementById('settingsModal')?.classList.remove('show');
      break;

    case 'l':
      if (
        !document.querySelector(
          '.overlayBackdrop.show, .settings-modal.show',
        )
      ) {
        toggleLanguage();
      }
      break;
  }
});
