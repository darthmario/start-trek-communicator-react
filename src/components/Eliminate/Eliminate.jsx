import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudio } from '../../hooks/useAudio';
import { getAudioContext, getAudioBuffer } from '../../utils/audioContext';
import { vibrateDialTick, vibratePhaserStart, vibrateStop } from '../../utils/haptics';
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
  const prevLevelRef = useRef(1);
  const overloadSourceRef = useRef(null);
  const overloadGainRef = useRef(null);
  const overloadTimerRef = useRef(null);

  const clearOverload = useCallback(() => {
    if (overloadTimerRef.current) {
      clearTimeout(overloadTimerRef.current);
      overloadTimerRef.current = null;
    }
    if (overloadSourceRef.current) {
      try { overloadSourceRef.current.stop(); } catch { /* already stopped */ }
      overloadSourceRef.current.disconnect();
      overloadSourceRef.current = null;
    }
    if (overloadGainRef.current) {
      overloadGainRef.current.disconnect();
      overloadGainRef.current = null;
    }
    overloadAudio.stop();
  }, [overloadAudio]);

  const startOverload = useCallback(() => {
    clearOverload();

    const src = '/audio/phaser/phaser_overload_effect.mp3';
    const ctx = getAudioContext();

    getAudioBuffer(src).then((buffer) => {
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + buffer.duration);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = false;
      source.connect(gain);
      source.start(0);

      overloadSourceRef.current = source;
      overloadGainRef.current = gain;

      source.onended = () => {
        overloadSourceRef.current = null;
        overloadGainRef.current = null;
      };
    }).catch(() => {});
  }, [clearOverload]);

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
    prevLevelRef.current = newLineRef.current;
    buttonAudio.play('/audio/phaser/tick.mp3', { loop: true });

    if (newLineRef.current !== 7) {
      effectsAudio.pause();
    }

    const handleMove = (ev) => {
      if (!isDraggingRef.current) return;
      const diff = Math.floor((startMouseRef.current - ev.clientY) / 2);
      const movePos = dialPosRef.current + diff;
      const level = getLevel(movePos);
      if (level !== newLineRef.current) {
        vibrateDialTick();
      }
      newLineRef.current = level;

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
          effectsAudio.play(`/audio/phaser/${newLineRef.current}.mp3`);
          overloadTimerRef.current = setTimeout(() => startOverload(), 1500);
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
      vibratePhaserStart();
      effectsAudio.play('/audio/phaser/phaser_loop.mp3', { loop: true });
    }
  }, [effectsAudio]);

  const handleFireUp = useCallback(() => {
    vibrateStop();
    if (newLineRef.current !== 7) {
      effectsAudio.pause();
    }
  }, [effectsAudio]);

  // Clean up all audio on unmount
  useEffect(() => {
    return () => {
      clearOverload();
      effectsAudio.stop();
      buttonAudio.stop();
    };
  }, [clearOverload, effectsAudio, buttonAudio]);

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
