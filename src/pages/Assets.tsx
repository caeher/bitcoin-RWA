import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Search,
  Building2
} from 'lucide-react';
import { getAssetIcon } from '@lib/icons';
import { cn, formatSats, formatPercentage } from '@lib/utils';
import { Layout, AIScoreGauge } from '@components/specialized';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { EmptyState } from '@components/ui/EmptyState';
import { SectionHeader } from '@components/ui/SectionHeader';
import { InputField, SelectField } from '@components/forms';
import { useTokenizationApi } from '@hooks';
import type { Asset } from '../types';

// Mocks removed

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'commodity', label: 'Commodity' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'art', label: 'Art' },
  { value: 'other', label: 'Other' },
];

const statuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'tokenized', label: 'Tokenized' },
  { value: 'approved', label: 'Approved' },
  { value: 'evaluating', label: 'Evaluating' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

function AssetCard({ asset }: { asset: Asset }) {
  const change24h = Math.random() * 20 - 10; // Mock 24h change
  const isTokenized = asset.status === 'tokenized';
  
  const CategoryIcon = getAssetIcon(asset.category, asset.id);

  return (
    <Link to={`/assets/${asset.id}`}>
      <Card className="h-full hover:border-accent-bitcoin/30 transition-all group">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-bitcoin/10 flex items-center justify-center">
              <CategoryIcon className="text-accent-bitcoin" size={24} />
            </div>
            <Badge 
              variant={isTokenized ? 'success' : asset.status === 'approved' ? 'warning' : 'secondary'}
            >
              {asset.status}
            </Badge>
          </div>

          {/* Title & Description */}
          <h3 className="font-semibold text-lg mb-1 group-hover:text-accent-bitcoin transition-colors">
            {asset.name}
          </h3>
          <p className="text-sm text-foreground-secondary line-clamp-2 mb-4">
            {asset.description}
          </p>

          {/* AI Score if available */}
          {asset.ai_score && (
            <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-background-elevated">
              <AIScoreGauge score={asset.ai_score} size="sm" showLabel={false} />
              <div>
                <p className="text-xs text-foreground-secondary">AI Score</p>
                <p className="text-sm font-medium">{asset.projected_roi}% ROI</p>
              </div>
            </div>
          )}

          {/* Price & Change */}
          {isTokenized && asset.token && (
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-foreground-secondary mb-1">Price per unit</p>
                <p className="font-mono font-medium">{formatSats(asset.token.unit_price_sats)} sats</p>
              </div>
              <div className={cn(
                'flex items-center gap-1 text-sm',
                change24h >= 0 ? 'text-accent-green' : 'text-accent-red'
              )}>
                {change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {formatPercentage(change24h)}
              </div>
            </div>
          )}

          {/* Pending state */}
          {!isTokenized && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-secondary">Est. Value</span>
              <span className="font-mono">{formatSats(asset.valuation_sat)} sats</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function Assets() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusParam = selectedStatus === 'all' ? undefined : selectedStatus;
  const categoryParam = selectedCategory === 'all' ? undefined : selectedCategory;
  
  const { data: assetsData, isLoading } = useTokenizationApi().getAssets(statusParam, categoryParam, undefined, true);
  const assetsList = assetsData?.items || [];

  const filteredAssets = useMemo(() => {
    return assetsList.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery, assetsList]);

  const tokenizedCount = assetsList.filter(a => a.status === 'tokenized').length;
  const totalValue = assetsList.reduce((sum, a) => sum + (a.token?.market_cap_sats || a.valuation_sat), 0);

  return (
    <Layout requireAuth={false}>
      <div className="space-y-6">
        <SectionHeader
          title="Assets"
          description={`Browse ${tokenizedCount} tokenized assets worth ${formatSats(totalValue)} sats`}
          actions={
            <Link to="/assets/submit">
              <Button leftIcon={<Plus size={18} />}>
                Submit Asset
              </Button>
            </Link>
          }
        />

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <InputField
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftElement={<Search size={18} />}
                />
              </div>
              <div className="flex gap-2">
                <SelectField value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} options={categories} />
                <SelectField value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} options={statuses} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset Grid */}
        {isLoading ? (
          <EmptyState
            variant="page"
            tone="warning"
            title="Loading assets..."
            icon={<div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full" />}
          />
        ) : filteredAssets.length === 0 ? (
          <EmptyState
            variant="page"
            title="No assets found"
            description="Try adjusting your filters"
            icon={<Building2 size={24} />}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
