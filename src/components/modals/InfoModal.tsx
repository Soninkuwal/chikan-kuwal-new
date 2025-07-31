'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area";

type ModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  children: React.ReactNode;
};

export function InfoModal({ isOpen, onOpenChange, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-primary/50">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{title}</DialogTitle>
        </DialogHeader>
         <div className="text-muted-foreground max-h-[60vh] overflow-y-auto pr-2">
           {children}
         </div>
      </DialogContent>
    </Dialog>
  );
}
