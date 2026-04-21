import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Send, 
  History,
  Zap,
  Wallet as WalletIcon,
  Shield,
  Copy,
  Check,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { cn, formatSats, formatRelativeTime, truncateTxid } from '@lib/utils';
import { Layout, SatoshiAmount, BitcoinAddress, LightningInvoice, CopyButton } from '@components/specialized';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { useWalletStore } from '@stores';
import { useWalletApi, useTokenizationApi } from '@hooks';
import type { Transaction, TokenBalance } from '@types';

// Mocks removed

function BalanceOverview() {
  const { data: wallet } = useWalletApi().getWalletSummary();

  const onchain = wallet?.onchain_balance_sats || 0;
  const lightning = wallet?.lightning_balance_sats || 0;
  const pending = wallet?.pending_balance_sats || 0;
  const total = onchain + lightning + pending;

  return (
    <Card glow="bitcoin">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-foreground-secondary text-sm mb-1">Total Balance</p>
            <SatoshiAmount amount={total} showFiat size="xl" highlight />
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-bitcoin/10 flex items-center justify-center">
            <WalletIcon className="text-accent-bitcoin" size={24} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-background-elevated">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-accent-bitcoin" />
              <span className="text-xs text-foreground-secondary">On-chain</span>
            </div>
            <span className="font-mono font-medium">{formatSats(onchain)}</span>
          </div>
          <div className="p-3 rounded-lg bg-background-elevated">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-accent-green" />
              <span className="text-xs text-foreground-secondary">Lightning</span>
            </div>
            <span className="font-mono font-medium">{formatSats(lightning)}</span>
          </div>
        </div>

        {pending > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-accent-bitcoin/10 border border-accent-bitcoin/20">
            <span className="text-sm text-accent-bitcoin">
              {formatSats(pending)} sats pending confirmation
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    { icon: ArrowDownLeft, label: 'Deposit', to: '/wallet/deposit', variant: 'default' as const },
    { icon: ArrowUpRight, label: 'Withdraw', to: '/wallet/withdraw', variant: 'outline' as const },
    { icon: Send, label: 'Send', to: '/wallet/send', variant: 'outline' as const },
    { icon: Zap, label: 'Buy BTC', to: '/wallet/buy', variant: 'outline' as const },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} to={action.to}>
                <Button variant={action.variant} fullWidth className="h-16 flex-col gap-1">
                  <Icon size={20} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CustodyStatus() {
  const { data: custody } = useWalletApi().getCustodyStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield size={18} className="text-accent-green" />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-secondary">Custody Backend</span>
            <Badge variant="success">{custody?.wallet_backend || 'Software'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-secondary">Signer</span>
            <Badge variant={custody?.signer_backend === 'hsm' ? 'success' : 'warning'}>
              {custody?.signer_backend || 'Software'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-secondary">2FA Status</span>
            <Badge variant={custody?.withdraw_requires_2fa ? 'success' : 'warning'}>
              {custody?.withdraw_requires_2fa ? 'Enabled' : 'Recommended'}
            </Badge>
          </div>
          <div className="p-3 rounded-lg bg-background-elevated text-sm text-foreground-secondary">
            Your keys are encrypted and stored securely. Withdrawals require 2FA verification.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TokenBalances() {
  const { data: assetsData } = useTokenizationApi().getAssets('tokenized');
  const tokens = assetsData?.items || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Token Balances</CardTitle>
          <CardDescription>Your tokenized assets</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {tokens.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-foreground-secondary mb-4">No token balances yet</p>
            <Link to="/marketplace">
              <Button size="sm">Browse Marketplace</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((asset) => (
              <div 
                key={asset.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-background-elevated hover:bg-background-elevated/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-bitcoin/10 flex items-center justify-center">
                    <span className="text-accent-bitcoin font-bold text-xs">{asset.token?.ticker || 'TKN'}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{asset.name}</p>
                    <p className="text-xs text-foreground-secondary">-- units</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">{formatSats(asset.valuation_sat)} sats</p>
                  <span className="text-xs text-foreground-secondary">--</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TransactionHistory() {
  const { data: txData } = useWalletApi().getTransactions();
  const transactions = txData?.items.slice(0, 10) || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="text-accent-green" size={16} />;
      case 'send': return <ArrowUpRight className="text-accent-red" size={16} />;
      case 'withdrawal': return <ArrowUpRight className="text-accent-red" size={16} />;
      case 'trade': return <Zap className="text-accent-bitcoin" size={16} />;
      case 'yield': return <Zap className="text-accent-bitcoin" size={16} />;
      case 'escrow': return <Shield className="text-accent-blue" size={16} />;
      default: return <History className="text-foreground-secondary" size={16} />;
    }
  };

  const getLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent activity</CardDescription>
        </div>
        <Link to="/wallet/history">
          <Button variant="ghost" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div 
              key={tx.id} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-background-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-background-elevated flex items-center justify-center">
                  {getIcon(tx.type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{getLabel(tx.type)}</p>
                  <p className="text-xs text-foreground-secondary">{formatRelativeTime(tx.created_at)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  'font-mono text-sm',
                  tx.amount_sats >= 0 ? 'text-accent-green' : 'text-foreground'
                )}>
                  {tx.amount_sats >= 0 ? '+' : ''}{formatSats(Math.abs(tx.amount_sats))}
                </p>
                {tx.fee_sats > 0 && (
                  <p className="text-xs text-foreground-secondary">Fee: {formatSats(tx.fee_sats)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function Wallet() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Wallet</h1>
          <p className="text-foreground-secondary">Manage your Bitcoin and token balances</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BalanceOverview />
            <TransactionHistory />
          </div>
          <div className="space-y-6">
            <QuickActions />
            <TokenBalances />
            <CustodyStatus />
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Sub-pages
export function WalletDeposit() {
  const [activeTab, setActiveTab] = useState<'onchain' | 'lightning'>('onchain');
  const [showInvoice, setShowInvoice] = useState(false);
  const mockAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
  const mockInvoice = 'lnbc1m1p3q0d3kqqpp5f2...example_invoice_string';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/wallet">
            <Button variant="ghost" size="sm">← Back to Wallet</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Deposit Bitcoin</CardTitle>
            <CardDescription>Choose your deposit method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeTab === 'onchain' ? 'default' : 'outline'}
                onClick={() => setActiveTab('onchain')}
                className="flex-1"
              >
                On-chain
              </Button>
              <Button
                variant={activeTab === 'lightning' ? 'default' : 'outline'}
                onClick={() => setActiveTab('lightning')}
                className="flex-1"
              >
                <Zap size={16} className="mr-2" />
                Lightning
              </Button>
            </div>

            {activeTab === 'onchain' ? (
              <BitcoinAddress
                address={mockAddress}
                label="Send Bitcoin to this address"
                variant="large"
                qrSize={240}
              />
            ) : (
              <div className="space-y-4">
                {!showInvoice ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-accent-bitcoin/10 flex items-center justify-center mx-auto mb-4">
                      <Zap size={32} className="text-accent-bitcoin" />
                    </div>
                    <p className="text-foreground-secondary mb-4">
                      Generate a Lightning invoice to receive instant payments
                    </p>
                    <Button onClick={() => setShowInvoice(true)}>
                      Generate Invoice
                    </Button>
                  </div>
                ) : (
                  <LightningInvoice
                    invoice={mockInvoice}
                    amountSats={100000}
                    description="Wallet deposit"
                    expiry={1800}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export function WalletWithdraw() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/wallet">
            <Button variant="ghost" size="sm">← Back to Wallet</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Withdraw Bitcoin</CardTitle>
            <CardDescription>Send Bitcoin to an external address</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Destination Address
                </label>
                <textarea
                  placeholder="bc1q... or lnbc1..."
                  className="w-full p-3 rounded-lg bg-background-elevated border border-border text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent-bitcoin/50"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Amount (sats)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full p-3 rounded-lg bg-background-elevated border border-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-accent-bitcoin/50"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    Max
                  </Button>
                </div>
                <p className="text-xs text-foreground-secondary mt-1">
                  Available: {formatSats(2000000)} sats
                </p>
              </div>

              <div className="p-4 rounded-lg bg-background-elevated">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground-secondary">Network Fee</span>
                  <span className="font-mono">~500 sats</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Total</span>
                  <span className="font-mono">0 sats</span>
                </div>
              </div>

              <Button fullWidth size="lg" variant="danger">
                <Shield size={18} className="mr-2" />
                Withdraw (2FA Required)
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
