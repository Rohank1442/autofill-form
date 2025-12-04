console.log("Popup loaded");

document.getElementById("extractBtn")?.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id!, { action: "EXTRACT_FIELDS" });
    });
});

// ADD LISTENER FOR RESPONSE FROM CONTENT SCRIPT
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "FIELDS_EXTRACTED") {
        fetch("http://localhost:8000/ai-autofill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fields: msg.fields })
        })
        .then(res => res.json())
        .then(data => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id!, {
                    action: "SHOW_SUGGESTIONS",
                    suggestions: data
                });
            });
        });
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