'use client'

import Link from 'next/link'

const TEXTS = [
  {
    href: '/sb',
    code: 'SB',
    title: 'Śrīmad-Bhāgavatam',
    subtitle: 'The Ripened Fruit of the Vedic Tree',
    desc: '18,000 verses across 12 cantos — the complete science of God.',
    cantos: 12,
    icon: '📿',
    color: 'var(--saffron)',
    bg: 'rgba(224,123,34,0.07)',
    border: 'rgba(224,123,34,0.25)',
  },
  {
    href: '/cc',
    code: 'CC',
    title: 'Caitanya-Caritāmṛta',
    subtitle: 'The Life and Teachings of Śrī Caitanya',
    desc: 'The life, teachings and pastimes of the Golden Avatāra.',
    cantos: 3,
    icon: '🌸',
    color: 'var(--lotus)',
    bg: 'rgba(194,84,122,0.07)',
    border: 'rgba(194,84,122,0.25)',
  },
  {
    href: '/cb',
    code: 'CB',
    title: 'Caitanya-Bhāgavata',
    subtitle: 'By Vṛndāvana Dāsa Ṭhākura',
    desc: 'The earliest biographical account of Śrī Caitanya Mahāprabhu.',
    cantos: 3,
    icon: '🪷',
    color: 'var(--gold)',
    bg: 'rgba(184,134,11,0.07)',
    border: 'rgba(184,134,11,0.25)',
  },
]

const FEATURES = [
  {
    icon: '📖',
    title: 'Verse-by-Verse Reading',
    desc: 'Read Devanāgarī, IAST transliteration, translation and Śrīla Prabhupāda\'s purports in one beautiful view.',
  },
  {
    icon: '🔤',
    title: 'Sanskrit Synonyms',
    desc: 'Every word linked — explore meanings, roots and how Sanskrit terms appear across the canon.',
  },
  {
    icon: '👤',
    title: 'Personalities Map',
    desc: 'Discover the divine characters of the Bhāgavatam — who they are, where they appear, and how they relate.',
  },
  {
    icon: '🎵',
    title: 'Vedic Meters',
    desc: 'Understand the Chandas — the rhythmic patterns that give the Sanskrit verses their musical beauty.',
  },
]

export default function Home() {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, var(--hero-bg-start) 0%, var(--hero-bg-end) 100%)',
          paddingTop: '5rem',
          paddingBottom: '5rem',
        }}
      >
        {/* Decorative mandala rings */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[600, 460, 330, 210].map((size, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: size, height: size,
                marginLeft: -size / 2, marginTop: -size / 2,
                borderRadius: '50%',
                border: `1px solid var(--om-ring)`,
                opacity: 1 - i * 0.2,
              }}
            />
          ))}
          {/* Om symbol watermark */}
          <div style={{
            position: 'absolute',
            right: '-2rem', top: '50%', transform: 'translateY(-50%)',
            fontSize: '22rem',
            fontFamily: 'Noto Serif Devanagari, serif',
            color: 'var(--saffron)',
            opacity: 0.07,
            userSelect: 'none',
            lineHeight: 1,
          }}>
            ॐ
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Om mark */}
          <div
            className="text-6xl mb-6"
            style={{
              fontFamily: 'Noto Serif Devanagari, serif',
              color: 'var(--saffron)',
              filter: 'drop-shadow(0 4px 16px rgba(224,123,34,0.25))',
              lineHeight: 1,
            }}
          >
            ॐ
          </div>

          <div className="section-label mb-4">Sacred Texts Platform</div>

          <h1
            className="font-serif mb-5"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 600,
              lineHeight: 1.2,
              color: 'var(--text-primary)',
            }}
          >
            Explore the{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--saffron) 0%, var(--gold) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Śrīmad-Bhāgavatam
            </span>
            {' '}and beyond
          </h1>

          <p
            className="font-serif text-xl mb-8 mx-auto"
            style={{ color: 'var(--text-secondary)', maxWidth: '36rem', lineHeight: 1.75 }}
          >
            Read the complete Sanskrit verses with IAST transliteration, Śrīla Prabhupāda's translations,
            purports, and an interactive personality knowledge graph.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/sb" className="btn-primary">
              Begin Reading &rarr;
            </Link>
            <Link href="/ai/entities" className="btn-outline">
              Personalities
            </Link>
            <Link href="/search" className="btn-outline">
              Search Verses
            </Link>
          </div>

          {/* Sanskrit mantra */}
          <p
            className="mt-10 text-base"
            style={{
              fontFamily: 'Noto Serif Devanagari, serif',
              color: 'var(--saffron)',
              opacity: 0.65,
              letterSpacing: '0.05em',
            }}
          >
            नमः ओम् विष्णु-पादाय कृष्ण-प्रेष्ठाय भूतले
          </p>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="divider-om max-w-4xl mx-auto px-4">
        <span style={{ fontFamily: 'Noto Serif Devanagari, serif', fontSize: '1.25rem' }}>✦ ॐ ✦</span>
      </div>

      {/* ── Texts ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <div className="section-label mb-2">Sacred Literature</div>
          <h2 className="font-serif text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Three Great Texts
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEXTS.map(text => (
            <Link
              key={text.href}
              href={text.href}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="canto-card h-full"
                style={{
                  background: `linear-gradient(135deg, ${text.bg} 0%, var(--bg-card) 100%)`,
                  borderColor: text.border,
                }}
              >
                <div className="text-4xl mb-4">{text.icon}</div>

                <div
                  className="section-label mb-2"
                  style={{ color: text.color }}
                >
                  {text.code}
                </div>

                <h3
                  className="font-serif text-xl font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {text.title}
                </h3>
                <p
                  className="text-sm italic mb-3"
                  style={{ color: text.color, fontFamily: '"Crimson Text", Georgia, serif' }}
                >
                  {text.subtitle}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {text.desc}
                </p>

                <div
                  className="mt-4 text-sm font-semibold"
                  style={{ color: text.color }}
                >
                  Read now →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--section-bg)',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)',
        }}
        className="py-16"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="section-label mb-2">Features</div>
            <h2 className="font-serif text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Designed for devotees and scholars
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="verse-card text-center">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3
                  className="font-serif text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick access ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <div className="section-label mb-2">Jump Right In</div>
          <h2 className="font-serif text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Popular starting points
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { href: '/sb/1/1', label: 'SB Canto 1, Ch. 1', sub: 'Questions by the sages', icon: '📜' },
            { href: '/sb/2/1', label: 'SB Canto 2, Ch. 1', sub: 'The first step in God-realization', icon: '🌅' },
            { href: '/sb/10/1', label: 'SB Canto 10, Ch. 1', sub: 'The advent of Lord Kṛṣṇa', icon: '🦚' },
            { href: '/cc/adi', label: 'CC Ādi-līlā', sub: 'The spiritual masters', icon: '🌺' },
            { href: '/chandas', label: 'Vedic Meters', sub: 'Explore the Chandas', icon: '🎵' },
            { href: '/ai/entities', label: 'All Personalities', sub: 'The divine characters', icon: '👑' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="verse-card flex items-center gap-4"
                style={{ padding: '1.25rem 1.5rem' }}
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <div
                    className="font-serif font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {item.sub}
                  </div>
                </div>
                <span className="ml-auto text-sm" style={{ color: 'var(--saffron)' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Closing mantra banner ─────────────────────────────────────── */}
      <section
        className="py-14 text-center"
        style={{
          background: 'linear-gradient(135deg, var(--hero-bg-start) 0%, var(--hero-bg-end) 100%)',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <div
          className="text-4xl mb-4"
          style={{ fontFamily: 'Noto Serif Devanagari, serif', color: 'var(--saffron)', opacity: 0.85 }}
        >
          ॐ नमो भगवते वासुदेवाय
        </div>
        <p
          className="font-serif text-lg italic"
          style={{ color: 'var(--text-muted)' }}
        >
          "Oṁ — I offer my respectful obeisances unto Lord Vāsudeva"
        </p>
      </section>
    </div>
  )
}
