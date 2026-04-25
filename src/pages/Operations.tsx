import { FormEvent, useState } from 'react';
import {
  BadgeCheck,
  FileText,
  KeyRound,
  Megaphone,
  Repeat2,
  Scale,
  Search,
  Shield,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import {
  Badge,
  BlockExplorerLink,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Layout,
  SectionHeader,
} from '@components';
import { Input, StatTile } from '@components/ui';
import { SelectField, TextareaField } from '@components/forms';
import {
  useAdminApi,
  useAuthApi,
  useMarketplaceApi,
  useNostrApi,
  useTokenizationApi,
  useWalletApi,
} from '@hooks';
import { formatSats } from '@lib/utils';
import { useNotificationStore } from '@stores';
import type { User } from '@types';

type OperationTab = 'wallet' | 'liquid' | 'marketplace' | 'nostr' | 'auth' | 'admin';

const tabs: { id: OperationTab; label: string; icon: LucideIcon }[] = [
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'liquid', label: 'Liquid', icon: Repeat2 },
  { id: 'marketplace', label: 'Marketplace', icon: Scale },
  { id: 'nostr', label: 'Nostr', icon: Megaphone },
  { id: 'auth', label: 'Auth', icon: KeyRound },
  { id: 'admin', label: 'Admin', icon: Shield },
];

function JsonBlock({ data }: { data: unknown }) {
  if (data == null) {
    return <p className="text-sm text-foreground-secondary">No data loaded yet.</p>;
  }

  return (
    <pre className="max-h-80 overflow-auto rounded-md bg-background-elevated p-3 text-xs leading-relaxed text-foreground-secondary">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function ExplorerSummaryRow({ label, type, value }: { label: string; type: 'tx' | 'block' | 'address'; value?: string | null }) {
  if (!value) return null;

  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-background-elevated p-3">
      <span className="text-xs font-medium uppercase tracking-wide text-foreground-secondary">{label}</span>
      <BlockExplorerLink type={type} value={value} />
    </div>
  );
}

function OperationCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function WalletOperations() {
  const walletApi = useWalletApi();
  const { success } = useNotificationStore();
  const { data: yieldSummary } = walletApi.getYieldSummary();
  const { data: peginAddress } = walletApi.getPeginAddress();
  const [invoiceHash, setInvoiceHash] = useState('');
  const { data: invoiceStatus } = walletApi.getInvoiceStatus(invoiceHash);
  const { data: walletQr } = walletApi.getWalletQr(peginAddress?.liquid_address || peginAddress?.mainchain_address);
  const { mutateAsync: claimPegin, isPending: isClaiming } = walletApi.claimPegin;
  const { mutateAsync: pegout, isPending: isPeggingOut } = walletApi.pegout;
  const [claimTxid, setClaimTxid] = useState('');
  const [claimVout, setClaimVout] = useState('0');
  const [pegoutAddress, setPegoutAddress] = useState('');
  const [pegoutAmount, setPegoutAmount] = useState('');

  const handleClaim = async (event: FormEvent) => {
    event.preventDefault();
    await claimPegin({
      mainchain_txid: claimTxid,
      vout: Math.max(0, Number(claimVout) || 0),
    });
    success('Peg-in claim submitted', 'The wallet balance will update after confirmation.');
    setClaimTxid('');
    setClaimVout('0');
  };

  const handlePegout = async (event: FormEvent) => {
    event.preventDefault();
    await pegout({
      address: pegoutAddress,
      amount_sat: Math.max(1, Number(pegoutAmount) || 0),
    });
    success('Peg-out submitted', 'The withdrawal request was sent to the wallet service.');
    setPegoutAddress('');
    setPegoutAmount('');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <OperationCard title="Yield and Peg-in" description="Wallet yield summary, peg-in address, QR and claim flow.">
        <div className="grid sm:grid-cols-2 gap-3">
          <StatTile label="Yield total" value={formatSats(yieldSummary?.total_yield_sat || 0)} mono />
          <StatTile label="Accruals" value={yieldSummary?.accruals?.length || yieldSummary?.items?.length || 0} mono />
        </div>
        <div className="grid gap-3">
          <ExplorerSummaryRow label="Mainchain address" type="address" value={peginAddress?.mainchain_address} />
          <ExplorerSummaryRow label="Liquid address" type="address" value={peginAddress?.liquid_address} />
          <ExplorerSummaryRow label="Claim txid" type="tx" value={claimTxid} />
        </div>
        <JsonBlock data={{ peginAddress, walletQr }} />
        <form className="space-y-3" onSubmit={handleClaim}>
          <Input label="Mainchain txid" value={claimTxid} onChange={(event) => setClaimTxid(event.target.value)} required />
          <Input label="Vout" type="number" min="0" value={claimVout} onChange={(event) => setClaimVout(event.target.value)} required />
          <Button type="submit" isLoading={isClaiming} leftIcon={<BadgeCheck size={16} />}>
            Claim peg-in
          </Button>
        </form>
      </OperationCard>

      <OperationCard title="Lightning and Peg-out" description="Invoice status lookup and Liquid-to-Bitcoin withdrawal.">
        <Input
          label="Lightning invoice hash"
          value={invoiceHash}
          onChange={(event) => setInvoiceHash(event.target.value)}
          placeholder="r_hash"
        />
        <ExplorerSummaryRow label="Peg-out destination" type="address" value={pegoutAddress} />
        <JsonBlock data={invoiceStatus} />
        <form className="space-y-3" onSubmit={handlePegout}>
          <Input label="Peg-out address" value={pegoutAddress} onChange={(event) => setPegoutAddress(event.target.value)} required />
          <Input label="Amount (sats)" type="number" min="1" value={pegoutAmount} onChange={(event) => setPegoutAmount(event.target.value)} required />
          <Button type="submit" variant="danger" isLoading={isPeggingOut} leftIcon={<Wallet size={16} />}>
            Submit peg-out
          </Button>
        </form>
      </OperationCard>
    </div>
  );
}

function LiquidOperations() {
  const tokenizationApi = useTokenizationApi();
  const { data: liquidInfo } = tokenizationApi.getLiquidInfo();
  const { data: issuances } = tokenizationApi.getLiquidIssuances();
  const [assetId, setAssetId] = useState('');
  const { data: assetDocument } = tokenizationApi.getAssetDocument(assetId);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <OperationCard title="Liquid network" description="Node information and issuance registry.">
        <JsonBlock data={{ liquidInfo, issuances }} />
      </OperationCard>
      <OperationCard title="Asset document" description="Fetch the managed document metadata for a tokenization asset.">
        <Input label="Asset ID" value={assetId} onChange={(event) => setAssetId(event.target.value)} placeholder="asset UUID" />
        <JsonBlock data={assetDocument} />
      </OperationCard>
    </div>
  );
}

function MarketplaceOperations() {
  const marketplaceApi = useMarketplaceApi();
  const { success } = useNotificationStore();
  const { mutateAsync: externalSign, isPending: isExternalSigning } = marketplaceApi.externalSignEscrow;
  const { mutateAsync: resolveDispute, isPending: isResolving } = marketplaceApi.resolveDispute;
  const [tradeId, setTradeId] = useState('');
  const [signature, setSignature] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [resolution, setResolution] = useState('release');
  const [notes, setNotes] = useState('');

  const handleExternalSign = async (event: FormEvent) => {
    event.preventDefault();
    await externalSign({ trade_id: tradeId, signature, public_key: publicKey || undefined });
    success('External signature submitted', 'The escrow was updated with the external signer response.');
  };

  const handleResolve = async (event: FormEvent) => {
    event.preventDefault();
    await resolveDispute({ trade_id: tradeId, resolution, notes });
    success('Dispute resolved', 'The marketplace dispute resolution endpoint accepted the update.');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <OperationCard title="External escrow signing" description="Submit a signature generated outside the browser wallet flow.">
        <form className="space-y-3" onSubmit={handleExternalSign}>
          <Input label="Trade ID" value={tradeId} onChange={(event) => setTradeId(event.target.value)} required />
          <TextareaField label="Signature" value={signature} onChange={(event) => setSignature(event.target.value)} required />
          <Input label="Public key" value={publicKey} onChange={(event) => setPublicKey(event.target.value)} />
          <Button type="submit" isLoading={isExternalSigning} leftIcon={<KeyRound size={16} />}>
            Submit signature
          </Button>
        </form>
      </OperationCard>
      <OperationCard title="Marketplace dispute resolution" description="Resolve a trade dispute through the marketplace service.">
        <form className="space-y-3" onSubmit={handleResolve}>
          <Input label="Trade ID" value={tradeId} onChange={(event) => setTradeId(event.target.value)} required />
          <SelectField
            label="Resolution"
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            options={[
              { value: 'release', label: 'Release funds' },
              { value: 'refund', label: 'Refund buyer' },
              { value: 'split', label: 'Split settlement' },
            ]}
          />
          <TextareaField label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <Button type="submit" variant="success" isLoading={isResolving} leftIcon={<Scale size={16} />}>
            Resolve dispute
          </Button>
        </form>
      </OperationCard>
    </div>
  );
}

function NostrOperations() {
  const { success } = useNotificationStore();
  const { mutateAsync: createAnnouncement, isPending } = useNostrApi().createAnnouncement;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [result, setResult] = useState<unknown>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const response = await createAnnouncement({
      title: title || undefined,
      content,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    });
    setResult(response);
    success('Announcement published', 'The Nostr service accepted the announcement.');
  };

  return (
    <OperationCard title="Announcements" description="Publish platform announcements through the Nostr service.">
      <form className="grid gap-3 xl:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
          <Input label="Tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="bitcoin,rwa" />
          <TextareaField label="Content" value={content} onChange={(event) => setContent(event.target.value)} required />
          <Button type="submit" isLoading={isPending} leftIcon={<Megaphone size={16} />}>
            Publish announcement
          </Button>
        </div>
        <JsonBlock data={result} />
      </form>
    </OperationCard>
  );
}

function AuthOperations() {
  const authApi = useAuthApi();
  const { success } = useNotificationStore();
  const [role, setRole] = useState<User['role']>('user');
  const { data: roleUsers } = authApi.getRoleUsers(role);
  const { mutateAsync: verifyKey, isPending } = authApi.verifyInternalApiKey;
  const [apiKey, setApiKey] = useState('');
  const [scopes, setScopes] = useState('');
  const [verification, setVerification] = useState<unknown>(null);

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    const response = await verifyKey({
      api_key: apiKey,
      required_scopes: scopes.split(',').map((scope) => scope.trim()).filter(Boolean),
    });
    setVerification(response);
    success('API key checked', response.valid ? 'The key is valid.' : 'The key was rejected.');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <OperationCard title="Role directories" description="Read users grouped by authorization role.">
        <SelectField
          label="Role"
          value={role}
          onChange={(event) => setRole(event.target.value as User['role'])}
          options={[
            { value: 'user', label: 'Users' },
            { value: 'seller', label: 'Sellers' },
            { value: 'admin', label: 'Admins' },
            { value: 'auditor', label: 'Auditors' },
          ]}
        />
        <JsonBlock data={roleUsers} />
      </OperationCard>
      <OperationCard title="Internal API key verification" description="Check an API key and optional required scopes.">
        <form className="space-y-3" onSubmit={handleVerify}>
          <TextareaField label="API key" value={apiKey} onChange={(event) => setApiKey(event.target.value)} required />
          <Input label="Required scopes" value={scopes} onChange={(event) => setScopes(event.target.value)} placeholder="wallet:read,tokenization:read" />
          <Button type="submit" isLoading={isPending} leftIcon={<Search size={16} />}>
            Verify key
          </Button>
        </form>
        <JsonBlock data={verification} />
      </OperationCard>
    </div>
  );
}

function AdminOperations() {
  const adminApi = useAdminApi();
  const [userId, setUserId] = useState('');
  const { data: referralUser } = adminApi.getReferralByUser(userId);
  const { data: yieldUser } = adminApi.getYieldByUser(userId);
  const { data: referralSummary } = adminApi.getReferralSummary();
  const { data: yieldSummary } = adminApi.getYieldSummary();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <OperationCard title="Platform summaries" description="Admin referral and yield summaries.">
        <div className="grid sm:grid-cols-2 gap-3">
          <StatTile label="Referred users" value={referralSummary?.referred_users?.length || 0} />
          <StatTile label="Yield paid" value={formatSats(yieldSummary?.total_yield_sat || 0)} mono />
        </div>
        <JsonBlock data={{ referralSummary, yieldSummary }} />
      </OperationCard>
      <OperationCard title="User-level admin lookup" description="Inspect referral and yield activity for a specific user.">
        <Input label="User ID" value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="user UUID" />
        <JsonBlock data={{ referralUser, yieldUser }} />
      </OperationCard>
    </div>
  );
}

export function Operations() {
  const [activeTab, setActiveTab] = useState<OperationTab>('wallet');

  return (
    <Layout>
      <div className="space-y-6">
        <SectionHeader
          title="Operations"
          description="Advanced API functions exposed from the generated OpenAPI surface."
          leading={
            <div className="w-10 h-10 rounded-lg bg-accent-bitcoin/10 flex items-center justify-center">
              <FileText className="text-accent-bitcoin" size={20} />
            </div>
          }
          meta={<Badge variant="info">Full API coverage</Badge>}
        />

        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                type="button"
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                leftIcon={<Icon size={14} />}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>

        {activeTab === 'wallet' && <WalletOperations />}
        {activeTab === 'liquid' && <LiquidOperations />}
        {activeTab === 'marketplace' && <MarketplaceOperations />}
        {activeTab === 'nostr' && <NostrOperations />}
        {activeTab === 'auth' && <AuthOperations />}
        {activeTab === 'admin' && <AdminOperations />}
      </div>
    </Layout>
  );
}
