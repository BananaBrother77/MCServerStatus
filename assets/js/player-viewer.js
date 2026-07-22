import { fetchPlayerUUID, fetchPlayerSkin, getSkinModel } from './api.js';
import {
  renderSkin,
  disposeSkinViewer,
  toggleAnimation,
} from './skin-render.js';
import { copyToClipboard, updateIcons } from './meow.js';

const RECENT_MAX = 25;
let recentPlayers = JSON.parse(localStorage.getItem('recentPlayers')) || [];

const els = {
  sidebar: document.getElementById('pvSidebar'),
  overlay: document.getElementById('pvSidebarOverlay'),
  toggleBtn: document.getElementById('pvSidebarToggle'),
  closeBtn: document.getElementById('closePvSidebar'),

  searchInput: document.getElementById('pvSearchInput'),
  searchBtn: document.getElementById('pvSearchBtn'),
  mainSearch: document.getElementById('pvMainSearch'),
  mainSearchBtn: document.getElementById('pvMainSearchBtn'),

  playerList: document.getElementById('pvPlayerList'),
  clearRecent: document.getElementById('pvClearRecent'),
  clearFavs: document.getElementById('pvClearFavs'),

  playerCard: document.getElementById('pvPlayerCard'),
  skinContainer: document.getElementById('pvSkinContainer'),

  nameText: document.getElementById('pvNameText'),
  uuidText: document.getElementById('pvUUIDText'),
  nameMCLink: document.getElementById('pvNameMCLink'),

  copyNameBtn: document.getElementById('pvCopyNameBtn'),
  copyUUIDBtn: document.getElementById('pvCopyUUIDBtn'),
  downloadSkinBtn: document.getElementById('pvDownloadSkinBtn'),
  animationBtn: document.getElementById('pvAnimationBtn'),

  shareBtn: document.getElementById('pvShareBtn'),
};

document.addEventListener('DOMContentLoaded', init);

function init() {
  renderSidebarList();
  showLoading();

  const urlPlayer = new URLSearchParams(window.location.search).get('player');
  const playerName = urlPlayer || 'BananaBrother77';
  els.searchInput.value = playerName;
  els.mainSearch.value = playerName;
  searchPlayer(playerName);
}

function saveRecent() {
  localStorage.setItem('recentPlayers', JSON.stringify(recentPlayers));
}

function renderSidebarList() {
  els.playerList.innerHTML = '';

  const sorted = [...recentPlayers].sort((playerA, playerB) => {
    if (playerA.favourite && !playerB.favourite) return -1;
    if (!playerA.favourite && playerB.favourite) return 1;
    return playerB.timestamp - playerA.timestamp;
  });

  if (sorted.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-list';
    li.style.cssText = 'color: var(--text-muted); font-style: italic; text-align: center; padding: 20px; opacity: 0.7;';
    li.textContent = 'No recent players';
    els.playerList.appendChild(li);
    return;
  }

  sorted.forEach((player) => {
    const li = document.createElement('li');

    const container = document.createElement('div');
    container.className = 'server-button-container';

    const mainBtn = document.createElement('button');
    mainBtn.className = 'pv-item pv-player-btn';

    const img = document.createElement('img');
    img.src = `https://mc-heads.net/avatar/${player.name}/32`;
    img.alt = player.name;
    img.className = 'pv-list-head';
    img.loading = 'lazy';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'pv-list-name';
    nameSpan.textContent = player.name;

    mainBtn.appendChild(img);
    mainBtn.appendChild(nameSpan);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const favBtn = document.createElement('button');
    favBtn.className = 'pv-item favourite-btn';
    favBtn.dataset.player = player.name;
    favBtn.innerHTML = player.favourite
      ? '<i data-lucide="star" class="filled" width="24" height="24"></i>'
      : '<i data-lucide="star" width="24" height="24"></i>';

    actions.appendChild(favBtn);

    container.appendChild(mainBtn);
    container.appendChild(actions);
    li.appendChild(container);

    mainBtn.addEventListener('click', () => {
      els.searchInput.value = player.name;
      searchPlayer(player.name);
    });

    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      player.favourite = !player.favourite;
      saveRecent();
      renderSidebarList();
    });

    els.playerList.appendChild(li);
  });

  updateIcons();
}

async function searchPlayer(playerName) {
  addToRecent(playerName);
  renderSidebarList();
  closeSidebar();
  showLoading();

  try {
    const uuidData = await fetchPlayerUUID(playerName);
    const player = uuidData.data.player;
    const uuid = player.id;
    const capeUrl = player.cape_texture || null;
    const skinModel = getSkinModel(player);

    const recentEntry = recentPlayers.find(
      (entry) => entry.name.toLowerCase() === playerName.toLowerCase(),
    );
    if (recentEntry) {
      recentEntry.uuid = uuid;
      saveRecent();
    }

    displayPlayerInfo(playerName, uuid, capeUrl, skinModel);

    const url = new URL(window.location);
    url.searchParams.set('player', playerName);
    window.history.pushState({}, '', url);
  } catch (error) {
    console.error('Player not found:', error);
    showError();
  }
}

function showLoading() {
  els.nameText.textContent = 'Loading...';
  els.uuidText.textContent = '--';
}

function showError() {
  els.nameText.textContent = 'Player not found';
  els.uuidText.textContent = 'Try a different name';
}

async function displayPlayerInfo(playerName, uuid, capeUrl, skinModel) {

  els.nameText.textContent = playerName;
  els.uuidText.textContent = uuid;
  els.nameMCLink.href = `https://namemc.com/profile/${playerName}`;

  await renderSkin(
    els.skinContainer,
    `https://mc-heads.net/skin/${playerName}`,
    capeUrl,
    skinModel,
  );

  updateIcons();
}

function addToRecent(playerName) {
  const existing = recentPlayers.find(
    (entry) => entry.name.toLowerCase() === playerName.toLowerCase(),
  );
  if (existing) {
    existing.timestamp = Date.now();
  } else {
    recentPlayers.unshift({
      name: playerName,
      uuid: '',
      timestamp: Date.now(),
      favourite: false,
    });
    if (recentPlayers.length > RECENT_MAX) recentPlayers.pop();
  }
  saveRecent();
}

// ============================================================
// SIDEBAR
// ============================================================

els.toggleBtn.addEventListener('click', () => {
  els.sidebar.classList.toggle('active');
  els.overlay.classList.toggle('active');
});

els.closeBtn.addEventListener('click', closeSidebar);
els.overlay.addEventListener('click', closeSidebar);

function closeSidebar() {
  els.sidebar.classList.remove('active');
  els.overlay.classList.remove('active');
}

// ============================================================
// SEARCH
// ============================================================

els.searchBtn.addEventListener('click', () => {
  const name = els.searchInput.value.trim();
  if (name) {
    els.mainSearch.value = name;
    searchPlayer(name);
  }
});

els.searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const name = els.searchInput.value.trim();
    if (name) {
      els.mainSearch.value = name;
      searchPlayer(name);
    }
  }
});

els.mainSearchBtn.addEventListener('click', () => {
  const name = els.mainSearch.value.trim();
  if (name) {
    els.searchInput.value = name;
    searchPlayer(name);
  }
});

els.mainSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const name = els.mainSearch.value.trim();
    if (name) {
      els.searchInput.value = name;
      searchPlayer(name);
    }
  }
});

// ============================================================
// CLEAR RECENT
// ============================================================

els.clearRecent.addEventListener('click', () => {
  recentPlayers = recentPlayers.filter((player) => player.favourite);
  saveRecent();
  renderSidebarList();
});

els.clearFavs.addEventListener('click', () => {
  recentPlayers = recentPlayers.map((player) => ({ ...player, favourite: false }));
  saveRecent();
  renderSidebarList();
});

// ============================================================
// COPY
// ============================================================

els.copyNameBtn.addEventListener('click', () => {
  copyToClipboard(els.nameText.textContent);
  els.copyNameBtn.innerHTML = `<i data-lucide="check"></i>`;
  updateIcons();
  setTimeout(() => {
    els.copyNameBtn.innerHTML = `<i data-lucide="copy"></i>`;
    updateIcons();
  }, 800);
});

els.copyUUIDBtn.addEventListener('click', () => {
  copyToClipboard(els.uuidText.textContent);
  els.copyUUIDBtn.innerHTML = `<i data-lucide="check"></i>`;
  updateIcons();
  setTimeout(() => {
    els.copyUUIDBtn.innerHTML = `<i data-lucide="copy"></i>`;
    updateIcons();
  }, 800);
});

// ============================================================
// DOWNLOAD SKIN
// ============================================================

els.downloadSkinBtn.addEventListener('click', async () => {
  const playerName = els.nameText.textContent;
  const blobUrl = await fetchPlayerSkin(playerName);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${playerName}_skin.png`;
  a.click();

  URL.revokeObjectURL(blobUrl);
});

// ============================================================
// ANIMATION TOGGLE
// ============================================================

els.animationBtn.addEventListener('click', () => {
  const isPlaying = toggleAnimation();
  els.animationBtn.innerHTML = isPlaying
    ? `<i data-lucide="pause"></i>`
    : `<i data-lucide="play"></i>`;
  updateIcons();
});

// ============================================================
// SHARE
// ============================================================

els.shareBtn.addEventListener('click', shareLink);

function shareLink() {
  if (navigator.share) {
    navigator.share({
      title: els.nameText.textContent || 'Player Viewer',
      text: `Check out this Minecraft player!`,
      url: window.location.href,
    });
  } else {
    copyToClipboard(window.location.href);
  }
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'Escape':
      closeSidebar();
      break;

    case 's':
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        shareLink();
        break;
      }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') break;
      els.sidebar.classList.toggle('active');
      els.overlay.classList.toggle('active');
      break;
  }
});

// ============================================================
// CLEANUP
// ============================================================

window.addEventListener('beforeunload', () => {
  disposeSkinViewer();
});
