
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel
} from "@/components/ui/alert-dialog"
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';
import { app } from '@/lib/firebase';
import { getDatabase, ref, update, get, onValue, off, remove } from "firebase/database";

type KycRequest = { 
    id: string; // This will be the Firebase key
    userId: string;
    user: string;
    documentType: string;
    documentNumber: string;
    documentImage: string;
    date: string;
    createdAt: number;
};

export default function OwnerKycRequestsPage() {
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [autoApproveTime, setAutoApproveTime] = useState(5 * 60 * 1000); // default 5 minutes
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setAutoApproveTime(parseInt(settings.kycAutoApproveTime, 10) * 60 * 1000);
    }
  }, []);

  const handleAction = async (request: KycRequest, status: 'approved' | 'rejected') => {
    const db = getDatabase(app);
    const requestRef = ref(db, `kycRequests/${request.id}`);
    
    await remove(requestRef);

    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
        let userToUpdate: any = null;
        let userKey: string | null = null;
        snapshot.forEach((childSnapshot) => {
            const userData = childSnapshot.val();
            // In case the user document key is not the user's ID
            if (userData.id === request.userId) {
                userToUpdate = userData;
                userKey = childSnapshot.key;
            }
        });

        if (userToUpdate && userKey) {
            const newKycStatus = status === 'approved' ? 'Verified' : 'Rejected';
            await update(ref(db, `users/${userKey}`), { kycStatus: newKycStatus });
            
            toast({ 
                title: `KYC ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                description: `${request.user}'s KYC status has been updated.`
            });
        } else {
             toast({ 
                variant: 'destructive',
                title: 'Update Failed',
                description: `User with ID ${request.userId} not found.`
             });
        }
    }
  };

  useEffect(() => {
    const db = getDatabase(app);
    const requestsRef = ref(db, 'kycRequests');

    const listener = onValue(requestsRef, (snapshot) => {
        const data = snapshot.val();
        const now = Date.now();
        const requestList: KycRequest[] = [];
        
        if (data) {
            Object.keys(data).forEach(key => {
                const req = { id: key, ...data[key] };
                 if (now - req.createdAt > autoApproveTime) {
                    handleAction(req, 'approved');
                } else {
                    requestList.push(req);
                }
            });
            setRequests(requestList);
        } else {
            setRequests([]);
        }
    });

    return () => {
        off(requestsRef, 'value', listener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoApproveTime]);

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">KYC Requests</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Review and approve or reject user KYC submissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Document Number</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.user}</TableCell>
                    <TableCell>{req.documentType}</TableCell>
                    <TableCell>{req.documentNumber}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedImage(req.documentImage)}>View</Button>
                    </TableCell>
                    <TableCell>{req.date}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600 hover:bg-green-500/10" onClick={() => handleAction(req, 'approved')}>
                          <Check className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleAction(req, 'rejected')}>
                          <X className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No pending KYC requests.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>KYC Document</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Review the document to verify the user's details.
          </AlertDialogDescription>
          {selectedImage && (
            <div className="relative h-96">
                <Image src={selectedImage} data-ai-hint="document identification" alt="KYC Document" layout="fill" objectFit="contain" />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedImage(null)}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
