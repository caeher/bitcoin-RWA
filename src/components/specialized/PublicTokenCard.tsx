import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAssetIcon } from '@lib/icons';
import { Card, CardContent } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { formatNumber, formatSats } from '@lib/utils';
import type { Asset } from '@types';

interface PublicTokenCardProps {
  asset: Asset;
}

export function PublicTokenCard({ asset }: PublicTokenCardProps) {
  const token = asset.token;

  if (!token) {
    return null;
  }

  const CategoryIcon = getAssetIcon(asset.category, asset.id);

  return (
    <Link to={`/marketplace/${token.id}`} className="block transition-transform hover:scale-[1.02]">
      <Card glass noPadding className="h-full overflow-hidden flex flex-col">
        {/* Header with Icon */}
        <div className="bg-background-elevated p-6 flex items-center justify-center border-b border-border/50">
          <div className="h-16 w-16 flex items-center justify-center rounded-xl bg-accent-bitcoin/10 text-accent-bitcoin shadow-[0_0_20px_rgba(247,147,26,0.1)]">
            <CategoryIcon size={32} />
          </div>
        </div>

        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground line-clamp-1">{asset.name}</h3>
              <p className="text-xs text-foreground-secondary uppercase tracking-wider font-medium">
                {asset.category.replace('_', ' ')}
              </p>
            </div>
            <Badge variant="secondary" size="sm" className="font-mono">
              {token.ticker}
            </Badge>
          </div>

          <div className="space-y-3 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-secondary">Valor total</span>
              <span className="text-base font-bold text-accent-bitcoin font-mono">
                {formatSats(token.market_cap_sats)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/30">
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-foreground-muted font-bold">Precio Unitario</p>
                <p className="text-sm font-mono font-medium">{formatSats(token.unit_price_sats)}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase text-foreground-muted font-bold">Disponible</p>
                <p className="text-sm font-mono font-medium">{formatNumber(token.circulating_supply ?? token.total_supply, 0)}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" fullWidth className="mt-4 group-hover:bg-accent-bitcoin group-hover:text-background transition-colors">
              Ver token
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
