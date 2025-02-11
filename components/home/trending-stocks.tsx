'use client'

import * as React from "react"
import Link from "next/link"
import { TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ErrorAlert } from "@/components/ui/alert"
import { getTrendingStocks, type Stock } from "@/lib/market-service"
import { cn } from "@/lib/utils"

export function TrendingStocks() {
  const [stocks, setStocks] = React.useState<Stock[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTrendingStocks()
      setStocks(data)
    } catch (error) {
      console.error("Error fetching trending stocks:", error)
      setError("Failed to fetch trending stocks. Please try again.")
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
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Trending Stocks</h2>
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
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Trending Stocks</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-lg border bg-background p-6"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            </div>
          ))
        ) : (
          stocks.map((stock) => (
            <Link
              key={stock.symbol}
              href={`/stock/${stock.symbol}`}
              className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg">${stock.price.toFixed(2)}</p>
                  <p className={`text-sm flex items-center gap-1 ${
                    stock.change >= 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {stock.change >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {Math.abs(stock.change).toFixed(2)}%
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  )
} 