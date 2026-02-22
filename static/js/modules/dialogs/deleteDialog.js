// ================================
//         DELETE DIALOG
// ================================

import { elements } from '../dom.js';
import { apiDeleteItem, apiDeleteCategory } from '../api.js';
import { updateDashboard } from '../dashboard.js';
import { cancelOperation } from '../operationsUtils.js';

// Expose to inline onclick handlers
window.deleteItem = deleteItem;
window.deleteCategory = deleteCategory;
window.cancelOperation = cancelOperation;

export function openDeleteDialog(target) {
    const { deleteElementDialog } = elements;
    deleteElementDialog.showModal();

    if (target.dataset.type === "item" && target.dataset.id !== "0") {
        const itemId = target.dataset.id;
        const itemName = target.dataset.name;
        const itemType = target.dataset.typeitem;

        deleteElementDialog.innerHTML = `
            <h2>Delete ${itemType} "${itemName}"</h2>
            <p>⚠️ Are you sure?<p>
            <div class="dialog-actions">
                <button type="button" onclick="deleteItem(${itemId})" style="padding: 10px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Yes</button>
                <button type="button" onclick="cancelOperation()" style="padding: 10px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px;">Cancel</button>
            </div>
        `;
    }

    if (target.dataset.type === "category" && target.dataset.category !== "") {
        const categoryName = target.dataset.name;
        deleteElementDialog.innerHTML = `
            <h2>Delete category "${categoryName}"</h2>
            <p>⚠️ Are you sure? <span style="text-decoration: underline;">All items</span> in this category will be <span style="text-decoration: underline;">deleted</span>.<p>
            <div class="dialog-actions">
                <button type="button" onclick="deleteCategory('${categoryName}')" style="padding: 10px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Yes</button>
                <button type="button" onclick="cancelOperation()" style="padding: 10px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px;">Cancel</button>
            </div>
        `;
    }
}

function deleteItem(itemId) {
    apiDeleteItem(itemId)
        .then(() => {
            elements.deleteElementDialog.close();
            updateDashboard();
        })
        .catch(err => alert('Error: ' + err.message));
}

function deleteCategory(categoryName) {
    apiDeleteCategory(categoryName)
        .then(() => {
            elements.deleteElementDialog.close();
            updateDashboard();
        })
        .catch(err => alert('Error: ' + err.message));
}