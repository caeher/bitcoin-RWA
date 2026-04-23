import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  EmptyState,
  Layout,
  OpenOrdersCard,
  RecentTradesCard,
  TradingChartCard,
  TradingOrderBookCard,
  TradingOrderForm,
  TradingPairHeader,
} from '@components';
import { useMarketplaceApi, useTokenizationApi, useWalletApi } from '@hooks';
import { useNotificationStore } from '@stores';
import { formatDate, formatSats } from '@lib/utils';
import type { PricePoint } from '@types';

function buildPriceHistory(basePrice: number, tradePrices: number[]): PricePoint[] {
  const prices = tradePrices.length > 0 ? tradePrices : [basePrice];

  return prices.map((price, index) => {
    const previous = prices[index - 1] ?? price;
    const low = Math.min(price, previous);
    const high = Math.max(price, previous);

    return {
      timestamp: Date.now() - (prices.length - index) * 60 * 60 * 1000,
      open: previous,
      high,
      low,
      close: price,
      volume: Math.max(1, index + 1),
    };
  });
}

export function TokenTrading() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');

  const { success } = useNotificationStore();
  const tokenizationApi = useTokenizationApi();
  const marketplaceApi = useMarketplaceApi();
  const walletApi = useWalletApi();

  const { data: tokenizedAssets, isLoading: isLoadingAssets } = tokenizationApi.getAssets('tokenized');
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
  const effectivePrice =
    orderType === 'market'
      ? orderSide === 'buy'
        ? bestAsk || bestBid
        : bestBid || bestAsk
      : Number(price) || 0;

  const total = (Number(quantity) || 0) * effectivePrice;
  const submitDisabled = !tokenId || !asset?.token || !quantity || effectivePrice <= 0;

  const recentTrades = useMemo(
    () =>
      (tradesData?.items || []).slice(0, 8).map((trade) => ({
        time: new Date(trade.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
        price: trade.price_sat,
        quantity: trade.quantity,
        type: trade.price_sat >= bestAsk ? 'buy' as const : 'sell' as const,
      })),
    [bestAsk, tradesData?.items]
  );

  const priceHistory = useMemo(
    () => buildPriceHistory(asset?.token?.unit_price_sats || 0, (tradesData?.items || []).map((trade) => trade.price_sat)),
    [asset?.token?.unit_price_sats, tradesData?.items]
  );

  const handleSubmitOrder = () => {
    if (!tokenId || submitDisabled) {
      return;
    }

    placeOrder(
      {
        token_id: tokenId,
        side: orderSide,
        order_type: orderType === 'market' ? 'limit' : orderType,
        quantity: Math.max(1, Number(quantity) || 0),
        price_sat: Math.max(1, effectivePrice),
      },
      {
        onSuccess: () => {
          success('Order placed', `Your ${orderSide} order was submitted successfully.`);
          setQuantity('');
          if (orderType !== 'market') {
            setPrice('');
          }
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

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <TradingChartCard
              chartType={chartType}
              onChartTypeChange={setChartType}
              data={priceHistory}
            />
            {isLoadingOrderBook || !orderBook ? (
              <EmptyState
                variant="card"
                tone="warning"
                title="Order book unavailable"
                description="No live order book data is available for this token yet."
              />
            ) : (
              <TradingOrderBookCard orderBook={orderBook} />
            )}
          </div>

          <div className="space-y-6">
            <TradingOrderForm
              orderSide={orderSide}
              orderType={orderType}
              quantity={quantity}
              price={price}
              total={total}
              availableLabel={`${formatSats(wallet?.onchain_balance_sats || 0)} sats`}
              submitLabel={`${orderSide === 'buy' ? 'Buy' : 'Sell'} ${asset.token.ticker}`}
              isSubmitting={isPlacingOrder}
              submitDisabled={submitDisabled}
              onOrderSideChange={setOrderSide}
              onOrderTypeChange={setOrderType}
              onQuantityChange={setQuantity}
              onPriceChange={setPrice}
              onSubmit={handleSubmitOrder}
            />

            <RecentTradesCard trades={recentTrades} />

            <OpenOrdersCard
              orders={ordersData?.items || []}
              onCancel={(orderId) => cancelOrder(orderId)}
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
