(function () {
  const KEY = 'cookie-consent';
  const GA_ID = 'G-B33EM55J3N';

  const elements = {
    banner: document.getElementById('cookieBanner'),
  };

  const consent = localStorage.getItem(KEY);

  if (consent === 'accepted') {
    loadGA();
  } else {
    document.addEventListener('DOMContentLoaded', showBanner);
  }

  function showBanner() {
    if (elements.banner) elements.banner.classList.add('show');
  }

  window.acceptCookies = function () {
    localStorage.setItem(KEY, 'accepted');

    hideBanner();
    loadGA();
  };

  window.declineCookies = function () {
    localStorage.setItem(KEY, 'declined');

    hideBanner();
  };

  function hideBanner() {
    if (elements.banner) elements.banner.classList.remove('show');
  }

  function loadGA() {
    window.dataLayer = window.dataLayer || [];

    function gtag() {
      dataLayer.push(arguments);
    }

    gtag('js', new Date());
    gtag('config', GA_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;

    document.head.appendChild(s);
  }
})();
