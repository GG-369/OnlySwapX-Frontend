import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { exchangeService } from '@/services/exchangeService';
import { useAuth } from '@/context/AuthContext';
import type { SkillDetailResponse } from '@/types';
import { ArrowLeftRight, BookOpen, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface ExchangeCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetSkill: SkillDetailResponse | null;
  onCreated?: () => void;
}

export default function ExchangeCreateDialog({ open, onOpenChange, targetSkill, onCreated }: ExchangeCreateDialogProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!targetSkill) return null;

  const isOffer = targetSkill.skillType === 'OFFER';
  const isSelf = targetSkill.userId === user?.id;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await exchangeService.create({
        receiverId: targetSkill.userId,
        skillId: targetSkill.id,
        message: message.trim() || undefined,
      });
      toast.success('Exchange proposed!');
      setMessage('');
      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Failed to propose exchange';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-gold" />
            Propose Exchange
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-border/50 bg-navy/50 p-4">
            <p className="text-xs text-muted-foreground mb-2">You're requesting</p>
            <div className="flex items-center gap-2">
              {isOffer ? (
                <BookOpen className="h-4 w-4 text-emerald-400" />
              ) : (
                <Lightbulb className="h-4 w-4 text-blue-400" />
              )}
              <div>
                <p className="font-medium text-foreground">{targetSkill.name}</p>
                <p className="text-xs text-muted-foreground">from {targetSkill.userName}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Message (optional)</label>
            <Textarea
              placeholder="Introduce yourself and explain what you'd like to swap..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-navy border-border focus:border-gold"
              rows={3}
            />
          </div>

          {isSelf && (
            <p className="text-xs text-destructive">You cannot exchange with yourself</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-muted-foreground">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || isSelf} className="bg-gold text-navy hover:bg-gold-light">
            {loading ? 'Sending...' : 'Send Proposal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
