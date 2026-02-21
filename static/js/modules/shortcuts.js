// ================================
//            SHORTCUTS
// ================================

import { cancelOperation } from './dialogs/dialogUtils.js';

export function initShortcuts() {
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
            cancelOperation();
        }
        if (e.key === 'c') {
            const btn = document.getElementById('create-item-btn');
            if (btn && !btn.disabled) btn.click();
        }
    });
}