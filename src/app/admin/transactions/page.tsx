import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const transactions = [
    { id: 1, user: 'John Doe', amount: '₹500', type: 'Deposit', status: 'Completed', date: '2023-10-27' },
    { id: 2, user: 'Jane Smith', amount: '₹200', type: 'Withdrawal', status: 'Approved', date: '2023-10-26' },
    { id: 3, user: 'John Doe', amount: '₹1000', type: 'Deposit', status: 'Failed', date: '2023-10-25' },
    { id: 4, user: 'Player123', amount: '₹150', type: 'Bet', status: 'Completed', date: '2023-10-28' },
    { id: 5, user: 'Player123', amount: '₹300', type: 'Win', status: 'Completed', date: '2023-10-28' },
];

export default function TransactionsPage() {
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
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.user}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === 'Deposit' || transaction.type === 'Win' ? 'secondary' : 'outline'}>{transaction.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={transaction.status === 'Completed' || transaction.status === 'Approved' ? 'default' : transaction.status === 'Pending' ? 'secondary' : 'destructive'}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
