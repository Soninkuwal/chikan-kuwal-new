
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
} from "@/components/ui/alert-dialog"
import { app } from "@/lib/firebase"
import { getDatabase, ref, onValue } from "firebase/database"

type User = {
    id: string;
    name: string;
    email: string;
    status: 'Active' | 'Banned';
    role: 'Player' | 'Admin' | 'Owner';
    wallet: number;
    kycStatus: 'Verified' | 'Pending' | 'Rejected' | 'Not Verified';
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const db = getDatabase(app);
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const userList = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                status: data[key].status || 'Active', // Default status
                role: data[key].role || 'Player', // Default role
                kycStatus: data[key].kycStatus || 'Not Verified',
            }));
            setUsers(userList);
        }
    });
  }, []);

  const handleDelete = (userId: string) => {
    // In a real app, you would update the database to delete the user.
    // For this example, we'll just filter them out of the UI.
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleSuspend = (userId: string) => {
      // In a real app, you'd update the user's status in the database.
      setUsers(users.map(user => user.id === userId ? {...user, status: user.status === 'Active' ? 'Banned' : 'Active'} : user));
      setSelectedUser(null);
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
                <TableRow key={user.id} onClick={() => setSelectedUser(user)} className="cursor-pointer">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>₹{(user.wallet || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspend(user.id)}>
                            {user.status === 'Active' ? 'Suspend' : 'Unsuspend'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(user.id)}
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
         <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>User Details: {selectedUser.name}</AlertDialogTitle>
                <AlertDialogDescription asChild>
                    <div className="space-y-2 mt-4 text-left text-sm text-muted-foreground">
                        <div><strong>ID:</strong> {selectedUser.id}</div>
                        <div><strong>Email:</strong> {selectedUser.email}</div>
                        <div><strong>Role:</strong> {selectedUser.role}</div>
                        <div><strong>Status:</strong> <Badge variant={selectedUser.status === 'Active' ? 'default' : 'destructive'}>{selectedUser.status}</Badge></div>
                        <div><strong>KYC Status:</strong> <Badge variant={selectedUser.kycStatus === 'Verified' ? 'default' : selectedUser.kycStatus === 'Pending' ? 'secondary' : selectedUser.kycStatus === 'Rejected' ? 'destructive' : 'outline'}>{selectedUser.kycStatus}</Badge></div>
                        <div><strong>Wallet Balance:</strong> ₹{(selectedUser.wallet || 0).toFixed(2)}</div>
                    </div>
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedUser(null)}>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
