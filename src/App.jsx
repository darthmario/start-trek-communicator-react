import { useState, useRef, useEffect, useCallback } from 'react';
import Title from './components/Title/Title';
import Communicate from './components/Communicate/Communicate';
import Eliminate from './components/Eliminate/Eliminate';
import Investigate from './components/Investigate/Investigate';
import Medicate from './components/Medicate/Medicate';
import Help from './components/Help/Help';
import Preferences from './components/Preferences/Preferences';
import { preloadAllAssets } from './utils/preloadAssets';

function App() {
  const [currentScene, setCurrentScene] = useState('title');
  const [assetsReady, setAssetsReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    preloadAllAssets((loaded, total) => {
      setLoadProgress(Math.round((loaded / total) * 100));
    }).then(() => {
      setAssetsReady(true);
    });
  }, []);

  const navigate = useCallback((scene) => setCurrentScene(scene), []);
  const goHome = useCallback(() => setCurrentScene('title'), []);

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {currentScene === 'title' && (
          <Title
            onNavigate={navigate}
            firstLoad={firstLoadRef}
            assetsReady={assetsReady}
            loadProgress={loadProgress}
          />
        )}
        {currentScene === 'communicate' && <Communicate onBack={goHome} />}
        {currentScene === 'eliminate' && <Eliminate onBack={goHome} />}
        {currentScene === 'investigate' && <Investigate onBack={goHome} />}
        {currentScene === 'medicate' && <Medicate onBack={goHome} />}
        {currentScene === 'help' && <Help onBack={goHome} />}
        {currentScene === 'preferences' && <Preferences onBack={goHome} />}
      </div>
    </div>
  );
}

export default App;
