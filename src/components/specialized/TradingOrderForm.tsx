import { Button } from '@components/ui/Button';
import { Card, CardContent, CardHeader } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { SegmentedControl } from '@components/ui/SegmentedControl';
import { InfoRow } from '@components/ui/InfoRow';
import { formatSats } from '@lib/utils';

interface TradingOrderFormProps {
  orderSide: 'buy' | 'sell';
  orderType: 'limit' | 'market';
  quantity: string;
  price: string;
  total: number;
  availableLabel: string;
  submitLabel: string;
  onOrderSideChange: (value: 'buy' | 'sell') => void;
  onOrderTypeChange: (value: 'limit' | 'market') => void;
  onQuantityChange: (value: string) => void;
  onPriceChange: (value: string) => void;
}

const orderSideOptions = [
  { value: 'buy', label: 'Buy', activeClassName: 'bg-accent-green text-background' },
  { value: 'sell', label: 'Sell', activeClassName: 'bg-accent-red text-background' },
] as const;

const orderTypeOptions = [
  { value: 'limit', label: 'Limit' },
  { value: 'market', label: 'Market' },
] as const;

export function TradingOrderForm({
  orderSide,
  orderType,
  quantity,
  price,
  total,
  availableLabel,
  submitLabel,
  onOrderSideChange,
  onOrderTypeChange,
  onQuantityChange,
  onPriceChange,
}: TradingOrderFormProps) {
  return (
    <Card>
      <CardHeader>
        <SegmentedControl
          value={orderSide}
          onChange={onOrderSideChange}
          options={orderSideOptions}
          variant="solid"
          fullWidth
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <SegmentedControl
          value={orderType}
          onChange={onOrderTypeChange}
          options={orderTypeOptions}
          variant="soft"
          fullWidth
          size="sm"
        />

        {orderType === 'limit' && (
          <Input
            type="number"
            label="Price (sats)"
            placeholder="0"
            value={price}
            onChange={(event) => onPriceChange(event.target.value)}
            rightElement={<span className="text-xs text-foreground-secondary">sats</span>}
            className="font-mono"
          />
        )}

        <Input
          type="number"
          label="Quantity"
          placeholder="0"
          value={quantity}
          onChange={(event) => onQuantityChange(event.target.value)}
          rightElement={<span className="text-xs text-foreground-secondary">units</span>}
          className="font-mono"
        />

        <div className="rounded-lg bg-background-elevated p-3">
          <InfoRow
            label="Total"
            value={`${formatSats(total)} sats`}
            className="items-center border-none py-0 text-sm"
            valueClassName="font-mono"
          />
          <InfoRow
            label="Fee (0.5%)"
            value={`${formatSats(total * 0.005)} sats`}
            className="items-center border-none pb-0 pt-2 text-xs"
            valueClassName="font-mono"
          />
        </div>

        <Button fullWidth size="lg" variant={orderSide === 'buy' ? 'default' : 'danger'}>
          {submitLabel}
        </Button>

        <InfoRow
          label="Available"
          value={availableLabel}
          className="items-center border-none py-0 text-xs"
          valueClassName="font-mono"
        />
      </CardContent>
    </Card>
  );
}