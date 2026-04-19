// api.js — let failures throw so allSettled can catch them individually
export async function fetchServerData(serverIP) {
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${serverIP}`);
  if (!res.ok) throw new Error('MC API failed');
  return res.json();
}

export async function fetchNodeData() {
  const res = await fetch('https://api.maximerix.dev/mcsh/outages/data');
  if (!res.ok) throw new Error('Node API failed');
  return res.json();
}
