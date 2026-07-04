import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Calendar, Coins, Check, X, Ban, Star } from 'lucide-react';
import { SESSION_STATUSES } from '@/utils/constants';
import { formatDate } from '@/utils/formatDate';
import type { SessionSummaryResponse } from '@/types';

interface SessionCardProps {
  session: SessionSummaryResponse;
  currentUserId?: number;
  onConfirm?: (id: number) => void;
  onCancel?: (id: number) => void;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onLeaveReview?: (id: number) => void;
  onClick?: (id: number) => void;
}

export default function SessionCard({ session, currentUserId, onConfirm, onCancel, onAccept, onReject, onLeaveReview }: SessionCardProps) {
  const statusConfig = SESSION_STATUSES[session.status as keyof typeof SESSION_STATUSES];
  const isProposer = currentUserId != null && session.createdByUserId === currentUserId;
  const isTeacher = currentUserId != null && session.teacherId === currentUserId;

  const counterpartName = isTeacher ? session.studentName : session.teacherName;
  const counterpartId = isTeacher ? session.studentId : session.teacherId;
  const counterpartInitials = counterpartName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <Card
      className="border-border/50 bg-card/80 backdrop-blur-sm transition-colors hover:border-gold/30"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-heading text-sm font-semibold text-foreground">{session.topic}</h4>
              {session.skillName && (
                <Badge variant="outline" className="text-[10px] border-gold/30 text-gold/80">
                  {session.skillName}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Avatar size="sm" className="h-5 w-5">
                <AvatarFallback className="bg-gold/10 text-[9px] font-semibold text-gold">{counterpartInitials}</AvatarFallback>
              </Avatar>
              <Link to={`/users/${counterpartId}`} className="text-xs text-muted-foreground hover:text-gold transition-colors" onClick={(e) => e.stopPropagation()}>
                {counterpartName}
              </Link>
              <Badge variant="outline" className={`text-[10px] ${isTeacher ? 'border-blue-500/30 text-blue-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                {isTeacher ? 'Teaching' : 'Learning'}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(session.scheduledAt)}
              </span>
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3 text-gold" />
                {session.creditsAmount}
              </span>
            </div>

            <Badge variant="outline" className={`text-xs ${statusConfig?.color || ''}`}>
              {statusConfig?.label || session.status}
            </Badge>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {session.status === 'PROPOSED' && (
              isProposer ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                  onClick={() => onCancel?.(session.id)}
                  title="Cancel proposal"
                  aria-label="Cancel proposal"
                >
                  <Ban className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => onAccept?.(session.id)}
                    title="Accept session"
                    aria-label="Accept session"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                    onClick={() => onReject?.(session.id)}
                    title="Reject session"
                    aria-label="Reject session"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )
            )}
            {session.status === 'SCHEDULED' && (
              session.confirmedByCurrentUser ? (
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  <Check className="mr-1 h-3 w-3" />Confirmed
                </Badge>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => onConfirm?.(session.id)}
                    title="Confirm session"
                    aria-label="Confirm session"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                    onClick={() => onCancel?.(session.id)}
                    title="Cancel session"
                    aria-label="Cancel session"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )
            )}
            {session.status === 'COMPLETED' && !session.hasReviewedByCurrentUser && (
              <Button
                size="sm"
                variant="outline"
                className="border-gold/30 text-gold hover:bg-gold/10"
                onClick={() => onLeaveReview?.(session.id)}
              >
                <Star className="mr-1 h-3 w-3" />Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
