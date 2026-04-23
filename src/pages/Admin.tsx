import { useState } from 'react';
import { Search, Send, Shield, TrendingUp, Users, Wallet, Scale } from 'lucide-react';
import { cn, formatDate, formatSats } from '@lib/utils';
import {
  Layout,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  EmptyState,
  SectionHeader,
  StatTile,
} from '@components';
import { InputField } from '@components/forms';
import { useAdminApi } from '@hooks';

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'disputes', label: 'Disputes', icon: Scale },
  { id: 'treasury', label: 'Treasury', icon: Wallet },
];

function StatsOverview() {
  const { data: usersData } = useAdminApi().getUsers();
  const { data: referralSummary } = useAdminApi().getReferralSummary();
  const { data: yieldSummary } = useAdminApi().getYieldSummary();

  const stats = [
    { label: 'Total Users', value: String(usersData?.items.length || 0), tone: 'text-foreground' },
    { label: 'Active Referrers', value: String(referralSummary?.active_referrers || 0), tone: 'text-accent-bitcoin' },
    { label: 'Referred Users', value: String(referralSummary?.referred_users || 0), tone: 'text-accent-green' },
    { label: 'Referral Rewards', value: formatSats(referralSummary?.total_reward_sat || 0), tone: 'text-accent-bitcoin' },
    { label: 'Users With Yield', value: String(yieldSummary?.users_with_yield || 0), tone: 'text-foreground' },
    { label: 'Yield Paid', value: formatSats(yieldSummary?.total_yield_sat || 0), tone: 'text-accent-green' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <StatTile
          key={stat.label}
          label={stat.label}
          value={stat.value}
          mono
          surface="subtle"
          valueClassName={cn('text-2xl font-bold', stat.tone)}
        />
      ))}
    </div>
  );
}

function UsersTab() {
  const [search, setSearch] = useState('');
  const { data: usersData } = useAdminApi().getUsers();

  const filteredUsers = (usersData?.items || []).filter((user) =>
    (user.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Management</CardTitle>
        <div className="w-64">
          <InputField
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftElement={<Search size={16} />}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-xs font-medium text-foreground-secondary">User</th>
                <th className="text-left py-3 text-xs font-medium text-foreground-secondary">Role</th>
                <th className="text-left py-3 text-xs font-medium text-foreground-secondary">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-background-elevated/50">
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-sm">{user.email || user.display_name}</p>
                      <p className="text-xs text-foreground-secondary font-mono">ID: {user.id}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge
                      variant={user.role === 'admin' ? 'danger' : user.role === 'seller' ? 'warning' : 'secondary'}
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm text-foreground-secondary">{formatDate(user.created_at, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function DisputesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispute Resolution</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          variant="card"
          tone="warning"
          icon={<Scale className="h-6 w-6" />}
          title="Disputes list unavailable"
          description="The current admin API resolves disputes by trade_id but does not expose a disputes listing endpoint."
        >
          <p className="text-sm text-foreground-secondary mt-2">
            This section is intentionally limited so the frontend does not call unsupported routes.
          </p>
        </EmptyState>
      </CardContent>
    </Card>
  );
}

function TreasuryTab() {
  const { mutateAsync: disburseTreasury, isPending } = useAdminApi().disburseTreasury;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    await disburseTreasury({
      amount_sats: Math.max(1, Number(amount) || 0),
      description,
    });
    setAmount('');
    setDescription('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Treasury Actions</CardTitle>
        <CardDescription>The current API supports disbursement creation, but not treasury summary or ledger reads.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleDisburse}>
          <InputField label="Amount (sats)" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="font-mono" />
          <InputField label="Description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button type="submit" isLoading={isPending}>
            <Send size={14} className="mr-1" />
            Submit Disbursement
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function Admin() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Layout adminOnly>
      <div className="space-y-6">
        <SectionHeader
          title="Admin Dashboard"
          description="Platform management and oversight"
          leading={
            <div className="w-10 h-10 rounded-lg bg-accent-red/10 flex items-center justify-center">
              <Shield className="text-accent-red" size={20} />
            </div>
          }
        />

        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-accent-bitcoin text-accent-bitcoin'
                    : 'border-transparent text-foreground-secondary hover:text-foreground'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StatsOverview />
            <div className="grid lg:grid-cols-2 gap-6">
              <DisputesTab />
              <TreasuryTab />
            </div>
          </div>
        )}

        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'disputes' && <DisputesTab />}
        {activeTab === 'treasury' && <TreasuryTab />}
      </div>
    </Layout>
  );
}
