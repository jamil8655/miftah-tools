'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Clear any legacy caches if present
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => {
            if (key.includes('v1') || key.includes('v2') || key.includes('v3')) {
              caches.delete(key);
            }
          });
        });
      }

      window.addEventListener('load', () => {
        const swPath = window.location.pathname.startsWith('/nexora-tools') ? '/nexora-tools/sw.js' : '/sw.js';
        const swScope = window.location.pathname.startsWith('/nexora-tools') ? '/nexora-tools/' : '/';
        navigator.serviceWorker
          .register(swPath, { scope: swScope })
          .then((reg) => {
            reg.update();
            console.log('Miftah Tools live service worker active:', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA ServiceWorker registration notice:', err);
          });
      });
    }
  }, []);

  return null;
}
