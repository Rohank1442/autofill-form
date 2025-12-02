console.log("Popup loaded");

// ADD THIS ↓
document.getElementById("extractBtn")?.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id!, { action: "EXTRACT_FIELDS" });
});

// ADD LISTENER FOR RESPONSE FROM CONTENT SCRIPT
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "FIELDS_EXTRACTED") {
        console.log("Extracted fields:", msg.fields);
        renderFields(msg.fields);
    }
});

function renderFields(fields: any[]) {
    const container = document.getElementById("fields");
    if (!container) return;

    container.innerHTML = "";

    fields.forEach(f => {
        const div = document.createElement("div");
        div.className = "field-preview";

        div.innerText =
            `${f.label || f.placeholder || f.name || f.id || f.type} (${f.tag})`;

        container.appendChild(div);
    });
}