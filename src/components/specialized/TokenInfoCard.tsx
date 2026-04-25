import { ShieldCheck } from 'lucide-react';
import { getAssetIcon } from '@lib/icons';
import { Card, CardContent, CardHeader } from '@components/ui/Card';
import { InfoRow } from '@components/ui/InfoRow';
import { Badge } from '@components/ui/Badge';
import { formatDate, formatNumber, formatSats } from '@lib/utils';
import type { Asset } from '@types';

interface TokenInfoCardProps {
  asset: Asset;
}

export function TokenInfoCard({ asset }: TokenInfoCardProps) {
  const token = asset.token;

  if (!token) {
    return null;
  }

  // Choose icon based on category
  const CategoryIcon = getAssetIcon(asset.category, asset.id);

  return (
    <Card glass glow="none" noPadding className="overflow-hidden">
      {/* Icon header section instead of image */}
      <div className="flex flex-col items-center justify-center bg-background-elevated p-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-accent-bitcoin/10 text-accent-bitcoin shadow-[0_0_40px_rgba(247,147,26,0.15)]">
          <CategoryIcon size={48} />
        </div>
      </div>

      <CardHeader className="pt-6 px-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">{asset.name}</h2>
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <span className="capitalize">{asset.category.replace('_', ' ')}</span>
              {asset.location && (
                <>
                  <span>•</span>
                  <span>{asset.location}</span>
                </>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="font-mono text-base">
            {token.ticker}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-6 px-6">
        <div className="rounded-lg bg-background-elevated/50 p-4 space-y-3">
          <InfoRow 
            label="Valor Total" 
            value={`${formatSats(asset.valuation_sat)} sats`}
            valueClassName="text-lg font-bold text-accent-bitcoin font-mono"
          />
          <InfoRow 
            label="Precio por Token" 
            value={`${formatSats(token.unit_price_sats)} sats`}
            valueClassName="font-mono"
          />
          <InfoRow 
            label="Tokens Disponibles" 
            value={formatNumber(token.circulating_supply ?? token.total_supply, 0)}
            valueClassName="font-mono"
          />
          <InfoRow 
            label="Supply Total" 
            value={formatNumber(token.total_supply, 0)}
            valueClassName="font-mono text-foreground-secondary"
          />
        </div>

        <div className="space-y-3 px-2">
          {asset.projected_roi && (
            <InfoRow 
              label="Rendimiento Proyectado" 
              value={`${asset.projected_roi}%`}
              valueClassName="text-accent-green font-medium"
            />
          )}
          <InfoRow 
            label="Fecha de Emisión" 
            value={formatDate(token.minted_at, false)}
          />
          <InfoRow 
            label="Estado" 
            value={
              <div className="flex items-center gap-1.5 text-accent-green">
                <ShieldCheck size={14} />
                <span className="capitalize">{token.visibility || 'Public'}</span>
              </div>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
