import { Stock, MarketIndex, MarketSentiment } from '@/types/market';

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  sector: string;
  sparklineData: number[];
  dayHigh: number;
  dayLow: number;
}

export async function getMarketIndices(): Promise<MarketIndex[]> {
  const response = await fetch('/api/market?type=indices');
  if (!response.ok) {
    throw new Error('Failed to fetch market indices');
  }
  return response.json();
}

export async function getTrendingStocks(): Promise<Stock[]> {
  const response = await fetch('/api/market?type=trending');
  if (!response.ok) {
    throw new Error('Failed to fetch trending stocks');
  }
  return response.json();
}

export async function getMarketSentiment(): Promise<MarketSentiment> {
  const response = await fetch('/api/market?type=sentiment');
  if (!response.ok) {
    throw new Error('Failed to fetch market sentiment');
  }
  return response.json();
}
