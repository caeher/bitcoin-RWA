import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  EmptyState,
  Layout,
  OpenOrdersCard,
  TokenInfoCard,
  TokenPurchaseCard,
  TradingPairHeader,
} from '@components';
import { useMarketplaceApi, useTokenizationApi, useWalletApi } from '@hooks';
import { useNotificationStore } from '@stores';
import { formatSats } from '@lib/utils';

export function TokenTrading() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [quantity, setQuantity] = useState('');

  const { error: notifyError, success } = useNotificationStore();
  const tokenizationApi = useTokenizationApi();
  const marketplaceApi = useMarketplaceApi();
  const walletApi = useWalletApi();

  const { data: tokenizedAssets, isLoading: isLoadingAssets } = tokenizationApi.getAssets('tokenized', undefined, undefined, true);
  const asset = useMemo(
    () => (tokenizedAssets?.items || []).find((item) => item.token?.id === tokenId),
    [tokenId, tokenizedAssets?.items]
  );

  const { data: orderBook, isLoading: isLoadingOrderBook } = marketplaceApi.getOrderBook(tokenId || '');
  const { data: tradesData } = marketplaceApi.getTradeHistory(tokenId);
  const { data: ordersData } = marketplaceApi.getOrders(tokenId, undefined, 'open');
  const { data: wallet } = walletApi.getWalletSummary();
  const { mutate: placeOrder, isPending: isPlacingOrder } = marketplaceApi.placeOrder;
  const { mutate: cancelOrder, isPending: isCancellingOrder } = marketplaceApi.cancelOrder;

  const bestBid = orderBook?.bids?.[0]?.price ?? asset?.token?.unit_price_sats ?? 0;
  const bestAsk = orderBook?.asks?.[0]?.price ?? asset?.token?.unit_price_sats ?? 0;
  const effectivePrice = bestAsk || bestBid;

  const total = (Number(quantity) || 0) * effectivePrice;
  const submitDisabled = !tokenId || !asset?.token || !quantity || effectivePrice <= 0;

  const handleSubmitOrder = (paymentMethod: 'lightning' | 'onchain') => {
    if (!tokenId || submitDisabled) {
      return;
    }

    placeOrder(
      {
        token_id: tokenId,
        side: 'buy',
        order_type: 'limit',
        quantity: Math.max(1, Number(quantity) || 0),
        price_sat: Math.max(1, effectivePrice),
      },
      {
        onSuccess: () => {
          success('Order placed', `Your buy order was submitted successfully via ${paymentMethod}.`);
          setQuantity('');
        },
        onError: (err: any) => {
          notifyError('Order failed', err.message || 'An unexpected error occurred while placing your order.');
        },
      }
    );
  };

  if (isLoadingAssets || !tokenId) {
    return (
      <Layout>
        <EmptyState
          variant="page"
          tone="warning"
          title="Loading token..."
          icon={<div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        />
      </Layout>
    );
  }

  if (!asset?.token) {
    return (
      <Layout>
        <EmptyState
          variant="page"
          title="Token not found"
          description="The selected token is not available in the platform catalog."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <TradingPairHeader
          backTo="/marketplace"
          backLabel="Public Tokens"
          title={asset.name}
          price={orderBook?.last_price || asset.token.unit_price_sats}
          changePercent={0}
          metrics={[
            { label: 'Best Bid', value: `${formatSats(bestBid)} sats` },
            { label: 'Best Ask', value: `${formatSats(bestAsk)} sats` },
            { label: '24h Volume', value: `${formatSats(orderBook?.volume_24h || 0)} sats` },
            { label: 'Visibility', value: asset.token.visibility || 'private' },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <TokenInfoCard asset={asset} />
          </div>

          <div className="space-y-6">
            <TokenPurchaseCard
              asset={asset}
              quantity={quantity}
              total={total}
              availableLabel={`${formatSats(wallet?.onchain_balance_sats || 0)} sats`}
              isSubmitting={isPlacingOrder}
              submitDisabled={submitDisabled}
              onQuantityChange={setQuantity}
              onSubmit={handleSubmitOrder}
            />

            <OpenOrdersCard
              orders={ordersData?.items || []}
              onCancel={(orderId) => {
                cancelOrder(orderId, {
                  onSuccess: () => {
                    success('Order cancelled', 'Your order was successfully cancelled.');
                  },
                  onError: (err: any) => {
                    notifyError('Cancel failed', err.message || 'You do not have permission to cancel this order.');
                  }
                });
              }}
              emptyDescription="Your active orders for this token will appear here."
            />

            {isCancellingOrder ? (
              <p className="text-sm text-foreground-secondary">Cancelling order...</p>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}
