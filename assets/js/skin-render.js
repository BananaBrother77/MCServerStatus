import { SkinViewer, WalkingAnimation } from 'skinview3d';

let viewer;

export async function renderSkin(canvas, skinUrl, capeUrl) {
  if (!canvas) return;
  if (viewer) viewer.dispose();

  viewer = new SkinViewer({
    canvas,
    width: 200,
    height: 300,
    skin: skinUrl,
  });

  if (capeUrl) {
    await viewer.loadCape(capeUrl).catch(() => {});
  }

  viewer.animation = new WalkingAnimation();
  viewer.animation.speed = 0.6;
  viewer.animation.headBobbing = false;
}

export function disposeSkinViewer() {
  if (viewer) {
    viewer.dispose();
    viewer = null;
  }
}

export function toggleAnimation() {
  if (viewer?.animation) {
    viewer.animation.paused = !viewer.animation.paused;
    return !viewer.animation.paused;
  }
  return false;
}
