import { Activity, ArrowDownRight, ArrowUpRight, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/Card';
import { cn, formatRelativeTime, formatSats } from '@lib/utils';
import { useWalletApi } from '@hooks';

const iconByType = {
  deposit: <ArrowDownRight className="text-accent-green" size={16} />,
  withdrawal: <ArrowUpRight className="text-accent-red" size={16} />,
  trade: <Activity className="text-accent-bitcoin" size={16} />,
  yield: <Zap className="text-accent-bitcoin" size={16} />,
} as const;

const labelByType = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  trade: 'Trade',
  yield: 'Yield',
} as const;

export function ActivityFeedCard() {
  const { data: txData } = useWalletApi().getTransactions();
  const transactions = txData?.items.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Last 5 transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background-elevated">
                  {iconByType[transaction.type as keyof typeof iconByType] || (
                    <Clock className="text-foreground-secondary" size={16} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {labelByType[transaction.type as keyof typeof labelByType] || transaction.type}
                  </p>
                  <p className="text-xs text-foreground-secondary">{formatRelativeTime(transaction.created_at)}</p>
                </div>
              </div>
              <span
                className={cn(
                  'text-sm font-mono',
                  transaction.amount_sats >= 0 ? 'text-accent-green' : 'text-foreground'
                )}
              >
                {transaction.amount_sats >= 0 ? '+' : ''}
                {formatSats(Math.abs(transaction.amount_sats))} sats
              </span>
            </div>
          ))}
        </div>
        <Link to="/wallet/history">
          <Button variant="ghost" fullWidth className="mt-4">
            View All History
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}