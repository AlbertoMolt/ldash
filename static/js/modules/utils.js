// ================================
//         UTILITY FUNCTIONS
// ================================

import state from './state.js';
import { dialogs } from './dom.js';

export const openingMethods = {
    _blank : "_blank",
    _self : "_self",
    _parent : "_parent",
    _top : "_top"
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    try {
        document.cookie = name + "=" + value + ";expires=" + date.toUTCString() + ";path=/";
    } catch (error) {
        console.log(error);
    }
}

export function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function existCookie(name) {
    const cookies = document.cookie.split(";").map(c => c.trim());
    return cookies.some(cookie => cookie.startsWith(name + "="));
}

export function reloadPage() {
    location.reload();
}

export function openUrl(itemUrl, openingMethod) {
    window.open(itemUrl, openingMethod);
}

export function openDialog(dialog) {
    if (state.disableDialogs) return;
    if (state.dialogOpen) return;

    history.pushState({ dialog: true }, '');

    state.dialogOpen = true;
    dialog.showModal();

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = scrollbarWidth + 'px';
    document.body.style.overflow = 'hidden'; // disable scroll body
}

export function closeDialog(dialog) {
    if (state.disableDialogs) return;
    
    state.dialogOpen = false;
    dialog.close();

    document.body.style.paddingRight = '';
    document.body.style.overflow = ''; // enable scroll body
}

export function closeAllDialogs() {
    state.dialogOpen = false;

    Object.values(dialogs).forEach(dialogElement => {
        if (dialogElement && typeof dialogElement.close === 'function') {
            dialogElement.close();
        }
    });

    document.body.style.paddingRight = '';
    document.body.style.overflow = ''; // enable scroll body
}