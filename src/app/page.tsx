
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GameHeader from '@/components/game/GameHeader';
import GameScene from '@/components/game/GameScene';
import ControlPanel from '@/components/game/ControlPanel';
import { Sidebar } from '@/components/game/Sidebar';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { app } from '@/lib/firebase';
import { getDatabase, ref, update, push, set, onValue, off } from 'firebase/database';
import BottomNavBar from '@/components/game/BottomNavBar';

export type GameState = 'ready' | 'running' | 'finished';
export type Difficulty = 'easy' | 'medium' | 'hard';
const GAME_STEP_INTERVAL = 1000; // ms per step

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [gameState, setGameState] = useState<GameState>('ready');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // This effect runs once on component mount on the client side.
    const db = getDatabase(app);
    let settingsListener: any;
    let userListener: any;

    // Fetch settings first
    const settingsRef = ref(db, 'settings');
    settingsListener = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const dbSettings = snapshot.val();
        setSettings(dbSettings);
        // We can store settings in localStorage for faster initial loads on subsequent visits,
        // but the primary source is always Firebase.
        localStorage.setItem('adminSettings', JSON.stringify(dbSettings));
      }
    });

    // Check for logged-in user and fetch their data
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/auth');
      return; // Stop execution if no user
    }

    const localUser = JSON.parse(userStr);
    if (!localUser || !localUser.id) {
      router.push('/auth');
      return; // Stop execution if user data is invalid
    }

    // Set user from local storage first for a faster UI update
    setCurrentUser(localUser);

    // Then, listen for real-time updates from Firebase for that user
    const userRef = ref(db, `users/${localUser.id}`);
    userListener = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const dbUser = snapshot.val();
        setCurrentUser(dbUser);
        localStorage.setItem('currentUser', JSON.stringify(dbUser));
      }
    });

    // Load bet and difficulty from localStorage
    const savedBetAmount = localStorage.getItem('betAmount');
    if (savedBetAmount) setBetAmount(JSON.parse(savedBetAmount));
      
    const savedDifficulty = localStorage.getItem('difficulty');
    if (savedDifficulty) setDifficulty(JSON.parse(savedDifficulty));

    // Cleanup function to detach listeners when the component unmounts
    return () => {
      if (settingsListener) off(settingsRef, 'value', settingsListener);
      if (userListener) off(userRef, 'value', userListener);
    };
  }, [router]);

  useEffect(() => {
    // This effect saves bet and difficulty to localStorage whenever they change.
    if (currentUser && settings) {
        localStorage.setItem('betAmount', JSON.stringify(betAmount));
        localStorage.setItem('difficulty', JSON.stringify(difficulty));
    }
  }, [betAmount, difficulty, currentUser, settings]);


  const updateUserInDbAndLocal = async (updates: any) => {
    if (!currentUser || !currentUser.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not found. Please log in again.' });
      router.push('/auth');
      return Promise.reject(new Error("User ID not found in current user data."));
    }
    
    const db = getDatabase(app);
    const userRef = ref(db, `users/${currentUser.id}`);
    
    // Optimistically update local state for a snappier UI
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return update(userRef, updates);
  };

  const addTransaction = (type: 'Bet' | 'Win' | 'Deposit' | 'Withdrawal', amount: number, status: 'Completed' | 'Pending' | 'Failed' = 'Completed') => {
    if (!currentUser || !currentUser.id) return;
    
    const newTransaction = {
        date: new Date().toISOString(),
        type,
        amount,
        status,
    };
    
    const db = getDatabase(app);
    const transactionRef = push(ref(db, `users/${currentUser.id}/transactionHistory`));
    set(transactionRef, newTransaction);
  };

  const addBetHistory = (result: 'Win' | 'Loss', bet: number, cashout: number | null, winnings: number) => {
    if (!currentUser || !currentUser.id) return;

    const newBet = {
        date: new Date().toISOString(),
        bet,
        cashout,
        winnings,
        result,
    };
    
    const db = getDatabase(app);
    const betRef = push(ref(db, `users/${currentUser.id}/betHistory`));
    set(betRef, newBet);
  };

  const handlePlay = () => {
    if (gameState === 'running' || !currentUser || !settings) return;
    
    const minBet = parseFloat(settings.minBet);
    const maxBet = parseFloat(settings.maxBet);

    if(betAmount < minBet) {
         toast({
            variant: "destructive",
            title: "Bet Too Low",
            description: `The minimum bet amount is ₹${minBet}.`,
        });
        return;
    }
    if(betAmount > maxBet) {
         toast({
            variant: "destructive",
            title: "Bet Too High",
            description: `The maximum bet amount is ₹${maxBet}.`,
        });
        return;
    }

    if (currentUser.wallet < betAmount) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: `You do not have enough money (₹${currentUser.wallet.toFixed(2)}) to place a bet of ₹${betAmount}.`,
      })
      return;
    }

    updateUserInDbAndLocal({ wallet: currentUser.wallet - betAmount });
    addTransaction('Bet', -betAmount, 'Completed');

    setGameState('running');
    setMultiplier(1.0);
    setCurrentStep(0);
    
    let min = 1.01, max = 2.00;

    switch(difficulty) {
        case 'easy':
            min = parseFloat(settings.difficultyEasyMin);
            max = parseFloat(settings.difficultyEasyMax);
            break;
        case 'medium':
            min = parseFloat(settings.difficultyMediumMin);
            max = parseFloat(settings.difficultyMediumMax);
            break;
        case 'hard':
            min = parseFloat(settings.difficultyHardMin);
            max = parseFloat(settings.difficultyHardMax);
            break;
    }

    const randomCrashPoint = Math.random() * (max - min) + min;
    setCrashPoint(randomCrashPoint);
  };

  const handleCashOut = () => {
    if (gameState !== 'running' || multiplier <= 1.0 || !currentUser) {
      return;
    }

    const winnings = betAmount * multiplier;
    
    updateUserInDbAndLocal({ wallet: currentUser.wallet + winnings });
    addTransaction('Win', winnings, 'Completed');
    addBetHistory('Win', parseFloat(multiplier.toFixed(2)), betAmount, winnings);

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

  // Show a loading screen until both user and settings are loaded.
  if (!currentUser || !settings) {
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
      <GameHeader onMenuClick={() => setSidebarOpen(true)} walletBalance={currentUser.wallet} settings={settings} />
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
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            settings={settings}
        />
      </div>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onOpenChange={setSidebarOpen} 
        currentUser={currentUser}
        settings={settings}
      />
      {isMobile && <BottomNavBar onMenuClick={() => setSidebarOpen(true)} currentUser={currentUser} />}
    </div>
  );
}
