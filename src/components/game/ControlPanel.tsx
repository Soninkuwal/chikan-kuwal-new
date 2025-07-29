
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HandCoins, PlayIcon } from 'lucide-react'
import Image from 'next/image'
import { GameState } from '@/app/page'
import { cn } from '@/lib/utils';

type ControlPanelProps = {
  gameState: GameState;
  onPlay: () => void;
  onCashOut: () => void;
  betAmount: number;
  onBetAmountChange: (amount: number) => void;
  multiplier: number;
};

export default function ControlPanel({ gameState, onPlay, onCashOut, betAmount, onBetAmountChange, multiplier }: ControlPanelProps) {
  
  const betAmounts = [100, 300, 500, 1000, 1500, 2000];
  const isRunning = gameState === 'running';

  return (
    <div className="p-2 md:p-4">
      <div className="control-panel max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {betAmounts.map(amount => (
            <button 
              key={amount} 
              className={cn("amount-btn", {'active': betAmount === amount})}
              onClick={() => onBetAmountChange(amount)}
              disabled={isRunning}
            >
              ₹{amount}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <select defaultValue="easy" disabled={isRunning} className="difficulty-select">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
          </select>
          
          {isRunning ? (
            <button 
              className="cashout-btn"
              onClick={onCashOut}
              disabled={multiplier <= 1.00}
            >
              <HandCoins />
              Cash Out @ {multiplier.toFixed(2)}x
            </button>
          ) : (
             <button 
              className="play-btn"
              onClick={onPlay}
              disabled={isRunning}
            >
                <PlayIcon/>
                {gameState === 'finished' ? 'Play Again' : 'Play'}
            </button>
          )}

        </div>
      </div>
    </div>
  )
}
