import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SessionCard from '@/components/sessions/SessionCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ReviewCreateForm from '@/components/reviews/ReviewCreateForm';
import { sessionService } from '@/services/sessionService';
import { creditService } from '@/services/creditService';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { SessionSummaryResponse, SessionDetailResponse } from '@/types';
import { History, Filter } from 'lucide-react';
import { toast } from 'sonner';

type Filter = 'ALL' | 'PROPOSED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export default function SessionsPage() {
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessions, setSessions] = useState<SessionSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>(
    () => (searchParams.get('status') as Filter) || 'ALL'
  );
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [reviewSession, setReviewSession] = useState<SessionDetailResponse | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setSessions(await sessionService.getMySessions());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (id: number) => {
    try {
      await creditService.confirmSession(id);
      toast.success('Session confirmed!');
      load();
      refreshUser();
    } catch {
      toast.error('Failed to confirm session');
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await sessionService.accept(id);
      toast.success('Session accepted! Credits held in escrow.');
      load();
      refreshUser();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept session');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await sessionService.reject(id);
      toast.success('Session rejected');
      load();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject session');
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await sessionService.cancel(cancelTarget);
      toast.success('Session cancelled');
      load();
      refreshUser();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel session');
    }
  };

  const handleLeaveReview = async (sessionId: number) => {
    try {
      const detail = await sessionService.getById(sessionId);
      setReviewSession(detail);
      setReviewOpen(true);
    } catch {
      toast.error('Failed to load session details');
    }
  };

  const getReviewedId = (): number => {
    if (!reviewSession || !user) return 0;
    return reviewSession.teacherId === user.id ? reviewSession.studentId : reviewSession.teacherId;
  };

  const getReviewedName = (): string => {
    if (!reviewSession || !user) return '';
    return reviewSession.teacherId === user.id ? reviewSession.studentName : reviewSession.teacherName;
  };

  const getReviewerRole = (): 'teacher' | 'student' => {
    if (!reviewSession || !user) return 'student';
    return reviewSession.teacherId === user.id ? 'teacher' : 'student';
  };

  const filtered = filter === 'ALL' ? sessions : sessions.filter((s) => s.status === filter);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Sessions</h1>
        <p className="text-muted-foreground">Track your active and past learning sessions</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button size="sm" variant={filter === 'ALL' ? 'default' : 'outline'} onClick={() => { setFilter('ALL'); searchParams.delete('status'); setSearchParams(searchParams); }}
          className={filter === 'ALL' ? 'bg-gold text-navy' : 'border-border text-muted-foreground'}>
          <Filter className="mr-1 h-3 w-3" />All
        </Button>
        {(['PROPOSED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => { setFilter(f); searchParams.set('status', f); setSearchParams(searchParams); }}
            className={filter === f ? 'bg-gold text-navy' : 'border-border text-muted-foreground'}>
            {f}
          </Button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <History className="mb-3 h-10 w-10 text-gold/30" />
            <h3 className="font-heading text-lg font-semibold text-foreground">No sessions yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Accept an exchange request to start a session</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((session) => (
            <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <SessionCard
                session={session}
                currentUserId={user?.id}
                onConfirm={handleConfirm}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={(id) => setCancelTarget(id)}
                onLeaveReview={handleLeaveReview}
              />
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
        title="Cancel Session"
        description="Are you sure you want to cancel this session? Credits held in escrow will be refunded to the student."
        onConfirm={handleCancel}
      />

      {reviewSession && (
        <ReviewCreateForm
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          sessionId={reviewSession.id}
          reviewedId={getReviewedId()}
          reviewedName={getReviewedName()}
          reviewerRole={getReviewerRole()}
          onCreated={load}
        />
      )}
    </div>
  );
}
