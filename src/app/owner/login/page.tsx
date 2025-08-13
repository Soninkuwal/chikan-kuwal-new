
'use client';
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Crown } from 'lucide-react'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function OwnerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be an API call. For now, we use a mock owner.
    const ownerUser = { email: 'sonickuwal@gmail.com', password: 'kuwal@1998' };

    if (email === ownerUser.email && password === ownerUser.password) {
      localStorage.setItem('currentOwner', JSON.stringify({ name: 'Owner', email: ownerUser.email }));
      toast({
        title: 'Login Successful',
        description: 'Welcome to the Owner Panel.',
      });
      router.push('/owner/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Crown className="h-12 w-12 text-primary"/>
            </div>
          <CardTitle className="text-2xl text-primary">Owner Login</CardTitle>
          <CardDescription>Enter your credentials to access the owner panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="owner@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-base font-bold">Login</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline text-muted-foreground hover:text-primary">
              Back to Game
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
