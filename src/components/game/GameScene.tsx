
'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { GameState } from '@/app/page';
import { cn } from '@/lib/utils';
import Butterfly from './Butterfly';
import Cloud from './Cloud';

type GameSceneProps = {
  gameState: GameState;
  currentStep: number;
};

const GATES = [
  "1.0x", "1.03x", "1.07x", "1.12x", "1.17x", "1.23x", "1.29x", "1.36x", "1.44x", "1.52x", "1.61x", "1.73x", "1.85x", "2.00x", 
  "2.15x", "2.30x", "2.45x", "2.60x", "2.75x", "2.90x", "3.10x", "3.30x", "3.50x", "3.75x", "4.00x", "4.25x",
  "4.50x", "4.75x", "5.00x", "5.50x", "6.00x", "6.50x", "7.00x", "7.50x", "8.00x", "9.00x", "10.0x", "12.0x",
  "15.0x", "20.0x", "25.0x", "30.0x", "40.0x", "50.0x"
];
const BUTTERFLY_COUNT = 10;
const CLOUD_COUNT = 7;
const CARD_WIDTH_REM = 6;
const CARD_GAP_REM = 4;

export default function GameScene({ gameState, currentStep }: GameSceneProps) {
  const gatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gatesEl = gatesRef.current;
    if (!gatesEl) return;
    
    if (gameState === 'running') {
      const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const stepDistance = (CARD_WIDTH_REM + CARD_GAP_REM) * remInPixels;
      gatesEl.style.transform = `translateX(-${currentStep * stepDistance}px)`;
    } else {
      // Reset position when game is not running
      gatesEl.style.transform = `translateX(0px)`;
    }
  }, [currentStep, gameState]);
  
  return (
    <div className={cn("w-full h-full relative road-bg flex flex-col justify-center overflow-hidden", {
        'road-moving': gameState === 'running'
    })}>
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        {Array.from({ length: CLOUD_COUNT }).map((_, i) => (
          <Cloud key={`cloud-${i}`} />
        ))}
        {Array.from({ length: BUTTERFLY_COUNT }).map((_, i) => (
          <Butterfly key={`butterfly-${i}`} />
        ))}
      </div>
      
       <div className="absolute top-1/2 -translate-y-1/2 h-32 w-full pointer-events-none overflow-hidden">
          <div 
            ref={gatesRef}
            className="absolute left-[calc(20%_-_(var(--card-width)_/_2))] top-0 flex h-full items-center transition-transform duration-1000 ease-linear"
            style={{ 
              '--card-width': `${CARD_WIDTH_REM}rem`,
              gap: `${CARD_GAP_REM}rem` 
            } as React.CSSProperties}
          >
              {(GATES.concat(GATES)).map((gate, index) => (
                  <div key={index} className="flex-shrink-0 flex items-center justify-center" style={{ width: `${CARD_WIDTH_REM}rem`}}>
                    <div className="card">
                        <div className="gate-bg"></div>
                        <span className="multiplier">{gate}</span>
                    </div>
                  </div>
              ))}
          </div>
        </div>

      <div 
        className={cn(
            'absolute z-10 top-1/2 -translate-y-[60%] transition-transform duration-300',
            { 'chicken-bounce': gameState !== 'running' }
        )}
        style={{ left: '20%', transform: 'translate(-50%, -60%)' }}
      >
        <Image
          src={gameState === 'finished' ? "https://chickenroad.rajmines.com/images/blast.png" : "https://chickenroad.rajmines.com/images/chicken.png"}
          alt="Game Character"
          width={gameState === 'finished' ? 100 : 80}
          height={gameState === 'finished' ? 100 : 80}
          unoptimized
          className={cn('drop-shadow-2xl', { 'animate-ping': gameState === 'finished' })}
        />
      </div>
    </div>
  );
}
