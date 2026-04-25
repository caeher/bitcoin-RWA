import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, FileText, History, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Layout, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EmptyState, SectionHeader } from '@components';
import { useWalletApi } from '@hooks';
import { cn, formatRelativeTime, formatSats } from '@lib/utils';
import { BlockExplorerLink } from '@components/specialized';

export function WalletHistory() {
  const { data: txData, isLoading } = useWalletApi().getTransactions();
  const transactions = txData?.items || [];

  const iconFor = (type: string, amount: number) => {
    if (amount < 0 || type.includes('withdraw') || type.includes('send')) {
      return <ArrowUpRight className="text-accent-red" size={16} />;
    }
    if (amount > 0 || type.includes('deposit') || type.includes('receive')) {
      return <ArrowDownLeft className="text-accent-green" size={16} />;
    }
    return <History className="text-foreground-secondary" size={16} />;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader
          title="Wallet History"
          description="Complete transaction stream from the wallet API."
          actions={
            <Link to="/wallet">
              <Button variant="outline" leftIcon={<ArrowLeft size={16} />}>
                Wallet
              </Button>
            </Link>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Deposits, withdrawals, Lightning activity, escrow and fees.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <EmptyState
                variant="card"
                tone="warning"
                title="Loading transactions..."
                icon={<div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              />
            ) : transactions.length === 0 ? (
              <EmptyState variant="card" title="No transactions yet" description="Wallet activity will appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs font-medium text-foreground-secondary">
                      <th className="py-3 text-left">Type</th>
                      <th className="py-3 text-left">Status</th>
                      <th className="py-3 text-right">Amount</th>
                      <th className="py-3 text-right">Fee</th>
                      <th className="py-3 text-left">Reference</th>
                      <th className="py-3 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background-elevated">
                              {iconFor(tx.type, tx.amount_sats)}
                            </span>
                            <span className="text-sm font-medium">{tx.type.replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td className="py-3 text-sm capitalize text-foreground-secondary">{tx.status}</td>
                        <td
                          className={cn(
                            'py-3 text-right font-mono text-sm',
                            tx.amount_sats >= 0 ? 'text-accent-green' : 'text-foreground'
                          )}
                        >
                          {tx.amount_sats >= 0 ? '+' : '-'}
                          {formatSats(Math.abs(tx.amount_sats))}
                        </td>
                        <td className="py-3 text-right font-mono text-sm text-foreground-secondary">{formatSats(tx.fee_sats || 0)}</td>
                        <td className="py-3 font-mono text-xs text-foreground-secondary">
                          {tx.txid ? (
                            <BlockExplorerLink type="tx" value={tx.txid} />
                          ) : tx.address ? (
                            <BlockExplorerLink type="address" value={tx.address} />
                          ) : (
                            tx.id
                          )}
                        </td>
                        <td className="py-3 text-sm text-foreground-secondary">{formatRelativeTime(tx.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export function ForgotPassword() {
  return (
    <PublicNotice
      icon={<LockKeyhole size={22} />}
      title="Password Recovery"
      description="The generated auth API does not expose a password reset endpoint yet."
      body="For now, account recovery needs to be handled by an administrator or by adding password reset endpoints to the auth service OpenAPI contract."
      actionLabel="Back to login"
      actionTo="/auth/login"
    />
  );
}

export function Terms() {
  return (
    <PublicNotice
      icon={<FileText size={22} />}
      title="Terms of Service"
      description="Operational terms placeholder."
      body="This route is present so registration links are functional. Legal copy can be wired here once the product terms are finalized."
      actionLabel="Create account"
      actionTo="/auth/register"
    />
  );
}

export function Privacy() {
  return (
    <PublicNotice
      icon={<ShieldCheck size={22} />}
      title="Privacy Policy"
      description="Privacy policy placeholder."
      body="This route is present so registration links are functional. Privacy and compliance language can be added without changing API coverage."
      actionLabel="Create account"
      actionTo="/auth/register"
    />
  );
}

function PublicNotice({
  icon,
  title,
  description,
  body,
  actionLabel,
  actionTo,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  body: string;
  actionLabel: string;
  actionTo: string;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent-bitcoin/10 text-accent-bitcoin">
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground-secondary">{body}</p>
          <Link to={actionTo}>
            <Button leftIcon={<ArrowLeft size={16} />}>{actionLabel}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
