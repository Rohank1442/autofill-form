/// <reference types="chrome"/>

console.log("Content script active");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "FILL_FORM") {
    const profile = msg.profile;
    console.log("Received profile:", profile);

    const map: Record<string, string> = {
      name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
    };

    // Try to fill text inputs by name, id, placeholder, or aria-label
    Object.entries(map).forEach(([key, value]) => {
      const selector = `input[name*="${key}"],
                        input[id*="${key}"],
                        input[placeholder*="${key}"],
                        input[aria-label*="${key}"]`;

      const input = document.querySelector<HTMLInputElement>(selector);
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true })); // trigger change events
      }
    });

    console.log("Form fields attempted to fill:", map);
    alert("Form filled using Autofill-AI!");
  }
});
