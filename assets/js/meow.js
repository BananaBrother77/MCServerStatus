import { fetchServerData, fetchNodeData } from './api.js';

// ============================================================
// STATE
// ============================================================

const urlParams = new URLSearchParams(window.location.search);

let servers = JSON.parse(localStorage.getItem('servers')) || [
  { name: 'DarksideSMP', ip: 'darksidesmp.mcsh.io', showNode: 'Ares' },
];

let serverIP =
  urlParams.get('server') ||
  localStorage.getItem('serverIP') ||
  'darksidesmp.mcsh.io';

let serverName =
  urlParams.get('name') || localStorage.getItem('serverName') || 'DarksideSMP';

let nodeSettings = JSON.parse(localStorage.getItem('nodeSettings')) || {};

const urlNode = urlParams.get('node');
if (urlNode) {
  nodeSettings[serverIP] = urlNode;
  updateUrl({ server: serverIP, name: serverName, node: urlNode });
} else {
  updateUrl({ server: serverIP, name: serverName, node: getSavedNode() });
}

let serverData;
let nodeData;
let statusTimeout;

updateUrl({ server: serverIP, name: serverName });

// ============================================================
// ELEMENT REFS
// ============================================================

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
const connectToServerNowCheckBox = document.getElementById(
  'connectToServerNowCheckBox',
);
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
const nodeStatusSection = document.getElementById('nodeStatusSection');
const setNodeBtn = document.getElementById('setNodeBtn');

const editOverlay = document.getElementById('editOverlayBackdrop');
const addServerOverlay = document.getElementById('addServerOverlayBackdrop');
const changeNodeOverlay = document.getElementById('changeNodeOverlayBackdrop');
const changeNodeBtn = document.getElementById('changeNodeBtn');
const editBtn = document.getElementById('editBtn');
const addServerBtn = document.getElementById('addServerBtn');
const applyAddServerBtn = document.getElementById('applyAddServerBtn');
const applyEditBtn = document.getElementById('applyEditBtn');
const applyNodeChangeBtn = document.getElementById('applyNodeChangeBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const cancelNodeChangeBtn = document.getElementById('cancelNodeChangeBtn');
const addServerErrorText = document.getElementById('addServerErrorText');
const serverNameInput = document.getElementById('serverNameInput');
const serverIpInput = document.getElementById('serverIpInput');
const addServerNameInput = document.getElementById('addServerNameInput');
const addServerIpInput = document.getElementById('addServerIpInput');
const errorText = document.getElementById('errorText');

const selectBtn = document.getElementById('selectBtn');
const selectOptions = document.getElementById('selectOptions');
const selectedText = document.getElementById('selectedOptionText');

let pendingNodeValue = null;

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', loadServerList);

// ============================================================
// SERVER LIST
// ============================================================

function loadServerList() {
  sidebarLinks.innerHTML = '';

  servers.forEach((server) => {
    const li = document.createElement('li');
    li.innerHTML = `
    <div class="server-button-container">
        <button class="serverBtn" data-ip="${server.ip}" data-name="${server.name}">
          <i data-lucide="server"></i> <span>${server.name}</span>
        </button>
          <button class="serverBtn delete-btn" data-server="${server.ip}"><i data-lucide="Trash2"></i></button>
          </div>
      `;
    sidebarLinks.appendChild(li);

    li.querySelector('.serverBtn').addEventListener('click', () => {
      serverIP = server.ip;
      serverName = server.name;
      const currentNode = getSavedNode();

      updateUrl({ server: serverIP, name: serverName, node: currentNode });
      closeServerList();
      getServerStatus();
    });

    li.querySelector('.delete-btn').addEventListener('click', deleteServer);

    updateIcons();
  });
}

// ============================================================
// FETCH
// ============================================================

async function getServerStatus() {
  serverNameText.textContent = serverName;
  dot.className = 'status-dot checking';
  nodeStatusDot.className = 'status-dot checking';

  try {
    const [serverResult, nodeResult] = await Promise.allSettled([
      fetchServerData(serverIP),
      fetchNodeData(),
    ]);

    serverData =
      serverResult.status === 'fulfilled'
        ? serverResult.value
        : { online: false };

    nodeData =
      nodeResult.status === 'fulfilled' ? nodeResult.value : { online: false };

    console.log('MC Server Data:', serverData);
    console.log('Node Data:', nodeData);

    displayServerStatus();
    displayNodeStatus(getSavedNode());
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

// ============================================================
// NODE SETTINGS — per-server persistence
// ============================================================

function getSavedNode() {
  return nodeSettings[serverIP] ?? 'Ares';
}

function saveNodeForCurrentServer(nodeName) {
  nodeSettings[serverIP] = nodeName;
  localStorage.setItem('nodeSettings', JSON.stringify(nodeSettings));
}

// ============================================================
// DISPLAY — server
// ============================================================

function displayServerStatus() {
  if (
    serverData.motd?.clean ===
      `■ Server Is Paused\nJoin to auto-start ${serverIP}` &&
    serverIP.endsWith('.mcsh.io')
  ) {
    displayMCSHPaused();
    return;
  }

  updateServerIcon();
  updateOnlineStatus();
  updateServerIpDisplay();
  updateServerDetails();
  getOnlinePlayers();

  if (serverData.online) {
    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(getServerStatus, 30000);
  }
}

function updateServerIcon() {
  serverIconImg.src =
    serverData.icon ||
    'https://raw.githubusercontent.com/BananaBrother77/global-assets/refs/heads/main/profile.jpeg';
}

function updateOnlineStatus() {
  dot.className = serverData.online
    ? 'status-dot online'
    : 'status-dot offline';
  statusState.textContent = serverData.online ? 'Online' : 'Offline';
}

function updateServerIpDisplay() {
  serverIpValue.textContent = serverIP;
}

function updateServerDetails() {
  if (!serverData.online) {
    playersOnline.textContent = '0';
    playerMax.textContent = '--';
    serverVersion.textContent = '--';
    motdText.textContent = '--';
    return;
  }

  playersOnline.textContent = serverData.players?.online ?? '0';
  playerMax.textContent = serverData.players?.max ?? 'Unknown';
  serverVersion.textContent = serverData.version?.name_clean
    ? serverData.version.name_clean.replace(/^\D+/, '')
    : 'Unknown';
  motdText.textContent = serverData.motd?.clean || 'Unknown';
}

const headsContainer = document.getElementById('playerHeadsContainer');

function getOnlinePlayers() {
  headsContainer.innerHTML = '';

  if (!serverData?.online) {
    headsContainer.innerHTML =
      '<span class="no-players-text">Server is unreachable or offline.</span>';
    return;
  }

  const players = serverData.players?.list || [];

  if (players.length > 0) {
    players.forEach((player) => {
      const identifier = player.uuid || player.name_raw;

      const tag = document.createElement('div');
      tag.classList.add('player-tag');

      const img = document.createElement('img');
      img.src = `https://minotar.net/avatar/${identifier}/32`;
      img.alt = player.name_raw;
      img.classList.add('player-head-icon');

      const nameSpan = document.createElement('span');
      nameSpan.textContent = player.name_raw;
      nameSpan.classList.add('player-name');

      tag.appendChild(img);
      tag.appendChild(nameSpan);
      headsContainer.appendChild(tag);
    });
  } else if (serverData.players?.online > 0) {
    headsContainer.innerHTML =
      '<span class="no-players-text">Player names are hidden in server settings.</span>';
  } else {
    headsContainer.innerHTML =
      '<span class="no-players-text">No players currently online.</span>';
  }
}

// ============================================================
// DISPLAY — MCSH Server Paused
// ============================================================

function displayMCSHPaused() {
  dot.className = 'status-dot offline';
  statusState.textContent = 'Paused';
  serverIconImg.src = 'assets/img/mcshServerLogo.png';
  headsContainer.innerHTML =
    '<span class="no-players-text">This server is currenlty Paused.</span>';
  playersOnline.textContent = '0';
  playerMax.textContent = '--';
  serverVersion.textContent = '--';
  motdText.textContent = `Join to auto-start ${serverName}`;
  serverIpValue.textContent = serverIP;
}

// ============================================================
// DISPLAY — node
// ============================================================

function displayNodeStatus(targetName) {
  const nodeName = document.getElementById('nodeName');

  if (targetName === 'none') {
    nodeStatusSection.style.display = 'none';
    setNodeBtn.style.display = 'flex';
    return;
  }

  nodeStatusSection.style.display = 'flex';
  setNodeBtn.style.display = 'none';

  if (!nodeData?.regions) {
    nodeStatusDot.className = 'status-dot offline';
    nodeStatusState.textContent = 'Unavailable';
    return;
  }

  for (const region of nodeData.regions) {
    const found = region.nodes.find(
      (n) => n.name.toLowerCase() === targetName.toLowerCase(),
    );
    if (found) {
      nodeName.textContent = found.name;
      updateNodeUI(found);
      return;
    }
  }

  nodeStatusDot.className = 'status-dot offline';
  nodeStatusState.textContent = 'Node not found';
}

function getUsageClass(value, type) {
  if (value == null) return '';
  const val = parseFloat(value);

  if (type === 'cpu')
    return val >= 80 ? 'usage-high' : val >= 60 ? 'usage-medium' : 'usage-low';
  if (type === 'latency')
    return val >= 150 ? 'usage-high' : val >= 60 ? 'usage-medium' : 'usage-low';
  if (type === 'uptime')
    return val < 98.5
      ? 'usage-high'
      : val < 99.9
        ? 'usage-medium'
        : 'usage-low';

  return val >= 85 ? 'usage-high' : val >= 70 ? 'usage-medium' : 'usage-low';
}

function updateNodeUI(node) {
  if (!node) return;

  nodeStatusDot.className = node.online
    ? 'status-dot online'
    : 'status-dot offline';
  nodeStatusState.textContent = node.online ? 'Online' : 'Offline';

  nodeCPU.textContent = node.load != null ? `${node.load}%` : '--';
  nodeMemory.textContent = node.memory != null ? `${node.memory}%` : '--';
  nodeStorage.textContent = node.storage != null ? `${node.storage}%` : '--';
  nodeLatency.textContent = node.latency != null ? `${node.latency} ms` : '--';
  nodeUptime.textContent =
    node.uptimeOverall != null ? `${node.uptimeOverall}` : '--';

  nodeCPU.className = `card-value ${getUsageClass(node.load, 'cpu')}`;
  nodeMemory.className = `card-value ${getUsageClass(node.memory, 'mem')}`;
  nodeStorage.className = `card-value ${getUsageClass(node.storage, 'mem')}`;
  nodeLatency.className = `card-value ${getUsageClass(node.latency, 'latency')}`;
  nodeUptime.className = `card-value ${getUsageClass(node.uptimeOverall, 'uptime')}`;
}

// ============================================================
// COPY IP
// ============================================================

copyIpBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(serverIpValue.textContent);
  copyIpBtn.innerHTML = `<i data-lucide="check"></i> Copied`;
  updateIcons();
  setTimeout(() => {
    copyIpBtn.innerHTML = `<i data-lucide="copy"></i> Copy IP`;
    updateIcons();
  }, 800);
});

// ============================================================
// EDIT SERVER OVERLAY
// ============================================================

editBtn.addEventListener('click', () => showOverlay(editOverlay));
addServerBtn.addEventListener('click', () => showOverlay(addServerOverlay));

cancelEditBtn.addEventListener('click', () => closeOverlay(editOverlay));
cancelAddServerBtn.addEventListener('click', () =>
  closeOverlay(addServerOverlay),
);

applyEditBtn.addEventListener('click', applyServerChanges);
applyAddServerBtn.addEventListener('click', addServer);

serverNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyServerChanges();
});
serverIpInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyServerChanges();
});

function showOverlay(target) {
  target.classList.add('show');

  if (target === editOverlay) {
    serverNameInput.value = serverName;
    serverIpInput.value = serverIP;
    errorText.textContent = '';
  } else if (target === addServerOverlay) {
    closeServerList();
    addServerNameInput.value = '';
    addServerIpInput.value = '';
    addServerErrorText.textContent = '';
  }
}

function closeOverlay(target) {
  target.classList.remove('show');
}

function addServer() {
  const name = addServerNameInput.value.trim();
  const ip = addServerIpInput.value.trim();

  if (!name || !ip) {
    addServerErrorText.textContent = 'Please fill out all fields.';
    return;
  }

  if (addToListCheckbox.checked && !servers.some((s) => s.ip === ip)) {
    servers.push({ name: name, ip: ip });
    localStorage.setItem('servers', JSON.stringify(servers));
    loadServerList();
  }

  serverIP = ip;
  serverName = name;

  addServerErrorText.textContent = '';
  closeOverlay(addServerOverlay);
  updateUrl({ server: serverIP, name: serverName });

  if (connectToServerNowCheckBox.checked) getServerStatus();
}

function applyServerChanges() {
  const newName = serverNameInput.value.trim();
  const newIP = serverIpInput.value.trim();

  if (!newName || !newIP) {
    errorText.textContent = 'Please fill out all fields.';
    return;
  }

  const foundServer = servers.find(
    (server) =>
      server.ip === serverIpValue.textContent.trim() ||
      server.name === serverNameText.textContent.trim(),
  );

  if (!foundServer) return;

  foundServer.ip = newIP;
  foundServer.name = newName;
  localStorage.setItem('servers', JSON.stringify(servers));

  serverIP = newIP;
  serverName = newName;

  errorText.textContent = '';
  closeOverlay(editOverlay);
  updateUrl({ server: serverIP, name: serverName });
  loadServerList();
  getServerStatus();
}

// ============================================================
// CHANGE NODE OVERLAY
// ============================================================

changeNodeBtn.addEventListener('click', openChangeNodeOverlay);
setNodeBtn.addEventListener('click', openChangeNodeOverlay);

function openChangeNodeOverlay() {
  // Pre-select the dropdown to the currently saved node for this server
  const current = getSavedNode();
  const match = [...selectOptions.querySelectorAll('li[data-value]')].find(
    (li) =>
      li.getAttribute('data-value').toLowerCase() === current.toLowerCase(),
  );

  selectedText.textContent = match ? match.textContent : 'Choose node...';
  pendingNodeValue = current === 'none' ? 'none' : match ? current : null;

  showOverlay(changeNodeOverlay);
}

cancelNodeChangeBtn.addEventListener('click', () =>
  closeOverlay(changeNodeOverlay),
);

selectBtn.addEventListener('click', () => {
  selectOptions.classList.toggle('show-menu');
});

selectOptions.querySelectorAll('li[data-value]').forEach((option) => {
  option.addEventListener('click', () => {
    pendingNodeValue = option.getAttribute('data-value');
    selectedText.textContent = option.textContent;
    selectOptions.classList.remove('show-menu');
  });
});

applyNodeChangeBtn.addEventListener('click', () => {
  if (pendingNodeValue !== null) {
    saveNodeForCurrentServer(pendingNodeValue);
    displayNodeStatus(pendingNodeValue);

    updateUrl({ server: serverIP, name: serverName, node: pendingNodeValue });
  }
  closeOverlay(changeNodeOverlay);
});

// ============================================================
// SIDEBAR
// ============================================================

serverListBtn.addEventListener('click', openServerList);
closeServerListBtn.addEventListener('click', closeServerList);

darksidesmpBtn.addEventListener('click', () => {
  serverIP = 'darksidesmp.mcsh.io';
  serverName = 'DarksideSMP';

  updateUrl({ server: serverIP, name: serverName });
  closeServerList();
  getServerStatus();
});

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

function deleteServer(e) {
  const ipToDelete = e.target.closest('.delete-btn').dataset.server;

  servers = servers.filter((server) => server.ip !== ipToDelete);
  localStorage.setItem('servers', JSON.stringify(servers));

  loadServerList();
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeOverlay(editOverlay);
    closeServerList();
  }

  if (!editOverlay.classList.contains('show')) {
    if (e.key === 's') openServerList();
  }
});

// ============================================================
// URL HELPERS
// ============================================================

function updateUrl(params) {
  const url = new URL(window.location);
  Object.entries(params).forEach(([key, val]) =>
    url.searchParams.set(key, val),
  );
  window.history.pushState({}, '', url);
}

// ============================================================
// UPDATE ICONS (Lucide)
// ============================================================

function updateIcons() {
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================
// BOOT
// ============================================================

getServerStatus();
