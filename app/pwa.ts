interface WorkboxEvent extends Event {
    type: string;
}

interface Workbox {
    addEventListener: (event: string, callback: (event: WorkboxEvent) => void) => void;
    messageSkipWaiting: () => void;
    register: () => void;
}

declare global {
    interface Window {
        workbox: Workbox;
    }
}

export function registerServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
        const wb = window.workbox;
        // Add event listeners to handle PWA lifecycle events
        wb.addEventListener('installed', (event: WorkboxEvent) => {
            console.log(`Event ${event.type} is triggered.`);
            console.log(event);
        });

        wb.addEventListener('controlling', (event: WorkboxEvent) => {
            console.log(`Event ${event.type} is triggered.`);
            console.log(event);
        });

        wb.addEventListener('activated', (event: WorkboxEvent) => {
            console.log(`Event ${event.type} is triggered.`);
            console.log(event);
        });

        // Send a message to the service worker to trigger a skipWaiting
        const promptNewVersionAvailable = () => {
            if (confirm('A newer version of this web app is available, reload to update?')) {
                wb.messageSkipWaiting();
                window.location.reload();
            }
        };

        wb.addEventListener('waiting', promptNewVersionAvailable);
        wb.register();
    }
} 