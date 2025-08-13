
'use client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, UserPlus, ChevronDown, ChevronUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
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
import { getDatabase, ref, onValue, off, remove, set, push, update } from "firebase/database"
import { app } from "@/lib/firebase"
import Image from "next/image"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { endOfWeek, startOfWeek, subWeeks, format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

type Admin = {
    id: string;
    name: string;
    email: string;
    status: 'Active' | 'Banned';
    permissions: string;
    wallet: number;
    upiId: string;
    upiIdLarge: string;
    qrCode: string;
    qrCodeLarge: string;
};

type Transaction = {
    id: string;
    adminId?: string;
    type: 'Deposit' | 'Withdrawal' | 'Bet' | 'Win';
    amount: number;
    date: string;
}

const ChartCard = ({ title, data }: { title: string, data: any[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="lastMonth" fill="hsl(var(--primary) / 0.5)" name="Last Month" />
                    <Bar dataKey="thisMonth" fill="hsl(var(--primary))" name="This Month" />
                    <Bar dataKey="lastWeek" fill="hsl(var(--accent) / 0.5)" name="Last Week" />
                    <Bar dataKey="thisWeek" fill="hsl(var(--accent))" name="This Week" />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);


export default function AdministratorsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddAdminOpen, setAddAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: ''});
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [action, setAction] = useState<'view' | 'ban' | 'password' | 'delete' | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const db = getDatabase(app);
    
    const adminsRef = ref(db, 'admins');
    const adminsListener = onValue(adminsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const adminList = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                status: data[key].status || 'Active',
                permissions: data[key].permissions || 'All',
                wallet: data[key].wallet || 0,
            }));
            setAdmins(adminList);
        } else {
            setAdmins([]);
        }
    });

    const transactionsRef = ref(db, 'transactions');
    const transactionsListener = onValue(transactionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const transactionList = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
            }));
            setTransactions(transactionList);
        } else {
            setTransactions([]);
        }
    });


    return () => {
      off(adminsRef, 'value', adminsListener);
      off(transactionsRef, 'value', transactionsListener);
    }
  }, []);

  const getAdminAnalytics = (adminId: string) => {
    const now = new Date();

    const dateRanges = {
        thisWeek: { start: startOfWeek(now), end: endOfWeek(now) },
        lastWeek: { start: startOfWeek(subWeeks(now, 1)), end: endOfWeek(subWeeks(now, 1)) },
        thisMonth: { start: startOfMonth(now), end: endOfMonth(now) },
        lastMonth: { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) },
    };

    const getFilteredData = (start: Date, end: Date) => {
        return transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return tx.adminId === adminId && txDate >= start && txDate <= end;
        });
    };

    const calculateTotal = (txs: Transaction[], type: 'Deposit' | 'Withdrawal') => {
        return txs.filter(tx => tx.type === type).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    };

    const analyticsData: { [key: string]: { deposits: number; withdrawals: number } } = {};

    for (const key in dateRanges) {
        const range = dateRanges[key as keyof typeof dateRanges];
        const txs = getFilteredData(range.start, range.end);
        analyticsData[key] = {
            deposits: calculateTotal(txs, 'Deposit'),
            withdrawals: calculateTotal(txs, 'Withdrawal'),
        };
    }
    
    const depositData = [{ 
        name: 'Deposits', 
        thisWeek: analyticsData.thisWeek.deposits,
        lastWeek: analyticsData.lastWeek.deposits,
        thisMonth: analyticsData.thisMonth.deposits,
        lastMonth: analyticsData.lastMonth.deposits
    }];

    const withdrawalData = [{ 
        name: 'Withdrawals', 
        thisWeek: analyticsData.thisWeek.withdrawals,
        lastWeek: analyticsData.lastWeek.withdrawals,
        thisMonth: analyticsData.thisMonth.withdrawals,
        lastMonth: analyticsData.lastMonth.withdrawals
    }];
    
    const admin = admins.find(a => a.id === adminId);
    const walletChartData = [
        { name: 'Wallet (Current)', thisWeek: admin?.wallet || 0 }
    ]

    return { depositData, withdrawalData, walletChartData, currentWallet: admin?.wallet || 0 };
  }


  const handleAddAdmin = () => {
    if (newAdmin.name && newAdmin.email && newAdmin.password) {
        const db = getDatabase(app);
        const newAdminRef = push(ref(db, 'admins'));
        const adminData = {
            id: newAdminRef.key,
            name: newAdmin.name,
            email: newAdmin.email,
            password: newAdmin.password, // In a real app, this should be hashed
            status: 'Active',
            permissions: 'All',
            wallet: 0,
            upiId: '',
            upiIdLarge: '',
            qrCode: '',
            qrCodeLarge: '',
        };
        set(newAdminRef, adminData);
        setNewAdmin({ name: '', email: '', password: '' });
        setAddAdminOpen(false);
        toast({ title: 'Admin Added', description: `${newAdmin.name} has been added as an administrator.`});
    }
  }

  const handleOpenModal = (admin: Admin, modalAction: 'view' | 'ban' | 'password' | 'delete') => {
      setSelectedAdmin(admin);
      setAction(modalAction);
  }

  const handleCloseModal = () => {
      setSelectedAdmin(null);
      setAction(null);
      setNewPassword('');
  }

  const handleBanToggle = async () => {
      if (!selectedAdmin) return;
      const db = getDatabase(app);
      const adminRef = ref(db, `admins/${selectedAdmin.id}`);
      const newStatus = selectedAdmin.status === 'Active' ? 'Banned' : 'Active';
      await update(adminRef, { status: newStatus });
      toast({ title: `Admin ${newStatus}`, description: `${selectedAdmin.name}'s status has been updated.`});
      handleCloseModal();
  }
  
  const handleChangePassword = async () => {
      if (!selectedAdmin || !newPassword) return;
      const db = getDatabase(app);
      const adminRef = ref(db, `admins/${selectedAdmin.id}`);
      await update(adminRef, { password: newPassword });
      toast({ title: 'Password Changed', description: `Password for ${selectedAdmin.name} has been updated.`});
      handleCloseModal();
  }

  const handleDelete = async () => {
    if (!selectedAdmin) return;
    const db = getDatabase(app);
    const adminRef = ref(db, `admins/${selectedAdmin.id}`);
    await remove(adminRef);
    toast({ variant: 'destructive', title: 'Admin Deleted', description: `${selectedAdmin.name} has been removed.`});
    handleCloseModal();
  };

  const toggleCollapsible = (id: string) => {
    setOpenCollapsibles(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }
  
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
          <CardDescription>Add, remove, or edit administrator accounts. Click on a row to see details.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-md">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Wallet</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    {admins.map((admin) => {
                        const analytics = getAdminAnalytics(admin.id);
                        const isOpen = openCollapsibles.includes(admin.id);
                        return (
                        <Collapsible asChild key={admin.id} open={isOpen} onOpenChange={() => toggleCollapsible(admin.id)}>
                            <tbody className="w-full">
                            <TableRow className="cursor-pointer">
                                <TableCell>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </Button>
                                    </CollapsibleTrigger>
                                </TableCell>
                                <TableCell className="font-medium" onClick={() => toggleCollapsible(admin.id)}>{admin.name}</TableCell>
                                <TableCell onClick={() => toggleCollapsible(admin.id)}>{admin.email}</TableCell>
                                <TableCell onClick={() => toggleCollapsible(admin.id)}>
                                    <Badge variant={admin.status === 'Active' ? 'default' : 'destructive'}>{admin.status}</Badge>
                                </TableCell>
                                <TableCell onClick={() => toggleCollapsible(admin.id)}>₹{analytics.currentWallet.toFixed(2)}</TableCell>
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
                                        <DropdownMenuItem onClick={() => handleOpenModal(admin, 'view')}>View Payment Details</DropdownMenuItem>
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
                            <CollapsibleContent asChild>
                                <TableRow>
                                    <TableCell colSpan={6} className="p-0">
                                         <div className="p-6 bg-secondary/50">
                                            <h4 className="text-lg font-semibold mb-4">Performance Analytics for {admin.name}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <ChartCard title="Deposits Handled" data={analytics.depositData} />
                                                <ChartCard title="Withdrawals Approved" data={analytics.withdrawalData} />
                                                <Card>
                                                    <CardHeader><CardTitle className="text-base">Current Wallet</CardTitle></CardHeader>
                                                    <CardContent className="flex items-center justify-center h-64">
                                                        <p className="text-5xl font-bold text-primary">₹{analytics.currentWallet.toFixed(2)}</p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </CollapsibleContent>
                            </tbody>
                        </Collapsible>
                        );
                    })}
                </Table>
            </div>
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
                        {action === 'view' && `Payment Details: ${selectedAdmin.name}`}
                        {action === 'ban' && `${selectedAdmin.status === 'Active' ? 'Ban' : 'Unban'} Administrator`}
                        {action === 'password' && `Change Password for ${selectedAdmin.name}`}
                        {action === 'delete' && `Delete Administrator`}
                    </AlertDialogTitle>
                </AlertDialogHeader>

                {action === 'view' && (
                    <AlertDialogDescription asChild>
                        <div className="space-y-4 mt-4 text-left text-sm text-muted-foreground">
                             <div className="space-y-2 pt-2">
                                <Label>Default UPI ID</Label>
                                <p className="p-2 bg-muted rounded-md font-mono">{selectedAdmin.upiId || 'Not Set'}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Default QR Code</Label>
                                {selectedAdmin.qrCode ? <Image src={selectedAdmin.qrCode} alt="QR Code" width={128} height={128} className="rounded-md"/> : <p className="text-xs">Not Set</p>}
                            </div>
                             <div className="space-y-2">
                                <Label>Large Amount UPI ID</Label>
                                <p className="p-2 bg-muted rounded-md font-mono">{selectedAdmin.upiIdLarge || 'Not Set'}</p>
                            </div>
                             <div className="space-y-2">
                                <Label>Large Amount QR Code</Label>
                                {selectedAdmin.qrCodeLarge ? <Image src={selectedAdmin.qrCodeLarge} alt="QR Code" width={128} height={128} className="rounded-md"/> : <p className="text-xs">Not Set</p>}
                            </div>
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
