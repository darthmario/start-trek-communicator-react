import { useEffect, useRef } from 'react';

/**
 * Detects device shake using a start/peak/end lifecycle,
 * matching the original webOS shakestart/shaking/shakeend pattern.
 *
 * - When acceleration exceeds `startThreshold`, begin tracking peak magnitude
 * - While shaking, record the highest magnitude seen
 * - When acceleration drops below `calmThreshold` for `calmDuration` ms, end the shake
 * - If peak magnitude exceeded `peakThreshold` (original webOS used 2.5), fire callback
 * - 2-second debounce between triggers
 */
export function useShake(callback, {
  enabled = false,
  startThreshold = 18,    // magnitude to begin tracking a shake
  peakThreshold = 25,     // peak magnitude required to trigger (maps to webOS 2.5G)
  calmThreshold = 12,     // magnitude below which we consider shaking stopped
  calmDuration = 200,     // ms of calm before we consider the shake ended
  debounceMs = 2000
} = {}) {
  const callbackRef = useRef(callback);
  const lastTriggerRef = useRef(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let shaking = false;
    let peakMagnitude = 0;
    let calmStart = 0;

    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (!shaking) {
        // Shake start: acceleration spike
        if (magnitude > startThreshold) {
          shaking = true;
          peakMagnitude = magnitude;
          calmStart = 0;
        }
      } else {
        // Track peak during shake
        if (magnitude > peakMagnitude) {
          peakMagnitude = magnitude;
        }

        if (magnitude < calmThreshold) {
          // Motion dying down
          if (calmStart === 0) {
            calmStart = Date.now();
          } else if (Date.now() - calmStart > calmDuration) {
            // Shake end: check if peak was high enough
            shaking = false;
            if (peakMagnitude > peakThreshold) {
              const now = Date.now();
              if (now - lastTriggerRef.current > debounceMs) {
                lastTriggerRef.current = now;
                callbackRef.current();
              }
            }
            peakMagnitude = 0;
            calmStart = 0;
          }
        } else {
          // Still shaking, reset calm timer
          calmStart = 0;
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled, startThreshold, peakThreshold, calmThreshold, calmDuration, debounceMs]);
}
