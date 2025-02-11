'use client'

import * as React from "react"
import { SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "./button"

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/stock/${query.trim().toUpperCase()}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a stock (e.g., AAPL)"
          className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-20 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button 
          type="submit"
          size="sm"
          className="absolute right-1 top-1"
        >
          Search
        </Button>
      </div>
    </form>
  )
} 