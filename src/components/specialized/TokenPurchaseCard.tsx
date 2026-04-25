import { useState, useEffect } from 'react';
import { Zap, Link as LinkIcon, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { InfoRow } from '@components/ui/InfoRow';
import { LightningInvoice, BitcoinAddress } from '@components/specialized';
import { formatSats } from '@lib/utils';
import { useWalletApi } from '@hooks';
import type { Asset } from '@types';

interface TokenPurchaseCardProps {
  asset: Asset;
  quantity: string;
  total: number;
  availableLabel: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  onQuantityChange: (value: string) => void;
  onSubmit: (paymentMethod: 'lightning' | 'onchain') => void;
}

type PurchaseStep = 'input' | 'payment' | 'success';

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
  const [paymentMethod, setPaymentMethod] = useState<'lightning' | 'onchain' | null>(null);
  const [paymentData, setPaymentData] = useState<{ invoice?: string; address?: string } | null>(null);
  
  const token = asset.token;
  const walletApi = useWalletApi();
  const { mutateAsync: createInvoice, isPending: isCreatingInvoice } = walletApi.createInvoice;
  const { mutateAsync: createAddress, isPending: isCreatingAddress } = walletApi.createOnchainAddress;

  if (!token) {
    return null;
  }

  const availableTokens = token.circulating_supply ?? token.total_supply;
  const isOverInventory = Number(quantity) > availableTokens;
  const isInvalidQuantity = Number(quantity) <= 0 || isOverInventory;

  const handleSelectPayment = async (method: 'lightning' | 'onchain') => {
    if (isInvalidQuantity) return;
    
    setPaymentMethod(method);
    setStep('payment');

    try {
      if (method === 'lightning') {
        const response = await createInvoice({
          amount_sats: total,
          description: `Compra de ${quantity} ${token.ticker}`
        });
        setPaymentData({ invoice: response.payment_request });
      } else {
        const response = await createAddress();
        setPaymentData({ address: response.address });
      }
    } catch (error) {
      setStep('input');
    }
  };

  const handleConfirmOrder = async () => {
    // In a real scenario, we might want to verify payment first
    // For now, we proceed to submit the order as per the user's flow
    await onSubmit(paymentMethod!);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <Card glass glow="success">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">¡Orden Procesada!</h3>
            <p className="text-foreground-secondary text-sm px-8">
              Tu solicitud de compra de <strong>{quantity} {token.ticker}</strong> ha sido enviada con éxito.
            </p>
          </div>
          <Button variant="outline" onClick={() => { setStep('input'); onQuantityChange(''); }}>
            Comprar más
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'payment') {
    return (
      <Card glass glow="bitcoin">
        <CardHeader className="flex flex-row items-center gap-4">
          <Button variant="ghost" size="icon-sm" onClick={() => setStep('input')}>
            <ArrowLeft size={18} />
          </Button>
          <CardTitle>Completar Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-1">
            <p className="text-sm text-foreground-secondary">Monto a pagar</p>
            <p className="text-2xl font-bold text-accent-bitcoin font-mono">{formatSats(total)} sats</p>
          </div>

          {paymentMethod === 'lightning' ? (
            isCreatingInvoice ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-bitcoin border-t-transparent" />
              </div>
            ) : paymentData?.invoice ? (
              <LightningInvoice 
                invoice={paymentData.invoice} 
                amountSats={total}
                description={`Pago por ${quantity} ${token.ticker}`}
              />
            ) : null
          ) : (
            isCreatingAddress ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-bitcoin border-t-transparent" />
              </div>
            ) : paymentData?.address ? (
              <BitcoinAddress 
                address={paymentData.address} 
                label="Envía fondos a esta dirección"
                variant="large"
              />
            ) : null
          )}

          <div className="space-y-3">
            <p className="text-xs text-foreground-secondary text-center">
              Una vez realizado el pago, los tokens se acreditarán en tu cuenta.
            </p>
            <Button 
              fullWidth 
              variant="default" 
              onClick={handleConfirmOrder}
              isLoading={isSubmitting}
              disabled={isCreatingInvoice || isCreatingAddress}
            >
              Confirmar Compra
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card glass glow="bitcoin">
      <CardHeader>
        <CardTitle>Comprar {token.ticker}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <Input
            type="number"
            label="Cantidad de tokens"
            placeholder="0"
            value={quantity}
            onChange={(event) => onQuantityChange(event.target.value)}
            rightElement={<span className="text-xs text-foreground-secondary font-mono">{token.ticker}</span>}
            className={`font-mono text-lg h-12 ${isOverInventory ? 'border-accent-red focus:ring-accent-red/20' : ''}`}
            error={isOverInventory ? `Máximo disponible: ${availableTokens}` : undefined}
          />
        </div>

        <div className="rounded-lg bg-background-elevated p-4 space-y-3">
          <InfoRow
            label="Precio por unidad"
            value={`${formatSats(token.unit_price_sats)} sats`}
            className="text-sm"
            valueClassName="font-mono text-foreground-secondary"
          />
          <div className="h-px w-full bg-border/50" />
          <InfoRow
            label="Total estimado"
            value={`${formatSats(total)} sats`}
            className="text-base"
            valueClassName="font-mono font-bold text-accent-bitcoin"
          />
          <InfoRow
            label="Fee plataforma (0.5%)"
            value={`${formatSats(total * 0.005)} sats`}
            className="text-xs"
            valueClassName="font-mono text-foreground-secondary"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Método de pago</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full flex-col h-auto py-3 gap-2 border-accent-bitcoin/40 hover:border-accent-bitcoin hover:bg-accent-bitcoin/10"
              onClick={() => handleSelectPayment('onchain')}
              disabled={submitDisabled || isSubmitting || isInvalidQuantity}
            >
              <LinkIcon size={20} className="text-foreground" />
              <span>Onchain</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full flex-col h-auto py-3 gap-2 border-accent-bitcoin/40 hover:border-accent-bitcoin hover:bg-accent-bitcoin/10"
              onClick={() => handleSelectPayment('lightning')}
              disabled={submitDisabled || isSubmitting || isInvalidQuantity}
            >
              <Zap size={20} className="text-[#F7931A]" />
              <span>Lightning</span>
            </Button>
          </div>
          {isOverInventory && (
            <p className="text-xs text-accent-red text-center font-medium">
              No hay suficientes tokens disponibles para esta cantidad.
            </p>
          )}
        </div>

        <InfoRow
          label="Disponible para comprar"
          value={availableLabel}
          className="items-center justify-center pt-2 text-xs"
          valueClassName="font-mono text-foreground-secondary"
          labelClassName="text-foreground-muted"
        />
      </CardContent>
    </Card>
  );
}

