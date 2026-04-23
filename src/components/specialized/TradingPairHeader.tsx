import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { cn, formatSats } from '@lib/utils';

interface TradingPairMetric {
  label: string;
  value: string;
}

interface TradingPairHeaderProps {
  backTo: string;
  backLabel: string;
  title: string;
  price: number;
  changePercent: number;
  metrics: TradingPairMetric[];
}

export function TradingPairHeader({
  backTo,
  backLabel,
  title,
  price,
  changePercent,
  metrics,
}: TradingPairHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <Link to={backTo}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
            {backLabel}
          </Button>
        </Link>
        <div className="hidden h-6 w-px bg-border sm:block" />
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg">{formatSats(price)} sats</span>
            <span
              className={cn(
                'text-sm font-medium',
                changePercent >= 0 ? 'text-accent-green' : 'text-accent-red'
              )}
            >
              {changePercent >= 0 ? '+' : ''}
              {changePercent}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <span className="text-foreground-secondary">{metric.label}: </span>
            <span className="font-mono">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}