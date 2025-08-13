
'use client';
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield } from 'lucide-react'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { getDatabase, ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { app } from '@/lib/firebase';

export default function AdminLoginPage() {
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Please enter your credentials.' });
        return;
    }

    const db = getDatabase(app);
    const adminsRef = ref(db, 'admins');
    const adminQuery = query(adminsRef, orderByChild('email'), equalTo(email));

    try {
        const snapshot = await get(adminQuery);
        if (snapshot.exists()) {
            let adminData: any = null;
            let adminKey: string | null = null;
            snapshot.forEach((childSnapshot) => {
                // The key is the unique ID for the admin record
                adminKey = childSnapshot.key;
                adminData = childSnapshot.val();
            });
            
            if (adminData && adminData.password === password) {
                 if (adminData.status === 'Banned') {
                    toast({ variant: 'destructive', title: 'Login Failed', description: 'Your account has been suspended.' });
                    return;
                }
                localStorage.setItem('currentAdmin', JSON.stringify({ ...adminData, id: adminKey }));
                toast({ title: 'Login Successful', description: 'Welcome to the Admin Panel.' });
                router.push('/admin/dashboard');
            } else {
                toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid credentials. Please try again.' });
            }
        } else {
            toast({ variant: 'destructive', title: 'Login Failed', description: 'Administrator not found.' });
        }
    } catch (error: any) {
        console.error("Admin login error:", error);
        toast({ variant: 'destructive', title: 'Login Error', description: error.message || 'An error occurred during login.' });
    }
  };

  return (
    <AlertDialog open={forgotPasswordStep > 0} onOpenChange={(open) => !open && setForgotPasswordStep(0)}>
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                  <Shield className="h-12 w-12 text-primary"/>
              </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <AlertDialogTrigger asChild>
                    <Button variant="link" className="ml-auto inline-block text-sm underline h-auto p-0" onClick={() => setForgotPasswordStep(1)}>
                      Forgot your password?
                    </Button>
                  </AlertDialogTrigger>
                </div>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              
              <Button type="submit" className="w-full">Login</Button>
              
              <Link href="/owner/login" className="w-full">
                  <Button variant="outline" className="w-full">Owner Panel Login</Button>
              </Link>
            </form>
            <div className="mt-4 text-center text-sm">
              <Link href="/" className="underline">
                Back to Game
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

       <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Reset Password</AlertDialogTitle>
            </AlertDialogHeader>
            {forgotPasswordStep === 1 && (
                <>
                <AlertDialogDescription>
                    Enter your email address and we'll send you a 4-digit code to reset your password.
                </AlertDialogDescription>
                <div className="grid gap-2 py-4">
                   <Label htmlFor="reset-email">Email</Label>
                   <Input id="reset-email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setForgotPasswordStep(0)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setForgotPasswordStep(2)}>Send Code</AlertDialogAction>
                </AlertDialogFooter>
                </>
            )}
             {forgotPasswordStep === 2 && (
                <>
                <AlertDialogDescription>
                    We've sent a code to <span className="font-bold">{email}</span>. Please enter it below to verify your account.
                </AlertDialogDescription>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reset-code">Verification Code</Label>
                        <Input id="reset-code" placeholder="_ _ _ _" />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                </div>
                <AlertDialogFooter>
                    <Button variant="link" onClick={() => setForgotPasswordStep(1)}>Back</Button>
                    <AlertDialogAction onClick={() => setForgotPasswordStep(0)}>Reset Password</AlertDialogAction>
                </AlertDialogFooter>
                </>
            )}
        </AlertDialogContent>
    </AlertDialog>
  )
}
