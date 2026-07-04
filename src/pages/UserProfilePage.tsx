import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SkillCard from '@/components/skills/SkillCard';
import ReviewList from '@/components/reviews/ReviewList';
import { userService } from '@/services/userService';
import { skillService } from '@/services/skillService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { UserDetailResponse, SkillSummaryResponse } from '@/types';
import { GraduationCap, Briefcase, ArrowLeft, BookOpen, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profileUser, setProfileUser] = useState<UserDetailResponse | null>(null);
  const [skills, setSkills] = useState<SkillSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [userRes, skillsRes] = await Promise.allSettled([
          userService.getUserById(Number(id)),
          skillService.getSkillsByUserId(Number(id)),
        ]);
        if (userRes.status === 'fulfilled') setProfileUser(userRes.value);
        else setError(true);
        if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error || !profileUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">User not found</p>
        <Link to="/dashboard" className="mt-4 text-gold hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const initials = profileUser.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link to={-1 as any} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4" />Back
        </Link>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass border-border/50 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar size="lg" className="h-20 w-20 border-2 border-gold/30">
                {profileUser.profilePhotoUrl && (
                  <AvatarImage src={`${API_BASE}${profileUser.profilePhotoUrl}`} alt={profileUser.fullName} />
                )}
                <AvatarFallback className="bg-gold/10 text-2xl font-bold text-gold">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="font-heading text-xl font-bold text-foreground">{profileUser.fullName}</h2>
              <div className="mt-3 space-y-2">
                {profileUser.university && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />{profileUser.university}
                  </div>
                )}
                {profileUser.career && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />{profileUser.career}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />Academic Verification — Coming Soon
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
                <BookOpen className="h-5 w-5 text-gold" />Skills ({skills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No skills yet</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {skills.map((s) => (
                    <SkillCard key={s.id} skill={{ ...s, userId: profileUser.id, userName: profileUser.fullName, description: '' }} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <ReviewList userId={profileUser.id} />
        </div>
      </div>
    </div>
  );
}
