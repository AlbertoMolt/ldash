// ================================
//     DASHBOARD RENDERING
// ================================

import state from './state.js';
import { elements } from './dom.js';
import { fetchItemsByCategory, fetchItemCategories } from './api.js';
import { restoreCollapsableElementsStates } from './collapse.js';
import { startStatusPolling } from './statusPing.js';
import { loadTemplate } from './templateLoader.js';

let isDashboardUpdating = false;

// Parse an HTML string into a DOM element
function parseTemplate(html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
}

// Pre-load all dashboard templates and cache them as DOM clones
let _templates = null;
async function getTemplates() {
    if (_templates) return _templates;
    const [categoryHtml, itemHtml, iframeHtml] = await Promise.all([
        loadTemplate('dashboard/category.html'),
        loadTemplate('dashboard/item-card.html'),
        loadTemplate('dashboard/iframe-card.html'),
    ]);
    _templates = {
        category: parseTemplate(categoryHtml),
        item:     parseTemplate(itemHtml),
        iframe:   parseTemplate(iframeHtml),
    };
    return _templates;
}

export async function updateDashboard() {
    if (state.organizeModeEnabled) return;
    if (isDashboardUpdating) return;

    isDashboardUpdating = true;
    try {
        const [items, categories, templates] = await Promise.all([
            fetchItemsByCategory(),
            fetchItemCategories(),
            getTemplates(),
        ]);
        renderDashboard(items, categories, templates);
        restoreCollapsableElementsStates();
        startStatusPolling();
    } finally {
        isDashboardUpdating = false;
    }
}

function renderDashboard(items, categories, templates) {
    const { itemsContainer } = elements;
    const filteredItems = items.filter(item => item.profile === state.currentProfile);

    if (filteredItems.length === 0) {
        itemsContainer.style.width = '50%';
        itemsContainer.innerHTML = `<p style="text-align:center;">No items were found in this profile. Create an item to use.</p>`;
        return;
    }

    itemsContainer.removeAttribute('style');
    itemsContainer.innerHTML = '';

    const regularItems      = filteredItems.filter(item => item.item_type === 'item');
    const otherItems        = filteredItems.filter(item => item.item_type !== 'item');
    const itemsWithCategory    = regularItems.filter(item => item.category);
    const itemsWithoutCategory = regularItems.filter(item => !item.category);

    // Uncategorized
    if (itemsWithoutCategory.length > 0) {
        const catEl = buildCategory('uncategorized', 'Uncategorized', itemsWithoutCategory, templates);
        itemsContainer.appendChild(catEl);
    }

    // Categorized (respecting server order)
    const categoriesWithItems = [...new Set(itemsWithCategory.map(item => item.category))];
    const categoriesToShow    = categories.filter(cat => categoriesWithItems.includes(cat));

    for (const category of categoriesToShow) {
        const categoryItems = itemsWithCategory.filter(item => item.category === category);
        if (categoryItems.length > 0) {
            const catEl = buildCategory(category, category, categoryItems, templates);
            itemsContainer.appendChild(catEl);
        }
    }

    // Iframes / other
    for (const item of otherItems) {
        itemsContainer.appendChild(buildItem(item, templates));
    }
}

// --- Builders ---

function buildCategory(categoryKey, categoryLabel, items, templates) {
    const el = templates.category.cloneNode(true);
    el.dataset.name     = categoryKey;
    el.dataset.category = categoryKey;
    el.querySelector('.category-name').textContent = categoryLabel;

    const wrapper = el.querySelector('.items-wrapper');
    for (const item of items) {
        wrapper.appendChild(buildItem(item, templates));
    }
    return el;
}

function buildItem(item, templates) {
    switch (item.item_type) {
        case 'item':   return buildItemCard(item, templates);
        case 'iframe': return buildIframeCard(item, templates);
        default:       return document.createTextNode('');
    }
}

function buildItemCard(item, templates) {
    const el = templates.item.cloneNode(true);

    el.dataset.id       = item.id;
    el.dataset.name     = item.name;
    el.dataset.category = item.category;

    const link = el.querySelector('a');
    link.href   = item.url;
    link.target = item.tab_type === 'true' || item.tab_type === true ? '_blank' : '_self';

    el.querySelector('.item-title').textContent = item.name;

    // Icon
    const content = el.querySelector('.item-content');
    if (/\p{Extended_Pictographic}/u.test(item.icon)) {
        const span = document.createElement('span');
        span.className   = 'item-icon emoji-icon';
        span.ariaHidden  = 'true';
        span.textContent = item.icon;
        content.appendChild(span);
    } else {
        const img = document.createElement('img');
        img.className = 'item-icon';
        img.src       = item.icon;
        img.alt       = `${item.name} icon`;
        img.loading   = 'lazy';
        content.appendChild(img);
    }

    return el;
}

function buildIframeCard(item, templates) {
    const el = templates.iframe.cloneNode(true);

    el.dataset.id       = item.id;
    el.dataset.name     = item.name;
    el.dataset.category = item.category;

    el.querySelector('.iframe-title').textContent = item.name;
    el.querySelector('.iframe-content').src       = item.url;

    return el;
}
