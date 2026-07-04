import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
}

export default function StarRating({ rating, max = 5, size = 'sm' }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}
