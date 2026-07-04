import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trash2, Pencil, BookOpen, Lightbulb, ArrowLeftRight, Star, Check, Clock } from 'lucide-react';
import type { SkillDetailResponse, OwnerRatingDTO, ExchangeCheckDTO } from '@/types';

interface SkillCardProps {
  skill: SkillDetailResponse;
  isOwner?: boolean;
  canModerate?: boolean;
  onDelete?: (id: number) => void;
  onEdit?: () => void;
  onProposeExchange?: (skill: SkillDetailResponse) => void;
  ownerRating?: OwnerRatingDTO | null;
  exchangeCheck?: ExchangeCheckDTO | null;
}

export default function SkillCard({ skill, isOwner = false, canModerate = false, onDelete, onEdit, onProposeExchange, ownerRating, exchangeCheck }: SkillCardProps) {
  const isOffer = skill.skillType === 'OFFER';
  const hasExchange = exchangeCheck?.exists;
  const initials = skill.userName
    ? skill.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm transition-colors hover:border-gold/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {!isOwner && (
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-navy-light text-xs text-gold">{initials}</AvatarFallback>
                </Avatar>
                <Link to={`/users/${skill.userId}`} className="text-sm font-medium text-foreground hover:text-gold transition-colors">
                  {skill.userName}
                </Link>
                {ownerRating && (
                  <span className="flex items-center gap-0.5 text-xs text-gold">
                    <Star className="h-3 w-3 fill-gold" />
                    {ownerRating.average.toFixed(1)}
                    <span className="text-muted-foreground">({ownerRating.count})</span>
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 mb-1">
              {isOffer ? (
                <BookOpen className="h-4 w-4 text-emerald-400" />
              ) : (
                <Lightbulb className="h-4 w-4 text-blue-400" />
              )}
              <h4 className="font-heading text-sm font-semibold text-foreground">{skill.name}</h4>
            </div>
            {skill.description && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{skill.description}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${
                  isOffer
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                }`}
              >
                {isOffer ? 'OFFER' : 'WANT'}
              </Badge>
              {skill.category && (
                <Badge variant="outline" className="text-xs border-gold/20 bg-gold/5 text-gold">
                  {skill.category}
                </Badge>
              )}
              {skill.level && (
                <span className="text-xs text-muted-foreground">{skill.level}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isOwner && onProposeExchange && (
              hasExchange ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground" title={
                  exchangeCheck?.status === 'PENDING' ? 'Exchange already pending' : 'Exchange already accepted'
                }>
                  {exchangeCheck?.status === 'PENDING' ? (
                    <Clock className="h-4 w-4 opacity-50" />
                  ) : (
                    <Check className="h-4 w-4 opacity-50 text-emerald-400" />
                  )}
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gold hover:bg-gold/10 hover:text-gold"
                  title={isOffer ? 'Propose to learn this' : 'Propose to teach this'}
                  aria-label={isOffer ? 'Propose to learn this' : 'Propose to teach this'}
                  onClick={() => onProposeExchange(skill)}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              )
            )}
            {isOwner && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Edit skill"
                title="Edit skill"
                className="h-8 w-8 text-muted-foreground hover:text-gold"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {isOwner && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete skill"
                title="Delete skill"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(skill.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {!isOwner && canModerate && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Eliminar publicación (admin)"
                title="Eliminar publicación (admin)"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(skill.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
