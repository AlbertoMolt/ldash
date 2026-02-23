// ================================
//       DIALOG UTILITIES
// ================================

import { closeAllDialogs } from './utils.js';
import { cancelOrganizeMode } from './dragAndDrop.js';
import { closeContextMenu } from './contextMenu.js';

export function cancelOperation() {
    closeAllDialogs();
    closeContextMenu();
    cancelOrganizeMode();
}

export function initCancelButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'cancel-btn') {
            cancelOperation();
        }
    });
}
