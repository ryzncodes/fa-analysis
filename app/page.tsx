import * as React from 'react';
import { HeroSection } from '@/components/home/hero-section';
import { TrendingStocks } from '@/components/home/trending-stocks';
import { MarketOverview } from '@/components/home/market-overview';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';

export default function HomePage() {
  return (
    <div className='container relative min-h-screen'>
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.03}
        duration={3}
        repeatDelay={1}
        className='[mask-image:radial-gradient(900px_circle_at_center,white,transparent)] inset-x-0 inset-y-[-30%] h-[160%] z-0'
      />
      <div className='relative z-20'>
        <HeroSection />
        <MarketOverview />
        <TrendingStocks />
      </div>
    </div>
  );
}
