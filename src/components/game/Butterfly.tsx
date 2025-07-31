'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const Butterfly = () => {
  const [style, setStyle] = useState<React.CSSProperties | undefined>(undefined);

  useEffect(() => {
    // This code now runs only on the client, after the initial render.
    const size = Math.random() * 50 + 30; // 30px to 80px
    const x = Math.random() * 100; // 0% to 100%
    const y = Math.random() * 30 + 100; // 100% to 130% (starts off-screen)
    const animationDuration = Math.random() * 10 + 10; // 10s to 20s
    const animationDelay = Math.random() * 10; // 0s to 10s
    const animationName = `fly-${Math.floor(Math.random() * 4) + 1}`;
    
    setStyle({
      position: 'absolute' as const,
      left: `${x}vw`,
      top: `${y}vh`,
      width: `${size}px`,
      height: `${size}px`,
      animation: `${animationName} ${animationDuration}s linear ${animationDelay}s infinite`,
      opacity: 1, // Make it visible once style is set
    });
  }, []); // Empty dependency array ensures this runs only once on the client.

  if (!style) {
    // Render nothing on the server and on the initial client render.
    return null;
  }

  return (
    <div style={style}>
        <Image
            src="https://media.tenor.com/krQ_G9XjW0IAAAAm/butterfly.webp"
            alt="Butterfly"
            layout="fill"
            objectFit="contain"
            unoptimized
        />
    </div>
  );
};

export default Butterfly;
