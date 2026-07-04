import { EXCHANGE_STATUSES } from '@/utils/constants';
import { Badge } from '@/components/ui/badge';

interface ExchangeStatusProps {
  status: string;
}

export default function ExchangeStatus({ status }: ExchangeStatusProps) {
  const config = EXCHANGE_STATUSES[status as keyof typeof EXCHANGE_STATUSES];
  if (!config) return <Badge variant="outline" className="text-xs">{status}</Badge>;

  return (
    <Badge variant="outline" className={`text-xs ${config.color}`}>
      {config.label}
    </Badge>
  );
}
