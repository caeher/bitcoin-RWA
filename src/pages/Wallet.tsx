import { useEffect, useState } from 'react';
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
import { EmptyState } from '@components/ui/EmptyState';
import { InfoRow } from '@components/ui/InfoRow';
import { SectionHeader } from '@components/ui/SectionHeader';
import { StatTile } from '@components/ui/StatTile';
import { InputField, TextareaField } from '@components/forms';
import { useNotificationStore, useWalletStore } from '@stores';
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
          <StatTile
            label={
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-bitcoin" />
                On-chain
              </span>
            }
            value={formatSats(onchain)}
            mono
            size="sm"
          />
          <StatTile
            label={
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-green" />
                Lightning
              </span>
            }
            value={formatSats(lightning)}
            mono
            size="sm"
          />
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
    { icon: ArrowDownLeft, label: 'Receive', to: '/wallet/deposit', variant: 'default' as const },
    { icon: Send, label: 'Send', to: '/wallet/withdraw', variant: 'outline' as const },
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
          <InfoRow
            label="Custody Backend"
            value={<Badge variant="success">{custody?.wallet_backend || 'Software'}</Badge>}
          />
          <InfoRow
            label="Signer"
            value={
              <Badge variant={custody?.signer_backend === 'hsm' ? 'success' : 'warning'}>
                {custody?.signer_backend || 'Software'}
              </Badge>
            }
          />
          <InfoRow
            label="2FA Status"
            value={
              <Badge variant={custody?.withdraw_requires_2fa ? 'success' : 'warning'}>
                {custody?.withdraw_requires_2fa ? 'Enabled' : 'Recommended'}
              </Badge>
            }
          />
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
          <EmptyState
            variant="card"
            title="No token balances yet"
            description="Browse the marketplace to purchase tokenized assets."
            action={
              <Link to="/marketplace">
                <Button size="sm">Browse Marketplace</Button>
              </Link>
            }
          />
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
        <SectionHeader
          title="Wallet"
          description="Manage your Bitcoin and token balances"
        />

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
  const [invoiceAmount, setInvoiceAmount] = useState('100000');
  const [invoiceMemo, setInvoiceMemo] = useState('Wallet deposit');
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const { success } = useNotificationStore();
  const { mutateAsync: createAddress, isPending: isCreatingAddress } = useWalletApi().createOnchainAddress;
  const { mutateAsync: createInvoice, data: invoiceData, isPending: isCreatingInvoice } = useWalletApi().createInvoice;

  useEffect(() => {
    if (activeTab !== 'onchain' || depositAddress) {
      return;
    }

    createAddress()
      .then((response) => setDepositAddress(response.address))
      .catch(() => null);
  }, [activeTab, createAddress, depositAddress]);

  const handleGenerateInvoice = async () => {
    try {
      const amount = Math.max(1, Number(invoiceAmount) || 0);
      const response = await createInvoice({
        amount_sats: amount,
        description: invoiceMemo || undefined,
      });

      success('Invoice created', 'Lightning invoice ready to receive payment.');
      return response;
    } catch (error) {
      // Error handled by api.ts
    }
  };

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
              depositAddress ? (
                <BitcoinAddress
                  address={depositAddress}
                  label="Send Bitcoin to this address"
                  variant="large"
                  qrSize={240}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-foreground-secondary mb-4">Generating your on-chain deposit address...</p>
                  <Button onClick={() => createAddress().then((response) => setDepositAddress(response.address))} isLoading={isCreatingAddress}>
                    Generate Address
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {!invoiceData?.payment_request ? (
                  <>
                    <InputField
                      label="Amount (sats)"
                      type="number"
                      min="1"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      className="font-mono"
                    />
                    <InputField label="Memo" type="text" value={invoiceMemo} onChange={(e) => setInvoiceMemo(e.target.value)} />
                    <Button onClick={handleGenerateInvoice} isLoading={isCreatingInvoice}>
                      Generate Invoice
                    </Button>
                  </>
                ) : (
                  <LightningInvoice
                    invoice={invoiceData.payment_request}
                    amountSats={invoiceData.amount_sats}
                    description={invoiceData.memo || invoiceMemo}
                    expiry={invoiceData.expiry}
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
  const { success } = useNotificationStore();
  const { data: wallet } = useWalletApi().getWalletSummary();
  const { data: fees } = useWalletApi().getOnchainFees();
  const { mutateAsync: payInvoice, isPending: isPayingInvoice } = useWalletApi().payInvoice;
  const { mutateAsync: withdrawOnchain, isPending: isWithdrawing } = useWalletApi().withdrawOnchain;
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [feeRate, setFeeRate] = useState('');

  const available = wallet?.onchain_balance_sats || 0;
  const estimatedFee = Number(feeRate || fees?.economy_fee || 1) * 140;
  const total = (Number(amount) || 0) + estimatedFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination.trim()) {
      return;
    }

    try {
      if (destination.trim().toLowerCase().startsWith('ln')) {
        const response = await payInvoice({ payment_request: destination.trim() });
        success('Payment submitted', `Lightning payment status: ${response.status}.`);
        return;
      }

      const response = await withdrawOnchain({
        address: destination.trim(),
        amount_sats: Math.max(1, Number(amount) || 0),
        fee_rate: Math.max(1, Number(feeRate || fees?.economy_fee || 1)),
      });

      success('Withdrawal created', `Transaction ${truncateTxid(response.txid)} created successfully.`);
    } catch (error) {
      // Error handled by api.ts
    }
  };

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
            <CardDescription>Send Bitcoin to an external address or Lightning invoice</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <TextareaField
                label="Destination"
                placeholder="bc1q... or lnbc1..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="font-mono text-sm"
                rows={3}
              />

              <InputField
                label="Amount (sats)"
                type="number"
                placeholder="0"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-24 font-mono"
                rightElement={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAmount(String(available))}
                    className="h-7 px-2"
                  >
                    Max
                  </Button>
                }
                helperText={`Available: ${formatSats(available)} sats`}
              />

              <InputField
                label="Fee Rate (sat/vB)"
                type="number"
                min="1"
                value={feeRate}
                onChange={(e) => setFeeRate(e.target.value)}
                placeholder={String(fees?.economy_fee || 1)}
                className="font-mono"
              />

              <div className="p-4 rounded-lg bg-background-elevated">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-foreground-secondary">Network Fee</span>
                  <span className="font-mono">~{formatSats(estimatedFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Total</span>
                  <span className="font-mono">{formatSats(total)}</span>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                variant="danger"
                type="submit"
                isLoading={isWithdrawing || isPayingInvoice}
              >
                <Shield size={18} className="mr-2" />
                Send Funds
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
