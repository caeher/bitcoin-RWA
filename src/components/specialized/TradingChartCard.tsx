import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
import { SegmentedControl } from '@components/ui/SegmentedControl';
import { PriceChart } from './PriceChart';
import type { PricePoint } from '@types';

interface TradingChartCardProps {
  chartType: 'candles' | 'line';
  onChartTypeChange: (value: 'candles' | 'line') => void;
  data: PricePoint[];
}

const chartOptions = [
  { value: 'candles', label: 'Candles' },
  { value: 'line', label: 'Line' },
] as const;

export function TradingChartCard({ chartType, onChartTypeChange, data }: TradingChartCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 size={18} />
          Price Chart
        </CardTitle>
        <SegmentedControl
          value={chartType}
          onChange={onChartTypeChange}
          options={chartOptions}
          size="sm"
        />
      </CardHeader>
      <CardContent>
        <PriceChart data={data} type={chartType} height={350} />
      </CardContent>
    </Card>
  );
}