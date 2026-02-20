// ================================
//     COLOR PERSONALIZATION
// ================================

import { elements } from './dom.js';

const defaultColors = {
    'color-primary': '#6f60eb',
    'bg-main': '#141b33',
    'bg-secondary': '#0b1021',
    'bg-menu': '#1f294d',
    'bg-item': '#141b33',
    'color-text': '#ffffff',
    'color-category': '#6f60eb',
    'color-category-header': '#503fe4',
    'color-iframe': '#60d4eb',
    'color-iframe-header': '#3fb9e4',
};

const colorInputIds = {
    'color-primary': 'color-primary',
    'bg-main': 'color-bg-main',
    'bg-secondary': 'color-bg-secondary',
    'bg-menu': 'color-bg-menu',
    'bg-item': 'color-bg-item',
    'color-text': 'color-text',
    'color-category': 'color-category',
    'color-category-header': 'color-category-header',
    'color-iframe': 'color-iframe',
    'color-iframe-header': 'color-iframe-header',
};

function getColorInputs() {
    const inputs = {};
    for (const [varName, elementId] of Object.entries(colorInputIds)) {
        inputs[varName] = document.getElementById(elementId);
    }
    return inputs;
}

export function loadColors() {
    for (const [varName, defaultValue] of Object.entries(defaultColors)) {
        let storedValue = localStorage.getItem(varName);
        if (!storedValue) {
            storedValue = defaultValue;
            localStorage.setItem(varName, defaultValue);
        }
        document.documentElement.style.setProperty('--' + varName, storedValue);
    }
}

function saveColors() {
    const inputs = getColorInputs();
    for (const [varName, input] of Object.entries(inputs)) {
        if (input) {
            localStorage.setItem(varName, input.value);
            document.documentElement.style.setProperty('--' + varName, input.value);
        }
    }
}

function resetColors() {
    const inputs = getColorInputs();
    for (const [varName, defaultValue] of Object.entries(defaultColors)) {
        if (inputs[varName]) {
            inputs[varName].value = defaultValue;
        }
    }
}

export function initCustomization() {
    document.getElementById('save-colors-btn').addEventListener('click', saveColors);
    document.getElementById('reset-colors-btn').addEventListener('click', resetColors);

    document.getElementById('customize-btn').addEventListener('click', () => {
        elements.customizeDialog.showModal();

        const inputs = getColorInputs();
        const root = getComputedStyle(document.documentElement);

        for (const [varName, input] of Object.entries(inputs)) {
            if (input) {
                input.value = root.getPropertyValue('--' + varName).trim();
            }
        }
    });
}
