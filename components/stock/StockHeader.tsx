'use client';

import * as React from 'react';
import { ArrowUpRight, ArrowDownRight, ExternalLink, Brain, TrendingUp, BarChart3, Activity, LineChart, AlertTriangle, Rocket } from 'lucide-react';
import { type StockData, type AIAnalysisResponse, type AIAnalysisSection } from '@/lib/openai-service';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StockHeaderProps {
  stockData: StockData;
  insights: AIAnalysisResponse;
}

const sectionConfig = {
  market_summary: {
    icon: TrendingUp,
    title: 'Market Summary',
    description: 'Current stock performance',
  },
  trading_activity: {
    icon: Activity,
    title: 'Trading Activity',
    description: 'Volume and price range analysis',
  },
  financial_health: {
    icon: BarChart3,
    title: 'Financial Health',
    description: 'Key financial metrics and ratios',
  },
  technical_signals: {
    icon: LineChart,
    title: 'Technical Signals',
    description: 'Price trends and indicators',
  },
  risk_factors: {
    icon: AlertTriangle,
    title: 'Risk Factors',
    description: 'Key challenges and concerns',
  },
  growth_drivers: {
    icon: Rocket,
    title: 'Growth Drivers',
    description: 'Future growth opportunities',
  },
} as const;

function getSentimentDetails(score: number) {
  if (score >= 81) return { text: 'Strong Buy', color: 'bg-green-500' };
  if (score >= 61) return { text: 'Buy', color: 'bg-green-400' };
  if (score >= 41) return { text: 'Hold', color: 'bg-yellow-400' };
  if (score >= 21) return { text: 'Sell', color: 'bg-red-400' };
  return { text: 'Strong Sell', color: 'bg-red-500' };
}

export function StockHeader({ stockData, insights }: StockHeaderProps) {
  const { quote, profile } = stockData;
  const isPositiveChange = quote.change >= 0;
  const sentiment = getSentimentDetails(insights.sentiment_score);

  return (
    <section className='space-y-4'>
      <div className='flex items-start justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-3xl font-bold tracking-tight'>{quote.symbol}</h1>
            <a href={profile.website} target='_blank' rel='noopener noreferrer' className='text-muted-foreground hover:text-primary'>
              <ExternalLink className='h-5 w-5' />
            </a>
          </div>
          <p className='text-lg text-muted-foreground'>{profile.longName}</p>
        </div>

        <div className='text-right'>
          <p className='text-3xl font-mono font-medium'>${quote.price.toFixed(2)}</p>
          <div className={`flex items-center justify-end gap-1 text-lg ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveChange ? <ArrowUpRight className='h-5 w-5' /> : <ArrowDownRight className='h-5 w-5' />}
            <span>{Math.abs(quote.change).toFixed(2)}</span>
            <span>({Math.abs(quote.changePercent).toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      <Card className='bg-card'>
        <div className='p-6'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8'>
            <div className='flex items-center gap-3'>
              <div className='p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/10'>
                <Brain className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h3 className='font-semibold text-xl tracking-tight'>AI Analysis</h3>
                <p className='text-sm text-muted-foreground/80'>Powered by advanced market analytics</p>
              </div>
            </div>

            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-background/80 backdrop-blur-sm rounded-full' />
              <div className='relative flex items-center gap-4 px-5 py-3 rounded-full border border-border/50'>
                <div className='flex flex-col'>
                  <span className='text-xs text-muted-foreground font-medium'>Sentiment</span>
                  <span className={cn('text-sm font-semibold', sentiment.color.replace('bg-', 'text-').replace('-500', '-700').replace('-400', '-600'))}>{sentiment.text}</span>
                </div>
                <div className='flex-1 min-w-[100px]'>
                  <div className='h-2 rounded-full bg-muted/50 overflow-hidden'>
                    <div className={cn('h-full transition-all duration-500', sentiment.color)} style={{ width: `${insights.sentiment_score}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue='market_summary' className='w-full'>
            <TabsList className='grid grid-cols-2 lg:grid-cols-3 h-auto gap-1.5 p-1.5 bg-muted/50 backdrop-blur-sm rounded-xl'>
              {Object.entries(sectionConfig).map(([key, section]) => {
                const Icon = section.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className='flex items-center gap-2.5 py-2.5 px-4 
                             text-muted-foreground
                             data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:font-medium
                             hover:text-foreground/80 hover:bg-muted/70
                             transition-all duration-200 rounded-lg'
                  >
                    <Icon className='h-4 w-4' />
                    <span className='hidden sm:inline text-sm font-medium'>{section.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {Object.entries(sectionConfig).map(([key, section]) => (
              <TabsContent key={key} value={key} className='mt-6 transition-all duration-300 ease-in-out'>
                <div className='space-y-4 p-4 rounded-lg bg-gradient-to-br from-background/50 to-background hover:from-background/70 hover:to-background/50 transition-colors duration-300'>
                  <div className='flex items-center gap-3 border-b border-border/50 pb-4'>
                    <div className='p-2 rounded-md bg-primary/10'>
                      <section.icon className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-lg tracking-tight'>{section.title}</h4>
                      <p className='text-sm text-muted-foreground/80'>{section.description}</p>
                    </div>
                  </div>

                  <div className='space-y-4 pl-2'>
                    <p
                      className='text-lg font-medium leading-relaxed tracking-tight [&>strong]:font-semibold [&>strong]:text-primary/80'
                      dangerouslySetInnerHTML={{
                        __html: (insights[key as keyof Omit<AIAnalysisResponse, 'sentiment_score' | 'sentiment_explanation'>] as AIAnalysisSection).summary,
                      }}
                    />
                    <div className='h-px bg-gradient-to-r from-border/50 via-border to-border/50' />
                    <p
                      className='text-sm text-muted-foreground leading-relaxed [&>strong]:font-semibold [&>strong]:text-primary/80'
                      dangerouslySetInnerHTML={{
                        __html: (insights[key as keyof Omit<AIAnalysisResponse, 'sentiment_score' | 'sentiment_explanation'>] as AIAnalysisSection).content,
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Card>
    </section>
  );
}
