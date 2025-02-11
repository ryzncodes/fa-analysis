'use client'

import * as React from "react"
import { LineChart, ArrowUpRight, ArrowDownRight, Activity, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ErrorAlert } from "@/components/ui/alert"
import { getMarketIndices, getMarketSentiment, type MarketIndex } from "@/lib/market-service"
import { cn } from "@/lib/utils"

export function MarketOverview() {
  const [indices, setIndices] = React.useState<MarketIndex[]>([])
  const [sentiment, setSentiment] = React.useState({ sentiment: 0, volume: "0B", volatility: 0 })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [indicesData, sentimentData] = await Promise.all([
        getMarketIndices(),
        getMarketSentiment()
      ])
      setIndices(indicesData)
      setSentiment(sentimentData)
    } catch (error) {
      console.error("Error fetching market data:", error)
      setError("Failed to fetch market data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  if (error) {
    return (
      <section className="py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Market Overview</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
        <ErrorAlert
          title="Error"
          description={error}
          className="mb-4"
        />
      </section>
    )
  }

  return (
    <section className="py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Market Overview</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))
        ) : (
          indices.map((index) => (
            <div
              key={index.symbol}
              className="rounded-lg border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{index.name}</h3>
                  <p className="text-xs text-muted-foreground">{index.symbol}</p>
                </div>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3">
                <p className="font-mono text-2xl">{index.value.toLocaleString()}</p>
                <p className={`text-sm flex items-center gap-1 mt-1 ${
                  index.change >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  {index.change >= 0 ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {Math.abs(index.change).toFixed(2)}%
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))
        ) : (
          <>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-2">Market Sentiment</h3>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500" 
                    style={{ width: `${sentiment.sentiment}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{sentiment.sentiment}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {sentiment.sentiment > 50 ? "Bullish" : "Bearish"}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-2">Trading Volume</h3>
              <p className="font-mono text-2xl">{sentiment.volume}</p>
              <p className="text-xs text-muted-foreground">Shares traded today</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-2">Market Volatility</h3>
              <p className="font-mono text-2xl">{sentiment.volatility.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">VIX Index</p>
            </div>
          </>
        )}
      </div>
    </section>
  )
} 