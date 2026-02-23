// ================================
//         DELETE DIALOG
// ================================

import { closeDialog, openDialog } from '../utils.js';
import { elements } from '../dom.js';
import { apiDeleteItem, apiDeleteCategory } from '../api.js';
import { updateDashboard } from '../dashboard.js';

export function openDeleteDialog(target) {
    const { deleteElementDialog } = elements;
    deleteElementDialog.innerHTML = `<p style="padding-left: 16px;">Loading...</p>`;

    openDialog(deleteElementDialog);

    if (target.dataset.type === "item" && target.dataset.id !== "0") {
        const itemId = target.dataset.id;
        const itemName = target.dataset.name;
        const itemType = target.dataset.typeitem;

        deleteElementDialog.innerHTML = `
            <div class="delete-element-wrapper">
                <h2 class="title">Delete ${itemType} "${itemName}"</h2>
                <div class="section-container">
                    <p>⚠️ Are you sure?</p>
                </div>
                <div class="dialog-actions">
                    <button class="cancel-btn" id="confirm-delete-btn">Yes</button>
                    <button id="cancel-btn">Cancel</button>
                </div>
            </div>
        `;

        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            apiDeleteItem(itemId)
                .then(() => {
                    closeDialog(deleteElementDialog);
                    updateDashboard();
                })
                .catch(err => alert('Error: ' + err.message));
        });
    }

    if (target.dataset.type === "category" && target.dataset.category !== "") {
        const categoryName = target.dataset.name;

        deleteElementDialog.innerHTML = `
            <div class="delete-element-wrapper">
                <h2 class="title">Delete category "${categoryName}"</h2>
                <div class="section-container">
                    <p>⚠️ Are you sure? <span style="text-decoration: underline;">All items</span> in this category will be <span style="text-decoration: underline;">deleted</span>.</p>
                </div>
                <div class="dialog-actions">
                    <button class="cancel-btn" id="confirm-delete-btn">Yes</button>
                    <button id="cancel-btn">Cancel</button>
                </div>
            </div>
        `;

        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            apiDeleteCategory(categoryName)
                .then(() => {
                    closeDialog(deleteElementDialog);
                    updateDashboard();
                })
                .catch(err => alert('Error: ' + err.message));
        });
    }
}