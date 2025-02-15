import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

interface HistoricalRow {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const TRENDING_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META'];
const INDEX_SYMBOLS = ['^GSPC', '^DJI', '^IXIC', '^RUT'];
const INDEX_NAMES = ['S&P 500', 'Dow Jones', 'Nasdaq', 'Russell 2000'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'indices': {
        const quotes = await Promise.all(INDEX_SYMBOLS.map((symbol) => yahooFinance.quote(symbol)));
        const indices = quotes.map((quote, index) => ({
          name: INDEX_NAMES[index],
          symbol: INDEX_SYMBOLS[index],
          value: quote.regularMarketPrice || 0,
          change: quote.regularMarketChangePercent || 0,
        }));
        return NextResponse.json(indices);
      }

      case 'trending': {
        // Fetch both current quotes and historical data for sparklines
        const quotesPromises = TRENDING_SYMBOLS.map((symbol) => yahooFinance.quote(symbol));
        const sparklinePromises = TRENDING_SYMBOLS.map((symbol) => {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 7); // Get 7 days of data for sparklines

          return yahooFinance.historical(symbol, {
            period1: startDate,
            period2: endDate,
            interval: '1d',
          });
        });

        const [quotes, ...sparklineData] = await Promise.all([Promise.all(quotesPromises), ...sparklinePromises]);

        const stocks = quotes.map((quote, index) => {
          const marketCap = quote.marketCap || 0;
          const marketCapFormatted = marketCap >= 1e12 ? `${(marketCap / 1e12).toFixed(1)}T` : `${(marketCap / 1e9).toFixed(1)}B`;

          const volume = quote.regularMarketVolume || 0;
          const volumeFormatted = volume >= 1e9 ? `${(volume / 1e9).toFixed(1)}B` : volume >= 1e6 ? `${(volume / 1e6).toFixed(1)}M` : `${(volume / 1e3).toFixed(1)}K`;

          // Extract sparkline data points
          const sparkline = (sparklineData[index] as HistoricalRow[])?.map((item) => item.close) || [];

          return {
            symbol: quote.symbol || '',
            name: quote.shortName || quote.longName || '',
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChangePercent || 0,
            volume: volumeFormatted,
            marketCap: marketCapFormatted,
            dayHigh: quote.regularMarketDayHigh || 0,
            dayLow: quote.regularMarketDayLow || 0,
            shortName: quote.shortName || '',
            longName: quote.longName || '',
            sparklineData: sparkline,
          };
        });

        // Sort by market cap descending
        stocks.sort((a, b) => {
          const aValue = parseFloat(a.marketCap.replace(/[TB]/g, '')) * (a.marketCap.includes('T') ? 1000 : 1);
          const bValue = parseFloat(b.marketCap.replace(/[TB]/g, '')) * (b.marketCap.includes('T') ? 1000 : 1);
          return bValue - aValue;
        });

        return NextResponse.json(stocks);
      }

      case 'sentiment': {
        // Get VIX for volatility and SPY for volume
        const [vix, spy] = await Promise.all([yahooFinance.quote('^VIX'), yahooFinance.quote('SPY')]);

        const volatility = vix.regularMarketPrice || 0;
        const sentiment = Math.max(0, Math.min(100, 100 - volatility));
        const volume = spy.regularMarketVolume || 0;
        const volumeFormatted = `${(volume / 1e9).toFixed(1)}B`;

        return NextResponse.json({
          sentiment,
          volume: volumeFormatted,
          volatility,
        });
      }

      case 'historical': {
        const symbol = searchParams.get('symbol');
        const timeframe = searchParams.get('timeframe');

        if (!symbol) {
          return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
        }

        // Calculate start date based on timeframe
        const now = new Date();
        const startDate = new Date(now);
        switch (timeframe) {
          case '1D':
            startDate.setHours(0, 0, 0, 0);
            break;
          case '1W':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case '1M':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case '3M':
            startDate.setMonth(startDate.getMonth() - 3);
            break;
          case '1Y':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          case '5Y':
            startDate.setFullYear(startDate.getFullYear() - 5);
            break;
          default:
            startDate.setMonth(startDate.getMonth() - 1); // Default to 1M
        }

        try {
          console.log(`Fetching historical data for ${symbol} from ${startDate.toISOString()} to ${now.toISOString()}`);

          // Fetch real historical data from Yahoo Finance
          const result = await yahooFinance.historical(symbol, {
            period1: startDate,
            period2: now,
            interval: '1d', // Use daily interval for consistent data
          });

          if (!result || !Array.isArray(result) || result.length === 0) {
            console.error(`No historical data returned for ${symbol}`);
            return NextResponse.json({ error: 'No historical data available' }, { status: 404 });
          }

          console.log(`Received ${result.length} data points for ${symbol}`);

          // Transform the data to match our expected format
          const historicalData = (result as HistoricalRow[]).map((item) => ({
            time: Math.floor(new Date(item.date).getTime() / 1000),
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume,
          }));

          if (historicalData.length === 0) {
            console.error(`Data transformation resulted in empty array for ${symbol}`);
            return NextResponse.json({ error: 'Failed to process historical data' }, { status: 500 });
          }

          console.log(`Successfully processed ${historicalData.length} data points for ${symbol}`);
          return NextResponse.json(historicalData);
        } catch (error) {
          console.error(`Error fetching historical data for ${symbol}:`, error);
          return NextResponse.json({ error: 'Failed to fetch historical data', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Market API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
