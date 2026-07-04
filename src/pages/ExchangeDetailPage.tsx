import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExchangeStatus from '@/components/exchanges/ExchangeStatus';
import SessionCard from '@/components/sessions/SessionCard';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { exchangeService } from '@/services/exchangeService';
import { sessionService } from '@/services/sessionService';
import { creditService } from '@/services/creditService';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { ExchangeDetailResponse, SessionSummaryResponse } from '@/types';
import { ArrowLeft, Check, X, Coins, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ExchangeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [exchange, setExchange] = useState<ExchangeDetailResponse | null>(null);
  const [sessions, setSessions] = useState<SessionSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [exchangeRes, sessionsRes] = await Promise.allSettled([
          exchangeService.getById(Number(id)),
          sessionService.getMySessions(),
        ]);
        if (exchangeRes.status === 'fulfilled') setExchange(exchangeRes.value);
        else {
          const err = exchangeRes.reason;
          const msg = err?.response?.status === 404
            ? 'Exchange not found'
            : err?.response?.status === 403
              ? 'Not authorized to view this exchange'
              : 'Failed to load exchange';
          toast.error(msg);
        }
        if (sessionsRes.status === 'fulfilled') {
          setSessions(sessionsRes.value.filter((s) => s.exchangeId === Number(id)));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAccept = async () => {
    if (!id) return;
    setActing(true);
    try {
      await exchangeService.accept(Number(id));
      toast.success('Exchange accepted!');
      setExchange((prev) => prev ? { ...prev, status: 'ACCEPTED' } : prev);
    } catch {
      toast.error('Failed to accept');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setActing(true);
    try {
      await exchangeService.reject(Number(id));
      toast.success('Exchange rejected');
      setExchange((prev) => prev ? { ...prev, status: 'REJECTED' } : prev);
    } catch {
      toast.error('Failed to reject');
    } finally {
      setActing(false);
    }
  };

  const handleConfirm = async (sessionId: number) => {
    try {
      await creditService.confirmSession(sessionId);
      toast.success('Session confirmed!');
      refreshSessions();
      refreshUser();
    } catch {
      toast.error('Failed to confirm session');
    }
  };

  const handleAcceptSession = async (sessionId: number) => {
    try {
      await sessionService.accept(sessionId);
      toast.success('Session accepted!');
      refreshSessions();
      refreshUser();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept session');
    }
  };

  const handleRejectSession = async (sessionId: number) => {
    try {
      await sessionService.reject(sessionId);
      toast.success('Session rejected');
      refreshSessions();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject session');
    }
  };

  const handleCancelSession = async () => {
    if (!cancelTarget) return;
    try {
      await sessionService.cancel(cancelTarget);
      toast.success('Session cancelled');
      refreshSessions();
      refreshUser();
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel session');
    }
    setCancelTarget(null);
  };

  const refreshSessions = async () => {
    if (!id) return;
    try {
      const all = await sessionService.getMySessions();
      setSessions(all.filter((s) => s.exchangeId === Number(id)));
    } catch {}
  };

  if (loading) return <LoadingSpinner />;
  if (!exchange) return <div className="text-center text-muted-foreground py-20">Exchange not found</div>;

  const isReceiver = exchange.receiverId === user?.id;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" />Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-xl text-foreground">Exchange Details</CardTitle>
              <ExchangeStatus status={exchange.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/50 bg-navy/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Requester</p>
                <p
                  className="font-medium text-foreground hover:text-gold cursor-pointer transition-colors"
                  onClick={() => navigate(`/users/${exchange.requesterId}`)}
                >{exchange.requesterName}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-navy/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Receiver</p>
                <p
                  className="font-medium text-foreground hover:text-gold cursor-pointer transition-colors"
                  onClick={() => navigate(`/users/${exchange.receiverId}`)}
                >{exchange.receiverName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gold/20 bg-gold/5 p-4">
              <Coins className="h-5 w-5 text-gold" />
              <div>
                <p className="text-sm font-medium text-foreground">Exchange #{exchange.id}</p>
                <p className="text-xs text-muted-foreground">Status: {exchange.status}</p>
              </div>
            </div>

            {exchange.message && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="text-sm text-foreground">{exchange.message}</p>
              </div>
            )}

            {exchange.status === 'PENDING' && isReceiver && (
              <div className="flex gap-3">
                <Button onClick={handleAccept} disabled={acting} className="flex-1 bg-gold text-navy hover:bg-gold-light">
                  <Check className="mr-1 h-4 w-4" />Accept
                </Button>
                <Button onClick={handleReject} disabled={acting} variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                  <X className="mr-1 h-4 w-4" />Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {sessions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-lg text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-gold" />Sessions ({sessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  currentUserId={user?.id}
                  onConfirm={handleConfirm}
                  onAccept={handleAcceptSession}
                  onReject={handleRejectSession}
                  onCancel={(sid) => setCancelTarget(sid)}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
        title="Cancel Session"
        description="Are you sure you want to cancel this session? Credits held in escrow will be refunded."
        onConfirm={handleCancelSession}
      />
    </div>
  );
}
