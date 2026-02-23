// ================================
//         CONTEXT MENU
// ================================

import state from './state.js';
import { openDeleteDialog } from './dialogs/deleteDialog.js';
import { openEditDialog } from './dialogs/editDialog.js';
import { openCreateDialog } from './dialogs/createDialog.js';
import { elements } from './dom.js';
import { openUrl } from './utils.js';
import { openingMethods } from './utils.js';

export function initContextMenu() {
    let currentContextElement = null;

    document.addEventListener("contextmenu", (event) => {
        if (state.organizeModeEnabled) return
        try {
            const target = event.target.closest('.iframe-item, .item-card, .category');

            const { contextMenu } = elements;

            if (target) {
                event.preventDefault();
                currentContextElement = target;

                if (target.dataset.type == "category") {
                    document.querySelector(".context-btn-agrupation-open").style.display = "none";
                } else {
                    document.querySelector(".context-btn-agrupation-open").style.display = "";
                }

                if (target.dataset.typeitem != "iframe") {
                    document.getElementById("full-screen-iframe-btn").style.display = "none";
                } else {
                    document.getElementById("full-screen-iframe-btn").style.display = "";
                }

                contextMenu.style.display = 'block';
                positionContextMenu(contextMenu, state.currentMouseX, state.currentMouseY);
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

    document.addEventListener("scroll", (event) => {
        elements.contextMenu.style.display = "none";
    });

    document.getElementById("edit-element-btn").addEventListener("click", (event) => {
        if (!currentContextElement) return;

        openEditDialog(currentContextElement);
        
        elements.contextMenu.style.display = "none";
    });
    
    document.getElementById("delete-element-btn").addEventListener("click", (event) => {
        if (!currentContextElement) return;

        openDeleteDialog(currentContextElement);

        elements.contextMenu.style.display = "none";
    });

    document.getElementById("create-element-btn").addEventListener("click", (event) => {
        if (!currentContextElement) return;

        openCreateDialog(currentContextElement.dataset.category);

        elements.contextMenu.style.display = "none";
    });


    document.getElementById("open-element-btn").addEventListener("click", (event) => {
        if (!currentContextElement) return;
        
        openElement(openingMethods._blank);

        elements.contextMenu.style.display = "none";
    });

    document.getElementById("open-here-element-btn").addEventListener("click", (event) => {
        if (!currentContextElement) return;
        
        openElement(openingMethods._self);

        elements.contextMenu.style.display = "none";
    });

    document.getElementById("full-screen-iframe-btn").addEventListener("click", (event) => {
        if (!currentContextElement) return;
        
        if (currentContextElement.dataset.typeitem != "iframe") return;
        
        const iframe = currentContextElement.querySelector('.iframe-content'); 

        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.mozRequestFullScreen) {
            iframe.mozRequestFullScreen();
        } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
        }

        elements.contextMenu.style.display = "none";
    });

    function positionContextMenu(menu, mouseX, mouseY) {
        const menuRect = menu.getBoundingClientRect();
        const menuWidth = menuRect.width;
        const menuHeight = menuRect.height;
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let left = mouseX;
        let top = mouseY;
        
        if (left + menuWidth > windowWidth) {
            left = windowWidth - menuWidth - 10; // 10px margin
        }
        
        if (top + menuHeight > windowHeight) {
            top = windowHeight - menuHeight - 10; // 10px margin
        }
        
        if (left < 0) {
            left = 10;
        }
        
        if (top < 0) {
            top = 10;
        }
        
        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
    }

    function openElement(openingMethod) {
        let url = null;
        
        if (currentContextElement.dataset.typeitem == "iframe") {
            url = currentContextElement.querySelector('.iframe-content').src;
        } else if (currentContextElement.dataset.typeitem == "item") {
            url = currentContextElement.querySelector('a').href;
        }
        
        if (url) {
            openUrl(url, openingMethod);
        }
    }
}

export function closeContextMenu() {
    if (elements.contextMenu) {
        elements.contextMenu.style.display = "none";
    }
}