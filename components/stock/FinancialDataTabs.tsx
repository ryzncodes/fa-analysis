'use client'

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface FinancialDataTabsProps {
  financials: {
    totalCash?: number
    totalDebt?: number
    operatingMargins?: number
    profitMargins?: number
    grossMargins?: number
    returnOnEquity?: number
    returnOnAssets?: number
    revenueGrowth?: number
    operatingCashflow?: number
    freeCashflow?: number
  }
  fundamentals: {
    marketCap: number
    trailingPE: number
    forwardPE: number
    eps: number
  }
}

function formatLargeNumber(num: number | undefined): string {
  if (!num) return 'N/A'
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toFixed(2)
}

function formatPercentage(num: number | undefined): string {
  if (!num) return 'N/A'
  return `${(num * 100).toFixed(2)}%`
}

export function FinancialDataTabs({ financials, fundamentals }: FinancialDataTabsProps) {
  return (
    <section className="rounded-lg border bg-card">
      <Tabs defaultValue="overview" className="p-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="margins">Margins</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="font-medium">{formatLargeNumber(fundamentals.marketCap)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">P/E Ratio (TTM)</p>
              <p className="font-medium">{fundamentals.trailingPE?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Forward P/E</p>
              <p className="font-medium">{fundamentals.forwardPE?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">EPS (TTM)</p>
              <p className="font-medium">${fundamentals.eps?.toFixed(2) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Cash</p>
              <p className="font-medium">{formatLargeNumber(financials.totalCash)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Debt</p>
              <p className="font-medium">{formatLargeNumber(financials.totalDebt)}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="margins" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Operating Margin</p>
              <p className="font-medium">{formatPercentage(financials.operatingMargins)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <p className="font-medium">{formatPercentage(financials.profitMargins)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gross Margin</p>
              <p className="font-medium">{formatPercentage(financials.grossMargins)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Return on Equity</p>
              <p className="font-medium">{formatPercentage(financials.returnOnEquity)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Return on Assets</p>
              <p className="font-medium">{formatPercentage(financials.returnOnAssets)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue Growth</p>
              <div className="flex items-center gap-1">
                <p className="font-medium">{formatPercentage(financials.revenueGrowth)}</p>
                {financials.revenueGrowth && (
                  financials.revenueGrowth > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Operating Cash Flow</p>
              <p className="font-medium">{formatLargeNumber(financials.operatingCashflow)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Free Cash Flow</p>
              <p className="font-medium">{formatLargeNumber(financials.freeCashflow)}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
} 