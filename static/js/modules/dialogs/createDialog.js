// ================================
//       CREATE ITEM DIALOG
// ================================

import { elements } from '../dom.js';
import { fetchItemCategories, apiCreateItem } from '../api.js';
import { updateDashboard } from '../dashboard.js';

export function initCreateDialog() {
    document.getElementById('create-item-btn').addEventListener('click', () => {
        const { createItemDialog } = elements;
        createItemDialog.showModal();

        fetchItemCategories()
            .then(itemCategories => {
                const categoryOptions = itemCategories
                    .map(cat => `<option value="${cat}">${cat}</option>`)
                    .join("");

                createItemDialog.innerHTML = buildCreateForm(categoryOptions);
                attachCreateListeners(createItemDialog);
            })
            .catch(err => alert(err));
    });
}

function buildCreateForm(categoryOptions) {
    return `
        <div class="create-item-wrapper dialog-wrapper" style="font-family: sans-serif; padding: 20px; color: white; border-radius: 8px;">
            <h2 class="title" id="createItemTitle" style="margin-top: 0; padding-bottom: 10px;">Create item</h2>

            <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Type</label>
                    <input type="radio" id="item-type-item" name="radio-item-type" value="item" required checked>
                    <label for="item-type-item">Item</label>
                    <input type="radio" id="item-type-iframe" name="radio-item-type" value="iframe">
                    <label for="item-type-iframe">Iframe</label>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name</label>
                    <input type="text" id="itemNameCreate" placeholder="Item name..." style="width: 100%; padding: 8px; box-sizing: border-box;">
                </div>

                <div id="iconURLWrapperCreate">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Icon URL <span style="font-weight: normal; font-style: italic; color: rgba(255, 255, 255, 0.2); font-size: 0.8rem;"> It can also be an emoji</span></label>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input type="text" id="itemIcon" placeholder="https://..." style="flex-grow: 1; padding: 8px;">
                        <div style="background: #0b1021; padding: 5px; border-radius: 4px; display: flex; align-items: center; min-width: 30px; min-height: 30px;">
                            <img src="/static/assets/preview-icon.png" id="iconPreview" width="30px" height="30px" style="object-fit: contain;">
                        </div>
                    </div>
                </div>

                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">URL</label>
                    <input type="url" id="itemUrlCreate" placeholder="https://google.com" style="width: 100%; padding: 8px; box-sizing: border-box;">
                </div>

                <div id="categoryWrapperCreate">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Category</label>
                    <select id="itemCategoryCreate" style="width: 100%; padding: 8px;">
                        <option value="newCategory" selected>- New category -</option>
                        ${categoryOptions}
                    </select>
                </div>

                <div id="newCategoryWrapperCreate" style="background: #0b1021; padding: 10px; border-radius: 4px;">
                    <label style="display: block; margin-bottom: 5px;">New category name</label>
                    <input type="text" id="newCategoryCreate" style="width: 100%; padding: 8px; box-sizing: border-box;">
                </div>

                <div id="openingMethodWrapperCreate">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Opening method</label>
                    <select id="openingMethodCreate" style="width: 100%; padding: 8px;">
                        <option value="true" selected>New tab</option>
                        <option value="false">Same tab</option>
                    </select>
                </div>
            </div>

            <div class="dialog-actions">
                <button type="button" class="success-btn" id="createItemBtnDialog">Create</button>
                <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
            </div>
        </div>
    `;
}

function attachCreateListeners(dialog) {
    const createItemTitle = document.getElementById('createItemTitle');
    const itemNameCreate = document.getElementById('itemNameCreate');
    const itemUrlCreate = document.getElementById('itemUrlCreate');
    const itemTypeItem = document.getElementById('item-type-item');
    const itemTypeIframe = document.getElementById('item-type-iframe');
    const itemCategoryCreate = document.getElementById('itemCategoryCreate');
    const newCategoryWrapperCreate = document.getElementById('newCategoryWrapperCreate');
    const newCategoryCreate = document.getElementById('newCategoryCreate');
    const categoryWrapperCreate = document.getElementById('categoryWrapperCreate');

    let selectedCategory = "";

    if (itemCategoryCreate && itemCategoryCreate.value === "newCategory") {
        selectedCategory = "";
    } else if (itemCategoryCreate) {
        selectedCategory = itemCategoryCreate.value;
    }

    // Category select handler
    if (itemCategoryCreate) {
        itemCategoryCreate.addEventListener('change', () => {
            if (itemCategoryCreate.value === "newCategory") {
                newCategoryWrapperCreate.style.display = "block";
                selectedCategory = newCategoryCreate.value;
            } else {
                newCategoryWrapperCreate.style.display = "none";
                selectedCategory = itemCategoryCreate.value;
            }
        });
    }

    if (newCategoryCreate) {
        newCategoryCreate.addEventListener('input', () => {
            if (itemCategoryCreate && itemCategoryCreate.value === "newCategory") {
                selectedCategory = newCategoryCreate.value;
            }
        });
    }

    // Icon preview
    const itemIconCreate = document.getElementById('itemIcon');
    if (itemIconCreate) {
        itemIconCreate.addEventListener('input', () => {
            document.getElementById('iconPreview').src = itemIconCreate.value;
        });
    }

    // Item type radio toggle
    const itemTypeRadios = document.querySelectorAll('input[name="radio-item-type"]');
    itemTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const iconWrapper = document.getElementById('iconURLWrapperCreate');
            const openingMethodWrapper = document.getElementById('openingMethodWrapperCreate');

            if (e.target.value === 'item') {
                if (iconWrapper) iconWrapper.style.display = 'block';
                if (openingMethodWrapper) openingMethodWrapper.style.display = 'block';
                if (categoryWrapperCreate) categoryWrapperCreate.style.display = 'block';
                if (itemCategoryCreate.value === "newCategory") {
                    newCategoryWrapperCreate.style.display = 'block';
                }
                createItemTitle.innerHTML = "Create item";
                itemNameCreate.placeholder = "Item name...";
                itemUrlCreate.placeholder = "https://google.com";
            } else if (e.target.value === 'iframe') {
                if (iconWrapper) iconWrapper.style.display = 'none';
                if (openingMethodWrapper) openingMethodWrapper.style.display = 'none';
                if (categoryWrapperCreate) categoryWrapperCreate.style.display = 'none';
                if (newCategoryWrapperCreate) newCategoryWrapperCreate.style.display = 'none';
                createItemTitle.innerHTML = "Create iframe";
                itemNameCreate.placeholder = "Iframe name...";
                itemUrlCreate.placeholder = "https://...";
            }
        });
    });

    // Submit button
    const createItemBtnDialog = document.getElementById('createItemBtnDialog');
    if (createItemBtnDialog) {
        createItemBtnDialog.addEventListener('click', () => {
            if (itemTypeItem.checked) {
                let finalCategory = selectedCategory;
                if (itemCategoryCreate && itemCategoryCreate.value === "newCategory") {
                    finalCategory = newCategoryCreate.value.trim();
                    if (!finalCategory) {
                        alert("Please enter a category name");
                        return;
                    }
                }
                apiCreateItem(
                    itemNameCreate.value,
                    "item",
                    document.getElementById('itemIcon').value,
                    itemUrlCreate.value,
                    finalCategory,
                    document.getElementById('openingMethodCreate').value
                ).then(() => updateDashboard());
            }

            if (itemTypeIframe.checked) {
                apiCreateItem(
                    itemNameCreate.value,
                    "iframe", "",
                    itemUrlCreate.value,
                    "", ""
                ).then(() => updateDashboard());
            }

            dialog.close();
        });
    }
}
