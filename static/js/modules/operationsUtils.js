// ================================
//       DIALOG UTILITIES
// ================================

import state from './state.js';
import { elements } from './dom.js';
import { cancelOrganizeMode } from './dragAndDrop.js';

export function cancelOperation() {
    const { editElementDialog, deleteElementDialog, createItemDialog, configDialog, createProfileDialog, customizeDialog } = elements;

    editElementDialog.close();
    editElementDialog.innerHTML = `<p>Loading...</p>`;

    deleteElementDialog.close();
    deleteElementDialog.innerHTML = `<p>Loading...</p>`;

    createItemDialog.close();
    configDialog.close();
    createProfileDialog.close();
    customizeDialog.close();

    elements.contextMenu.style.display = "none";

    if (state.organizeModeEnabled) {
        cancelOrganizeMode();
    }
}

export function initCancelButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'cancel-btn' || e.target.classList.contains('cancel-btn')) {
            cancelOperation();
        }
    });
}
