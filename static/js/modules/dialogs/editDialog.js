// ================================
//          EDIT DIALOG
// ================================

import state from '../state.js';
import { elements } from '../dom.js';
import { fetchItemData, fetchItemCategories, apiUpdateItem, apiUpdateCategoryName } from '../api.js';
import { updateDashboard } from '../dashboard.js';

export function initEditDialog() {
    document.getElementById('edit-element-btn').addEventListener('click', () => {
        const { editElementDialog } = elements;
        editElementDialog.showModal();

        const itemId = state.currentSelectedItemId;
        const categoryName = state.currentSelectedCategory;

        state.currentSelectedItemId = 0;
        state.currentSelectedCategory = "";

        if (itemId !== 0 && categoryName === "") {
            buildItemEditDialog(itemId, editElementDialog);
        }

        if (categoryName !== "" && itemId === 0) {
            buildCategoryEditDialog(categoryName, editElementDialog);
        }
    });
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
        <div class="edit-item-wrapper dialog-wrapper">
            <h2 class="title">Edit item "${item.name}"</h2>
            <div style="margin-bottom: 10px;">
                <p style="color: rgba(255, 255, 255, 0.2); font-style: italic; font-size: 0.8rem;">ID: ${item.id}</p>
                <p style="color: rgba(255, 255, 255, 0.2); font-style: italic; font-size: 0.8rem;">Type: ${item.item_type}</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
                    <input type="text" id="itemNameEdit" value="${item.name}" style="width: 100%; padding: 8px; box-sizing: border-box;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Icon URL <span style="font-weight: normal; font-style: italic; color: rgba(255, 255, 255, 0.2); font-size: 0.8rem;"> It can also be an emoji</span></label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="text" id="itemIcon" value="${item.icon}" style="flex-grow: 1; padding: 8px;">
                        <div style="background: #0b1021; padding: 5px; border-radius: 4px; display: flex; align-items: center;">
                            <img src="${item.icon}" id="iconPreview" width="30px" height="30px" style="object-fit: contain;">
                        </div>
                    </div>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">URL</label>
                    <input type="url" id="itemUrlEdit" value="${item.url}" style="width: 100%; padding: 8px; box-sizing: border-box;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Category</label>
                    <select id="itemCategoryEdit" style="width: 100%; padding: 8px;">
                        <option value="${item.category}" selected>${item.category}</option>
                        <option value="newCategory">- New category -</option>
                        ${categoriesOptions}
                    </select>
                </div>
                <div id="newCategoryWrapperEdit" style="display: none; background: #0b1021; padding: 10px; border-radius: 4px;">
                    <label style="display: block; margin-bottom: 5px;">New category name</label>
                    <input type="text" id="newCategoryEdit" style="width: 100%; padding: 8px; box-sizing: border-box;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Opening method</label>
                    <select id="openingMethodEdit" style="width: 100%; padding: 8px;">
                        <option value="true" ${item.tabType === 'true' ? 'selected' : ''}>New tab</option>
                        <option value="false" ${item.tabType === 'false' ? 'selected' : ''}>Same tab</option>
                    </select>
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
        <div class="edit-item-wrapper dialog-wrapper">
            <h2 class="title">Edit iframe "${item.name}"</h2>
            <div style="margin-bottom: 10px;">
                <p style="color: rgba(255, 255, 255, 0.2); font-style: italic; font-size: 0.8rem;">ID: ${item.id}</p>
                <p style="color: rgba(255, 255, 255, 0.2); font-style: italic; font-size: 0.8rem;">Type: ${item.item_type}</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
                    <input type="text" id="itemNameEdit" value="${item.name}" style="width: 100%; padding: 8px; box-sizing: border-box;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">URL</label>
                    <input type="url" id="itemUrlEdit" value="${item.url}" style="width: 100%; padding: 8px; box-sizing: border-box;">
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
                newCategoryWrapperEdit.style.display = "block";
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
            dialog.close();
        });
    }
}

// --- Category edit form ---

function buildCategoryEditDialog(categoryName, dialog) {
    dialog.innerHTML = `
        <div class="edit-item-wrapper dialog-wrapper">
            <h2 class="title">Edit category "${categoryName}"</h2>
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
                    <input type="text" id="categoryNameEdit" value="${categoryName}" style="width: 100%; padding: 8px; box-sizing: border-box;">
                </div>
            </div>
            <div class="dialog-actions">
                <button type="button" class="success-btn" id="applyCategoryBtn">Apply</button>
                <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
            </div>
        </div>`;

    const applyCategoryBtn = document.getElementById('applyCategoryBtn');
    if (applyCategoryBtn) {
        applyCategoryBtn.addEventListener('click', () => {
            const newName = document.getElementById('categoryNameEdit').value;
            apiUpdateCategoryName(categoryName, newName)
                .then(() => updateDashboard())
                .catch(err => alert('Error: ' + err.message));
            dialog.close();
        });
    }
}
