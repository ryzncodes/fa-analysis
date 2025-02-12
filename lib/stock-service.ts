import yahooFinance from 'yahoo-finance2';
import { type StockData } from './openai-service';
import { normalizeDate, formatNumber, formatCurrency, formatMarketCap, formatPercentage, formatRatio } from './utils/standardize';
import { withRetry, APIError, ValidationError, logError } from './utils/errorHandler';

// Validate stock symbol
function validateSymbol(symbol: string): void {
  if (!symbol) {
    throw new ValidationError('Stock symbol is required');
  }
  if (!/^[A-Za-z.-]+$/.test(symbol)) {
    throw new ValidationError('Invalid stock symbol format');
  }
}

export async function getStockData(symbol: string): Promise<StockData> {
  try {
    // Validate input
    validateSymbol(symbol);

    // Fetch data with retry logic
    const [quote, profile, keyStats, summaryDetail] = await Promise.all([
      withRetry(() => yahooFinance.quote(symbol)),
      withRetry(() => yahooFinance.quoteSummary(symbol, { modules: ['assetProfile'] })),
      withRetry(() => yahooFinance.quoteSummary(symbol, { modules: ['defaultKeyStatistics', 'financialData'] })),
      withRetry(() => yahooFinance.quoteSummary(symbol, { modules: ['summaryDetail'] })),
    ]);

    // Get recent news with retry
    const news = await withRetry(() => yahooFinance.search(symbol, { newsCount: 5 }));

    // If we got here but don't have the basic quote data, throw an error
    if (!quote) {
      throw new APIError(`No data available for symbol: ${symbol}`, 404, false);
    }

    return {
      quote: {
        symbol: quote.symbol || symbol,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        previousClose: quote.regularMarketPreviousClose || 0,
        open: quote.regularMarketOpen || 0,
        dayHigh: quote.regularMarketDayHigh || 0,
        dayLow: quote.regularMarketDayLow || 0,
      },
      profile: {
        longName: quote.longName || symbol,
        longBusinessSummary: profile.assetProfile?.longBusinessSummary || '',
        sector: profile.assetProfile?.sector || '',
        industry: profile.assetProfile?.industry || '',
        website: profile.assetProfile?.website || '',
        fullTimeEmployees: profile.assetProfile?.fullTimeEmployees || 0,
        country: profile.assetProfile?.country || '',
        city: profile.assetProfile?.city || '',
      },
      financials: {
        totalCash: keyStats.financialData?.totalCash || 0,
        totalDebt: keyStats.financialData?.totalDebt || 0,
        operatingMargins: keyStats.financialData?.operatingMargins || 0,
        profitMargins: keyStats.financialData?.profitMargins || 0,
        grossMargins: keyStats.financialData?.grossMargins || 0,
        returnOnEquity: keyStats.financialData?.returnOnEquity || 0,
        returnOnAssets: keyStats.financialData?.returnOnAssets || 0,
        revenueGrowth: keyStats.financialData?.revenueGrowth || 0,
        operatingCashflow: keyStats.financialData?.operatingCashflow || 0,
        freeCashflow: keyStats.financialData?.freeCashflow || 0,
      },
      keyStatistics: {
        beta: keyStats.defaultKeyStatistics?.beta || 0,
        priceToBook: keyStats.defaultKeyStatistics?.priceToBook || 0,
        forwardPE: keyStats.defaultKeyStatistics?.forwardPE || 0,
        trailingEps: keyStats.defaultKeyStatistics?.trailingEps || 0,
        enterpriseValue: keyStats.defaultKeyStatistics?.enterpriseValue || 0,
        profitMargins: keyStats.financialData?.profitMargins || 0,
      },
      dividendInfo: {
        yield: summaryDetail.summaryDetail?.dividendYield || 0,
        rate: summaryDetail.summaryDetail?.dividendRate || 0,
        exDate: summaryDetail.summaryDetail?.exDividendDate ? normalizeDate(summaryDetail.summaryDetail.exDividendDate) : '',
      },
      news:
        news.news?.map((item) => ({
          title: item.title || '',
          link: item.link || '',
          publisher: item.publisher || '',
          providerPublishTime: item.providerPublishTime ? normalizeDate(new Date(item.providerPublishTime * 1000)) : '',
        })) || [],
      fundamentals: {
        marketCap: quote.marketCap || 0,
        trailingPE: quote.trailingPE || 0,
        forwardPE: quote.forwardPE || 0,
        eps: quote.epsTrailingTwelveMonths || 0,
      },
    };
  } catch (error) {
    // Log error with context
    logError(error, { symbol, service: 'getStockData' });

    // Rethrow as APIError if it's not already one of our custom errors
    if (!(error instanceof APIError) && !(error instanceof ValidationError)) {
      throw new APIError(`Failed to fetch stock data for ${symbol}`, 500, error instanceof Error && error.message.includes('network'));
    }
    throw error;
  }
}
