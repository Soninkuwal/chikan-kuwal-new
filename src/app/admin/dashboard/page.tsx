
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Wallet, Users, List, Landmark, ArrowDownToDot, ArrowUpFromDot } from "lucide-react"
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { app } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalTransactions, setTotalTransactions] = useState<number | null>(null);
  const [adminWallet, setAdminWallet] = useState<number | null>(null);
  const [settings, setSettings] = useState<any>({});
  
  useEffect(() => {
    const db = getDatabase(app);
    
    const settingsRef = ref(db, 'settings');
    const settingsListener = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      }
    });
    
    const usersRef = ref(db, 'users');
    const usersListener = onValue(usersRef, (snapshot) => {
        if(snapshot.exists()){
            setTotalUsers(snapshot.size);
        } else {
            setTotalUsers(0);
        }
    });
    
    const transactionsRef = ref(db, 'transactions');
    const transactionsListener = onValue(transactionsRef, (snapshot) => {
        if(snapshot.exists()){
            setTotalTransactions(snapshot.size);
        } else {
            setTotalTransactions(0);
        }
    });

    const adminWalletRef = ref(db, 'platformData/adminWallet');
    const adminWalletListener = onValue(adminWalletRef, (snapshot) => {
        if(snapshot.exists()){
            setAdminWallet(snapshot.val());
        } else {
            setAdminWallet(0);
        }
    });


    return () => {
        off(settingsRef, 'value', settingsListener);
        off(usersRef, 'value', usersListener);
        off(transactionsRef, 'value', transactionsListener);
        off(adminWalletRef, 'value', adminWalletListener);
    }
  }, []);

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card">
              <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg text-primary">
                      <Wallet className="h-6 w-6" />
                      Admin Wallet
                  </CardTitle>
                  <CardDescription>Total fees collected. A 2% fee is sent to the owner on withdrawal from this wallet.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {adminWallet === null ? <Skeleton className="h-10 w-3/4" /> : <div className="text-4xl font-bold">₹{(adminWallet || 0).toFixed(2)}</div>}
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base h-12" onClick={() => setWithdrawModalOpen(true)}>
                      <Landmark className="mr-2 h-5 w-5" />
                      Withdraw Funds
                  </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg text-primary">
                      <Users className="h-6 w-6" />
                      Total Users
                  </CardTitle>
                  <CardDescription>All registered users.</CardDescription>
              </CardHeader>
              <CardContent>
                  {totalUsers === null ? <Skeleton className="h-12 w-1/2" /> : <div className="text-5xl font-bold">{totalUsers}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg text-primary">
                      <List className="h-6 w-6" />
                      Total Transactions
                  </CardTitle>
                  <CardDescription>All platform transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                   {totalTransactions === null ? <Skeleton className="h-12 w-1/2" /> : <div className="text-5xl font-bold">{totalTransactions}</div>}
              </CardContent>
            </Card>
             <div className="space-y-6">
                <Link href="/admin/payments" className="block">
                    <Card className="hover:bg-secondary transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg text-primary">
                                <ArrowDownToDot className="h-6 w-6" />
                                Deposit Requests
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
                 <Link href="/admin/withdrawal-requests" className="block">
                    <Card className="hover:bg-secondary transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg text-primary">
                                <ArrowUpFromDot className="h-6 w-6" />
                                Withdrawal Requests
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
      </div>
      <WithdrawModal isOpen={isWithdrawModalOpen} onOpenChange={setWithdrawModalOpen} feeType="none" settings={settings}/>
    </>
  )
}
