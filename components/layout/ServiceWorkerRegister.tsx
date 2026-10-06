'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swPath = window.location.pathname.startsWith('/nexora-tools') ? '/nexora-tools/sw.js' : '/sw.js';
        const swScope = window.location.pathname.startsWith('/nexora-tools') ? '/nexora-tools/' : '/';
        navigator.serviceWorker
          .register(swPath, { scope: swScope })
          .then((reg) => {
            // Check for service worker updates immediately
            reg.update();
            console.log('Miftah Tools PWA ServiceWorker registered with scope:', reg.scope);

            reg.addEventListener('updatefound', () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.addEventListener('statechange', () => {
                  if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('New Miftah Tools version available, updating cache...');
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('PWA ServiceWorker registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
