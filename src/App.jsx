import { useState, useRef, useEffect, useCallback } from 'react';
import Title from './components/Title/Title';
import Communicate from './components/Communicate/Communicate';
import Eliminate from './components/Eliminate/Eliminate';
import Investigate from './components/Investigate/Investigate';
import Medicate from './components/Medicate/Medicate';
import Help from './components/Help/Help';
import Preferences from './components/Preferences/Preferences';
import { preloadAllAssets } from './utils/preloadAssets';

const SCENE_ORDER = ['title', 'communicate', 'eliminate', 'investigate', 'medicate', 'preferences', 'help'];

function App() {
  const [currentScene, setCurrentScene] = useState('title');
  const [assetsReady, setAssetsReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const firstLoadRef = useRef(true);

  // Transition state
  const [incomingScene, setIncomingScene] = useState(null);
  const [transitionDir, setTransitionDir] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimerRef = useRef(null);

  // Landscape detection
  const [isLandscape, setIsLandscape] = useState(false);

  // Motion permission for shake-to-interact
  const [motionPermission, setMotionPermission] = useState(() => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      return 'unknown'; // iOS — needs permission
    }
    return 'not-needed'; // Android/desktop — no permission needed
  });

  useEffect(() => {
    preloadAllAssets((loaded, total) => {
      setLoadProgress(Math.round((loaded / total) * 100));
    }).then(() => {
      setAssetsReady(true);
    });
  }, []);

  // Portrait lock + landscape detection
  useEffect(() => {
    // Try to lock orientation
    try {
      screen.orientation.lock('portrait').catch(() => {});
    } catch (e) { /* unsupported */ }

    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const requestMotionPermission = useCallback(async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const result = await DeviceMotionEvent.requestPermission();
        setMotionPermission(result === 'granted' ? 'granted' : 'denied');
      } catch {
        setMotionPermission('denied');
      }
    } else {
      setMotionPermission('not-needed');
    }
  }, []);

  const navigate = useCallback((scene) => {
    if (isTransitioning) return;

    const currentIdx = SCENE_ORDER.indexOf(currentScene);
    const nextIdx = SCENE_ORDER.indexOf(scene);
    const dir = (scene === 'title' || nextIdx < currentIdx) ? 'back' : 'forward';

    setIncomingScene(scene);
    setTransitionDir(dir);
    setIsTransitioning(true);

    transitionTimerRef.current = setTimeout(() => {
      setCurrentScene(scene);
      setIncomingScene(null);
      setTransitionDir(null);
      setIsTransitioning(false);
    }, 400);
  }, [currentScene, isTransitioning]);

  const goHome = useCallback(() => navigate('title'), [navigate]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const renderScene = (sceneName) => {
    switch (sceneName) {
      case 'title':
        return (
          <Title
            onNavigate={navigate}
            firstLoad={firstLoadRef}
            assetsReady={assetsReady}
            loadProgress={loadProgress}
            onRequestMotion={requestMotionPermission}
          />
        );
      case 'communicate':
        return <Communicate onBack={goHome} motionPermission={motionPermission} />;
      case 'eliminate':
        return <Eliminate onBack={goHome} />;
      case 'investigate':
        return <Investigate onBack={goHome} />;
      case 'medicate':
        return <Medicate onBack={goHome} />;
      case 'help':
        return <Help onBack={goHome} />;
      case 'preferences':
        return <Preferences onBack={goHome} />;
      default:
        return null;
    }
  };

  const currentSlideClass = transitionDir === 'forward' ? 'slide-out-left' : transitionDir === 'back' ? 'slide-out-right' : '';
  const incomingSlideClass = transitionDir === 'forward' ? 'slide-in-right' : transitionDir === 'back' ? 'slide-in-left' : '';

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {isTransitioning ? (
          <>
            <div className={`scene-wrapper ${currentSlideClass}`}>
              {renderScene(currentScene)}
            </div>
            <div className={`scene-wrapper ${incomingSlideClass}`}>
              {renderScene(incomingScene)}
            </div>
          </>
        ) : (
          renderScene(currentScene)
        )}
      </div>
      {isLandscape && (
        <div className="landscape-overlay">
          <div className="landscape-message">
            <div className="landscape-icon">&#x1F4F1;</div>
            <div>Please rotate your device to portrait mode</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
