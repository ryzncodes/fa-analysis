import { generateStockInsights } from '../lib/openai-service.js';
const sampleStockData = {
    quote: {
        symbol: "AAPL",
        price: 175.50,
        change: 2.30,
        changePercent: 1.32,
        volume: 55000000,
        previousClose: 173.20,
        open: 173.50,
        dayHigh: 176.20,
        dayLow: 173.10,
        fiftyTwoWeekHigh: 180.50,
        fiftyTwoWeekLow: 140.20,
        averageVolume: 60000000,
        marketCap: 2800000000000
    },
    profile: {
        longName: "Apple Inc.",
        longBusinessSummary: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
        sector: "Technology",
        industry: "Consumer Electronics",
        website: "www.apple.com",
        fullTimeEmployees: 164000,
        country: "United States",
        city: "Cupertino"
    },
    financials: {
        totalCash: 62640000000,
        totalDebt: 109280000000,
        operatingMargins: 0.3017,
        profitMargins: 0.2518,
        grossMargins: 0.4432,
        returnOnEquity: 1.4591,
        returnOnAssets: 0.2772,
        revenueGrowth: 0.0777,
        operatingCashflow: 110543000000,
        freeCashflow: 90215000000
    },
    keyStatistics: {
        beta: 1.28,
        priceToBook: 44.65,
        forwardPE: 27.32,
        trailingEps: 6.13,
        enterpriseValue: 2847000000000,
        earningsGrowth: 0.0935
    },
    dividendInfo: {
        yield: 0.0055,
        rate: 0.96,
        exDate: new Date("2024-02-09")
    },
    news: [
        {
            title: "Apple Vision Pro Sales Estimates Cut By Analyst",
            link: "https://example.com/news/1",
            publisher: "Financial News",
            providerPublishTime: 1707901200
        }
    ],
    fundamentals: {
        marketCap: 2800000000000,
        trailingPE: 28.63,
        forwardPE: 27.32,
        eps: 6.13
    }
};
async function testStockInsights() {
    try {
        console.log("Testing stock insights generation...");
        const insights = await generateStockInsights(sampleStockData);
        console.log("\nGenerated Insights:");
        console.log("==================");
        console.log(insights);
        console.log("\nTest completed successfully!");
    }
    catch (error) {
        console.error("Test failed:", error);
    }
}
testStockInsights();
