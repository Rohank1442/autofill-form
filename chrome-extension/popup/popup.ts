/// <reference types="chrome"/>

const fillFormBtn = document.getElementById("fillForm");
const statusDiv = document.getElementById("status");

if (!fillFormBtn || !statusDiv) {
  throw new Error("Missing required HTML elements in popup.html");
}

fillFormBtn.addEventListener("click", async () => {
  statusDiv.textContent = "Fetching profile...";

  try {
    const res = await fetch("http://127.0.0.1:8000/api/v1/user");
    if (!res.ok) throw new Error("Failed to fetch user profile");

    const users = await res.json();
    if (!users.length) {
      statusDiv.textContent = "No profiles found!";
      return;
    }

    const profile = users[users.length - 1];
    console.log("Sending profile to content script:", profile);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      statusDiv.textContent = "No active tab found!";
      return;
    }

    // Send profile to content script
    chrome.tabs.sendMessage(tab.id, { action: "FILL_FORM", profile });

    statusDiv.textContent = "Attempting to fill form...";
  } catch (err: any) {
    console.error(err);
    statusDiv.textContent = `Error: ${err.message || err}`;
  }
});
