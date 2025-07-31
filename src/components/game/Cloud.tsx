'use client';
import { useState, useEffect } from 'react';

const Cloud = () => {
  const [style, setStyle] = useState<React.CSSProperties | undefined>(undefined);
  const [lightningStyle, setLightningStyle] = useState<React.CSSProperties | undefined>(undefined);


  useEffect(() => {
    // This code now runs only on the client, after the initial render.
    const size = Math.random() * 80 + 60; // 60px to 140px wide
    const x = Math.random() * 100; // 0% to 100%
    const y = Math.random() * 40 - 10; // -10% to 30% from the top
    const animationDuration = Math.random() * 30 + 40; // 40s to 70s
    const animationDelay = Math.random() * 20; // 0s to 20s
    
    setStyle({
      position: 'absolute' as const,
      left: `${x}vw`,
      top: `${y}vh`,
      width: `${size}px`,
      height: 'auto',
      animation: `drift ${animationDuration}s linear ${animationDelay}s infinite`,
      opacity: 0.7,
    });

    setLightningStyle({
      animationDelay: `${Math.random() * 5}s`,
    })
  }, []);

  if (!style) {
    // Render nothing on the server and on the initial client render.
    return null;
  }

  return (
    <div style={style}>
      <svg
        viewBox="0 0 130 90"
        fill="rgba(255,255,255,0.8)"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <circle cx="45" cy="45" r="45" />
        <circle cx="85" cy="45" r="45" />
        <rect x="45" width="40" height="90" />
         <g className="raindrops">
            <line x1="50" y1="60" x2="50" y2="70" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <line x1="65" y1="65" x2="65" y2="75" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <line x1="80" y1="58" x2="80" y2="68" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
            <line x1="95" y1="62" x2="95" y2="72" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        </g>
        <polygon className="lightning" style={lightningStyle} points="65,45 80,65 70,65 85,85 60,60 75,60 65,45" fill="hsl(var(--primary))" />
      </svg>
    </div>
  );
};

export default Cloud;
