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

const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const TTL = {
  NEWS: 60 * 60 * 1000, // 1 hour in milliseconds
};

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

interface ArticleMetric {
  type: 'percentage_change' | 'price_target' | 'financial_metric';
  value: number;
  context: string;
  direction?: string;
  unit?: string;
}

interface ArticleContent {
  content: string | undefined;
  metrics: ArticleMetric[];
}

async function extractArticleContent(url: string): Promise<ArticleContent> {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const article = dom.window.document.querySelector('article') || dom.window.document.querySelector('.article-content');
    
    // Extract key metrics and data points
    const metrics = extractMetrics(dom.window.document.body.textContent || '');
    
    return {
      content: article?.textContent || undefined,
      metrics
    };
  } catch (error) {
    console.error('Error extracting article content:', error);
    return { content: undefined, metrics: [] };
  }
}

function extractMetrics(text: string): ArticleMetric[] {
  const metrics: ArticleMetric[] = [];
  
  // Extract percentage changes
  const percentageRegex = /(increased|decreased|up|down|gained|lost|rose|fell|jumped|dropped|surged|plunged) by (\d+\.?\d*)%/gi;
  let match;
  while ((match = percentageRegex.exec(text)) !== null) {
    metrics.push({
      type: 'percentage_change',
      direction: match[1].toLowerCase(),
      value: parseFloat(match[2]),
      context: text.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
    });
  }

  // Extract price targets
  const priceTargetRegex = /price target (?:of |to |at )\$(\d+\.?\d*)/gi;
  while ((match = priceTargetRegex.exec(text)) !== null) {
    metrics.push({
      type: 'price_target',
      value: parseFloat(match[1]),
      context: text.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
    });
  }

  // Extract revenue/profit numbers
  const moneyRegex = /\$(\d+(?:\.\d+)?)\s*(million|billion|trillion)/gi;
  while ((match = moneyRegex.exec(text)) !== null) {
    metrics.push({
      type: 'financial_metric',
      value: parseFloat(match[1]) * (match[2].toLowerCase() === 'billion' ? 1e9 : match[2].toLowerCase() === 'trillion' ? 1e12 : 1e6),
      unit: match[2],
      context: text.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
    });
  }

  return metrics;
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
      const { content: fullContent, metrics } = await extractArticleContent(item.link || '');
      const sentiment = fullContent ? await analyzeSentiment(fullContent) : undefined;
      const sourceReliability: 'high' | 'medium' | 'low' = 'high';
      
      // Enhanced summary generation with multiple fallbacks
      let summary = '';
      if (item.contentSnippet && item.contentSnippet.length > 0) {
        summary = item.contentSnippet;
      } else if (fullContent && fullContent.length > 0) {
        summary = fullContent.substring(0, 300) + '...';
      } else if (item.content && item.content.length > 0) {
        summary = item.content.substring(0, 300) + '...';
      } else {
        // Final fallback - use title
        summary = `Latest news about ${item.title}`;
      }
      
      return {
        title: item.title || '',
        link: item.link || '',
        publisher: item.creator || 'Google News',
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        type: 'STORY',
        relatedTickers: [symbol],
        summary,
        isPremium: false,
        author: item.creator || undefined,
        imageUrl: item['media:content']?.$.url,
        categories: item.categories || undefined,
        estimatedReadTime: fullContent ? Math.ceil(readingTime(fullContent).minutes) : undefined,
        fullContent,
        sentiment,
        sourceReliability,
        metrics,
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
        const { content: fullContent, metrics } = await extractArticleContent(article.url);
        const sentiment = fullContent ? await analyzeSentiment(fullContent) : undefined;
        const sourceReliability: 'high' | 'medium' | 'low' = 
          article.source.name.toLowerCase().includes('reuters') || 
          article.source.name.toLowerCase().includes('ap') ? 'high' : 'medium';

        // Enhanced summary generation with multiple fallbacks
        let summary = '';
        if (article.description && article.description.length > 0) {
          summary = article.description;
        } else if (article.content && article.content.length > 0) {
          summary = article.content.substring(0, 300) + '...';
        } else if (fullContent && fullContent.length > 0) {
          summary = fullContent.substring(0, 300) + '...';
        } else {
          // Final fallback - use title
          summary = `Latest news about ${article.title}`;
        }
        
        return {
          title: article.title,
          link: article.url,
          publisher: article.source.name,
          publishedAt: article.publishedAt,
          type: 'STORY',
          relatedTickers: [symbol],
          summary,
          isPremium: false,
          author: article.author,
          imageUrl: article.urlToImage,
          estimatedReadTime: fullContent ? Math.ceil(readingTime(fullContent).minutes) : undefined,
          fullContent,
          sentiment,
          sourceReliability,
          metrics,
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