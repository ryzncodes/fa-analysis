import { getCompanyNews } from './lib/stock-news-service';
export async function testNewsService() {
    try {
        console.log('Fetching news for AAPL...');
        const news = await getCompanyNews('AAPL');
        console.log('Number of news items found:', news.length);
        console.log('\nFirst news item:');
        if (news.length > 0) {
            const firstNews = news[0];
            console.log({
                title: firstNews.title,
                publisher: firstNews.publisher,
                publishedAt: firstNews.publishedAt,
                sentiment: firstNews.sentiment,
                metrics: firstNews.metrics,
                summary: firstNews.summary?.substring(0, 200) + '...'
            });
        }
    }
    catch (error) {
        console.error('Error testing news service:', error);
    }
}
// Run the test if this file is being executed directly
if (require.main === module) {
    testNewsService();
}
