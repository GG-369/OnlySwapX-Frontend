import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, MessageSquare, Calendar, StopCircle } from 'lucide-react';
import { EXCHANGE_STATUSES } from '@/utils/constants';
import type { ExchangeSummaryResponse } from '@/types';

interface ExchangeCardProps {
  exchange: ExchangeSummaryResponse;
  currentUserName?: string;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onEnd?: (id: number) => void;
  onClick?: (id: number) => void;
  onSchedule?: (id: number) => void;
  onChat?: (id: number) => void;
}

export default function ExchangeCard({ exchange, currentUserName, onAccept, onReject, onEnd, onClick, onSchedule, onChat }: ExchangeCardProps) {
  const navigate = useNavigate();
  const statusConfig = EXCHANGE_STATUSES[exchange.status as keyof typeof EXCHANGE_STATUSES] || EXCHANGE_STATUSES.PENDING;
  const isReceiver = exchange.receiverName === currentUserName;
  const isPending = exchange.status === 'PENDING';
  const isAccepted = exchange.status === 'ACCEPTED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="border-border/50 bg-card/80 backdrop-blur-sm transition-colors hover:border-gold/30 cursor-pointer"
        onClick={() => onClick?.(exchange.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-sm font-medium text-foreground hover:text-gold cursor-pointer transition-colors"
                  onClick={(e) => { e.stopPropagation(); navigate(`/users/${exchange.requesterId}`); }}
                >{exchange.requesterName}</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span
                  className="text-sm font-medium text-foreground hover:text-gold cursor-pointer transition-colors"
                  onClick={(e) => { e.stopPropagation(); navigate(`/users/${exchange.receiverId}`); }}
                >{exchange.receiverName}</span>
              </div>
              {exchange.skillName && (
                <p className="text-xs text-gold mb-2">{exchange.skillName}</p>
              )}
              <Badge variant="outline" className={`text-xs ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
            </div>
            {isPending && isReceiver && (
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Accept exchange"
                  title="Accept exchange"
                  className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => onAccept?.(exchange.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Reject exchange"
                  title="Reject exchange"
                  className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                  onClick={() => onReject?.(exchange.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {isAccepted && (
            <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {onSchedule && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gold/30 text-gold hover:bg-gold/10"
                  onClick={() => onSchedule(exchange.id)}
                >
                  <Calendar className="mr-1 h-3 w-3" />Schedule
                </Button>
              )}
              {onChat && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-secondary"
                  onClick={() => onChat(exchange.id)}
                >
                  <MessageSquare className="mr-1 h-3 w-3" />Chat
                </Button>
              )}
              {onEnd && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-border text-muted-foreground hover:bg-secondary"
                  onClick={() => onEnd(exchange.id)}
                >
                  <StopCircle className="mr-1 h-3 w-3" />End
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
