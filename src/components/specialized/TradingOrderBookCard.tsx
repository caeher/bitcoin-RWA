import { BookOpenText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { OrderBookDepth } from './OrderBookDepth';
import type { OrderBook } from '@types';

interface TradingOrderBookCardProps {
  orderBook: OrderBook;
  maxRows?: number;
}

export function TradingOrderBookCard({ orderBook, maxRows = 8 }: TradingOrderBookCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenText size={18} />
          Order Book
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OrderBookDepth orderBook={orderBook} maxRows={maxRows} />
      </CardContent>
    </Card>
  );
}