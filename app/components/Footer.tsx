'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
      {/* Top decorative gradient */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, var(--saffron), var(--gold), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">

        {/* Brand block */}
        <div className="text-center mb-12">
          <div
            className="text-5xl mb-3"
            style={{
              fontFamily: 'Noto Serif Devanagari, serif',
              color: 'var(--saffron)',
              filter: 'drop-shadow(0 0 12px rgba(224,123,34,0.25))',
            }}
          >
            ॐ
          </div>
          <p
            className="font-serif text-lg font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Bhāgavatam — Sacred Texts Platform
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: '"Crimson Text", Georgia, serif' }}
          >
            ॐ नमो भगवते वासुदेवाय
          </p>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="section-label mb-4">Texts</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/sb', label: 'Śrīmad-Bhāgavatam' },
                { href: '/cc', label: 'Caitanya-Caritāmṛta' },
                { href: '/cb', label: 'Caitanya-Bhāgavata' },
                { href: '/chandas', label: 'Meters & Chandas' },
              ].map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-serif text-sm hover:underline transition"
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="section-label mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/ai/entities', label: 'Personalities' },
                { href: '/search', label: 'Search Verses' },
                { href: '/', label: 'Home' },
              ].map(l => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-serif text-sm hover:underline transition"
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="section-label mb-4">About</h4>
            <p className="font-serif text-sm" style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
              An interactive knowledge platform for exploring the sacred scriptures of the Vaiṣṇava tradition.
            </p>
          </div>

          <div>
            <h4 className="section-label mb-4">Tech</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="http://localhost:8000/docs"
                  className="font-serif text-sm hover:underline transition"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                >
                  API Docs
                </a>
              </li>
              <li>
                <span className="font-serif text-sm" style={{ color: 'var(--text-muted)' }}>
                  Built with Next.js & FastAPI
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <p style={{ fontFamily: '"Crimson Text", Georgia, serif' }}>
              © {new Date().getFullYear()} Bhāgavatam Sacred Texts Platform
            </p>
            <p style={{ fontFamily: 'Noto Serif Devanagari, serif', color: 'var(--saffron)', opacity: 0.7 }}>
              सर्वे भवन्तु सुखिनः
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
