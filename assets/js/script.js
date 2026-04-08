import { fetchServerData, fetchNodeData } from './api.js';

// Servers
let servers = JSON.parse(localStorage.getItem('servers')) || [
  {
    name: 'DarksideSMP',
    ip: '191.96.231.2:11026',
  },
];

document.addEventListener('DOMContentLoaded', loadServerList);

// URL Params
const urlParams = new URLSearchParams(window.location.search);

// Server variables
let serverIP = urlParams.get('server') || localStorage.getItem('serverIP') || '191.96.231.2:11026';
let serverName = urlParams.get('name') || localStorage.getItem('serverName') || 'DarksideSMP';
updateUrl({ server: serverIP, name: serverName });

let serverData;
let nodeData;
let statusTimeout;

// Elements
const dot = document.getElementById('statusDot');
const statusState = document.getElementById('statusState');
const serverNameText = document.getElementById('serverName');
const serverIconImg = document.getElementById('serverIconImg');
const playersOnline = document.getElementById('playersOnline');
const playerMax = document.getElementById('playersMax');
const serverIpValue = document.getElementById('serverIpValue');
const serverVersion = document.getElementById('serverVersion');
const motdText = document.getElementById('motdText');
const copyIpBtn = document.getElementById('copyIpBtn');
const serverListBtn = document.querySelector('.serverList');
const addToListCheckbox = document.getElementById('addToServerListCheckBox');
const sidebarLinks = document.querySelector('.sidebar-links');
const closeServerListBtn = document.getElementById('closeServerListBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const darksidesmpBtn = document.getElementById('darksidesmpBtn');
const nodeStatusDot = document.getElementById('nodeStatusDot');
const nodeStatusState = document.getElementById('nodeStatusState');
const nodeCPU = document.getElementById('nodeCPU');
const nodeMemory = document.getElementById('nodeMemory');
const nodeStorage = document.getElementById('nodeStorage');
const nodeLatency = document.getElementById('nodeLatency');
const nodeUptime = document.getElementById('nodeUptime');

const editOverlay = document.getElementById('overlayBackdrop');
const editBtn = document.getElementById('editBtn');
const applyBtn = document.getElementById('applyBtn');
const cancelBtn = document.getElementById('cancelBtn');
const serverNameInput = document.getElementById('serverNameInput');
const serverIpInput = document.getElementById('serverIpInput');
const errorText = document.getElementById('errorText');

function loadServerList() {
  sidebarLinks.innerHTML = '';

  servers.forEach((server) => {
    const li = document.createElement('li');

    li.innerHTML = `
    <button class="serverBtn" data-ip="${server.ip}" data-name="${server.name}">
      <i data-lucide="server"></i> <span>${server.name}</span>
    </button>
  `;

    sidebarLinks.appendChild(li);

    const newBtn = li.querySelector('.serverBtn');
    newBtn.addEventListener('click', () => {
      serverIP = server.ip;
      serverName = server.name;
      updateUrl({ server: serverIP, name: serverName });
      closeServerList();
      getServerStatus();
    });
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Fetch server information using mcsrvstat.us API
async function getServerStatus() {
  serverNameText.textContent = serverName;

  dot.className = 'status-dot checking';
  nodeStatusDot.className = 'status-dot checking';

  try {
    const [serverResult, nodeResult] = await Promise.allSettled([
      fetchServerData(serverIP),
      fetchNodeData(),
    ]);

    if (serverResult.status === 'fulfilled') {
      serverData = serverResult.value;
      console.log('MC Server Data:', serverData);
    } else {
      console.error('MC API Error:', serverResult.reason);
      serverData = { online: false };
    }

    if (nodeResult.status === 'fulfilled') {
      nodeData = nodeResult.value;
      console.log('Node Data:', nodeData);
    } else {
      console.error('Node API Error:', nodeResult.reason);
      nodeData = { online: false };
    }

    displayServerStatus();
    displayNodeStatus();
    saveServerInfo();
  } catch (error) {
    console.error('Critical Fetch Error:', error);
    serverData = { online: false };
    displayServerStatus();
  }
}

function saveServerInfo() {
  localStorage.setItem('serverIP', serverIP);
  localStorage.setItem('serverName', serverName);
}

// Display server information
function displayServerStatus() {
  // Display server icon or BananaBrother77 profile picture
  serverIconImg.src =
    serverData.icon ||
    'https://raw.githubusercontent.com/BananaBrother77/global-assets/refs/heads/main/profile.jpeg';

  // Display server status
  dot.className = serverData.online
    ? 'status-dot online'
    : 'status-dot offline';
  statusState.textContent = serverData.online ? 'Online' : 'Offline';

  // Display server IP
  serverIpValue.textContent = serverIP;

  // Display server status of DarksideSMP when offline
  if (serverIP === '191.96.231.2:11026' && serverData.online === false) {
    playerMax.textContent = '20';
    serverVersion.textContent = '1.21.11';
    motdText.textContent = 'Very DARK in here...';
    getOnlinePlayers();
    return;
  }

  // Display player count
  playersOnline.textContent = serverData.players?.online ?? '0';
  playerMax.textContent = serverData.players?.max ?? 'Unknown';

  // Display server version
  serverVersion.textContent = serverData.version
    ? serverData.version.replace(/^\D+/, '')
    : 'Unknown';

  // Display MOTD
  motdText.textContent = serverData.motd?.clean?.join(' ') || 'Unknown';

  // Populate the player heads list
  getOnlinePlayers();

  // Loop the check every 30 seconds
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(getServerStatus, 30000);
}

function getOnlinePlayers() {
  const headsContainer = document.getElementById('playerHeadsContainer');
  headsContainer.innerHTML = '';

  if (!serverData || !serverData.online) {
    headsContainer.innerHTML =
      '<span class="no-players-text">Server is unreachable or offline.</span>';
    return;
  }

  const players = serverData.players?.list || [];
  if (players.length > 0) {
    players.forEach((player) => {
      const identifier = player.uuid || player.name;
      const displayName = player.name;

      const playerWrapper = document.createElement('div');
      playerWrapper.classList.add('player-tag');

      const img = document.createElement('img');
      img.src = `https://mc-heads.net/avatar/${identifier}/32`;
      img.alt = displayName;
      img.classList.add('player-head-icon');

      const nameSpan = document.createElement('span');
      nameSpan.textContent = displayName;
      nameSpan.classList.add('player-name');

      playerWrapper.appendChild(img);
      playerWrapper.appendChild(nameSpan);
      headsContainer.appendChild(playerWrapper);
    });
  } else if (serverData.players?.online > 0) {
    headsContainer.innerHTML =
      '<span class="no-players-text">Player names are hidden in server settings.</span>';
  } else {
    headsContainer.innerHTML =
      '<span class="no-players-text">No players currently online.</span>';
  }
}

// Copy IP to clipboard using the btn
copyIpBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(serverIpValue.textContent);
  copyIpBtn.textContent = 'Copied';
  setTimeout(() => {
    copyIpBtn.textContent = 'Copy IP';
  }, 800);
});

function displayNodeStatus() {
  const london = nodeData.regions.find((r) => r.id === 'london');
  const ares = london.nodes.find((n) => n.name === 'Ares');

  console.log(ares);

  updateUI(ares);
}

function getUsageClass(value, type) {
  if (value == null) return '';
  const val = parseFloat(value);

  if (type === 'cpu') {
    if (val >= 80) return 'usage-high';
    if (val >= 60) return 'usage-medium';
    return 'usage-low';
  }

  if (type === 'latency') {
    if (val >= 150) return 'usage-high';
    if (val >= 60) return 'usage-medium';
    return 'usage-low';
  }

  if (type === 'uptime') {
    if (val < 98.5) return 'usage-high';
    if (val < 99.9) return 'usage-medium';
    return 'usage-low';
  }

  if (val >= 85) return 'usage-high';
  if (val >= 70) return 'usage-medium';
  return 'usage-low';
}

function updateUI(node) {
  if (!node) return;

  nodeStatusDot.className = node.online
    ? 'status-dot online'
    : 'status-dot offline';
  nodeStatusState.textContent = node.online ? 'Online' : 'Offline';

  nodeCPU.textContent = node.load != null ? `${node.load}%` : '--';
  nodeCPU.className = `card-value ${getUsageClass(node.load, 'cpu')}`;

  nodeMemory.textContent = node.memory != null ? `${node.memory}%` : '--';
  nodeMemory.className = `card-value ${getUsageClass(node.memory, 'mem')}`;

  nodeStorage.textContent = node.storage != null ? `${node.storage}%` : '--';
  nodeStorage.className = `card-value ${getUsageClass(node.storage, 'mem')}`;

  nodeLatency.textContent = node.latency != null ? `${node.latency} ms` : '--';
  nodeLatency.className = `card-value ${getUsageClass(node.latency, 'latency')}`;

  nodeUptime.textContent = node.uptime7d != null ? `${node.uptime7d}` : '--';
  nodeUptime.className = `card-value ${getUsageClass(node.uptime7d, 'uptime')}`;
}

getServerStatus();

editBtn.addEventListener('click', () => {
  if (!editOverlay.classList.contains('show')) {
    serverNameInput.value = serverName;
    serverIpInput.value = serverIP;
    errorText.textContent = '';
    editOverlay.classList.add('show');
  }
});

cancelBtn.addEventListener('click', () => {
  closeEditOverlay();
});

applyBtn.addEventListener('click', applyChanges);

serverNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyChanges();
});

serverIpInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyChanges();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeEditOverlay();
  if (e.key === 'Escape') closeServerList();
  if (e.key === 's') openServerList();
});

function closeEditOverlay() {
  if (editOverlay.classList.contains('show')) {
    editOverlay.classList.remove('show');
  }
}

function applyChanges() {
  const newName = serverNameInput.value.trim();
  const newIP = serverIpInput.value.trim();

  if (!newName || !newIP) {
    errorText.textContent = 'Please fill out all fields.';
    return;
  }

  if (addToListCheckbox.checked) {
    const exists = servers.some((s) => s.ip === newIP);
    if (!exists) {
      servers.push({ name: newName, ip: newIP });
      localStorage.setItem('servers', JSON.stringify(servers));
      loadServerList();
    }
  }

  serverIP = newIP;
  serverName = newName;

  errorText.textContent = '';
  closeEditOverlay();

  updateUrl({ server: serverIP, name: serverName });
  getServerStatus();
}

function updateUrl(params) {
  const url = new URL(window.location);

  Object.keys(params).forEach((key) => {
    url.searchParams.set(key, params[key]);
  });

  window.history.pushState({}, '', url);
}

serverListBtn.addEventListener('click', openServerList);

closeServerListBtn.addEventListener('click', closeServerList);

function openServerList() {
  if (sidebar.classList.contains('active')) {
    closeServerList();
    return;
  }
  sidebar.classList.add('active');
  overlay.classList.add('active');
}

function closeServerList() {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
}

darksidesmpBtn.addEventListener('click', () => {
  serverIP = '191.96.231.2:11026';
  serverName = 'DarksideSMP';

  updateUrl({
    server: serverIP,
    name: serverName,
  });

  closeServerList();
  getServerStatus();
});
