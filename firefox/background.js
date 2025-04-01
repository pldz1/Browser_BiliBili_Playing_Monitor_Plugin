let trackedTabs = new Set();

function checkAllTabs() {
  browser.tabs
    .query({})
    .then((tabs) => {
      tabs.forEach((tab) => {
        if (trackedTabs.has(tab.id)) {
          if (tab.url.startsWith("http://") || tab.url.startsWith("https://")) {
            browser.scripting
              .executeScript({
                target: { tabId: tab.id },
                func: checkMediaPlaybackAndResume,
              })
              .then((results) => {
                if (results && results[0] && results[0].result !== undefined) {
                  console.log(`Tab ${tab.title}: ${results[0].result}`);
                }
              })
              .catch((error) => {
                console.error("Error executing script:", error);
              });
          }
        }
      });
    })
    .catch((error) => {
      console.error("Error querying tabs:", error);
    });
}

function checkMediaPlaybackAndResume() {
  try {
    let mediaElements = document.querySelectorAll("audio, video");
    let resumed = false;
    for (let media of mediaElements) {
      if (media.paused) {
        media.play();
        resumed = true;
      }
      const mask = document.querySelector(".bili-mini-mask");
      if (mask && mask.style.display !== "none") {
        mask.style.display = "none";
      }
    }
    return resumed ? "Paused - Resumed" : "Playing";
  } catch (error) {
    console.error("Error resuming media playback:", error);
    return "Error";
  }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startTracking") {
    trackedTabs.add(message.tabId);
  } else if (message.action === "stopTracking") {
    trackedTabs.delete(message.tabId);
  }
});

setInterval(checkAllTabs, 1000);
