// ================================
//     CONFIG / SETTINGS DIALOG
// ================================

import { elements } from './dom.js';
import { getCookie } from './utils.js';
import { apiImportDatabase } from './api.js';
import { updateDashboard } from './dashboard.js';
import { loadProfilesForConfig } from './profiles.js';
import { reloadPage } from './utils.js';

let searchEndpointValue = "";

export function initConfig() {
    // Open config dialog
    document.getElementById('config-btn').addEventListener('click', () => {
        loadProfilesForConfig();
        elements.configDialog.showModal();
    });

    // Apply settings
    document.getElementById('apply-config-btn').addEventListener('click', () => {
        saveSearchBarConfig();
        reloadPage();
    });

    // Database import
    const fileInput = document.getElementById('file-input-import');
    const importDbBtn = document.getElementById('import-db-btn');

    importDbBtn.addEventListener('click', () => fileInput.click());

    fileInput.onchange = () => {
        if (fileInput.files.length === 0) return;

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        apiImportDatabase(formData)
            .then(() => {
                elements.configDialog.close();
                updateDashboard();
                fileInput.value = "";
            })
            .catch(err => alert(err.message));
    };
}

export function loadConfigInputState() {
    const enableSearchBarCheckBox = document.getElementById('enable-search-bar');
    const enableAutofocusSearchBarCheckBox = document.getElementById('enable-autofocus-search-bar');
    const openingSearchBarMethodSelect = document.getElementById('search-bar-opening-method');
    const statusPingCheckBox = document.getElementById('enable-ping-status');

    // SearchBar enable
    enableSearchBarCheckBox.checked = localStorage.getItem('enable-search-bar') === "true";

    const searchEndpointInput = document.getElementById('search-endpoint');
    if (searchEndpointInput) {
        searchEndpointInput.value = localStorage.getItem('search-endpoint') || "https://www.google.com/search?q=";
    }

    // Autofocus
    enableAutofocusSearchBarCheckBox.checked = localStorage.getItem('enable-autofocus-search-bar') === "true";

    // Opening method
    openingSearchBarMethodSelect.value = localStorage.getItem('search-bar-opening-method') === "_blank" ? "_blank" : "_self";

    // Ping status
    statusPingCheckBox.checked = getCookie('statusPing') === "true";
}

function saveSearchBarConfig() {
    const enableSearchBarCheckBox = document.getElementById('enable-search-bar');
    const enableAutofocusSearchBarCheckBox = document.getElementById('enable-autofocus-search-bar');
    const openingSearchBarMethodSelect = document.getElementById('search-bar-opening-method');

    // State
    localStorage.setItem('enable-search-bar', enableSearchBarCheckBox.checked ? 'true' : 'false');

    // Endpoint
    const endpoint = document.getElementById('search-endpoint').value;
    if (endpoint) {
        localStorage.setItem('search-endpoint', endpoint);
    }

    // Autofocus
    localStorage.setItem('enable-autofocus-search-bar', enableAutofocusSearchBarCheckBox.checked ? 'true' : 'false');

    // Opening method
    localStorage.setItem('search-bar-opening-method', openingSearchBarMethodSelect.value === "_blank" ? '_blank' : '_self');
}
