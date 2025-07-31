
'use client';
import { Button } from "@/components/ui/button";
import { Home, Wallet, User, Menu } from "lucide-react";
import { useState, useEffect } from 'react';
import { DepositModal } from '@/components/modals/DepositModal';
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { InfoModal } from '@/components/modals/InfoModal';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Upload } from 'lucide-react';

type BottomNavBarProps = {
    onMenuClick: () => void;
    currentUser: any;
}

export default function BottomNavBar({ onMenuClick, currentUser }: BottomNavBarProps) {
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [tempUsername, setTempUsername] = useState(currentUser?.name || 'User');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if(currentUser) {
            setTempUsername(currentUser.name);
        }
    }, [currentUser])

    const handleSaveProfile = () => {
      // In a real app, you would update the database here.
      // The parent page.tsx component handles the DB update via its listeners.
      const user = JSON.parse(localStorage.getItem('currentUser')!);
      user.name = tempUsername;
      localStorage.setItem('currentUser', JSON.stringify(user));
      // setCurrentUser(prev => ({...prev, name: tempUsername}));
      toast({title: "Profile Updated!", description: "Your username has been changed."});
      setIsEditingProfile(false);
    }

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newAvatar = reader.result as string;
                // In a real app, you would upload this to a storage service
                // and then update the user's avatar URL in the database.
                // For now, we'll just update localStorage and let the parent sync it.
                const user = JSON.parse(localStorage.getItem('currentUser')!);
                user.avatar = newAvatar;
                localStorage.setItem('currentUser', JSON.stringify(user));
                // setCurrentUser(prev => ({...prev, avatar: newAvatar}));
                toast({title: "Avatar Updated!", description: "Your new avatar has been set."});
            };
            reader.readAsDataURL(file);
        }
    }

    const onModalOpenChange = (open: boolean) => {
        if (!open) {
            setActiveModal(null);
        }
    }

    const userAvatar = currentUser?.avatar || `https://placehold.co/100x100.png?text=${(currentUser?.name || 'U').charAt(0).toUpperCase()}`;
    const userAvatarFallback = (currentUser?.name || 'U').charAt(0).toUpperCase();

    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-md border-t border-border flex md:hidden items-center justify-around z-30">
            <Button variant="ghost" className="flex flex-col items-center h-full text-muted-foreground">
                <Home className="h-6 w-6" />
                <span className="text-xs">Home</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center h-full text-muted-foreground" onClick={() => setActiveModal('wallet')}>
                <Wallet className="h-6 w-6" />
                <span className="text-xs">Wallet</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center h-full text-muted-foreground" onClick={() => setActiveModal('profile')}>
                <User className="h-6 w-6" />
                <span className="text-xs">Profile</span>
            </Button>
            <Button variant="ghost" onClick={onMenuClick} className="flex flex-col items-center h-full text-muted-foreground">
                <Menu className="h-6 w-6" />
                <span className="text-xs">Menu</span>
            </Button>
        </div>
        
        <DepositModal isOpen={activeModal === 'deposit'} onOpenChange={onModalOpenChange} settings={{}} />
        <WithdrawModal isOpen={activeModal === 'withdraw'} onOpenChange={onModalOpenChange} feeType="user" settings={{}} currentUser={currentUser} />

        <InfoModal isOpen={activeModal === 'wallet'} onOpenChange={onModalOpenChange} title="My Wallet">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <p className="text-muted-foreground">Current Balance</p>
                    <p className="text-4xl font-bold">₹{(currentUser?.wallet || 0).toFixed(2)}</p>
                </div>
                <div className="flex gap-4">
                    <Button className="w-full" onClick={() => { setActiveModal('deposit')}}>Deposit</Button>
                    <Button className="w-full" variant="secondary" onClick={() => { setActiveModal('withdraw')}}>Withdraw</Button>
                </div>
            </div>
        </InfoModal>

        <InfoModal isOpen={activeModal === 'profile'} onOpenChange={onModalOpenChange} title="My Profile">
             <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                     <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-primary">
                            <AvatarImage src={userAvatar} alt={currentUser?.name} />
                            <AvatarFallback>{userAvatarFallback}</AvatarFallback>
                        </Avatar>
                        <Label htmlFor="avatar-upload-mobile" className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity">
                            <Upload className="h-6 w-6" />
                        </Label>
                        <Input id="avatar-upload-mobile" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </div>
                    {!isEditingProfile ? (
                        <div className="text-center">
                            <h3 className="text-xl font-bold">{currentUser?.name}</h3>
                            <Button variant="link" onClick={() => { setTempUsername(currentUser?.name); setIsEditingProfile(true); }}>Edit Name</Button>
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
        </InfoModal>
      </>
    )
}
