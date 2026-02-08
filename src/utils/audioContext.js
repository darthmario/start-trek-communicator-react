// Shared Web Audio API singleton and buffer cache

let ctx = null;
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
