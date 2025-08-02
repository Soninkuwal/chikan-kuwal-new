
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck } from 'lucide-react';
import { app } from '@/lib/firebase';
import { getDatabase, ref, set, get, query, orderByChild, equalTo, push } from "firebase/database";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const db = getDatabase(app);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !signupEmail || !signupMobile || !signupPassword) {
        toast({ variant: 'destructive', title: 'Registration Failed', description: 'Please fill all required fields.' });
        return;
    }

    try {
        const usersRef = ref(db, 'users');
        const newUserRef = push(usersRef);
        const userId = newUserRef.key;

        const newUser = { 
            id: userId,
            name, 
            email: signupEmail, 
            mobile: signupMobile, 
            password: signupPassword, // In a real app, this should be hashed.
            referralCode: referralCode || '',
            wallet: 300, 
            avatar: '',
            transactionHistory: {},
            betHistory: {},
            createdAt: new Date().toISOString(),
            status: 'Active',
            role: 'Player',
            kycStatus: 'Not Verified',
        };

        await set(newUserRef, newUser);
        
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        toast({ title: 'Registration Successful', description: 'Welcome! Please complete KYC to access all features.' });
        router.push('/');

    } catch (error: any) {
        console.error("Sign up error:", error);
        toast({ variant: 'destructive', title: 'Registration Error', description: error.message || 'An error occurred. Please ensure your database permissions are set correctly.' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'Please enter your credentials.' });
        return;
    }

    try {
        const dbRef = ref(db, 'users');
        const isEmail = loginIdentifier.includes('@');
        const userQuery = isEmail 
            ? query(dbRef, orderByChild('email'), equalTo(loginIdentifier))
            : query(dbRef, orderByChild('mobile'), equalTo(loginIdentifier));
        
        const snapshot = await get(userQuery);

        if (snapshot.exists()) {
            let user: any = null;
            snapshot.forEach((childSnapshot) => {
                if (!user) {
                  user = childSnapshot.val();
                }
            });

            if (user && user.password === loginPassword) {
                if (user.status === 'Banned') {
                    toast({ variant: 'destructive', title: 'Login Failed', description: 'Your account has been suspended.' });
                    return;
                }
                localStorage.setItem('currentUser', JSON.stringify(user));
                toast({ title: 'Login Successful', description: 'Welcome back!' });
                router.push('/');
            } else {
                toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid credentials. Please try again.' });
            }
        } else {
            toast({ variant: 'destructive', title: 'Login Failed', description: 'User not found.' });
        }
    } catch (error: any) {
        console.error("Login error:", error);
        toast({ variant: 'destructive', title: 'Login Error', description: error.message || 'An error occurred. Please ensure database permissions and indexes are set correctly.' });
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Tabs defaultValue="login" className="w-full max-w-sm">
        <Card>
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <ShieldCheck className="h-12 w-12 text-primary"/>
                </div>
                <CardTitle className="text-2xl">Welcome</CardTitle>
                <CardDescription>Login or create an account to play.</CardDescription>
                <TabsList className="grid w-full grid-cols-2 mt-4">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
            </CardHeader>
            <TabsContent value="login">
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="login-identifier">Email or Mobile Number</Label>
                            <Input id="login-identifier" type="text" placeholder="your@email.com or Mobile Number" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="login-password">Password</Label>
                            <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full">Login</Button>
                    </CardContent>
                </form>
            </TabsContent>
            <TabsContent value="signup">
                <form onSubmit={handleSignUp}>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="signup-name">Name</Label>
                            <Input id="signup-name" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <Input id="signup-email" type="email" placeholder="user@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="signup-mobile">Mobile Number</Label>
                            <Input id="signup-mobile" type="tel" placeholder="Mobile Number" value={signupMobile} onChange={(e) => setSignupMobile(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="referral">Referral Code (Optional)</Label>
                            <Input id="referral" placeholder="Enter referral code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full">Sign Up</Button>
                    </CardContent>
                </form>
            </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
