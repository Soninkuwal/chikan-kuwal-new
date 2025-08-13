
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { DollarSign, Shield, Users, Landmark, List, ArrowDownToDot, ArrowUpFromDot } from "lucide-react"
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { app } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from 'next/link';

type Admin = {
    id: string;
    name: string;
    email: string;
    wallet: number;
    depositRequests: number;
    withdrawalRequests: number;
    totalTransactions: number;
}

export default function OwnerDashboard() {
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalLifetimeRevenue, setTotalLifetimeRevenue] = useState<number | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const db = getDatabase(app);
    
    // Listen for settings
    const settingsRef = ref(db, 'settings');
    const settingsListener = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      }
    });

    const revenueRef = ref(db, 'platformData/ownerWallet');
    const revenueListener = onValue(revenueRef, (snapshot) => {
        setTotalLifetimeRevenue(snapshot.val() || 0);
    });
    
    // Listen for users and admins
    const usersRef = ref(db, 'users');
    const usersListener = onValue(usersRef, (snapshot) => {
        let userCount = 0;
        if(snapshot.exists()){
            userCount = snapshot.size;
        }
        setTotalUsers(userCount);
    });

    const adminsRef = ref(db, 'admins');
    const adminsListener = onValue(adminsRef, (adminSnapshot) => {
        setLoading(true);
        const adminList: Admin[] = [];
        if (adminSnapshot.exists()) {
            adminSnapshot.forEach((childSnapshot) => {
                const admin = childSnapshot.val();
                adminList.push({
                    id: childSnapshot.key!,
                    name: admin.name,
                    email: admin.email,
                    wallet: admin.wallet || 0,
                    depositRequests: 0,
                    withdrawalRequests: 0,
                    totalTransactions: 0,
                });
            });
        }
        setAdmins(adminList);
        setLoading(false);
    });


    return () => {
        off(settingsRef, 'value', settingsListener);
        off(usersRef, 'value', usersListener);
        off(adminsRef, 'value', adminsListener);
        off(revenueRef, 'value', revenueListener);
    }
  }, []);

  return (
    <div className="flex flex-col">
      <main className="flex-1 space-y-8 p-8 pt-6">
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
                 {totalLifetimeRevenue === null ? <Skeleton className="h-10 w-3/4" /> : <div className="text-4xl font-bold text-primary">₹{totalLifetimeRevenue.toFixed(2)}</div>}
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
                {loading ? <Skeleton className="h-12 w-1/2" /> : <div className="text-5xl font-bold">{admins.length}</div>}
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
                {totalUsers === null ? <Skeleton className="h-12 w-1/2" /> : <div className="text-5xl font-bold">{totalUsers}</div>}
            </CardContent>
            </Card>
        </div>
      </main>
      <WithdrawModal isOpen={isWithdrawModalOpen} onOpenChange={setWithdrawModalOpen} feeType="owner" settings={settings}/>
    </div>
  )
}
