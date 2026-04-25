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
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Target,
  BarChart3
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
import { InputField, SelectField } from '@components/forms';
import { useTokenizationApi } from '@hooks';
import { useAuthStore } from '@stores';

// Mocks removed

export function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [totalSupply, setTotalSupply] = useState('1000');
  const [unitPriceSat, setUnitPriceSat] = useState('1000');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const { data: asset, isLoading } = useTokenizationApi().getAssetDetail(id || '', true);
  const { mutate: evaluate, isPending: isEvaluating } = useTokenizationApi().evaluateAsset;
  const { mutate: tokenize, isPending: isTokenizing } = useTokenizationApi().tokenizeAsset;
  const normalizedOwnerId = asset?.owner_id?.trim().toLowerCase();
  const normalizedUserId = user?.id?.trim().toLowerCase();
  const isAssetOwner = !!normalizedOwnerId && !!normalizedUserId && normalizedOwnerId === normalizedUserId;
  const canApproveAsset = isAuthenticated && isAdmin();
  const canTokenizeAsset = isAuthenticated && !isAdmin() && isAssetOwner;
  const change24h = 2.3; // Mock tracking data

  if (isLoading) {
    return (
      <Layout requireAuth={false}>
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
      <Layout requireAuth={false}>
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
    <Layout requireAuth={false}>
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
            {asset.ai_score && (() => {
              let analysis: any = {};
              try {
                analysis = typeof asset.ai_analysis === 'string' 
                  ? JSON.parse(asset.ai_analysis) 
                  : asset.ai_analysis;
              } catch (e) {
                analysis = { summary: asset.ai_analysis };
              }

              return (
                <Card className="overflow-hidden border-accent-bitcoin/20 bg-gradient-to-br from-background-surface to-background-surface/50">
                  <CardHeader className="border-b border-border/40 bg-accent-bitcoin/5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Shield size={22} className="text-accent-bitcoin" />
                          AI Smart Analysis
                        </CardTitle>
                        <CardDescription>Comprehensive risk assessment and market timing report</CardDescription>
                      </div>
                      {analysis.risk_level && (
                        <Badge 
                          variant={analysis.risk_level === 'low' ? 'success' : 'warning'} 
                          className="px-3 py-1 text-sm uppercase tracking-wider"
                        >
                          {analysis.risk_level} Risk
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Top Stats Row */}
                    <div className="grid md:grid-cols-3 border-b border-border/40">
                      <div className="p-6 flex flex-col items-center justify-center border-r border-border/40 bg-background-elevated/30">
                        <AIScoreGauge score={asset.ai_score} size="md" />
                        <p className="mt-2 text-xs font-medium text-foreground-secondary uppercase tracking-widest">Trust Score</p>
                      </div>
                      <div className="p-6 flex flex-col justify-center border-r border-border/40">
                        <div className="flex items-center gap-3 mb-1 text-accent-green">
                          <TrendingUp size={20} />
                          <span className="text-sm font-semibold uppercase tracking-wider">Projected ROI</span>
                        </div>
                        <p className="text-3xl font-bold text-accent-green">+{asset.projected_roi}%</p>
                        <p className="text-xs text-foreground-secondary mt-1 italic">Estimated annual return</p>
                      </div>
                      <div className="p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-1 text-accent-bitcoin">
                          <Target size={20} />
                          <span className="text-sm font-semibold uppercase tracking-wider">Market Timing</span>
                        </div>
                        <p className="text-2xl font-bold capitalize">{analysis.market_timing || 'Neutral'}</p>
                        <p className="text-xs text-foreground-secondary mt-1">Based on current market trend</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Summary Section */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-widest flex items-center gap-2">
                          <FileText size={14} />
                          Analysis Summary
                        </h4>
                        <p className="text-foreground leading-relaxed italic border-l-2 border-accent-bitcoin/30 pl-4 py-1 bg-accent-bitcoin/5 rounded-r-lg">
                          "{analysis.summary}"
                        </p>
                      </div>

                      {/* Insights Grid */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="space-y-3 rounded-xl bg-accent-green/5 border border-accent-green/10 p-4">
                          <h4 className="text-sm font-bold text-accent-green flex items-center gap-2 uppercase tracking-wider">
                            <CheckCircle2 size={16} />
                            Key Strengths
                          </h4>
                          <ul className="space-y-2">
                            {analysis.strengths?.map((s: string, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2 text-foreground/80">
                                <span className="text-accent-green mt-1">•</span>
                                {s}
                              </li>
                            )) || <li className="text-sm text-foreground-secondary italic text-center py-2">No specific strengths noted</li>}
                          </ul>
                        </div>

                        {/* Concerns */}
                        <div className="space-y-3 rounded-xl bg-accent-orange/5 border border-accent-orange/10 p-4">
                          <h4 className="text-sm font-bold text-accent-orange flex items-center gap-2 uppercase tracking-wider">
                            <AlertCircle size={16} />
                            Risk Considerations
                          </h4>
                          <ul className="space-y-2">
                            {analysis.concerns?.map((c: string, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2 text-foreground/80">
                                <span className="text-accent-orange mt-1">•</span>
                                {c}
                              </li>
                            )) || <li className="text-sm text-foreground-secondary italic text-center py-2">No significant risks identified</li>}
                          </ul>
                        </div>
                      </div>

                      {/* Score Breakdown Footer */}
                      {analysis.score_breakdown && (
                        <div className="pt-4 border-t border-border/40">
                          <h4 className="text-[10px] font-bold text-foreground-secondary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <BarChart3 size={12} />
                            Technical Confidence Metrics
                          </h4>
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {Object.entries(analysis.score_breakdown).map(([key, val]: [string, any]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="text-[10px] text-foreground-secondary capitalize">{key.replace('_', ' ')}:</span>
                                <span className="text-[10px] font-mono font-bold text-accent-bitcoin">{Number(val).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

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
            {(asset.documents_url || asset.document) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} />
                    Supporting Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {asset.documents_url ? (
                      <a
                        href={asset.documents_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg bg-background-elevated p-3 transition-colors group hover:bg-background-elevated/80"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-foreground-secondary" />
                          <span className="font-medium">View Documents</span>
                          <Badge variant="secondary" size="sm">URL</Badge>
                        </div>
                        <ArrowRight size={16} className="text-foreground-secondary group-hover:text-foreground" />
                      </a>
                    ) : null}

                    {asset.document ? (
                      <div className="rounded-lg bg-background-elevated p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-foreground-secondary" />
                            <div>
                              <p className="font-medium">{asset.document.filename}</p>
                              <p className="text-xs text-foreground-secondary">
                                {asset.document.content_type} • {asset.document.size_bytes.toLocaleString()} bytes
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" size="sm">Managed</Badge>
                        </div>
                      </div>
                    ) : null}
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
                    {!isAuthenticated ? (
                      <div className="space-y-3">
                        <p className="text-sm text-foreground-secondary">
                          Sign in to review the status of this asset.
                        </p>
                        <br />
                        <Link to="/auth/login">
                          <Button fullWidth>Sign In</Button>
                        </Link>
                      </div>
                    ) : asset.status === 'pending' && canApproveAsset ? (
                      <Button
                        fullWidth
                        onClick={() => evaluate(asset.id)}
                        isLoading={isEvaluating}
                        loadingText="Approving..."
                      >
                        Approve Tokenization
                      </Button>
                    ) : asset.status === 'pending' ? (
                      <div className="rounded-lg border border-accent-bitcoin/20 bg-accent-bitcoin/10 p-4">
                        <p className="text-sm font-medium">Awaiting admin approval</p>
                        <p className="mt-1 text-sm text-foreground-secondary">
                          Your request has been sent. Please wait until an admin approves it before tokenizing.
                        </p>
                      </div>
                    ) : asset.status === 'evaluating' ? (
                      <div className="rounded-lg border border-border bg-background-elevated p-4">
                        <p className="text-sm font-medium">Review in progress</p>
                        <p className="mt-1 text-sm text-foreground-secondary">
                          This asset is being reviewed. Tokenization will become available to the owner if it is approved.
                        </p>
                      </div>
                    ) : canApproveAsset && asset.status === 'approved' ? (
                      <div className="rounded-lg border border-accent-green/20 bg-accent-green/10 p-4">
                        <p className="text-sm font-medium">Tokenization approved</p>
                        <p className="mt-1 text-sm text-foreground-secondary">
                          The owner can now tokenize this asset when they choose.
                        </p>
                      </div>
                    ) : asset.status === 'approved' && !isAssetOwner ? (
                      <div className="rounded-lg border border-accent-green/20 bg-accent-green/10 p-4">
                        <p className="text-sm font-medium">Approved for tokenization</p>
                        <p className="mt-1 text-sm text-foreground-secondary">
                          Only the asset owner can start tokenization.
                        </p>
                      </div>
                    ) : asset.status === 'approved' && isAdmin() ? (
                      <div className="rounded-lg border border-accent-green/20 bg-accent-green/10 p-4">
                        <p className="text-sm font-medium">Approved for tokenization</p>
                        <p className="mt-1 text-sm text-foreground-secondary">
                          Switch to the owner account to start tokenization.
                        </p>
                      </div>
                    ) : null}
                    {canTokenizeAsset && asset.status === 'approved' && (
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
                        <SelectField
                          label="Visibility"
                          value={visibility}
                          onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                          options={[
                            { value: 'public', label: 'Public token' },
                            { value: 'private', label: 'Private token' },
                          ]}
                        />
                        <Button
                          fullWidth
                          onClick={() =>
                            tokenize({
                              assetId: asset.id,
                              total_supply: Math.max(1, Number(totalSupply) || 0),
                              unit_price_sat: Math.max(1, Number(unitPriceSat) || 0),
                              visibility,
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
