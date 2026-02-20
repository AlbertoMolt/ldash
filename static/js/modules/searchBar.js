// ================================
//          SEARCH BAR
// ================================

const DEFAULT_SEARCH_ENDPOINT = "https://www.google.com/search?q=";
const DEFAULT_OPENING_METHOD = "_blank";

let searchEndpoint = DEFAULT_SEARCH_ENDPOINT;
let searchBarOpeningMethod = DEFAULT_OPENING_METHOD;

export function initSearchBar() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            search(searchInput.value);
        }
    });

    searchBtn.addEventListener('click', () => {
        search(searchInput.value);
    });
}

function search(query) {
    window.open(searchEndpoint + query, searchBarOpeningMethod);
    document.getElementById('search-input').value = "";
}

export function loadSearchBar() {
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');

    // Enable searchbar
    let svEnableSearchBar = localStorage.getItem('enable-search-bar');
    if (svEnableSearchBar === "true") {
        searchBar.style.display = "flex";
    } else {
        searchBar.style.display = "none";
    }
    if (svEnableSearchBar === null) {
        localStorage.setItem('enable-search-bar', 'true');
        searchBar.style.display = "flex";
    }

    // Enable autofocus
    let svEnableAutofocus = localStorage.getItem('enable-autofocus-search-bar');
    if (svEnableAutofocus === "true") {
        searchInput.focus();
    } else {
        searchInput.removeAttribute('autofocus');
    }
    if (svEnableAutofocus === null) {
        localStorage.setItem('enable-autofocus-search-bar', 'true');
        searchInput.focus();
    }

    // Opening method
    let svOpeningMethod = localStorage.getItem('search-bar-opening-method');
    if (svOpeningMethod === "_blank") {
        searchBarOpeningMethod = "_blank";
    } else {
        searchBarOpeningMethod = "_self";
    }
    if (svOpeningMethod === null) {
        localStorage.setItem('search-bar-opening-method', '_blank');
        searchBarOpeningMethod = "_blank";
    }
}

export function loadSearchEndpoint() {
    const storedValue = localStorage.getItem('search-endpoint');
    if (storedValue) {
        searchEndpoint = storedValue;
    } else {
        searchEndpoint = DEFAULT_SEARCH_ENDPOINT;
        localStorage.setItem('search-endpoint', DEFAULT_SEARCH_ENDPOINT);
    }
}
