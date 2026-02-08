import { useRef, useCallback, useEffect } from 'react';
import { useAudio } from '../../hooks/useAudio';
import './Medicate.css';

function Medicate({ onBack }) {
  const buttonAudio = useAudio();
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const spinTimerRef = useRef(null);
  const spinXRef = useRef(0);

  const spinMedical = useCallback(() => {
    spinXRef.current += 51;
    if (frontRef.current) {
      frontRef.current.style.backgroundPositionX = spinXRef.current + 'px';
      frontRef.current.style.backgroundPositionY = '-210px';
    }
    if (backRef.current) {
      backRef.current.style.backgroundPositionX = -spinXRef.current + 'px';
      backRef.current.style.backgroundPositionY = '-190px';
    }
  }, []);

  const handleStart = useCallback((e) => {
    e.preventDefault();
    buttonAudio.play('/audio/sickbay/scanner.mp3', { loop: true });
    spinMedical();
    spinTimerRef.current = setInterval(spinMedical, 30);
  }, [buttonAudio, spinMedical]);

  const handleStop = useCallback(() => {
    buttonAudio.pause();
    if (frontRef.current) {
      frontRef.current.style.backgroundPositionY = '0px';
    }
    if (backRef.current) {
      backRef.current.style.backgroundPositionY = '0px';
    }
    if (spinTimerRef.current) {
      clearInterval(spinTimerRef.current);
      spinTimerRef.current = null;
    }
  }, [buttonAudio]);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    };
  }, []);

  return (
    <div className="container medicate-scene">
      <button className="back-button" onPointerDown={onBack}>{'\u25C0'}</button>
      <div className="medical-background">
        <div className="medical-glass-back"></div>
        <div className="medical-spinner-back" ref={backRef}></div>
        <div className="medical-glass-top"></div>
        <div className="medical-spinner-post"></div>
        <div className="medical-spinner-front" ref={frontRef}></div>
        <div className="medical-glass-front"></div>
        <div className="medical-body"></div>
        <div
          className="standard-button medical-std-btn"
          onPointerDown={handleStart}
          onPointerUp={handleStop}
          onPointerLeave={handleStop}
        ></div>
      </div>
    </div>
  );
}

export default Medicate;
