// ================================
//      STATUS PING + WEBSOCKET
// ================================

import { fetchItemStatus } from './api.js';
import { sleep } from './utils.js';

let socket = null;
let isPolling = false;

export async function startStatusPolling() {
    connectWebSocket();
    
    await loadInitialStatus();
}

function connectWebSocket() {
    try {
        socket = io();
        
        socket.on('connect', () => {
            stopPolling();
        });
        
        socket.on('disconnect', () => {
            startPolling();
        });
        
        socket.on('status_update', (data) => {
            updateStatusUI(data.statuses);
        });
        
    } catch (error) {
        startPolling();
    }
}

async function loadInitialStatus() {
    try {
        const data = await fetchItemStatus();
        if (data.items_status) {
            updateStatusUI(data.items_status);
        }
    } catch (error) {
        console.error('Error loading initial status:', error);
    }
}

function updateStatusUI(statuses) {
    if (!Array.isArray(statuses)) return;
    
    statuses.forEach(itemStatus => {
        const el = document.querySelector(`.item-card[data-id="${itemStatus.id}"]`);
        if (!el) return;

        const ping = el.querySelector('.status-ping');
        if (!ping) return;

        const isOnline = itemStatus.status > 0 && itemStatus.status < 400;
        const isPartial = itemStatus.status >= 400 && itemStatus.status < 500;

        ping.classList.remove('online', 'partial', 'offline');
        
        if (isOnline) {
            ping.classList.add('online');
        } else if (isPartial) {
            ping.classList.add('partial');
        } else {
            ping.classList.add('offline');
        }

        ping.dataset.tooltip = isOnline
            ? `Online (${itemStatus.status}) - ${itemStatus.response_time}ms`
            : isPartial
                ? `Partial (${itemStatus.status}) - ${itemStatus.response_time}ms`
                : `Offline`;
    });
}

async function startPolling() {
    if (isPolling) return;
    
    isPolling = true;
    
    while (isPolling) {
        try {
            const data = await fetchItemStatus();
            if (data.items_status) {
                updateStatusUI(data.items_status);
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
        
        await sleep(60000); // 60 seconds
    }
}

function stopPolling() {
    if (isPolling) {
        isPolling = false;
    }
}