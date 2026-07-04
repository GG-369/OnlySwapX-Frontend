import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SkillCard from '@/components/skills/SkillCard';
import { skillService } from '@/services/skillService';
import { exchangeService } from '@/services/exchangeService';
import { sessionService } from '@/services/sessionService';
import CreditBadge from '@/components/common/CreditBadge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { SkillSummaryResponse, ExchangeSummaryResponse, SessionSummaryResponse } from '@/types';
import { ArrowLeftRight, BookOpen, Coins, History, Plus, MessageSquare } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillSummaryResponse[]>([]);
  const [pendingExchanges, setPendingExchanges] = useState<ExchangeSummaryResponse[]>([]);
  const [activeSessions, setActiveSessions] = useState<SessionSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [skillsRes, exchangesRes, sessionsRes] = await Promise.allSettled([
          skillService.getMySkills(),
          exchangeService.getMyExchanges(),
          sessionService.getMySessions(),
        ]);
        if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value);
        if (exchangesRes.status === 'fulfilled') {
          setPendingExchanges(exchangesRes.value.content.filter((e) => e.status === 'PENDING'));
        }
        if (sessionsRes.status === 'fulfilled') {
          setActiveSessions(sessionsRes.value.filter((s) => s.status === 'SCHEDULED').slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Welcome, {user?.fullName?.split(' ')[0] || 'Student'}
        </h1>
        <p className="text-muted-foreground">Here's your OnlySwapX overview</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Coins, label: 'Credits', value: user?.creditsBalance ?? 0, link: null },
          { icon: BookOpen, label: 'My Skills', value: skills.length, link: '/skills' },
          { icon: ArrowLeftRight, label: 'Pending Exchanges', value: pendingExchanges.length, link: '/exchanges?status=PENDING' },
          { icon: History, label: 'Active Sessions', value: activeSessions.length, link: '/sessions?status=SCHEDULED' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                  <s.icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  {s.link ? (
                    <Link to={s.link} className="font-heading text-2xl font-bold text-foreground hover:text-gold transition-colors">{s.value}</Link>
                  ) : (
                    <CreditBadge balance={s.value} />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {pendingExchanges.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg text-foreground">Pending Exchanges</CardTitle>
            <Link to="/exchanges"><Button variant="ghost" size="sm" className="text-gold">View All</Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingExchanges.slice(0, 3).map((ex) => (
              <Link key={ex.id} to={`/exchanges/${ex.id}`} className="flex items-center justify-between rounded-lg border border-border/50 bg-navy/50 p-3 transition-colors hover:bg-navy">
                <div>
                  <p className="text-sm font-medium text-foreground">{ex.requesterName} → {ex.receiverName}</p>
                  <p className="text-xs text-muted-foreground">{ex.status}</p>
                </div>
                <span className="text-xs font-medium text-gold">{ex.status}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {skills.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg text-foreground">My Skills</CardTitle>
            <Link to="/skills"><Button variant="ghost" size="sm" className="text-gold">Manage</Button></Link>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {skills.slice(0, 4).map((skill) => (
              <SkillCard key={skill.id} skill={{ ...skill, userId: 0, userName: '', description: '' }} isOwner />
            ))}
          </CardContent>
        </Card>
      )}

      {skills.length === 0 && (
        <Card className="glass border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
              <Plus className="h-8 w-8 text-gold" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground">Add your first skill</h3>
            <p className="mt-1 text-sm text-muted-foreground">Tell others what you can teach and what you want to learn</p>
            <Link to="/skills"><Button className="mt-4 bg-gold text-navy hover:bg-gold-light"><Plus className="mr-2 h-4 w-4" />Add Skill</Button></Link>
          </CardContent>
        </Card>
      )}

      {activeSessions.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg text-foreground">Active Sessions</CardTitle>
            <Link to="/sessions"><Button variant="ghost" size="sm" className="text-gold">View All</Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-navy/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.topic}</p>
                  <p className="text-xs text-muted-foreground">{s.creditsAmount} credits</p>
                </div>
                <Link to="/sessions?status=SCHEDULED">
                  <Button size="sm" variant="outline" className="border-gold/20 text-gold">
                    <MessageSquare className="mr-1 h-3 w-3" />View
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
