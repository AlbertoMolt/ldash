// ================================
//      PROFILE MANAGEMENT
// ================================

import state from './state.js';
import { elements } from './dom.js';
import { setCookie, getCookie, existCookie } from './utils.js';
import { fetchItemProfiles } from './api.js';
import { updateDashboard } from './dashboard.js';

export function getDefaultProfile() {
    if (existCookie("profile")) {
        return getCookie("profile");
    }
    setCookie("profile", "default", 365);
    return getCookie("profile");
}

export async function loadProfilesUi() {
    const { selectedProfile } = elements;
    const profiles = await fetchItemProfiles();

    for (const profile of profiles) {
        const option = document.createElement('option');
        option.value = profile;
        option.textContent = profile;
        selectedProfile.add(option);
    }
    selectedProfile.value = getDefaultProfile();
}

export async function loadProfilesForConfig() {
    const { defaultProfile } = elements;
    const profiles = await fetchItemProfiles();

    for (const profile of profiles) {
        const option = document.createElement('option');
        option.value = profile;
        option.textContent = profile;
        defaultProfile.add(option);
    }
    defaultProfile.value = getCookie("profile");
}

export function initProfileListeners() {
    const { selectedProfile, defaultProfile, enablePingStatus, createProfileDialog } = elements;

    selectedProfile.addEventListener('change', async () => {
        if (selectedProfile.value === "_new%profile_") {
            createProfileDialog.showModal();
        } else {
            state.currentProfile = selectedProfile.value;
            updateDashboard();
        }
    });

    defaultProfile.addEventListener('change', () => {
        setCookie("profile", defaultProfile.value, 365);
    });

    enablePingStatus.addEventListener('change', () => {
        setCookie("statusPing", enablePingStatus.checked, 365);
    });
}

export function createProfile() {
    const createProfileInput = document.getElementById("create-profile-input");
    state.currentProfile = createProfileInput.value;
    elements.createProfileDialog.close();
    updateDashboard();
}

// Expose to inline onclick if needed
window.createProfile = createProfile;
