import { useState } from 'react';
import { Zap, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { InfoRow } from '@components/ui/InfoRow';
import { formatSats } from '@lib/utils';
import type { Asset } from '@types';

interface TokenPurchaseCardProps {
  asset: Asset;
  quantity: string;
  total: number;
  availableLabel: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  onQuantityChange: (value: string) => void;
  onSubmit: (paymentMethod: 'lightning' | 'onchain') => Promise<void>;
}

type PurchaseStep = 'input' | 'success';

export function TokenPurchaseCard({
  asset,
  quantity,
  total,
  availableLabel,
  isSubmitting,
  submitDisabled,
  onQuantityChange,
  onSubmit,
}: TokenPurchaseCardProps) {
  const [step, setStep] = useState<PurchaseStep>('input');

  const token = asset.token;
  if (!token) {
    return null;
  }

  const availableTokens = token.circulating_supply ?? token.total_supply;
  const isOverInventory = Number(quantity) > availableTokens;
  const isInvalidQuantity = Number(quantity) <= 0 || isOverInventory;

  const handlePurchase = async (method: 'lightning' | 'onchain') => {
    if (isInvalidQuantity || submitDisabled || isSubmitting) {
      return;
    }

    await onSubmit(method);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <Card glass glow="green">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Purchase Completed</h3>
            <p className="text-foreground-secondary text-sm px-8">
              Your purchase of <strong>{quantity} {token.ticker}</strong> was completed successfully.
            </p>
          </div>
          <Button variant="outline" onClick={() => { setStep('input'); onQuantityChange(''); }}>
            Buy More
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card glass glow="bitcoin">
      <CardHeader>
        <CardTitle>Buy {token.ticker}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-1">
          <Input
            type="number"
            label="Token Quantity"
            placeholder="0"
            value={quantity}
            onChange={(event) => onQuantityChange(event.target.value)}
            rightElement={<span className="text-xs text-foreground-secondary font-mono">{token.ticker}</span>}
            className={`font-mono text-lg h-12 ${isOverInventory ? 'border-accent-red focus:ring-accent-red/20' : ''}`}
            error={isOverInventory ? `Maximum available: ${availableTokens}` : undefined}
          />
        </div>

        <div className="rounded-lg bg-background-elevated p-4 space-y-3">
          <InfoRow
            label="Unit Price"
            value={`${formatSats(token.unit_price_sats)} sats`}
            className="text-sm"
            valueClassName="font-mono text-foreground-secondary"
          />
          <div className="h-px w-full bg-border/50" />
          <InfoRow
            label="Estimated Total"
            value={`${formatSats(total)} sats`}
            className="text-base"
            valueClassName="font-mono font-bold text-accent-bitcoin"
          />
          <InfoRow
            label="Platform Fee"
            value={`${formatSats(total * 0.005)} sats`}
            className="text-xs"
            valueClassName="font-mono text-foreground-secondary"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Pay From Wallet</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full flex-col h-auto py-3 gap-2 border-accent-bitcoin/40 hover:border-accent-bitcoin hover:bg-accent-bitcoin/10"
              onClick={() => handlePurchase('onchain')}
              disabled={submitDisabled || isSubmitting || isInvalidQuantity}
            >
              <LinkIcon size={20} className="text-foreground" />
              <span>Onchain</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full flex-col h-auto py-3 gap-2 border-accent-bitcoin/40 hover:border-accent-bitcoin hover:bg-accent-bitcoin/10"
              onClick={() => handlePurchase('lightning')}
              disabled={submitDisabled || isSubmitting || isInvalidQuantity}
            >
              <Zap size={20} className="text-[#F7931A]" />
              <span>Lightning</span>
            </Button>
          </div>
          {isOverInventory ? (
            <p className="text-xs text-accent-red text-center font-medium">
              There are not enough tokens available for this quantity.
            </p>
          ) : (
            <p className="text-xs text-foreground-secondary text-center">
              The purchase is executed immediately and your wallet balance is reduced right away.
            </p>
          )}
        </div>

        <InfoRow
          label="Available to Spend"
          value={availableLabel}
          className="items-center justify-center pt-2 text-xs"
          valueClassName="font-mono text-foreground-secondary"
          labelClassName="text-foreground-muted"
        />
      </CardContent>
    </Card>
  );
}
