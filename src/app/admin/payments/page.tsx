
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';
import { app } from '@/lib/firebase';
import { getDatabase, ref, update, get, onValue, off, remove, push, serverTimestamp, set } from "firebase/database";

type DepositRequest = { 
    id: string;
    userId: string;
    user: string;
    amount: string;
    utr: string;
    screenshot: string;
    date: string;
};

export default function DepositRequestsPage() {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const db = getDatabase(app);
    const requestsRef = ref(db, 'depositRequests');

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

  const handleAction = async (request: DepositRequest, status: 'approved' | 'rejected') => {
    const db = getDatabase(app);
    const requestRef = ref(db, `depositRequests/${request.id}`);
    
    // Optimistically remove from UI, though Firebase listener will handle it
    setRequests(prev => prev.filter(req => req.id !== request.id));
    
    // Remove the request from the pending list in Firebase
    await remove(requestRef);
    const amountNumber = parseFloat(request.amount.replace('₹', ''));

    if (status === 'approved') {
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
                
                addTransaction({
                    userId: request.userId,
                    user: request.user,
                    type: 'Deposit',
                    amount: amountNumber,
                    status: 'Completed',
                    date: new Date().toISOString()
                });

                toast({ title: 'Request Approved', description: `${request.user}'s wallet has been updated.`});
            } else {
                 toast({ variant: 'destructive', title: 'Update Failed', description: `User with ID ${request.userId} not found.`});
            }
        }
    } else {
         addTransaction({
            userId: request.userId,
            user: request.user,
            type: 'Deposit',
            amount: amountNumber,
            status: 'Rejected',
            date: new Date().toISOString()
        });
        toast({ variant: 'destructive', title: 'Request Rejected', description: `Deposit request for ${request.user} has been rejected.`});
    }
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Deposit Requests</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Pending Deposits</CardTitle>
            <CardDescription>Review and approve or reject user deposit requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>UTR</TableHead>
                  <TableHead>Screenshot</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.user}</TableCell>
                    <TableCell className="font-bold">{req.amount}</TableCell>
                    <TableCell>{req.utr}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedScreenshot(req.screenshot)}>View</Button>
                    </TableCell>
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
                    <TableCell colSpan={6} className="text-center h-24">No pending deposit requests.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!selectedScreenshot} onOpenChange={(open) => !open && setSelectedScreenshot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deposit Screenshot</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Review the screenshot to verify the transaction.
          </AlertDialogDescription>
          {selectedScreenshot && (
            <div className="relative h-96">
                <Image src={selectedScreenshot} data-ai-hint="payment receipt" alt="Deposit Screenshot" layout="fill" objectFit="contain" />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedScreenshot(null)}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
