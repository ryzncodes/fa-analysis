import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");
        switch (type) {
            case "indices": {
                const symbols = ["^GSPC", "^DJI", "^IXIC", "^RUT"];
                const names = ["S&P 500", "Dow Jones", "Nasdaq", "Russell 2000"];
                const quotes = await Promise.all(symbols.map(symbol => yahooFinance.quote(symbol)));
                const indices = quotes.map((quote, index) => ({
                    name: names[index],
                    symbol: symbols[index],
                    value: quote.regularMarketPrice || 0,
                    change: quote.regularMarketChangePercent || 0
                }));
                return NextResponse.json(indices);
            }
            case "trending": {
                const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META"];
                const quotes = await Promise.all(symbols.map(symbol => yahooFinance.quote(symbol)));
                const stocks = quotes.map(quote => ({
                    symbol: quote.symbol || "",
                    name: quote.longName || "",
                    price: quote.regularMarketPrice || 0,
                    change: quote.regularMarketChangePercent || 0
                }));
                return NextResponse.json(stocks);
            }
            case "sentiment": {
                const vix = await yahooFinance.quote("^VIX");
                const spyVolume = await yahooFinance.quote("SPY");
                const sentiment = Math.max(0, Math.min(100, 100 - (vix.regularMarketPrice || 20)));
                const volume = `${((spyVolume.regularMarketVolume || 0) / 1e9).toFixed(1)}B`;
                return NextResponse.json({
                    sentiment,
                    volume,
                    volatility: vix.regularMarketPrice || 0
                });
            }
            default:
                return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
        }
    }
    catch (error) {
        console.error("Market API Error:", error);
        return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
    }
}
