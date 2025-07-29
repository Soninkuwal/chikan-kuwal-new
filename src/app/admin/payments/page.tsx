
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';

const initialDepositRequests = [
    { id: 'TXN789', userId: 'john@example.com', user: 'Player123', amount: '₹500', utr: '123456789012', screenshot: 'https://placehold.co/600x400.png', date: '2023-10-28 10:00 AM' },
    { id: 'TXN790', userId: 'jane@example.com', user: 'Lucky7', amount: '₹1000', utr: '987654321098', screenshot: 'https://placehold.co/600x400.png', date: '2023-10-28 11:30 AM' },
    { id: 'TXN791', userId: 'newuser@example.com', user: 'NewUser24', amount: '₹250', utr: '555566667777', screenshot: 'https://placehold.co/600x400.png', date: '2023-10-29 09:15 AM' },
];

type DepositRequest = typeof initialDepositRequests[0];

export default function DepositRequestsPage() {
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
      const storedRequests = localStorage.getItem('depositRequests');
      if (storedRequests) {
          setRequests(JSON.parse(storedRequests));
      } else {
          setRequests(initialDepositRequests);
          localStorage.setItem('depositRequests', JSON.stringify(initialDepositRequests));
      }

      const handleStorageChange = (event: StorageEvent) => {
          if (event.key === 'depositRequests') {
              const updatedRequests = localStorage.getItem('depositRequests');
              if (updatedRequests) {
                  setRequests(JSON.parse(updatedRequests));
              }
          }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAction = (request: DepositRequest, status: 'approved' | 'rejected') => {
    const updatedRequests = requests.filter(req => req.id !== request.id);
    setRequests(updatedRequests);
    localStorage.setItem('depositRequests', JSON.stringify(updatedRequests));

    if (status === 'approved') {
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
        toast({ title: 'Request Approved', description: `${request.user}'s wallet has been updated.`});
    } else {
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
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.user}</TableCell>
                    <TableCell className="font-bold">{req.amount}</TableCell>
                    <TableCell>{req.utr}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedScreenshot(req.screenshot)}>View</Button>
                    </TableCell>
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
                <Image src={selectedScreenshot} alt="Deposit Screenshot" layout="fill" objectFit="contain" />
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
