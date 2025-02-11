'use client'

import * as React from "react"

interface KeyStatsProps {
  quote: {
    price: number
    volume: number
    previousClose: number
    open: number
    dayHigh: number
    dayLow: number
  }
  keyStatistics: {
    beta?: number
    priceToBook?: number
    forwardPE?: number
    trailingEps?: number
    enterpriseValue?: number
    profitMargins?: number
  }
  dividendInfo: {
    yield?: number
    rate?: number
    exDate?: Date
  }
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toFixed(2)
}

function formatDate(date: Date | undefined): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

export function KeyStats({ quote, keyStatistics, dividendInfo }: KeyStatsProps) {
  const stats = [
    {
      label: "Previous Close",
      value: `$${quote.previousClose?.toFixed(2)}`,
    },
    {
      label: "Open",
      value: `$${quote.open?.toFixed(2)}`,
    },
    {
      label: "Day's Range",
      value: `$${quote.dayLow?.toFixed(2)} - $${quote.dayHigh?.toFixed(2)}`,
    },
    {
      label: "Volume",
      value: formatLargeNumber(quote.volume),
    },
    {
      label: "Beta",
      value: keyStatistics.beta?.toFixed(2) || 'N/A',
    },
    {
      label: "P/E Ratio",
      value: keyStatistics.forwardPE?.toFixed(2) || 'N/A',
    },
    {
      label: "EPS",
      value: keyStatistics.trailingEps ? `$${keyStatistics.trailingEps.toFixed(2)}` : 'N/A',
    },
    {
      label: "Price/Book",
      value: keyStatistics.priceToBook?.toFixed(2) || 'N/A',
    },
    {
      label: "Enterprise Value",
      value: keyStatistics.enterpriseValue ? formatLargeNumber(keyStatistics.enterpriseValue) : 'N/A',
    },
    {
      label: "Profit Margin",
      value: keyStatistics.profitMargins ? `${(keyStatistics.profitMargins * 100).toFixed(2)}%` : 'N/A',
    },
    {
      label: "Dividend Yield",
      value: dividendInfo.yield ? `${(dividendInfo.yield * 100).toFixed(2)}%` : 'N/A',
    },
    {
      label: "Ex-Dividend Date",
      value: formatDate(dividendInfo.exDate),
    },
  ]

  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="text-xl font-semibold mb-4">Key Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="font-medium">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
} 