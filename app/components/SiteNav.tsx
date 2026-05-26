'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeProvider'

export default function SiteNav() {
  return (
    <nav className="site-nav sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="heading-serif text-2xl">ॐ</Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/verses" className="nav-link">Verses</Link>
          <Link href="/cc" className="nav-link">CC</Link>
          <Link href="/cb/adi/1/1" className="nav-link">CB</Link>
          <Link href="/characters" className="nav-link">Characters</Link>
          <Link href="/places" className="nav-link">Places</Link>
          <Link href="/chandas" className="nav-link">Meters</Link>
          <Link href="/lineage" className="nav-link">Lineage</Link>
          <Link href="/graph" className="nav-link">Graph</Link>
          <Link href="/ai" className="nav-link">AI</Link>
          <Link href="/search" className="nav-link">Search</Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
