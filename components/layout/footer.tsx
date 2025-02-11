import * as React from "react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Empowered by data, driven by insights.
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <a
            href="https://github.com/yourusername/fa-rag"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <Link
            href="/about"
            className="hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hover:text-foreground"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
} 