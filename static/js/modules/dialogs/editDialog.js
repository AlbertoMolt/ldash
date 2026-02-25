// ================================
//          EDIT DIALOG
// ================================

import { closeDialog, openDialog } from '../utils.js';
import { elements } from '../dom.js';
import { fetchItemData, fetchItemCategories, apiUpdateItem, apiUpdateCategoryName } from '../api.js';
import { updateDashboard } from '../dashboard.js';
import { loadTemplate } from '../templateLoader.js';

export function openEditDialog(target) {
    const { editElementDialog } = elements;
    editElementDialog.innerHTML = `<p style="padding-left: 16px;">Loading...</p>`;
    openDialog(editElementDialog);

    if (target.dataset.type === 'item' && target.dataset.id !== '0') {
        buildItemEditDialog(target.dataset.id, editElementDialog);
    }

    if (target.dataset.type === 'category' && target.dataset.category !== '') {
        buildCategoryEditDialog(target.dataset.category, editElementDialog);
    }
}

// --- Item edit ---
async function buildItemEditDialog(itemId, dialog) {
    try {
        const [item, cats] = await Promise.all([
            fetchItemData(itemId),
            fetchItemCategories()
        ]);

        const templatePath = item.item_type === 'iframe'
            ? 'dialogs/edit-iframe.html'
            : 'dialogs/edit-item.html';

        const html = await loadTemplate(templatePath);
        dialog.innerHTML = html;

        // Fill title
        dialog.querySelector('#editItemTitle').textContent =
            `Edit "${item.name}" · ${item.item_type} · #${item.id}`;

        // Fill common fields
        dialog.querySelector('#itemNameEdit').value = item.name;
        dialog.querySelector('#itemUrlEdit').value  = item.url;

        if (item.item_type === 'item') {
            setupItemEditFields(dialog, item, cats);
        }

        attachItemEditSubmit(dialog, item, itemId);
    } catch (err) {
        alert(err);
    }
}

function setupItemEditFields(dialog, item, cats) {
    const iconInput      = dialog.querySelector('#itemIcon');
    const iconPreview    = dialog.querySelector('#iconPreview');
    const categorySelect = dialog.querySelector('#itemCategoryEdit');
    const newCatWrapper  = dialog.querySelector('#newCategoryWrapperEdit');
    const newCatInput    = dialog.querySelector('#newCategoryEdit');
    const openingMethod  = dialog.querySelector('#openingMethodEdit');

    // Icon
    iconInput.value = item.icon;
    iconPreview.src = item.icon || '/static/assets/preview-icon.svg';
    iconInput.addEventListener('input', () => { iconPreview.src = iconInput.value; });

    // Opening method
    openingMethod.value = item.tabType;

    // Categories
    const currentOpt = document.createElement('option');
    currentOpt.value = item.category;
    currentOpt.textContent = item.category;
    currentOpt.selected = true;
    categorySelect.appendChild(currentOpt);

    const newOpt = document.createElement('option');
    newOpt.value = 'newCategory';
    newOpt.textContent = '- New category -';
    categorySelect.appendChild(newOpt);

    cats.filter(c => c !== item.category).forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
    });

    categorySelect.addEventListener('change', () => {
        newCatWrapper.style.display = categorySelect.value === 'newCategory' ? '' : 'none';
    });

    newCatInput.addEventListener('input', () => {});
}

function attachItemEditSubmit(dialog, item, itemId) {
    dialog.querySelector('#applyItemBtn').addEventListener('click', () => {
        const name = dialog.querySelector('#itemNameEdit').value;
        const url  = dialog.querySelector('#itemUrlEdit').value;

        if (item.item_type === 'item') {
            const categorySelect = dialog.querySelector('#itemCategoryEdit');
            const newCatInput    = dialog.querySelector('#newCategoryEdit');
            const icon           = dialog.querySelector('#itemIcon').value;
            const tabType        = dialog.querySelector('#openingMethodEdit').value;

            let finalCategory = categorySelect.value === 'newCategory'
                ? newCatInput.value.trim()
                : categorySelect.value;

            if (!finalCategory) { alert('Please enter a category name'); return; }

            apiUpdateItem(itemId, name, 'item', icon, url, finalCategory, tabType)
                .then(() => updateDashboard());
        }

        if (item.item_type === 'iframe') {
            apiUpdateItem(itemId, name, 'iframe', '', url, '', '')
                .then(() => updateDashboard());
        }

        closeDialog(dialog);
    });
}

// --- Category edit ---
async function buildCategoryEditDialog(categoryName, dialog) {
    try {
        const html = await loadTemplate('dialogs/edit-category.html');
        dialog.innerHTML = html;

        dialog.querySelector('#categoryNameEdit').value = categoryName;

        dialog.querySelector('#applyCategoryBtn').addEventListener('click', () => {
            const newName = dialog.querySelector('#categoryNameEdit').value;
            apiUpdateCategoryName(categoryName, newName)
                .then(() => updateDashboard())
                .catch(err => alert('Error: ' + err.message));
            closeDialog(dialog);
        });
    } catch (err) {
        alert(err);
    }
}
