// ================================
//         UTILITY FUNCTIONS
// ================================

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
