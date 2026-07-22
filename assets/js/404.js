import '../css/style.css';

const reloadBtn = document.getElementById('reloadBtn');

if (reloadBtn) {
  reloadBtn.addEventListener('click', () => location.reload());
}
