'use client'

import Link from 'next/link'

const KHANDAS = [
  { key: 'adi', label: 'Ādi-khaṇḍa', chapters: 16, icon: '🌅', desc: 'The Beginning' },
  { key: 'madhya', label: 'Madhya-khaṇḍa', chapters: 26, icon: '🎭', desc: 'The Middle Pastimes' },
  { key: 'antya', label: 'Antya-khaṇḍa', chapters: 19, icon: '🌙', desc: 'The Later Pastimes' },
]

const PALETTE = [
  { color: 'var(--saffron)',  bg: 'rgba(224,123,34,0.07)',  border: 'rgba(224,123,34,0.20)' },
  { color: 'var(--gold)',     bg: 'rgba(184,134,11,0.07)',  border: 'rgba(184,134,11,0.20)' },
  { color: 'var(--lotus)',    bg: 'rgba(194,84,122,0.07)',  border: 'rgba(194,84,122,0.20)' },
]

export default function CBPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div
        className="relative overflow-hidden py-14 text-center"
        style={{
          background: 'linear-gradient(160deg, var(--hero-bg-start) 0%, var(--hero-bg-end) 100%)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        {/* Background Om */}
        <div aria-hidden="true" style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          fontSize: '16rem', fontFamily: 'Noto Serif Devanagari, serif',
          color: 'var(--saffron)', opacity: 0.07, lineHeight: 1, userSelect: 'none',
        }}>ॐ</div>

        <div className="relative max-w-3xl mx-auto px-4">
          <div className="section-label mb-3">3 Khands · 61 Chapters</div>
          <h1
            className="font-serif mb-3"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}
          >
            Caitanya Bhāgavata
          </h1>
          <p
            className="font-serif text-lg italic mb-1"
            style={{ color: 'var(--gold)' }}
          >
            The Pastimes of Śrī Caitanya Mahāprabhu
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)', fontFamily: '"Crimson Text", Georgia, serif' }}
          >
            By Śrīla Vṛndāvana dāsa Ṭhākura · Translated by Bhūmipati Dāsa · Commentary by Śrīla Bhaktisiddhānta Sarasvatī
          </p>
        </div>
      </div>

      {/* Khandas grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {KHANDAS.map((khanda, idx) => {
            const pal = PALETTE[idx % PALETTE.length]
            return (
              <Link key={khanda.key} href={`/cb/${khanda.key}`} style={{ textDecoration: 'none' }}>
                <div
                  className="canto-card h-full"
                  style={{ background: `linear-gradient(135deg, ${pal.bg} 0%, var(--bg-card) 100%)`, borderColor: pal.border }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span
                        className="section-label"
                        style={{ color: pal.color }}
                      >
                        Khanda {idx + 1}
                      </span>
                    </div>
                    <span className="text-2xl" title={khanda.label}>{khanda.icon}</span>
                  </div>

                  <h2
                    className="font-serif text-xl font-semibold mb-2"
                    style={{ color: 'var(--text-primary)', lineHeight: 1.3 }}
                  >
                    {khanda.label}
                  </h2>

                  <p
                    className="text-sm mb-4"
                    style={{ color: 'var(--text-muted)', lineHeight: 1.65 }}
                  >
                    {khanda.desc}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {khanda.chapters} chapters
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: pal.color }}
                    >
                      Read →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Bottom note */}
      <div
        className="text-center pb-12"
        style={{ color: 'var(--text-muted)', fontFamily: '"Crimson Text", Georgia, serif', fontSize: '0.9375rem' }}
      >
        <span style={{ color: 'var(--gold)', opacity: 0.7 }}>✦</span>
        {' '}śrī-caitanyacandra jayatu bhuvane sarvakari{' '}
        <span style={{ color: 'var(--gold)', opacity: 0.7 }}>✦</span>
      </div>
    </div>
  )
}
