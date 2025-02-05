import yahooFinance from 'yahoo-finance2';
import { StockAnalysis, StockQuote, CompanyProfile, FinancialData, KeyStatistics, DividendInfo, NewsItem } from './types/stock';
import { fetchNewsContent, EnrichedNewsItem } from './news-fetcher';

export interface EnrichedStockAnalysis extends Omit<StockAnalysis, 'news'> {
  news: EnrichedNewsItem[];
}

export async function getStockData(ticker: string): Promise<EnrichedStockAnalysis> {
  try {
    // Fetch quote data
    const quote = await yahooFinance.quote(ticker);
    
    // Fetch detailed data using quoteSummary
    const [
      profile,
      financials,
      defaultKeyStats,
      summaryDetail
    ] = await Promise.all([
      yahooFinance.quoteSummary(ticker, { modules: ['assetProfile'] }),
      yahooFinance.quoteSummary(ticker, { modules: ['financialData'] }),
      yahooFinance.quoteSummary(ticker, { modules: ['defaultKeyStatistics'] }),
      yahooFinance.quoteSummary(ticker, { modules: ['summaryDetail'] })
    ]);

    // Fetch news
    const news = await yahooFinance.search(ticker, { newsCount: 5 });

    // Transform quote data with null checks
    const stockQuote: StockQuote = {
      symbol: quote.symbol || ticker,
      regularMarketPrice: quote.regularMarketPrice || 0,
      regularMarketChange: quote.regularMarketChange || 0,
      regularMarketChangePercent: quote.regularMarketChangePercent || 0,
      regularMarketVolume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap || 0,
      regularMarketOpen: quote.regularMarketOpen || 0,
      regularMarketDayHigh: quote.regularMarketDayHigh || 0,
      regularMarketDayLow: quote.regularMarketDayLow || 0,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
      averageVolume: quote.regularMarketVolume || 0
    };

    // Transform company profile with null checks
    const companyProfile: CompanyProfile = {
      longName: quote.longName || '',
      industry: profile.assetProfile?.industry || '',
      sector: profile.assetProfile?.sector || '',
      website: profile.assetProfile?.website || '',
      longBusinessSummary: profile.assetProfile?.longBusinessSummary || '',
      fullTimeEmployees: profile.assetProfile?.fullTimeEmployees || 0,
      city: profile.assetProfile?.city || '',
      country: profile.assetProfile?.country || ''
    };

    // Transform financial data with null checks
    const financialData: FinancialData = {
      currentPrice: financials.financialData?.currentPrice || 0,
      revenueGrowth: financials.financialData?.revenueGrowth || 0,
      grossMargins: financials.financialData?.grossMargins || 0,
      profitMargins: financials.financialData?.profitMargins || 0,
      operatingMargins: financials.financialData?.operatingMargins || 0,
      returnOnEquity: financials.financialData?.returnOnEquity || 0,
      totalCash: financials.financialData?.totalCash || 0,
      totalDebt: financials.financialData?.totalDebt || 0,
      debtToEquity: financials.financialData?.debtToEquity || 0,
      currentRatio: financials.financialData?.currentRatio || 0,
      quickRatio: financials.financialData?.quickRatio || 0,
      totalRevenue: financials.financialData?.totalRevenue || 0,
      revenuePerShare: financials.financialData?.revenuePerShare || 0,
      ebitda: financials.financialData?.ebitda || 0,
      ebitdaMargins: financials.financialData?.ebitdaMargins || 0,
      freeCashflow: financials.financialData?.freeCashflow || 0
    };

    // Transform key statistics with null checks
    const keyStatistics: KeyStatistics = {
      enterpriseValue: defaultKeyStats.defaultKeyStatistics?.enterpriseValue || 0,
      forwardPE: defaultKeyStats.defaultKeyStatistics?.forwardPE || 0,
      pegRatio: defaultKeyStats.defaultKeyStatistics?.pegRatio || 0,
      priceToBook: defaultKeyStats.defaultKeyStatistics?.priceToBook || 0,
      enterpriseToRevenue: defaultKeyStats.defaultKeyStatistics?.enterpriseToRevenue || 0,
      enterpriseToEbitda: defaultKeyStats.defaultKeyStatistics?.enterpriseToEbitda || 0,
      beta: defaultKeyStats.defaultKeyStatistics?.beta || 0,
      earningsGrowth: financials.financialData?.earningsGrowth || 0,
      revenueGrowth: financials.financialData?.revenueGrowth || 0,
      trailingEps: defaultKeyStats.defaultKeyStatistics?.trailingEps || 0,
      forwardEps: defaultKeyStats.defaultKeyStatistics?.forwardEps || 0,
      bookValue: defaultKeyStats.defaultKeyStatistics?.bookValue || 0
    };

    // Transform dividend information with null checks
    const dividendInfo: DividendInfo = {
      dividendRate: summaryDetail.summaryDetail?.dividendRate || 0,
      dividendYield: summaryDetail.summaryDetail?.dividendYield || 0,
      payoutRatio: summaryDetail.summaryDetail?.payoutRatio || 0,
      fiveYearAvgDividendYield: summaryDetail.summaryDetail?.fiveYearAvgDividendYield || 0,
      lastDividendDate: summaryDetail.summaryDetail?.exDividendDate ? new Date(summaryDetail.summaryDetail.exDividendDate).toISOString() : null,
      lastDividendValue: summaryDetail.summaryDetail?.dividendRate || 0
    };

    // Transform news items and fetch content
    const newsItems: NewsItem[] = news.news?.map(item => ({
      title: item.title || '',
      link: item.link || '',
      publisher: item.publisher || '',
      publishedAt: typeof item.providerPublishTime === 'number' 
        ? new Date(item.providerPublishTime * 1000).toISOString() 
        : new Date().toISOString(),
      type: item.type || '',
      relatedTickers: item.relatedTickers || []
    })) || [];

    // Fetch news content in parallel
    const enrichedNews = await Promise.all(
      newsItems.map(item => fetchNewsContent(item))
    );

    return {
      quote: stockQuote,
      profile: companyProfile,
      financials: financialData,
      keyStatistics: keyStatistics,
      dividendInfo: dividendInfo,
      news: enrichedNews
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return {
      quote: {} as StockQuote,
      profile: {} as CompanyProfile,
      financials: {} as FinancialData,
      keyStatistics: {} as KeyStatistics,
      dividendInfo: {} as DividendInfo,
      news: [],
      error: error instanceof Error ? error.message : 'An error occurred while fetching stock data'
    };
  }
} 