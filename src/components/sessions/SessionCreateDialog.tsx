import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { exchangeService } from '@/services/exchangeService';
import { sessionService } from '@/services/sessionService';
import { skillService } from '@/services/skillService';
import { userService } from '@/services/userService';
import type { ExchangeDetailResponse } from '@/types';
import { Calendar, Coins, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SessionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exchangeId: number | null;
  onCreated?: () => void;
}

export default function SessionCreateDialog({ open, onOpenChange, exchangeId, onCreated }: SessionCreateDialogProps) {
  const [exchange, setExchange] = useState<ExchangeDetailResponse | null>(null);
  const [topic, setTopic] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [creditsAmount, setCreditsAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [studentBalance, setStudentBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !exchangeId) return;
    setFetching(true);
    setStudentBalance(null);
    setTopic('');
    setScheduledAt('');
    setCreditsAmount(1);
    exchangeService.getById(exchangeId)
      .then(async (ex) => {
        setExchange(ex);
        if (ex.skillId) {
          try {
            const [skill, suggested] = await Promise.all([
              skillService.getById(ex.skillId),
              sessionService.getSuggestedCredits(ex.skillId),
            ]);
            setCreditsAmount(suggested);
            const teacherId = skill.userId;
            const studentId = ex.requesterId === teacherId ? ex.receiverId : ex.requesterId;
            const student = await userService.getUserById(studentId);
            setStudentBalance(student.creditsBalance);
          } catch {
            // skill deleted or network error — dialog opens without credits validation
          }
        }
      })
      .catch((err: any) => {
        const msg = err instanceof Error ? err.message : 'Failed to load exchange';
        toast.error(msg);
      })
      .finally(() => setFetching(false));
  }, [open, exchangeId]);

  const showInsufficientWarning = studentBalance !== null && creditsAmount > studentBalance;

  const handleSubmit = async () => {
    if (!exchange || !exchangeId) return;
    if (!topic.trim() || !scheduledAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await sessionService.create({
        exchangeId,
        topic: topic.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        creditsAmount,
      });
      toast.success('Session scheduled!');
      setTopic('');
      setScheduledAt('');
      setCreditsAmount(1);
      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule session';
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
            <Calendar className="h-5 w-5 text-gold" />
            Schedule Session
          </DialogTitle>
        </DialogHeader>

        {fetching ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Loading exchange details...</p>
        ) : exchange ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border/50 bg-navy/50 p-3">
              <p className="text-xs text-muted-foreground">
                {exchange.requesterName} ↔ {exchange.receiverName}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Topic *</Label>
              <Textarea
                placeholder="What will you learn/teach in this session?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-navy border-border focus:border-gold"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Scheduled At *</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="bg-navy border-border focus:border-gold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Credits</Label>
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-gold" />
                <Input
                  type="number"
                  min={1}
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-navy border-border focus:border-gold"
                />
              </div>
              {showInsufficientWarning && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  Student only has {studentBalance} credits
                </div>
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-muted-foreground">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || fetching || showInsufficientWarning}
            className="bg-gold text-navy hover:bg-gold-light"
          >
            {loading ? 'Scheduling...' : 'Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
