chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "FORM_FIELDS_EXTRACTED") {
        console.log("Received fields:", msg.fields);

        // --- Send to Python backend ---
        fetch("http://localhost:8000/extract-fields", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fields: msg.fields })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Backend stored fields:", data);
            sendResponse({ status: "ok" });
        })
        .catch(err => {
            console.error("Error sending to backend:", err);
            sendResponse({ status: "error" });
        });

        return true; // IMPORTANT for async sendResponse()
    }
});