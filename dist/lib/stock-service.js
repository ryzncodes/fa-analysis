import yahooFinance from "yahoo-finance2";
export async function getStockData(symbol) {
    try {
        const [quote, profile, keyStats, summaryDetail] = await Promise.all([
            yahooFinance.quote(symbol),
            yahooFinance.quoteSummary(symbol, { modules: ["assetProfile"] }),
            yahooFinance.quoteSummary(symbol, { modules: ["defaultKeyStatistics", "financialData"] }),
            yahooFinance.quoteSummary(symbol, { modules: ["summaryDetail"] })
        ]);
        // Get recent news
        const news = await yahooFinance.search(symbol, { newsCount: 5 });
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
                totalCash: keyStats.financialData?.totalCash,
                totalDebt: keyStats.financialData?.totalDebt,
                operatingMargins: keyStats.financialData?.operatingMargins,
                profitMargins: keyStats.financialData?.profitMargins,
                grossMargins: keyStats.financialData?.grossMargins,
                returnOnEquity: keyStats.financialData?.returnOnEquity,
                returnOnAssets: keyStats.financialData?.returnOnAssets,
                revenueGrowth: keyStats.financialData?.revenueGrowth,
                operatingCashflow: keyStats.financialData?.operatingCashflow,
                freeCashflow: keyStats.financialData?.freeCashflow,
            },
            keyStatistics: {
                beta: keyStats.defaultKeyStatistics?.beta,
                priceToBook: keyStats.defaultKeyStatistics?.priceToBook,
                forwardPE: keyStats.defaultKeyStatistics?.forwardPE,
                trailingEps: keyStats.defaultKeyStatistics?.trailingEps,
                enterpriseValue: keyStats.defaultKeyStatistics?.enterpriseValue,
                profitMargins: keyStats.financialData?.profitMargins,
            },
            dividendInfo: {
                yield: summaryDetail.summaryDetail?.dividendYield,
                rate: summaryDetail.summaryDetail?.dividendRate,
                exDate: summaryDetail.summaryDetail?.exDividendDate,
            },
            news: news.news?.map(item => ({
                title: item.title || '',
                link: item.link || '',
                publisher: item.publisher || '',
                providerPublishTime: item.providerPublishTime || Date.now() / 1000,
            })) || [],
            fundamentals: {
                marketCap: quote.marketCap || 0,
                trailingPE: quote.trailingPE || 0,
                forwardPE: quote.forwardPE || 0,
                eps: quote.epsTrailingTwelveMonths || 0,
            }
        };
    }
    catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        throw new Error(`Failed to fetch stock data for ${symbol}`);
    }
}
