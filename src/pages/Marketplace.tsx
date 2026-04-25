import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  Search,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { formatNumber, formatSats } from '@lib/utils';
import { useTokenizationApi } from '@hooks';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Layout,
  PublicTokenCard,
  SectionHeader,
  StatTile,
} from '@components';
import { InputField, SelectField } from '@components/forms';
import type { Asset } from '@types';

type SortBy = 'newest' | 'price' | 'market_cap' | 'supply';

const sortOptions = [
  { value: 'newest', label: 'Sort by Newest' },
  { value: 'market_cap', label: 'Sort by Market Cap' },
  { value: 'price', label: 'Sort by Price' },
  { value: 'supply', label: 'Sort by Supply' },
];



export function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const { data: assetsData, isLoading, error } = useTokenizationApi().getAssets('tokenized', undefined, undefined, true);

  const publicTokens = useMemo(() => {
    const items = (assetsData?.items || []).filter((asset) => asset.token?.visibility === 'public');

    const searched = items.filter((asset) => {
      const haystack = `${asset.name} ${asset.description} ${asset.token?.ticker || ''}`.toLowerCase();
      return haystack.includes(searchQuery.toLowerCase());
    });

    return searched.sort((left, right) => {
      const leftToken = left.token!;
      const rightToken = right.token!;

      switch (sortBy) {
        case 'price':
          return rightToken.unit_price_sats - leftToken.unit_price_sats;
        case 'market_cap':
          return rightToken.market_cap_sats - leftToken.market_cap_sats;
        case 'supply':
          return rightToken.total_supply - leftToken.total_supply;
        case 'newest':
        default:
          return new Date(rightToken.minted_at).getTime() - new Date(leftToken.minted_at).getTime();
      }
    });
  }, [assetsData?.items, searchQuery, sortBy]);

  const totalMarketCap = publicTokens.reduce((sum, asset) => sum + (asset.token?.market_cap_sats || 0), 0);
  const totalSupply = publicTokens.reduce((sum, asset) => sum + (asset.token?.total_supply || 0), 0);

  return (
    <Layout requireAuth={true}>
      <div className="space-y-6">
        <SectionHeader
          title="Public Tokens"
          description="Tokenized assets issued on the platform and available for public access."
          actions={
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <ShieldCheck size={18} className="text-accent-bitcoin" />
              <span>Platform-issued catalog</span>
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile label="Public Tokens" value={publicTokens.length} mono surface="subtle" />
          <StatTile label="Market Cap" value={`${formatSats(totalMarketCap)} sats`} mono surface="subtle" />
          <StatTile label="Total Supply" value={formatNumber(totalSupply, 0)} mono surface="subtle" />
          <StatTile label="Verified Visibility" value="Public" mono surface="subtle" valueTone="success" />
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <InputField
                  type="text"
                  placeholder="Search public tokens..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  leftElement={<Search size={18} />}
                />
              </div>
              <SelectField
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortBy)}
                options={sortOptions}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Available Public Tokens</CardTitle>
              <p className="mt-1 text-sm text-foreground-secondary">
                Browse our curated selection of tokenized real-world assets.
              </p>
            </div>
            <Link to="/wallet">
              <Button variant="outline" leftIcon={<ShoppingCart size={16} />}>
                Wallet
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <EmptyState
                variant="page"
                tone="warning"
                title="Loading public tokens..."
                icon={<div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              />
            ) : error ? (
              <EmptyState
                variant="page"
                tone="warning"
                title="Public catalog unavailable"
                description="The API did not return the public token catalog. Check backend access rules for tokenized assets."
              />
            ) : publicTokens.length === 0 ? (
              <EmptyState
                variant="page"
                title="No public tokens found"
                description="No tokenized assets with public visibility are available yet."
                icon={<BadgeCheck size={24} />}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {publicTokens.map((asset) => (
                  <PublicTokenCard key={asset.id} asset={asset} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
