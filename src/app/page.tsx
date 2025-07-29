
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import GameHeader from '@/components/game/GameHeader';
import GameScene from '@/components/game/GameScene';
import ControlPanel from '@/components/game/ControlPanel';
import { Sidebar } from '@/components/game/Sidebar';
import { useToast } from '@/hooks/use-toast';
import BottomNavBar from '@/components/game/BottomNavBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

export type GameState = 'ready' | 'running' | 'finished';
const GAME_STEP_INTERVAL = 1000; // ms per step

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [gameState, setGameState] = useState<GameState>('ready');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState(0);

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const updateWallet = () => {
      const currentUser = localStorage.getItem('currentUser');
      if(currentUser) {
          const user = JSON.parse(currentUser);
          setWalletBalance(user.wallet || 0);
      }
  };

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/auth');
    } else {
      setIsAuthenticated(true);
      updateWallet();
      const savedBetAmount = localStorage.getItem('betAmount');
      if (savedBetAmount) {
          setBetAmount(JSON.parse(savedBetAmount));
      }
    }
    // Listen for changes in local storage from other tabs/windows
    window.addEventListener('storage', updateWallet);
    return () => window.removeEventListener('storage', updateWallet);
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
        localStorage.setItem('betAmount', JSON.stringify(betAmount));
    }
  }, [betAmount, isAuthenticated]);

  const updateUser = (updateFn: (user: any) => any) => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;
    let user = JSON.parse(currentUserStr);
    user = updateFn(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.dispatchEvent(new StorageEvent('storage', { key: 'currentUser' }));
    updateWallet();
  };

  const addTransaction = (type: 'Bet' | 'Win' | 'Deposit' | 'Withdrawal', amount: number, status: 'Completed' | 'Pending' | 'Failed' = 'Completed') => {
    const newTransaction = {
        id: `TX${Date.now()}`,
        date: new Date().toLocaleString(),
        type,
        amount,
        status,
    };
    updateUser(user => ({
        ...user,
        transactionHistory: [newTransaction, ...(user.transactionHistory || [])],
    }));
  };

  const addBetHistory = (result: 'Win' | 'Loss', bet: number, cashout: number | null, winnings: number) => {
    const newBet = {
        id: `BH${Date.now()}`,
        date: new Date().toLocaleString(),
        bet,
        cashout,
        winnings,
        result,
    };
     updateUser(user => ({
        ...user,
        betHistory: [newBet, ...(user.betHistory || [])],
    }));
  };

  const handlePlay = () => {
    if (gameState === 'running') return;

    if (walletBalance < betAmount) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: `You do not have enough money (₹${walletBalance.toFixed(2)}) to place a bet of ₹${betAmount}.`,
      })
      return;
    }

    updateUser(user => ({ ...user, wallet: user.wallet - betAmount }));
    addTransaction('Bet', -betAmount);

    setGameState('running');
    setMultiplier(1.0);
    setCurrentStep(0);
    // Crash point between 1.1x and 10.0x
    const randomCrashPoint = 1.1 + Math.random() * 8.9;
    setCrashPoint(randomCrashPoint);
  };

  const handleCashOut = () => {
    if (gameState !== 'running' || multiplier <= 1.0) {
      return;
    }

    const winnings = betAmount * multiplier;
    
    updateUser(user => ({ ...user, wallet: user.wallet + winnings }));
    addTransaction('Win', winnings);
    addBetHistory('Win', betAmount, parseFloat(multiplier.toFixed(2)), winnings);

    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    setGameState('finished');
    setCrashPoint(null);

    toast({
      title: `🎉 You Won! 🎉`,
      description: `Cashed out at ${multiplier.toFixed(2)}x and won ₹${winnings.toFixed(2)}!`,
    })
  }

  const handleGameEnd = (didCrash: boolean) => {
    if (gameState !== 'running') return; 
    
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    setGameState('finished');

    if (didCrash) {
      addBetHistory('Loss', betAmount, null, -betAmount);
      toast({
        variant: "destructive",
        title: "Oh No! You Crashed!",
        description: `You lost your bet of ₹${betAmount}. Better luck next time!`,
      })
    }
  }

  useEffect(() => {
    if (gameState === 'running' && crashPoint) {
      const startTime = Date.now();
      gameIntervalRef.current = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        const newMultiplier = 1 + (elapsedTime * 0.1) + (elapsedTime * elapsedTime * 0.01);
        
        if (newMultiplier < crashPoint) {
          setMultiplier(newMultiplier);
          setCurrentStep(prev => prev + 1);
        } else {
          handleGameEnd(true);
        }
      }, GAME_STEP_INTERVAL);
    } else {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    }

    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, crashPoint]);

  if (!isAuthenticated) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
            <div className="space-y-4 w-full max-w-lg">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
      );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background font-body">
      <GameHeader onMenuClick={() => setSidebarOpen(true)} walletBalance={walletBalance} />
      <div className="relative flex-1 pb-40 md:pb-0">
        <GameScene 
          gameState={gameState} 
          currentStep={currentStep}
        />
      </div>
      <div className="md:relative absolute bottom-16 left-0 right-0 z-20">
         <ControlPanel 
            gameState={gameState} 
            onPlay={handlePlay} 
            onCashOut={handleCashOut}
            betAmount={betAmount}
            onBetAmountChange={setBetAmount}
            multiplier={multiplier}
        />
      </div>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onOpenChange={setSidebarOpen} 
        walletBalance={walletBalance}
      />
      {isMobile && <BottomNavBar onMenuClick={() => setSidebarOpen(true)} />}
    </div>
  );
}
