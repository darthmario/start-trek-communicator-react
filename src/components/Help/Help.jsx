import { useEffect, useRef } from 'react';
import './Help.css';

function Help({ onBack }) {
  const cloudRef = useRef(null);
  const logoRef = useRef(null);
  const thanksRef = useRef(null);

  useEffect(() => {
    // Trigger animations after mount
    requestAnimationFrame(() => {
      if (cloudRef.current) cloudRef.current.style.backgroundPosition = '-6000px';
      if (logoRef.current) {
        logoRef.current.style.transform = 'scale(1)';
        logoRef.current.style.left = '0.1em';
        logoRef.current.style.top = '-0.2em';
      }
      if (thanksRef.current) thanksRef.current.style.transform = 'scale(1)';
    });
  }, []);

  return (
    <div className="wwonbg">
      <button className="back-button back-button-help" onPointerDown={onBack}>{'\u25C0'}</button>
      <div className="wwon-clouds" ref={cloudRef}>
        <div className="wwon-head">
          <div className="wwon-logo" ref={logoRef}></div>
          <div className="wwon-baloon thanks-box" ref={thanksRef}>
            <h1>About This App</h1>
            <p>The Star Trek Communicator &amp; Away Team Action Playset was originally built as a webOS 1.0 app for the Palm Pre back in 2009. It featured 7 interactive scenes with character voices, sound effects, and fun easter eggs.</p>
            <p>In 2026, this app was converted from its original Mojo framework to a modern React web app by Claude, Anthropic's AI assistant. The entire conversion — all components, CSS, audio integration, and animations — was done through conversation with Claude Code.</p>
            <p>The original app was created by Nate of The Wonderful World of Nate.</p>
          </div>
          <div style={{ height: '2em' }}></div>
        </div>
      </div>
    </div>
  );
}

export default Help;
