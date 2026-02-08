import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudio } from '../../hooks/useAudio';
import { useShake } from '../../hooks/useShake';
import { useFlick } from '../../hooks/useFlick';
import { characters } from '../../data/characters';
import { buttonArray } from '../../data/buttons';
import SignalSpinner from './SignalSpinner';
import DepartmentButtons from './DepartmentButtons';
import ResponseButtons from './ResponseButtons';
import AntennaGrill from './AntennaGrill';
import { vibrateGrill, vibrateButton } from '../../utils/haptics';
import './Communicate.css';

function Communicate({ onBack, motionPermission }) {
  const buttonAudio = useAudio();
  const effectsAudio = useAudio();

  const [transmitting, setTransmitting] = useState(false);
  const [activeDept, setActiveDept] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [spinnerFrame, setSpinnerFrame] = useState(0);

  const sceneRef = useRef(null);
  const greetedRef = useRef(false);
  const lastButtonRef = useRef(-1);
  const lastDeptRef = useRef('none');
  const lastCharRef = useRef(-1);
  const lastSayingRef = useRef(-1);
  const messageRef = useRef('none');
  const characterRef = useRef(0);
  const departmentRef = useRef('');
  const spinTimerRef = useRef(null);
  const rotationRef = useRef(0);

  const getEnabledCharacters = useCallback((dept) => {
    let prefs = {};
    try {
      prefs = JSON.parse(localStorage.getItem('stComPrefs')) || {};
    } catch (e) { /* ignore */ }

    const charNames = {
      buttonCommand: ['uhura', 'chekov', 'pike', 'guardian'],
      buttonOperations: ['sulu', 'scotty', 'nomad', 'zephram'],
      buttonScience: ['bones', 'spock', 'computer', 'sarek', 'chapel']
    };

    const names = charNames[dept] || [];
    const indices = [];
    for (let i = 0; i < names.length; i++) {
      const key = names[i] + 'Toggle';
      // Default to true (enabled) if no prefs set
      if (prefs[key] === undefined || prefs[key] === true) {
        indices.push(i);
      }
    }
    return indices.length > 0 ? indices : [0]; // fallback to first character
  }, []);

  const grillOpenClose = useCallback(() => {
    vibrateGrill();
    if (transmitting) {
      // Close
      setTransmitting(false);
      setActiveDept(null);
      setSpinning(false);
      if (spinTimerRef.current) {
        clearInterval(spinTimerRef.current);
        spinTimerRef.current = null;
      }
      effectsAudio.play('/audio/communicator/endTalking.mp3');
    } else {
      // Open
      setTransmitting(true);
      setSpinning(true);
      setSpinnerFrame(Math.floor(Math.random() * 3));
      effectsAudio.play('/audio/communicator/startTalking.mp3');
    }
  }, [transmitting, effectsAudio]);

  // Touch flick on scene — vertical swipe toggles grill (matches original webOS Mojo.Event.flick)
  useFlick(sceneRef, grillOpenClose);

  // Device shake — physical shake toggles grill (matches original webOS shakestart/shaking/shakeend)
  useShake(grillOpenClose, {
    enabled: motionPermission === 'granted' || motionPermission === 'not-needed'
  });

  const handleDeptPress = useCallback((dept) => {
    if (!transmitting) return;
    vibrateButton();

    greetedRef.current = false;
    setActiveDept(dept);

    // Play random button click
    let randomNumber = Math.floor(Math.random() * buttonArray.length);
    while (randomNumber === lastButtonRef.current && buttonArray.length > 1) {
      randomNumber = Math.floor(Math.random() * buttonArray.length);
    }
    buttonAudio.play(buttonArray[randomNumber]);
    lastButtonRef.current = randomNumber;

    // Select random enabled character
    const enabled = getEnabledCharacters(dept);
    let charIdx = enabled[Math.floor(Math.random() * enabled.length)];
    if (dept === lastDeptRef.current) {
      let attempts = 0;
      while (charIdx === lastCharRef.current && enabled.length > 1 && attempts < 20) {
        charIdx = enabled[Math.floor(Math.random() * enabled.length)];
        attempts++;
      }
    }
    lastCharRef.current = charIdx;
    lastDeptRef.current = dept;
    characterRef.current = charIdx;
    departmentRef.current = dept;
  }, [transmitting, buttonAudio, getEnabledCharacters]);

  const handleResponsePress = useCallback((type) => {
    if (!transmitting || !departmentRef.current) return;
    vibrateButton();

    const dept = departmentRef.current;
    const charIdx = characterRef.current;
    const lastMessage = messageRef.current;
    let message;

    if (!greetedRef.current) {
      message = 'hello';
      greetedRef.current = true;
    } else if (type === 'negative') {
      message = 'negative';
    } else {
      message = 'positive';
    }
    messageRef.current = message;

    const charData = characters[dept]?.[charIdx];
    if (!charData || !charData[message]) return;

    const sayingCount = charData[message].length;
    let sayingNumber = Math.floor(Math.random() * sayingCount);
    if (message !== 'hello' && message === lastMessage) {
      let attempts = 0;
      while (sayingNumber === lastSayingRef.current && sayingCount > 1 && attempts < 20) {
        sayingNumber = Math.floor(Math.random() * sayingCount);
        attempts++;
      }
    }
    lastSayingRef.current = sayingNumber;

    const filename = charData[message][sayingNumber];
    const path = `/audio/characters/${dept}/${charIdx}/${message}${filename}`;
    effectsAudio.play(path);
  }, [transmitting, effectsAudio]);

  // Screen Wake Lock — keep screen on while grill is open
  useEffect(() => {
    if (!transmitting) return;
    if (!('wakeLock' in navigator)) return;

    let wakeLock = null;
    let released = false;

    const acquire = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      } catch { /* unsupported or denied */ }
    };

    acquire();

    // Re-acquire on visibility change (wake lock auto-releases when page hidden)
    const onVisChange = () => {
      if (document.visibilityState === 'visible' && !released) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisChange);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [transmitting]);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    };
  }, []);

  return (
    <div className="container communicate-scene" ref={sceneRef}>
      <button className="back-button" onPointerDown={onBack}>{'\u25C0'}</button>
      <div className="trough-gradient-bg"></div>
      <div className="trough-shadow"></div>
      <div className="trough-texture"></div>
      <SignalSpinner spinning={spinning} frame={spinnerFrame} />
      <DepartmentButtons activeDept={activeDept} onPress={handleDeptPress} transmitting={transmitting} />
      <div className="communicator-panel">
        <div className="communicator-metal-texture"></div>
        <div className="communicator-metal-shadow"></div>
        <div className="communicator-speaker-holder">
          <div className="communicator-speaker-shadow"></div>
          <div className="communicator-grill"></div>
          <div className="communicator-inner-shadow"></div>
          <div className="communicator-frame"></div>
        </div>
        <ResponseButtons onPress={handleResponsePress} transmitting={transmitting} />
      </div>
      <AntennaGrill open={transmitting} onToggle={grillOpenClose} />
    </div>
  );
}

export default Communicate;
