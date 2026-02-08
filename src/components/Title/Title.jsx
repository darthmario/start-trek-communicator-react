import { useEffect, useRef, useState } from 'react';
import { getAudioContext, getAudioBuffer } from '../../utils/audioContext';
import { preDecodeAllAudio } from '../../utils/preloadAssets';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import './Title.css';

function Title({ onNavigate, firstLoad, assetsReady, loadProgress, onRequestMotion }) {
  const sourceRef = useRef(null);
  const beamTextureRef = useRef(null);
  const beamTextureHolderRef = useRef(null);
  const appTitleRef = useRef(null);
  const beamGlowRef = useRef(null);
  const beamGlowFadeRef = useRef(null);

  const isFirstLoad = firstLoad && firstLoad.current;
  const [waitingForTap, setWaitingForTap] = useState(isFirstLoad);
  const { isInstallable, promptInstall } = useInstallPrompt();

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

    // First load after tap — play beam-in with Web Audio
    firstLoad.current = false;

    // Pre-decode all audio buffers now that we have a user gesture
    preDecodeAllAudio();

    let titleToggle = true;
    try {
      const prefs = JSON.parse(localStorage.getItem('stComPrefs'));
      if (prefs && prefs.titleToggle !== undefined) {
        titleToggle = prefs.titleToggle;
      }
    } catch (e) { /* use default */ }

    if (titleToggle) {
      let cancelled = false;
      const src = '/audio/transporter/transporter.mp3';

      const playBeamIn = async () => {
        try {
          const ctx = getAudioContext();
          const buffer = await getAudioBuffer(src);
          if (cancelled) return;

          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
          sourceRef.current = source;
          showFinal();
        } catch {
          showFinal();
        }
      };

      playBeamIn();

      // 10s timeout fallback
      const timeout = setTimeout(() => {
        if (!cancelled) showFinal();
      }, 10000);

      return () => {
        cancelled = true;
        clearTimeout(timeout);
        if (sourceRef.current) {
          try { sourceRef.current.stop(); } catch { /* already stopped */ }
          sourceRef.current = null;
        }
      };
    } else {
      showFinal();
    }
  }, [waitingForTap]);

  const handleTapToStart = () => {
    if (!assetsReady) return;
    if (onRequestMotion) onRequestMotion();
    // Initialize AudioContext on user gesture
    getAudioContext();
    setWaitingForTap(false);
  };

  const handleButtonPress = (scene) => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* already stopped */ }
      sourceRef.current = null;
    }
    onNavigate(scene);
  };

  const handleLogoClick = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* already stopped */ }
      sourceRef.current = null;
    }
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
      {isInstallable && !waitingForTap && (
        <div className="install-prompt" onPointerDown={promptInstall}>
          Install App
        </div>
      )}
      {waitingForTap && (
        <div className="tap-to-start" onPointerDown={handleTapToStart}>
          {assetsReady ? (
            <div className="tap-to-start-text">Tap to Begin</div>
          ) : (
            <div className="loading-container">
              <div className="loading-text">Loading...</div>
              <div className="loading-bar-track">
                <div className="loading-bar-fill" style={{ width: `${loadProgress}%` }}></div>
              </div>
              <div className="loading-percent">{loadProgress}%</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Title;
