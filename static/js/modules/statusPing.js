// ================================
//       STATUS PING POLLING
// ================================

import state from './state.js';
import { sleep, getCookie } from './utils.js';
import { fetchItemStatus } from './api.js';

let statusController = null;

export async function startStatusPolling() {
    if (statusController) statusController.abort();
    statusController = new AbortController();
    const signal = statusController.signal;

    const statusPingElements = document.querySelectorAll('.status-ping');

    if (getCookie("statusPing") !== "true") {
        statusPingElements.forEach(el => el.style.display = "none");
        return;
    }

    statusPingElements.forEach(el => el.style.display = "inline-block");

    while (true) {
        try {
            const data = await fetchItemStatus(signal);

            if (Array.isArray(data.items_status)) {
                data.items_status.forEach(itemStatus => {
                    const el = document.querySelector(`.item-card[data-id="${itemStatus.id}"]`);
                    if (!el) return;

                    const ping = el.querySelector('.status-ping');
                    if (!ping) return;

                    const isOnline = itemStatus.status > 0 && itemStatus.status < 400;
                    const isPartial = itemStatus.status >= 400 && itemStatus.status < 500;

                    ping.classList.toggle("online", isOnline);
                    ping.classList.toggle("partial", isPartial);
                    ping.classList.toggle("offline", !isOnline && !isPartial);

                    ping.dataset.tooltip = isOnline
                        ? `Online (${itemStatus.status}) - ${itemStatus.response_time}ms`
                        : isPartial
                            ? `Partial (${itemStatus.status}) - ${itemStatus.response_time}ms`
                            : `Offline`;
                });
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error('Error updating status:', err);
        }

        await sleep(60000);
    }
}
