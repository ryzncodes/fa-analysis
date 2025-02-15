import { Stock, MarketIndex, MarketSentiment } from '@/types/market';

export interface HistoricalDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Helper function to get the base URL
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Client-side
    return window.location.origin;
  }
  // Server-side
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

export async function getMarketIndices(): Promise<MarketIndex[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/market?type=indices`);
  if (!response.ok) {
    throw new Error('Failed to fetch market indices');
  }
  return response.json();
}

export async function getTrendingStocks(): Promise<Stock[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/market?type=trending`);
  if (!response.ok) {
    throw new Error('Failed to fetch trending stocks');
  }
  return response.json();
}

export async function getMarketSentiment(): Promise<MarketSentiment> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/market?type=sentiment`);
  if (!response.ok) {
    throw new Error('Failed to fetch market sentiment');
  }
  return response.json();
}

export async function getHistoricalPrices(symbol: string, timeframe: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'): Promise<HistoricalDataPoint[]> {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/market', baseUrl);
  url.searchParams.append('type', 'historical');
  url.searchParams.append('symbol', symbol);
  url.searchParams.append('timeframe', timeframe);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch historical prices');
  }
  return response.json();
}
