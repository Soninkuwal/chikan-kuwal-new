
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getDatabase, ref, onValue, off } from "firebase/database";
import { app } from "@/lib/firebase";
import { Skeleton } from '@/components/ui/skeleton';

type Transaction = {
    id: string;
    user: string;
    amount: number;
    type: 'Deposit' | 'Withdrawal' | 'Bet' | 'Win';
    status: 'Completed' | 'Pending' | 'Rejected' | 'Failed' | 'Approved';
    date: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const transactionsRef = ref(db, 'transactions');

    const listener = onValue(transactionsRef, (snapshot) => {
        setLoading(true);
        const data = snapshot.val();
        if(data) {
            const transactionList = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(transactionList);
        } else {
            setTransactions([]);
        }
        setLoading(false);
    });
    
    return () => off(transactionsRef, 'value', listener);
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">All Transactions</h2>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>A complete log of all platform transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    </TableRow>
                ))
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.user}</TableCell>
                  <TableCell className={`font-bold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.amount > 0 ? `+₹${transaction.amount.toFixed(2)}` : `-₹${Math.abs(transaction.amount).toFixed(2)}`}
                    </TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === 'Deposit' || transaction.type === 'Win' ? 'secondary' : 'outline'}>{transaction.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={transaction.status === 'Completed' || transaction.status === 'Approved' ? 'default' : (transaction.status === 'Pending' || transaction.status === 'Failed') ? 'secondary' : 'destructive'}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleString()}</TableCell>
                </TableRow>
              ))
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No transactions found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
