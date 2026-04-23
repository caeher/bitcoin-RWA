import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatSats } from '@lib/utils';
import { 
  Layout, 
  TradingChartCard,
  TradingOrderBookCard,
  TradingOrderForm,
  TradingPairHeader,
  RecentTradesCard,
  OpenOrdersCard,
} from '@components';
import type { OrderBook, PricePoint, Order } from '@types';

// Mock data
const mockOrderBook: OrderBook = {
  bids: [
    { price: 49500, quantity: 50, total: 2475000, order_count: 3 },
    { price: 49000, quantity: 75, total: 3675000, order_count: 5 },
    { price: 48500, quantity: 100, total: 4850000, order_count: 4 },
    { price: 48000, quantity: 120, total: 5760000, order_count: 6 },
    { price: 47500, quantity: 200, total: 9500000, order_count: 8 },
    { price: 47000, quantity: 150, total: 7050000, order_count: 5 },
    { price: 46500, quantity: 80, total: 3720000, order_count: 3 },
    { price: 46000, quantity: 100, total: 4600000, order_count: 4 },
  ],
  asks: [
    { price: 50500, quantity: 30, total: 1515000, order_count: 2 },
    { price: 51000, quantity: 45, total: 2295000, order_count: 3 },
    { price: 51500, quantity: 60, total: 3090000, order_count: 4 },
    { price: 52000, quantity: 80, total: 4160000, order_count: 5 },
    { price: 52500, quantity: 100, total: 5250000, order_count: 6 },
    { price: 53000, quantity: 70, total: 3710000, order_count: 4 },
    { price: 53500, quantity: 50, total: 2675000, order_count: 3 },
    { price: 54000, quantity: 40, total: 2160000, order_count: 2 },
  ],
  spread: 1000,
  last_price: 50000,
};

const mockPriceHistory: PricePoint[] = Array.from({ length: 100 }, (_, i) => {
  const basePrice = 48000;
  const randomChange = (Math.random() - 0.5) * 5000;
  const price = basePrice + randomChange + (i * 200);
  return {
    timestamp: Date.now() - (100 - i) * 3600000,
    open: price - Math.random() * 200,
    high: price + Math.random() * 300,
    low: price - Math.random() * 300,
    close: price,
    volume: Math.floor(Math.random() * 10000),
  };
});

const mockTrades: Array<{ time: string; price: number; quantity: number; type: 'buy' | 'sell' }> = [
  { time: '14:32:05', price: 50000, quantity: 5, type: 'buy' },
  { time: '14:31:42', price: 49950, quantity: 12, type: 'sell' },
  { time: '14:31:18', price: 49950, quantity: 3, type: 'buy' },
  { time: '14:30:55', price: 49900, quantity: 8, type: 'sell' },
  { time: '14:30:31', price: 49900, quantity: 15, type: 'buy' },
  { time: '14:30:08', price: 49850, quantity: 6, type: 'sell' },
  { time: '14:29:45', price: 49850, quantity: 10, type: 'buy' },
  { time: '14:29:22', price: 49800, quantity: 4, type: 'sell' },
];

const mockOpenOrders: Order[] = [
  { id: '1', token_id: '1', user_id: '1', side: 'sell', quantity: 10, price_sat: 51000, status: 'open', filled_quantity: 0, created_at: new Date().toISOString() },
];

export function TokenTrading() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');

  // Calculate total
  const total = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const prc = orderType === 'market' 
      ? (orderSide === 'buy' ? mockOrderBook.asks[0].price : mockOrderBook.bids[0].price)
      : (parseFloat(price) || 0);
    return qty * prc;
  }, [quantity, price, orderType, orderSide]);

  const currentPrice = mockOrderBook.last_price;
  const change24h = 2.3;
  const high24h = 52500;
  const low24h = 47500;
  const volume24h = 12500000;
  const assetSymbol = tokenId?.toUpperCase() || 'DOB';

  return (
    <Layout>
      <div className="space-y-6">
        <TradingPairHeader
          backTo="/marketplace"
          backLabel="Marketplace"
          title="Downtown Office Building"
          price={currentPrice}
          changePercent={change24h}
          metrics={[
            { label: '24h High', value: formatSats(high24h) },
            { label: '24h Low', value: formatSats(low24h) },
            { label: '24h Vol', value: formatSats(volume24h) },
          ]}
        />

        <div className="grid xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <TradingChartCard
              chartType={chartType}
              onChartTypeChange={setChartType}
              data={mockPriceHistory}
            />
            <TradingOrderBookCard orderBook={mockOrderBook} />
          </div>

          <div className="space-y-6">
            <TradingOrderForm
              orderSide={orderSide}
              orderType={orderType}
              quantity={quantity}
              price={price}
              total={total}
              availableLabel="2,000,000 sats"
              submitLabel={`${orderSide === 'buy' ? 'Buy' : 'Sell'} ${assetSymbol}`}
              onOrderSideChange={setOrderSide}
              onOrderTypeChange={setOrderType}
              onQuantityChange={setQuantity}
              onPriceChange={setPrice}
            />

            <RecentTradesCard trades={mockTrades} />

            <OpenOrdersCard orders={mockOpenOrders} onCancel={() => undefined} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
