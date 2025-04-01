function checkAudio() {
  let hasAudio = false;
  document.querySelectorAll("audio, video").forEach((media) => {
    if (!media.paused && !media.muted) {
      hasAudio = true;
    }
  });
  // Send a message to the background script indicating the audio state
  browser.runtime.sendMessage({ playing: hasAudio }).catch((error) => {
    console.error("Error sending message:", error);
  });
}

// Set an interval to check audio every second
setInterval(checkAudio, 1000);
