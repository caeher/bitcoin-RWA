import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { cn, formatSats } from '@lib/utils';

interface RecentTrade {
  time: string;
  price: number;
  quantity: number;
  type: 'buy' | 'sell';
}

interface RecentTradesCardProps {
  trades: RecentTrade[];
}

export function RecentTradesCard({ trades }: RecentTradesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {trades.map((trade) => (
            <div
              key={`${trade.time}-${trade.price}-${trade.quantity}`}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-1 text-sm"
            >
              <span className="text-xs font-mono text-foreground-secondary">{trade.time}</span>
              <span
                className={cn(
                  'font-mono',
                  trade.type === 'buy' ? 'text-accent-green' : 'text-accent-red'
                )}
              >
                {formatSats(trade.price)}
              </span>
              <span className="font-mono">{trade.quantity}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}