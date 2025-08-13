
'use client';
import { useState, useEffect } from 'react';
import { Menu, Wallet, Landmark, Banknote, Users, LogIn, Trophy, Maximize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DepositModal } from '@/components/modals/DepositModal';
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import Image from 'next/image';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type GameHeaderProps = {
  onMenuClick: () => void;
  user: any;
  settings: any;
};

const dummyWinners = [
    { name: 'Player123', amount: '₹5,432' },
    { name: 'Lucky7', amount: '₹12,890' },
    { name: 'WinnerGG', amount: '₹2,100' },
    { name: 'HighRoller', amount: '₹25,600' },
    { name: 'JackpotJoe', amount: '₹8,750' },
];

export default function GameHeader({ onMenuClick, user, settings }: GameHeaderProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [liveUsers, setLiveUsers] = useState(18289);
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const siteSettings = {
      title: settings?.siteTitle || 'Chicken Road',
      icon: settings?.siteIcon || 'https://chickenroad.rajmines.com/images/chicken.png',
      version: settings?.siteVersion || '1.0'
  };

  const isWithdrawalEnabled = user?.kycStatus === 'Verified';

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
        setLiveUsers(prev => prev + Math.floor(Math.random() * 21) - 10);
    }, 3000);

    return () => {
        clearInterval(interval);
    };
  }, []);

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center p-2 bg-transparent text-white space-y-2">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Image src={siteSettings.icon} alt="Chicken Road" width={40} height={40} />
              <h1 className="text-xl sm:text-2xl font-bold tracking-wider" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                  {siteSettings.title}
              </h1>
          </div>
         
          <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-black/30 backdrop-blur-sm p-2 rounded-lg border border-white/20">
                <Button size="sm" className="bg-green-500/80 hover:bg-green-500 text-white" onClick={() => setActiveModal('deposit')}>
                    <Banknote className="mr-2" /> Deposit
                </Button>
                <Button 
                    size="sm" 
                    className="bg-blue-500/80 hover:bg-blue-500 text-white" 
                    onClick={() => setActiveModal('withdraw')}
                    disabled={!isWithdrawalEnabled}
                    title={!isWithdrawalEnabled ? "Complete KYC to enable withdrawals" : "Withdraw funds"}
                >
                    <Landmark className="mr-2" /> Withdraw
                </Button>
              </div>
               {isMobile && (
                <Button variant="ghost" size="icon" onClick={toggleFullScreen} aria-label="Toggle Fullscreen">
                  {isFullscreen ? <X className="h-6 w-6 text-white" /> : <Maximize className="h-6 w-6 text-white" />}
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open Menu" className={cn(isMobile && "hidden")}>
                  <Menu className="h-6 w-6 text-white" />
              </Button>
          </div>
        </div>
        <div className="w-full max-w-4xl">
            <div className="bg-black/30 backdrop-blur-sm p-2 rounded-lg border border-white/20 flex items-center justify-around text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                    <Wallet className="text-green-400"/>
                    <span>Wallet: <span className="font-bold">₹{user.wallet.toFixed(2)}</span></span>
                </div>
                <div className="w-px h-6 bg-white/20 mx-2"></div>
                <div className="flex items-center gap-2">
                    <Users className="text-blue-400"/>
                    <span>Live: <span className="font-bold">{liveUsers.toLocaleString()}</span></span>
                </div>
                 <div className="w-px h-6 bg-white/20 mx-2"></div>
                <div>
                    <span>Version: <span className="font-bold">{siteSettings.version}</span></span>
                </div>
            </div>
        </div>
        <div className="w-full max-w-4xl h-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full flex items-center animate-scroll-h">
                 {dummyWinners.concat(dummyWinners).map((winner, index) => (
                    <div key={index} className="flex-shrink-0 flex items-center gap-2 mx-4 text-xs sm:text-sm bg-black/20 p-1.5 rounded-md">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        <span className="font-semibold">{winner.name}</span>
                        <span>won</span>
                        <span className="font-bold text-green-400">{winner.amount}</span>
                    </div>
                ))}
            </div>
        </div>
      </header>

      <DepositModal isOpen={activeModal === 'deposit'} onOpenChange={(open) => !open && setActiveModal(null)} settings={settings} />
      <WithdrawModal isOpen={activeModal === 'withdraw'} onOpenChange={(open) => !open && setActiveModal(null)} settings={settings} user={user} />
       <style jsx global>{`
        @keyframes scroll-h {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-h {
          animation: scroll-h 30s linear infinite;
          width: 200%;
        }
      `}</style>
    </>
  );
}
