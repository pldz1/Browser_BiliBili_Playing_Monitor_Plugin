// content.js
// 页面脚本：响应 popup 的查询，返回是否存在音视频（hasMedia）及播放状态（playing）

(function () {
  function getMediaInfo() {
    const elements = document.querySelectorAll("audio, video");
    const hasMedia = elements.length > 0;
    let playing = false;
    elements.forEach((media) => {
      if (!media.paused && !media.muted) playing = true;
    });
    return { hasMedia, playing };
  }

  // 监听状态查询
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getStatus") {
      try {
        sendResponse(getMediaInfo());
      } catch (e) {
        console.error("获取媒体信息异常:", e);
        sendResponse({ hasMedia: false, playing: false, error: e.message });
      }
    }
    return true;
  });

  // 周期性向后台汇报播放状态
  setInterval(() => {
    try {
      const info = getMediaInfo();
      chrome.runtime.sendMessage(info);
    } catch (e) {
      console.error("监测媒体播放异常:", e);
    }
  }, 1000);
})();
