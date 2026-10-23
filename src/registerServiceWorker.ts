/**
 * Register Service Worker for offline PWA capabilities & background sync
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Bharat E-Waste] ServiceWorker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[Bharat E-Waste] ServiceWorker registration failed:', error);
        });
    });
  }
}
