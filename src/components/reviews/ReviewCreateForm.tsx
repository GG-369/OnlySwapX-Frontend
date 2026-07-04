import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { reviewService } from '@/services/reviewService';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: number;
  reviewedId: number;
  reviewedName: string;
  reviewerRole: 'teacher' | 'student';
  onCreated?: () => void;
}

export default function ReviewCreateForm({ open, onOpenChange, sessionId, reviewedId, reviewedName, reviewerRole, onCreated }: ReviewCreateFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const roleLabel = reviewerRole === 'teacher' ? 'student' : 'teacher';
  const roleHint = reviewerRole === 'teacher'
    ? 'How was their participation, punctuality, and respect for the agreed time?'
    : 'How was their clarity, preparation, and punctuality?';

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setLoading(true);
    try {
      await reviewService.create({ sessionId, reviewedId, rating, comment: comment.trim() || undefined });
      toast.success('Review submitted!');
      setRating(0);
      setComment('');
      onOpenChange(false);
      onCreated?.();
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review {reviewedName} as a {roleLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-xs text-muted-foreground">{roleHint}</p>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoveredStar || rating) ? 'fill-gold text-gold' : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Comment (optional)</label>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-navy border-border focus:border-gold"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-muted-foreground">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || rating === 0} className="bg-gold text-navy hover:bg-gold-light">
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
