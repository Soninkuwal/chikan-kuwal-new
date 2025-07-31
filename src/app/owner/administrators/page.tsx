
'use client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, UserPlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const initialAdmins = [
    { id: 1, name: 'Sonic Kuwal', email: 'sonickuwal@gmail.com', status: 'Active', permissions: 'All' },
]

type Admin = typeof initialAdmins[0];

export default function AdministratorsPage() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [isAddAdminOpen, setAddAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: ''});
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [action, setAction] = useState<'view' | 'ban' | 'password' | 'permissions' | 'delete' | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();

  const handleAddAdmin = () => {
    if (newAdmin.name && newAdmin.email && newAdmin.password) {
        setAdmins([...admins, {
            id: admins.length + 1,
            name: newAdmin.name,
            email: newAdmin.email,
            status: 'Active',
            permissions: 'All',
        }]);
        setNewAdmin({ name: '', email: '', password: '' });
        setAddAdminOpen(false);
        toast({ title: 'Admin Added', description: `${newAdmin.name} has been added as an administrator.`});
    }
  }

  const handleOpenModal = (admin: Admin, modalAction: 'view' | 'ban' | 'password' | 'permissions' | 'delete') => {
      setSelectedAdmin(admin);
      setAction(modalAction);
  }

  const handleCloseModal = () => {
      setSelectedAdmin(null);
      setAction(null);
      setNewPassword('');
  }

  const handleBanToggle = () => {
      if (!selectedAdmin) return;
      const newStatus = selectedAdmin.status === 'Active' ? 'Banned' : 'Active';
      setAdmins(admins.map(admin => admin.id === selectedAdmin.id ? { ...admin, status: newStatus } : admin));
      toast({ title: `Admin ${newStatus}`, description: `${selectedAdmin.name}'s status has been updated.`});
      handleCloseModal();
  }
  
  const handleChangePassword = () => {
      if (!selectedAdmin || !newPassword) return;
      // Here you would typically call an API to update the password
      toast({ title: 'Password Changed', description: `Password for ${selectedAdmin.name} has been updated.`});
      handleCloseModal();
  }

  const handleDelete = () => {
    if (!selectedAdmin) return;
    setAdmins(admins.filter(admin => admin.id !== selectedAdmin.id));
    toast({ variant: 'destructive', title: 'Admin Deleted', description: `${selectedAdmin.name} has been removed.`});
    handleCloseModal();
  };
  
  return (
    <>
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Administrators</h2>
         <Button onClick={() => setAddAdminOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4"/>
            Add New Admin
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Administrator List</CardTitle>
          <CardDescription>Add, remove, or edit administrator accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium" onClick={() => handleOpenModal(admin, 'view')}>{admin.name}</TableCell>
                  <TableCell onClick={() => handleOpenModal(admin, 'view')}>{admin.email}</TableCell>
                  <TableCell onClick={() => handleOpenModal(admin, 'view')}>
                    <Badge variant={admin.status === 'Active' ? 'default' : 'destructive'}>{admin.status}</Badge>
                  </TableCell>
                  <TableCell onClick={() => handleOpenModal(admin, 'view')}>{admin.permissions}</TableCell>
                  <TableCell>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenModal(admin, 'permissions')}>Edit Permissions</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenModal(admin, 'password')}>Change Password</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-yellow-600 focus:text-yellow-600" onClick={() => handleOpenModal(admin, 'ban')}>
                            {admin.status === 'Active' ? 'Ban' : 'Unban'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleOpenModal(admin, 'delete')}
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
     <AlertDialog open={isAddAdminOpen} onOpenChange={setAddAdminOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Add New Administrator</AlertDialogTitle>
            <AlertDialogDescription>
                Enter the details for the new administrator account.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newAdmin.name} onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">Password</Label>
                    <Input id="password" type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} className="col-span-3" />
                </div>
            </div>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddAdmin}>Add Admin</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    {selectedAdmin && (
         <AlertDialog open={!!action} onOpenChange={handleCloseModal}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {action === 'view' && `Admin Details: ${selectedAdmin.name}`}
                        {action === 'ban' && `${selectedAdmin.status === 'Active' ? 'Ban' : 'Unban'} Administrator`}
                        {action === 'password' && `Change Password for ${selectedAdmin.name}`}
                        {action === 'permissions' && `Edit Permissions for ${selectedAdmin.name}`}
                        {action === 'delete' && `Delete Administrator`}
                    </AlertDialogTitle>
                </AlertDialogHeader>

                {action === 'view' && (
                    <AlertDialogDescription asChild>
                        <div className="space-y-2 mt-4 text-left text-sm text-muted-foreground">
                            <div><strong>ID:</strong> {selectedAdmin.id}</div>
                            <div><strong>Email:</strong> {selectedAdmin.email}</div>
                            <div><strong>Permissions:</strong> {selectedAdmin.permissions}</div>
                            <div><strong>Status:</strong> <Badge variant={selectedAdmin.status === 'Active' ? 'default' : 'destructive'}>{selectedAdmin.status}</Badge></div>
                        </div>
                    </AlertDialogDescription>
                )}

                 {action === 'ban' && (
                    <AlertDialogDescription>
                        Are you sure you want to {selectedAdmin.status === 'Active' ? 'ban' : 'unban'} this administrator? This will temporarily revoke their access.
                    </AlertDialogDescription>
                )}
                 {action === 'delete' && (
                    <AlertDialogDescription>
                        Are you sure you want to delete {selectedAdmin.name}? This action cannot be undone.
                    </AlertDialogDescription>
                )}

                 {action === 'password' && (
                     <div className="grid gap-2 py-4">
                       <Label htmlFor="new-admin-password">New Password</Label>
                       <Input id="new-admin-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                    </div>
                 )}
                 
                 {action === 'permissions' && (
                     <AlertDialogDescription>
                        Permission editing is not yet implemented. This would be the place to manage fine-grained access controls for this administrator.
                    </AlertDialogDescription>
                 )}


                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCloseModal}>Cancel</AlertDialogCancel>
                    {action === 'view' && (<AlertDialogAction onClick={handleCloseModal}>Close</AlertDialogAction>)}
                    {action === 'ban' && (
                        <AlertDialogAction onClick={handleBanToggle} className={selectedAdmin.status === 'Active' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}>
                             {selectedAdmin.status === 'Active' ? 'Confirm Ban' : 'Confirm Unban'}
                        </AlertDialogAction>
                    )}
                     {action === 'password' && (
                        <AlertDialogAction onClick={handleChangePassword} disabled={!newPassword}>
                            Update Password
                        </AlertDialogAction>
                    )}
                    {action === 'permissions' && (<AlertDialogAction onClick={handleCloseModal}>Got it</AlertDialogAction>)}
                    {action === 'delete' && (
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Confirm Delete
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}
    </>
  )
}
