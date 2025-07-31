
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from '@/hooks/use-toast';

const defaultSettings = {
    minBet: '100',
    maxBet: '5000',
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
    gameRules: '1. All players must be over 18 years of age.\n2. Bets can only be placed before the round starts.\n3. Winnings are calculated by multiplying the bet amount by the multiplier at the time of cash-out.\n4. If the game crashes before you cash out, the bet is lost.',
    howToPlay: '1. Select your bet amount.\n2. Choose the game difficulty.\n3. Click "Play" to start the game.\n4. Watch the multiplier increase.\n5. Click "Cash Out" before the game crashes to win.',
    supportInfo: 'For any support queries, please contact us at support@example.com or join our Telegram channel.',
    withdrawalInfo: 'The initial demo amount is not withdrawable. Withdrawals are subject to admin approval. A {fee}% processing fee will be applied to your winnings. You can only make one withdrawal every 24 hours.',
};

export default function SettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            setSettings(prev => ({...prev, ...JSON.parse(savedSettings)}));
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSwitchChange = (checked: boolean, id: string) => {
        setSettings(prev => ({...prev, [id]: checked}));
    };

    const handleSave = () => {
        localStorage.setItem('adminSettings', JSON.stringify(settings));
        toast({
            title: "Settings Saved",
            description: "All admin settings have been updated successfully.",
        });
        window.dispatchEvent(new StorageEvent('storage', { key: 'adminSettings' }));
    };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
         <Button onClick={handleSave}>Save All Settings</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Game Configuration</CardTitle>
                    <CardDescription>Adjust core game parameters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minBet">Minimum Bet</Label>
                            <Input id="minBet" value={settings.minBet} onChange={handleInputChange} type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxBet">Maximum Bet</Label>
                            <Input id="maxBet" value={settings.maxBet} onChange={handleInputChange} type="number" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="withdrawalFee">Withdrawal Fee (%)</Label>
                        <Input id="withdrawalFee" value={settings.withdrawalFee} onChange={handleInputChange} type="number" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minDeposit">Minimum Deposit</Label>
                            <Input id="minDeposit" value={settings.minDeposit} onChange={handleInputChange} type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxDeposit">Maximum Deposit</Label>
                            <Input id="maxDeposit" value={settings.maxDeposit} onChange={handleInputChange} type="number" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch id="withdrawalGate" checked={settings.withdrawalGate} onCheckedChange={(c) => handleSwitchChange(c, 'withdrawalGate')} />
                        <Label htmlFor="withdrawalGate">Enable Withdrawal Gate (Require ₹2000 Deposit)</Label>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Game Difficulty</CardTitle>
                    <CardDescription>Set the crash multipliers for each level.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="hidden sm:grid grid-cols-3 gap-4">
                            <Label>Level</Label>
                            <Label>Min Multiplier</Label>
                            <Label>Max Multiplier</Label>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <Label>Easy</Label>
                        <Input id="difficultyEasyMin" value={settings.difficultyEasyMin} onChange={handleInputChange} type="number" placeholder="Min"/>
                        <Input id="difficultyEasyMax" value={settings.difficultyEasyMax} onChange={handleInputChange} type="number" placeholder="Max"/>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <Label>Medium</Label>
                        <Input id="difficultyMediumMin" value={settings.difficultyMediumMin} onChange={handleInputChange} type="number" placeholder="Min"/>
                        <Input id="difficultyMediumMax" value={settings.difficultyMediumMax} onChange={handleInputChange} type="number" placeholder="Max"/>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <Label>Hard</Label>
                        <Input id="difficultyHardMin" value={settings.difficultyHardMin} onChange={handleInputChange} type="number" placeholder="Min"/>
                        <Input id="difficultyHardMax" value={settings.difficultyHardMax} onChange={handleInputChange} type="number" placeholder="Max"/>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Site Details</CardTitle>
                    <CardDescription>Control general site information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="siteTitle">Website Title</Label>
                        <Input id="siteTitle" value={settings.siteTitle} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="siteIcon">Website Icon URL</Label>
                        <Input id="siteIcon" value={settings.siteIcon} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="siteVersion">Version</Label>
                        <Input id="siteVersion" value={settings.siteVersion} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="poweredBy">Powered By Text</Label>
                        <Input id="poweredBy" value={settings.poweredBy} onChange={handleInputChange} />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch id="maintenanceMode" checked={settings.maintenanceMode} onCheckedChange={(c) => handleSwitchChange(c, 'maintenanceMode')} />
                        <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Informational Pages</CardTitle>
                    <CardDescription>Manage the content for info modals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="gameRules">Game Rules</Label>
                        <Textarea id="gameRules" value={settings.gameRules} onChange={handleInputChange} placeholder="Enter the rules of the game..." className="min-h-[100px]" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="howToPlay">How to Play</Label>
                        <Textarea id="howToPlay" value={settings.howToPlay} onChange={handleInputChange} placeholder="Explain how to play the game..." className="min-h-[100px]" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="supportInfo">Support Information</Label>
                        <Textarea id="supportInfo" value={settings.supportInfo} onChange={handleInputChange} placeholder="Provide contact or support details..." className="min-h-[100px]" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="withdrawalInfo">Withdrawal Information</Label>
                        <Textarea id="withdrawalInfo" value={settings.withdrawalInfo} onChange={handleInputChange} placeholder="Provide withdrawal information for users..." className="min-h-[100px]" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
