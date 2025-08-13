
'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Download, Upload, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { getDatabase, ref, push, set } from "firebase/database"
import { app } from "@/lib/firebase"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

type ModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  settings: any;
};

export function DepositModal({ isOpen, onOpenChange, settings }: ModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upi');
  const [upiAmount, setUpiAmount] = useState('');
  const [upiUtr, setUpiUtr] = useState('');
  const [upiScreenshot, setUpiScreenshot] = useState<File | null>(null);
  const [bankAmount, setBankAmount] = useState('');
  const [bankUtr, setBankUtr] = useState('');
  const [bankScreenshot, setBankScreenshot] = useState<File | null>(null);

  const minDeposit = settings?.minDeposit || '200';
  const maxDeposit = settings?.maxDeposit || '2000';
  const upiId = settings?.upiId;
  const upiIdLarge = settings?.upiIdLarge;
  const qrCode = settings?.qrCode;
  const qrCodeLarge = settings?.qrCodeLarge;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied to Clipboard",
        description: `${field} has been copied.`
    })
  }

  const handleDownloadQR = async (url: string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', 'payment-qr-code.png');
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: 'Could not download the QR code. Please try again.'
        });
    }
  }

  const handleSubmit = () => {
    const isUpi = activeTab === 'upi';
    const amountStr = isUpi ? upiAmount : bankAmount;
    const amount = parseFloat(amountStr);
    const utr = isUpi ? upiUtr : bankUtr;
    const screenshot = isUpi ? upiScreenshot : bankScreenshot;
    const currentUserStr = localStorage.getItem('currentUser');
    
    if (amount < parseFloat(minDeposit)) {
        toast({ variant: 'destructive', title: 'Deposit Too Low', description: `The minimum deposit amount is ₹${minDeposit}.`});
        return;
    }
     if (amount > parseFloat(maxDeposit)) {
        toast({ variant: 'destructive', title: 'Deposit Too High', description: `The maximum deposit amount is ₹${maxDeposit}.`});
        return;
    }

    if (!currentUserStr) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to make a deposit.' });
      return;
    }

    if (!amount || !utr || !screenshot) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Information',
        description: 'Please fill out all fields and upload a screenshot before submitting.',
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
        const screenshotDataUrl = reader.result as string;
        const currentUser = JSON.parse(currentUserStr);

        const newRequest = {
            userId: currentUser.id,
            user: currentUser.name,
            amount: `₹${amount}`,
            utr: utr,
            screenshot: screenshotDataUrl,
            date: new Date().toISOString(),
        };

        const db = getDatabase(app);
        const requestsRef = ref(db, 'depositRequests');
        const newRequestRef = push(requestsRef);
        set(newRequestRef, newRequest)
          .then(() => {
            toast({
              title: 'Request Submitted',
              description: 'Your deposit request has been sent for admin approval.',
            });
            onOpenChange(false);
          })
          .catch((error) => {
            console.error("Firebase write failed:", error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not submit your request. Please try again.'});
          });
    }
    reader.readAsDataURL(screenshot);
  }
  
  const numericUpiAmount = parseFloat(upiAmount) || 0;
  const maxDepositThreshold = parseFloat(maxDeposit) / 2; // Example threshold

  const currentUpiId = numericUpiAmount > maxDepositThreshold && upiIdLarge ? upiIdLarge : upiId;
  const currentQrCode = numericUpiAmount > maxDepositThreshold && qrCodeLarge ? qrCodeLarge : qrCode;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-primary/50">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Deposit Funds</DialogTitle>
          <DialogDescription>
            Choose your preferred method to add funds to your wallet.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
            <Tabs defaultValue="upi" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upi">UPI</TabsTrigger>
                <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
            </TabsList>
            
            {/* UPI Tab */}
            <TabsContent value="upi" className="space-y-4 pt-4">
                 <Alert>
                    <AlertTitle>Deposit Limits</AlertTitle>
                    <AlertDescription>
                        Minimum: ₹{minDeposit} | Maximum: ₹{maxDeposit}
                    </AlertDescription>
                </Alert>
                <div className="space-y-2">
                <Label htmlFor="upi-amount">Amount</Label>
                <Input id="upi-amount" placeholder="Enter amount" type="number" value={upiAmount} onChange={(e) => setUpiAmount(e.target.value)} />
                </div>
                
                {currentUpiId ? (
                     <div className="space-y-2 text-center p-4 bg-secondary rounded-lg">
                        <Label>{numericUpiAmount > maxDepositThreshold ? `For amounts over ₹${maxDepositThreshold}, please use this UPI ID:` : 'Scan the QR or use the UPI ID below.'}</Label>
                         <div className="flex items-center gap-2">
                            <p className="flex-1 font-mono text-base p-2 bg-background rounded-md">{currentUpiId}</p>
                            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(currentUpiId, 'UPI ID')}>
                                <Copy className="h-4 w-4"/>
                            </Button>
                        </div>
                        {currentQrCode && (
                            <div className="flex flex-col items-center gap-2 pt-2">
                                <Image src={currentQrCode} data-ai-hint="QR code" alt="Payment QR Code" width={200} height={200} className="rounded-lg border-4 border-primary" />
                                <Button variant="outline" size="sm" onClick={() => handleDownloadQR(currentQrCode)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download QR
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Alert variant="destructive">
                        <AlertTitle>Payment Method Unavailable</AlertTitle>
                        <AlertDescription>
                            The administrator has not configured UPI payments yet. Please try again later or contact support.
                        </AlertDescription>
                    </Alert>
                )}
               
                <div className="space-y-2">
                <Label htmlFor="upi-utr">UTR Number</Label>
                <Input id="upi-utr" placeholder="Enter 12-digit UTR number" value={upiUtr} onChange={(e) => setUpiUtr(e.target.value)} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="upi-screenshot">Payment Screenshot</Label>
                <Input id="upi-screenshot" type="file" onChange={(e) => setUpiScreenshot(e.target.files?.[0] || null)} />
                </div>
            </TabsContent>
            
            {/* Bank Tab */}
            <TabsContent value="bank" className="space-y-4 pt-4">
                 <Alert>
                    <AlertTitle>Deposit Limits</AlertTitle>
                    <AlertDescription>
                        Minimum: ₹{minDeposit} | Maximum: ₹{maxDeposit}
                    </AlertDescription>
                </Alert>
                <div className="space-y-2">
                <Label htmlFor="bank-amount">Amount</Label>
                <Input id="bank-amount" placeholder="Enter amount" type="number" value={bankAmount} onChange={(e) => setBankAmount(e.target.value)} />
                </div>
                <div className="p-4 bg-secondary rounded-md space-y-3 text-sm">
                    <div className="flex justify-between items-center"><span className="text-muted-foreground">Account Name:</span> <span className="font-bold">Admin Name</span></div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Account No:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold">1234567890</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard('1234567890', 'Account Number')}>
                                <Copy className="h-3 w-3"/>
                            </Button>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">IFSC Code:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-bold">BANK0001234</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard('BANK0001234', 'IFSC Code')}>
                                <Copy className="h-3 w-3"/>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="bank-utr">Transaction ID</Label>
                <Input id="bank-utr" placeholder="Enter transaction reference number" value={bankUtr} onChange={(e) => setBankUtr(e.target.value)} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="bank-screenshot">Payment Screenshot</Label>
                <Input id="bank-screenshot" type="file" onChange={(e) => setBankScreenshot(e.target.files?.[0] || null)} />
                </div>
            </TabsContent>
            </Tabs>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg" onClick={handleSubmit}>
            I have sent the payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
