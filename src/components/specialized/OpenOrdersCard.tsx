import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { EmptyState } from '@components/ui/EmptyState';
import { formatSats } from '@lib/utils';
import type { Order } from '@types';

interface OpenOrdersCardProps {
  title?: string;
  orders: Order[];
  emptyTitle?: string;
  emptyDescription?: string;
  onCancel?: (orderId: string) => void;
}

export function OpenOrdersCard({
  title = 'My Open Orders',
  orders,
  emptyTitle = 'No open orders',
  emptyDescription,
  onCancel,
}: OpenOrdersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          emptyDescription ? (
            <EmptyState variant="card" title={emptyTitle} description={emptyDescription} />
          ) : (
            <p className="py-4 text-center text-sm text-foreground-secondary">{emptyTitle}</p>
          )
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 rounded bg-background-elevated p-2 text-sm"
              >
                <Badge variant={order.side === 'buy' ? 'success' : 'danger'} size="sm">
                  {order.side.toUpperCase()}
                </Badge>
                <span className="flex-1 truncate font-mono">
                  {order.quantity} @ {formatSats(order.price_sat)}
                </span>
                {onCancel ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-accent-red"
                    onClick={() => onCancel(order.id)}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}