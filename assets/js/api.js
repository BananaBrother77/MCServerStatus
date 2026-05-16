// api.js — let failures throw so allSettled can catch them individually
export async function fetchServerData(serverIP) {
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${serverIP}`);
  if (!res.ok) throw new Error('MC API failed');
  return res.json();
}

export async function fetchBedrockServerData(serverIP) {
  const res = await fetch(`https://api.mcstatus.io/v2/status/bedrock/${serverIP}`);
  if (!res.ok) throw new Error('MC API failed');
  return res.json();
}

export async function fetchNodeData() {
  const res = await fetch('https://api.maximerix.dev/mcsh/outages/data');
  if (!res.ok) throw new Error('Node API failed');
  return res.json();
}

export async function fetchPlayerUUID(playerName) {
  const res = await fetch(
    `https://playerdb.co/api/player/minecraft/${playerName}`,
  );
  if (!res.ok) throw new Error('UUID API failed');
  return res.json();
}

export async function fetchPlayerSkin(playerName) {
  const res = await fetch(
    `https://minotar.net/skin/${playerName}`,
  );
  if (!res.ok) throw new Error('Skin API failed');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}