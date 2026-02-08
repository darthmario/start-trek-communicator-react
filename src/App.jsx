import { useState, useRef, useEffect } from 'react';
import Title from './components/Title/Title';
import Communicate from './components/Communicate/Communicate';
import Eliminate from './components/Eliminate/Eliminate';
import Investigate from './components/Investigate/Investigate';
import Medicate from './components/Medicate/Medicate';
import Help from './components/Help/Help';
import Preferences from './components/Preferences/Preferences';
import { preloadAudio } from './utils/preloadAudio';

function App() {
  const [currentScene, setCurrentScene] = useState('title');
  const firstLoadRef = useRef(true);

  useEffect(() => {
    preloadAudio();
  }, []);

  const navigate = (scene) => setCurrentScene(scene);
  const goHome = () => setCurrentScene('title');

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {currentScene === 'title' && <Title onNavigate={navigate} firstLoad={firstLoadRef} />}
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
