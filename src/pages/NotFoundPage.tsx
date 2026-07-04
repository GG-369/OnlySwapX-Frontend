import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Zap, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gold/10">
            <Zap className="h-12 w-12 text-gold" />
          </div>
        </div>
        <h1 className="font-heading text-6xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">This page has drifted into orbit</p>
        <p className="mt-1 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button className="mt-6 bg-gold text-navy hover:bg-gold-light">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
