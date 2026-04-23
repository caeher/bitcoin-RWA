import { ArrowDownRight, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/Card';
import { SatoshiAmount } from './SatoshiAmount';
import { cn, formatPercentage } from '@lib/utils';
import { useWalletApi } from '@hooks';

export function DashboardBalanceCard() {
  const { data: wallet } = useWalletApi().getWalletSummary();
  const totalSats =
    (wallet?.onchain_balance_sats || 0) +
    (wallet?.lightning_balance_sats || 0) +
    (wallet?.pending_balance_sats || 0);
  const change24h = 0;

  return (
    <Card glow="bitcoin">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet size={20} className="text-accent-bitcoin" />
          Total Balance
        </CardTitle>
        <CardDescription>Combined BTC and token value</CardDescription>
      </CardHeader>
      <CardContent>
        <SatoshiAmount amount={totalSats} showFiat size="xl" highlight />
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              change24h >= 0 ? 'text-accent-green' : 'text-accent-red'
            )}
          >
            {change24h >= 0 ? <TrendingUp size={14} /> : <ArrowDownRight size={14} />}
            {formatPercentage(change24h)}
          </span>
          <span className="text-sm text-foreground-secondary">24h change</span>
        </div>
      </CardContent>
    </Card>
  );
}