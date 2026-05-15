import {
  fetchServerData,
  fetchNodeData,
  fetchPlayerUUID,
  fetchPlayerSkin,
} from './api.js';

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

const serverEls = {
  dot: document.getElementById('statusDot'),
  state: document.getElementById('statusState'),
  name: document.getElementById('serverName'),
  icon: document.getElementById('serverIconImg'),
  playersOnline: document.getElementById('playersOnline'),
  playersMax: document.getElementById('playersMax'),
  ip: document.getElementById('serverIpValue'),
  version: document.getElementById('serverVersion'),
  motd: document.getElementById('motdText'),
};

const nodeEls = {
  dot: document.getElementById('nodeStatusDot'),
  state: document.getElementById('nodeStatusState'),
  cpu: document.getElementById('nodeCPU'),
  memory: document.getElementById('nodeMemory'),
  storage: document.getElementById('nodeStorage'),
  latency: document.getElementById('nodeLatency'),
  uptime: document.getElementById('nodeUptime'),
  section: document.getElementById('nodeStatusSection'),
};

const sidebarEls = {
  sidebar: document.getElementById('sidebar'),
  overlay: document.getElementById('overlay'),
  links: document.querySelector('.sidebar-links'),
  toggleBtn: document.querySelector('.serverList'),
  serverListBtn: document.getElementById('serverListBtn'),
  closeBtn: document.getElementById('closeServerListBtn'),
};

const overlayEls = {
  edit: document.getElementById('editOverlayBackdrop'),
  addServer: document.getElementById('addServerOverlayBackdrop'),
  changeNode: document.getElementById('changeNodeOverlayBackdrop'),
  playerInfo: document.getElementById('playerInfoOverlayBackdrop'),
};

const playerInfoEls = {
  name: document.getElementById('playerInfoNameText'),
  uuid: document.getElementById('playerInfoUUIDText'),
  avatar: document.getElementById('playerInfoAvatar'),
  closeBtn: document.getElementById('closePlayerInfoBtn'),
  copyNameBtn: document.getElementById('copyPlayerNameBtn'),
  copyUUIDBtn: document.getElementById('copyPlayerUUIDBtn'),
  downloadSkinBtn: document.getElementById('downloadSkinBtn'),
  nameMCBtn: document.getElementById('nameMCBtn'),
  playerInfoSearchInput: document.getElementById('playerInfoSearchInput'),
  playerInfoSearchBtn: document.getElementById('playerInfoSearchBtn'),
  playerInfoError: document.getElementById('playerInfoError'),
};

const headsContainer = document.getElementById('playerHeadsContainer');
const copyIpBtn = document.getElementById('copyIpBtn');
const editBtn = document.getElementById('editBtn');
const addServerBtn = document.getElementById('addServerBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const cancelAddServerBtn = document.getElementById('cancelAddServerBtn');
const applyEditBtn = document.getElementById('applyEditBtn');
const applyAddServerBtn = document.getElementById('applyAddServerBtn');
const serverNameInput = document.getElementById('serverNameInput');
const serverIpInput = document.getElementById('serverIpInput');
const addServerNameInput = document.getElementById('addServerNameInput');
const addServerIpInput = document.getElementById('addServerIpInput');
const errorText = document.getElementById('errorText');
const addServerErrorText = document.getElementById('addServerErrorText');
const addToListCheckbox = document.getElementById('addToServerListCheckBox');
const connectToServerNowCheckBox = document.getElementById(
  'connectToServerNowCheckBox',
);
const changeNodeBtn = document.getElementById('changeNodeBtn');
const setNodeBtn = document.getElementById('setNodeBtn');
const selectOptions = document.getElementById('selectOptions');
const selectedText = document.getElementById('selectedOptionText');
const cancelNodeChangeBtn = document.getElementById('cancelNodeChangeBtn');
const selectBtn = document.getElementById('selectBtn');
const applyNodeChangeBtn = document.getElementById('applyNodeChangeBtn');
const darksidesmpBtn = document.getElementById('darksidesmpBtn');
const playerLookupBtn = document.getElementById('playerLookupBtn');

let pendingNodeValue = null;

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', loadServerList);

// ============================================================
// SERVER LIST
// ============================================================

function loadServerList() {
  sidebarEls.links.innerHTML = '';

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
    sidebarEls.links.appendChild(li);

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
  serverEls.name.textContent = serverName;
  serverEls.dot.className = 'status-dot checking';
  nodeEls.dot.className = 'status-dot checking';

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
  serverEls.icon.src =
    serverData.icon ||
    'https://raw.githubusercontent.com/BananaBrother77/global-assets/refs/heads/main/profile.jpeg';
}

function updateOnlineStatus() {
  serverEls.dot.className = serverData.online
    ? 'status-dot online'
    : 'status-dot offline';
  serverEls.state.textContent = serverData.online ? 'Online' : 'Offline';
}

function updateServerIpDisplay() {
  serverEls.ip.textContent = serverIP;
}

function updateServerDetails() {
  if (!serverData.online) {
    serverEls.playersOnline.textContent = '0';
    serverEls.playersMax.textContent = '--';
    serverEls.version.textContent = '--';
    serverEls.motd.textContent = '--';
    return;
  }

  serverEls.playersOnline.textContent = serverData.players?.online ?? '0';
  serverEls.playersMax.textContent = serverData.players?.max ?? 'Unknown';
  serverEls.version.textContent = serverData.version?.name_clean
    ? serverData.version.name_clean.replace(/^\D+/, '')
    : 'Unknown';
  serverEls.motd.textContent = serverData.motd?.clean || 'Unknown';
}

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

      tag.addEventListener('click', async () => {
        if (player.name_raw.startsWith('.')) {
          alert(
            'Bedrock Players are currently not supported for detailed info.',
          );
          return;
        }

        showOverlay(overlayEls.playerInfo);

        try {
          const uuidData = await fetchPlayerUUID(player.name_raw);
          const uuid = uuidData.data.player.id;
          console.log(`Player UUID of Player ${player.name_raw}: ${uuid}`);

          displayPlayerInfo(player.name_raw, uuid);
        } catch (error) {
          console.error('Error fetching player data:', error);
        }
      });
    });
  } else if (serverData.players?.online > 0) {
    headsContainer.innerHTML =
      '<span class="no-players-text">Player names are hidden in server settings.</span>';
  } else {
    headsContainer.innerHTML =
      '<span class="no-players-text">No players currently online.</span>';
  }
}

playerLookupBtn.addEventListener('click', () => {
  showOverlay(overlayEls.playerInfo);
});

function displayPlayerInfo(playerName, playerUUID) {
  // const rawUUID = playerUUID.replaceAll('-', '');

  nameMCBtn.href = `https://namemc.com/profile/${playerName}`;

  playerInfoEls.name.textContent = playerName;
  playerInfoEls.uuid.textContent = playerUUID;
  playerInfoEls.avatar.src = `https://vzge.me/full/212/${playerUUID}?t=${Date.now()}`;
}

playerInfoEls.playerInfoSearchBtn.addEventListener('click', async () => {
  const playerName = playerInfoEls.playerInfoSearchInput.value.trim();
  if (!playerName) return;

  playerInfoEls.playerInfoError.textContent = '';

  try {
    const uuidData = await fetchPlayerUUID(playerName);
    const uuid = uuidData.data.player.id;
    console.log(`Player UUID of Player ${playerName}: ${uuid}`);

    displayPlayerInfo(playerName, uuid);
  } catch (error) {
    console.error('Error fetching player data:', error);
    playerInfoEls.playerInfoError.textContent = 'Player not found.';
  }
});

playerInfoEls.playerInfoSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    playerInfoEls.playerInfoSearchBtn.click();
  }
});

// ============================================================
// SEARCH PLAYER INFO
// ============================================================

playerInfoEls.playerInfoSearchBtn.addEventListener('click', async () => {});

// ============================================================
// DISPLAY — MCSH Server Paused
// ============================================================

function displayMCSHPaused() {
  serverEls.dot.className = 'status-dot offline';
  serverEls.state.textContent = 'Paused';
  serverEls.icon.src = 'assets/img/mcshServerLogo.png';
  headsContainer.innerHTML =
    '<span class="no-players-text">This server is currenlty Paused.</span>';
  serverEls.playersOnline.textContent = '0';
  serverEls.playersMax.textContent = '--';
  serverEls.version.textContent = '--';
  serverEls.motd.textContent = `Join to auto-start ${serverName}`;
  serverEls.ip.textContent = serverIP;
}

// ============================================================
// DISPLAY — node
// ============================================================

function displayNodeStatus(targetName) {
  const nodeName = document.getElementById('nodeName');

  if (targetName === 'none') {
    nodeEls.section.style.display = 'none';
    setNodeBtn.style.display = 'flex';
    return;
  }

  nodeEls.section.style.display = 'flex';
  setNodeBtn.style.display = 'none';

  if (!nodeData?.regions) {
    nodeEls.dot.className = 'status-dot offline';
    nodeEls.state.textContent = 'Unavailable';
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

  nodeEls.dot.className = 'status-dot offline';
  nodeEls.state.textContent = 'Node not found';
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

  nodeEls.dot.className = node.online
    ? 'status-dot online'
    : 'status-dot offline';
  nodeEls.state.textContent = node.online ? 'Online' : 'Offline';

  nodeEls.cpu.textContent = node.load != null ? `${node.load}%` : '--';
  nodeEls.memory.textContent = node.memory != null ? `${node.memory}%` : '--';
  nodeEls.storage.textContent =
    node.storage != null ? `${node.storage}%` : '--';
  nodeEls.latency.textContent =
    node.latency != null ? `${node.latency} ms` : '--';
  nodeEls.uptime.textContent =
    node.uptimeOverall != null ? `${node.uptimeOverall}` : '--';

  nodeEls.cpu.className = `card-value ${getUsageClass(node.load, 'cpu')}`;
  nodeEls.memory.className = `card-value ${getUsageClass(node.memory, 'mem')}`;
  nodeEls.storage.className = `card-value ${getUsageClass(node.storage, 'mem')}`;
  nodeEls.latency.className = `card-value ${getUsageClass(node.latency, 'latency')}`;
  nodeEls.uptime.className = `card-value ${getUsageClass(node.uptimeOverall, 'uptime')}`;
}

// ============================================================
// COPY IP
// ============================================================

copyIpBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(serverEls.ip.textContent);
  copyIpBtn.innerHTML = `<i data-lucide="check"></i> Copied`;
  updateIcons();
  setTimeout(() => {
    copyIpBtn.innerHTML = `<i data-lucide="copy"></i> Copy IP`;
    updateIcons();
  }, 800);
});

// ============================================================
// COPY PLAYER INFO
// ============================================================

copyNameBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(playerInfoEls.name.textContent);
  copyNameBtn.innerHTML = `<i data-lucide="check"></i>`;
  updateIcons();
  setTimeout(() => {
    copyNameBtn.innerHTML = `<i data-lucide="copy"></i>`;
    updateIcons();
  }, 800);
});

copyUUIDBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(playerInfoEls.uuid.textContent);
  copyUUIDBtn.innerHTML = `<i data-lucide="check"></i>`;
  updateIcons();
  setTimeout(() => {
    copyUUIDBtn.innerHTML = `<i data-lucide="copy"></i>`;
    updateIcons();
  }, 800);
});

// ============================================================
// DOWNLOAD PLAYER SKIN
// ============================================================

playerInfoEls.downloadSkinBtn.addEventListener('click', async () => {
  const playerName = playerInfoEls.name.textContent;
  const blobUrl = await fetchPlayerSkin(playerName);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${playerName}_skin.png`;
  a.click();

  URL.revokeObjectURL(blobUrl);
});

// ============================================================
// EDIT SERVER OVERLAY
// ============================================================

editBtn.addEventListener('click', () => showOverlay(overlayEls.edit));
addServerBtn.addEventListener('click', () => showOverlay(overlayEls.addServer));

cancelEditBtn.addEventListener('click', () => closeOverlay(overlayEls.edit));
cancelAddServerBtn.addEventListener('click', () =>
  closeOverlay(overlayEls.addServer),
);

applyEditBtn.addEventListener('click', applyServerChanges);
applyAddServerBtn.addEventListener('click', addServer);

serverNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyServerChanges();
});
serverIpInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') applyServerChanges();
});
addServerNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addServer();
});
addServerIpInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addServer();
});

function showOverlay(target) {
  target.classList.add('show');

  if (target === overlayEls.edit) {
    serverNameInput.value = serverName;
    serverIpInput.value = serverIP;
    errorText.textContent = '';
  } else if (target === overlayEls.addServer) {
    closeServerList();
    addServerNameInput.value = '';
    addServerIpInput.value = '';
    addServerErrorText.textContent = '';
  }
}

function closeOverlay(target) {
  target.classList.remove('show');

  if (target === overlayEls.playerInfo) {
    playerInfoEls.playerInfoSearchInput.value = '';
  }
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
  closeOverlay(overlayEls.addServer);
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
      server.ip === serverEls.ip.textContent.trim() ||
      server.name === serverEls.name.textContent.trim(),
  );

  if (!foundServer) return;

  foundServer.ip = newIP;
  foundServer.name = newName;
  localStorage.setItem('servers', JSON.stringify(servers));

  serverIP = newIP;
  serverName = newName;

  errorText.textContent = '';
  closeOverlay(overlayEls.edit);
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

  showOverlay(overlayEls.changeNode);
}

cancelNodeChangeBtn.addEventListener('click', () =>
  closeOverlay(overlayEls.changeNode),
);

playerInfoEls.closeBtn.addEventListener('click', () =>
  closeOverlay(overlayEls.playerInfo),
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
  closeOverlay(overlayEls.changeNode);
});

// ============================================================
// SIDEBAR
// ============================================================

sidebarEls.toggleBtn.addEventListener('click', openServerList);
sidebarEls.closeBtn.addEventListener('click', closeServerList);

darksidesmpBtn.addEventListener('click', () => {
  serverIP = 'darksidesmp.mcsh.io';
  serverName = 'DarksideSMP';

  updateUrl({ server: serverIP, name: serverName });
  closeServerList();
  getServerStatus();
});

function openServerList() {
  if (sidebarEls.sidebar.classList.contains('active')) {
    closeServerList();
    return;
  }
  sidebarEls.sidebar.classList.add('active');
  sidebarEls.overlay.classList.add('active');
}

function closeServerList() {
  sidebarEls.sidebar.classList.remove('active');
  sidebarEls.overlay.classList.remove('active');
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
    closeOverlay(overlayEls.edit);
    closeOverlay(overlayEls.addServer);
    closeOverlay(overlayEls.changeNode);
    closeOverlay(overlayEls.playerInfo);
    closeServerList();
  }

  if (
    !overlayEls.edit.classList.contains('show') &&
    !overlayEls.addServer.classList.contains('show') &&
    !playerInfoEls.playerInfoSearchInput.contains(document.activeElement)
  ) {
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
