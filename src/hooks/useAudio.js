import { useRef, useCallback, useEffect } from 'react';
import { getAudioContext, getAudioBuffer, ensureResumed } from '../utils/audioContext';

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

    // Generation counter — if play() is called again before this resolves,
    // the stale .then() will see a mismatched id and bail out
    const id = ++playIdRef.current;

    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gainRef.current = gain;

    // Wait for context to be running AND buffer to be decoded
    Promise.all([ensureResumed(), getAudioBuffer(src)])
      .then(([, buffer]) => {
        if (playIdRef.current !== id) return; // stale — a newer play() was called
        bufferRef.current = buffer;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        source.connect(gain);
        source.start(0);
        sourceRef.current = source;
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

  return { play, pause, stop, audioRef };
}
