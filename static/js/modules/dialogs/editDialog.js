// ================================
//          EDIT DIALOG
// ================================

import { closeDialog, openDialog } from '../utils.js';
import { elements } from '../dom.js';
import { fetchItemData, fetchItemCategories, apiUpdateItem, apiUpdateCategoryName } from '../api.js';
import { updateDashboard } from '../dashboard.js';

export function openEditDialog(target) {
    const { editElementDialog } = elements;
    editElementDialog.innerHTML = `<p style="padding-left: 16px;">Loading...</p>`;

    openDialog(editElementDialog);

    if (target.dataset.type === "item" && target.dataset.id !== "0") {
        buildItemEditDialog(target.dataset.id, editElementDialog);
    }

    if (target.dataset.type === "category" && target.dataset.category !== "") {
        buildCategoryEditDialog(target.dataset.category, editElementDialog);
    }
}

// --- Item edit form ---
function buildItemEditDialog(itemId, dialog) {
    fetchItemData(itemId)
        .then(item => fetchItemCategories().then(cats => ({ item, cats })))
        .then(({ item, cats }) => {
            const categoriesFiltered = cats.filter(c => c !== item.category);
            const categoriesOptions = categoriesFiltered
                .map(c => `<option value="${c}">${c}</option>`)
                .join("");

            const itemType = item.item_type;
            let dialogContent = "";

            if (itemType === "item") {
                dialogContent = buildItemForm(item, categoriesOptions);
            } else if (itemType === "iframe") {
                dialogContent = buildIframeForm(item);
            }

            dialog.innerHTML = dialogContent;
            attachItemEditListeners(item, itemId, itemType, dialog);
        })
        .catch(err => alert(err));
}

function buildItemForm(item, categoriesOptions) {
    return `
    <div class="edit-item-wrapper">
        <h2 class="title">Edit "${item.name}" <span class="section-description">${item.item_type} · #${item.id}</span></h2>

        <div class="section-container">
            <div class="section">
                <h3 class="section-title">Name</h3>
                <div class="section-content">
                    <input type="text" id="itemNameEdit" value="${item.name}" style="width: 100%; border: none;">
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Icon URL <span class="section-description">Emoji supported</span></h3>
                <div class="section-content">
                    <input type="text" id="itemIcon" value="${item.icon}" style="flex: 1; border: none;">
                    <div style="min-width: 30px; min-height: 30px; display: flex; align-items: center;">
                        <img src="${item.icon}" id="iconPreview" width="30px" height="30px" style="object-fit: contain;">
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">URL</h3>
                <div class="section-content">
                    <input type="url" id="itemUrlEdit" value="${item.url}" style="width: 100%; border: none;">
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Category</h3>
                <div class="section-content">
                    <select id="itemCategoryEdit" style="width: 100%; border: none;">
                        <option value="${item.category}" selected>${item.category}</option>
                        <option value="newCategory">- New category -</option>
                        ${categoriesOptions}
                    </select>
                </div>
                <div class="section-content" id="newCategoryWrapperEdit" style="display: none;">
                    <label>New category name</label>
                    <input type="text" id="newCategoryEdit">
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Opening method</h3>
                <div class="section-content">
                    <select id="openingMethodEdit" style="width: 100%; border: none;">
                        <option value="true" ${item.tabType === 'true' ? 'selected' : ''}>New tab</option>
                        <option value="false" ${item.tabType === 'false' ? 'selected' : ''}>Same tab</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="dialog-actions">
            <button type="button" class="success-btn" id="applyItemBtn">Apply</button>
            <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
        </div>
    </div>`;
}

function buildIframeForm(item) {
    return `
    <div class="edit-item-wrapper">
        <h2 class="title">Edit "${item.name}" <span class="section-description">${item.item_type} · #${item.id}</span></h2>

        <div class="section-container">
            <div class="section">
                <h3 class="section-title">Name</h3>
                <div class="section-content">
                    <input type="text" id="itemNameEdit" value="${item.name}" style="width: 100%; border: none;">
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">URL</h3>
                <div class="section-content">
                    <input type="url" id="itemUrlEdit" value="${item.url}" style="width: 100%; border: none;">
                </div>
            </div>
        </div>

        <div class="dialog-actions">
            <button type="button" class="success-btn" id="applyItemBtn">Apply</button>
            <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
        </div>
    </div>`;
}

function attachItemEditListeners(item, itemId, itemType, dialog) {
    const itemCategoryEdit = document.getElementById('itemCategoryEdit');
    const newCategoryWrapperEdit = document.getElementById('newCategoryWrapperEdit');
    const newCategoryEdit = document.getElementById('newCategoryEdit');
    let selectedCategory = item.category;

    if (itemCategoryEdit) {
        itemCategoryEdit.addEventListener('change', () => {
            if (itemCategoryEdit.value === "newCategory") {
                newCategoryWrapperEdit.style.display = "";
                selectedCategory = newCategoryEdit.value;
            } else {
                newCategoryWrapperEdit.style.display = "none";
                selectedCategory = itemCategoryEdit.value;
            }
        });

        newCategoryEdit.addEventListener('input', () => {
            if (itemCategoryEdit.value === "newCategory") {
                selectedCategory = newCategoryEdit.value;
            }
        });
    }

    const itemIcon = document.getElementById('itemIcon');
    if (itemIcon && item.item_type === "item") {
        itemIcon.addEventListener('input', () => {
            document.getElementById('iconPreview').src = itemIcon.value;
        });
    }

    const applyItemBtn = document.getElementById('applyItemBtn');
    if (applyItemBtn) {
        applyItemBtn.addEventListener('click', () => {
            switch (itemType) {
                case "item": {
                    let finalCategory = selectedCategory;
                    if (itemCategoryEdit && itemCategoryEdit.value === "newCategory") {
                        finalCategory = newCategoryEdit.value.trim();
                        if (!finalCategory) {
                            alert("Please enter a category name");
                            return;
                        }
                    }
                    apiUpdateItem(
                        itemId,
                        document.getElementById('itemNameEdit').value,
                        "item",
                        document.getElementById('itemIcon').value,
                        document.getElementById('itemUrlEdit').value,
                        finalCategory,
                        document.getElementById('openingMethodEdit').value
                    ).then(() => updateDashboard());
                    break;
                }
                case "iframe":
                    apiUpdateItem(
                        itemId,
                        document.getElementById('itemNameEdit').value,
                        "iframe", "",
                        document.getElementById('itemUrlEdit').value,
                        "", ""
                    ).then(() => updateDashboard());
                    break;
            }
            closeDialog(dialog);
        });
    }
}

// --- Category edit form ---
function buildCategoryEditDialog(categoryName, dialog) {
    dialog.innerHTML = `
    <div class="edit-item-wrapper">
        <h2 class="title">Edit category</h2>

        <div class="section-container">
            <div class="section">
                <h3 class="section-title">Name</h3>
                <div class="section-content">
                    <input type="text" id="categoryNameEdit" value="${categoryName}" style="width: 100%; border: none;">
                </div>
            </div>
        </div>

        <div class="dialog-actions">
            <button type="button" class="success-btn" id="applyCategoryBtn">Apply</button>
            <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
        </div>
    </div>
    `;

    const applyCategoryBtn = document.getElementById('applyCategoryBtn');
    if (applyCategoryBtn) {
        applyCategoryBtn.addEventListener('click', () => {
            const newName = document.getElementById('categoryNameEdit').value;
            apiUpdateCategoryName(categoryName, newName)
                .then(() => updateDashboard())
                .catch(err => alert('Error: ' + err.message));
            closeDialog(dialog);
        });
    }
}