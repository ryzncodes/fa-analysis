import axios from 'axios';
import { NewsItem } from './types/stock';
import { getCachedData, getCacheKey } from './cache';
import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { SentimentAnalyzer, PorterStemmer } from 'natural';
import readingTime from 'reading-time';

interface RSSMediaContent {
  $: {
    url: string;
  };
}

interface CustomRSSItem extends Parser.Item {
  'media:content'?: RSSMediaContent;
}

const rssParser = new Parser<CustomRSSItem>({
  customFields: {
    item: ['media:content', 'author', 'category']
  }
});

// Fundamental Data Interfaces
interface CompanyOverview {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  FiscalYearEnd: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  WeekHigh52: string;
  WeekLow52: string;
  DayMovingAverage50: string;
  DayMovingAverage200: string;
  SharesOutstanding: string;
  SharesFloat: string;
  SharesShort: string;
  SharesShortPriorMonth: string;
  ShortRatio: string;
  ShortPercentOutstanding: string;
  ShortPercentFloat: string;
  PercentInsiders: string;
  PercentInstitutions: string;
  ForwardAnnualDividendRate: string;
  ForwardAnnualDividendYield: string;
  PayoutRatio: string;
  DividendDate: string;
  ExDividendDate: string;
  LastSplitFactor: string;
  LastSplitDate: string;
}

interface IncomeStatement {
  fiscalDateEnding: string;
  reportedCurrency: string;
  grossProfit: string;
  totalRevenue: string;
  costOfRevenue: string;
  operatingIncome: string;
  netIncome: string;
  researchAndDevelopment: string;
  operatingExpenses: string;
  interestExpense: string;
  incomeTaxExpense: string;
  ebit: string;
  ebitda: string;
}

interface BalanceSheet {
  fiscalDateEnding: string;
  reportedCurrency: string;
  totalAssets: string;
  totalCurrentAssets: string;
  cashAndCashEquivalents: string;
  inventory: string;
  totalLiabilities: string;
  totalCurrentLiabilities: string;
  totalShareholderEquity: string;
  retainedEarnings: string;
  commonStock: string;
  commonStockSharesOutstanding: string;
}

interface CashFlow {
  fiscalDateEnding: string;
  reportedCurrency: string;
  operatingCashflow: string;
  capitalExpenditures: string;
  cashflowFromInvestment: string;
  cashflowFromFinancing: string;
  netIncome: string;
  dividendPayout: string;
  freeCashFlow: string;
}

interface EarningsData {
  fiscalDateEnding: string;
  reportedDate: string;
  reportedEPS: string;
  estimatedEPS: string;
  surprise: string;
  surprisePercentage: string;
}

// Add interface for NewsAPI response
interface NewsAPIArticle {
  title: string;
  url: string;
  source: {
    name: string;
  };
  publishedAt: string;
  description?: string;
  content?: string;
  author?: string;
  urlToImage?: string;
}

interface NewsAPIResponse {
  articles: NewsAPIArticle[];
}

const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const BASE_URL = 'https://www.alphavantage.co/query';

const TTL = {
  NEWS: 60 * 60 * 1000, // 1 hour in milliseconds
  FUNDAMENTAL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

async function extractArticleContent(url: string): Promise<string | undefined> {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const article = dom.window.document.querySelector('article') || dom.window.document.querySelector('.article-content');
    return article?.textContent || undefined;
  } catch (error) {
    console.error('Error extracting article content:', error);
    return undefined;
  }
}

async function analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
  const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
  const score = analyzer.getSentiment(text.split(' '));
  if (score > 0.2) return 'positive';
  if (score < -0.2) return 'negative';
  return 'neutral';
}

async function getGoogleNewsRSS(symbol: string): Promise<NewsItem[]> {
  try {
    const feed = await rssParser.parseURL(`https://news.google.com/rss/search?q=${symbol}+stock+when:7d&hl=en-US&gl=US&ceid=US:en`);
    
    const newsItems = await Promise.all(feed.items.map(async item => {
      const fullContent = await extractArticleContent(item.link || '');
      const sentiment = fullContent ? await analyzeSentiment(fullContent) : undefined;
      const sourceReliability: 'high' | 'medium' | 'low' = 'high';
      
      return {
        title: item.title || '',
        link: item.link || '',
        publisher: item.creator || 'Google News',
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        type: 'STORY',
        relatedTickers: [symbol],
        summary: item.contentSnippet || item.content || '',
        isPremium: false,
        author: item.creator || undefined,
        imageUrl: item['media:content']?.$.url,
        categories: item.categories || undefined,
        estimatedReadTime: fullContent ? Math.ceil(readingTime(fullContent).minutes) : undefined,
        fullContent,
        sentiment,
        sourceReliability,
        metadata: {
          language: 'en',
          region: 'US',
          isOriginalContent: true,
          lastUpdated: new Date().toISOString(),
          keywords: item.categories,
          tags: [symbol, 'stock', 'finance']
        }
      } as NewsItem;
    }));

    return newsItems;
  } catch (error) {
    console.error('Error fetching Google News:', error);
    return [];
  }
}

async function getNewsAPI(symbol: string): Promise<NewsItem[]> {
  try {
    const response = await axios.get<NewsAPIResponse>('https://newsapi.org/v2/everything', {
      params: {
        q: `${symbol} stock`,
        language: 'en',
        sortBy: 'publishedAt',
        apiKey: NEWS_API_KEY,
        domains: 'reuters.com,apnews.com,finance.yahoo.com,investing.com,seekingalpha.com/news',
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    const newsItems = await Promise.all(response.data.articles
      .filter(article => {
        const premiumIndicators = [
          'subscription required',
          'subscribers only',
          'premium',
          'benzinga',
          'motley fool',
          'zacks',
          'seeking alpha premium'
        ];
        
        return !premiumIndicators.some(indicator => 
          article.title?.toLowerCase().includes(indicator) ||
          article.description?.toLowerCase().includes(indicator) ||
          article.content?.toLowerCase().includes(indicator)
        );
      })
      .map(async article => {
        const fullContent = await extractArticleContent(article.url);
        const sentiment = fullContent ? await analyzeSentiment(fullContent) : undefined;
        const sourceReliability: 'high' | 'medium' | 'low' = 
          article.source.name.toLowerCase().includes('reuters') || 
          article.source.name.toLowerCase().includes('ap') ? 'high' : 'medium';
        
        return {
          title: article.title,
          link: article.url,
          publisher: article.source.name,
          publishedAt: article.publishedAt,
          type: 'STORY',
          relatedTickers: [symbol],
          summary: article.description || article.content || '',
          isPremium: false,
          author: article.author,
          imageUrl: article.urlToImage,
          estimatedReadTime: fullContent ? Math.ceil(readingTime(fullContent).minutes) : undefined,
          fullContent,
          sentiment,
          sourceReliability,
          metadata: {
            language: 'en',
            region: 'US',
            isOriginalContent: true,
            lastUpdated: article.publishedAt,
            keywords: [symbol, 'stock market', 'finance'],
            tags: [symbol, article.source.name]
          }
        } as NewsItem;
      }));

    return newsItems;
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return [];
  }
}

export async function getCompanyNews(symbol: string): Promise<NewsItem[]> {
  return getCachedData(
    getCacheKey('news', symbol),
    TTL.NEWS,
    async () => {
      try {
        const googleNews = await getGoogleNewsRSS(symbol);
        
        const newsAPINews = await getNewsAPI(symbol);
        
        const allNews = [...googleNews];
        
        const existingTitles = new Set(allNews.map(item => item.title.toLowerCase()));
        newsAPINews.forEach(item => {
          if (!existingTitles.has(item.title.toLowerCase())) {
            allNews.push(item);
          }
        });
        
        return allNews.sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      } catch (error) {
        console.error('Error fetching news:', error);
        return [];
      }
    }
  );
}

export async function getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
  return getCachedData(
    getCacheKey('overview', symbol),
    TTL.FUNDAMENTAL,
    async () => {
      try {
        const response = await axios.get<CompanyOverview>(BASE_URL, {
          params: {
            function: 'OVERVIEW',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        return response.data;
      } catch (error) {
        console.error('Error fetching company overview:', error);
        return null;
      }
    }
  );
}

export async function getIncomeStatement(symbol: string): Promise<IncomeStatement[]> {
  return getCachedData(
    getCacheKey('income', symbol),
    TTL.FUNDAMENTAL,
    async () => {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'INCOME_STATEMENT',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        return response.data.annualReports || [];
      } catch (error) {
        console.error('Error fetching income statement:', error);
        return [];
      }
    }
  );
}

export async function getBalanceSheet(symbol: string): Promise<BalanceSheet[]> {
  return getCachedData(
    getCacheKey('balance', symbol),
    TTL.FUNDAMENTAL,
    async () => {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'BALANCE_SHEET',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        return response.data.annualReports || [];
      } catch (error) {
        console.error('Error fetching balance sheet:', error);
        return [];
      }
    }
  );
}

export async function getCashFlow(symbol: string): Promise<CashFlow[]> {
  return getCachedData(
    getCacheKey('cashflow', symbol),
    TTL.FUNDAMENTAL,
    async () => {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'CASH_FLOW',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        return response.data.annualReports || [];
      } catch (error) {
        console.error('Error fetching cash flow:', error);
        return [];
      }
    }
  );
}

export async function getEarnings(symbol: string): Promise<EarningsData[]> {
  return getCachedData(
    getCacheKey('earnings', symbol),
    TTL.FUNDAMENTAL,
    async () => {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'EARNINGS',
            symbol,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        });

        return response.data.quarterlyEarnings || [];
      } catch (error) {
        console.error('Error fetching earnings data:', error);
        return [];
      }
    }
  );
} 