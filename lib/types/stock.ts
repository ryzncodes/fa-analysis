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

interface NewsMetric {
  type: 'percentage_change' | 'price_target' | 'financial_metric';
  value: number;
  context: string;
  direction?: string;
  unit?: string;
}

export interface NewsItem {
  title: string;
  link: string;
  publisher: string;
  publishedAt: string;
  type: string;
  relatedTickers?: string[];
  isPremium?: boolean;
  summary?: string;
  author?: string;
  imageUrl?: string;
  categories?: string[];
  estimatedReadTime?: number;
  fullContent?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sourceReliability?: 'high' | 'medium' | 'low';
  metrics?: NewsMetric[];
  engagement?: {
    views?: number;
    shares?: number;
    comments?: number;
  };
  metadata?: {
    keywords?: string[];
    tags?: string[];
    language?: string;
    region?: string;
    isOriginalContent?: boolean;
    lastUpdated?: string;
  };
  relatedArticles?: {
    title: string;
    link: string;
    publisher: string;
  }[];
}

// New interfaces for fundamental data
export interface FinancialStatement {
  fiscalDateEnding: string;
  reportedCurrency: string;
}

export interface IncomeStatementItem extends FinancialStatement {
  grossProfit: number;
  totalRevenue: number;
  costOfRevenue: number;
  operatingIncome: number;
  netIncome: number;
  researchAndDevelopment: number;
  operatingExpenses: number;
  interestExpense: number;
  incomeTaxExpense: number;
  ebit: number;
  ebitda: number;
}

export interface BalanceSheetItem extends FinancialStatement {
  totalAssets: number;
  totalCurrentAssets: number;
  cashAndCashEquivalents: number;
  inventory: number;
  totalLiabilities: number;
  totalCurrentLiabilities: number;
  totalShareholderEquity: number;
  retainedEarnings: number;
  commonStock: number;
  commonStockSharesOutstanding: number;
}

export interface CashFlowItem extends FinancialStatement {
  operatingCashflow: number;
  capitalExpenditures: number;
  cashflowFromInvestment: number;
  cashflowFromFinancing: number;
  netIncome: number;
  dividendPayout: number;
  freeCashFlow: number;
}

export interface EarningsItem {
  fiscalDateEnding: string;
  reportedDate: string;
  reportedEPS: number;
  estimatedEPS: number;
  surprise: number;
  surprisePercentage: number;
}

export interface FundamentalData {
  incomeStatements: IncomeStatementItem[];
  balanceSheets: BalanceSheetItem[];
  cashFlows: CashFlowItem[];
  earnings: EarningsItem[];
}

export interface StockAnalysis {
  quote: StockQuote;
  profile: CompanyProfile;
  financials: FinancialData;
  keyStatistics: KeyStatistics;
  dividendInfo: DividendInfo;
  news: NewsItem[];
  fundamentals?: FundamentalData;
  error?: string;
} 