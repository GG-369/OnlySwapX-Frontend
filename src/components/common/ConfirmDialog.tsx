import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  variant?: 'destructive' | 'default';
}

export default function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, variant = 'destructive' }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${variant === 'destructive' ? 'text-red-400' : 'text-gold'}`} />
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-muted-foreground">
            Cancel
          </Button>
          <Button
            onClick={() => { onConfirm(); onOpenChange(false); }}
            className={variant === 'destructive' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gold text-navy hover:bg-gold-light'}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
