// ================================
//     DASHBOARD RENDERING
// ================================

import state from './state.js';
import { elements } from './dom.js';
import { fetchItemsByCategory, fetchItemCategories } from './api.js';
import { restoreCollapsableElementsStates } from './collapse.js';
import { startStatusPolling } from './statusPing.js';

let isDashboardUpdating = false;

export async function updateDashboard() {
    if (state.organizeModeEnabled) return;
    if (isDashboardUpdating) return;

    isDashboardUpdating = true;
    try {
        const items = await fetchItemsByCategory();
        const categories = await fetchItemCategories();
        renderDashboard(items, categories);
        restoreCollapsableElementsStates();
        startStatusPolling();
    } finally {
        isDashboardUpdating = false;
    }
}

function renderDashboard(items, categories) {
    const { itemsContainer } = elements;
    const html = [];
    const filteredItems = items.filter(item => item.profile === state.currentProfile);

    if (filteredItems.length === 0) {
        itemsContainer.style.width = "50%";
        itemsContainer.innerHTML = `<p style="text-align:center;">No items were found in this profile. Create an item to use.</p>`;
        return;
    }

    itemsContainer.removeAttribute("style");
    itemsContainer.innerHTML = "";

    const regularItems = filteredItems.filter(item => item.item_type === "item");
    const otherItems = filteredItems.filter(item => item.item_type !== "item");
    const itemsWithCategory = regularItems.filter(item => item.category);
    const itemsWithoutCategory = regularItems.filter(item => !item.category);

    // Uncategorized items
    if (itemsWithoutCategory.length > 0) {
        html.push(`
            <div class="category" data-category="uncategorized">
                <div class="category-header category-button" role="button" tabindex="0">
                    <h3>Uncategorized</h3>
                </div>
            <div class="items-wrapper">
        `);
        for (const item of itemsWithoutCategory) {
            html.push(renderItemByType(item));
        }
        html.push(`</div></div>`);
    }

    // Categorized items (respecting order)
    const categoriesWithItems = [...new Set(itemsWithCategory.map(item => item.category))];
    const categoriesToShow = categories.filter(cat => categoriesWithItems.includes(cat));

    for (const category of categoriesToShow) {
        const categoryItems = itemsWithCategory.filter(item => item.category === category);
        if (categoryItems.length > 0) {
            html.push(`
                <div class="category" data-category="${category}">
                    <div class="category-header category-button" role="button" tabindex="0">
                        <h3>${category}</h3>
                    </div>
                <div class="items-wrapper">
            `);
            for (const item of categoryItems) {
                html.push(renderItemByType(item));
            }
            html.push(`</div></div>`);
        }
    }

    // Non-regular items (iframes, etc.)
    for (const item of otherItems) {
        html.push(renderItemByType(item));
    }

    itemsContainer.innerHTML = html.join("");
}

function renderItemByType(item) {
    const target = item.tab_type ? "_blank" : "_self";

    switch (item.item_type) {
        case "item": {
            let iconElement;
            if (/\p{Extended_Pictographic}/u.test(item.icon)) {
                iconElement = `<span class="item-icon emoji-icon" aria-hidden="true">${item.icon}</span>`;
            } else {
                iconElement = `<img class="item-icon" src="${item.icon}" alt="${item.name} icon" loading="lazy">`;
            }

            return `
                <div class="item-card" data-id="${item.id}" data-type="item" data-category="${item.category}">
                    <a href="${item.url}" target="${target}">
                        <div class="item-content" tabindex="0">
                            <p class="item-title">${item.name}</p>
                            ${iconElement}
                            <span class="status-ping" id="statusPing">•</span>
                        </div>
                    </a>
                </div>
            `;
        }
        case "iframe":
            return `
                <div class="iframe-item" data-id="${item.id}" data-type="iframe" data-category="${item.category}">
                    <div class="iframe-header iframe-button" tabindex="0">
                        <h2 class="iframe-title">${item.name}</h2>
                    </div>
                    <iframe 
                        class="iframe-content" 
                        src="${item.url}"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-presentation"
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; microphone; camera; display-capture"
                        allowfullscreen
                        onerror="this.style.display='none'; this.parentElement.innerHTML += '<p style=\\'text-align:center; padding:20px;\\'>❌ This site cannot be displayed in an iframe</p>'"
                    ></iframe>
                </div>
            `;
    }
}
