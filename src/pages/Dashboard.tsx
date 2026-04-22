import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet, 
  Building2, 
  TrendingUp,
  Clock,
  Zap,
  Activity
} from 'lucide-react';
import { cn, formatSats, formatPercentage, formatRelativeTime } from '@lib/utils';
import { Layout, SatoshiAmount, DepositAddress } from '@components/specialized';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { EmptyState } from '@components/ui/EmptyState';
import { InfoRow } from '@components/ui/InfoRow';
import { SectionHeader } from '@components/ui/SectionHeader';
import { 
  useWalletApi, 
  useTokenizationApi,
  useMarketplaceApi
} from '@hooks';

function BalanceCard() {
  const { data: wallet } = useWalletApi().getWalletSummary();
  
  // Use real values, fallback to 0
  const totalSats = wallet?.onchain_balance_sats || 0 
                  + (wallet?.lightning_balance_sats || 0) 
                  + (wallet?.pending_balance_sats || 0);
  
  // Mock change for now since it's not in the API summary
  const change24h = 0;
// Removed hardcoded mock content

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
        <SatoshiAmount 
          amount={totalSats} 
          showFiat 
          size="xl" 
          highlight 
        />
        <div className="flex items-center gap-2 mt-2">
          <span className={cn(
            'flex items-center gap-1 text-sm font-medium',
            change24h >= 0 ? 'text-accent-green' : 'text-accent-red'
          )}>
            {change24h >= 0 ? <TrendingUp size={14} /> : <ArrowDownRight size={14} />}
            {formatPercentage(change24h)}
          </span>
          <span className="text-foreground-secondary text-sm">24h change</span>
        </div>
      </CardContent>
    </Card>
  );
}

function BalanceBreakdownCard() {
  const { data: wallet } = useWalletApi().getWalletSummary();
  const { data: assetsData } = useTokenizationApi().getAssets('tokenized');

  const onchain = wallet?.onchain_balance_sats || 0;
  const lightning = wallet?.lightning_balance_sats || 0;
  // Approximation for total tokens value (requires holdings API, simplify for now)
  const tokens = 0; // Replace with actual token holdings fetch when endpoint exists

  const total = onchain + lightning + tokens;
  const data = [
    { label: 'On-chain', value: onchain, color: 'bg-accent-bitcoin', percent: (onchain / total) * 100 },
    { label: 'Lightning', value: lightning, color: 'bg-accent-green', percent: (lightning / total) * 100 },
    { label: 'Tokens', value: tokens, color: 'bg-accent-blue', percent: (tokens / total) * 100 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-4">
          {data.map((item) => (
            <div 
              key={item.label}
              className={cn(item.color, 'transition-all')}
              style={{ width: `${item.percent}%` }}
            />
          ))}
        </div>
        <div className="space-y-3">
          {data.map((item) => (
            <InfoRow
              key={item.label}
              label={
                <div className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', item.color)} />
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

function PortfolioTable() {
  // Replace with actual holdings endpoint when available in Tokenization API. Using assets list temporarily.
  const { data: assetsData } = useTokenizationApi().getAssets('tokenized');
  const tokens = assetsData?.items || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={20} className="text-accent-bitcoin" />
            Token Portfolio
          </CardTitle>
          <CardDescription>Your tokenized asset holdings</CardDescription>
        </div>
        <Link to="/assets">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-xs font-medium text-foreground-secondary">Asset</th>
                <th className="text-right py-3 text-xs font-medium text-foreground-secondary">Units</th>
                <th className="text-right py-3 text-xs font-medium text-foreground-secondary">Value</th>
                <th className="text-right py-3 text-xs font-medium text-foreground-secondary">24h</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((asset) => (
                <tr key={asset.id} className="border-b border-border/50 hover:bg-background-elevated/50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-bitcoin/10 flex items-center justify-center">
                        <span className="text-accent-bitcoin font-bold text-xs">{asset.token?.ticker || 'TKN'}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{asset.name}</p>
                        <p className="text-xs text-foreground-secondary">{asset.token?.ticker}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono text-sm">--</td>
                  <td className="py-3 text-right">
                    <SatoshiAmount amount={asset.valuation_sat} size="sm" />
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-sm font-medium text-foreground-secondary">
                      --
                    </span>
                  </td>
                </tr>
              ))}
              {tokens.length === 0 && (
                <tr>
                   <td colSpan={4} className="py-4 text-center text-foreground-secondary">No assets found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityFeed() {
  const { data: txData } = useWalletApi().getTransactions();
  const txs = txData?.items.slice(0, 5) || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownRight className="text-accent-green" size={16} />;
      case 'withdrawal': return <ArrowUpRight className="text-accent-red" size={16} />;
      case 'trade': return <Activity className="text-accent-bitcoin" size={16} />;
      case 'yield': return <Zap className="text-accent-bitcoin" size={16} />;
      default: return <Clock className="text-foreground-secondary" size={16} />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Deposit';
      case 'withdrawal': return 'Withdrawal';
      case 'trade': return 'Trade';
      case 'yield': return 'Yield';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Last 5 transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {txs.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-background-elevated flex items-center justify-center">
                  {getIcon(tx.type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{getLabel(tx.type)}</p>
                  <p className="text-xs text-foreground-secondary">{formatRelativeTime(tx.created_at)}</p>
                </div>
              </div>
              <span className={cn(
                'font-mono text-sm',
                tx.amount_sats >= 0 ? 'text-accent-green' : 'text-foreground'
              )}>
                {tx.amount_sats >= 0 ? '+' : ''}{formatSats(Math.abs(tx.amount_sats))} sats
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

function OpenOrders() {
  const { data: ordersData } = useMarketplaceApi().getOrders(undefined, undefined, 'open');
  const orders = ordersData?.items || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Open Orders</CardTitle>
          <CardDescription>Active buy/sell orders</CardDescription>
        </div>
        <Link to="/marketplace">
          <Button variant="outline" size="sm">Marketplace</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <EmptyState
            variant="card"
            title="No open orders"
            description="Your active buy and sell orders will appear here."
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-background-elevated">
                <div className="flex items-center gap-3">
                  <Badge variant={order.side === 'buy' ? 'success' : 'danger'}>
                    {order.side.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">Token {order.token_id}</p>
                    <p className="text-xs text-foreground-secondary">{order.quantity} units @ {formatSats(order.price_sat)}</p>
                  </div>
                </div>
                <span className="font-mono text-sm">{formatSats(order.quantity * order.price_sat)} sats</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {


  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader
          title="Dashboard"
          description="Welcome back to your portfolio"
          actions={
            <>
              <Link to="/wallet/deposit">
                <Button variant="outline">Deposit</Button>
              </Link>
              <Link to="/assets/submit">
                <Button>Submit Asset</Button>
              </Link>
            </>
          }
        />

        {/* Balance cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <BalanceCard />
            <DepositAddress />
          </div>
          <BalanceBreakdownCard />
        </div>

        {/* Portfolio */}
        <PortfolioTable />

        {/* Activity & Orders */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ActivityFeed />
          <OpenOrders />
        </div>
      </div>
    </Layout>
  );
}
