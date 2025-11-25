# app/services/form_scraper.py
from typing import List, Dict
from playwright.async_api import async_playwright

async def scrape_page(url: str) -> List[Dict]:
    """
    Use Playwright to open the page and extract visible form inputs.
    Return a list of {label, input_type, placeholder, xpath, outer_html}
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url, timeout=30000)
        await page.wait_for_timeout(1000)  # small wait for JS to settle; tweak as needed

        # Evaluate DOM to collect inputs
        fields = await page.evaluate("""() => {
            const nodes = Array.from(document.querySelectorAll('input, textarea, select'));
            function nearestLabel(el) {
                const id = el.id;
                if(id) {
                    const lab = document.querySelector('label[for="'+id+'"]');
                    if(lab) return lab.innerText;
                }
                let parent = el.closest('label');
                if(parent) return parent.innerText;
                const prev = el.previousElementSibling;
                if(prev) return prev.innerText;
                return '';
            }
            return nodes.map(n => ({
                tag: n.tagName.toLowerCase(),
                type: n.type || null,
                placeholder: n.placeholder || null,
                ariaLabel: n.getAttribute('aria-label') || null,
                label: nearestLabel(n),
                outerHTML: n.outerHTML
            }));
        }""")
        await browser.close()
        return fields
