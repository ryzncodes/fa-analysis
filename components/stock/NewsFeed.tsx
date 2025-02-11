'use client'

import * as React from "react"
import { ExternalLink } from "lucide-react"

interface NewsItem {
  title: string
  link: string
  publisher: string
  providerPublishTime: number
}

interface NewsFeedProps {
  news: NewsItem[]
  symbol: string
}

function formatTimeAgo(timestamp: number): string {
  const now = new Date().getTime()
  const diff = now - timestamp * 1000 // Convert to milliseconds

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

export function NewsFeed({ news, symbol }: NewsFeedProps) {
  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="text-xl font-semibold mb-4">Recent News</h2>
      <div className="space-y-4">
        {news.length > 0 ? (
          news.map((item, index) => (
            <article
              key={index}
              className="space-y-1 pb-4 border-b last:border-0 last:pb-0"
            >
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{item.publisher}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(item.providerPublishTime)}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No recent news available for {symbol}
          </p>
        )}
      </div>
    </section>
  )
} 