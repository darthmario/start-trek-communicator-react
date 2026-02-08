// Preload key audio files into the browser cache on app startup.
// Character voices are excluded (too many, small individually, load on demand).

const PRELOAD_FILES = [
  // Title
  '/audio/transporter/transporter.mp3',
  // Buttons
  '/audio/buttons/button1.mp3',
  '/audio/buttons/button2.mp3',
  '/audio/buttons/button3.mp3',
  '/audio/buttons/button4.mp3',
  '/audio/buttons/button5.mp3',
  '/audio/buttons/button6.mp3',
  // Communicator
  '/audio/communicator/startTalking.mp3',
  '/audio/communicator/endTalking.mp3',
  // Phaser
  '/audio/phaser/tick.mp3',
  '/audio/phaser/phaser_loop.mp3',
  '/audio/phaser/phaser_overload_effect.mp3',
  '/audio/phaser/1.mp3',
  '/audio/phaser/2.mp3',
  '/audio/phaser/3.mp3',
  '/audio/phaser/4.mp3',
  '/audio/phaser/5.mp3',
  '/audio/phaser/6.mp3',
  '/audio/phaser/7.mp3',
  // Tricorder
  '/audio/tricorder/1_music.mp3',
  '/audio/tricorder/2_music.mp3',
  '/audio/tricorder/3_music.mp3',
  '/audio/tricorder/4_music.mp3',
  '/audio/tricorder/5_music.mp3',
  '/audio/tricorder/6_music.mp3',
  // Sickbay
  '/audio/sickbay/scanner.mp3',
  '/audio/sickbay/heart.mp3',
  '/audio/sickbay/highbeep.mp3',
];

export function preloadAudio() {
  PRELOAD_FILES.forEach(src => {
    fetch(src).catch(() => {});
  });
}
