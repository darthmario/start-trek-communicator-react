// Shared Web Audio API singleton and buffer cache

let ctx = null;
let resumePromise = null;
const bufferCache = new Map();
const pendingFetches = new Map();

export function getAudioContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

// Ensure the AudioContext is running before playback.
// On Android, Chrome suspends the context after silence gaps.
export function ensureResumed() {
  const audioCtx = getAudioContext();
  if (audioCtx.state === 'running') {
    return Promise.resolve(audioCtx);
  }
  if (!resumePromise) {
    resumePromise = audioCtx.resume().then(() => {
      resumePromise = null;
      return audioCtx;
    }).catch(() => {
      resumePromise = null;
      return audioCtx;
    });
  }
  return resumePromise;
}

export async function getAudioBuffer(src) {
  if (bufferCache.has(src)) {
    return bufferCache.get(src);
  }

  // Deduplicate parallel fetches for the same src
  if (pendingFetches.has(src)) {
    return pendingFetches.get(src);
  }

  const promise = (async () => {
    const audioCtx = getAudioContext();
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    bufferCache.set(src, audioBuffer);
    pendingFetches.delete(src);
    return audioBuffer;
  })();

  pendingFetches.set(src, promise);
  return promise;
}

export async function preDecodeBuffer(src) {
  try {
    await getAudioBuffer(src);
  } catch {
    // silently ignore decode failures
  }
}
