import { SkinViewer, WalkingAnimation } from 'skinview3d';

const skinContainer = document.getElementById('skinContainer');

let viewer;

export async function renderSkin(skinUrl, capeUrl) {
  if (viewer) viewer.dispose();

  viewer = new SkinViewer({
    canvas: skinContainer,
    width: 200,
    height: 300,
    skin: skinUrl,
  });

  if (capeUrl) {
    await viewer.loadCape(capeUrl).catch(() => {});
  }

  viewer.animation = new WalkingAnimation();
}

export function disposeSkinViewer() {
  if (viewer) {
    viewer.dispose();
    viewer = null;
  }
}
