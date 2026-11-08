(() => {
  if (globalThis.videoSpeederPlaybackInstalled) return;
  globalThis.videoSpeederPlaybackInstalled = true;

  const playbackStorage = (globalThis.browser ?? globalThis.chrome).storage.local;
  const startupByVideo = new WeakMap();
  const startupDurationMs = 5000;
  const maxStartupAdjustments = 5;

  async function applySavedSpeed(video, startup) {
    try {
      const { speed = 1 } = await playbackStorage.get("speed");
      if (startupByVideo.get(video) !== startup || performance.now() >= startup.expiresAt) return;
      if (video.paused || video.ended || video.playbackRate === speed || startup.adjustmentsLeft === 0) return;

      startup.adjustmentsLeft -= 1;
      video.playbackRate = speed;
    } catch (error) {
      console.debug("Could not apply the saved video speed", error);
    }
  }

  function beginPlayback(video) {
    if (!(video instanceof HTMLVideoElement) || video.paused || video.ended) return;

    const startup = {
      expiresAt: performance.now() + startupDurationMs,
      adjustmentsLeft: maxStartupAdjustments,
    };
    startupByVideo.set(video, startup);
    applySavedSpeed(video, startup);
  }

  // A new source can load into a video element that the page is already using.
  for (const event of ["loadedmetadata", "play", "playing"]) {
    document.addEventListener(event, ({ target }) => beginPlayback(target), true);
  }

  if (location.hostname === "youtube.com" || location.hostname.endsWith(".youtube.com")) {
    // YouTube can navigate to another video while keeping the same player alive.
    document.addEventListener("yt-navigate-finish", () => {
      for (const video of document.querySelectorAll("video")) beginPlayback(video);
    }, true);
  }

  // A player can reset the rate after playback starts. Limit corrections to startup.
  document.addEventListener("ratechange", ({ target: video }) => {
    const startup = startupByVideo.get(video);
    if (startup && startup.adjustmentsLeft > 0 && performance.now() < startup.expiresAt) {
      applySavedSpeed(video, startup);
    }
  }, true);
})();
