'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle, FontSizeControls } from './ThemeProvider'

const NAV_ITEMS = [
  { href: '/sb',       label: 'Śrīmad-Bhāgavatam' },
  { href: '/cc',       label: 'Caitanya-Caritāmṛta' },
  { href: '/cb',       label: 'Caitanya-Bhāgavata' },
  { href: '/chandas',  label: 'Meters' },
  { href: '/search',   label: 'Search' },
  { href: '/ai/entities', label: 'Personalities' },
]

const SLUG_LABELS: Record<string, string> = {
  sb: 'Śrīmad-Bhāgavatam',
  cc: 'Caitanya-Caritāmṛta',
  cb: 'Caitanya-Bhāgavata',
  chandas: 'Meters',
  search: 'Search',
  ai: 'Personalities',
  entities: 'Entities',
  words: 'Words',
}

export default function Header() {
  const pathname = usePathname()

  const breadcrumbs = (() => {
    const parts = pathname.split('/').filter(Boolean)
    if (!parts.length) return []
    const crumbs: { label: string; href: string }[] = [{ label: 'Home', href: '/' }]
    let path = ''
    parts.forEach(p => {
      path += `/${p}`
      const label = SLUG_LABELS[p] ?? (/^\d+$/.test(p) ? p : p.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
      crumbs.push({ label, href: path })
    })
    return crumbs
  })()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className="sticky top-0 z-40 site-nav"
      style={{ borderBottom: '1px solid var(--nav-border)' }}
    >
      {/* Top accent stripe */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, var(--saffron), var(--gold), var(--saffron))',
      }} />

      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-3">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            style={{ textDecoration: 'none' }}
          >
            <span
              className="text-3xl leading-none"
              style={{
                color: 'var(--saffron)',
                fontFamily: 'Noto Serif Devanagari, serif',
                filter: 'drop-shadow(0 0 8px rgba(224,123,34,0.3))',
              }}
            >
              ॐ
            </span>
            <div className="hidden sm:block">
              <div
                className="font-serif text-base font-semibold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Bhāgavatam
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Sacred Texts Platform
              </div>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <Link href="/search" className="hidden sm:flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </Link>
            <FontSizeControls />
            <ThemeToggle />
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <div
            className="flex items-center gap-1.5 py-1.5 text-xs overflow-x-auto whitespace-nowrap scrollbar-none"
            style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}
          >
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <span style={{ color: 'var(--saffron)', opacity: 0.5 }}>›</span>}
                {i === breadcrumbs.length - 1 ? (
                  <span style={{ color: 'var(--saffron)', fontWeight: 600 }}>{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
                    className="hover:underline">{crumb.label}</Link>
                )}
              </span>
            ))}
          </div>
        )}
      </nav>
    </header>
  )
}
