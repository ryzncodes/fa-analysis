'use client';

import * as React from 'react';
import { formatNumber, formatPercentage, formatRatio } from '@/lib/utils/standardize';

interface KeyStatsProps {
  quote: {
    price: number;
    volume: number;
    previousClose: number;
    open: number;
    dayHigh: number;
    dayLow: number;
  };
  keyStatistics: {
    beta?: number;
    priceToBook?: number;
    forwardPE?: number;
    trailingEps?: number;
    enterpriseValue?: number;
    profitMargins?: number;
  };
  dividendInfo: {
    yield?: number;
    rate?: number;
    exDate?: Date;
  };
}

function formatDate(date: Date | undefined): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
}

export function KeyStats({ quote, keyStatistics, dividendInfo }: KeyStatsProps) {
  const stats = {
    previousClose: quote.previousClose,
    open: quote.open,
    dayLow: quote.dayLow,
    dayHigh: quote.dayHigh,
    volume: quote.volume,
    beta: keyStatistics.beta ?? 0,
    forwardPE: keyStatistics.forwardPE ?? 0,
    eps: keyStatistics.trailingEps ?? 0,
    priceToBook: keyStatistics.priceToBook ?? 0,
    enterpriseValue: keyStatistics.enterpriseValue ?? 0,
    profitMargins: keyStatistics.profitMargins ?? 0,
    dividendYield: dividendInfo.yield ?? 0,
    exDividendDate: dividendInfo.exDate,
  };

  return (
    <section className='rounded-lg border bg-card p-6'>
      <h2 className='text-xl font-semibold mb-4'>Key Statistics</h2>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h3 className='text-sm text-gray-500'>Previous Close</h3>
          <p className='text-lg font-semibold'>{formatNumber(stats.previousClose)}</p>
        </div>
        <div>
          <h3 className='text-sm text-gray-500'>Open</h3>
          <p className='text-lg font-semibold'>{formatNumber(stats.open)}</p>
        </div>
        <div>
          <h3 className='text-sm text-gray-500'>Day&apos;s Range</h3>
          <p className='text-lg font-semibold'>
            {formatNumber(stats.dayLow)} - {formatNumber(stats.dayHigh)}
          </p>
        </div>
        <div>
          <h3 className='text-sm text-gray-500'>Volume</h3>
          <p className='text-lg font-semibold'>{formatNumber(stats.volume, { format: 'compact' })}</p>
        </div>
        <div>
          <h3 className='text-sm text-gray-500'>Beta</h3>
          <p className='text-lg font-semibold'>{formatRatio(stats.beta)}</p>
        </div>
        <div>
          <h3 className='text-sm text-gray-500'>P/E Ratio</h3>
          <p className='text-lg font-semibold'>{formatRatio(stats.forwardPE)}</p>
        </div>
        <div>
          <h3 className='text-sm text-gray-500'>EPS</h3>
          <p className='text-lg font-semibold'>{formatRatio(stats.eps)}</p>
        </div>
        <div>
          <h3 className='text-sm text-gray-500'>Price/Book</h3>
          <p className='text-lg font-semibold'>{formatRatio(stats.priceToBook)}</p>
        </div>
        <div>
          <h3 className='text-sm text-gray-500'>Enterprise Value</h3>
          <p className='text-lg font-semibold'>{formatNumber(stats.enterpriseValue, { format: 'compact' })}</p>
        </div>
        <div>
          <h3 className='text-sm text-gray-500'>Profit Margin</h3>
          <p className='text-lg font-semibold'>{formatPercentage(stats.profitMargins)}</p>
        </div>
        <div>
          <h3 className='text-sm text-gray-500'>Dividend Yield</h3>
          <p className='text-lg font-semibold'>{formatPercentage(stats.dividendYield)}</p>
        </div>
        <div>
          <h3 className='text-sm text-gray-500'>Ex-Dividend Date</h3>
          <p className='text-lg font-semibold'>{stats.exDividendDate ? formatDate(stats.exDividendDate) : 'N/A'}</p>
        </div>
      </div>
    </section>
  );
}
