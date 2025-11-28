/// <reference types="chrome"/>

const fillFormBtn = document.getElementById("fillForm");
const statusDiv = document.getElementById("status"); // rename

if (!fillFormBtn || !statusDiv) {
  throw new Error("Missing required HTML elements in popup.html");
}

fillFormBtn.addEventListener("click", async () => {
  statusDiv.textContent = "Fetching profile..."; // updated

  try {
    // Fetch saved profiles from backend
    const res = await fetch("http://127.0.0.1:8000/api/v1/user");
    if (!res.ok) throw new Error("Failed to fetch user profile");

    const users = await res.json();
    if (!users.length) {
      statusDiv.textContent = "No profiles found!";
      return;
    }

    const profile = users[users.length - 1]; // latest saved profile

    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      statusDiv.textContent = "No active tab found!";
      return;
    }

    // Execute content script to fill the form
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (userProfile: { full_name: string; email: string; phone: string }) => {
        const map: Record<string, string> = {
          name: userProfile.full_name,
          email: userProfile.email,
          phone: userProfile.phone,
        };

        Object.entries(map).forEach(([key, value]) => {
          const input = document.querySelector<HTMLInputElement>(
            `input[name*="${key}"], input[id*="${key}"]`
          );
          if (input) input.value = value;
        });

        alert("Form filled using Autofill-AI!");
      },
      args: [profile],
    });

    statusDiv.textContent = "Form filled!";
  } catch (err: any) {
    console.error(err);
    statusDiv.textContent = `Error: ${err.message || err}`;
  }
});
