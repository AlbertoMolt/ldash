// ================================
//         DELETE DIALOG
// ================================

import { closeDialog, openDialog } from '../utils.js';
import { elements } from '../dom.js';
import { apiDeleteItem, apiDeleteCategory } from '../api.js';
import { updateDashboard } from '../dashboard.js';
import { loadTemplate } from '../templateLoader.js';

export async function openDeleteDialog(target) {
    const { deleteElementDialog } = elements;
    deleteElementDialog.innerHTML = `<p style="padding-left: 16px;">Loading...</p>`;
    openDialog(deleteElementDialog);

    try {
        const html = await loadTemplate('dialogs/delete.html');
        deleteElementDialog.innerHTML = html;

        if (target.dataset.type === 'item' && target.dataset.id !== '0') {
            setupDeleteItem(deleteElementDialog, target);
        } else if (target.dataset.type === 'category' && target.dataset.category !== '') {
            setupDeleteCategory(deleteElementDialog, target);
        }
    } catch (err) {
        alert(err);
    }
}

function setupDeleteItem(dialog, target) {
    const itemId   = target.dataset.id;
    const itemName = target.dataset.name;
    const itemType = target.dataset.typeitem;

    dialog.querySelector('#deleteTitle').textContent   = `Delete ${itemType} "${itemName}"`;
    dialog.querySelector('#deleteMessage').textContent = '⚠️ Are you sure?';

    dialog.querySelector('#confirm-delete-btn').addEventListener('click', () => {
        apiDeleteItem(itemId)
            .then(() => { closeDialog(dialog); updateDashboard(); })
            .catch(err => alert('Error: ' + err.message));
    });
}

function setupDeleteCategory(dialog, target) {
    const categoryName = target.dataset.name;

    dialog.querySelector('#deleteTitle').textContent = `Delete category "${categoryName}"`;
    dialog.querySelector('#deleteMessage').innerHTML =
        `⚠️ Are you sure? <span style="text-decoration:underline;">All items</span> in this category will be <span style="text-decoration:underline;">deleted</span>.`;

    dialog.querySelector('#confirm-delete-btn').addEventListener('click', () => {
        apiDeleteCategory(categoryName)
            .then(() => { closeDialog(dialog); updateDashboard(); })
            .catch(err => alert('Error: ' + err.message));
    });
}
