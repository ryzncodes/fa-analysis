import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default to gpt-4o-mini if no model is specified
const DEFAULT_MODEL = 'gpt-4o-mini';

// Cache for storing previous analysis results
const analysisCache = new Map<string, { data: string, hash: string }>();

// Helper function to create a hash of the analysis data
function createDataHash(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  averageVolume?: number;
  marketCap?: number;
}

export interface Profile {
  longName: string;
  longBusinessSummary: string;
  sector: string;
  industry: string;
  website: string;
  fullTimeEmployees: number;
  country: string;
  city: string;
}

export interface Financials {
  totalCash?: number;
  totalDebt?: number;
  operatingMargins?: number;
  profitMargins?: number;
  grossMargins?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
  revenueGrowth?: number;
  operatingCashflow?: number;
  freeCashflow?: number;
}

export interface KeyStatistics {
  beta?: number;
  priceToBook?: number;
  forwardPE?: number;
  trailingEps?: number;
  enterpriseValue?: number;
  profitMargins?: number;
  earningsGrowth?: number;
}

export interface DividendInfo {
  yield?: number;
  rate?: number;
  exDate?: Date;
}

export interface NewsItem {
  title: string;
  link: string;
  publisher: string;
  providerPublishTime: number;
}

export interface Fundamentals {
  marketCap: number;
  trailingPE: number;
  forwardPE: number;
  eps: number;
}

export interface StockData {
  quote: Quote;
  profile: Profile;
  financials: Financials;
  keyStatistics: KeyStatistics;
  dividendInfo: DividendInfo;
  news: NewsItem[];
  fundamentals: Fundamentals;
}

export async function generateStockInsights(stockData: StockData): Promise<string> {
  try {
    // Create a more focused input by selecting only relevant data, now extended with more fields
    const analysisData = {
      quote: {
        symbol: stockData.quote.symbol,
        price: stockData.quote.price,
        change: stockData.quote.change,
        changePercent: stockData.quote.changePercent,
        volume: stockData.quote.volume,
        previousClose: stockData.quote.previousClose,
        open: stockData.quote.open,
        dayHigh: stockData.quote.dayHigh,
        dayLow: stockData.quote.dayLow,
        fiftyTwoWeekHigh: stockData.quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: stockData.quote.fiftyTwoWeekLow,
        averageVolume: stockData.quote.averageVolume,
        marketCap: stockData.quote.marketCap || stockData.fundamentals.marketCap,
      },
      profile: {
        longName: stockData.profile.longName,
        longBusinessSummary: stockData.profile.longBusinessSummary,
        sector: stockData.profile.sector,
        industry: stockData.profile.industry,
        website: stockData.profile.website,
        fullTimeEmployees: stockData.profile.fullTimeEmployees,
        city: stockData.profile.city,
        country: stockData.profile.country,
      },
      financials: {
        profitMargins: stockData.financials.profitMargins,
        revenueGrowth: stockData.financials.revenueGrowth,
        grossMargins: stockData.financials.grossMargins,
        operatingMargins: stockData.financials.operatingMargins,
        returnOnEquity: stockData.financials.returnOnEquity,
        totalCash: stockData.financials.totalCash,
        totalDebt: stockData.financials.totalDebt,
        operatingCashflow: stockData.financials.operatingCashflow,
        freeCashflow: stockData.financials.freeCashflow,
      },
      keyStats: {
        beta: stockData.keyStatistics.beta,
        forwardPE: stockData.keyStatistics.forwardPE,
        trailingEps: stockData.keyStatistics.trailingEps,
        priceToBook: stockData.keyStatistics.priceToBook,
        enterpriseValue: stockData.keyStatistics.enterpriseValue,
        earningsGrowth: stockData.keyStatistics.earningsGrowth,
      },
      fundamentals: {
        marketCap: stockData.fundamentals.marketCap,
        trailingPE: stockData.fundamentals.trailingPE,
        forwardPE: stockData.fundamentals.forwardPE,
        eps: stockData.fundamentals.eps,
      },
      dividendInfo: stockData.dividendInfo,
      news: stockData.news,
    };

    // Create a hash of the current data
    const currentHash = createDataHash(analysisData);
    const symbol = stockData.quote.symbol;
    
    // Check if we have a cached analysis and if the data hasn't changed
    const cached = analysisCache.get(symbol);
    if (cached && cached.hash === currentHash) {
      console.log('Using cached analysis for', symbol);
      return cached.data;
    }

    // If no cache hit or data changed, generate new analysis
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert financial analyst. Provide a detailed analysis in exactly these sections:

MARKET_SUMMARY
Provide a comprehensive overview of the stock's current trading day, including price movement, context about the change, and how it compares to recent performance.

TRADING_ACTIVITY
Analyze the trading volume, price range, and what this indicates about market sentiment. Include comparisons to average volume and discuss any notable patterns.

FINANCIAL_HEALTH
Provide a thorough analysis of the company's financial metrics including profit margins, revenue growth, ROE, and cash position. Explain what these numbers indicate about the company's financial strength.

TECHNICAL_SIGNALS
Detailed analysis of price trends, support and resistance levels, technical indicators, and what they suggest about future price movement. Include both short and medium-term perspectives.

RISK_FACTORS
Comprehensive analysis of both company-specific and market-wide risks that could impact the stock. Include regulatory, competitive, and economic factors.

GROWTH_DRIVERS
In-depth analysis of potential catalysts for future growth, including market opportunities, company initiatives, industry trends, and competitive advantages.

Format each section exactly like this:
SECTION_TITLE: [your detailed analysis for this section]

Provide thorough analysis while keeping the language accessible to retail investors. Use specific numbers and metrics when relevant, and explain their significance.

End with:
SENTIMENT_SCORE: [0-100]

Scoring Guide:
0-20: Strong Sell (Major red flags)
21-40: Sell (Significant concerns)
41-60: Hold (Mixed outlook)
61-80: Buy (Positive outlook)
81-100: Strong Buy (Exceptional outlook)`
        },
        {
          role: 'user',
          content: `Stock analysis for ${stockData.quote.symbol}:
${JSON.stringify(analysisData, null, 2)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const analysis = response.choices[0]?.message?.content || 'No insights available.';
    
    // Cache the new analysis
    analysisCache.set(symbol, { data: analysis, hash: currentHash });

    return analysis;
  } catch (error) {
    console.error('Error generating stock insights:', error);
    throw new Error('Failed to generate stock insights');
  }
} 