
'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, ref, get } from "firebase/database";
import { app } from "@/lib/firebase";


type ModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  feeType?: 'user' | 'owner' | 'none';
};

export function WithdrawModal({ isOpen, onOpenChange, feeType = 'user' }: ModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upi');
  const [amount, setAmount] = useState<number | string>('');
  const [fee, setFee] = useState(0);
  const [withdrawalInfo, setWithdrawalInfo] = useState('');
  const [isGateActive, setIsGateActive] = useState(false);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // UPI fields
  const [upiId, setUpiId] = useState('');

  // Bank fields
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  useEffect(() => {
    async function fetchSettingsAndUserData() {
      if (isOpen) {
        setIsLoading(true);
        const savedSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');

        // Fee and Info settings
        if (feeType === 'user') {
            setFee(Number(savedSettings.withdrawalFee) || 10);
            setWithdrawalInfo(savedSettings.withdrawalInfo || 'The initial demo amount is not withdrawable. Withdrawals are subject to admin approval. A {fee}% processing fee will be applied to your winnings. You can only make one withdrawal every 24 hours.');
        } else if (feeType === 'owner') {
            setFee(Number(savedSettings.ownerFee) || 2);
        } else {
            setFee(0);
        }

        // Withdrawal Gate settings
        setIsGateActive(savedSettings.withdrawalGate || false);

        // Fetch user's total deposits
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser && currentUser.id) {
          const db = getDatabase(app);
          const transactionsRef = ref(db, `users/${currentUser.id}/transactionHistory`);
          const snapshot = await get(transactionsRef);
          if (snapshot.exists()) {
            const transactions = Object.values(snapshot.val()) as any[];
            const depositSum = transactions
              .filter(tx => tx.type === 'Deposit' && tx.status === 'Completed')
              .reduce((sum, tx) => sum + tx.amount, 0);
            setTotalDeposits(depositSum);
          }
        }
        setIsLoading(false);
      }
    }
    fetchSettingsAndUserData();
  }, [isOpen, feeType]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  }

  const handleSubmit = () => {
    const isUpi = activeTab === 'upi';
    const numericAmount = Number(amount);

    if (isGateActive && totalDeposits < 2000) {
        toast({ variant: 'destructive', title: 'Withdrawal Locked', description: 'You must deposit a total of ₹2000 to unlock withdrawals.' });
        return;
    }
    
    if (!numericAmount || numericAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to withdraw.' });
      return;
    }

    if (isUpi && !upiId) {
      toast({ variant: 'destructive', title: 'Incomplete Information', description: 'Please enter your UPI ID.' });
      return;
    }

    if (!isUpi && (!accountName || !accountNumber || !ifscCode)) {
      toast({ variant: 'destructive', title: 'Incomplete Information', description: 'Please fill out all bank details.' });
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.wallet < numericAmount) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'You do not have enough funds to make this withdrawal.' });
      return;
    }

    // Deduct from wallet immediately
    const updatedUser = { ...currentUser, wallet: currentUser.wallet - numericAmount };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    window.dispatchEvent(new StorageEvent('storage', { key: 'users' }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'currentUser' }));


    const newRequest = {
        id: `WDR${Date.now()}`,
        userId: currentUser.email,
        user: currentUser.name,
        amount: `₹${numericAmount.toFixed(2)}`,
        method: isUpi ? `UPI (${upiId})` : `Bank Transfer`,
        date: new Date().toLocaleString(),
    };

    const existingRequests = JSON.parse(localStorage.getItem('withdrawalRequests') || '[]');
    const updatedRequests = [...existingRequests, newRequest];
    localStorage.setItem('withdrawalRequests', JSON.stringify(updatedRequests));
    window.dispatchEvent(new StorageEvent('storage', { key: 'withdrawalRequests' }));

    toast({
      title: 'Request Submitted',
      description: 'Your withdrawal request has been sent for admin approval.',
    });
    onOpenChange(false);
  }

  const numericAmount = Number(amount);
  const feeAmount = numericAmount * (fee / 100);
  const receivedAmount = numericAmount - feeAmount;
  const isWithdrawalLocked = isGateActive && totalDeposits < 2000;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-primary/50">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Request Withdrawal</DialogTitle>
          <DialogDescription>
            Enter the amount you wish to withdraw from your wallet.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
            <div className="space-y-4">
                {isLoading ? <p>Loading withdrawal rules...</p> : (
                    <>
                        {isWithdrawalLocked && feeType === 'user' && (
                             <Alert variant="destructive">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Withdrawal Locked</AlertTitle>
                                <AlertDescription>
                                    You have deposited ₹{totalDeposits.toFixed(2)} out of ₹2000. Please deposit ₹{(2000 - totalDeposits).toFixed(2)} more to unlock withdrawal requests.
                                </AlertDescription>
                            </Alert>
                        )}
                        {feeType === 'user' && !isWithdrawalLocked && (
                            <Alert className="border-primary/50 text-primary [&>svg]:text-primary whitespace-pre-wrap">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Please Note</AlertTitle>
                                <AlertDescription>
                                {withdrawalInfo.replace('{fee}', String(fee))}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="withdraw-amount">Amount</Label>
                            <Input id="withdraw-amount" placeholder="Enter amount" type="number" value={amount} onChange={handleAmountChange} disabled={isWithdrawalLocked} />
                        </div>
                        {numericAmount > 0 && fee > 0 && (
                            <div className="p-3 bg-secondary rounded-md text-sm space-y-2">
                                <div className="flex justify-between"><span>Processing Fee ({fee}%):</span> <span className="font-medium">- ₹{ feeAmount.toFixed(2) }</span></div>
                                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-border"><span>You will receive:</span> <span>₹{ receivedAmount.toFixed(2) }</span></div>
                            </div>
                        )}

                        <Tabs defaultValue="upi" className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upi">UPI</TabsTrigger>
                                <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upi" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="withdraw-upi">Your UPI ID</Label>
                                    <Input id="withdraw-upi" placeholder="Enter your UPI ID" value={upiId} onChange={e => setUpiId(e.target.value)} disabled={isWithdrawalLocked}/>
                                </div>
                            </TabsContent>
                            <TabsContent value="bank" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="withdraw-name">Your Account Holder Name</Label>
                                    <Input id="withdraw-name" placeholder="Enter account holder name" value={accountName} onChange={e => setAccountName(e.target.value)} disabled={isWithdrawalLocked} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="withdraw-account">Your Account Number</Label>
                                    <Input id="withdraw-account" placeholder="Enter your account number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} disabled={isWithdrawalLocked}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="withdraw-ifsc">Your IFSC Code</Label>
                                    <Input id="withdraw-ifsc" placeholder="Enter your IFSC code" value={ifscCode} onChange={e => setIfscCode(e.target.value)} disabled={isWithdrawalLocked}/>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg" onClick={handleSubmit} disabled={isWithdrawalLocked || isLoading}>
            Request Withdrawal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
