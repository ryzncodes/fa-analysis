// lib/types/stock.ts
export interface StockQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  marketCap: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  averageVolume: number;
}

export interface CompanyProfile {
  longName: string;
  industry: string;
  sector: string;
  website: string;
  longBusinessSummary: string;
  fullTimeEmployees: number;
  city: string;
  country: string;
}

export interface FinancialData {
  currentPrice: number;
  revenueGrowth: number;
  grossMargins: number;
  profitMargins: number;
  operatingMargins: number;
  returnOnEquity: number;
  totalCash: number;
  totalDebt: number;
  debtToEquity: number;
  currentRatio: number;
  quickRatio: number;
  totalRevenue: number;
  revenuePerShare: number;
  ebitda: number;
  ebitdaMargins: number;
  freeCashflow: number;
}

export interface KeyStatistics {
  enterpriseValue: number;
  forwardPE: number;
  pegRatio: number;
  priceToBook: number;
  enterpriseToRevenue: number;
  enterpriseToEbitda: number;
  beta: number;
  earningsGrowth: number;
  revenueGrowth: number;
  trailingEps: number;
  forwardEps: number;
  bookValue: number;
}

export interface DividendInfo {
  dividendRate: number;
  dividendYield: number;
  payoutRatio: number;
  fiveYearAvgDividendYield: number;
  lastDividendDate: string | null;
  lastDividendValue: number;
}

export interface NewsItem {
  title: string;
  link: string;
  publisher: string;
  publishedAt: string;
  type: string;
  relatedTickers?: string[];
}

export interface StockAnalysis {
  quote: StockQuote;
  profile: CompanyProfile;
  financials: FinancialData;
  keyStatistics: KeyStatistics;
  dividendInfo: DividendInfo;
  news: NewsItem[];
  error?: string;
} 