const SERVER_IP = '191.96.231.2:11026';
const REFRESH_TIME = 60;
let timeLeft = REFRESH_TIME;

function metricColor(val, type) {
  if (val == null) return 'p';
  if (type === 'cpu') return val >= 80 ? 'r' : val >= 55 ? 'w' : 'g';
  return val >= 80 ? 'r' : 'g';
}

function renderBars(history) {
  const c = document.getElementById('bars');
  c.innerHTML = history
    .slice(-7)
    .map((v) => {
      if (v == null || v < 0) return '<div class="b" style="height:40%"></div>';
      const pct = Math.max(8, Math.min(100, 10 + (v - 99) * 90));
      const cls = v < 99 ? 'dn' : 'up';
      return `<div class="b ${cls}" style="height:${pct.toFixed(1)}%"></div>`;
    })
    .join('');
}

async function fetchNodeStatus() {
  try {
    const res = await fetch('https://api.maximerix.dev/mcsh/outages/data', {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const london = data.regions?.find((r) => r.id === 'london');
    const ares = london?.nodes?.find((n) => n.name === 'Ares');
    if (!ares) return;
    const dot = document.getElementById('ndot');
    dot.className = 'ndot ' + (ares.online === true ? '' : 'down');
    const tag = document.getElementById('nuptag');
    if (ares.uptime7d) {
      const good = parseFloat(ares.uptime7d) >= 99;
      tag.textContent = ares.uptime7d;
      tag.className = 'uptime-tag' + (good ? '' : ' warn');
    }
    if (ares.latency != null)
      document.getElementById('nlat').textContent = ares.latency + 'ms';
    const cpu = document.getElementById('ncpu');
    const mem = document.getElementById('nmem');
    const stor = document.getElementById('nstor');
    if (ares.load != null) {
      cpu.textContent = ares.load + '%';
      cpu.className = 'met-val ' + metricColor(ares.load, 'cpu');
    }
    if (ares.memory != null) {
      mem.textContent = ares.memory + '%';
      mem.className = 'met-val ' + metricColor(ares.memory, 'mem');
    }
    if (ares.storage != null) {
      stor.textContent = ares.storage + '%';
      stor.className = 'met-val ' + metricColor(ares.storage, 'mem');
    }
    const hist = ares.uptimeHistory7d || ares.uptimeHistory14d;
    if (hist) renderBars(hist);
  } catch (e) {
    console.error('[node]', e);
  }
}

async function fetchData() {
  try {
    const r = await fetch(`https://api.mcsrvstat.us/2/${SERVER_IP}`);
    const d = await r.json();
    const dot = document.getElementById('badge-dot');
    const txt = document.getElementById('badge-txt');
    if (d.online) {
      dot.className = 'badge-dot on';
      txt.textContent = 'Online';
      document.getElementById('srv-img').src =
        d.icon || `https://api.mcsrvstat.us/icon/${SERVER_IP}`;
      document.getElementById('motd').textContent =
        d.motd?.clean?.[0] || 'A Minecraft Server';
      document.getElementById('pl-online').textContent = d.players.online;
      document.getElementById('pl-max').textContent = d.players.max;
      document.getElementById('ver').textContent = d.version || '???';
    } else {
      dot.className = 'badge-dot off';
      txt.textContent = 'Offline';
      document.getElementById('motd').textContent =
        'Server is currently unreachable.';
      document.getElementById('pl-online').textContent = '0';
      document.getElementById('pl-max').textContent = '0';
    }
    document.getElementById('footer-t').textContent =
      'Updated ' + new Date().toLocaleTimeString();
    document.getElementById('ts').textContent = new Date().toLocaleTimeString();
  } catch (e) {
    document.getElementById('footer-t').textContent = 'Failed to load';
  }
  timeLeft = REFRESH_TIME;
  await fetchNodeStatus();
}

setInterval(() => {
  timeLeft--;
  const pct = ((REFRESH_TIME - timeLeft) / REFRESH_TIME) * 100;
  document.getElementById('prog').style.width = pct + '%';
  if (timeLeft <= 0) fetchData();
}, 1000);

function manualRefresh() {
  timeLeft = REFRESH_TIME;
  fetchData();
}
function copyIP() {
  navigator.clipboard.writeText(document.getElementById('ip-val').textContent);
  const lbl = document.getElementById('ip-copy-lbl');
  lbl.textContent = 'Copied!';
  setTimeout(() => (lbl.textContent = 'Copy IP'), 1500);
}

fetchData();
