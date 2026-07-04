import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Loader2, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/apiClient';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.verifyEmail({ email, code });
      toast.success('¡Cuenta verificada correctamente!');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendCode(email);
      toast.success('Te reenviamos un nuevo código a tu correo');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo reenviar el código');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grid px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
              <Zap className="h-6 w-6 text-gold" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">
              Only<span className="text-gradient-gold">SwapX</span>
            </span>
          </Link>
        </div>

        <Card className="glass border-border/50">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
              <MailCheck className="h-5 w-5 text-gold" />
            </div>
            <CardTitle className="font-heading text-xl text-foreground">Verifica tu correo</CardTitle>
            <CardDescription className="text-muted-foreground">
              Te enviamos un código de 6 dígitos a <span className="text-foreground">{email || 'tu correo'}</span>.
              Ingrésalo para activar tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="bg-navy border-border text-center text-lg tracking-[0.5em]"
                  required
                />
              </div>
              <Button type="submit" disabled={loading || code.length !== 6} className="w-full bg-gold text-navy hover:bg-gold-light">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar cuenta
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              ¿No te llegó el código?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || !email}
                className="text-gold hover:underline disabled:opacity-50"
              >
                {resending ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-gold hover:underline">Volver a iniciar sesión</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
