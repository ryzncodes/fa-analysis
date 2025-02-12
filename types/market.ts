export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  sector: string;
  dayHigh: number;
  dayLow: number;
  sparklineData?: number[];
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
}

export interface MarketSentiment {
  sentiment: number;
  volume: string;
  volatility: number;
}
