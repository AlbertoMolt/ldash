// ================================
//    COLLAPSE & FLIP ANIMATION
// ================================

export function initCollapse() {
    // Categories
    document.addEventListener('click', (e) => {
        const categoryBtn = e.target.closest('.category-button');
        if (categoryBtn) {
            const categoryDiv = categoryBtn.closest('.category');
            const category = categoryDiv.dataset.category;
            const itemWrapper = categoryBtn.nextElementSibling;

            if (itemWrapper && itemWrapper.classList.contains('items-wrapper')) {
                flipElement(() => {
                    const isHidden = itemWrapper.classList.toggle('hidden');
                    localStorage.setItem('category-collapsed-' + category, isHidden);
                });
            }
        }
    });

    // Iframes
    document.addEventListener('click', (e) => {
        const iframeBtn = e.target.closest('.iframe-button');
        if (iframeBtn) {
            const iframe = iframeBtn.nextElementSibling;

            if (iframe && iframe.classList.contains('iframe-content')) {
                flipElement(() => {
                    const isHidden = iframe.classList.toggle('hidden');
                    localStorage.setItem('iframe-collapsed-' + iframe.dataset.id, isHidden);
                });
            }
        }
    });
}

export function restoreCollapsableElementsStates() {
    document.querySelectorAll('.category').forEach(categoryDiv => {
        const category = categoryDiv.dataset.category;
        const wrapper = categoryDiv.querySelector('.items-wrapper');
        const collapsed = localStorage.getItem('category-collapsed-' + category);

        if (collapsed === "true" && wrapper) {
            wrapper.classList.add('hidden');
        } else if (wrapper) {
            wrapper.classList.remove('hidden');
        }
    });

    document.querySelectorAll('.iframe-content').forEach(iframe => {
        const collapsed = localStorage.getItem('iframe-collapsed-' + iframe.dataset.id);

        if (collapsed === "true") {
            iframe.classList.add('hidden');
        } else {
            iframe.classList.remove('hidden');
        }
    });
}

function flipElement(callback) {
    const elements = [...document.querySelectorAll('.category, .iframe-item')];
    const first = new Map();

    elements.forEach(el => {
        first.set(el, el.getBoundingClientRect());
    });

    callback();

    requestAnimationFrame(() => {
        elements.forEach(el => {
            const last = el.getBoundingClientRect();
            const prev = first.get(el);
            if (!prev) return;

            const dx = prev.left - last.left;
            const dy = prev.top - last.top;

            if (dx || dy) {
                el.style.transform = `translate(${dx}px, ${dy}px)`;
                el.style.transition = 'none';

                requestAnimationFrame(() => {
                    el.style.transform = '';
                    el.style.transition = 'transform 420ms cubic-bezier(.22,.61,.36,1)';
                });
            }
        });
    });
}
