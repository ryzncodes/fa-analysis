'use client'

import * as React from "react"
import { Building2, Users, Globe2 } from "lucide-react"

interface CompanyOverviewProps {
  profile: {
    longBusinessSummary: string
    sector: string
    industry: string
    website: string
    fullTimeEmployees: number
    country: string
    city: string
  }
}

export function CompanyOverview({ profile }: CompanyOverviewProps) {
  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="text-xl font-semibold mb-4">Company Overview</h2>
      
      <div className="space-y-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <p className="font-medium">{profile.industry}</p>
              <p className="text-sm text-muted-foreground">{profile.sector}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Employees</p>
              <p className="font-medium">
                {profile.fullTimeEmployees?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">
                {profile.city}, {profile.country}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Business Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.longBusinessSummary}
          </p>
        </div>
      </div>
    </section>
  )
} 