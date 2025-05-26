// background.js
// 后台脚本：定时检查已跟踪标签页的媒体播放并恢复
let trackedTabs = new Set();
const CHECK_INTERVAL = 1000; // 检查间隔：1秒

// 注入到页面中执行的函数，用于恢复播放
function checkMediaPlaybackAndResume() {
  try {
    document.querySelectorAll("audio, video").forEach((media) => {
      if (media.paused) {
        media.play().catch((err) => console.error("播放恢复失败:", err));
      }
    });
  } catch (e) {
    console.error("注入脚本异常:", e);
  }
}

// 定时检查已跟踪的标签页
function checkAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    try {
      tabs
        .filter(
          (tab) => trackedTabs.has(tab.id) && /^https?:\/\//.test(tab.url)
        )
        .sort((a, b) => a.index - b.index) // 按真实标签顺序排序
        .forEach((tab) => {
          chrome.scripting.executeScript(
            { target: { tabId: tab.id }, func: checkMediaPlaybackAndResume },
            () => {
              if (chrome.runtime.lastError) {
                console.error(
                  "脚本注入失败:",
                  chrome.runtime.lastError.message
                );
              }
            }
          );
        });
    } catch (e) {
      console.error("检查标签页异常:", e);
    }
  });
}

// 接收来自 popup 的消息，更新跟踪集合
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.action === "toggleTrack" && typeof message.tabId === "number") {
      if (message.enable) trackedTabs.add(message.tabId);
      else trackedTabs.delete(message.tabId);
      sendResponse({ success: true });
    }
  } catch (e) {
    console.error("消息处理异常:", e);
    sendResponse({ success: false, error: e.message });
  }
  return true;
});

// 启动定时任务
setInterval(checkAllTabs, CHECK_INTERVAL);
