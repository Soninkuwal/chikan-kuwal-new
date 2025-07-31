
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
import { Info, ShieldAlert } from "lucide-react"
import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getDatabase, ref, update, onValue, set, push } from "firebase/database";
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
  const [settings, setSettings] = useState({
      withdrawalFee: '10',
      ownerFee: '2',
      minWithdraw: '500',
      maxWithdraw: '10000',
      withdrawalInfo: 'The initial demo amount is not withdrawable. Withdrawals are subject to admin approval. A {fee}% processing fee will be applied to your winnings. You can only make one withdrawal every 24 hours.'
  });
  const [kycStatus, setKycStatus] = useState('Not Verified');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // UPI fields
  const [upiId, setUpiId] = useState('');

  // Bank fields
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  useEffect(() => {
    let unsubscribe = () => {};
    if (isOpen) {
      const savedSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
      setSettings(prev => ({...prev, ...savedSettings}));

      const localUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (localUser.id) {
          const db = getDatabase(app);
          const userRef = ref(db, `users/${localUser.id}`);

          unsubscribe = onValue(userRef, (snapshot) => {
              if (snapshot.exists()) {
                  const dbUser = snapshot.val();
                  setKycStatus(dbUser.kycStatus || 'Not Verified');
                  setCurrentUser(dbUser); // Keep user data fresh
              }
          });
      }
    }
    return () => unsubscribe();
  }, [isOpen]);


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  }

  const handleSubmit = async () => {
    if (kycStatus !== 'Verified') {
        toast({ variant: 'destructive', title: 'KYC Not Verified', description: 'Please complete your KYC verification to enable withdrawals.' });
        return;
    }
    
    const isUpi = activeTab === 'upi';
    const numericAmount = Number(amount);
    
    if (!numericAmount || numericAmount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to withdraw.' });
      return;
    }

     if (numericAmount < Number(settings.minWithdraw) || numericAmount > Number(settings.maxWithdraw)) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: `Withdrawal amount must be between ₹${settings.minWithdraw} and ₹${settings.maxWithdraw}.` });
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

    if (!currentUser || currentUser.wallet < numericAmount) {
      toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'You do not have enough funds to make this withdrawal.' });
      return;
    }

    // Deduct from wallet immediately
    const newWalletBalance = currentUser.wallet - numericAmount;
    const db = getDatabase(app);
    await update(ref(db, `users/${currentUser.id}`), { wallet: newWalletBalance });

    const newRequest = {
        userId: currentUser.id,
        user: currentUser.name,
        amount: `₹${numericAmount.toFixed(2)}`,
        method: isUpi ? `UPI (${upiId})` : `Bank Transfer: Name: ${accountName}, Acct: ${accountNumber}, IFSC: ${ifscCode}`,
        date: new Date().toLocaleString(),
    };

    const requestsRef = ref(db, 'withdrawalRequests');
    const newRequestRef = push(requestsRef);
    await set(newRequestRef, newRequest);

    toast({
      title: 'Request Submitted',
      description: 'Your withdrawal request has been sent for admin approval.',
    });
    onOpenChange(false);
  }

  const numericAmount = Number(amount);
  const feePercent = feeType === 'owner' ? Number(settings.ownerFee) : Number(settings.withdrawalFee);
  const feeAmount = numericAmount * (feePercent / 100);
  const receivedAmount = numericAmount - feeAmount;

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
                {kycStatus !== 'Verified' ? (
                     <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4"/>
                        <AlertTitle>Withdrawals Locked</AlertTitle>
                        <AlertDescription>
                            Your account must be KYC verified before you can make a withdrawal. Please go to the menu and complete the KYC process.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <>
                        {feeType === 'user' && (
                        <Alert className="border-primary/50 text-primary [&>svg]:text-primary whitespace-pre-wrap">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Please Note</AlertTitle>
                            <AlertDescription>
                            {settings.withdrawalInfo.replace('{fee}', String(settings.withdrawalFee))}
                            </AlertDescription>
                        </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="withdraw-amount">Amount (₹{settings.minWithdraw} - ₹{settings.maxWithdraw})</Label>
                            <Input id="withdraw-amount" placeholder="Enter amount" type="number" value={amount} onChange={handleAmountChange} />
                        </div>
                        {numericAmount > 0 && feePercent > 0 && (
                            <div className="p-3 bg-secondary rounded-md text-sm space-y-2">
                                <div className="flex justify-between"><span>Processing Fee ({feePercent}%):</span> <span className="font-medium">- ₹{ feeAmount.toFixed(2) }</span></div>
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
                                    <Input id="withdraw-upi" placeholder="Enter your UPI ID" value={upiId} onChange={e => setUpiId(e.target.value)} />
                                </div>
                            </TabsContent>
                            <TabsContent value="bank" className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="withdraw-name">Your Account Holder Name</Label>
                                    <Input id="withdraw-name" placeholder="Enter account holder name" value={accountName} onChange={e => setAccountName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="withdraw-account">Your Account Number</Label>
                                    <Input id="withdraw-account" placeholder="Enter your account number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="withdraw-ifsc">Your IFSC Code</Label>
                                    <Input id="withdraw-ifsc" placeholder="Enter your IFSC code" value={ifscCode} onChange={e => setIfscCode(e.target.value)}/>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg" 
            onClick={handleSubmit}
            disabled={kycStatus !== 'Verified'}
          >
            Request Withdrawal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
