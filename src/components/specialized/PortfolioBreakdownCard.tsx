import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { InfoRow } from '@components/ui/InfoRow';
import { cn, formatSats } from '@lib/utils';
import { useWalletApi } from '@hooks';

export function PortfolioBreakdownCard() {
  const { data: wallet } = useWalletApi().getWalletSummary();
  const onchain = wallet?.onchain_balance_sats || 0;
  const lightning = wallet?.lightning_balance_sats || 0;
  const tokens = 0;
  const total = onchain + lightning + tokens;

  const items = [
    {
      label: 'On-chain',
      value: onchain,
      color: 'bg-accent-bitcoin',
      percent: total === 0 ? 0 : (onchain / total) * 100,
    },
    {
      label: 'Lightning',
      value: lightning,
      color: 'bg-accent-green',
      percent: total === 0 ? 0 : (lightning / total) * 100,
    },
    {
      label: 'Tokens',
      value: tokens,
      color: 'bg-accent-blue',
      percent: total === 0 ? 0 : (tokens / total) * 100,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex h-2 gap-1 overflow-hidden rounded-full">
          {items.map((item) => (
            <div key={item.label} className={cn(item.color, 'transition-all')} style={{ width: `${item.percent}%` }} />
          ))}
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <InfoRow
              key={item.label}
              label={
                <div className="flex items-center gap-2">
                  <div className={cn('h-3 w-3 rounded-full', item.color)} />
                  <span>{item.label}</span>
                </div>
              }
              value={`${formatSats(item.value)} sats`}
              valueClassName="font-mono"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}