const SERVER_IP = '191.96.231.2:11026';
const SERVER_ADDRESS = 'darksidesmp.mcsh.io';
const REFRESH_TIME = 60;
const DEFAULT_ICON =
  'https://raw.githubusercontent.com/BananaBrother77/global-assets/refs/heads/main/profile.jpeg';

const elements = {
  badgeDot: document.getElementById('badge-dot'),
  badgeTxt: document.getElementById('badge-txt'),
  bars: document.getElementById('bars'),
  countdown: document.getElementById('countdown'),
  footerT: document.getElementById('footer-t'),
  heroSummary: document.getElementById('hero-summary'),
  ipCopyLabel: document.getElementById('ip-copy-lbl'),
  ipVal: document.getElementById('ip-val'),
  motd: document.getElementById('motd'),
  motdInline: document.getElementById('motd-inline'),
  ncpu: document.getElementById('ncpu'),
  ndot: document.getElementById('ndot'),
  nlat: document.getElementById('nlat'),
  nmem: document.getElementById('nmem'),
  nstor: document.getElementById('nstor'),
  nuptag: document.getElementById('nuptag'),
  occupancyFill: document.getElementById('occupancy-fill'),
  occupancyLabel: document.getElementById('occupancy-label'),
  plMax: document.getElementById('pl-max'),
  plOnline: document.getElementById('pl-online'),
  prog: document.getElementById('prog'),
  refreshBtn: document.getElementById('refreshBtn'),
  refreshLabel: document.getElementById('refresh-label'),
  refreshState: document.getElementById('refresh-state'),
  signalAddress: document.getElementById('signal-address'),
  signalRefresh: document.getElementById('signal-refresh'),
  srvAddr: document.getElementById('srv-addr'),
  srvImg: document.getElementById('srv-img'),
  statusDetail: document.getElementById('status-detail'),
  ts: document.getElementById('ts'),
  ver: document.getElementById('ver'),
};

let timeLeft = REFRESH_TIME;
let isRefreshing = false;
let copyLabelTimer = null;
let hasServerSnapshot = false;
let hasNodeSnapshot = false;

elements.ipVal.textContent = SERVER_ADDRESS;
elements.signalAddress.textContent = SERVER_ADDRESS;
elements.signalRefresh.textContent = `Every ${REFRESH_TIME} seconds`;
elements.srvAddr.textContent = SERVER_ADDRESS;

renderBars([]);
updateRefreshProgress();
setStatusChip('Waiting for first sync', 'loading');

function metricColor(val, type) {
  if (val == null) return 'p';
  if (type === 'cpu') return val >= 80 ? 'r' : val >= 60 ? 'w' : 'g';
  return val >= 85 ? 'r' : val >= 70 ? 'w' : 'g';
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatClock(date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function setStatusChip(text, tone) {
  elements.refreshState.textContent = text;
  elements.refreshState.className = `status-chip is-${tone}`;
}

function setFooterMessage(message, tone) {
  elements.footerT.textContent = message;
  elements.footerT.className = `mini-note is-${tone}`;
}

function setRefreshButtonState(loading) {
  elements.refreshBtn.disabled = loading;
  elements.refreshLabel.textContent = loading ? 'Refreshing...' : 'Refresh now';
}

function updateRefreshProgress() {
  if (isRefreshing) {
    elements.countdown.textContent = 'Syncing';
    elements.prog.style.width = '100%';
    return;
  }

  const progress = ((REFRESH_TIME - timeLeft) / REFRESH_TIME) * 100;
  elements.countdown.textContent = `${timeLeft}s`;
  elements.prog.style.width = `${progress}%`;
}

function extractMotd(data) {
  const lines = data.motd?.clean?.filter(Boolean) || [];
  return lines.join(' ').trim() || 'A Minecraft Server';
}

function setMetric(element, value, type) {
  if (value == null || Number.isNaN(Number(value))) {
    element.textContent = '--';
    element.className = 'met-val p';
    return;
  }

  const numeric = Number(value);
  element.textContent = `${numeric}%`;
  element.className = `met-val ${metricColor(numeric, type)}`;
}

function renderBars(history) {
  const values = Array.isArray(history) ? history.slice(-7) : [];

  while (values.length < 7) {
    values.unshift(null);
  }

  elements.bars.innerHTML = values
    .map((value) => {
      if (value == null || value < 0) {
        return '<div class="b placeholder" style="height:28%"></div>';
      }

      const numeric = Number(value);
      const height = clamp(12 + (numeric - 95) * 18, 12, 100);
      const tone = numeric < 99 ? 'dn' : 'up';
      return `<div class="b ${tone}" style="height:${height.toFixed(1)}%" title="${numeric.toFixed(2)}% uptime"></div>`;
    })
    .join('');
}

function renderServerData(data) {
  const online = Boolean(data.online);
  const playersOnline = Number(data.players?.online ?? 0);
  const playersMax = Number(data.players?.max ?? 0);
  const version = data.version || 'Unknown build';
  const motd = extractMotd(data);
  const occupancy = playersMax > 0 ? clamp((playersOnline / playersMax) * 100, 0, 100) : 0;

  elements.badgeDot.className = `badge-dot ${online ? 'on' : 'off'}`;
  elements.badgeTxt.textContent = online ? 'Server online' : 'Server offline';
  elements.heroSummary.textContent = online
    ? `${playersOnline}/${playersMax || '?'} players online. ${version}.`
    : 'Status API answered, but the Minecraft server is offline right now.';
  elements.motd.textContent = online
    ? motd
    : 'Server is currently unreachable. The dashboard is live and will keep retrying automatically.';
  elements.motdInline.textContent = online ? motd : 'Waiting for the server to come back.';
  elements.plOnline.textContent = String(playersOnline);
  elements.plMax.textContent = String(playersMax);
  elements.ver.textContent = online ? version : 'Offline';
  elements.occupancyFill.style.width = `${occupancy}%`;
  elements.occupancyLabel.textContent = online
    ? playersMax > 0
      ? `${Math.round(occupancy)}% of slots filled`
      : 'Player cap was not reported by the API'
    : 'No active players while the server is offline';
  elements.statusDetail.textContent = online
    ? `Live server snapshot ready at ${formatClock(new Date())}`
    : 'API reachable, but the Minecraft server is offline.';
  elements.srvImg.src = data.icon || `https://api.mcsrvstat.us/icon/${SERVER_IP}` || DEFAULT_ICON;

  document.title = `DarksideSMP | ${online ? 'Online' : 'Offline'}`;
  hasServerSnapshot = true;
}

function renderServerFailure() {
  console.error('[server] Unable to refresh live server status');

  if (!hasServerSnapshot) {
    elements.badgeDot.className = 'badge-dot off';
    elements.badgeTxt.textContent = 'Server data unavailable';
    elements.heroSummary.textContent = 'Could not load server status yet. The dashboard will retry automatically.';
    elements.motd.textContent = 'Live server data is temporarily unavailable.';
    elements.motdInline.textContent = 'Waiting for the first successful server response.';
    elements.statusDetail.textContent = 'Could not reach the server status API.';
    elements.ver.textContent = '--';
    elements.srvImg.src = DEFAULT_ICON;
  } else {
    elements.motdInline.textContent = 'Showing the last successful server snapshot.';
    elements.statusDetail.textContent = 'Server API temporarily unreachable. Last known data is still visible.';
  }
}

function renderNodeData(data) {
  const london = data.regions?.find((region) => region.id === 'london');
  const ares = london?.nodes?.find((node) => node.name === 'Ares');

  if (!ares) {
    throw new Error('Ares node not found');
  }

  elements.ndot.className = `ndot ${ares.online === true ? '' : 'down'}`.trim();
  elements.nlat.textContent =
    ares.latency != null ? `${ares.latency} ms latency` : 'Latency unavailable';
  elements.nuptag.textContent = ares.uptime7d ? `7d ${ares.uptime7d}` : '7d uptime pending';
  elements.nuptag.className =
    'uptime-tag' + (parseFloat(ares.uptime7d) >= 99 || !ares.uptime7d ? '' : ' warn');

  setMetric(elements.ncpu, ares.load, 'cpu');
  setMetric(elements.nmem, ares.memory, 'mem');
  setMetric(elements.nstor, ares.storage, 'mem');
  renderBars(ares.uptimeHistory7d || ares.uptimeHistory14d || []);

  hasNodeSnapshot = true;
}

function renderNodeFailure() {
  console.error('[node] Unable to refresh node telemetry');

  if (!hasNodeSnapshot) {
    elements.ndot.className = 'ndot down';
    elements.nlat.textContent = 'Node telemetry unavailable';
    elements.nuptag.textContent = 'Node data unavailable';
    elements.nuptag.className = 'uptime-tag warn';
    setMetric(elements.ncpu, null, 'cpu');
    setMetric(elements.nmem, null, 'mem');
    setMetric(elements.nstor, null, 'mem');
    renderBars([]);
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function fetchDashboard(trigger = 'auto') {
  if (isRefreshing) return;

  isRefreshing = true;
  timeLeft = REFRESH_TIME;
  setRefreshButtonState(true);
  setStatusChip(
    trigger === 'manual' ? 'Manual refresh running' : 'Refreshing live data',
    'loading'
  );
  updateRefreshProgress();

  const [serverResult, nodeResult] = await Promise.allSettled([
    fetchJson(`https://api.mcsrvstat.us/2/${SERVER_IP}`),
    fetchJson('https://api.maximerix.dev/mcsh/outages/data'),
  ]);

  let successCount = 0;

  if (serverResult.status === 'fulfilled') {
    try {
      renderServerData(serverResult.value);
      successCount += 1;
    } catch (error) {
      console.error('[server]', error);
      renderServerFailure();
    }
  } else {
    console.error('[server]', serverResult.reason);
    renderServerFailure();
  }

  if (nodeResult.status === 'fulfilled') {
    try {
      renderNodeData(nodeResult.value);
      successCount += 1;
    } catch (error) {
      console.error('[node]', error);
      renderNodeFailure();
    }
  } else {
    console.error('[node]', nodeResult.reason);
    renderNodeFailure();
  }

  const now = new Date();

  if (successCount === 2) {
    setStatusChip('All systems reporting', 'ok');
    setFooterMessage(`Updated ${formatClock(now)} from both live sources.`, 'ok');
    elements.ts.textContent = formatClock(now);
  } else if (successCount === 1) {
    setStatusChip('Partial telemetry', 'warn');
    setFooterMessage(`Updated ${formatClock(now)} with partial live data.`, 'warn');
    elements.ts.textContent = formatClock(now);
  } else {
    setStatusChip('Refresh failed', 'error');
    setFooterMessage('Both data sources failed. Retrying automatically.', 'error');
  }

  isRefreshing = false;
  timeLeft = REFRESH_TIME;
  setRefreshButtonState(false);
  updateRefreshProgress();
}

function manualRefresh() {
  fetchDashboard('manual');
}

async function copyIP() {
  clearTimeout(copyLabelTimer);

  try {
    await navigator.clipboard.writeText(elements.ipVal.textContent);
    elements.ipCopyLabel.textContent = 'Copied';
  } catch (error) {
    console.error('[clipboard]', error);
    elements.ipCopyLabel.textContent = 'Copy failed';
  }

  copyLabelTimer = setTimeout(() => {
    elements.ipCopyLabel.textContent = 'Copy server IP';
  }, 1600);
}

setInterval(() => {
  if (isRefreshing) {
    updateRefreshProgress();
    return;
  }

  timeLeft = Math.max(0, timeLeft - 1);
  updateRefreshProgress();

  if (timeLeft === 0) {
    fetchDashboard('auto');
  }
}, 1000);

fetchDashboard('initial');
