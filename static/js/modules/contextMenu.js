// ================================
//         CONTEXT MENU
// ================================

import state from './state.js';
import { elements } from './dom.js';

export function initContextMenu() {
    document.addEventListener("contextmenu", (event) => {
        try {
            const itemWrapper = event.target.closest("[data-id]");
            const categoryWrapper = event.target.closest(".category");
            const { contextMenu } = elements;

            if (itemWrapper) {
                event.preventDefault();
                state.currentSelectedItemId = Number(itemWrapper.dataset.id);
                state.currentSelectedCategory = "";

                contextMenu.style.display = 'block';
                contextMenu.style.top = state.currentMouseY + 'px';
                contextMenu.style.left = state.currentMouseX + 'px';
            } else if (categoryWrapper) {
                event.preventDefault();
                state.currentSelectedCategory = categoryWrapper.dataset.category;
                state.currentSelectedItemId = 0;

                contextMenu.style.display = 'block';
                contextMenu.style.top = state.currentMouseY + 'px';
                contextMenu.style.left = state.currentMouseX + 'px';
            }
        } catch (error) {
            console.error(error);
        }
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest('#contextMenu') || event.target.closest('#toolbox')) {
            elements.contextMenu.style.display = "none";
        }
    });
}
