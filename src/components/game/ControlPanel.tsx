
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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [betLimits, setBetLimits] = useState({ min: 100, max: 5000 });

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    setBetLimits({
        min: Number(savedSettings.minBet) || 100,
        max: Number(savedSettings.maxBet) || 5000,
    });
  }, []);

  const handleBetChange = (amount: number) => {
    if (amount < betLimits.min || amount > betLimits.max) {
      toast({
        variant: 'destructive',
        title: 'Invalid Bet Amount',
        description: `Bet must be between ₹${betLimits.min} and ₹${betLimits.max}.`
      });
      return;
    }
    onBetAmountChange(amount);
  }

  return (
    <div className="p-2 md:p-4">
      <div className="control-panel max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {betAmounts.map(amount => (
            <button 
              key={amount} 
              className={cn(
                "amount-btn", 
                {'active': betAmount === amount},
                {'opacity-50 cursor-not-allowed': amount < betLimits.min || amount > betLimits.max}
              )}
              onClick={() => handleBetChange(amount)}
              disabled={isRunning || amount < betLimits.min || amount > betLimits.max}
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
