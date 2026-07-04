import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import SkillCard from '@/components/skills/SkillCard';
import ExchangeCreateDialog from '@/components/exchanges/ExchangeCreateDialog';
import ScoreRing from '@/components/matching/ScoreRing';
import Pagination from '@/components/common/Pagination';
import { skillService } from '@/services/skillService';
import { matchService } from '@/services/matchService';
import { exchangeService } from '@/services/exchangeService';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { SkillDetailResponse, PageResponse, DiscoverBatchResponse, MatchSuggestedResponse } from '@/types';
import { Search, Filter, Sparkles, Brain, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const CATEGORIES = ['TECHNOLOGY', 'SCIENCES', 'HUMANITIES', 'ART', 'LANGUAGES', 'BUSINESS', 'OTHER'] as const;

export default function DiscoverPage() {
  const { user } = useAuth();
  const [pageData, setPageData] = useState<PageResponse<SkillDetailResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillDetailResponse | null>(null);
  const [batchData, setBatchData] = useState<DiscoverBatchResponse>({});
  const [suggested, setSuggested] = useState<MatchSuggestedResponse[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);

  const load = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await skillService.search(debouncedSearch, page, 12, category || undefined, user?.id, signal);
      setPageData(data);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  const handleAdminDelete = async (skillId: number) => {
    try {
      await skillService.delete(skillId);
      toast.success('Publicación eliminada');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo eliminar la publicación');
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [page, debouncedSearch, category, user?.id]);

  useEffect(() => {
    const skills = pageData?.content || [];
    if (skills.length === 0) { setBatchData({}); return; }
    skillService.getDiscoverBatch(skills.map((s) => s.id)).then(setBatchData).catch(() => {});
  }, [pageData]);

  useEffect(() => {
    matchService.getSuggested()
      .then(setSuggested)
      .catch(() => {})
      .finally(() => setSuggestedLoading(false));
  }, [user?.id]);

  const handlePropose = async (skill: SkillDetailResponse) => {
    if (skill.userId === user?.id) {
      toast.error("You can't propose an exchange for your own skill");
      return;
    }
    try {
      const check = await exchangeService.checkExisting(skill.userId, skill.id);
        if (check.exists) {
          if (check.reason === 'self') {
            toast.error("You can't propose an exchange with yourself");
          } else if (check.reason === 'cooldown') {
            toast.error("This proposal was recently rejected. Please try again later.");
          } else {
            toast.error(`You already have an active exchange for this skill (${check.status})`);
          }
          return;
        }
    } catch {
      // If check fails, allow opening the dialog (backend will still validate)
    }
    setSelectedSkill(skill);
    setDialogOpen(true);
  };

  const handleProposeSuggested = (match: MatchSuggestedResponse) => {
    handlePropose({
      id: match.skillId,
      userId: match.ownerId,
      userName: match.ownerName,
      name: match.skillName,
      description: match.skillDescription,
      category: match.category,
      skillType: match.skillType,
    });
  };

  const skills = pageData?.content || [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground">Discover Skills</h1>
        <p className="text-muted-foreground">Find what your peers can teach you</p>
      </motion.div>

      {!suggestedLoading && suggested.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass border-gold/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
                <Brain className="h-5 w-5 text-gold" />Suggested for You
                <Badge variant="outline" className="ml-2 text-[10px] border-gold/30 text-gold">AI Match</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {suggested.map((match) => {
                  const initials = match.ownerName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??';
                  const isLearn = match.skillType === 'OFFER';
                  return (
                    <motion.div
                      key={match.skillId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -2 }}
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-navy/50 p-3 transition-colors hover:border-gold/30"
                    >
                      <ScoreRing score={match.score} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-foreground truncate">{match.skillName}</p>
                          {match.level && (
                            <span className="text-[9px] text-muted-foreground shrink-0">{match.level}</span>
                          )}
                        </div>
                        {match.skillDescription && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">{match.skillDescription}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1">
                          <Avatar size="sm" className="h-4 w-4">
                            <AvatarFallback className="bg-gold/10 text-[7px] font-semibold text-gold">{initials}</AvatarFallback>
                          </Avatar>
                          <Link to={`/users/${match.ownerId}`} className="text-[11px] text-muted-foreground truncate hover:text-gold transition-colors">
                            {match.ownerName}
                          </Link>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[9px] ${
                              isLearn
                                ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            }`}
                          >
                            {isLearn ? 'You can learn' : 'You can teach'}
                          </Badge>
                          {match.category && (
                            <Badge variant="outline" className="text-[9px] border-border/50 text-muted-foreground">
                              {match.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gold hover:bg-gold/10 hover:text-gold shrink-0"
                        title="Propose exchange"
                        onClick={() => handleProposeSuggested(match)}
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search skills..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-lg border border-border bg-navy py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button size="sm" variant={category === '' ? 'default' : 'outline'} onClick={() => { setCategory(''); setPage(0); }}
            className={category === '' ? 'bg-gold text-navy' : 'border-border text-muted-foreground'}>
            <Filter className="mr-1 h-3 w-3" />All
          </Button>
          {CATEGORIES.map((c) => (
            <Button key={c} size="sm" variant={category === c ? 'default' : 'outline'} onClick={() => { setCategory(c); setPage(0); }}
              className={category === c ? 'bg-gold text-navy' : 'border-border text-muted-foreground'}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Sparkles className="mb-4 h-12 w-12 text-gold/30" />
          <h3 className="font-heading text-lg font-semibold text-foreground">No skills found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <motion.div key={skill.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <SkillCard
                skill={skill}
                onProposeExchange={handlePropose}
                canModerate={isAdmin}
                onDelete={isAdmin ? handleAdminDelete : undefined}
                ownerRating={batchData[skill.id]?.ownerRating}
                exchangeCheck={batchData[skill.id]?.exchangeCheck}
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

      <ExchangeCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        targetSkill={selectedSkill}
        onCreated={load}
      />
    </div>
  );
}
