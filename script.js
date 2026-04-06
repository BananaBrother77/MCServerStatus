// Server variables
const serverIP = 'donutsmp.net';
let serverData;

// Elements
const dot = document.getElementById('statusDot');
const statusState = document.getElementById('statusState');
const serverIconImg = document.getElementById('serverIconImg');
const playersOnline = document.getElementById('playersOnline');
const playerMax = document.getElementById('playersMax');
const serverIpValue = document.getElementById('serverIpValue');
const serverVersion = document.getElementById('serverVersion');
const motdText = document.getElementById('motdText');
const copyIpBtn = document.getElementById('copyIpBtn');

// Fetch server information using mcsrvstat.us API
async function getServerStatus() {
  dot.className = 'status-dot checking';

  try {
    const response = await fetch(`https://api.mcsrvstat.us/3/${serverIP}`);

    if (!response.ok) {
      throw new Error('Could not fetch resource');
    }

    serverData = await response.json();
    console.log(serverData);

    displayServerStatus();
  } catch (error) {
    console.error(error);
    // Ensure the UI updates to offline if the fetch fails
    serverData = { online: false };
    displayServerStatus();
  }
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

  // Display player count
  playersOnline.textContent = serverData.players?.online ?? '0';
  playerMax.textContent = serverData.players?.max ?? 'Unknown';

  // Display server IP
  if (serverIP === '191.96.231.2:11026')
    serverIpValue.textContent = 'darksidesmp.mcsh.io';
  else {
    serverIpValue.textContent = serverIP;
  }

  // Display server version
  serverVersion.textContent = serverData.version
    ? serverData.version.replace(/^\D+/, '')
    : 'Unknown';

  // Display MOTD
  motdText.textContent =
    serverData.motd?.clean?.join(' ') || 'A Minecraft Server';

  // Populate the player heads list
  getOnlinePlayers();

  // Loop the check every 10 seconds
  setTimeout(getServerStatus, 10000);
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
  navigator.clipboard.writeText(serverIP);
  copyIpBtn.textContent = 'Copied';
  setTimeout(() => {
    copyIpBtn.textContent = 'Copy IP';
  }, 800);
});

getServerStatus();
