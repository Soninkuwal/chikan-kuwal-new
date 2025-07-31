
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
import { useState, useEffect } from "react"
import { getDatabase, ref, push, set } from "firebase/database"
import { app } from "@/lib/firebase"


type ModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const defaultSettings = {
    upiId: 'admin@upi',
    upiIdLarge: 'admin-large@upi',
};

export function DepositModal({ isOpen, onOpenChange }: ModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upi');
  const [upiAmount, setUpiAmount] = useState('');
  const [upiUtr, setUpiUtr] = useState('');
  const [upiScreenshot, setUpiScreenshot] = useState<File | null>(null);
  const [bankAmount, setBankAmount] = useState('');
  const [bankUtr, setBankUtr] = useState('');
  const [bankScreenshot, setBankScreenshot] = useState<File | null>(null);
  const [settings, setSettings] = useState(defaultSettings);

  const qrCodeUrl = `https://placehold.co/200x200.png?text=${settings.upiId}`;
  const qrCodeUrlLarge = `https://placehold.co/200x200.png?text=${settings.upiIdLarge}`;

  useEffect(() => {
    if (isOpen) {
      const savedSettings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
      setSettings(prev => ({...prev, ...savedSettings}));
    }
  }, [isOpen]);


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
        link.setAttribute('download', 'admin-qr-code.png');
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
    const amount = isUpi ? upiAmount : bankAmount;
    const utr = isUpi ? upiUtr : bankUtr;
    const screenshot = isUpi ? upiScreenshot : bankScreenshot;
    const currentUserStr = localStorage.getItem('currentUser');

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
            date: new Date().toLocaleString(),
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
                <div className="space-y-2">
                <Label htmlFor="upi-amount">Amount (Min. ₹200)</Label>
                <Input id="upi-amount" placeholder="Enter amount" type="number" value={upiAmount} onChange={(e) => setUpiAmount(e.target.value)} />
                </div>
                
                {numericUpiAmount > 2000 ? (
                    <div className="space-y-2 text-center p-4 bg-secondary rounded-lg">
                        <Label>For amounts over ₹2000, please use this UPI ID:</Label>
                         <div className="flex items-center gap-2">
                            <p className="flex-1 font-mono text-base p-2 bg-background rounded-md">{settings.upiIdLarge}</p>
                            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(settings.upiIdLarge, 'UPI ID')}>
                                <Copy className="h-4 w-4"/>
                            </Button>
                        </div>
                        <div className="flex flex-col items-center gap-2 pt-2">
                            <Image src={qrCodeUrlLarge} data-ai-hint="QR code" alt="Large Amount QR Code" width={200} height={200} className="rounded-lg border-4 border-primary" />
                            <Button variant="outline" size="sm" onClick={() => handleDownloadQR(qrCodeUrlLarge)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download QR
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2 text-center">
                            <Label>Scan the QR or use the UPI ID below.</Label>
                            <div className="flex items-center gap-2">
                                <p className="flex-1 font-mono text-base p-2 bg-secondary rounded-md">{settings.upiId}</p>
                                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(settings.upiId, 'UPI ID')}>
                                    <Copy className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Image src={qrCodeUrl} data-ai-hint="QR code" alt="QR Code" width={200} height={200} className="rounded-lg border-4 border-primary" />
                            <Button variant="outline" size="sm" onClick={() => handleDownloadQR(qrCodeUrl)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download QR
                            </Button>
                        </div>
                    </>
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
                <div className="space-y-2">
                <Label htmlFor="bank-amount">Amount (Min. ₹200)</Label>
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
