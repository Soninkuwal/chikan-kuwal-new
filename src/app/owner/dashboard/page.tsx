
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { DollarSign, Shield, Users, Landmark } from "lucide-react"
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { app } from '@/lib/firebase';

export default function OwnerDashboard() {
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [settings, setSettings] = useState<any>({});
  
  useEffect(() => {
    const db = getDatabase(app);
    
    // Listen for settings
    const settingsRef = ref(db, 'settings');
    const settingsListener = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      }
    });
    
    // Listen for users and admins
    const usersRef = ref(db, 'users');
    const usersListener = onValue(usersRef, (snapshot) => {
        let adminCount = 0;
        let userCount = 0;
        if(snapshot.exists()){
            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                if (user.role === 'Admin') {
                    adminCount++;
                }
                userCount++;
            });
            setTotalAdmins(adminCount);
            setTotalUsers(userCount);
        } else {
            setTotalAdmins(0);
            setTotalUsers(0);
        }
    });

    return () => {
        off(settingsRef, 'value', settingsListener);
        off(usersRef, 'value', usersListener);
    }
  }, []);

  return (
    <div className="flex flex-col">
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-card border-primary/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/20 rounded-md">
                        <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    Owner Wallet
                </CardTitle>
                <CardDescription>Total lifetime revenue of the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-primary">₹12,50,550</div>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base h-12" onClick={() => setWithdrawModalOpen(true)}>
                    <Landmark className="mr-2 h-5 w-5" />
                    Withdraw Funds
                </Button>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/20 rounded-md">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    Total Admins
                </CardTitle>
                <CardDescription>Number of active administrators.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-5xl font-bold">{totalAdmins}</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/20 rounded-md">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    Total Users
                </CardTitle>
                <CardDescription>Total registered users on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-5xl font-bold">{totalUsers}</div>
            </CardContent>
            </Card>
        </div>
      </main>
      <WithdrawModal isOpen={isWithdrawModalOpen} onOpenChange={setWithdrawModalOpen} feeType="owner" settings={settings}/>
    </div>
  )
}
