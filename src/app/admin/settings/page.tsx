
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from '@/hooks/use-toast';
import { getDatabase, ref, onValue, set, off, update, get } from 'firebase/database';
import { app } from '@/lib/firebase';
import Image from 'next/image';

const defaultSettings = {
    minBet: '100',
    maxBet: '5000',
    minWithdraw: '500',
    maxWithdraw: '10000',
    withdrawalFee: '10',
    minDeposit: '200',
    maxDeposit: '2000',
    difficultyEasyMin: '1.01',
    difficultyEasyMax: '2.00',
    difficultyMediumMin: '1.50',
    difficultyMediumMax: '5.00',
    difficultyHardMin: '2.00',
    difficultyHardMax: '10.00',
    siteTitle: 'Chicken Road Riches',
    siteIcon: 'https://chickenroad.rajmines.com/images/chicken.png',
    siteVersion: '1.0',
    poweredBy: 'yaar tera badmas hai jaanu',
    maintenanceMode: false,
    withdrawalGate: false,
    gameRules: '1. All players must be over 18 years of age.\\n2. Bets can only be placed before the round starts.\\n3. Winnings are calculated by multiplying the bet amount by the multiplier at the time of cash-out.\\n4. If the game crashes before you cash out, the bet is lost.',
    howToPlay: '1. Select your bet amount.\\n2. Choose the game difficulty.\\n3. Click "Play" to start the game.\\n4. Watch the multiplier increase.\\n5. Click "Cash Out" before the game crashes to win.',
    supportInfo: 'For any support queries, please contact us at support@example.com or join our Telegram channel.',
    withdrawalInfo: 'The initial demo amount is not withdrawable. Withdrawals are subject to admin approval. A {fee}% processing fee will be applied to your winnings. You can only make one withdrawal every 24 hours.',
    kycAutoApproveTime: '0',
    upiId: '',
    upiIdLarge: '',
    qrCode: '',
    qrCodeLarge: '',
};

export default function SettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState(defaultSettings);
    const [adminId, setAdminId] = useState<string | null>(null);

     useEffect(() => {
        const adminData = localStorage.getItem('currentAdmin');
        if (adminData) {
            const currentAdmin = JSON.parse(adminData);
            setAdminId(currentAdmin.id);
            // Fetch this admin's specific payment details
            const db = getDatabase(app);
            const adminRef = ref(db, `admins/${currentAdmin.id}`);
            get(adminRef).then((snapshot) => {
                if(snapshot.exists()) {
                    const adminDetails = snapshot.val();
                    setSettings(prev => ({
                        ...prev,
                        upiId: adminDetails.upiId || '',
                        upiIdLarge: adminDetails.upiIdLarge || '',
                        qrCode: adminDetails.qrCode || '',
                        qrCodeLarge: adminDetails.qrCodeLarge || '',
                    }));
                }
            });
        }
    }, []);

    useEffect(() => {
        const db = getDatabase(app);
        const settingsRef = ref(db, 'settings');
        const listener = onValue(settingsRef, (snapshot) => {
            if (snapshot.exists()) {
                const dbSettings = snapshot.val();
                // Merge global settings but keep local (admin-specific) payment details if they are being edited
                setSettings(prev => ({
                    ...prev, 
                    ...dbSettings, 
                    upiId: prev.upiId, 
                    upiIdLarge: prev.upiIdLarge,
                    qrCode: prev.qrCode,
                    qrCodeLarge: prev.qrCodeLarge,
                }));
            } else {
                set(settingsRef, defaultSettings);
            }
        });

        return () => {
            off(settingsRef, 'value', listener);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSwitchChange = (checked: boolean, id: string) => {
        setSettings(prev => ({...prev, [id]: checked}));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, [fieldName]: reader.result as string }));
            }
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!adminId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not identify admin.' });
            return;
        }

        const db = getDatabase(app);
        
        // Save admin-specific payment settings
        const adminSettingsRef = ref(db, `admins/${adminId}`);
        update(adminSettingsRef, {
            upiId: settings.upiId,
            upiIdLarge: settings.upiIdLarge,
            qrCode: settings.qrCode,
            qrCodeLarge: settings.qrCodeLarge,
        });
        
        toast({
            title: "Settings Saved",
            description: "Your payment settings have been updated successfully.",
        });
    };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
         <Button onClick={handleSave}>Save Payment Settings</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Set your personal UPI IDs and QR Codes for deposits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="upiId">Your Default UPI ID</Label>
                        <Input id="upiId" value={settings.upiId} onChange={handleInputChange} placeholder="e.g., yourname@upi" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="qrCode">Your Default QR Code (Upload or URL)</Label>
                        <Input id="qrCode" value={settings.qrCode.startsWith('data:image') ? '' : settings.qrCode} onChange={handleInputChange} placeholder="Paste image URL here" />
                        <Input id="qrCodeUpload" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'qrCode')} className="mt-2" />
                        {settings.qrCode && <Image src={settings.qrCode} alt="QR Preview" width={100} height={100} className="rounded-md mt-2" />}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="upiIdLarge">Your Large Amount UPI ID (e.g. &gt; ₹1000)</Label>
                        <Input id="upiIdLarge" value={settings.upiIdLarge} onChange={handleInputChange} placeholder="e.g., business@upi" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="qrCodeLarge">Your Large Amount QR Code (Upload or URL)</Label>
                        <Input id="qrCodeLarge" value={settings.qrCodeLarge.startsWith('data:image') ? '' : settings.qrCodeLarge} onChange={handleInputChange} placeholder="Paste image URL here" />
                        <Input id="qrCodeLargeUpload" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'qrCodeLarge')} className="mt-2"/>
                         {settings.qrCodeLarge && <Image src={settings.qrCodeLarge} alt="Large QR Preview" width={100} height={100} className="rounded-md mt-2" />}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Game Configuration (Read-Only)</CardTitle>
                    <CardDescription>These core game parameters are controlled by the owner.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minBet">Minimum Bet</Label>
                            <Input id="minBet" value={settings.minBet} type="number" readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxBet">Maximum Bet</Label>
                            <Input id="maxBet" value={settings.maxBet} type="number" readOnly />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="withdrawalFee">Withdrawal Fee (%)</Label>
                        <Input id="withdrawalFee" value={settings.withdrawalFee} type="number" readOnly />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minDeposit">Minimum Deposit</Label>
                            <Input id="minDeposit" value={settings.minDeposit} type="number" readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxDeposit">Maximum Deposit</Label>
                            <Input id="maxDeposit" value={settings.maxDeposit} type="number" readOnly />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Informational Pages (Read-Only)</CardTitle>
                    <CardDescription>This content is managed by the owner.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="gameRules">Game Rules</Label>
                        <Textarea id="gameRules" value={settings.gameRules} readOnly className="min-h-[100px]" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="howToPlay">How to Play</Label>
                        <Textarea id="howToPlay" value={settings.howToPlay} readOnly className="min-h-[100px]" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
