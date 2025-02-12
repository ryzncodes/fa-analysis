import { NextResponse } from 'next/server';

// Generate mock sparkline data for a stock
function generateSparklineData(basePrice: number): number[] {
  return Array(20)
    .fill(0)
    .map(() => basePrice * (0.98 + Math.random() * 0.04));
}

const mockTrendingStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 232.62,
    change: 2.18,
    volume: 52_436_789,
    marketCap: 2_890_000_000_000,
    sector: 'Technology',
    dayHigh: 234.5,
    dayLow: 230.2,
    sparklineData: generateSparklineData(232.62),
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 719.8,
    change: 0.33,
    volume: 15_678_432,
    marketCap: 1_850_000_000_000,
    sector: 'Technology',
    dayHigh: 722.1,
    dayLow: 715.9,
    sparklineData: generateSparklineData(719.8),
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 232.76,
    change: -0.16,
    volume: 28_945_671,
    marketCap: 1_920_000_000_000,
    sector: 'Consumer Cyclical',
    dayHigh: 234.2,
    dayLow: 231.5,
    sparklineData: generateSparklineData(232.76),
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 411.44,
    change: -0.19,
    volume: 19_873_456,
    marketCap: 3_100_000_000_000,
    sector: 'Technology',
    dayHigh: 413.2,
    dayLow: 409.8,
    sparklineData: generateSparklineData(411.44),
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.35,
    change: 1.24,
    volume: 31_567_890,
    marketCap: 2_160_000_000_000,
    sector: 'Technology',
    dayHigh: 878.5,
    dayLow: 870.2,
    sparklineData: generateSparklineData(875.35),
  },
];

const mockMarketIndices = [
  {
    name: 'S&P 500',
    symbol: 'SPX',
    value: 5_021.84,
    change: 0.57,
  },
  {
    name: 'Dow Jones',
    symbol: 'DJI',
    value: 38_654.42,
    change: 0.35,
  },
  {
    name: 'Nasdaq',
    symbol: 'IXIC',
    value: 15_990.66,
    change: 1.25,
  },
  {
    name: 'Russell 2000',
    symbol: 'RUT',
    value: 2_010.38,
    change: -0.23,
  },
];

const mockMarketSentiment = {
  sentiment: 65,
  volume: '8.2B',
  volatility: 14.2,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'indices': {
        return NextResponse.json(mockMarketIndices);
      }

      case 'trending': {
        return NextResponse.json(mockTrendingStocks);
      }

      case 'sentiment': {
        return NextResponse.json(mockMarketSentiment);
      }

      default:
        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Market API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
