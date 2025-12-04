//// content.ts

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "EXTRACT_FIELDS") {
        const fields = extractAllFields();
        
        chrome.runtime.sendMessage({
            action: "FIELDS_EXTRACTED",
            fields
        });

        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.action === "SHOW_SUGGESTIONS") {
                showSuggestionOverlays(msg.suggestions);
        }
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


function showSuggestionOverlays(mapping: any) {
    mapping.forEach((item: any) => {
        const el = getElementByXPath(item.xpath);
        if (!el) return;

        const rect = el.getBoundingClientRect();

        const bubble = document.createElement("div");
        bubble.innerHTML = `
            <div style="
                background: white;
                border: 1px solid #ccc;
                padding: 6px;
                border-radius: 6px;
                position: absolute;
                font-size: 12px;
                z-index: 999999999;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                cursor: pointer;
            ">
                <b>AI:</b> ${item.value}
                <br/>
                <button style="margin-top:4px;">Fill</button>
            </div>
        `;

        const box = bubble.firstElementChild as HTMLElement;
        box.style.top = `${rect.top + window.scrollY}px`;
        box.style.left = `${rect.right + window.scrollX + 10}px`;

        document.body.appendChild(bubble);

        box.querySelector("button")?.addEventListener("click", () => {
            try {
                (el as HTMLInputElement).value = item.value;
            } catch {
                navigator.clipboard.writeText(item.value);
                alert("Unable to write into field. Copied instead!");
            }
            bubble.remove();
        });
    });
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

function getElementByXPath(path: string): HTMLElement | null {
    try {
        const result = document.evaluate(
            path,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        );
        return result.singleNodeValue as HTMLElement;
    } catch {
        return null;
    }
}