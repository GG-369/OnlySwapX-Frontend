import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Zap, ArrowLeftRight, Brain, CircleDollarSign, Coins, MessageSquare } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Semantic embeddings find who teaches what you need and needs what you teach.' },
  { icon: Coins, title: 'Secure Escrow', desc: 'Credits locked during session, released only when both confirm.' },
  { icon: MessageSquare, title: 'Live Chat', desc: 'Coordinate sessions, discuss topics, all in real-time.' },
  { icon: CircleDollarSign, title: 'Credit Economy', desc: 'Exchange knowledge directly with fellow students. No middlemen.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
            <Zap className="h-5 w-5 text-gold" />
          </div>
          <span className="font-heading text-lg font-bold text-foreground">
            Only<span className="text-gradient-gold">SwapX</span>
          </span>
        </div>
        <div className="flex gap-2">
          <Link to="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-gold text-navy hover:bg-gold-light">Get Started</Button>
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-4 pt-20 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Teach what you know.
            <br />
            <span className="text-gradient-gold">Learn what you need.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            The first platform where university knowledge is exchanged, not sold.
            Swap skills with peers, earn credits teaching, spend them learning.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-gold text-navy hover:bg-gold-light">
                <ArrowLeftRight className="mr-2 h-5 w-5" />
                Start Swapping
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-gold/20">
                Browse Skills
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass rounded-xl p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10">
                <f.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="font-heading text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
