
'use client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { app } from "@/lib/firebase"
import { getDatabase, ref, onValue, off, remove, update } from "firebase/database"
import { useToast } from "@/hooks/use-toast"

type User = {
    id: string; // This is the Firebase key
    name: string;
    email: string;
    mobile: string;
    status: 'Active' | 'Banned';
    role: 'Player' | 'Admin' | 'Owner';
    wallet: number;
    kycStatus: 'Verified' | 'Pending' | 'Rejected' | 'Not Verified';
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'view' | 'delete' | 'suspend' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const db = getDatabase(app);
    const usersRef = ref(db, 'users');
    const listener = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const userList = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                status: data[key].status || 'Active',
                role: data[key].role || 'Player',
                kycStatus: data[key].kycStatus || 'Not Verified',
            }));
            setUsers(userList);
        } else {
            setUsers([]);
        }
    });

    return () => {
      off(usersRef, 'value', listener);
    }
  }, []);
  
  const handleOpenModal = (user: User, modalAction: 'view' | 'delete' | 'suspend') => {
      setSelectedUser(user);
      setAction(modalAction);
  }

  const handleCloseModal = () => {
      setSelectedUser(null);
      setAction(null);
  }

  const handleDelete = async () => {
    if (!selectedUser) return;
    const db = getDatabase(app);
    const userRef = ref(db, `users/${selectedUser.id}`);
    await remove(userRef);
    toast({ variant: 'destructive', title: 'User Deleted', description: `${selectedUser.name} has been removed.` });
    handleCloseModal();
  };

  const handleSuspend = async () => {
      if (!selectedUser) return;
      const db = getDatabase(app);
      const userRef = ref(db, `users/${selectedUser.id}`);
      const newStatus = selectedUser.status === 'Active' ? 'Banned' : 'Active';
      await update(userRef, { status: newStatus });
      toast({ title: `User ${newStatus === 'Banned' ? 'Suspended' : 'Unsuspended'}`, description: `${selectedUser.name}'s status has been updated.`});
      handleCloseModal();
  }
  
  return (
    <>
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View, manage, and verify users.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium" onClick={() => handleOpenModal(user, 'view')}>{user.name}</TableCell>
                  <TableCell onClick={() => handleOpenModal(user, 'view')}>{user.email}</TableCell>
                  <TableCell onClick={() => handleOpenModal(user, 'view')}>₹{(user.wallet || 0).toFixed(2)}</TableCell>
                  <TableCell onClick={() => handleOpenModal(user, 'view')}>
                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge>
                  </TableCell>
                  <TableCell onClick={() => handleOpenModal(user, 'view')}>
                     <Badge 
                      variant={user.kycStatus === 'Verified' ? 'default' : user.kycStatus === 'Pending' ? 'secondary' : user.kycStatus === 'Rejected' ? 'destructive' : 'outline'}
                    >
                      {user.kycStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleOpenModal(user, 'view')}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOpenModal(user, 'suspend')}>
                            {user.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onSelect={() => handleOpenModal(user, 'delete')}
                        >Delete</DropdownMenuItem>
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
         <AlertDialog open={!!action} onOpenChange={handleCloseModal}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>
                    {action === 'view' && `User Details: ${selectedUser.name}`}
                    {action === 'delete' && `Delete User: ${selectedUser.name}`}
                    {action === 'suspend' && `${selectedUser.status === 'Active' ? 'Suspend' : 'Unsuspend'} User: ${selectedUser.name}`}
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                    <div>
                        {action === 'view' && (
                            <div className="space-y-2 mt-4 text-left text-sm text-muted-foreground">
                                <div><strong>ID:</strong> {selectedUser.id}</div>
                                <div><strong>Email:</strong> {selectedUser.email}</div>
                                <div><strong>Mobile:</strong> {selectedUser.mobile}</div>
                                <div><strong>Role:</strong> {selectedUser.role}</div>
                                <div><strong>Status:</strong> <Badge variant={selectedUser.status === 'Active' ? 'default' : 'destructive'}>{selectedUser.status}</Badge></div>
                                <div><strong>KYC Status:</strong> <Badge variant={selectedUser.kycStatus === 'Verified' ? 'default' : selectedUser.kycStatus === 'Pending' ? 'secondary' : selectedUser.kycStatus === 'Rejected' ? 'destructive' : 'outline'}>{selectedUser.kycStatus}</Badge></div>
                                <div><strong>Wallet Balance:</strong> ₹{(selectedUser.wallet || 0).toFixed(2)}</div>
                            </div>
                        )}
                        {action === 'delete' && `Are you sure you want to permanently delete ${selectedUser.name}? This action cannot be undone.`}
                        {action === 'suspend' && `Are you sure you want to ${selectedUser.status === 'Active' ? 'suspend' : 'unsuspend'} ${selectedUser.name}?`}
                    </div>
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCloseModal}>Cancel</AlertDialogCancel>
                    {action === 'view' && <AlertDialogAction onClick={handleCloseModal}>Close</AlertDialogAction>}
                    {action === 'delete' && <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>}
                    {action === 'suspend' && <AlertDialogAction onClick={handleSuspend}>{selectedUser.status === 'Active' ? 'Suspend' : 'Unsuspend'}</AlertDialogAction>}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
