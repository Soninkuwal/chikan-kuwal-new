
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Wallet, Users, List, Landmark } from "lucide-react"
import { WithdrawModal } from '@/components/modals/WithdrawModal';

export default function AdminDashboard() {
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-card">
              <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg text-primary">
                      <Wallet className="h-6 w-6" />
                      Admin Wallet
                  </CardTitle>
                  <CardDescription>Total fees collected. A 2% fee is sent to the owner on withdrawal from this wallet.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="text-4xl font-bold">₹1250.50</div>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-base h-12" onClick={() => setWithdrawModalOpen(true)}>
                      <Landmark className="mr-2 h-5 w-5" />
                      Withdraw Funds
                  </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg text-primary">
                      <Users className="h-6 w-6" />
                      Total Users
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-5xl font-bold">5</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg text-primary">
                      <List className="h-6 w-6" />
                      Total Transactions
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-5xl font-bold">6</div>
              </CardContent>
            </Card>
        </div>
      </div>
      <WithdrawModal isOpen={isWithdrawModalOpen} onOpenChange={setWithdrawModalOpen} feeType="none" />
    </>
  )
}
