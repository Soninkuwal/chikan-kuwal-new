'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
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

const initialUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'Player', wallet: 500 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Banned', role: 'Player', wallet: 120 },
    { id: 3, name: 'Admin User', email: 'admin@example.com', status: 'Active', role: 'Admin', wallet: 0 },
]

type User = typeof initialUsers[0];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleDelete = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleSuspend = (userId: number) => {
      setUsers(users.map(user => user.id === userId ? {...user, status: user.status === 'Active' ? 'Banned' : 'Active'} : user));
      setSelectedUser(null);
  }
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
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
                <TableRow key={user.id} onClick={() => setSelectedUser(user)} className="cursor-pointer">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>₹{user.wallet.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
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
                            className="text-destructive"
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
                        <div><strong>Wallet Balance:</strong> ₹{selectedUser.wallet.toFixed(2)}</div>
                    </div>
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedUser(null)}>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
