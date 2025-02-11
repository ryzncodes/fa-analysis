import axios from 'axios';
import { getCachedData, getCacheKey } from './cache';
import Parser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { SentimentAnalyzer, PorterStemmer } from 'natural';
import readingTime from 'reading-time';
const rssParser = new Parser({
    customFields: {
        item: ['media:content', 'author', 'category']
    }
});
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const BASE_URL = 'https://www.alphavantage.co/query';
const TTL = {
    NEWS: 60 * 60 * 1000, // 1 hour in milliseconds
    FUNDAMENTAL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};
async function extractArticleContent(url) {
    try {
        const response = await axios.get(url);
        const dom = new JSDOM(response.data);
        const article = dom.window.document.querySelector('article') || dom.window.document.querySelector('.article-content');
        return article?.textContent || undefined;
    }
    catch (error) {
        console.error('Error extracting article content:', error);
        return undefined;
    }
}
async function analyzeSentiment(text) {
    const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    const score = analyzer.getSentiment(text.split(' '));
    if (score > 0.2)
        return 'positive';
    if (score < -0.2)
        return 'negative';
    return 'neutral';
}
async function getGoogleNewsRSS(symbol) {
    try {
        const feed = await rssParser.parseURL(`https://news.google.com/rss/search?q=${symbol}+stock+when:7d&hl=en-US&gl=US&ceid=US:en`);
        const newsItems = await Promise.all(feed.items.map(async (item) => {
            const fullContent = await extractArticleContent(item.link || '');
            const sentiment = fullContent ? await analyzeSentiment(fullContent) : undefined;
            const sourceReliability = 'high';
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
            };
        }));
        return newsItems;
    }
    catch (error) {
        console.error('Error fetching Google News:', error);
        return [];
    }
}
async function getNewsAPI(symbol) {
    try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
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
            return !premiumIndicators.some(indicator => article.title?.toLowerCase().includes(indicator) ||
                article.description?.toLowerCase().includes(indicator) ||
                article.content?.toLowerCase().includes(indicator));
        })
            .map(async (article) => {
            const fullContent = await extractArticleContent(article.url);
            const sentiment = fullContent ? await analyzeSentiment(fullContent) : undefined;
            const sourceReliability = article.source.name.toLowerCase().includes('reuters') ||
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
            };
        }));
        return newsItems;
    }
    catch (error) {
        console.error('Error fetching from NewsAPI:', error);
        return [];
    }
}
export async function getCompanyNews(symbol) {
    return getCachedData(getCacheKey('news', symbol), TTL.NEWS, async () => {
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
            return allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        }
        catch (error) {
            console.error('Error fetching news:', error);
            return [];
        }
    });
}
export async function getCompanyOverview(symbol) {
    return getCachedData(getCacheKey('overview', symbol), TTL.FUNDAMENTAL, async () => {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'OVERVIEW',
                    symbol,
                    apikey: ALPHA_VANTAGE_API_KEY
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching company overview:', error);
            return null;
        }
    });
}
export async function getIncomeStatement(symbol) {
    return getCachedData(getCacheKey('income', symbol), TTL.FUNDAMENTAL, async () => {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'INCOME_STATEMENT',
                    symbol,
                    apikey: ALPHA_VANTAGE_API_KEY
                }
            });
            return response.data.annualReports || [];
        }
        catch (error) {
            console.error('Error fetching income statement:', error);
            return [];
        }
    });
}
export async function getBalanceSheet(symbol) {
    return getCachedData(getCacheKey('balance', symbol), TTL.FUNDAMENTAL, async () => {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'BALANCE_SHEET',
                    symbol,
                    apikey: ALPHA_VANTAGE_API_KEY
                }
            });
            return response.data.annualReports || [];
        }
        catch (error) {
            console.error('Error fetching balance sheet:', error);
            return [];
        }
    });
}
export async function getCashFlow(symbol) {
    return getCachedData(getCacheKey('cashflow', symbol), TTL.FUNDAMENTAL, async () => {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'CASH_FLOW',
                    symbol,
                    apikey: ALPHA_VANTAGE_API_KEY
                }
            });
            return response.data.annualReports || [];
        }
        catch (error) {
            console.error('Error fetching cash flow:', error);
            return [];
        }
    });
}
export async function getEarnings(symbol) {
    return getCachedData(getCacheKey('earnings', symbol), TTL.FUNDAMENTAL, async () => {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'EARNINGS',
                    symbol,
                    apikey: ALPHA_VANTAGE_API_KEY
                }
            });
            return response.data.quarterlyEarnings || [];
        }
        catch (error) {
            console.error('Error fetching earnings data:', error);
            return [];
        }
    });
}
