import { currentLang } from './translations.js';

function updateLegalLinks() {
  document.querySelectorAll('[data-legal-page]').forEach((link) => {
    const page = link.dataset.legalPage;
    const suffix = currentLang === 'de' ? '-de' : '';
    
    link.href = `https://bananabrother77.online/${page}${suffix}`;
  });
}

updateLegalLinks();

document.addEventListener('langchange', updateLegalLinks);
