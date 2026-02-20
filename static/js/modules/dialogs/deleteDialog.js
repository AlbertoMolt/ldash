// ================================
//         DELETE DIALOG
// ================================

import state from '../state.js';
import { elements } from '../dom.js';
import { fetchItemData, apiDeleteItem, apiDeleteCategory } from '../api.js';
import { updateDashboard } from '../dashboard.js';
import { cancelOperation } from './dialogUtils.js';

// Expose to inline onclick handlers
window.deleteItem = deleteItem;
window.deleteCategory = deleteCategory;
window.cancelOperation = cancelOperation;

export function initDeleteDialog() {
    document.getElementById('delete-element-btn').addEventListener('click', () => {
        const { deleteElementDialog } = elements;
        deleteElementDialog.showModal();

        const itemId = state.currentSelectedItemId;
        const categoryName = state.currentSelectedCategory;

        state.currentSelectedItemId = 0;
        state.currentSelectedCategory = "";

        if (categoryName === "" && itemId !== 0) {
            fetchItemData(itemId)
                .then(item => {
                    deleteElementDialog.innerHTML = `
                        <h2>Delete ${item.item_type} "${item.name}"</h2>
                        <p>⚠️ Are you sure?<p>
                        <div class="dialog-actions">
                            <button type="button" onclick="deleteItem(${itemId})" style="padding: 10px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Yes</button>
                            <button type="button" onclick="cancelOperation()" style="padding: 10px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px;">Cancel</button>
                        </div>
                    `;
                })
                .catch(err => alert(err));
        }

        if (categoryName !== "" && itemId === 0) {
            deleteElementDialog.innerHTML = `
                <h2>Delete category "${categoryName}"</h2>
                <p>⚠️ Are you sure? <span style="text-decoration: underline;">All items</span> in this category will be <span style="text-decoration: underline;">deleted</span>.<p>
                <div class="dialog-actions">
                    <button type="button" onclick="deleteCategory('${categoryName}')" style="padding: 10px 20px; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px;">Yes</button>
                    <button type="button" onclick="cancelOperation()" style="padding: 10px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px;">Cancel</button>
                </div>
            `;
        }
    });
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
