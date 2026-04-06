const serverIP = 'play.cubecraft.net';
let serverData;

const dot = document.getElementById('statusDot');
const statusState = document.getElementById('statusState');
const serverIconImg = document.getElementById('serverIconImg');
const playersOnline = document.getElementById('playersOnline');
const playerMax = document.getElementById('playersMax');
const serverVersion = document.getElementById('serverVersion');
const motdText = document.getElementById('motdText');
const copyIpBtn = document.getElementById('copyIpBtn');

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
  }
}

function displayServerStatus() {
  if (serverData.icon) {
    serverIconImg.src = serverData.icon;
  } else {
    serverIconImg.src =
      'https://raw.githubusercontent.com/BananaBrother77/global-assets/refs/heads/main/profile.jpeg';
  }

  if (serverData.online) {
    dot.className = 'status-dot online';
    statusState.textContent = 'Online';
  } else {
    dot.className = 'status-dot offline';
    statusState.textContent = 'Offline';
  }

  if (serverData.players.online > 0) {
    playersOnline.textContent = serverData.players.online;
  } else {
    playersOnline.textContent = '0';
  }

  if (serverData.players.max > 0) {
    playerMax.textContent = serverData.players.max;
  } else {
    playerMax.textContent = 'Unknown';
  }

  if (serverData.version) {
    serverVersion.textContent = serverData.version.replace(/^\D+/, '');
  } else {
    serverVersion.textContent = 'Unknown';
  }

  if (serverData.motd.clean.length > 0) {
    motdText.textContent = serverData.motd.clean.join(' ');
  } else {
    motdText.textContent = 'A Minecraft Server';
  }

  setTimeout(getServerStatus, 10000);
}

copyIpBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(serverIP);
  copyIpBtn.textContent = 'Copied';
  setTimeout(() => {
    copyIpBtn.textContent = 'Copy IP';
  }, 800);
});

getServerStatus();
