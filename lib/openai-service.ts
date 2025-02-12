import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default to gpt-4o-mini if no model is specified
const DEFAULT_MODEL = 'gpt-4o-mini';

// Cache for storing previous analysis results
const analysisCache = new Map<string, { data: string; hash: string }>();

// Helper function to create a hash of the analysis data
function createDataHash(data: Record<string, unknown>): string {
  return JSON.stringify(data);
}

// Helper function to format bold text
function formatBoldText(text: string): string {
  // Replace **text** with <strong>text</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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

// Define the structure for AI analysis response
export interface AIAnalysisSection {
  content: string;
  summary: string;
}

export interface AIAnalysisResponse {
  market_summary: AIAnalysisSection;
  trading_activity: AIAnalysisSection;
  financial_health: AIAnalysisSection;
  technical_signals: AIAnalysisSection;
  risk_factors: AIAnalysisSection;
  growth_drivers: AIAnalysisSection;
  sentiment_score: number;
  sentiment_explanation: string;
}

// Helper function to parse the AI response into structured format
function parseAIResponse(response: string): AIAnalysisResponse {
  const sections: AIAnalysisResponse = {
    market_summary: { content: '', summary: '' },
    trading_activity: { content: '', summary: '' },
    financial_health: { content: '', summary: '' },
    technical_signals: { content: '', summary: '' },
    risk_factors: { content: '', summary: '' },
    growth_drivers: { content: '', summary: '' },
    sentiment_score: 0,
    sentiment_explanation: '',
  };

  // First, split the response into sections using ### as delimiter
  const sectionTexts = response.split(/###\s*/);

  // Process each section
  sectionTexts.forEach((sectionText) => {
    // Skip empty sections
    if (!sectionText.trim()) return;

    // Extract section name and content using multiline matching
    const sectionMatch = sectionText.match(/^([A-Z_]+):\s*([\s\S]+)$/);
    if (sectionMatch) {
      const [, sectionName, content] = sectionMatch;
      const normalizedName = sectionName.toLowerCase().replace(/\s+/g, '_');

      // Handle sentiment score separately
      if (normalizedName === 'sentiment_score') {
        const scoreMatch = content.match(/(\d+)([\s\S]*)/);
        if (scoreMatch) {
          sections.sentiment_score = parseInt(scoreMatch[1]);
          sections.sentiment_explanation = formatBoldText(scoreMatch[2]?.trim() || '');
        }
        return;
      }

      // Handle regular sections
      if (normalizedName in sections && normalizedName !== 'sentiment_score' && normalizedName !== 'sentiment_explanation') {
        const cleanContent = content.trim();
        const firstSentence = cleanContent.split(/\.(?:\s|$)/)[0].trim() + '.';

        sections[normalizedName as keyof Omit<AIAnalysisResponse, 'sentiment_score' | 'sentiment_explanation'>] = {
          content: formatBoldText(cleanContent),
          summary: formatBoldText(firstSentence),
        } as AIAnalysisSection;
      }
    }
  });

  return sections;
}

export async function generateStockInsights(stockData: StockData): Promise<AIAnalysisResponse> {
  try {
    // Create a more focused input by selecting only relevant data
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
      return JSON.parse(cached.data) as AIAnalysisResponse;
    }

    // If no cache hit or data changed, generate new analysis
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert financial analyst with deep knowledge of market dynamics, technical analysis, and fundamental analysis. Your task is to provide a comprehensive stock analysis that is:
1. Data-driven: Use specific numbers and metrics from the provided data
2. Actionable: Provide clear insights that investors can use for decision-making
3. Balanced: Consider both bullish and bearish factors
4. Forward-looking: Focus on future potential while considering historical context

Analyze the data and provide insights in these exact sections:

MARKET_SUMMARY:
Analyze current price action, market context, and overall stock performance. Reference any relevant recent news that might be impacting today's movement. Compare with sector/industry trends if relevant. Focus on what's driving today's movement.

TRADING_ACTIVITY:
Examine volume patterns, price ranges, and market participation. Compare current trading activity with historical averages. Identify any unusual patterns or institutional activity. Consider if recent news events are affecting trading patterns.

FINANCIAL_HEALTH:
Evaluate key financial metrics including margins, cash flow, debt levels, and efficiency ratios. Assess the company's financial strength and operational efficiency. Consider how recent developments might impact these metrics.

TECHNICAL_SIGNALS:
Analyze price trends, support/resistance levels, and technical indicators. Consider both short-term trading opportunities and longer-term price patterns. Highlight key technical levels and potential breakout/breakdown points.

RISK_FACTORS:
Identify specific company, industry, and market risks. Consider competitive threats, regulatory challenges, and macroeconomic factors. Include any emerging risks highlighted in recent news.

GROWTH_DRIVERS:
Evaluate potential catalysts including market opportunities, innovation potential, competitive advantages, and industry trends. Consider recent announcements or news that could impact future growth.

For each section:
1. Provide detailed analysis
2. Use specific numbers when relevant
3. Explain the significance of key metrics
4. Connect data points to form meaningful insights
5. Reference relevant news events when applicable

When analyzing news:
- Consider the timing and source of news
- Evaluate potential market impact
- Look for patterns in news sentiment
- Connect news events to market movements
- Assess if news supports or contradicts other data points

End with:
SENTIMENT_SCORE: [0-100]
[Brief explanation of the score, including how recent news affects the outlook]

Scoring Guide:
0-20: Strong Sell (Major red flags or immediate threats)
21-40: Sell (Significant concerns outweigh potential)
41-60: Hold (Balanced outlook or unclear direction)
61-80: Buy (Strong positive factors with manageable risks)
81-100: Strong Buy (Exceptional outlook with multiple catalysts)

Keep the language professional but accessible to retail investors. Focus on actionable insights rather than just describing the data.`,
        },
        {
          role: 'user',
          content: `Stock analysis for ${stockData.quote.symbol}:
${JSON.stringify(analysisData, null, 2)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const rawAnalysis = response.choices[0]?.message?.content || 'No insights available.';
    const structuredAnalysis = parseAIResponse(rawAnalysis);

    // Cache the new analysis
    analysisCache.set(symbol, {
      data: JSON.stringify(structuredAnalysis),
      hash: currentHash,
    });

    return structuredAnalysis;
  } catch (error) {
    console.error('Error generating stock insights:', error);
    throw new Error('Failed to generate stock insights');
  }
}
