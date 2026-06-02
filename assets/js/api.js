// api.js — let failures throw so allSettled can catch them individually

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

export async function fetchServerData(serverIP) {
  return fetchWithTimeout(`https://api.mcstatus.io/v2/status/java/${serverIP}`);
}

export async function fetchBedrockServerData(serverIP) {
  return fetchWithTimeout(`https://api.mcstatus.io/v2/status/bedrock/${serverIP}`);
}

export async function fetchNodeData() {
  return fetchWithTimeout('https://api.maximerix.dev/mcsh/outages/data');
}

export async function fetchPlayerUUID(playerName) {
  return fetchWithTimeout(`https://playerdb.co/api/player/minecraft/${playerName}`);
}

export async function fetchPlayerSkin(playerName) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`https://minotar.net/skin/${playerName}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error('Skin API failed');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } finally {
    clearTimeout(id);
  }
}