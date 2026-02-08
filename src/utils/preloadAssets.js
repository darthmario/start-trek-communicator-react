// Preload all images and key audio files into the browser cache.
// Returns a promise that resolves when everything is loaded.

const IMAGES = [
  '/images/background_mirror.png',
  '/images/beam_hider.png',
  '/images/beam_ray.png',
  '/images/cloud_pill.png',
  '/images/communicator_sprites.png',
  '/images/contact_icons.png',
  '/images/dial.jpg',
  '/images/forground_mirror.png',
  '/images/metal_bg.png',
  '/images/metal_texture.png',
  '/images/phaser_cover_shadow.png',
  '/images/phaser_metal_bg.png',
  '/images/phaser_shadow_bg.png',
  '/images/radio_screen.png',
  '/images/solid_sprites.jpg',
  '/images/speaker_rim.png',
  '/images/speaker-inner-shadow.png',
  '/images/speaker-shadow.png',
  '/images/tricorder_full_shadow.png',
  '/images/trough_bumps.png',
  '/images/trough_shadow.png',
  '/images/wwon_background.jpg',
  '/images/wwon_cloud.png',
  '/images/wwon_head.png',
  '/images/wwon_logo.png',
  '/images/x_dir_backgrounds.jpg',
];

const AUDIO = [
  '/audio/transporter/transporter.mp3',
  '/audio/buttons/button1.mp3',
  '/audio/buttons/button2.mp3',
  '/audio/buttons/button3.mp3',
  '/audio/buttons/button4.mp3',
  '/audio/buttons/button5.mp3',
  '/audio/buttons/button6.mp3',
  '/audio/communicator/startTalking.mp3',
  '/audio/communicator/endTalking.mp3',
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
  '/audio/tricorder/1_music.mp3',
  '/audio/tricorder/2_music.mp3',
  '/audio/tricorder/3_music.mp3',
  '/audio/tricorder/4_music.mp3',
  '/audio/tricorder/5_music.mp3',
  '/audio/tricorder/6_music.mp3',
  '/audio/sickbay/scanner.mp3',
  '/audio/sickbay/heart.mp3',
  '/audio/sickbay/highbeep.mp3',
];

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve; // don't block on failure
    img.src = src;
  });
}

function preloadAudioFile(src) {
  return fetch(src).then(() => {}).catch(() => {});
}

export function preloadAllAssets(onProgress) {
  const total = IMAGES.length + AUDIO.length;
  let loaded = 0;

  const tick = () => {
    loaded++;
    if (onProgress) onProgress(loaded, total);
  };

  const imagePromises = IMAGES.map(src => preloadImage(src).then(tick));
  const audioPromises = AUDIO.map(src => preloadAudioFile(src).then(tick));

  return Promise.all([...imagePromises, ...audioPromises]);
}
