import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn, formatSats, formatPercentage, formatDate } from '@lib/utils';
import {
  Layout,
  AIScoreGauge,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  EmptyState,
  InfoRow,
  SectionHeader,
  StatTile,
} from '@components';
import { InputField } from '@components/forms';
import { useTokenizationApi } from '@hooks';
import type { Asset } from '@types';

// Mocks removed

export function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [totalSupply, setTotalSupply] = useState('1000');
  const [unitPriceSat, setUnitPriceSat] = useState('1000');
  const { data: asset, isLoading } = useTokenizationApi().getAssetDetail(id || '');
  const { mutate: evaluate, isPending: isEvaluating } = useTokenizationApi().evaluateAsset;
  const { mutate: tokenize, isPending: isTokenizing } = useTokenizationApi().tokenizeAsset;
  const change24h = 2.3; // Mock tracking data

  if (isLoading) {
    return (
      <Layout>
        <EmptyState
          variant="page"
          tone="warning"
          title="Loading asset..."
          icon={<div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        />
      </Layout>
    );
  }

  if (!asset) {
    return (
      <Layout>
        <EmptyState
          variant="page"
          title="Asset not found"
          description="The requested asset does not exist or is no longer available."
          action={
            <Link to="/assets">
              <Button>Back to Assets</Button>
            </Link>
          }
        />
      </Layout>
    );
  }

  const isTokenized = asset.status === 'tokenized';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back button */}
        <Link to="/assets">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
            Back to Assets
          </Button>
        </Link>

        <SectionHeader
          title={asset.name}
          description={asset.description}
          leading={
            <div className="w-16 h-16 rounded-xl bg-accent-bitcoin/10 flex items-center justify-center">
              <Building2 className="text-accent-bitcoin" size={32} />
            </div>
          }
          meta={
            <Badge variant={isTokenized ? 'success' : asset.status === 'approved' ? 'warning' : 'secondary'}>
              {asset.status}
            </Badge>
          }
          actions={
            isTokenized ? (
              <div className="flex flex-col items-end">
                <p className="font-mono text-3xl font-bold">{formatSats(asset.token!.unit_price_sats)}</p>
                <p className="text-foreground-secondary">sats per unit</p>
                <div
                  className={cn(
                    'flex items-center gap-1 mt-2',
                    change24h >= 0 ? 'text-accent-green' : 'text-accent-red'
                  )}
                >
                  {change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="font-medium">{formatPercentage(change24h)}</span>
                  <span className="text-foreground-secondary">24h</span>
                </div>
              </div>
            ) : null
          }
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Analysis */}
            {asset.ai_score && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield size={20} className="text-accent-bitcoin" />
                    AI Evaluation
                  </CardTitle>
                  <CardDescription>Automated asset analysis and risk assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-6">
                      <AIScoreGauge score={asset.ai_score} size="md" />
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-foreground-secondary">Projected ROI</p>
                          <p className="font-medium text-accent-green">+{asset.projected_roi}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background-elevated rounded-lg p-4">
                      <p className="text-sm text-foreground-secondary mb-2">Analysis Summary</p>
                      <p className="text-sm">{asset.ai_analysis}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Token Info */}
            {isTokenized && asset.token && (
              <Card>
                <CardHeader>
                  <CardTitle>Token Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatTile
                      label="Total Supply"
                      value={`${asset.token.total_supply.toLocaleString()} units`}
                      mono
                    />
                    <StatTile label="Market Cap" value={`${formatSats(asset.token.market_cap_sats)} sats`} mono />
                    <StatTile label="Minted" value={formatDate(asset.token.minted_at, false)} mono />
                    <StatTile label="Asset Group" value={asset.token.asset_group_key} mono className="truncate" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {asset.documents_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} />
                    Supporting Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                      <a
                        href={asset.documents_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg bg-background-elevated hover:bg-background-elevated/80 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-foreground-secondary" />
                          <span className="font-medium">View Documents</span>
                          <Badge variant="secondary" size="sm">URL</Badge>
                        </div>
                        <ArrowRight size={16} className="text-foreground-secondary group-hover:text-foreground" />
                      </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card glow="bitcoin">
              <CardContent className="p-6">
                {isTokenized ? (
                  <>
                    <p className="text-foreground-secondary mb-4">Trade this asset on the marketplace</p>
                    <Link to={`/marketplace/${asset.token!.id}`}>
                      <Button fullWidth size="lg" rightIcon={<ArrowRight size={18} />}>
                        Trade Now
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-foreground-secondary mb-4">
                      This asset is currently {asset.status.replace('_', ' ')}.
                    </p>
                    {asset.status === 'pending' && (
                       <Button fullWidth onClick={() => evaluate(asset.id)} isLoading={isEvaluating}>
                         Request AI Evaluation
                       </Button>
                    )}
                    {asset.status === 'approved' && (
                      <div className="space-y-3">
                        <InputField
                          label="Total Supply"
                          labelClassName="text-xs text-foreground-secondary mb-1"
                          type="number"
                          min="1"
                          value={totalSupply}
                          onChange={(e) => setTotalSupply(e.target.value)}
                          className="font-mono"
                        />
                        <InputField
                          label="Unit Price (sats)"
                          labelClassName="text-xs text-foreground-secondary mb-1"
                          type="number"
                          min="1"
                          value={unitPriceSat}
                          onChange={(e) => setUnitPriceSat(e.target.value)}
                          className="font-mono"
                        />
                        <Button
                          fullWidth
                          onClick={() =>
                            tokenize({
                              assetId: asset.id,
                              total_supply: Math.max(1, Number(totalSupply) || 0),
                              unit_price_sat: Math.max(1, Number(unitPriceSat) || 0),
                            })
                          }
                          isLoading={isTokenizing}
                        >
                          Tokenize Asset
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Asset Info */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Category" value={asset.category.replace('_', ' ')} valueClassName="capitalize" />
                <InfoRow label="Estimated Value" value={`${formatSats(asset.valuation_sat)} sats`} valueClassName="font-mono" />
                <InfoRow label="Created" value={formatDate(asset.created_at, false)} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
