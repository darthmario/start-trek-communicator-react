// Fire-and-forget haptic feedback utility
// Silently no-ops if Vibration API is unavailable

function vibrate(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function vibrateGrill() {
  vibrate(50);
}

export function vibrateButton() {
  vibrate(20);
}

export function vibratePhaserStart() {
  vibrate(30000);
}

export function vibrateStop() {
  vibrate(0);
}

export function vibrateDialTick() {
  vibrate(15);
}
