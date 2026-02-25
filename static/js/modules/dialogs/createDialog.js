// ================================
//       CREATE ITEM DIALOG
// ================================

import { closeDialog, openDialog } from '../utils.js';
import { elements } from '../dom.js';
import { fetchItemCategories, apiCreateItem } from '../api.js';
import { updateDashboard } from '../dashboard.js';
import { loadTemplate } from '../templateLoader.js';

export async function openCreateDialog(preselectedCategory = "") {
    const { createItemDialog } = elements;
    createItemDialog.innerHTML = `<p style="padding-left: 16px;">Loading...</p>`;
    openDialog(createItemDialog);

    try {
        const [html, itemCategories] = await Promise.all([
            loadTemplate('dialogs/create-item.html'),
            fetchItemCategories()
        ]);

        createItemDialog.innerHTML = html;
        setupCreateForm(createItemDialog, itemCategories, preselectedCategory);
    } catch (err) {
        alert(err);
    }
}

function setupCreateForm(dialog, itemCategories, preselectedCategory) {
    const createItemTitle     = dialog.querySelector('#createItemTitle');
    const itemNameCreate      = dialog.querySelector('#itemNameCreate');
    const itemUrlCreate       = dialog.querySelector('#itemUrlCreate');
    const itemTypeItem        = dialog.querySelector('#item-type-item');
    const itemTypeIframe      = dialog.querySelector('#item-type-iframe');
    const itemCategoryCreate  = dialog.querySelector('#itemCategoryCreate');
    const newCategoryWrapper  = dialog.querySelector('#newCategoryWrapperCreate');
    const newCategoryCreate   = dialog.querySelector('#newCategoryCreate');
    const categoryWrapper     = dialog.querySelector('#categoryWrapperCreate');
    const iconWrapper         = dialog.querySelector('#iconURLWrapperCreate');
    const openingMethodWrapper = dialog.querySelector('#openingMethodWrapperCreate');
    const iconInput           = dialog.querySelector('#itemIcon');
    const iconPreview         = dialog.querySelector('#iconPreview');

    // --- Populate categories ---
    itemCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        if (cat === preselectedCategory) opt.selected = true;
        itemCategoryCreate.appendChild(opt);
    });

    if (preselectedCategory) {
        itemCategoryCreate.value = preselectedCategory;
        newCategoryWrapper.style.display = 'none';
    } else {
        itemCategoryCreate.value = 'newCategory';
        newCategoryWrapper.style.display = '';
    }

    newCategoryCreate.value = preselectedCategory || '';

    // --- Category select ---
    itemCategoryCreate.addEventListener('change', () => {
        newCategoryWrapper.style.display = itemCategoryCreate.value === 'newCategory' ? '' : 'none';
    });

    // --- Icon preview ---
    iconInput.addEventListener('input', () => {
        const value = iconInput.value.trim();
        const iconPreviewContainer = iconPreview.parentElement;
        const existingEmoji = iconPreviewContainer.querySelector('.emoji-preview');
        if (existingEmoji) existingEmoji.remove();

        if (!value) {
            iconPreview.style.display = '';
            iconPreview.src = '/static/assets/preview-icon.svg';
            return;
        }

        if (/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u.test(value)) {
            iconPreview.style.display = 'none';
            const span = document.createElement('span');
            span.className = 'emoji-preview';
            span.textContent = value;
            span.style.fontSize = '1.5rem';
            iconPreviewContainer.appendChild(span);
        } else {
            iconPreview.style.display = '';
            iconPreview.src = value;
            iconPreview.onerror = () => { iconPreview.src = '/static/assets/preview-icon.svg'; };
        }
    });

    // --- Item type toggle ---
    dialog.querySelectorAll('input[name="radio-item-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isItem = e.target.value === 'item';
            iconWrapper.style.display            = isItem ? '' : 'none';
            openingMethodWrapper.style.display   = isItem ? '' : 'none';
            categoryWrapper.style.display        = isItem ? '' : 'none';
            if (isItem && itemCategoryCreate.value === 'newCategory') {
                newCategoryWrapper.style.display = '';
            } else if (!isItem) {
                newCategoryWrapper.style.display = 'none';
            }
            createItemTitle.textContent = isItem ? 'Create item' : 'Create iframe';
            itemNameCreate.placeholder  = isItem ? 'Item name...' : 'Iframe name...';
            itemUrlCreate.placeholder   = 'https://...';
        });
    });

    // --- Submit ---
    dialog.querySelector('#createItemBtnDialog').addEventListener('click', () => {
        if (itemTypeItem.checked) {
            let finalCategory = itemCategoryCreate.value === 'newCategory'
                ? newCategoryCreate.value.trim()
                : itemCategoryCreate.value;

            if (!finalCategory) { alert('Please enter a category name'); return; }

            apiCreateItem(
                itemNameCreate.value, 'item',
                iconInput.value, itemUrlCreate.value,
                finalCategory,
                dialog.querySelector('#openingMethodCreate').value
            ).then(() => updateDashboard());
        }

        if (itemTypeIframe.checked) {
            apiCreateItem(
                itemNameCreate.value, 'iframe', '',
                itemUrlCreate.value, '', ''
            ).then(() => updateDashboard());
        }

        closeDialog(dialog);
    });
}
