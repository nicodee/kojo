// Calibrated mobile haptic triggers with graceful fallback
export const haptics = {
  // Ultra-crisp light tap for filter pills, tab clicks (10ms)
  light: () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch {}
  },

  // Satisfying mechanical "clack" when queueing or toggling (16ms)
  medium: () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(16);
      }
    } catch {}
  },

  // Success double-tap vibration for completing day itinerary or copying (10ms, 40ms pause, 16ms)
  success: () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([10, 40, 16]);
      }
    } catch {}
  },

  // Heavy alert vibration for transit warnings (25ms, 50ms pause, 25ms)
  warning: () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([25, 50, 25]);
      }
    } catch {}
  }
};
