'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default async function VerseDetailPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  return <VerseDetailContent slug={slug} />
}

function VerseDetailContent({ slug }: { slug: string[] }) {
  const [verse, setVerse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chandaOpen, setChandaOpen] = useState(false)

  const slugPath = slug.join('/')

  useEffect(() => {
    fetch(`${API_BASE}/api/verses/sb/${slugPath}`)
      .then(r => r.json())
      .then(data => { setVerse(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slugPath])

  if (loading) return (
    <div
      style={{
        minHeight: '80vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div
        style={{
          fontSize: '4rem',
          fontFamily: 'Noto Serif Devanagari, serif',
          color: 'var(--saffron)',
          opacity: 0.5,
          lineHeight: 1,
        }}
      >
        ॐ
      </div>
      <p className="font-serif" style={{ color: 'var(--text-muted)' }}>Loading verse…</p>
    </div>
  )

  if (!verse || verse.error) return (
    <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p className="font-serif" style={{ color: 'var(--text-muted)' }}>Verse not found.</p>
    </div>
  )

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* Verse reference bar */}
      <div
        style={{
          background: 'linear-gradient(160deg, var(--hero-bg-start) 0%, var(--hero-bg-end) 100%)',
          borderBottom: '1px solid var(--border-light)',
          padding: '1.5rem 0',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="font-serif font-semibold tracking-wide"
                style={{ color: 'var(--saffron)', fontSize: '1.125rem', letterSpacing: '0.06em' }}
              >
                {verse.full_reference}
              </h1>
              {verse.chanda && (
                <button
                  onClick={() => setChandaOpen(o => !o)}
                  className="tag-gold"
                  style={{ cursor: 'pointer', border: 'none', background: 'rgba(184,134,11,0.10)' }}
                  title="Click to see meter analysis"
                >
                  {verse.chanda} {chandaOpen ? '▲' : '▼'}
                </button>
              )}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-2">
              {verse.prev_slug && (
                <Link
                  href={`/sb/${verse.prev_slug}`}
                  className="btn-outline"
                  style={{ padding: '0.3rem 0.875rem', fontSize: '0.8125rem' }}
                  title={verse.prev_reference}
                >
                  ←
                </Link>
              )}
              {verse.next_slug && (
                <Link
                  href={`/sb/${verse.next_slug}`}
                  className="btn-primary"
                  style={{ padding: '0.3rem 0.875rem', fontSize: '0.8125rem' }}
                  title={verse.next_reference}
                >
                  →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Chanda panel */}
        {chandaOpen && verse.chanda_detail && (
          <div className="verse-card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="font-serif text-lg font-semibold"
                style={{ color: 'var(--gold)' }}
              >
                {verse.chanda_detail.name}
              </span>
              {verse.chanda_detail.jaati && verse.chanda_detail.jaati !== verse.chanda_detail.name && (
                <span className="tag-gold">jāti: {verse.chanda_detail.jaati}</span>
              )}
            </div>
            <div className="space-y-2">
              {verse.chanda_detail.lines?.filter((l: any) => l.line).map((l: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-baseline text-xs">
                  <span className="iast-text">{l.line}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{l.syllables}syl</span>
                  <span style={{ color: 'var(--gold)', fontFamily: 'serif' }}>{l.chanda || l.jaati || '—'}</span>
                  <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{l.gana}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Devanagari */}
        {verse.devanagari && (
          <div className="verse-card mb-5 text-center" style={{ backgroundColor: 'rgba(224,123,34,0.04)', borderColor: 'rgba(224,123,34,0.20)' }}>
            <div
              className="devanagari-text"
              style={{ fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 2.2, whiteSpace: 'pre-line' }}
            >
              {verse.devanagari}
            </div>
          </div>
        )}

        {/* IAST Transliteration */}
        {verse.transliteration && (
          <div className="verse-card mb-5 text-center">
            {verse.transliteration.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
              <p key={i} className="iast-text" style={{ fontSize: '1.0625rem' }}>{line}</p>
            ))}
          </div>
        )}

        {/* Synonyms */}
        {verse.synonyms_raw && (
          <div className="verse-card mb-5">
            <h2 className="subheading-serif mb-4">Word for Word</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              {verse.synonyms_raw
                .replace(/^Synonyms\s*/i, '')
                .split(' ; ')
                .filter((s: string) => s.trim())
                .map((entry: string, i: number) => {
                  const [wordPart, ...rest] = entry.trim().split(' — ')
                  const meaning = rest.join(' — ')
                  return (
                    <p key={i} className="font-serif text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      <Link
                        href={`/words/${encodeURIComponent(wordPart.trim())}`}
                        className="font-semibold hover:underline"
                        style={{ color: 'var(--saffron)', textDecoration: 'none' }}
                      >
                        {wordPart.trim()}
                      </Link>
                      {meaning ? <span style={{ color: 'var(--text-muted)' }}> — {meaning}</span> : ''}
                    </p>
                  )
                })}
            </div>
          </div>
        )}

        {/* Translation */}
        {verse.translation && (
          <div
            className="verse-card mb-5"
            style={{ borderColor: 'rgba(184,134,11,0.25)', backgroundColor: 'rgba(184,134,11,0.04)' }}
          >
            <h2 className="subheading-serif mb-3">Translation</h2>
            <p
              className="font-serif text-lg leading-relaxed"
              style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}
            >
              {verse.translation}
            </p>
          </div>
        )}

        {/* Purport */}
        {verse.purports && verse.purports.length > 0 ? (
          <div className="verse-card mb-5">
            {verse.purports.map((p: any, i: number) => (
              <div
                key={i}
                className={i > 0 ? 'mt-6 pt-6' : ''}
                style={i > 0 ? { borderTop: '1px solid var(--border-light)' } : {}}
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <h2 className="subheading-serif">Purport</h2>
                  <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>— {p.author}</span>
                </div>
                {p.body_html ? (
                  <div
                    className="purport-html"
                    dangerouslySetInnerHTML={{ __html: p.body_html }}
                  />
                ) : (
                  <div className="font-serif leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-parchment)' }}>
                    {p.body_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (verse.purport_html || verse.purport_text) && (
          <div className="verse-card mb-5">
            <h2 className="subheading-serif mb-3">Purport</h2>
            {verse.purport_html ? (
              <div className="purport-html" dangerouslySetInnerHTML={{ __html: verse.purport_html }} />
            ) : (
              <div className="font-serif leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-parchment)' }}>
                {verse.purport_text}
              </div>
            )}
          </div>
        )}

        {/* Personalities mentioned */}
        {verse.entities && verse.entities.length > 0 && (
          <div className="verse-card mb-5">
            <h2 className="subheading-serif mb-4">Personalities Mentioned</h2>
            <div className="flex flex-wrap gap-2">
              {verse.entities.map((e: any, i: number) => (
                <Link
                  key={i}
                  href={`/characters/${e.id}`}
                  className="personality-chip"
                  title={e.mention_location}
                >
                  {e.name}
                  {e.mention_location === 'purport_text' && (
                    <span className="ml-1 opacity-50 text-xs">(purport)</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom navigation */}
        {(verse.prev_slug || verse.next_slug) && (
          <div
            className="flex items-center justify-between mt-10 pt-8"
            style={{ borderTop: '1px solid var(--border-light)' }}
          >
            {verse.prev_slug ? (
              <Link
                href={`/sb/${verse.prev_slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div>
                  <div className="section-label mb-1">← Previous</div>
                  <div className="font-serif font-semibold" style={{ color: 'var(--saffron)' }}>
                    {verse.prev_reference}
                  </div>
                </div>
              </Link>
            ) : <div />}

            {verse.next_slug ? (
              <Link
                href={`/sb/${verse.next_slug}`}
                style={{ textDecoration: 'none', textAlign: 'right' }}
              >
                <div>
                  <div className="section-label mb-1" style={{ textAlign: 'right' }}>Next →</div>
                  <div className="font-serif font-semibold" style={{ color: 'var(--saffron)' }}>
                    {verse.next_reference}
                  </div>
                </div>
              </Link>
            ) : <div />}
          </div>
        )}

      </section>
    </div>
  )
}
