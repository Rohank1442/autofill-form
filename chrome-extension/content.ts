//// content.ts

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "EXTRACT_FIELDS") {
        const fields = extractAllFields();
        
        chrome.runtime.sendMessage({
            action: "FIELDS_EXTRACTED",
            fields
        });

        sendResponse({ status: "ok" });
    }
});


// -----------------------------
// FIELD EXTRACTION CORE LOGIC
// -----------------------------

function extractAllFields() {
    const selectors = [
        "input:not([type='hidden']):not([disabled])",
        "textarea:not([disabled])",
        "select:not([disabled])"
    ];

    const elements = document.querySelectorAll(selectors.join(","));

    const fields: any[] = [];

    elements.forEach((el) => {
        const label = findLabel(el);

        fields.push({
            tag: el.tagName.toLowerCase(),
            type: (el as HTMLInputElement).type || null,
            name: el.getAttribute("name") || null,
            id: el.id || null,
            placeholder: el.getAttribute("placeholder") || null,
            ariaLabel: el.getAttribute("aria-label") || null,
            label: label,
            xpath: getXPath(el), // unique identifier to fill later
        });
    });

    return fields;
}


// -----------------------------
// LABEL DETECTION
// -----------------------------

function findLabel(el: Element): string | null {
    // 1) <label for="id">
    if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label) return label.innerText.trim();
    }

    // 2) Parent <label><input></label>
    let parent = el.parentElement;
    if (parent && parent.tagName.toLowerCase() === "label") {
        return parent.innerText.trim();
    }

    // 3) Check nearest label-like element above
    let prev = el.previousElementSibling;
    if (prev && prev.tagName.toLowerCase() === "label") {
        return prev.innerText.trim();
    }

    // 4) Semantic aria-labelledby
    const ariaId = el.getAttribute("aria-labelledby");
    if (ariaId) {
        const lab = document.getElementById(ariaId);
        if (lab) return lab.innerText.trim();
    }

    // 5) Try surrounding text if meaningful
    const textNearby = el.parentElement?.innerText?.trim();
    if (textNearby && textNearby.length < 50) {
        return textNearby;
    }

    return null;
}


// -----------------------------
// XPATH GENERATOR
// -----------------------------

function getXPath(element: Element): string {
    if (element.id) {
        return `//*[@id="${element.id}"]`;
    }

    const parts = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let position = 1;
        let sibling = element.previousSibling;

        while (sibling) {
            if (
                sibling.nodeType === Node.ELEMENT_NODE &&
                sibling.nodeName === element.nodeName
            ) {
                position++;
            }
            sibling = sibling.previousSibling;
        }

        const part =
            element.nodeName.toLowerCase() +
            "[" +
            position +
            "]";

        parts.unshift(part);

        element = element.parentElement!;
    }

    return "/" + parts.join("/");
}