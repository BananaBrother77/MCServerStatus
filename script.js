const SERVER_IP = '191.96.231.2:11026';
const REFRESH_TIME = 60;
let timeLeft = REFRESH_TIME;

async function fetchData() {
  const card = document.getElementById('main-card');
  card.classList.add('loading-shimmer');

  try {
    const response = await fetch(`https://api.mcsrvstat.us/2/${SERVER_IP}`);
    const data = await response.json();

    // Status Badge & Icon
    const pill = document.getElementById('status-pill');
    const icon = document.getElementById('server-icon');

    if (data.online) {
      pill.innerText = 'Online';
      pill.className = 'status-pill online';
      icon.src = data.icon || `https://api.mcsrvstat.us/icon/${SERVER_IP}`;

      document.getElementById('motd').innerText =
        data.motd.clean[0] || 'Ein Minecraft Server';
      document.getElementById('player-count').innerText =
        `${data.players.online} / ${data.players.max}`;
      document.getElementById('version-val').innerText = data.version || '???';
    } else {
      pill.innerText = 'Offline';
      pill.className = 'status-pill offline';
      document.getElementById('motd').innerText =
        'Server ist aktuell nicht erreichbar.';
      document.getElementById('player-count').innerText = '0 / 0';
    }

    const jetzt = new Date();
    document.getElementById('last-update').innerText =
      `Update: ${jetzt.toLocaleTimeString()}`;
  } catch (error) {
    console.error('Fehler:', error);
    document.getElementById('last-update').innerText = 'Fehler beim Laden';
  } finally {
    card.classList.remove('loading-shimmer');
    timeLeft = REFRESH_TIME; // Reset Timer
  }
}

// Timer Logik für Progress Bar
setInterval(() => {
  timeLeft--;
  const percentage = ((REFRESH_TIME - timeLeft) / REFRESH_TIME) * 100;
  document.getElementById('progress-bar').style.width = percentage + '%';

  if (timeLeft <= 0) {
    fetchData();
  }
}, 1000);

function manualRefresh() {
  fetchData();
}

function copyIP() {
  const ip = document.getElementById('ip-val').innerText;
  navigator.clipboard.writeText(ip);
  alert('IP kopiert: ' + ip);
}

// Erster Start
fetchData();