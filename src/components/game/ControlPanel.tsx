
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
import { GameState, Difficulty } from '@/app/page'
import { cn } from '@/lib/utils';

type ControlPanelProps = {
  gameState: GameState;
  onPlay: () => void;
  onCashOut: () => void;
  betAmount: number;
  onBetAmountChange: (amount: number) => void;
  multiplier: number;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
};

export default function ControlPanel({ 
    gameState, 
    onPlay, 
    onCashOut, 
    betAmount, 
    onBetAmountChange, 
    multiplier,
    difficulty,
    onDifficultyChange
}: ControlPanelProps) {
  
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
           <Select 
            value={difficulty} 
            onValueChange={(value: Difficulty) => onDifficultyChange(value)} 
            disabled={isRunning}
          >
            <SelectTrigger className="difficulty-select w-[120px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          
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
