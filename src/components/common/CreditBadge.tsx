import { Coins } from 'lucide-react';

interface CreditBadgeProps {
  balance: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function CreditBadge({ balance, size = 'md' }: CreditBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  return (
    <div className={`inline-flex items-center rounded-full border border-gold/20 bg-gold/5 font-semibold text-gold ${sizeClasses[size]}`}>
      <Coins className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      {balance}
    </div>
  );
}
