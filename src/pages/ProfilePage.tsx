import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreditBadge from '@/components/common/CreditBadge';
import SkillCard from '@/components/skills/SkillCard';
import ReviewList from '@/components/reviews/ReviewList';
import { skillService } from '@/services/skillService';
import { creditService } from '@/services/creditService';
import { userService } from '@/services/userService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/formatDate';
import type { SkillSummaryResponse, CreditTransactionResponse, UserSummaryResponse } from '@/types';
import { Mail, GraduationCap, Briefcase, Coins, History, BookOpen, Camera, Loader2, Shield, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { ApiError } from '@/services/apiClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [skills, setSkills] = useState<SkillSummaryResponse[]>([]);
  const [history, setHistory] = useState<CreditTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [skillsRes, historyRes] = await Promise.allSettled([
          skillService.getMySkills(),
          creditService.getHistory(),
        ]);
        if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value);
        if (historyRes.status === 'fulfilled') setHistory(historyRes.value);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      await userService.uploadPhoto(file);
      await refreshUser();
      toast.success('Foto de perfil actualizada');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo subir la foto');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const photoUrl = user?.profilePhotoUrl ? `${API_BASE}${user.profilePhotoUrl}` : undefined;

  const chartData = [...history].reverse().reduce((acc, tx, i) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    acc.push({ name: `#${i + 1}`, balance: prev + tx.amount });
    return acc;
  }, [] as { name: string; balance: number }[]);

  const offerSkills = skills.filter((s) => s.skillType === 'OFFER');
  const wantSkills = skills.filter((s) => s.skillType === 'WANT');
  const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Your OnlySwapX account overview</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass border-border/50 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="group relative">
                <Avatar size="lg" className="h-20 w-20 border-2 border-gold/30">
                  {photoUrl && <AvatarImage src={photoUrl} alt={user?.fullName} />}
                  <AvatarFallback className="bg-gold/10 text-2xl font-bold text-gold">{initials}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  aria-label="Cambiar foto de perfil"
                  title="Cambiar foto de perfil"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-navy/70 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gold" />
                  ) : (
                    <Camera className="h-5 w-5 text-gold" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground">{user?.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-3">
                <CreditBadge balance={user?.creditsBalance ?? 0} />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {user?.university && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />{user.university}
                </div>
              )}
              {user?.career && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />{user.career}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />{user?.email}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
                <Coins className="h-5 w-5 text-gold" />Credit Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" stroke="#536370" fontSize={12} />
                    <YAxis stroke="#536370" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0A1628', border: '1px solid #1E3A5F', borderRadius: 8, color: '#E8F4FD' }} />
                    <Line type="monotone" dataKey="balance" stroke="#C9A84C" strokeWidth={2} dot={{ r: 3, fill: '#C9A84C' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">Not enough data to display chart</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
                <History className="h-5 w-5 text-gold" />Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 8).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-navy/50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.description || tx.type}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                      </div>
                      <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
              <BookOpen className="h-5 w-5 text-gold" />Skills I Offer ({offerSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {offerSkills.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No skills offered yet</p>
            ) : (
              <div className="space-y-3">
                {offerSkills.map((s) => (
                  <SkillCard key={s.id} skill={{ ...s, userId: user?.id ?? 0, userName: user?.fullName ?? '', description: '' }} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
              <BookOpen className="h-5 w-5 text-gold" />Skills I Want ({wantSkills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wantSkills.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No skills wanted yet</p>
            ) : (
              <div className="space-y-3">
                {wantSkills.map((s) => (
                  <SkillCard key={s.id} skill={{ ...s, userId: user?.id ?? 0, userName: user?.fullName ?? '', description: '' }} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {user?.role === 'ADMIN' && <AdminPanel />}

      {user?.id && <ReviewList userId={user.id} />}
    </div>
  );
}

function AdminPanel() {
  const { user } = useAuth();
  const roles = ['USER', 'VERIFIED_TEACHER', 'ADMIN'];
  const [users, setUsers] = useState<UserSummaryResponse[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('USER');
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadUsers = async () => {
    try {
      setUsers(await userService.getAllUsers());
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudieron cargar los usuarios');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await userService.createUser({ email, password, fullName, role });
      toast.success(`Cuenta creada: ${created.email}`);
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('USER');
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (target: UserSummaryResponse, nextRole: string) => {
    if (target.id === user?.id && nextRole !== 'ADMIN') {
      toast.error('No puedes quitarte tu propio rol ADMIN');
      return;
    }
    setSavingId(target.id);
    try {
      await userService.updateRole(target.id, nextRole);
      setUsers((current) => current.map((item) => item.id === target.id ? { ...item, role: nextRole } : item));
      toast.success('Rol actualizado');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo actualizar el rol');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteUser = async (target: UserSummaryResponse) => {
    if (target.id === user?.id) {
      toast.error('No puedes eliminar tu propia cuenta admin');
      return;
    }
    if (!window.confirm(`Eliminar a ${target.fullName}? Esta accion tambien elimina sus skills, sesiones, mensajes, reviews y creditos.`)) {
      return;
    }
    setDeletingId(target.id);
    try {
      await userService.deleteUser(target.id);
      setUsers((current) => current.filter((item) => item.id !== target.id));
      toast.success('Usuario eliminado');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo eliminar el usuario');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="glass border-gold/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg text-foreground">
          <Shield className="h-5 w-5 text-gold" />Panel de administrador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleCreateUser} className="grid gap-3 sm:grid-cols-4">
          <input
            type="email"
            required
            placeholder="correo@dominio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-border bg-navy px-3 py-2 text-sm text-foreground"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Contraseña (min. 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-border bg-navy px-3 py-2 text-sm text-foreground"
          />
          <input
            type="text"
            required
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-md border border-border bg-navy px-3 py-2 text-sm text-foreground"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-md border border-border bg-navy px-3 py-2 text-sm text-foreground"
          >
            {roles.map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-4 rounded-md bg-gold px-4 py-2 text-sm font-medium text-navy hover:bg-gold-light disabled:opacity-60"
          >
            {submitting ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Usuarios registrados</h3>
          {users.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-border/70 bg-navy/70 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-foreground">{item.fullName}</p>
                <p className="text-xs text-muted-foreground">{item.university || 'Sin universidad'} · {item.role}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {roles.map((nextRole) => (
                  <button
                    key={nextRole}
                    type="button"
                    disabled={savingId === item.id || item.role === nextRole}
                    onClick={() => handleRoleChange(item, nextRole)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      item.role === nextRole
                        ? 'border-gold bg-gold text-navy'
                        : 'border-border text-muted-foreground hover:border-gold hover:text-gold'
                    } disabled:opacity-60`}
                  >
                    {nextRole.replace('_', ' ')}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={deletingId === item.id || item.id === user?.id}
                  onClick={() => handleDeleteUser(item)}
                  className="inline-flex items-center gap-1 rounded-full border border-red-400/50 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  {deletingId === item.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
