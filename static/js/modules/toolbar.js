// ================================
//         TOOLBAR BUTTONS
// ================================

import { elements } from './dom.js';
import { loadProfilesForConfig } from './profiles.js';
import { openCreateDialog } from './dialogs/createDialog.js';
import { openColorCustomization } from './customization.js';
import { startOrganizeMode } from './dragAndDrop.js';

export function initToolbarButtons() {
    document.getElementById("config-btn").addEventListener("click", () => {
        loadProfilesForConfig();
        elements.configDialog.showModal();
    });

    document.getElementById("create-item-btn").addEventListener("click", () => {
        openCreateDialog();
    });

    document.getElementById("customize-btn").addEventListener("click", () => {
        openColorCustomization();
    });

    document.getElementById("organize-btn").addEventListener("click", () => {
        startOrganizeMode();
    });
}