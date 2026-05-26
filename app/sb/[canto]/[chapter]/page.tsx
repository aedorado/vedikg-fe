'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SiteNav from '../../../components/SiteNav'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// SB chapter counts per canto
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
  canto_total?: number
}

type ViewMode = 'compact' | 'detailed'

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ canto: string; chapter: string }>
}) {
  const { canto, chapter } = await params
  return <ChapterContent canto={canto} chapter={chapter} />
}

function ChapterContent({ canto, chapter }: { canto: string; chapter: string }) {
  const [data, setData] = useState<ChapterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('compact')
  const cantoNum = parseInt(canto)
  const chapterNum = parseInt(chapter)
  
  // Get chapter counts
  const maxChaptersInCanto = CANTO_CHAPTER_COUNTS[cantoNum] || 1
  
  // Calculate prev/next links
  let prevHref: string | null = null
  let nextHref: string | null = null
  
  if (chapterNum > 1) {
    prevHref = `/sb/${canto}/${chapterNum - 1}`
  } else if (cantoNum > 1) {
    const prevCantoChapters = CANTO_CHAPTER_COUNTS[cantoNum - 1] || 1
    prevHref = `/sb/${cantoNum - 1}/${prevCantoChapters}`
  }
  
  if (chapterNum < maxChaptersInCanto) {
    nextHref = `/sb/${canto}/${chapterNum + 1}`
  } else if (cantoNum < TOTAL_CANTOS) {
    nextHref = `/sb/${cantoNum + 1}/1`
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/verses/sb/${canto}/${chapter}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [canto, chapter])

  if (loading) return (
    <main style={{ backgroundColor: 'var(--bg-primary)' }} className="min-h-screen">
      <SiteNav />
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--gold)' }}>Loading…</div>
    </main>
  )

  if (!data) return (
    <main style={{ backgroundColor: 'var(--bg-primary)' }} className="min-h-screen">
      <SiteNav />
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>Chapter not found</div>
    </main>
  )

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="min-h-screen">
      <SiteNav />
      <section className="max-w-5xl mx-auto px-4 py-12">
        {/* Header with Nav */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/sb/${canto}`} className="text-xs" style={{ color: 'var(--gold)' }}>
              ← Canto {canto}
            </Link>
            <div className="flex gap-2">
              {prevHref && (
                <Link href={prevHref} className="text-xs px-3 py-1 rounded border" style={{ color: 'var(--gold)', borderColor: 'var(--border-gold)' }}>
                  ← Prev
                </Link>
              )}
              {nextHref && (
                <Link href={nextHref} className="text-xs px-3 py-1 rounded border" style={{ color: 'var(--gold)', borderColor: 'var(--border-gold)' }}>
                  Next →
                </Link>
              )}
            </div>
          </div>
          <h1 className="heading-serif text-3xl mb-2">{data?.title}</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {data?.total} verses
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('compact')}
            className="px-3 py-1 text-sm rounded transition-colors"
            style={{
              backgroundColor: viewMode === 'compact' ? 'var(--gold)' : 'transparent',
              color: viewMode === 'compact' ? 'var(--bg-primary)' : 'var(--text-primary)',
              border: `1px solid var(--border-gold)`,
            }}
          >
            Compact
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className="px-3 py-1 text-sm rounded transition-colors"
            style={{
              backgroundColor: viewMode === 'detailed' ? 'var(--gold)' : 'transparent',
              color: viewMode === 'detailed' ? 'var(--bg-primary)' : 'var(--text-primary)',
              border: `1px solid var(--border-gold)`,
            }}
          >
            Detailed
          </button>
        </div>

        {/* Verses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {data.verses.map((verse) => (
                <tr
                  key={verse.id}
                  className="hover:opacity-75 transition-opacity cursor-pointer border-b"
                  style={{ borderColor: 'var(--border-gold)', opacity: 0.9 }}
                  onClick={() => {
                    window.location.href = `/sb/${verse.verse_slug}`
                  }}
                >
                  {viewMode === 'compact' ? (
                    <>
                      <td
                        className="py-3 px-4 font-mono"
                        style={{ color: 'var(--gold)', width: '100px' }}
                      >
                        {verse.reference}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                        {verse.translation}
                      </td>
                    </>
                  ) : (
                    <td colSpan={2} className="py-6 px-4">
                      <div className="space-y-3">
                        <p className="text-xs mb-1" style={{ color: 'var(--gold)' }}>
                          {verse.reference}
                        </p>
                        {verse.devanagari && (
                          <p className="font-devanagari text-lg" style={{ color: 'var(--text-primary)' }}>
                            {verse.devanagari}
                          </p>
                        )}
                        {verse.transliteration && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {verse.transliteration.substring(0, 150)}...
                          </p>
                        )}
                        {verse.translation && (
                          <p style={{ color: 'var(--text-primary)' }}>{verse.translation}</p>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
