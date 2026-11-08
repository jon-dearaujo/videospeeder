const extension = globalThis.browser ?? globalThis.chrome;
const speeds = [1, 1.25, 1.5, 2, 3];
let pendingAction = Promise.resolve();

function enqueue(action) {
  pendingAction = pendingAction.then(action).catch(console.error);
}

async function getSpeed() {
  const { speed } = await extension.storage.local.get("speed");
  return speeds.includes(speed) ? speed : speeds[0];
}

function updateToolbar(speed) {
  return Promise.all([
    extension.action.setIcon({
      path: {
        16: `icons/${speed}x-16.png`,
        32: `icons/${speed}x-32.png`,
      },
    }),
    extension.action.setTitle({ title: `Video Speeder (${speed}x)` }),
  ]);
}

function setPlayingVideoSpeed(speed) {
  let playingVideo;
  let largestArea = -1;

  function findPlayingVideo(doc) {
    for (const video of doc.querySelectorAll("video")) {
      if (video.paused || video.ended) continue;

      const { width, height } = video.getBoundingClientRect();
      const area = width * height;
      if (area > largestArea) {
        playingVideo = video;
        largestArea = area;
      }
    }

    for (const frame of doc.querySelectorAll("iframe, frame")) {
      if (frame.contentDocument) findPlayingVideo(frame.contentDocument);
    }
  }

  findPlayingVideo(document);
  if (playingVideo) playingVideo.playbackRate = speed;
}

function restoreToolbar() {
  enqueue(async () => updateToolbar(await getSpeed()));
}

extension.runtime.onInstalled.addListener(restoreToolbar);
extension.runtime.onStartup.addListener(restoreToolbar);

extension.action.onClicked.addListener((tab) => {
  enqueue(async () => {
    const previousSpeed = await getSpeed();
    const speed = speeds[(speeds.indexOf(previousSpeed) + 1) % speeds.length];

    await extension.storage.local.set({ speed });
    await updateToolbar(speed);

    if (tab.id == null) return;
    try {
      await extension.scripting.executeScript({
        target: { tabId: tab.id },
        func: setPlayingVideoSpeed,
        args: [speed],
      });
      // The click can grant tab access even when automatic site access is off.
      await extension.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["playback.js"],
      });
    } catch (error) {
      // The toolbar still cycles on browser pages that disallow injection.
      console.debug("Could not set video speed in this tab", error);
    }
  });
});
