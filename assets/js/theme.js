export function applyTheme(theme) {
  document.documentElement.classList.remove(
    'theme-green',
    'theme-red',
    'theme-yellow',
    'theme-blue',
  );
  document.body.classList.remove(
    'theme-green',
    'theme-red',
    'theme-yellow',
    'theme-blue',
  );
  if (theme !== 'none') {
    document.documentElement.classList.add(`theme-${theme}`);
    document.body.classList.add(`theme-${theme}`);
  }
  localStorage.setItem('theme', theme);
  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

const savedTheme = localStorage.getItem('theme') || 'none';
applyTheme(savedTheme);
