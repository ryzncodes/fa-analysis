import * as React from "react"
import { HeroSection } from "@/components/home/hero-section"
import { TrendingStocks } from "@/components/home/trending-stocks"
import { MarketOverview } from "@/components/home/market-overview"

export default function Home() {
  return (
    <div className="container">
      <HeroSection />
      <MarketOverview />
      <TrendingStocks />
    </div>
  )
}
