import * as React from 'react';
import { SearchDemo } from '@/components/ui/search-demo';

export function HeroSection() {
  return (
    <section className='mx-auto flex max-w-[980px] flex-col items-center gap-8 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20'>
      <h1 className='text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]'>
        Unlock the Power of
        <span className='bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent'> Fundamental Analysis</span>
      </h1>
      <p className='max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl'>
        Decipher stock fundamentals with real-time data from multiple trusted sources. Make informed decisions with clarity and confidence.
      </p>
      <div className='w-full max-w-3xl px-4 sm:px-8'>
        <SearchDemo />
      </div>
    </section>
  );
}
