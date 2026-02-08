import { useEffect, useRef } from 'react';

function SignalSpinner({ spinning, frame }) {
  const spinnerRef = useRef(null);
  const rotationRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (spinning) {
      // Set initial random frame position
      const yPos = (190 * frame) - 2;
      if (spinnerRef.current) {
        spinnerRef.current.style.backgroundPosition = `-13px -${yPos}px`;
      }

      const spin = () => {
        rotationRef.current += 9;
        if (spinnerRef.current) {
          spinnerRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }
      };

      spin();
      timerRef.current = setInterval(spin, 3000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [spinning, frame]);

  return (
    <div className="spinner-holder">
      <div className="spinner-bg">
        <div className="spinner-pattern" ref={spinnerRef}></div>
        <div className="spinner-static-pattern"></div>
      </div>
      <div className="spinner-cover"></div>
    </div>
  );
}

export default SignalSpinner;
