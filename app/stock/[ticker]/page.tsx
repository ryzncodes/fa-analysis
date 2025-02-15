import { getStockData } from '@/lib/stock-service';
import { getHistoricalPrices, type HistoricalDataPoint } from '@/lib/market-service';
import { generateStockInsights } from '@/lib/openai-service';
import { StockHeader } from '@/components/stock/StockHeader';
import { PriceChart } from '@/components/stock/PriceChart';
import { CompanyOverview } from '@/components/stock/CompanyOverview';
import { FinancialDataTabs } from '@/components/stock/FinancialDataTabs';
import { KeyStats } from '@/components/stock/KeyStats';
import { NewsFeed } from '@/components/stock/NewsFeed';
import { UTCTimestamp } from 'lightweight-charts';

export default async function StockPage({ params: { ticker } }: { params: { ticker: string } }) {
  // Fetch stock data first
  const stockData = await getStockData(ticker);

  // Then fetch historical prices and generate insights in parallel
  const [historicalPrices, insights] = await Promise.all([getHistoricalPrices(ticker, '1M'), generateStockInsights(stockData)]);

  // Transform historical prices to match PriceChart component's expected format
  const transformedPrices = historicalPrices.map((point: HistoricalDataPoint) => ({
    ...point,
    time: point.time as UTCTimestamp,
  }));

  return (
    <main>
      <div className='container py-6 space-y-8'>
        <StockHeader stockData={stockData} insights={insights} />
        <PriceChart data={transformedPrices} symbol={ticker} className='col-span-2' />
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='col-span-2 space-y-6'>
            <CompanyOverview profile={stockData.profile} />
            <FinancialDataTabs financials={stockData.financials} fundamentals={stockData.fundamentals} />
          </div>
          <div className='space-y-6'>
            <KeyStats quote={stockData.quote} keyStatistics={stockData.keyStatistics} dividendInfo={stockData.dividendInfo} />
            <NewsFeed news={stockData.news} symbol={ticker} />
          </div>
        </div>
      </div>
    </main>
  );
}
