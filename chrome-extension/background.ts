chrome.runtime.onMessage.addListener((msg) => {
  console.log("BACKGROUND RECEIVED:", msg);
});