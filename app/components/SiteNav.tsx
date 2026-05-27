'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeProvider'

export default function SiteNav() {
  return (
    <nav className="site-nav sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="heading-serif text-2xl">ॐ</Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/cc" className="nav-link">CC</Link>
          <Link href="/cb" className="nav-link">CB</Link>
          <Link href="/chandas" className="nav-link">Meters</Link>
          <Link href="/ai" className="nav-link">AI</Link>
          <Link href="/search" className="nav-link">Search</Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
