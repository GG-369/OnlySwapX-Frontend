import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string; password: string }>();

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setError('');
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setError(msg);
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
            <CardTitle className="font-heading text-xl text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@utec.edu.pe" {...register('email', { required: 'Email is required' })} className="bg-navy border-border" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register('password', { required: 'Password is required' })} className="bg-navy border-border" />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-gold text-navy hover:bg-gold-light">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold hover:underline">Sign up</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
