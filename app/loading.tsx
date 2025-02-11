import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container">
      {/* Hero Section Loading */}
      <section className="mx-auto flex max-w-[980px] flex-col items-center gap-4 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <Skeleton className="h-12 w-[250px] sm:h-14 sm:w-[350px] md:h-16 md:w-[450px]" />
        <Skeleton className="h-6 w-[200px] sm:h-8 sm:w-[300px] md:h-10 md:w-[400px]" />
        <div className="w-full max-w-2xl px-4 sm:px-0">
          <Skeleton className="h-12 w-full" />
        </div>
      </section>

      {/* Market Overview Loading */}
      <section className="py-8 md:py-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
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
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </section>

      {/* Trending Stocks Loading */}
      <section className="py-8 md:py-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
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
          ))}
        </div>
      </section>
    </div>
  )
} 