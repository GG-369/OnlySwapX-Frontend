import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/common/StarRating';
import { reviewService } from '@/services/reviewService';
import type { ReviewSummaryResponse } from '@/types';
import { Star } from 'lucide-react';

interface ReviewListProps {
  userId: number;
}

type RoleFilter = 'TEACHER' | 'STUDENT';

export default function ReviewList({ userId }: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<RoleFilter>('TEACHER');
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await reviewService.getByUser(userId);
        setReviews(res);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (hasAutoSelected || reviews.length === 0) return;
    const tCount = reviews.filter((r) => r.roleContext === 'TEACHER').length;
    if (tCount === 0) setActiveFilter('STUDENT');
    setHasAutoSelected(true);
  }, [reviews, hasAutoSelected]);

  if (loading) return null;

  const teacherReviews = reviews.filter((r) => r.roleContext === 'TEACHER');
  const studentReviews = reviews.filter((r) => r.roleContext === 'STUDENT');
  const teacherCount = teacherReviews.length;
  const studentCount = studentReviews.length;
  const teacherAvg = teacherCount > 0 ? teacherReviews.reduce((s, r) => s + r.rating, 0) / teacherCount : 0;
  const studentAvg = studentCount > 0 ? studentReviews.reduce((s, r) => s + r.rating, 0) / studentCount : 0;

  const filtered = activeFilter === 'TEACHER' ? teacherReviews : studentReviews;

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
          <Star className="h-5 w-5 text-gold" />Reviews
        </CardTitle>
        {reviews.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={activeFilter === 'TEACHER' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('TEACHER')}
                className={activeFilter === 'TEACHER'
                  ? 'bg-gold text-navy hover:bg-gold-light'
                  : 'border-border text-muted-foreground'}
              >
                As teacher ({teacherCount})
              </Button>
              <Button
                size="sm"
                variant={activeFilter === 'STUDENT' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('STUDENT')}
                className={activeFilter === 'STUDENT'
                  ? 'bg-gold text-navy hover:bg-gold-light'
                  : 'border-border text-muted-foreground'}
              >
                As student ({studentCount})
              </Button>
            </div>
            {activeFilter === 'TEACHER' && teacherCount > 0 && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-gold text-gold" />
                {teacherAvg.toFixed(1)}
              </span>
            )}
            {activeFilter === 'STUDENT' && studentCount > 0 && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-gold text-gold" />
                {studentAvg.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No reviews yet</p>
        ) : filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No reviews as {activeFilter === 'TEACHER' ? 'teacher' : 'student'} yet
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((review) => (
              <div key={review.id} className="rounded-lg border border-border/50 bg-navy/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                      {getInitials(review.reviewerName)}
                    </div>
                    <Link
                      to={`/users/${review.reviewerId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-medium text-foreground hover:text-gold hover:underline"
                    >
                      {review.reviewerName}
                    </Link>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <p className="text-xs text-muted-foreground ml-9">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
