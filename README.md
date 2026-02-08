# Star Trek Communicator

An interactive Star Trek Original Series communicator, phaser, tricorder, and medical scanner — rebuilt as a modern web app.

## History

This project began life as a **Palm webOS app** (v1.1.0) by [worldofnate.com](https://worldofnate.com), built with the Mojo framework for the Palm Pre and Pixi circa 2009-2010. It was one of the beloved homebrew apps in the webOS ecosystem — a faithful recreation of the classic Star Trek communicator that let you flip open the antenna grill, hail crew members from different departments, and hear authentic character dialogue.

The app grew to v1.5.2 on GitHub with 7 scenes, 14 named characters across 3 departments, a phaser with 7 power levels, a tricorder music player, a medical scanner, and a full preferences system.

In 2025, the app was converted from webOS Mojo to a **React + Vite** web app, preserving all original functionality while modernizing the tech stack. The original `em`-based CSS layout, sprite sheets, and audio assets were kept intact. The conversion added modern web features like the Web Audio API, haptic feedback, PWA support, and gesture recognition.

## Features

- **Communicate** — Flip open the antenna grill (3D animated), select a department (Command, Operations, Science), and hear responses from 14 Star Trek characters including Uhura, Spock, Scotty, Bones, and more
- **Eliminate** — Phaser with a draggable power dial (7 levels), looping beam sound, and an overload effect at maximum power
- **Investigate** — Tricorder with 6 music tracks and a cycling display screen
- **Medicate** — Medical scanner with animated spinners and hold-to-scan interaction
- **Preferences** — Toggle individual characters on/off, control title audio

### Modern Enhancements

- **Web Audio API** — Low-latency audio playback with buffer caching and hardware-accelerated volume ramping
- **Haptic Feedback** — Vibration API pulses for grill toggles, button presses, phaser dial, and firing
- **3D Grill Animation** — `rotateX` perspective flip matching the original webOS animation
- **Screen Wake Lock** — Keeps the screen on while the communicator grill is open
- **PWA** — Installable on mobile with offline support via service worker precaching
- **Gesture Support** — Flick/swipe to toggle the communicator grill, device shake detection
- **Slide Transitions** — Animated scene navigation
- **Portrait Lock** — Orientation lock with landscape detection overlay

## Characters

| Department | Characters |
|---|---|
| **Command** | Uhura, Chekov, Captain Pike, Guardian of Forever |
| **Operations** | Sulu, Scotty, Nomad, Zefram Cochrane |
| **Science** | Bones, Spock, Computer, Sarek, Chapel |

## Getting Started

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
npx vite preview
```

The production build includes a service worker for offline support. All UI sounds and images are precached; character dialogue files are cached on first play.

## Tech Stack

- React 19
- Vite 7
- Web Audio API
- Vibration API
- Screen Wake Lock API
- vite-plugin-pwa (Workbox)

## Credits

- Original webOS app by [worldofnate.com](https://worldofnate.com)
- Audio and visual assets from Star Trek: The Original Series
- React conversion assisted by Claude (Anthropic)
