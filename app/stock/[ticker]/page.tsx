import * as React from "react"
import { getStockData } from "@/lib/stock-service"
import { generateStockInsights } from "@/lib/openai-service"
import { StockHeader } from "@/components/stock/StockHeader"
import { CompanyOverview } from "@/components/stock/CompanyOverview"
import { KeyStats } from "@/components/stock/KeyStats"
import { FinancialDataTabs } from "@/components/stock/FinancialDataTabs"
import { NewsFeed } from "@/components/stock/NewsFeed"

interface PageProps {
  params: {
    ticker: string
  }
}

export default async function StockPage({ params }: PageProps) {
  const ticker = params.ticker
  
  try {
    // Fetch stock data
    const stockData = await getStockData(ticker);
    
    // Generate insights using OpenAI
    const insights = await generateStockInsights(stockData);

    return (
      <div className="container py-6 space-y-8">
        <StockHeader 
          stockData={stockData}
          insights={insights}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <CompanyOverview 
              profile={stockData.profile}
            />
            <FinancialDataTabs 
              financials={stockData.financials}
              fundamentals={stockData.fundamentals}
            />
          </div>
          
          <div className="space-y-6">
            <KeyStats 
              quote={stockData.quote}
              keyStatistics={stockData.keyStatistics}
              dividendInfo={stockData.dividendInfo}
            />
            <NewsFeed 
              news={stockData.news}
              symbol={ticker}
            />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error(`Error in stock page for ${ticker}:`, error);
    return (
      <div className="container py-6">
        <div className="rounded-lg border border-destructive/50 p-4">
          <h1 className="text-lg font-semibold text-destructive mb-2">Error Loading Stock Data</h1>
          <p className="text-muted-foreground">
            Failed to load stock data for {ticker}. Please try again later or check if the stock symbol is correct.
          </p>
        </div>
      </div>
    )
  }
} 