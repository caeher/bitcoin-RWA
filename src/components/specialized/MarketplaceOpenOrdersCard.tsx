import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/Card';
import { EmptyState } from '@components/ui/EmptyState';
import { Badge } from '@components/ui/Badge';
import { formatSats } from '@lib/utils';
import { useMarketplaceApi } from '@hooks';

export function MarketplaceOpenOrdersCard() {
  const { data: ordersData } = useMarketplaceApi().getOrders(undefined, undefined, 'open');
  const orders = ordersData?.items || [];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Open Orders</CardTitle>
          <CardDescription>Active buy/sell orders</CardDescription>
        </div>
        <Link to="/marketplace">
          <Button variant="outline" size="sm">
            Marketplace
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <EmptyState
            variant="card"
            title="No open orders"
            description="Your active buy and sell orders will appear here."
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg bg-background-elevated p-3">
                <div className="flex items-center gap-3">
                  <Badge variant={order.side === 'buy' ? 'success' : 'danger'}>
                    {order.side.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">Token {order.token_id}</p>
                    <p className="text-xs text-foreground-secondary">
                      {order.quantity} units @ {formatSats(order.price_sat)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-mono">{formatSats(order.quantity * order.price_sat)} sats</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}