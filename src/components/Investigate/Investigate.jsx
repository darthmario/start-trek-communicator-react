import { useEffect, useRef, useCallback } from 'react';
import { useAudio } from '../../hooks/useAudio';
import './Investigate.css';

function Investigate({ onBack }) {
  const buttonAudio = useAudio();
  const screenBGRef = useRef(null);
  const screenFGRef = useRef(null);
  const loopBinaryRef = useRef(0);
  const loopCountRef = useRef(1);
  const timerRef = useRef(null);

  useEffect(() => {
    // Play initial music
    buttonAudio.play('/audio/tricorder/1_music.mp3');

    // Initialize screen FG position
    if (screenFGRef.current) {
      screenFGRef.current.style.backgroundPositionY = '-226px';
    }

    // Start screen cycling
    const screenChanger = () => {
      if (loopBinaryRef.current === 0) {
        if (screenFGRef.current) {
          screenFGRef.current.style.backgroundPositionY = `-${loopCountRef.current * 226}px`;
          screenFGRef.current.style.opacity = '1';
        }
        loopBinaryRef.current = 1;
      } else {
        if (screenBGRef.current) {
          screenBGRef.current.style.backgroundPositionY = `-${loopCountRef.current * 226}px`;
        }
        if (screenFGRef.current) {
          screenFGRef.current.style.opacity = '0';
        }
        loopBinaryRef.current = 0;
        loopCountRef.current++;
      }
    };

    timerRef.current = setInterval(screenChanger, 2500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [buttonAudio]);

  const playMusic = useCallback((id) => {
    buttonAudio.play(`/audio/tricorder/${id}.mp3`);
  }, [buttonAudio]);

  return (
    <div className="container investigate-scene">
      <button className="back-button" onPointerDown={onBack}>{'\u25C0'}</button>
      <div className="tricorder-gradient-bg">
        <div className="tricorder-metal-texture"></div>
        <div className="tricorder-metal-shadow"></div>
        <div className="tricorder-screen-holder" ref={screenBGRef}></div>
        <div className="tricorder-screen-holder tricorder-screen-changer" ref={screenFGRef}></div>
        <div className="tricorder-screen-cover"></div>
        <div className="tricorder-button-holder">
          <div className="standard-button tricorder-std-btn1" onPointerDown={() => playMusic('4_music')}></div>
          <div className="standard-button tricorder-std-btn2" onPointerDown={() => playMusic('5_music')}></div>
          <div className="standard-button tricorder-std-btn3" onPointerDown={() => playMusic('6_music')}></div>
        </div>
        <div className="tricorder-dept-buttons">
          <div className="tricorder-button1">
            <div className="command-color-off straight-bg"></div>
            <div className="straight-button" onPointerDown={() => playMusic('1_music')}></div>
          </div>
          <div className="tricorder-button2">
            <div className="operations-color-off straight-bg"></div>
            <div className="straight-button" onPointerDown={() => playMusic('2_music')}></div>
          </div>
          <div className="tricorder-button3">
            <div className="science-color-off straight-bg"></div>
            <div className="straight-button" onPointerDown={() => playMusic('3_music')}></div>
          </div>
        </div>
        <div className="tricorder-speaker-holder">
          <div className="tricorder-speaker-shadow"></div>
          <div className="tricorder-grill"></div>
          <div className="tricorder-speaker-darken"></div>
          <div className="tricorder-inner-shadow"></div>
          <div className="tricorder-frame"></div>
        </div>
      </div>
    </div>
  );
}

export default Investigate;
