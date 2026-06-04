'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const CANTO_CHAPTER_COUNTS: Record<number, number> = {
  1: 19, 2: 10, 3: 33, 4: 31, 5: 26, 6: 19,
  7: 15, 8: 24, 9: 24, 10: 90, 11: 31, 12: 13,
}

const TOTAL_CANTOS = 12

interface Verse {
  id: number
  reference: string
  verse_slug: string
  devanagari: string
  transliteration: string
  translation: string
  chanda: string | null
}

interface ChapterData {
  canto: number
  chapter: number
  title: string
  total: number
  verses: Verse[]
}

type ViewMode = 'compact' | 'detailed'

export default function ChapterPage({
  params,
}: {
  params: Promise<{ canto: string; chapter: string }>
}) {
  const { canto, chapter } = use(params)
  return <ChapterContent canto={canto} chapter={chapter} />
}

function ChapterContent({ canto, chapter }: { canto: string; chapter: string }) {
  const [data, setData] = useState<ChapterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('compact')

  const cantoNum = parseInt(canto)
  const chapterNum = parseInt(chapter)
  const maxChapters = CANTO_CHAPTER_COUNTS[cantoNum] || 1

  const prevHref = chapterNum > 1
    ? `/sb/${canto}/${chapterNum - 1}`
    : cantoNum > 1
      ? `/sb/${cantoNum - 1}/${CANTO_CHAPTER_COUNTS[cantoNum - 1]}`
      : null

  const nextHref = chapterNum < maxChapters
    ? `/sb/${canto}/${chapterNum + 1}`
    : cantoNum < TOTAL_CANTOS
      ? `/sb/${cantoNum + 1}/1`
      : null

  useEffect(() => {
    fetch(`${API_BASE}/api/verses/sb/${canto}/${chapter}`)
      .then(r => r.json())
      .then(d => { setData(d.error ? null : d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [canto, chapter])

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="text-center">
        <div
          className="text-4xl mb-4"
          style={{ fontFamily: 'Noto Serif Devanagari, serif', color: 'var(--saffron)', opacity: 0.6, animation: 'pulse 2s infinite' }}
        >
          ॐ
        </div>
        <p className="font-serif" style={{ color: 'var(--text-muted)' }}>Loading verses…</p>
      </div>
    </div>
  )

  if (!data) return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p className="font-serif" style={{ color: 'var(--text-muted)' }}>Chapter not found.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>

      {/* Chapter header */}
      <div
        className="py-10"
        style={{
          background: 'linear-gradient(160deg, var(--hero-bg-start) 0%, var(--hero-bg-end) 100%)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back + Prev/Next */}
          <div className="flex items-center justify-between mb-5">
            <Link
              href={`/sb/${canto}`}
              className="text-sm hover:underline"
              style={{ color: 'var(--saffron)', textDecoration: 'none' }}
            >
              ← Canto {canto}
            </Link>
            <div className="flex gap-2">
              {prevHref && (
                <Link
                  href={prevHref}
                  className="btn-outline"
                  style={{ padding: '0.3rem 0.875rem', fontSize: '0.8125rem', borderRadius: '9999px' }}
                >
                  ← Prev
                </Link>
              )}
              {nextHref && (
                <Link
                  href={nextHref}
                  className="btn-outline"
                  style={{ padding: '0.3rem 0.875rem', fontSize: '0.8125rem', borderRadius: '9999px' }}
                >
                  Next →
                </Link>
              )}
            </div>
          </div>

          <h1
            className="font-serif mb-1"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 600, color: 'var(--text-primary)' }}
          >
            {data.title}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            SB {canto}.{chapter} · {data.total} verses
          </p>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* View mode toggle */}
        <div className="flex gap-2 mb-8">
          {(['compact', 'detailed'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="font-serif text-sm capitalize"
              style={{
                padding: '0.375rem 1rem',
                borderRadius: '9999px',
                border: '1.5px solid',
                borderColor: viewMode === mode ? 'var(--saffron)' : 'var(--border)',
                backgroundColor: viewMode === mode ? 'var(--saffron)' : 'transparent',
                color: viewMode === mode ? '#FFF9F0' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: '"Crimson Text", Georgia, serif',
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Verses */}
        <div className="space-y-0">
          {data.verses.map((verse, idx) => (
            <div
              key={verse.id}
              className="verse-row"
              onClick={() => { window.location.href = `/sb/${verse.verse_slug}` }}
              style={{ padding: viewMode === 'compact' ? '0.875rem 0.5rem' : '1.25rem 0.5rem' }}
            >
              {viewMode === 'compact' ? (
                <div className="flex items-baseline gap-4">
                  <span
                    className="flex-shrink-0 font-mono text-xs font-semibold"
                    style={{ color: 'var(--saffron)', minWidth: '5rem' }}
                  >
                    {verse.reference}
                  </span>
                  <span className="font-serif text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {verse.translation}
                  </span>
                  <span className="ml-auto flex-shrink-0 text-sm" style={{ color: 'var(--saffron)', opacity: 0.6 }}>→</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="section-label" style={{ color: 'var(--saffron)' }}>{verse.reference}</div>
                  {verse.devanagari && (
                    <p
                      className="devanagari-text text-xl"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {verse.devanagari}
                    </p>
                  )}
                  {verse.transliteration && (
                    <p className="iast-text text-sm">
                      {verse.transliteration.substring(0, 180)}…
                    </p>
                  )}
                  {verse.translation && (
                    <p className="font-serif text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {verse.translation}
                    </p>
                  )}
                  <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                    <span className="text-xs" style={{ color: 'var(--saffron)' }}>Read full verse →</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom nav */}
        {(prevHref || nextHref) && (
          <div
            className="flex items-center justify-between mt-12 pt-8"
            style={{ borderTop: '1px solid var(--border-light)' }}
          >
            {prevHref ? (
              <Link href={prevHref} className="btn-outline">← Previous Chapter</Link>
            ) : <div />}
            {nextHref ? (
              <Link href={nextHref} className="btn-primary">Next Chapter →</Link>
            ) : <div />}
          </div>
        )}
      </section>
    </div>
  )
}
