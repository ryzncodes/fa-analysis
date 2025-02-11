'use client'

import * as React from "react"
import { ArrowUpRight, ArrowDownRight, ExternalLink, Brain, TrendingUp, BarChart3, Activity, LineChart, AlertTriangle, Rocket } from "lucide-react"
import { type StockData } from "@/lib/openai-service"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StockHeaderProps {
  stockData: StockData
  insights: string
}

const sectionConfig = {
  MARKET_SUMMARY: {
    icon: TrendingUp,
    title: "Market Summary",
    description: "Current stock performance"
  },
  TRADING_ACTIVITY: {
    icon: Activity,
    title: "Trading Activity",
    description: "Volume and price range analysis"
  },
  FINANCIAL_HEALTH: {
    icon: BarChart3,
    title: "Financial Health",
    description: "Key financial metrics and ratios"
  },
  TECHNICAL_SIGNALS: {
    icon: LineChart,
    title: "Technical Signals",
    description: "Price trends and indicators"
  },
  RISK_FACTORS: {
    icon: AlertTriangle,
    title: "Risk Factors",
    description: "Key challenges and concerns"
  },
  GROWTH_DRIVERS: {
    icon: Rocket,
    title: "Growth Drivers",
    description: "Future growth opportunities"
  }
} as const

function getSentimentDetails(score: number) {
  if (score >= 81) return { text: 'Strong Buy', color: 'bg-green-500' }
  if (score >= 61) return { text: 'Buy', color: 'bg-green-400' }
  if (score >= 41) return { text: 'Hold', color: 'bg-yellow-500' }
  if (score >= 21) return { text: 'Sell', color: 'bg-red-400' }
  return { text: 'Strong Sell', color: 'bg-red-500' }
}

export function StockHeader({ stockData, insights }: StockHeaderProps) {
  const { quote, profile } = stockData
  const isPositiveChange = quote.change >= 0

  // Extract sentiment score
  const sentimentMatch = insights.match(/SENTIMENT_SCORE:\s*(\d+)/)
  const sentimentScore = sentimentMatch ? parseInt(sentimentMatch[1]) : null

  // Parse sections
  const sections = Object.keys(sectionConfig).reduce((acc, key) => {
    const match = insights.match(new RegExp(`${key}:\\s*(.+?)(?=\\n[A-Z_]+:|$)`, 's'))
    return {
      ...acc,
      [key]: match?.[1]?.trim() || ''
    }
  }, {} as Record<keyof typeof sectionConfig, string>)

  const sentiment = sentimentScore ? getSentimentDetails(sentimentScore) : null

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {quote.symbol}
            </h1>
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
          <p className="text-lg text-muted-foreground">
            {profile.longName}
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-mono font-medium">
            ${quote.price.toFixed(2)}
          </p>
          <div className={`flex items-center justify-end gap-1 text-lg ${
            isPositiveChange ? "text-green-500" : "text-red-500"
          }`}>
            {isPositiveChange ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : (
              <ArrowDownRight className="h-5 w-5" />
            )}
            <span>{Math.abs(quote.change).toFixed(2)}</span>
            <span>({Math.abs(quote.changePercent).toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      <Card className="bg-card">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h3 className="font-semibold text-xl">AI Analysis</h3>
            </div>
            {sentiment && (
              <div className="flex items-center gap-3 bg-background/50 rounded-full px-4 py-2">
                <div className="text-sm font-medium">Sentiment:</div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-500", sentiment.color)}
                      style={{ width: `${sentimentScore}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-sm font-semibold",
                    sentiment.color.replace('bg-', 'text-').replace('-500', '-700').replace('-400', '-600')
                  )}>
                    {sentiment.text}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="grid gap-6">
            {(Object.entries(sectionConfig) as [keyof typeof sectionConfig, typeof sectionConfig[keyof typeof sectionConfig]][]).map(([key, config]) => (
              <div 
                key={key}
                className={cn(
                  "rounded-lg border bg-background/50 p-6",
                  "transition-colors hover:bg-background/80"
                )}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <config.icon className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium text-base leading-none">
                        {config.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <div className="pl-8">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {sections[key]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  )
} 