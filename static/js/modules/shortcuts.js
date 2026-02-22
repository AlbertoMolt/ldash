// ================================
//            SHORTCUTS
// ================================

import { cancelOperation } from './operationsUtils.js';
import { openCreateDialog } from './dialogs/createDialog.js';
import { startOrganizeMode } from './dragAndDrop.js';

export function initShortcuts() {
    document.addEventListener('keyup', (e) => {
        // Cancel
        if (e.key === 'Escape') {
            cancelOperation();
        }

        // Create
        if (e.key === 'c') {
            openCreateDialog();
        }

        // Organize
        if (e.key === 'o') {
            startOrganizeMode();
        }
    });
}