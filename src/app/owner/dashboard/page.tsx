
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { DollarSign, Shield, Users, Landmark } from "lucide-react"
import { WithdrawModal } from '@/components/modals/WithdrawModal';

export default function OwnerDashboard() {
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-card border-primary/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/20 rounded-md">
                        <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    Owner Wallet
                </CardTitle>
                <CardDescription>Total lifetime revenue of the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-primary">₹12,50,550</div>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base h-12" onClick={() => setWithdrawModalOpen(true)}>
                    <Landmark className="mr-2 h-5 w-5" />
                    Withdraw Funds
                </Button>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/20 rounded-md">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    Total Admins
                </CardTitle>
                <CardDescription>Number of active administrators.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-5xl font-bold">1</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-primary/20 rounded-md">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    Total Users
                </CardTitle>
                <CardDescription>Total registered users on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-5xl font-bold">5</div>
            </CardContent>
            </Card>
        </div>
      </main>
      <WithdrawModal isOpen={isWithdrawModalOpen} onOpenChange={setWithdrawModalOpen} feeType="owner" />
    </div>
  )
}
