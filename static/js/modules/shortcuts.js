// ================================
//            SHORTCUTS
// ================================

import { cancelOperation } from './operationsUtils.js';
import { openCreateDialog } from './dialogs/createDialog.js';
import { startOrganizeMode } from './dragAndDrop.js';

function isTyping() {
    const tag = document.activeElement?.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;
}

export function initShortcuts() {
    document.addEventListener('keyup', (e) => {
        if (isTyping()) return;

        if (e.key === 'Escape') cancelOperation();
        if (e.key === 'c') openCreateDialog();
        if (e.key === 'o') startOrganizeMode();
    });
}