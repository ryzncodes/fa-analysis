'use client';

import * as React from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Sparklines, SparklinesCurve } from 'react-sparklines';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/alert';
import { getTrendingStocks } from '@/lib/market-service';
import { type Stock } from '@/types/market';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

type SortOption = 'price' | 'change' | 'volume' | 'marketCap';
type SortDirection = 'asc' | 'desc';

export function TrendingStocks() {
  const [stocks, setStocks] = React.useState<Stock[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedSector, setSelectedSector] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<SortOption>('change');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrendingStocks();
      setStocks(data);
    } catch (error) {
      console.error('Error fetching trending stocks:', error);
      setError('Failed to fetch trending stocks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sectors = React.useMemo(() => {
    const uniqueSectors = Array.from(new Set(stocks.map((stock) => stock.sector)));
    return ['all', ...uniqueSectors].filter(Boolean);
  }, [stocks]);

  const filteredAndSortedStocks = React.useMemo(() => {
    let result = [...stocks];

    // Apply sector filter
    if (selectedSector !== 'all') {
      result = result.filter((stock) => stock.sector === selectedSector);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change':
          comparison = a.change - b.change;
          break;
        case 'volume':
          comparison = a.volume - b.volume;
          break;
        case 'marketCap':
          comparison = a.marketCap - b.marketCap;
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [stocks, selectedSector, sortBy, sortDirection]);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  if (error) {
    return (
      <section className='py-8 md:py-12'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='h-6 w-6 text-primary' />
            <h2 className='text-2xl font-bold tracking-tight'>Trending Stocks</h2>
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

  return (
    <section className='py-8 md:py-12'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-2'>
          <TrendingUp className='h-6 w-6 text-primary' />
          <h2 className='text-2xl font-bold tracking-tight'>Trending Stocks</h2>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className='w-[120px] h-9'>
                <SelectValue placeholder='Sector' />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as SortOption)}>
              <SelectTrigger className='w-[120px] h-9'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='change'>% Change</SelectItem>
                <SelectItem value='price'>Price</SelectItem>
                <SelectItem value='volume'>Volume</SelectItem>
                <SelectItem value='marketCap'>Market Cap</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='ghost' size='sm' onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
              {sortDirection === 'asc' ? <ArrowUpRight className='h-4 w-4' /> : <ArrowDownRight className='h-4 w-4' />}
            </Button>
          </div>
          <Button variant='outline' size='sm' onClick={fetchData} disabled={loading} className='gap-2'>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      <div className='relative'>
        <Carousel
          opts={{
            align: 'start',
            dragFree: true,
          }}
          className='w-full'
        >
          <CarouselContent className='-ml-2 md:-ml-3'>
            {loading
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <CarouselItem key={i} className='pl-2 md:pl-3 basis-[280px] md:basis-[320px]'>
                      <div className='group relative overflow-hidden rounded-xl border bg-card p-4'>
                        <div className='flex items-center justify-between'>
                          <div className='space-y-1'>
                            <Skeleton className='h-5 w-16' />
                            <Skeleton className='h-4 w-32' />
                          </div>
                          <div className='text-right space-y-1'>
                            <Skeleton className='h-5 w-20' />
                            <Skeleton className='h-4 w-16 ml-auto' />
                          </div>
                        </div>
                        <div className='mt-3 space-y-2'>
                          <Skeleton className='h-12 w-full' />
                          <div className='grid grid-cols-2 gap-2'>
                            <Skeleton className='h-8 w-full' />
                            <Skeleton className='h-8 w-full' />
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))
              : filteredAndSortedStocks.map((stock) => (
                  <CarouselItem key={stock.symbol} className='pl-2 md:pl-3 basis-[280px] md:basis-[320px]'>
                    <Link href={`/stock/${stock.symbol}`} className='group relative overflow-hidden rounded-xl border bg-card p-4 hover:border-primary transition-colors block'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='font-semibold text-base'>{stock.symbol}</h3>
                          <p className='text-xs text-muted-foreground truncate max-w-[140px]'>{stock.name}</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-mono text-base'>${(stock.price || 0).toFixed(2)}</p>
                          <p className={cn('text-xs flex items-center gap-0.5 justify-end', (stock.change || 0) >= 0 ? 'text-green-500' : 'text-red-500')}>
                            {(stock.change || 0) >= 0 ? <ArrowUpRight className='h-3 w-3' /> : <ArrowDownRight className='h-3 w-3' />}
                            {Math.abs(stock.change || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className='mt-3'>
                        <div className='h-12 -mx-1'>
                          <Sparklines data={stock.sparklineData || []} min={Math.min(...(stock.sparklineData || []))} max={Math.max(...(stock.sparklineData || []))}>
                            <SparklinesCurve
                              style={{
                                fill: 'none',
                                strokeWidth: 1.5,
                                stroke: (stock.change || 0) >= 0 ? '#22c55e' : '#ef4444',
                              }}
                            />
                          </Sparklines>
                        </div>
                        <div className='grid grid-cols-2 gap-2 mt-8 text-xs'>
                          <div>
                            <p className='text-muted-foreground/80'>Volume</p>
                            <p className='font-mono mt-0.5'>{formatNumber(stock.volume)}</p>
                          </div>
                          <div>
                            <p className='text-muted-foreground/80'>Market Cap</p>
                            <p className='font-mono mt-0.5'>{formatNumber(stock.marketCap)}</p>
                          </div>
                        </div>
                        <div className='mt-2'>
                          <span className='inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary'>{stock.sector}</span>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
