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
            reg.update();
            console.log('Miftah Tools PWA ServiceWorker registered & checked for update with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA ServiceWorker registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}
