// ================================
//          API SERVICE
// ================================

import state from './state.js';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function handleResponse(response) {
    return response.json().then(data => {
        if (data.success) return data;
        throw new Error(data.error);
    });
}

// --- Items ---

export function fetchItemData(itemId) {
    return fetch(`/api/items/${itemId}`, {
        method: 'GET',
        headers: JSON_HEADERS,
    })
    .then(handleResponse)
    .then(data => ({
        id: data.id,
        name: data.name,
        item_type: data.item_type,
        icon: data.icon,
        url: data.url,
        category: data.category,
        tabType: data.tab_type,
    }));
}

export function fetchItemsByCategory() {
    const url = state.currentProfile
        ? `/api/items?profile=${state.currentProfile}`
        : '/api/items';

    return fetch(url, {
        method: 'GET',
        headers: JSON_HEADERS,
    })
    .then(handleResponse)
    .then(data => data.items);
}

export function fetchItemCategories() {
    return fetch('/api/items/categories', {
        method: 'GET',
        headers: JSON_HEADERS,
    })
    .then(handleResponse)
    .then(data => data.categories);
}

export function fetchItemProfiles() {
    return fetch('/api/items/profiles', {
        method: 'GET',
        headers: JSON_HEADERS,
    })
    .then(handleResponse)
    .then(data => data.profiles);
}

export function fetchItemStatus(signal) {
    return fetch('/api/items/status', { signal })
        .then(handleResponse);
}

export function apiCreateItem(name, itemType, icon, url, category, tabType) {
    return fetch('/api/items', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({
            id: '0',
            name,
            item_type: itemType,
            icon,
            url,
            category,
            tab_type: tabType,
            profile: state.currentProfile,
        }),
    }).then(handleResponse);
}

export function apiDeleteItem(itemId) {
    return fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: JSON_HEADERS,
    }).then(handleResponse);
}

export function apiDeleteCategory(categoryName) {
    return fetch(`/api/items/categories/${categoryName}&${state.currentProfile}`, {
        method: 'DELETE',
        headers: JSON_HEADERS,
    }).then(handleResponse);
}

export function apiUpdateItem(itemId, name, itemType, icon, url, category, tabType) {
    return fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({
            name,
            item_type: itemType,
            icon,
            url,
            category,
            tab_type: tabType,
            profile: state.currentProfile,
        }),
    }).then(handleResponse);
}

export function apiUpdateItemCategory(itemId, categoryName) {
    return fetch(`/api/items/${itemId}/category`, {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({ category: categoryName }),
    }).then(handleResponse);
}

export function apiUpdateCategoryName(oldName, newName) {
    return fetch(`/api/items/categories/${oldName}&${state.currentProfile}`, {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({ name: newName }),
    }).then(handleResponse);
}

// --- Database import ---

export function apiImportDatabase(formData) {
    return fetch('/api/import/database', {
        method: 'POST',
        body: formData,
    }).then(handleResponse);
}
