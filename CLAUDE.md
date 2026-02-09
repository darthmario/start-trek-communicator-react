# CLAUDE.md

## Project Overview

Star Trek Communicator — a React + Vite web app recreating the classic webOS Star Trek communicator. Originally a Palm webOS Mojo app by worldofnate.com, converted to modern React in 2025.

## Commands

- `npm run dev` — Start dev server (Vite HMR)
- `npm run build` — Production build (outputs to `dist/`)
- `npm run preview` — Preview production build locally
- `npm run lint` — ESLint

## Architecture

**No routing library.** Scene switching is managed by `currentScene` state in `App.jsx` with animated slide transitions. Seven scenes: title, communicate, eliminate, investigate, medicate, preferences, help.

**No state management library.** Each scene is self-contained with `useState` + `useRef`. User preferences persist in `localStorage` under key `stComPrefs`.

### Key Patterns

- **Audio**: Web Audio API via shared `AudioContext` singleton (`src/utils/audioContext.js`). Buffer cache deduplicates fetches. The `useAudio` hook wraps `AudioBufferSourceNode` + `GainNode` per instance. AudioContext must be initialized on a user gesture (tap-to-start in Title).
- **Layout**: Fixed `32em × 48em` container, `em`-based units throughout (base font-size 10px). One large sprite sheet (`communicator_sprites.png`) with CSS `background-position`.
- **Haptics**: Fire-and-forget utility functions in `src/utils/haptics.js`, not a hook. Silently no-ops if Vibration API unavailable.
- **PWA**: `vite-plugin-pwa` with Workbox. UI assets precached, character dialogue cached at runtime with CacheFirst strategy.

### File Structure

```
src/
  App.jsx                          — Scene switching, transitions, landscape detection, motion permission
  App.css                          — Global styles, transitions, landscape overlay
  main.jsx                         — Entry point
  components/
    Title/                         — Main menu, beam-in animation, install prompt
    Communicate/                   — Communicator scene
      Communicate.jsx              — Main logic: grill, departments, responses, wake lock
      AntennaGrill.jsx             — 3D flip grill with perspective wrapper
      DepartmentButtons.jsx        — Command/Operations/Science buttons
      ResponseButtons.jsx          — Positive/Negative response buttons
      SignalSpinner.jsx            — Rotating signal indicator
    Eliminate/                     — Phaser with draggable dial (7 levels), fire button, overload
    Investigate/                   — Tricorder with 6 music tracks
    Medicate/                      — Medical scanner with hold-to-scan
    Help/                          — About/credits screen
    Preferences/                   — Character toggle switches, localStorage
  hooks/
    useAudio.js                    — Web Audio playback hook (play/pause/stop/audioRef)
    useFlick.js                    — Vertical swipe gesture detection
    useShake.js                    — Device shake detection (accelerometer)
    useInstallPrompt.js            — PWA beforeinstallprompt capture
  data/
    characters.js                  — Character dialogue file mappings per department
    buttons.js                     — Button click sound paths
  utils/
    audioContext.js                — AudioContext singleton, buffer cache, pre-decode
    haptics.js                     — Vibration API utilities
    preloadAssets.js               — Image/audio preloader with progress callback
public/
  audio/                           — All MP3 assets organized by category
  images/                          — Sprite sheets and textures
  icon-*.png, icon.svg             — PWA icons
```

### Important Conventions

- All CSS uses `em` units relative to the 10px base — do not introduce `px` for layout dimensions.
- Sprite positions in CSS reference `communicator_sprites.png` — changing sprite layout breaks the entire UI.
- `useAudio` hook instances are per-channel (e.g., `buttonAudio`, `effectsAudio`, `overloadAudio`). Calling `play()` on one stops its current sound. Multiple hooks needed for overlapping audio.
- Web Audio `BufferSourceNode` cannot be paused — `pause()` is equivalent to `stop()` in this app. This is intentional.
- The overload effect in Eliminate creates its own source/gain nodes (bypassing `useAudio` internals) for the `linearRampToValueAtTime` volume ramp. These are tracked in separate refs and must be cleaned up on unmount.

### Mobile Considerations

- `-webkit-tap-highlight-color: transparent` and `user-select: none` are set globally.
- Wake lock acquired while communicator grill is open, re-acquired on `visibilitychange`.
- Portrait orientation locked where supported; landscape shows a rotation overlay.
- All browser APIs (Vibration, Wake Lock, DeviceMotion) fail silently if unsupported.
