import OpenAI from 'openai';
// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// Default to O3 Mini if no model is specified
const DEFAULT_MODEL = 'o3-mini-2025-01-31';
export async function generateStockInsights(stockData) {
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
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are a financial analyst. Analyze the stock data and provide a brief, factual summary focusing on performance and key metrics.'
                },
                {
                    role: 'user',
                    content: `Stock analysis for ${stockData.quote.symbol}:
${JSON.stringify(analysisData, null, 2)}`
                }
            ],
            temperature: 0.3,
            max_tokens: 100,
        });
        return response.choices[0]?.message?.content || 'No insights available.';
    }
    catch (error) {
        console.error('Error generating stock insights:', error);
        throw new Error('Failed to generate stock insights');
    }
}
