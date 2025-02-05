// lib/news-fetcher.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsItem } from './types/stock';

export interface EnrichedNewsItem extends NewsItem {
  content: string;
  summary?: string;
}

export async function fetchNewsContent(newsItem: NewsItem): Promise<EnrichedNewsItem> {
  try {
    // For Yahoo Finance URLs, try to get the RSS feed version
    if (newsItem.link.includes('finance.yahoo.com')) {
      const feedUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${newsItem.relatedTickers?.[0] || ''}&region=US&lang=en-US`;
      
      try {
        const response = await axios.get(feedUrl, {
          headers: {
            'Accept': 'application/rss+xml, application/xml, application/atom+xml',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 5000 // 5 second timeout
        });

        const $ = cheerio.load(response.data, { xmlMode: true });
        
        // Find the matching news item in the feed
        let content = '';
        let summary = '';
        
        $('item').each((_, item) => {
          const title = $(item).find('title').text();
          if (title.includes(newsItem.title.substring(0, 50))) { // Match first 50 chars of title
            content = $(item).find('description').text();
            summary = content.substring(0, 500) + '...'; // First 500 chars as summary
          }
        });

        return {
          ...newsItem,
          content: content || 'Content not found in RSS feed',
          summary
        };
      } catch (feedError) {
        console.error('Error fetching RSS feed:', feedError);
        // Fall back to original URL if RSS feed fails
      }
    }

    // For non-Yahoo Finance URLs or if RSS feed fails, try direct fetch with more robust error handling
    const response = await axios.get(newsItem.link, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      timeout: 5000, // 5 second timeout
      maxRedirects: 5,
      decompress: true
    });

    const $ = cheerio.load(response.data);

    // Remove unwanted elements
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    $('iframe').remove();
    $('.advertisement').remove();
    $('.ads').remove();

    // Extract the main content based on common article selectors
    const selectors = [
      'article',
      '[role="article"]',
      '.article-content',
      '.article-body',
      '.story-content',
      'main',
      '#article-body', // Common Yahoo Finance selector
      '.caas-body' // Another Yahoo Finance selector
    ];

    let content = '';
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        break;
      }
    }

    // Fallback to paragraph text if no content found
    if (!content) {
      content = $('p').text().trim();
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    const summary = content.substring(0, 500) + '...'; // First 500 chars as summary

    return {
      ...newsItem,
      content: content || 'Content could not be extracted',
      summary: summary || undefined
    };
  } catch (error) {
    console.error(`Error fetching news content for ${newsItem.link}:`, error);
    return {
      ...newsItem,
      content: 'Error fetching content',
      summary: newsItem.title // Use title as fallback summary
    };
  }
} 