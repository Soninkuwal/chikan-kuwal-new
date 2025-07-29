
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

  const getInitialUsers = () => {
    if (typeof window === 'undefined') return [];
    let users = localStorage.getItem('users');
    if (!users) {
        const initialUsers = [
            { name: 'John Doe', email: 'john@example.com', mobile: '9876543210', password: 'password', wallet: 500, avatar: '', transactionHistory: [], betHistory: [] },
            { name: 'Jane Smith', email: 'jane@example.com', mobile: '9876543211', password: 'password', wallet: 120, avatar: '', transactionHistory: [], betHistory: [] },
        ];
        localStorage.setItem('users', JSON.stringify(initialUsers));
        users = JSON.stringify(initialUsers);
    }
    return JSON.parse(users);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getInitialUsers();
    const emailExists = users.some((user: any) => user.email === signupEmail);
    const mobileExists = users.some((user: any) => user.mobile === signupMobile);

    if (emailExists) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'A user with this email already exists.',
      });
      return;
    }
     if (mobileExists) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'A user with this mobile number already exists.',
      });
      return;
    }

    const newUser = { 
        name, 
        email: signupEmail, 
        mobile: signupMobile, 
        password: signupPassword, 
        wallet: 300, 
        avatar: '',
        transactionHistory: [],
        betHistory: [],
    };
    const updatedUsers = [...users, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    toast({
      title: 'Registration Successful',
      description: 'Welcome! You have been logged in.',
    });
    router.push('/');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getInitialUsers();
    const user = users.find((user: any) => 
        (user.email === loginIdentifier || user.mobile === loginIdentifier) && 
        user.password === loginPassword
    );

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
      });
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
