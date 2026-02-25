// ================================
//       APP INITIALIZATION
// ================================
// Entry point: <script type="module" src="/static/js/app.js"></script>

import state from './modules/state.js';

// Features
import { startStatusPolling } from './modules/statusPing.js';
import { loadProfilesUi, getDefaultProfile, initProfileListeners } from './modules/profiles.js';
import { loadColors } from './modules/customization.js';
import { loadSearchEndpoint, loadSearchBar, initSearchBar } from './modules/searchBar.js';
import { loadConfigInputState, initConfig } from './modules/config.js';
import { updateDashboard } from './modules/dashboard.js';

// Dialogs
import { initCancelButtons } from './modules/operationsUtils.js';
import { closeAllDialogs } from './modules/utils.js';

// UI modules
import { initContextMenu } from './modules/contextMenu.js';
import { initCollapse } from './modules/collapse.js';
import { initShortcuts } from './modules/shortcuts.js';
import { initToolbarButtons } from './modules/toolbar.js';
import { initDragAndDrop } from './modules/dragAndDrop.js';
import { applyPingVisibility } from './modules/statusPing.js';


// --- Track mouse position ---
document.addEventListener('mousemove', (e) => {
    state.currentMouseX = e.clientX;
    state.currentMouseY = e.clientY;
});

// --- Initialize all modules ---
initCancelButtons();
initContextMenu();
initCollapse();
initConfig();
initSearchBar();
initProfileListeners();
initShortcuts();
initToolbarButtons();
initDragAndDrop();


window.addEventListener('popstate', (e) => {
    state.dialogOpen = false;
    state.disableDialogs = false;
    closeAllDialogs();
});

// --- Load persisted settings ---
window.onload = () => {
    startStatusPolling();
    loadProfilesUi();
    loadColors();
    loadSearchEndpoint();
    loadSearchBar();
    loadConfigInputState();
    applyPingVisibility();
};

// --- Initial render ---
document.addEventListener("DOMContentLoaded", async () => {
    state.currentProfile = getDefaultProfile();
    updateDashboard();
});
