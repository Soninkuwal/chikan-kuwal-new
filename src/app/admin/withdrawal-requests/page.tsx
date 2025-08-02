
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useToast } from '@/hooks/use-toast';
import { app } from '@/lib/firebase';
import { getDatabase, ref, update, get, onValue, off, remove, runTransaction, push, set, serverTimestamp } from "firebase/database";

type WithdrawalRequest = { 
    id: string;
    userId: string;
    user: string;
    amount: string;
    method: string;
    date: string;
};

export default function WithdrawalRequestsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>({});

   useEffect(() => {
    const db = getDatabase(app);
    const settingsRef = ref(db, 'settings');
    const listener = onValue(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
            setSettings(snapshot.val());
        }
    });
    return () => off(settingsRef, 'value', listener);
  }, []);

  useEffect(() => {
    const db = getDatabase(app);
    const requestsRef = ref(db, 'withdrawalRequests');

    const listener = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setRequests(requestList);
      } else {
        setRequests([]);
      }
    });

    return () => {
      off(requestsRef, 'value', listener);
    };
  }, []);

  const addTransaction = (transactionData: any) => {
    const db = getDatabase(app);
    const newTransactionRef = push(ref(db, 'transactions'));
    set(newTransactionRef, {
      ...transactionData,
      timestamp: serverTimestamp(),
    });
  };

  const handleAction = async (request: WithdrawalRequest, status: 'approved' | 'rejected') => {
    const db = getDatabase(app);
    const requestRef = ref(db, `withdrawalRequests/${request.id}`);
    await remove(requestRef);
    const amountNumber = parseFloat(request.amount.replace('₹', ''));

    addTransaction({
        userId: request.userId,
        user: request.user,
        type: 'Withdrawal',
        amount: -amountNumber,
        status: status === 'approved' ? 'Approved' : 'Rejected',
        date: new Date().toISOString()
    });

    if (status === 'approved') {
        const feePercentage = parseFloat(settings.withdrawalFee || '0');
        const feeAmount = (amountNumber * feePercentage) / 100;
        
        if (feeAmount > 0) {
            const adminWalletRef = ref(db, 'platformData/adminWallet');
            runTransaction(adminWalletRef, (currentValue) => {
                return (currentValue || 0) + feeAmount;
            });
        }
        
        toast({ title: 'Request Approved', description: `Withdrawal for ${request.user} has been approved.`});
    } else {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            let userToUpdate: any = null;
            let userKeyToUpdate: string | null = null;
            snapshot.forEach((childSnapshot) => {
                if (childSnapshot.val().id === request.userId) {
                    userToUpdate = childSnapshot.val();
                    userKeyToUpdate = childSnapshot.key;
                }
            });

            if (userToUpdate && userKeyToUpdate) {
                const newBalance = (userToUpdate.wallet || 0) + amountNumber;
                await update(ref(db, `users/${userKeyToUpdate}`), { wallet: newBalance });

                toast({ variant: 'destructive', title: 'Request Rejected', description: `Withdrawal for ${request.user} has been rejected and funds returned.`});
            } else {
                toast({ variant: 'destructive', title: 'Refund Failed', description: `User with ID ${request.userId} not found.`});
            }
        }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Withdrawal Requests</h2>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Pending Withdrawals</CardTitle>
          <CardDescription>Review and approve or reject user withdrawal requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.user}</TableCell>
                  <TableCell className="font-bold">{req.amount}</TableCell>
                  <TableCell>{req.method}</TableCell>
                  <TableCell>{new Date(req.date).toLocaleString()}</TableCell>
                  <TableCell className="flex gap-2">
                     <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => handleAction(req, 'approved')}>
                        <Check className="h-5 w-5" />
                    </Button>
                     <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleAction(req, 'rejected')}>
                        <X className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No pending withdrawal requests.</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
