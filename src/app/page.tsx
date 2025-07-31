
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
import { app } from '@/lib/firebase';
import { getDatabase, ref, update, push, set, get, onValue, off } from 'firebase/database';

export type GameState = 'ready' | 'running' | 'finished';
export type Difficulty = 'easy' | 'medium' | 'hard';
const GAME_STEP_INTERVAL = 100; // ms per step, increased for slower motion

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [gameState, setGameState] = useState<GameState>('ready');
  const [betAmount, setBetAmount] = useState<number>(100);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    let unsubscribe = () => {};
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/auth');
    } else {
        const localUser = JSON.parse(userStr);
        if (localUser.id) {
            setIsAuthenticated(true);
            const db = getDatabase(app);
            const userRef = ref(db, `users/${localUser.id}`);
            unsubscribe = onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    const dbUser = snapshot.val();
                    // Merge local and DB user data, ensuring ID is preserved
                    const mergedUser = { ...localUser, ...dbUser, id: localUser.id };
                    localStorage.setItem('currentUser', JSON.stringify(mergedUser));
                    setCurrentUser(mergedUser);
                } else {
                    // This case might happen if user is deleted from DB but still in local storage
                    localStorage.removeItem('currentUser');
                    router.push('/auth');
                }
            });
        } else {
            // Invalid user object in local storage
            localStorage.removeItem('currentUser');
            router.push('/auth');
        }

      const savedBetAmount = localStorage.getItem('betAmount');
      if (savedBetAmount) {
        setBetAmount(JSON.parse(savedBetAmount));
      }
       const savedDifficulty = localStorage.getItem('difficulty');
        if (savedDifficulty) {
            setDifficulty(JSON.parse(savedDifficulty));
        }
    }
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
        localStorage.setItem('betAmount', JSON.stringify(betAmount));
        localStorage.setItem('difficulty', JSON.stringify(difficulty));
    }
  }, [betAmount, difficulty, isAuthenticated]);

  const updateUserInDbAndLocal = (updates: any) => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return Promise.reject("No current user found in local storage.");

    let user = JSON.parse(userStr);
    const userId = user.id;
    if (!userId) return Promise.reject(new Error("User ID not found in current user data."));

    const db = getDatabase(app);
    const userRef = ref(db, `users/${userId}`);
    const updatedUserForLocal = { ...user, ...updates, id: userId }; // Ensure ID is preserved

    Object.keys(updates).forEach(key => {
        if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key]) && user[key]) {
            updatedUserForLocal[key] = {...user[key], ...updates[key]};
        }
    });

    localStorage.setItem('currentUser', JSON.stringify(updatedUserForLocal));
    setCurrentUser(updatedUserForLocal);
    
    return update(userRef, updates).catch(error => {
      console.error("Firebase update failed:", error);
      // Revert local state if DB update fails
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
    });
  };


  const addTransaction = async (type: 'Bet' | 'Win' | 'Deposit' | 'Withdrawal', amount: number, status: 'Completed' | 'Pending' | 'Failed' = 'Completed') => {
    if (!currentUser || !currentUser.id) return;
    
    const newTransaction = {
        date: new Date().toISOString(),
        type,
        amount,
        status,
    };
    
    const transactionRef = push(ref(getDatabase(app), `users/${currentUser.id}/transactionHistory`));
    await set(transactionRef, newTransaction);
  };

  const addBetHistory = async (result: 'Win' | 'Loss', bet: number, cashout: number | null, winnings: number) => {
    if (!currentUser || !currentUser.id) return;

    const newBet = {
        date: new Date().toISOString(),
        bet,
        cashout,
        winnings,
        result,
    };
    
    const betRef = push(ref(getDatabase(app), `users/${currentUser.id}/betHistory`));
    await set(betRef, newBet);
  };

  const handlePlay = () => {
    if (gameState === 'running' || !currentUser) return;
    
    const savedSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    const minBet = Number(savedSettings.minBet) || 100;
    const maxBet = Number(savedSettings.maxBet) || 5000;

    if (betAmount < minBet || betAmount > maxBet) {
      toast({
        variant: "destructive",
        title: "Invalid Bet Amount",
        description: `Your bet must be between ₹${minBet} and ₹${maxBet}.`,
      })
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
            min = parseFloat(savedSettings.difficultyEasyMin || 1.01);
            max = parseFloat(savedSettings.difficultyEasyMax || 2.00);
            break;
        case 'medium':
            min = parseFloat(savedSettings.difficultyMediumMin || 1.50);
            max = parseFloat(savedSettings.difficultyMediumMax || 5.00);
            break;
        case 'hard':
            min = parseFloat(savedSettings.difficultyHardMin || 2.00);
            max = parseFloat(savedSettings.difficultyHardMax || 10.00);
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
        // Slower multiplier progression for slow-motion effect
        const newMultiplier = 1 + (elapsedTime * 0.05) + (elapsedTime * elapsedTime * 0.005);
        
        if (newMultiplier < crashPoint) {
          setMultiplier(newMultiplier);
          setCurrentStep(prev => prev + 1);
        } else {
          setMultiplier(crashPoint);
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

  if (!isAuthenticated || !currentUser) {
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
      <GameHeader onMenuClick={() => setSidebarOpen(true)} walletBalance={currentUser.wallet} />
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
        />
      </div>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onOpenChange={setSidebarOpen} 
        walletBalance={currentUser.wallet}
      />
      {isMobile && <BottomNavBar onMenuClick={() => setSidebarOpen(true)} />}
    </div>
  );
}
