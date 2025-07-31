
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
import { getDatabase, ref, update, push, set, onValue } from 'firebase/database';

export type GameState = 'ready' | 'running' | 'finished';
export type Difficulty = 'easy' | 'medium' | 'hard';
const GAME_STEP_INTERVAL = 1000; // ms per step

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
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
  
  const updateUserAndSettings = useCallback(() => {
    // Fetch Settings and store in local storage
    const db = getDatabase(app);
    const settingsRef = ref(db, 'settings');
    onValue(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            const dbSettings = snapshot.val();
            setSettings(dbSettings);
            localStorage.setItem('adminSettings', JSON.stringify(dbSettings));
        }
    }, { onlyOnce: true });

    // Fetch user and update UI
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        const user = JSON.parse(userStr);
        if(user.id) {
            const userRef = ref(db, `users/${user.id}`);
            onValue(userRef, (snapshot) => {
                if(snapshot.exists()){
                    const dbUser = snapshot.val();
                    setCurrentUser(dbUser);
                    localStorage.setItem('currentUser', JSON.stringify(dbUser));
                }
            });
        } else {
             router.push('/auth');
        }
    } else {
        router.push('/auth');
    }
  }, [router]);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/auth');
    } else {
      setIsAuthenticated(true);
      updateUserAndSettings(); // Initial fetch
      
      const savedBetAmount = localStorage.getItem('betAmount');
      if (savedBetAmount) setBetAmount(JSON.parse(savedBetAmount));
      
      const savedDifficulty = localStorage.getItem('difficulty');
      if (savedDifficulty) setDifficulty(JSON.parse(savedDifficulty));
    }
    
    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', updateUserAndSettings);

    return () => {
        window.removeEventListener('storage', updateUserAndSettings);
        // Detach Firebase listeners if any were attached for real-time updates in updateUserAndSettings
        const db = getDatabase(app);
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.id) {
                const userRef = ref(db, `users/${user.id}`);
                userRef.off();
            }
        }
    }
  }, [router, updateUserAndSettings]);

  useEffect(() => {
    if (isAuthenticated) {
        localStorage.setItem('betAmount', JSON.stringify(betAmount));
        localStorage.setItem('difficulty', JSON.stringify(difficulty));
    }
  }, [betAmount, difficulty, isAuthenticated]);

  const updateUserInDbAndLocal = async (updates: any) => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return Promise.reject(new Error("Current user not found in local storage."));

    let user = JSON.parse(userStr);
    const userId = user.id;
    if (!userId) return Promise.reject(new Error("User ID not found in current user data."));
    
    const db = getDatabase(app);
    const userRef = ref(db, `users/${userId}`);
    
    // Merge updates with the existing user data to avoid overwriting nested objects
    const updatedUser = {...user};
    Object.keys(updates).forEach(key => {
        if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key]) && updatedUser[key]) {
            updatedUser[key] = {...updatedUser[key], ...updates[key]};
        } else {
            updatedUser[key] = updates[key];
        }
    });

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    
    return update(userRef, updates);
};

  const addTransaction = (type: 'Bet' | 'Win' | 'Deposit' | 'Withdrawal', amount: number, status: 'Completed' | 'Pending' | 'Failed' = 'Completed') => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const userId = user.id;
    if (!userId) return;
    
    const newTransaction = {
        date: new Date().toISOString(),
        type,
        amount,
        status,
    };
    
    const db = getDatabase(app);
    const transactionRef = push(ref(db, `users/${userId}/transactionHistory`));
    set(transactionRef, newTransaction);
  };

  const addBetHistory = (result: 'Win' | 'Loss', bet: number, cashout: number | null, winnings: number) => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const userId = user.id;
    if (!userId) return;

    const newBet = {
        date: new Date().toISOString(),
        bet,
        cashout,
        winnings,
        result,
    };
    
    const db = getDatabase(app);
    const betRef = push(ref(db, `users/${userId}/betHistory`));
    set(betRef, newBet);
  };

  const handlePlay = () => {
    if (gameState === 'running' || !currentUser || !settings.minBet) return;
    
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

  if (!isAuthenticated || !currentUser || !settings.siteTitle) {
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
        walletBalance={currentUser.wallet}
        settings={settings}
      />
      {isMobile && <BottomNavBar onMenuClick={() => setSidebarOpen(true)} />}
    </div>
  );
}
