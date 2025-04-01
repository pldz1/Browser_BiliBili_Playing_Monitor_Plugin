document.addEventListener("DOMContentLoaded", async () => {
  const tabsContainer = document.getElementById("tabs");
  tabsContainer.innerHTML = "<p>Loading...</p>";

  try {
    const tabs = await browser.tabs.query({});
    const allTabs = [];
    let tabsProcessed = 0;

    if (tabs.length === 0) {
      tabsContainer.innerHTML = "<p>No tabs found.</p>";
      return;
    }

    const data = await browser.storage.local.get("checkedTabs");
    const checkedTabs = data.checkedTabs || {};

    for (const tab of tabs) {
      if (tab.url.startsWith("http://") || tab.url.startsWith("https://")) {
        try {
          const results = await browser.tabs.executeScript(tab.id, {
            code: `(${checkMediaPlayback})()`,
          });
          tabsProcessed++;
          let status = "No Media";
          if (results && results[0]) {
            if (results[0] === "playing") {
              status = "Playing";
            } else if (results[0] === "paused") {
              status = "Paused";
            }
          }
          allTabs.push({
            id: tab.id,
            title: tab.title,
            url: tab.url,
            status: status,
          });
        } catch (error) {
          console.error("Script execution failed: ", error);
        }

        if (tabsProcessed === tabs.length) {
          displayTabs(allTabs, checkedTabs);
        }
      } else {
        tabsProcessed++;
        if (tabsProcessed === tabs.length) {
          displayTabs(allTabs, checkedTabs);
        }
      }
    }
  } catch (error) {
    console.error("Error initializing extension:", error);
    tabsContainer.innerHTML =
      "<p>Failed to load tabs. Please try again later.</p>";
  }

  function checkMediaPlayback() {
    const mediaElements = document.querySelectorAll("audio, video");
    for (let media of mediaElements) {
      if (!media.paused && !media.ended && media.readyState > 2) {
        return "playing";
      }
    }
    return mediaElements.length > 0 ? "paused" : "no media";
  }

  function displayTabs(tabs, checkedTabs) {
    tabsContainer.innerHTML = "";
    if (tabs.length === 0) {
      tabsContainer.innerHTML = "<p>No tabs found.</p>";
    } else {
      for (const tab of tabs) {
        const tabElement = document.createElement("div");
        tabElement.className = "tab";
        const showSwitch = tab.status !== "No Media";
        const isChecked = checkedTabs[tab.id] || false;
        tabElement.innerHTML = `
          <span class="tab-info">Tab: ${tab.title} - URL: ${
          tab.url
        } - Status: ${tab.status}</span>
          ${
            showSwitch
              ? `
            <label class="switch">
              <input type="checkbox" ${
                isChecked ? "checked" : ""
              } data-tab-id="${tab.id}">
              <span class="slider round"></span>
            </label>
          `
              : ""
          }
        `;
        tabsContainer.appendChild(tabElement);

        if (showSwitch) {
          const switchElement = tabElement.querySelector(
            ".switch input[type='checkbox']"
          );
          switchElement.addEventListener("change", async (event) => {
            const tabId = parseInt(event.target.getAttribute("data-tab-id"));
            const action = event.target.checked
              ? "startTracking"
              : "stopTracking";

            const data = await browser.storage.local.get("checkedTabs");
            const checkedTabs = data.checkedTabs || {};
            if (event.target.checked) {
              checkedTabs[tabId] = true;
            } else {
              delete checkedTabs[tabId];
            }
            await browser.storage.local.set({ checkedTabs: checkedTabs });
            browser.runtime.sendMessage({ action: action, tabId: tabId });
          });
        }
      }
    }
  }
});
