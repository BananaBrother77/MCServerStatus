// Fetch Minecraft server data
export async function fetchServerData(serverIP) {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${serverIP}`);
    if (!res.ok) throw new Error('MC API failed');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('MC API Error:', err);
    return { online: false };
  }
}

// Fetch node status data
export async function fetchNodeData() {
  try {
    const res = await fetch('https://api.maximerix.dev/mcsh/outages/data');
    if (!res.ok) throw new Error('Node API failed');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Node API Error:', err);
    return { online: false };
  }
}