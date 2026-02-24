// ================================
//       CREATE ITEM DIALOG
// ================================

import { closeDialog, openDialog } from '../utils.js';
import { elements } from '../dom.js';
import { fetchItemCategories, apiCreateItem } from '../api.js';
import { updateDashboard } from '../dashboard.js';

export function openCreateDialog(preselectedCategory = "") {
    const { createItemDialog } = elements;
    createItemDialog.innerHTML = `<p style="padding-left: 16px;">Loading...</p>`;

    openDialog(createItemDialog)

    fetchItemCategories()
        .then(itemCategories => {
            const categoryOptions = itemCategories
                .map(cat => {
                    const selected = cat === preselectedCategory ? 'selected' : '';
                    return `<option value="${cat}" ${selected}>${cat}</option>`;
                })
                .join("");

            createItemDialog.innerHTML = buildCreateForm(categoryOptions, preselectedCategory);
            attachCreateListeners(createItemDialog, preselectedCategory);
        })
        .catch(err => alert(err));
}

function buildCreateForm(categoryOptions, preselectedCategory) {
    const showNewCategoryWrapper = preselectedCategory === "";
    const categorySelectValue = preselectedCategory === "" ? "newCategory" : preselectedCategory;

    return `
    <div class="create-item-wrapper">
        <h2 class="title" id="createItemTitle">Create item</h2>

        <div class="section-container">
            <div class="section">
                <h3 class="section-title">Item type</h3>
                <div class="section-content">
                    <div>
                        <input type="radio" id="item-type-item" name="radio-item-type" value="item" required checked>
                        <label for="item-type-item">Item</label>
                        <input type="radio" id="item-type-iframe" name="radio-item-type" value="iframe">
                        <label for="item-type-iframe">Iframe</label>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Name</h3>
                <div class="section-content">
                    <input type="text" id="itemNameCreate" placeholder="Item name..." style="border: none;">
                </div>
            </div>

            <div class="section" id="iconURLWrapperCreate">
                <h3 class="section-title">Icon URL <span class="section-description">Emoji supported</span></h3>
                <div class="section-content">
                    <input type="text" id="itemIcon" placeholder="https://..." style="width: 100%; border: none;">
                    <div style="min-width: 30px; min-height: 30px; display: flex; align-items: center;">
                        <img src="/static/assets/preview-icon.svg" id="iconPreview" width="30px" height="30px" style="object-fit: contain;">
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">URL</h3>
                <div class="section-content">
                    <input type="url" id="itemUrlCreate" placeholder="https://google.com" style="width: 100%; border: none;">
                </div>
            </div>

            <div class="section" id="categoryWrapperCreate">
                <h3 class="section-title">Category</h3>
                <div class="section-content">
                    <select id="itemCategoryCreate" style="width: 100%; border: none;">
                        <option value="newCategory" ${categorySelectValue === "newCategory" ? "selected" : ""}>- New category -</option>
                        ${categoryOptions}
                    </select>
                </div>
                <div class="section-content" id="newCategoryWrapperCreate" style="display: ${showNewCategoryWrapper ? '' : 'none'};">
                    <label>New category name</label>
                    <input type="text" id="newCategoryCreate" value="${preselectedCategory}">
                </div>
            </div>

            <div class="section" id="openingMethodWrapperCreate">
                <h3 class="section-title">Opening method</h3>
                <div class="section-content">
                    <select id="openingMethodCreate" style="width: 100%; border: none;">
                        <option value="true" selected>New tab</option>
                        <option value="false">Same tab</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="dialog-actions">
            <button type="button" class="success-btn" id="createItemBtnDialog">Create</button>
            <button type="button" class="cancel-btn" id="cancel-btn">Cancel</button>
        </div>
    </div>
    `;
}

function attachCreateListeners(dialog, preselectedCategory) {
    const createItemTitle = document.getElementById('createItemTitle');
    const itemNameCreate = document.getElementById('itemNameCreate');
    const itemUrlCreate = document.getElementById('itemUrlCreate');
    const itemTypeItem = document.getElementById('item-type-item');
    const itemTypeIframe = document.getElementById('item-type-iframe');
    const itemCategoryCreate = document.getElementById('itemCategoryCreate');
    const newCategoryWrapperCreate = document.getElementById('newCategoryWrapperCreate');
    const newCategoryCreate = document.getElementById('newCategoryCreate');
    const categoryWrapperCreate = document.getElementById('categoryWrapperCreate');

    let selectedCategory = preselectedCategory || "";

    // Category select handler
    if (itemCategoryCreate) {
        itemCategoryCreate.addEventListener('change', () => {
            if (itemCategoryCreate.value === "newCategory") {
                newCategoryWrapperCreate.style.display = "";
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
    const iconPreview = document.getElementById('iconPreview');
    const iconPreviewContainer = iconPreview.parentElement;

    if (itemIconCreate) {
        itemIconCreate.addEventListener('input', () => {
            const value = itemIconCreate.value.trim();

            const existingEmoji = iconPreviewContainer.querySelector('.emoji-preview');
            if (existingEmoji) existingEmoji.remove();

            if (!value) {
                iconPreview.style.display = '';
                iconPreview.src = '/static/assets/preview-icon.svg';
                return;
            }

            const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;
            if (emojiRegex.test(value)) {
                iconPreview.style.display = 'none';
                const emojiSpan = document.createElement('span');
                emojiSpan.className = 'emoji-preview';
                emojiSpan.textContent = value;
                emojiSpan.style.fontSize = '1.5rem';
                iconPreviewContainer.appendChild(emojiSpan);
            } else {
                iconPreview.style.display = '';
                iconPreview.src = value;
                iconPreview.onerror = () => {
                    iconPreview.src = '/static/assets/preview-icon.svg';
                };
            }
        });
    }

    // Item type radio toggle
    const itemTypeRadios = document.querySelectorAll('input[name="radio-item-type"]');
    itemTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const iconWrapper = document.getElementById('iconURLWrapperCreate');
            const openingMethodWrapper = document.getElementById('openingMethodWrapperCreate');

            if (e.target.value === 'item') {
                if (iconWrapper) iconWrapper.style.display = '';
                if (openingMethodWrapper) openingMethodWrapper.style.display = '';
                if (categoryWrapperCreate) categoryWrapperCreate.style.display = '';
                if (itemCategoryCreate.value === "newCategory") {
                    newCategoryWrapperCreate.style.display = '';
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

            closeDialog(dialog);
        });
    }
}