
'use client';
import { useState, useEffect, useCallback } from 'react';
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
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { DepositModal } from '@/components/modals/DepositModal'
import { WithdrawModal } from '@/components/modals/WithdrawModal'
import { InfoModal } from '@/components/modals/InfoModal';
import Link from 'next/link';
import { ChatInterface } from './ChatInterface';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { app } from '@/lib/firebase';
import { getDatabase, ref, onValue, off, update, push, set } from "firebase/database";

type SidebarProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  walletBalance: number;
  settings: any;
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
  settings
}: SidebarProps) {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<'admin' | 'owner' | null>(null);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>({ name: 'User', email: 'user@example.com', avatar: '', avatarFallback: 'U', transactionHistory: [], betHistory: [] });
  const [tempUsername, setTempUsername] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);

  const poweredBy = settings?.poweredBy || 'yaar tera badmas hai jaanu';
  const infoContent = {
      gameRules: settings?.gameRules || 'No rules defined yet.',
      howToPlay: settings?.howToPlay || 'No instructions defined yet.',
      supportInfo: settings?.supportInfo || 'No support info defined yet.',
  };

  const updateSidebarData = useCallback(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return () => {};
    
    const localUser = JSON.parse(userStr);
    const userId = localUser.id;
    if (!userId) return () => {};

    const db = getDatabase(app);
    const userRef = ref(db, `users/${userId}`);

    const listener = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const dbUser = snapshot.val();
        
        const mergedUser = { ...localUser, ...dbUser };
        localStorage.setItem('currentUser', JSON.stringify(mergedUser));

        const transactionHistory = dbUser.transactionHistory ? Object.values(dbUser.transactionHistory).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
        const betHistory = dbUser.betHistory ? Object.values(dbUser.betHistory).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
        
        setCurrentUser({
            ...mergedUser,
            avatar: mergedUser.avatar || `https://placehold.co/100x100.png?text=${(mergedUser.name || 'U').charAt(0).toUpperCase()}`,
            avatarFallback: (mergedUser.name || 'U').charAt(0).toUpperCase(),
            transactionHistory,
            betHistory,
        });
      }
    });

     return () => off(userRef, 'value', listener);
  }, []);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
    if (isOpen) {
      unsubscribe = updateSidebarData();
    }
    return () => unsubscribe();
  }, [isOpen, updateSidebarData]);

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
      { icon: LogIn, label: 'Admin Login', href: '/login' },
      { icon: Crown, label: 'Owner Login', href: '/owner/login' },
  ]

  const handleMenuClick = (modal: string) => {
    onOpenChange(false);
    setTimeout(() => {
        setActiveModal(modal);
    }, 200);
  }

  const handleChatClick = () => {
    onOpenChange(false);
    setTimeout(() => setActiveModal('chat'), 200);
  }

  const handleProfileClick = () => {
    onOpenChange(false);
    setTempUsername(currentUser.name);
    setTimeout(() => setActiveModal('profile'), 200);
  }

  const handleSaveProfile = () => {
    const userStr = localStorage.getItem('currentUser');
    if(!userStr) return;
    const user = JSON.parse(userStr);
    const userId = user.id;

    const updates = { name: tempUsername };
    const db = getDatabase(app);
    update(ref(db, `users/${userId}`), updates)
      .then(() => {
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser((prev: any) => ({...prev, name: tempUsername}));
        toast({title: "Profile Updated!", description: "Your username has been changed."});
        setIsEditingProfile(false);
      })
      .catch(error => {
        console.error("Profile update failed:", error);
        toast({variant: 'destructive', title: "Update Failed", description: "Could not update your profile."});
      });
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const newAvatar = reader.result as string;
              const userStr = localStorage.getItem('currentUser');
              if(!userStr) return;
              const user = JSON.parse(userStr);
              const userId = user.id;
              
              const updates = { avatar: newAvatar };
              const db = getDatabase(app);
              update(ref(db, `users/${userId}`), updates)
                .then(() => {
                  const updatedUser = { ...user, ...updates };
                  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                  setCurrentUser((prev: any) => ({...prev, avatar: newAvatar}));
                  toast({title: "Avatar Updated!", description: "Your new avatar has been set."});
                })
                .catch(error => {
                  console.error("Avatar update failed:", error);
                  toast({variant: 'destructive', title: "Update Failed", description: "Could not update your avatar."});
                });
          };
          reader.readAsDataURL(file);
      }
  }

  const handleKycSubmit = () => {
    if (!aadhaarNumber || !aadhaarFile) {
        toast({ variant: 'destructive', title: 'Incomplete Information', description: 'Please provide Aadhaar number and upload the document.'});
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const documentImage = reader.result as string;
        const newRequest = {
            userId: currentUser.id,
            user: currentUser.name,
            documentType: 'Aadhaar',
            documentNumber: aadhaarNumber,
            documentImage: documentImage,
            date: new Date().toISOString(),
        };

        const db = getDatabase(app);
        const kycRef = ref(db, 'kycRequests');
        const newKycRequestRef = push(kycRef);
        set(newKycRequestRef, newRequest)
          .then(() => {
            update(ref(db, `users/${currentUser.id}`), { kycStatus: 'Pending' });
            toast({ title: 'KYC Submitted', description: 'Your KYC details have been sent for verification.'});
            setActiveModal(null);
          })
          .catch((error) => {
            console.error("KYC submission failed:", error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not submit your KYC request. Please try again.' });
          });
    }
    reader.readAsDataURL(aadhaarFile);
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
                            <Button variant="link" onClick={() => { setIsEditingProfile(true); }}>Edit Name</Button>
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
        if (currentUser.kycStatus === 'Verified') {
            return (
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <CheckCircle className="h-16 w-16 text-green-500"/>
                    <h3 className="text-xl font-bold">Your KYC has been verified and accepted.</h3>
                    <p className="text-muted-foreground">You now have full access to all features, including withdrawals.</p>
                </div>
            )
        }
         if (currentUser.kycStatus === 'Pending') {
            return (
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <History className="h-16 w-16 text-yellow-500"/>
                    <h3 className="text-xl font-bold">Your KYC is pending verification.</h3>
                    <p className="text-muted-foreground">Your details are being reviewed. This usually takes 24-48 hours.</p>
                </div>
            )
        }
        if (currentUser.kycStatus === 'Rejected') {
            return (
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <AlertCircle className="h-16 w-16 text-red-500"/>
                    <h3 className="text-xl font-bold">Your KYC has been rejected.</h3>
                    <p className="text-muted-foreground">Please re-submit with correct details.</p>
                    <Button onClick={() => {
                        const db = getDatabase(app);
                        update(ref(db, `users/${currentUser.id}`), { kycStatus: 'Not Verified' });
                    }}>Re-submit KYC</Button>
                </div>
            )
        }
        return (
            <div className="space-y-4">
                <p>Please submit your Aadhaar details for verification.</p>
                <div className="space-y-2">
                    <Label htmlFor="aadhaar-number">Aadhaar Card Number</Label>
                    <Input id="aadhaar-number" placeholder="xxxx xxxx xxxx" value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="aadhaar-upload">Upload Aadhaar Card</Label>
                    <Input id="aadhaar-upload" type="file" onChange={e => setAadhaarFile(e.target.files?.[0] || null)} />
                </div>
                <Button className="w-full" onClick={handleKycSubmit}>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit for Verification
                </Button>
            </div>
        );
      case 'refer_earn':
        const referralCode = currentUser?.id ? currentUser.id.slice(-6).toUpperCase() : "REF123XYZ";
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
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentUser.transactionHistory && currentUser.transactionHistory.length > 0 ? currentUser.transactionHistory.map((tx: any, index: number) => (
                        <TableRow key={index}>
                            <TableCell className="text-xs">{new Date(tx.date).toLocaleString()}</TableCell>
                            <TableCell>{tx.type}</TableCell>
                            <TableCell className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ₹{Math.abs(tx.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <Badge variant={tx.status === 'Completed' ? 'default' : tx.status === 'Pending' ? 'secondary' : 'destructive'}>
                                    {tx.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow><TableCell colSpan={4} className="text-center">No transactions yet.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        );
      case 'bet_history':
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Bet</TableHead>
                        <TableHead>Cashed Out</TableHead>
                        <TableHead>Winnings</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentUser.betHistory && currentUser.betHistory.length > 0 ? currentUser.betHistory.map((bet: any, index: number) => (
                        <TableRow key={index}>
                            <TableCell className="text-xs">{new Date(bet.date).toLocaleString()}</TableCell>
                            <TableCell>₹{bet.bet.toFixed(2)}</TableCell>
                            <TableCell>{bet.cashout ? `${bet.cashout.toFixed(2)}x` : '-'}</TableCell>
                             <TableCell className={`font-bold ${bet.result === 'Win' ? 'text-green-400' : 'text-red-400'}`}>
                                {bet.result === 'Win' ? `+₹${bet.winnings.toFixed(2)}` : `-₹${Math.abs(bet.winnings).toFixed(2)}`}
                            </TableCell>
                        </TableRow>
                    )) : (
                         <TableRow><TableCell colSpan={4} className="text-center">No bets placed yet.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        );
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
      
      <DepositModal isOpen={activeModal === 'deposit'} onOpenChange={onModalOpenChange} settings={settings} />
      <WithdrawModal isOpen={activeModal === 'withdraw'} onOpenChange={onModalOpenChange} settings={settings}/>

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
