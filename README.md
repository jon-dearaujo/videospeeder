# Video Speeder

Click the toolbar icon to cycle through **1× → 1.25× → 1.5× → 2× → 3× → 1×**. The icon shows the selected speed, which is saved across browser restarts. Each click changes the largest playing video in the current tab, including videos in same-origin frames. The icon advances even if no video is playing. Videos automatically use the saved speed when they start playing on sites where Video Speeder has access.

## Load locally

- **Chrome 121 or newer** · Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**. Select this project folder, then pin Video Speeder from Chrome’s Extensions menu.
- **Firefox 121 or newer** · Open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select this project’s `manifest.json`. Pin Video Speeder from Firefox’s Extensions menu if needed. Firefox removes temporary add-ons when it closes. A permanent installation on standard Firefox requires a signed add-on.

## Enable automatic playback speed

Video Speeder needs ongoing site access to apply the saved speed before its toolbar icon is clicked.

- **Firefox** · Open YouTube, right-click the pinned Video Speeder icon, and choose **Always Allow on www.youtube.com**. If the icon is unpinned, use its gear menu in the Extensions panel. Firefox may withhold site access after updating an older version of Video Speeder, even if the toolbar still shows your saved speed.
- **Chrome** · In the Extensions menu, open Video Speeder’s menu and set its site access to **On youtube.com** while on YouTube.

Refresh the video page after granting access. Press the video’s Play button to start at the saved speed.
