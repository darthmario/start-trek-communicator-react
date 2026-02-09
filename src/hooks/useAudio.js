import { useRef, useCallback, useEffect, useMemo } from 'react';
import { getAudioContext, getAudioBuffer, getCachedBuffer, ensureResumed } from '../utils/audioContext';

export function useAudio() {
  const sourceRef = useRef(null);
  const gainRef = useRef(null);
  const bufferRef = useRef(null);
  const playIdRef = useRef(0);

  // Expose an audioRef-compatible interface for consumers that need gainNode/duration
  const audioRef = useRef({
    get volume() {
      return gainRef.current ? gainRef.current.gain.value : 1;
    },
    set volume(v) {
      if (gainRef.current) {
        gainRef.current.gain.value = v;
      }
    },
    get duration() {
      return bufferRef.current ? bufferRef.current.duration : 0;
    },
    get gainNode() {
      return gainRef.current;
    },
  });

  const stopSource = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* already stopped */ }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
  }, []);

  const play = useCallback((src, { loop = false } = {}) => {
    stopSource();

    const id = ++playIdRef.current;

    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gainRef.current = gain;

    const startSource = (buffer) => {
      bufferRef.current = buffer;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = loop;
      source.connect(gain);
      source.start(0);
      sourceRef.current = source;
    };

    // Synchronous fast path: if context is running and buffer is cached,
    // start playback immediately (critical for Android user-gesture timing)
    const cached = getCachedBuffer(src);
    if (cached && ctx.state === 'running') {
      startSource(cached);
      return;
    }

    // Async fallback: wait for context resume and/or buffer decode
    Promise.all([ensureResumed(), getAudioBuffer(src)])
      .then(([, buffer]) => {
        if (playIdRef.current !== id) return; // stale — a newer play() was called
        startSource(buffer);
      })
      .catch(() => {});
  }, [stopSource]);

  const pause = useCallback(() => {
    playIdRef.current++;
    stopSource();
  }, [stopSource]);

  const stop = useCallback(() => {
    playIdRef.current++;
    stopSource();
    if (gainRef.current) {
      gainRef.current.gain.value = 1.0;
    }
  }, [stopSource]);

  useEffect(() => {
    return () => {
      playIdRef.current++;
      stopSource();
      if (gainRef.current) {
        gainRef.current.disconnect();
        gainRef.current = null;
      }
    };
  }, [stopSource]);

  // Return a stable object so consumers can safely use it in useEffect/useCallback deps
  return useMemo(() => ({ play, pause, stop, audioRef }), [play, pause, stop, audioRef]);
}
