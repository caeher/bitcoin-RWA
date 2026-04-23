import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/Card';
import { SatoshiAmount } from './SatoshiAmount';
import { useTokenizationApi } from '@hooks';

export function PortfolioTableCard() {
  const { data: assetsData } = useTokenizationApi().getAssets('tokenized');
  const tokens = assetsData?.items || [];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={20} className="text-accent-bitcoin" />
            Token Portfolio
          </CardTitle>
          <CardDescription>Your tokenized asset holdings</CardDescription>
        </div>
        <Link to="/assets">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left text-xs font-medium text-foreground-secondary">Asset</th>
                <th className="py-3 text-right text-xs font-medium text-foreground-secondary">Units</th>
                <th className="py-3 text-right text-xs font-medium text-foreground-secondary">Value</th>
                <th className="py-3 text-right text-xs font-medium text-foreground-secondary">24h</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((asset) => (
                <tr key={asset.id} className="border-b border-border/50 hover:bg-background-elevated/50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-bitcoin/10">
                        <span className="text-xs font-bold text-accent-bitcoin">{asset.token?.ticker || 'TKN'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{asset.name}</p>
                        <p className="text-xs text-foreground-secondary">{asset.token?.ticker}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono text-sm">--</td>
                  <td className="py-3 text-right">
                    <SatoshiAmount amount={asset.valuation_sat} size="sm" />
                  </td>
                  <td className="py-3 text-right text-sm font-medium text-foreground-secondary">--</td>
                </tr>
              ))}
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-foreground-secondary">
                    No assets found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}