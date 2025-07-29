
'use client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const initialUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'Player', wallet: 500 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Banned', role: 'Player', wallet: 120 },
    { id: 3, name: 'Sonic Kuwal', email: 'sonickuwal@gmail.com', status: 'Active', role: 'Admin', wallet: 0 },
    { id: 4, name: 'Owner', email: 'sonickuwal@gmail.com', status: 'Active', role: 'Owner', wallet: 0 },
]

type User = typeof initialUsers[0];

export default function AllUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'view' | 'suspend' | 'wallet' | null>(null);
  const [walletAmount, setWalletAmount] = useState(0);
  const { toast } = useToast();

  const handleOpenModal = (user: User, modalAction: 'view' | 'suspend' | 'wallet') => {
    setSelectedUser(user);
    setAction(modalAction);
    if (modalAction === 'wallet') {
      setWalletAmount(user.wallet);
    }
  }

  const handleCloseModal = () => {
    setSelectedUser(null);
    setAction(null);
    setWalletAmount(0);
  }

  const handleSuspend = () => {
    if (!selectedUser) return;
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, status: user.status === 'Active' ? 'Banned' : 'Active' } 
        : user
    ));
    toast({
        title: `User ${selectedUser.status === 'Active' ? 'Suspended' : 'Unsuspended'}`,
        description: `${selectedUser.name}'s status has been updated.`
    });
    handleCloseModal();
  }

  const handleWalletUpdate = () => {
    if (!selectedUser) return;
    setUsers(users.map(user => 
      user.id === selectedUser.id ? { ...user, wallet: walletAmount } : user
    ));
    toast({
        title: 'Wallet Updated',
        description: `Wallet for ${selectedUser.name} has been set to ₹${walletAmount.toFixed(2)}.`
    });
    handleCloseModal();
  }

  return (
    <>
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">All Users</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Platform User List</CardTitle>
          <CardDescription>View and manage all registered users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium" onClick={() => handleOpenModal(user, 'view')}>{user.name}</TableCell>
                  <TableCell onClick={() => handleOpenModal(user, 'view')}>{user.email}</TableCell>
                  <TableCell onClick={() => handleOpenModal(user, 'view')}>₹{user.wallet.toFixed(2)}</TableCell>
                  <TableCell onClick={() => handleOpenModal(user, 'view')}>
                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge>
                  </TableCell>
                  <TableCell onClick={() => handleOpenModal(user, 'view')}>{user.role}</TableCell>
                  <TableCell>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.role === 'Owner'}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenModal(user, 'view')}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenModal(user, 'wallet')}>Edit Wallet</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenModal(user, 'suspend')} className="text-yellow-600 focus:text-yellow-600">
                          {user.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    {selectedUser && (
      <AlertDialog open={!!selectedUser} onOpenChange={handleCloseModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === 'view' && `User Details: ${selectedUser.name}`}
              {action === 'suspend' && `${selectedUser.status === 'Active' ? 'Suspend' : 'Unsuspend'} User`}
              {action === 'wallet' && `Edit Wallet for ${selectedUser.name}`}
            </AlertDialogTitle>
          </AlertDialogHeader>

          {action === 'view' && (
            <div className="space-y-2 mt-4 text-left text-sm text-muted-foreground">
              <div><strong>ID:</strong> {selectedUser.id}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Role:</strong> {selectedUser.role}</div>
              <div><strong>Status:</strong> <Badge variant={selectedUser.status === 'Active' ? 'default' : 'destructive'}>{selectedUser.status}</Badge></div>
              <div><strong>Wallet Balance:</strong> ₹{selectedUser.wallet.toFixed(2)}</div>
            </div>
          )}

          {action === 'suspend' && (
            <AlertDialogDescription>
              Are you sure you want to {selectedUser.status === 'Active' ? 'suspend' : 'unsuspend'} this user?
            </AlertDialogDescription>
          )}

          {action === 'wallet' && (
            <div className="grid gap-2 py-4">
              <Label htmlFor="wallet-amount">Wallet Amount</Label>
              <Input 
                id="wallet-amount" 
                type="number" 
                value={walletAmount} 
                onChange={(e) => setWalletAmount(Number(e.target.value))} 
              />
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseModal}>Cancel</AlertDialogCancel>
            {action === 'suspend' && (
              <AlertDialogAction onClick={handleSuspend} className={selectedUser.status === 'Active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}>
                Confirm
              </AlertDialogAction>
            )}
             {action === 'wallet' && (
              <AlertDialogAction onClick={handleWalletUpdate}>Update Wallet</AlertDialogAction>
            )}
             {action === 'view' && (
              <AlertDialogAction onClick={handleCloseModal}>Close</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )}
    </>
  )
}
