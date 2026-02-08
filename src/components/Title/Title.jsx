import { useEffect, useRef, useState } from 'react';
import './Title.css';

function Title({ onNavigate, firstLoad }) {
  const audioRef = useRef(null);
  const beamTextureRef = useRef(null);
  const beamTextureHolderRef = useRef(null);
  const appTitleRef = useRef(null);
  const beamGlowRef = useRef(null);
  const beamGlowFadeRef = useRef(null);

  const isFirstLoad = firstLoad && firstLoad.current;
  const [waitingForTap, setWaitingForTap] = useState(isFirstLoad);

  useEffect(() => {
    if (waitingForTap) return;

    const showFinal = () => {
      if (appTitleRef.current) appTitleRef.current.style.opacity = '1';
      if (beamTextureHolderRef.current) beamTextureHolderRef.current.style.opacity = '1';
      if (beamTextureRef.current) beamTextureRef.current.style.backgroundPosition = '-150px -100px';
      if (beamGlowRef.current) beamGlowRef.current.style.opacity = '.7';
      if (beamGlowFadeRef.current) beamGlowFadeRef.current.style.opacity = '0';
    };

    if (!isFirstLoad) {
      showFinal();
      return;
    }

    // First load after tap — play beam-in with audio
    firstLoad.current = false;

    let titleToggle = true;
    try {
      const prefs = JSON.parse(localStorage.getItem('stComPrefs'));
      if (prefs && prefs.titleToggle !== undefined) {
        titleToggle = prefs.titleToggle;
      }
    } catch (e) { /* use default */ }

    if (titleToggle) {
      const audio = new Audio();
      audioRef.current = audio;

      let started = false;
      const startBeamIn = () => {
        if (started) return;
        started = true;
        audio.play().then(() => showFinal()).catch(() => showFinal());
      };

      audio.addEventListener('canplaythrough', function handler() {
        audio.removeEventListener('canplaythrough', handler);
        startBeamIn();
      });
      audio.addEventListener('error', function handler() {
        audio.removeEventListener('error', handler);
        showFinal();
      });
      audio.src = '/audio/transporter/transporter.mp3';
      audio.load();
      setTimeout(() => { if (!started) showFinal(); }, 10000);

      return () => {
        audio.pause();
        audio.src = '';
      };
    } else {
      showFinal();
    }
  }, [waitingForTap]);

  const handleTapToStart = () => {
    setWaitingForTap(false);
  };

  const handleButtonPress = (scene) => {
    if (audioRef.current) audioRef.current.pause();
    onNavigate(scene);
  };

  const handleLogoClick = () => {
    if (audioRef.current) audioRef.current.pause();
  };

  return (
    <div className="container">
      <div className="trough-gradient-bg"></div>
      <div className="trough-shadow"></div>
      <div className="trough-texture"></div>
      <div className="starfleet-logo"></div>
      <div className="logo-holder" onPointerDown={handleLogoClick}>
        <div ref={beamTextureHolderRef} className="logo-beam-pattern-holder">
          <div className="logo-beam-pattern" ref={beamTextureRef}></div>
        </div>
        <div className="logo-beam-in"></div>
        <div className="logo-glow-fade" ref={beamGlowFadeRef}>
          <div className="logo-glow" ref={beamGlowRef}></div>
        </div>
        <div className="logo" ref={appTitleRef}></div>
      </div>
      <div className="subtitle"></div>
      <div className="main-menu">
        <div className="menu-column1 menu-row1 menu-communicate" onPointerDown={() => handleButtonPress('communicate')}></div>
        <div className="menu-column2 menu-row1 menu-eliminate" onPointerDown={() => handleButtonPress('eliminate')}></div>
        <div className="menu-column1 menu-row2 menu-investigate" onPointerDown={() => handleButtonPress('investigate')}></div>
        <div className="menu-column2 menu-row2 menu-medicate" onPointerDown={() => handleButtonPress('medicate')}></div>
        <div className="menu-column1 menu-row3 menu-settings" onPointerDown={() => handleButtonPress('preferences')}></div>
        <div className="menu-column2 menu-row3 menu-help" onPointerDown={() => handleButtonPress('help')}></div>
      </div>
      {waitingForTap && (
        <div className="tap-to-start" onPointerDown={handleTapToStart}>
          <div className="tap-to-start-text">Tap to Begin</div>
        </div>
      )}
    </div>
  );
}

export default Title;
