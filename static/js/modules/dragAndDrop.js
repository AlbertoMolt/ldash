// ================================
//        DRAG AND DROP
// ================================

import state from './state.js';
import { elements } from './dom.js';
import { apiUpdateItemCategory } from './api.js';
import { updateDashboard } from './dashboard.js';

const listItemsMoved = new Map();
let draggingItem = null;
let originalParent = null;
let originalNextSibling = null;
let offsetX = 0;
let offsetY = 0;

export function initDragAndDrop() {
    document.addEventListener('mousedown', onDragStart);
    document.addEventListener('mouseup', onDragEnd);

    document.getElementById('apply-organize-btn').addEventListener('click', async () => {
        const updatePromises = [];
        listItemsMoved.forEach((newCategory, itemId) => {
            updatePromises.push(apiUpdateItemCategory(itemId, newCategory));
        });
        await Promise.all(updatePromises);
        endOrganizeMode();
    });

    document.getElementById('cancel-organize-btn').addEventListener('click', () => {
        restoreDomSnapshot();
        endOrganizeMode();
    });
}

export function startOrganizeMode() {
    if (state.dialogOpen) return;

    saveDomSnapshot();
    state.organizeModeEnabled = true;
    state.disableDialogs = true;

    enableShakeMode();
    document.getElementById('organize-mode-actions').style.display = "flex";
    document.getElementById('toolbar').style.display = "none";
}

export function cancelOrganizeMode() {
    if (!state.organizeModeEnabled) return;
    restoreDomSnapshot();
    endOrganizeMode();
}

function endOrganizeMode() {
    state.organizeModeEnabled = false;
    state.disableDialogs = false;
    state.domSnapshot = null;

    disableShakeMode();
    listItemsMoved.clear();

    document.getElementById('organize-mode-actions').style.display = "none";
    document.getElementById('toolbar').style.display = "flex";

    updateDashboard();
}

function saveDomSnapshot() {
    state.domSnapshot = elements.itemsContainer.innerHTML;
}

function restoreDomSnapshot() {
    if (state.domSnapshot) {
        elements.itemsContainer.innerHTML = state.domSnapshot;
    }
}

function enableShakeMode() {
    document.querySelectorAll('.item-card').forEach(item => {
        item.classList.add('shaking');
        const dot = item.querySelector('.status-ping');
        if (dot) dot.style.display = 'none';
    });
}

function disableShakeMode() {
    document.querySelectorAll('.item-card').forEach(item => {
        item.classList.remove('shaking');
        const dot = item.querySelector('.status-ping');
        if (dot) dot.style.display = '';
    });
}

function onDragStart(e) {
    if (e.button !== 0) return;
    if (!state.organizeModeEnabled) return;
    const itemCard = e.target.closest(".item-card");
    if (!itemCard) return;

    e.preventDefault();
    const rect = itemCard.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    originalParent = itemCard.parentElement;
    originalNextSibling = itemCard.nextElementSibling;
    draggingItem = itemCard;

    itemCard.style.left = rect.left + "px";
    itemCard.style.top = rect.top + "px";
    itemCard.style.width = rect.width + "px";
    itemCard.style.height = rect.height + "px";
    itemCard.classList.add("dragging");
    document.body.appendChild(itemCard);

    document.addEventListener("mousemove", onItemDrag);
}

function onDragEnd(e) {
    if (!state.organizeModeEnabled || !draggingItem) return;

    const categoryDropped = e.target.closest(".category");
    document.removeEventListener("mousemove", onItemDrag);
    draggingItem.classList.remove("dragging");

    draggingItem.style.left = "";
    draggingItem.style.top = "";
    draggingItem.style.width = "";
    draggingItem.style.height = "";

    if (categoryDropped && draggingItem.dataset.category !== categoryDropped.dataset.category) {
        onItemDrop(draggingItem, categoryDropped);
    } else {
        if (originalNextSibling) {
            originalParent.insertBefore(draggingItem, originalNextSibling);
        } else {
            originalParent.appendChild(draggingItem);
        }
    }

    draggingItem = null;
    originalParent = null;
    originalNextSibling = null;
    offsetX = 0;
    offsetY = 0;
}

function onItemDrag(e) {
    if (draggingItem) {
        draggingItem.style.left = (e.clientX - offsetX) + "px";
        draggingItem.style.top = (e.clientY - offsetY) + "px";
    }
}

function onItemDrop(item, category) {
    const itemsWrapper = category.querySelector('.items-wrapper');
    itemsWrapper.appendChild(item);
    item.style.left = "";
    item.style.top = "";
    item.dataset.category = category.dataset.category;
    listItemsMoved.set(item.dataset.id, category.dataset.category);
}
