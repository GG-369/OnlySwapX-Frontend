import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ExchangeCard from '@/components/exchanges/ExchangeCard';
import SessionCreateDialog from '@/components/sessions/SessionCreateDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Pagination from '@/components/common/Pagination';
import { exchangeService } from '@/services/exchangeService';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { ExchangeSummaryResponse, PageResponse } from '@/types';
import { ArrowLeftRight, Filter } from 'lucide-react';
import { toast } from 'sonner';

type Filter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ENDED';

export default function ExchangesPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [exchanges, setExchanges] = useState<ExchangeSummaryResponse[]>([]);
  const [pageData, setPageData] = useState<PageResponse<ExchangeSummaryResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<Filter>(
    () => (searchParams.get('status') as Filter) || 'ALL'
  );
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedExchangeId, setSelectedExchangeId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [endTarget, setEndTarget] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await exchangeService.getMyExchanges(page, 10);
      setPageData(data);
      setExchanges(data.content);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const handleAccept = async (id: number) => {
    try {
      await exchangeService.accept(id);
      toast.success('Exchange accepted!');
      load();
    } catch {
      toast.error('Failed to accept exchange');
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await exchangeService.reject(rejectTarget);
      toast.success('Exchange rejected');
      load();
    } catch {
      toast.error('Failed to reject exchange');
    }
  };

  const handleEnd = async () => {
    if (!endTarget) return;
    try {
      await exchangeService.end(endTarget);
      toast.success('Exchange ended');
      load();
    } catch {
      toast.error('Failed to end exchange');
    }
  };

  const handleSchedule = (id: number) => {
    setSelectedExchangeId(id);
    setSessionDialogOpen(true);
  };

  const handleChat = (id: number) => {
    navigate(`/exchanges/${id}/chat`);
  };

  const filtered = filter === 'ALL' ? exchanges : exchanges.filter((e) => e.status === filter);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground">Exchange Requests</h1>
        <p className="text-muted-foreground">Manage your skill exchange proposals</p>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button size="sm" variant={filter === 'ALL' ? 'default' : 'outline'} onClick={() => { setFilter('ALL'); searchParams.delete('status'); setSearchParams(searchParams); }}
          className={filter === 'ALL' ? 'bg-gold text-navy' : 'border-border text-muted-foreground'}>
          <Filter className="mr-1 h-3 w-3" />All
        </Button>
        {(['PENDING', 'ACCEPTED', 'REJECTED', 'ENDED'] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => { setFilter(f); searchParams.set('status', f); setSearchParams(searchParams); }}
            className={filter === f ? 'bg-gold text-navy' : 'border-border text-muted-foreground'}>
            {f}
          </Button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <Card className="glass border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowLeftRight className="mb-3 h-10 w-10 text-gold/30" />
            <h3 className="font-heading text-lg font-semibold text-foreground">No exchanges yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Browse skills and propose an exchange to get started</p>
            <Link to="/discover"><Button className="mt-4 bg-gold text-navy hover:bg-gold-light">Discover Skills</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ex) => (
            <motion.div key={ex.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ExchangeCard
                exchange={ex}
                currentUserName={user?.fullName}
                onAccept={handleAccept}
                onReject={(id) => setRejectTarget(id)}
                onEnd={(id) => setEndTarget(id)}
                onSchedule={handleSchedule}
                onChat={handleChat}
                onClick={(id) => navigate(`/exchanges/${id}`)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {pageData && (
        <Pagination
          currentPage={page}
          totalPages={pageData.totalPages}
          totalElements={pageData.totalElements}
          pageSize={pageData.size}
          onPageChange={setPage}
        />
      )}

      <SessionCreateDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        exchangeId={selectedExchangeId}
        onCreated={() => { load(); refreshUser(); }}
      />

      <ConfirmDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => { if (!open) setRejectTarget(null); }}
        title="Reject Exchange"
        description="Are you sure you want to reject this exchange proposal? This cannot be undone."
        onConfirm={handleReject}
      />

      <ConfirmDialog
        open={endTarget !== null}
        onOpenChange={(open) => { if (!open) setEndTarget(null); }}
        title="End Exchange"
        description="This will end the exchange and stop new sessions. Completed sessions and reviews will remain visible."
        onConfirm={handleEnd}
      />
    </div>
  );
}
