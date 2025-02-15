'use client';

import * as React from 'react';
import { createChart, IChartApi, ColorType, UTCTimestamp, ISeriesApi } from 'lightweight-charts';
import { cn } from '@/lib/utils';
import { getHistoricalPrices } from '@/lib/market-service';

interface PriceChartProps {
  data: {
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  className?: string;
  symbol: string;
}

interface ChartLegendData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SeriesData {
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  value?: number;
}

export function PriceChart({ data: initialData, className, symbol }: PriceChartProps) {
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedTimeframe, setSelectedTimeframe] = React.useState<'1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'>('1M');
  const [data, setData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [legendData, setLegendData] = React.useState<ChartLegendData | null>(null);
  const chartInstance = React.useRef<IChartApi | null>(null);
  const candlestickSeries = React.useRef<ISeriesApi<'Candlestick'>>(null!);
  const volumeSeries = React.useRef<ISeriesApi<'Histogram'>>(null!);
  const resizeObserver = React.useRef<ResizeObserver | null>(null);
  const isInitialMount = React.useRef(true);

  // Format price for legend
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Format volume for legend
  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000_000) {
      return `${(volume / 1_000_000_000).toFixed(2)}B`;
    }
    if (volume >= 1_000_000) {
      return `${(volume / 1_000_000).toFixed(2)}M`;
    }
    if (volume >= 1_000) {
      return `${(volume / 1_000).toFixed(2)}K`;
    }
    return volume.toString();
  };

  // Initialize chart and handle updates
  React.useEffect(() => {
    if (!chartContainerRef.current) return;

    const shouldCreateNewChart = !chartInstance.current;

    if (shouldCreateNewChart) {
      // Create chart instance with enhanced options
      chartInstance.current = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: 'rgba(255, 255, 255, 0.9)',
          fontFamily: 'system-ui',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
        rightPriceScale: {
          scaleMargins: {
            top: 0.1,
            bottom: 0.3,
          },
          borderVisible: false,
          autoScale: true,
        },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 12,
          barSpacing: 6,
          fixLeftEdge: true,
          lockVisibleTimeRangeOnResize: true,
        },
        crosshair: {
          mode: 1,
          vertLine: {
            width: 1,
            color: 'rgba(255, 255, 255, 0.4)',
            style: 3,
          },
          horzLine: {
            width: 1,
            color: 'rgba(255, 255, 255, 0.4)',
            style: 3,
          },
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      });

      // Add candlestick series
      candlestickSeries.current = chartInstance.current.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });

      // Add volume series
      volumeSeries.current = chartInstance.current.addHistogramSeries({
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
        color: '#60a5fa',
        base: 0,
      });

      // Configure volume scale
      chartInstance.current.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
        visible: false,
      });

      // Set up crosshair move handler
      chartInstance.current.subscribeCrosshairMove((param) => {
        if (param.time && param.point) {
          const price = param.seriesData.get(candlestickSeries.current) as SeriesData;
          const volume = param.seriesData.get(volumeSeries.current) as SeriesData;
          if (price) {
            setLegendData({
              open: price.open || 0,
              high: price.high || 0,
              low: price.low || 0,
              close: price.close || 0,
              volume: volume?.value || 0,
            });
          }
        } else {
          setLegendData(null);
        }
      });

      // Set up resize observer
      resizeObserver.current = new ResizeObserver((entries) => {
        if (chartInstance.current && entries[0]) {
          requestAnimationFrame(() => {
            chartInstance.current?.applyOptions({
              width: entries[0].contentRect.width,
            });
          });
        }
      });

      resizeObserver.current.observe(chartContainerRef.current);
    }

    // Update data if we have it
    if (data.length > 0 && candlestickSeries.current && volumeSeries.current) {
      try {
        candlestickSeries.current.setData(data);
        volumeSeries.current.setData(
          data.map((d) => ({
            time: d.time,
            value: d.volume,
            color: d.close > d.open ? '#22c55e80' : '#ef444480',
          }))
        );
        chartInstance.current?.timeScale().fitContent();
      } catch (error) {
        console.error('Failed to update chart data:', error);
        setError('Failed to update chart. Please try refreshing the page.');
      }
    }

    return () => {
      if (!isInitialMount.current) {
        resizeObserver.current?.disconnect();
        if (chartInstance.current) {
          chartInstance.current.remove();
          chartInstance.current = null;
        }
      }
      isInitialMount.current = false;
    };
  }, [data]);

  // Fetch new data when timeframe changes
  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const newData = await getHistoricalPrices(symbol, selectedTimeframe);

        if (!newData || !Array.isArray(newData) || newData.length === 0) {
          setError('No historical data available for this timeframe');
          return;
        }

        setData(
          newData.map((point) => ({
            ...point,
            time: point.time as UTCTimestamp,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch historical data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch historical data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    // Always fetch when timeframe changes, regardless of the timeframe
    fetchData();
  }, [selectedTimeframe, symbol]);

  const timeframes = [
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '1Y', value: '1Y' },
    { label: '5Y', value: '5Y' },
  ] as const;

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className='p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold'>Price Chart</h2>
          <div className='flex items-center gap-2'>
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.value}
                onClick={() => setSelectedTimeframe(timeframe.value)}
                disabled={loading}
                className={cn(
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  selectedTimeframe === timeframe.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                  loading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
        </div>
        {error && <div className='flex items-center justify-center p-4 mb-4 rounded-md bg-destructive/10 text-destructive text-sm'>{error}</div>}
        {legendData && !error && (
          <div className='flex gap-4 mb-4 text-sm'>
            <div>
              O: <span className='font-medium'>{formatPrice(legendData.open)}</span>
            </div>
            <div>
              H: <span className='font-medium'>{formatPrice(legendData.high)}</span>
            </div>
            <div>
              L: <span className='font-medium'>{formatPrice(legendData.low)}</span>
            </div>
            <div>
              C: <span className='font-medium'>{formatPrice(legendData.close)}</span>
            </div>
            <div>
              Vol: <span className='font-medium'>{formatVolume(legendData.volume)}</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className={cn('relative min-h-[400px]', loading && 'opacity-50 cursor-not-allowed')}>
          {loading && (
            <div className='absolute inset-0 flex items-center justify-center bg-background/50'>
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent'></div>
                Loading...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
