import { useEffect, useRef } from 'react';

/**
 * Detects vertical flick gestures on a target element.
 * Mirrors the original webOS Mojo.Event.flick behavior:
 *   - Fires when vertical velocity exceeds threshold (default 500 px/s)
 *   - 2-second debounce between triggers
 */
export function useFlick(targetRef, callback, { threshold = 500, debounceMs = 2000 } = {}) {
  const callbackRef = useRef(callback);
  const lastFlickRef = useRef(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    let tracking = false;
    let positions = []; // { y, time } ring buffer for velocity calculation

    const onPointerDown = (e) => {
      tracking = true;
      positions = [{ y: e.clientY, time: Date.now() }];
    };

    const onPointerMove = (e) => {
      if (!tracking) return;
      const now = Date.now();
      positions.push({ y: e.clientY, time: now });
      // Keep only last 100ms of positions for velocity calculation
      while (positions.length > 1 && now - positions[0].time > 100) {
        positions.shift();
      }
    };

    const onPointerUp = () => {
      if (!tracking) return;
      tracking = false;

      if (positions.length < 2) return;

      const first = positions[0];
      const last = positions[positions.length - 1];
      const dt = (last.time - first.time) / 1000; // seconds
      if (dt === 0) return;

      const velocityY = (last.y - first.y) / dt; // px/s

      if ((velocityY > threshold || velocityY < -threshold)) {
        const now = Date.now();
        if (now - lastFlickRef.current > debounceMs) {
          lastFlickRef.current = now;
          callbackRef.current();
        }
      }
    };

    const onPointerCancel = () => {
      tracking = false;
      positions = [];
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerCancel);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [targetRef, threshold, debounceMs]);
}
