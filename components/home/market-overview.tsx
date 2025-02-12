'use client';

import * as React from 'react';
import { LineChart, ArrowUpRight, ArrowDownRight, Activity, RefreshCw } from 'lucide-react';
import { Sparklines, SparklinesCurve } from 'react-sparklines';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/alert';
import { getMarketIndices, getMarketSentiment, type MarketIndex } from '@/lib/market-service';
import { cn } from '@/lib/utils';

interface ExtendedMarketIndex extends MarketIndex {
  sparklineData: number[];
}

export function MarketOverview() {
  const [indices, setIndices] = React.useState<ExtendedMarketIndex[]>([]);
  const [sentiment, setSentiment] = React.useState({ sentiment: 0, volume: '0B', volatility: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [indicesData, sentimentData] = await Promise.all([getMarketIndices(), getMarketSentiment()]);
      // Add mock sparkline data for each index
      const extendedIndices = indicesData.map((index) => ({
        ...index,
        sparklineData: Array(20)
          .fill(0)
          .map(() => index.value * (0.98 + Math.random() * 0.04)),
      }));
      setIndices(extendedIndices);
      setSentiment(sentimentData);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Failed to fetch market data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <section className='py-8 md:py-12'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-2'>
            <Activity className='h-6 w-6 text-primary' />
            <h2 className='text-2xl font-bold tracking-tight'>Market Overview</h2>
          </div>
          <Button variant='outline' size='sm' onClick={fetchData} className='gap-2'>
            <RefreshCw className='h-4 w-4' />
            Retry
          </Button>
        </div>
        <ErrorAlert title='Error' description={error} className='mb-4' />
      </section>
    );
  }

  const getSentimentColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 50) return 'bg-green-400';
    if (value >= 30) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  const getVolatilityLevel = (value: number) => {
    if (value >= 30) return { text: 'High', color: 'text-red-500' };
    if (value >= 20) return { text: 'Elevated', color: 'text-yellow-500' };
    if (value >= 15) return { text: 'Moderate', color: 'text-green-500' };
    return { text: 'Low', color: 'text-blue-500' };
  };

  return (
    <section className='py-8 md:py-12'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-2'>
          <Activity className='h-6 w-6 text-primary' />
          <h2 className='text-2xl font-bold tracking-tight'>Market Overview</h2>
        </div>
        <Button variant='outline' size='sm' onClick={fetchData} disabled={loading} className='gap-2'>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className='rounded-xl border bg-card p-4 hover:bg-accent/50 transition-colors'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-2'>
                      <Skeleton className='h-5 w-24' />
                      <Skeleton className='h-4 w-16' />
                    </div>
                    <Skeleton className='h-4 w-4' />
                  </div>
                  <div className='mt-3 space-y-2'>
                    <Skeleton className='h-8 w-32' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-12 w-full' />
                  </div>
                </div>
              ))
          : indices.map((index) => (
              <div key={index.symbol} className='rounded-xl border bg-card p-6 hover:bg-accent/50 transition-colors'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='font-semibold'>{index.name}</h3>
                    <p className='text-xs text-muted-foreground mt-1'>{index.symbol}</p>
                  </div>
                  <LineChart className='h-4 w-4 text-muted-foreground' />
                </div>
                <div className='mt-4'>
                  <p className='font-mono text-2xl'>{index.value.toLocaleString()}</p>
                  <p className={cn('text-sm flex items-center gap-1 mt-2', index.change >= 0 ? 'text-green-500' : 'text-red-500')}>
                    {index.change >= 0 ? <ArrowUpRight className='h-4 w-4' /> : <ArrowDownRight className='h-4 w-4' />}
                    {Math.abs(index.change).toFixed(2)}%
                  </p>
                  <div className='h-12 mt-4'>
                    <Sparklines data={index.sparklineData} margin={5}>
                      <SparklinesCurve
                        style={{
                          fill: 'none',
                          strokeWidth: 2,
                          stroke: index.change >= 0 ? '#22c55e' : '#ef4444',
                        }}
                      />
                    </Sparklines>
                  </div>
                </div>
              </div>
            ))}
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4'>
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className='rounded-xl border bg-card p-4 space-y-2 hover:bg-accent/50 transition-colors'>
                <Skeleton className='h-5 w-32' />
                <Skeleton className='h-8 w-24' />
                <Skeleton className='h-4 w-40' />
              </div>
            ))
        ) : (
          <>
            <div className='rounded-xl border bg-card p-6 hover:bg-accent/50 transition-colors'>
              <h3 className='font-semibold mb-4'>Market Sentiment</h3>
              <div className='flex items-center gap-2 mb-3'>
                <div className='h-2.5 flex-1 rounded-full bg-muted overflow-hidden'>
                  <div className={cn('h-full transition-all duration-500', getSentimentColor(sentiment.sentiment))} style={{ width: `${sentiment.sentiment}%` }} />
                </div>
                <span className='text-sm font-medium min-w-[3rem] text-right'>{sentiment.sentiment}%</span>
              </div>
              <p className={cn('text-sm font-medium', sentiment.sentiment >= 50 ? 'text-green-500' : 'text-red-500')}>
                {sentiment.sentiment >= 70 ? 'Very Bullish' : sentiment.sentiment >= 50 ? 'Bullish' : sentiment.sentiment >= 30 ? 'Bearish' : 'Very Bearish'}
              </p>
            </div>
            <div className='rounded-xl border bg-card p-6 hover:bg-accent/50 transition-colors'>
              <h3 className='font-semibold mb-4'>Trading Volume</h3>
              <div className='flex items-baseline gap-1'>
                <p className='font-mono text-2xl'>{sentiment.volume}</p>
                <p className='text-xs text-muted-foreground'>shares</p>
              </div>
              <p className='text-xs text-muted-foreground mt-2'>Total market volume today</p>
            </div>
            <div className='rounded-xl border bg-card p-6 hover:bg-accent/50 transition-colors'>
              <h3 className='font-semibold mb-4'>Market Volatility</h3>
              <div className='flex items-baseline gap-1'>
                <p className='font-mono text-2xl'>{sentiment.volatility.toFixed(1)}</p>
                <p className='text-xs text-muted-foreground'>VIX</p>
              </div>
              <p className={cn('text-xs font-medium mt-2', getVolatilityLevel(sentiment.volatility).color)}>{getVolatilityLevel(sentiment.volatility).text} Volatility</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
