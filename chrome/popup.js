// popup.js
// 弹出页面脚本：展示标签页序号及标题，仅含音视频的标签页显示开关

// 封装获取媒体存在性的函数，处理未注入错误
async function getTabMediaInfo(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: "getStatus" }, async (resp) => {
      if (chrome.runtime.lastError) {
        // 未注入 content.js，则动态注入后重试
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"],
          });
          chrome.tabs.sendMessage(tabId, { action: "getStatus" }, (resp2) => {
            if (chrome.runtime.lastError) return resolve({ hasMedia: false });
            resolve({ hasMedia: !!resp2.hasMedia });
          });
        } catch (e) {
          resolve({ hasMedia: false });
        }
      } else {
        resolve({ hasMedia: !!resp.hasMedia });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const tabsContainer = document.getElementById("tabs");
  const errorBox = document.getElementById("error");
  tabsContainer.innerHTML = "<p>加载中...</p>";

  try {
    let tabs = await chrome.tabs.query({});
    if (!tabs || tabs.length === 0) {
      tabsContainer.innerHTML = "<p>未发现标签页。</p>";
      return;
    }

    tabs.sort((a, b) => a.index - b.index);
    const { checkedTabs = {} } = await chrome.storage.local.get("checkedTabs");
    tabsContainer.innerHTML = "";

    for (let idx = 0; idx < tabs.length; idx++) {
      const tab = tabs[idx];
      const { hasMedia } = await getTabMediaInfo(tab.id);

      const div = document.createElement("div");
      div.className = "tab";

      // 左侧：序号 & 标题
      const left = document.createElement("div");
      left.className = "tab-left";
      const num = document.createElement("span");
      num.className = "tab-number";
      num.textContent = idx + 1;
      const info = document.createElement("div");
      info.className = "tab-info";
      info.textContent = tab.title || tab.url;
      left.append(num, info);

      // 右侧：仅有媒体时显示开关
      const right = document.createElement("div");
      right.className = "tab-right";
      if (hasMedia) {
        const label = document.createElement("label");
        label.className = "switch";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!checkedTabs[tab.id];
        const slider = document.createElement("span");
        slider.className = "slider";
        label.append(checkbox, slider);
        checkbox.addEventListener("change", async (e) => {
          try {
            await new Promise((res) =>
              chrome.runtime.sendMessage(
                {
                  action: "toggleTrack",
                  tabId: tab.id,
                  enable: e.target.checked,
                },
                res
              )
            );
            const newChecked = { ...checkedTabs };
            if (e.target.checked) newChecked[tab.id] = true;
            else delete newChecked[tab.id];
            await chrome.storage.local.set({ checkedTabs: newChecked });
          } catch {
            errorBox.textContent = "操作失败，请重试。";
            errorBox.style.display = "block";
          }
        });
        right.append(label);
      }

      div.append(left, right);
      tabsContainer.append(div);
    }
  } catch (err) {
    errorBox.textContent = "加载失败，请刷新。";
    errorBox.style.display = "block";
    tabsContainer.innerHTML = "";
  }
});
