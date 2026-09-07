'use client';

/**
 * Miftah Tools MOTION SYSTEM
 * Standardized, performance-focused, Android-native motion tokens & microinteraction utilities.
 */

export const MOTION = {
  duration: {
    fast: 150,       // Microinteractions (button press, icon toggle)
    standard: 250,   // Card expansion, modal popup, sheet rise
    emphasized: 350, // Screen transition, completion reveal
    entrance: 200,   // Staggered item entrance
    exit: 150,       // Dismissal, collapse
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',      // Android Material Standard
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // Smooth deceleration for entering elements
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',   // Quick acceleration for exiting elements
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // Snappy spring pop for favorites / badges
  },
  classes: {
    press: 'active:scale-[0.97] active:opacity-95 transition-all duration-150 ease-out select-none',
    pressSubtle: 'active:scale-[0.98] transition-transform duration-150 ease-out select-none',
    pressIcon: 'active:scale-[0.88] transition-transform duration-150 ease-out select-none',
    cardInteractive: 'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 ease-out',
    entranceFade: 'animate-in fade-in duration-200 ease-out',
    entranceSlideUp: 'animate-in fade-in slide-in-from-bottom-3 duration-250 ease-out',
    entrancePop: 'animate-in fade-in zoom-in-95 duration-200 ease-out',
  },
} as const;

/**
 * Trigger subtle native haptic feedback on supported Android / Web devices
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'selection' | 'error' = 'light') {
  if (typeof window === 'undefined' || !window.navigator) return;

  try {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
        case 'selection':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'success':
          navigator.vibrate([15, 30, 20]);
          break;
        case 'error':
          navigator.vibrate([30, 40, 30]);
          break;
      }
    }
  } catch (e) {
    // Graceful fallback on devices where vibration is disabled or unsupported
  }
}
