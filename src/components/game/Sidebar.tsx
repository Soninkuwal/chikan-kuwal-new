
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Banknote, 
  Landmark, 
  History, 
  ScrollText, 
  ShieldCheck, 
  FileQuestion, 
  LifeBuoy, 
  LogOut,
  ArrowRightLeft,
  LogIn,
  Crown,
  MessageSquare,
  Gift,
  Upload,
  Copy,
  User,
} from 'lucide-react'
import { DepositModal } from '@/components/modals/DepositModal'
import { WithdrawModal } from '@/components/modals/WithdrawModal'
import { InfoModal } from '@/components/modals/InfoModal';
import Link from 'next/link';
import { ChatInterface } from './ChatInterface';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

type SidebarProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  walletBalance: number;
};

const adminChatInitialMessages = [
    { id: 1, sender: 'Support' as const, name: 'Admin', avatar: 'A', text: 'Hello! How can I help you today?', timestamp: '10:30 AM' },
];
const ownerChatInitialMessages = [
     { id: 1, sender: 'Support' as const, name: 'Owner', avatar: 'O', text: 'Welcome! How may I assist you?', timestamp: '11:00 AM' },
];


export function Sidebar({ 
  isOpen, 
  onOpenChange,
  walletBalance,
}: SidebarProps) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<'admin' | 'owner' | null>(null);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState({ name: 'User', email: 'user@example.com', avatar: 'https://placehold.co/100x100.png', avatarFallback: 'U' });
  const [tempUsername, setTempUsername] = useState(currentUser.name);
  const [isEditingProfile, setIsEditingProfile] = useState(false);


  const [poweredBy, setPoweredBy] = useState('yaar tera badmas hai jaanu');
  const [infoContent, setInfoContent] = useState({
      gameRules: '1. All players must be over 18 years of age.\\n2. Bets can only be placed before the round starts.\\n3. Winnings are calculated by multiplying the bet amount by the multiplier at the time of cash-out.\\n4. If the game crashes before you cash out, the bet is lost.',
      howToPlay: '1. Select your bet amount.\\n2. Choose the game difficulty.\\n3. Click "Play" to start the game.\\n4. Watch the multiplier increase.\\n5. Click "Cash Out" before the game crashes to win.',
      supportInfo: 'For any support queries, please contact us at support@example.com or join our Telegram channel.',
  });

  const updateSidebarData = () => {
    const user = localStorage.getItem('currentUser');
    if (user) {
        const parsedUser = JSON.parse(user);
        setCurrentUser({
            name: parsedUser.name || 'User',
            email: parsedUser.email,
            avatar: parsedUser.avatar || `https://placehold.co/100x100.png?text=${(parsedUser.name || 'U').charAt(0).toUpperCase()}`,
            avatarFallback: (parsedUser.name || 'U').charAt(0).toUpperCase(),
        });
    }
     const savedSettings = localStorage.getItem('adminSettings');
     if (savedSettings) {
         const settings = JSON.parse(savedSettings);
         setPoweredBy(settings.poweredBy || 'yaar tera badmas hai jaanu');
         setInfoContent({
             gameRules: settings.gameRules || 'No rules defined yet.',
             howToPlay: settings.howToPlay || 'No instructions defined yet.',
             supportInfo: settings.supportInfo || 'No support info defined yet.',
         })
     }
  };

  useEffect(() => {
    if (isOpen) {
        updateSidebarData();
    }
    window.addEventListener('storage', updateSidebarData);
    return () => window.removeEventListener('storage', updateSidebarData);
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    onOpenChange(false);
    router.push('/auth');
  }

  const menuItems = [
    { icon: Banknote, label: 'Deposit', modal: 'deposit' },
    { icon: Landmark, label: 'Withdraw', modal: 'withdraw' },
    { icon: ArrowRightLeft, label: 'Transaction History', modal: 'transaction_history' },
    { icon: History, label: 'Bet History', modal: 'bet_history' },
    { icon: Gift, label: 'Refer & Earn', modal: 'refer_earn' },
    { icon: ShieldCheck, label: 'KYC', modal: 'kyc' },
  ];
  
  const infoItems = [
    { icon: FileQuestion, label: 'Game Rules', modal: 'rules' },
    { icon: ScrollText, label: 'How to Play', modal: 'how_to_play' },
    { icon: LifeBuoy, label: 'Support', modal: 'support' },
  ];
  
  const authItems = [
      { icon: LogIn, label: 'Admin Login', href: '/admin/login' },
      { icon: Crown, label: 'Owner Login', href: '/owner/login' },
  ]

  const handleMenuClick = (modal: string) => {
    onOpenChange(false);
    setTimeout(() => setActiveModal(modal), 200);
  }

  const handleChatClick = () => {
    onOpenChange(false);
    setTimeout(() => setActiveModal('chat'), 200);
  }

  const handleProfileClick = () => {
    onOpenChange(false);
    setTimeout(() => setActiveModal('profile'), 200);
  }

  const handleSaveProfile = () => {
    const user = JSON.parse(localStorage.getItem('currentUser')!);
    user.name = tempUsername;
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(prev => ({...prev, name: tempUsername}));
    toast({title: "Profile Updated!", description: "Your username has been changed."});
    setIsEditingProfile(false);
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const newAvatar = reader.result as string;
              const user = JSON.parse(localStorage.getItem('currentUser')!);
              user.avatar = newAvatar;
              localStorage.setItem('currentUser', JSON.stringify(user));
              setCurrentUser(prev => ({...prev, avatar: newAvatar}));
              toast({title: "Avatar Updated!", description: "Your new avatar has been set."});
          };
          reader.readAsDataURL(file);
      }
  }


  const getModalContent = () => {
    if (activeModal === 'chat') {
        return (
            <div className="space-y-4">
                <p>Please select who you would like to chat with.</p>
                <Button className="w-full" onClick={() => {setChatTarget('admin'); setActiveModal('chat_interface');}}>Chat with Admin</Button>
                <Button className="w-full" variant="secondary" onClick={() => {setChatTarget('owner'); setActiveModal('chat_interface');}}>Chat with Owner</Button>
            </div>
        )
    }
     if (activeModal === 'chat_interface') {
        if(chatTarget === 'admin') return <ChatInterface initialMessages={adminChatInitialMessages} storageKey="userAdminChatMessages" currentUser={{name: currentUser.name, avatar: currentUser.avatarFallback}} chatWith="Admin" />;
        if(chatTarget === 'owner') return <ChatInterface initialMessages={ownerChatInitialMessages} storageKey="userOwnerChatMessages" currentUser={{name: currentUser.name, avatar: currentUser.avatarFallback}} chatWith="Owner"/>;
    }
     if (activeModal === 'profile') {
        return (
             <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                     <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-primary">
                            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                            <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
                        </Avatar>
                        <Label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity">
                            <Upload className="h-6 w-6" />
                        </Label>
                        <Input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </div>
                    {!isEditingProfile ? (
                        <div className="text-center">
                            <h3 className="text-xl font-bold">{currentUser.name}</h3>
                            <Button variant="link" onClick={() => { setTempUsername(currentUser.name); setIsEditingProfile(true); }}>Edit Name</Button>
                        </div>
                    ) : (
                        <div className="w-full space-y-2">
                             <Input value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} />
                             <div className='flex gap-2'>
                                <Button onClick={handleSaveProfile} className="w-full">Save</Button>
                                <Button variant="ghost" onClick={() => setIsEditingProfile(false)} className="w-full">Cancel</Button>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
    switch (activeModal) {
      case 'rules':
        return <p className='whitespace-pre-wrap'>{infoContent.gameRules}</p>;
      case 'how_to_play':
        return <p className='whitespace-pre-wrap'>{infoContent.howToPlay}</p>;
      case 'support':
        return <p className='whitespace-pre-wrap'>{infoContent.supportInfo}</p>;
      case 'kyc':
        return (
            <div className="space-y-4">
                <p>Please submit your Aadhaar details for verification.</p>
                <div className="space-y-2">
                    <Label htmlFor="aadhaar-number">Aadhaar Card Number</Label>
                    <Input id="aadhaar-number" placeholder="xxxx xxxx xxxx" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="aadhaar-upload">Upload Aadhaar Card</Label>
                    <Input id="aadhaar-upload" type="file" />
                </div>
                <Button className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Submit for Verification
                </Button>
            </div>
        );
      case 'refer_earn':
        const referralCode = "REF123XYZ";
        return (
             <div className="space-y-4 text-center">
                <p className='text-lg'>Refer a friend and earn <span className='font-bold text-accent'>₹50</span>!</p>
                <p>Share your referral code with your friends. When they sign up and make their first deposit, you both get a bonus.</p>
                <div className="p-4 bg-secondary rounded-lg flex items-center justify-between">
                    <span className='font-mono text-xl'>{referralCode}</span>
                    <Button variant="ghost" size="icon" onClick={() => {
                        navigator.clipboard.writeText(referralCode);
                        toast({ title: 'Referral Code Copied!'});
                    }}>
                        <Copy className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        );
      case 'transaction_history':
        return <p>Your transaction history will appear here. This includes all deposits, withdrawals, bets, and winnings.</p>;
      case 'bet_history':
        return <p>Your bet history will appear here, showing a log of all the rounds you've played.</p>;
      default:
        return <p>Content for {activeModal?.replace(/_/g, ' ')} goes here.</p>;
    }
  }
  
  const onModalOpenChange = (open: boolean) => {
    if(!open) {
        setActiveModal(null);
        setChatTarget(null);
        setIsEditingProfile(false);
    }
  }


  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="bg-background/80 backdrop-blur-lg border-l-primary/30 text-foreground p-0 w-[320px] sm:w-[400px]">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 text-left">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-primary">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-xl">{currentUser.name}</SheetTitle>
                  <SheetDescription>Wallet: ₹{walletBalance.toFixed(2)}</SheetDescription>
                   <Button variant="link" className="p-0 h-auto text-accent" onClick={handleProfileClick}>View Profile</Button>
                </div>
              </div>
            </SheetHeader>
            
            <Separator className="my-0" />
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <nav className="flex flex-col gap-2">
                {menuItems.map(item => (
                  <Button 
                    key={item.label} 
                    variant="ghost" 
                    className="justify-start gap-3 text-base h-12"
                    onClick={() => item.modal && handleMenuClick(item.modal)}>
                    <item.icon className="h-5 w-5 text-primary" />
                    {item.label}
                  </Button>
                ))}
              </nav>
               <Separator className="my-4" />
                <Button variant="ghost" className="justify-start gap-3 text-base h-12 w-full" onClick={handleChatClick}>
                    <MessageSquare className="h-5 w-5 text-accent" />
                    Chat
                </Button>
              <Separator className="my-4" />
              <nav className="flex flex-col gap-2">
                 {infoItems.map(item => (
                   <Button 
                    key={item.label} 
                    variant="ghost" 
                    className="justify-start gap-3 text-base h-12"
                    onClick={() => item.modal && handleMenuClick(item.modal)}>
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    {item.label}
                  </Button>
                ))}
              </nav>
              <Separator className="my-4" />
              <nav className="flex flex-col gap-2">
                 {authItems.map(item => (
                   <Link key={item.label} href={item.href} passHref>
                    <Button variant="ghost" className="justify-start gap-3 text-base h-12 w-full">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
            <SheetFooter className="p-6 flex-col !space-x-0 gap-4 border-t border-border">
               <Button variant="destructive" className="w-full h-12 text-base" onClick={handleLogout}>
                <LogOut className="mr-2 h-5 w-5"/>
                Logout
              </Button>
              <p className="text-center text-xs text-muted-foreground">Powered by <span className="text-accent font-bold">{poweredBy.split(' ')[0]}</span> <span className="text-white">{poweredBy.substring(poweredBy.indexOf(' ')+1)}</span></p>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
      
      <DepositModal isOpen={activeModal === 'deposit'} onOpenChange={onModalOpenChange} />
      <WithdrawModal isOpen={activeModal === 'withdraw'} onOpenChange={onModalOpenChange} feeType="user" />

      <InfoModal 
        isOpen={!!activeModal && !['deposit', 'withdraw'].includes(activeModal)} 
        onOpenChange={onModalOpenChange}
        title={
            activeModal === 'chat_interface' && chatTarget ? `Chat with ${chatTarget.charAt(0).toUpperCase() + chatTarget.slice(1)}` :
            activeModal === 'profile' ? 'My Profile' :
            activeModal?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ?? ''
        }
      >
        {getModalContent()}
      </InfoModal>
    </>
  );
}

    