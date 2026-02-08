import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudio } from '../../hooks/useAudio';
import './Eliminate.css';

function Eliminate({ onBack }) {
  const buttonAudio = useAudio();
  const effectsAudio = useAudio();
  const overloadAudio = useAudio();

  const [dialPos, setDialPos] = useState(-570);
  const dialPosRef = useRef(-570);
  const startMouseRef = useRef(0);
  const currentLineRef = useRef(0);
  const newLineRef = useRef(1);
  const isDraggingRef = useRef(false);
  const finalPosRef = useRef(-570);
  const phaserNumberRef = useRef(null);
  const backDialRef = useRef(null);
  const overloadRampRef = useRef(null);

  const clearOverload = useCallback(() => {
    if (overloadRampRef.current) {
      clearInterval(overloadRampRef.current);
      overloadRampRef.current = null;
    }
    overloadAudio.stop();
  }, [overloadAudio]);

  const startOverload = useCallback(() => {
    clearOverload();

    const audio = overloadAudio.audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
    audio.volume = 0.02;
    audio.src = '/audio/phaser/phaser_overload_effect.mp3';

    // Once we know the duration, ramp volume linearly over it
    const beginRamp = () => {
      const duration = audio.duration;
      if (!duration || !isFinite(duration)) return;
      const stepInterval = 200;
      const steps = (duration * 1000) / stepInterval;
      let step = 0;
      overloadRampRef.current = setInterval(() => {
        step++;
        const vol = Math.min(1, 0.02 + (step / steps) * 0.98);
        audio.volume = vol;
        if (step >= steps) {
          clearInterval(overloadRampRef.current);
          overloadRampRef.current = null;
        }
      }, stepInterval);
    };

    audio.addEventListener('loadedmetadata', function handler() {
      audio.removeEventListener('loadedmetadata', handler);
      beginRamp();
    });
    // In case metadata is already loaded
    if (audio.readyState >= 1) beginRamp();

    audio.play().catch(() => {});
  }, [clearOverload, overloadAudio]);


  const getLevel = (pos) => {
    if (pos < -500) return 1;
    if (pos < -401) return 2;
    if (pos < -286) return 3;
    if (pos < -167) return 4;
    if (pos < -108) return 5;
    if (pos < -49) return 6;
    return 7;
  };

  const handleDialDown = useCallback((e) => {
    e.preventDefault();
    startMouseRef.current = e.clientY;
    isDraggingRef.current = true;
    buttonAudio.play('/audio/phaser/tick.mp3', { loop: true });

    if (newLineRef.current !== 7) {
      effectsAudio.pause();
    }

    const handleMove = (ev) => {
      if (!isDraggingRef.current) return;
      const diff = Math.floor((startMouseRef.current - ev.clientY) / 2);
      const movePos = dialPosRef.current + diff;
      newLineRef.current = getLevel(movePos);

      if (movePos >= -570 && movePos <= 0) {
        finalPosRef.current = movePos;
        if (phaserNumberRef.current) {
          phaserNumberRef.current.style.backgroundPositionY = movePos + 'px';
        }
        if (backDialRef.current) {
          backDialRef.current.style.backgroundPositionY = (dialPosRef.current - diff) + 'px';
        }
      } else {
        buttonAudio.pause();
      }
    };

    const handleUp = () => {
      isDraggingRef.current = false;
      buttonAudio.pause();
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);

      if (currentLineRef.current !== newLineRef.current) {
        if (newLineRef.current === 7) {
          // Level 7: play the level sound then start overload
          effectsAudio.play(`/audio/phaser/${newLineRef.current}.mp3`);
          setTimeout(() => startOverload(), 1500);
        } else {
          clearOverload();
          effectsAudio.play(`/audio/phaser/${newLineRef.current}.mp3`);
        }
        currentLineRef.current = newLineRef.current;
      }
      dialPosRef.current = finalPosRef.current;
      setDialPos(finalPosRef.current);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }, [buttonAudio, effectsAudio, startOverload, clearOverload]);

  const handleFireDown = useCallback((e) => {
    e.preventDefault();
    if (newLineRef.current !== 7) {
      effectsAudio.play('/audio/phaser/phaser_loop.mp3', { loop: true });
    }
  }, [effectsAudio]);

  const handleFireUp = useCallback(() => {
    if (newLineRef.current !== 7) {
      effectsAudio.pause();
    }
  }, [effectsAudio]);

  return (
    <div className="container eliminate-scene">
      <button className="back-button" onPointerDown={onBack}>{'\u25C0'}</button>
      <div className="phaser-gradient-bg">
        <div className="phaser-shadow"></div>
        <div className="phaser-bg-shadow"></div>
        <div className="phaser-metal"></div>
        <div className="phaser-dial-holder">
          <div className="phaser-dial-shadow"></div>
          <div className="phaser-dial" ref={backDialRef}></div>
          <div className="phaser-dial-cover"></div>
          <div
            className="phaser-dial-button"
            onPointerDown={handleDialDown}
          ></div>
        </div>
        <div
          className="phaser-dept-buttons"
          onPointerDown={handleFireDown}
          onPointerUp={handleFireUp}
          onPointerLeave={handleFireUp}
        >
          <div className="operations-color-on straight-bg"></div>
          <div className="straight-button"></div>
        </div>
        <div className="phaser-numbers-holder">
          <div className="phaser-dial-shadow"></div>
          <div className="phaser-numbers" ref={phaserNumberRef} style={{ backgroundPositionY: dialPos + 'px' }}></div>
          <div className="phaser-numbers-cover"></div>
        </div>
      </div>
    </div>
  );
}

export default Eliminate;
