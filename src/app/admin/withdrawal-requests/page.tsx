
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useToast } from '@/hooks/use-toast';

const initialWithdrawalRequests = [
    { id: 'WDR456', userId: 'jane@example.com', user: 'Jane Smith', amount: '₹200', method: 'UPI (jane@upi)', date: '2023-10-26 09:00 AM' },
    { id: 'WDR457', userId: 'winner@example.com', user: 'WinnerGG', amount: '₹1200', method: 'Bank Transfer', date: '2023-10-27 02:15 PM' },
    { id: 'WDR458', userId: 'newuser@example.com', user: 'NewUser24', amount: '₹150', method: 'UPI (new@upi)', date: '2023-10-29 10:00 AM' },
]

type WithdrawalRequest = typeof initialWithdrawalRequests[0];

export default function WithdrawalRequestsPage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedRequests = localStorage.getItem('withdrawalRequests');
    if (storedRequests) {
        setRequests(JSON.parse(storedRequests));
    } else {
        setRequests(initialWithdrawalRequests);
        localStorage.setItem('withdrawalRequests', JSON.stringify(initialWithdrawalRequests));
    }

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'withdrawalRequests') {
            const updatedRequests = localStorage.getItem('withdrawalRequests');
            if (updatedRequests) {
                setRequests(JSON.parse(updatedRequests));
            }
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAction = (request: WithdrawalRequest, status: 'approved' | 'rejected') => {
    const updatedRequests = requests.filter(req => req.id !== request.id);
    setRequests(updatedRequests);
    localStorage.setItem('withdrawalRequests', JSON.stringify(updatedRequests));

    if (status === 'approved') {
        toast({ title: 'Request Approved', description: `Withdrawal for ${request.user} has been approved.`});
    } else {
        // If rejected, refund the amount to the user's wallet
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = users.map((user: any) => {
            if (user.email === request.userId) {
                const updatedUser = { ...user, wallet: (user.wallet || 0) + parseFloat(request.amount.replace('₹', '')) };
                 // Also update currentUser if they are the one being updated
                const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                if (currentUser.email === user.email) {
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                }
                return updatedUser;
            }
            return user;
        });
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        window.dispatchEvent(new StorageEvent('storage', { key: 'users' }));
        window.dispatchEvent(new StorageEvent('storage', { key: 'currentUser' })); // Notify other tabs
        toast({ variant: 'destructive', title: 'Request Rejected', description: `Withdrawal for ${request.user} has been rejected and funds returned.`});
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
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.user}</TableCell>
                  <TableCell className="font-bold">{req.amount}</TableCell>
                  <TableCell>{req.method}</TableCell>
                  <TableCell>{req.date}</TableCell>
                  <TableCell className="flex gap-2">
                     <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => handleAction(req, 'approved')}>
                        <Check className="h-5 w-5" />
                    </Button>
                     <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleAction(req, 'rejected')}>
                        <X className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
