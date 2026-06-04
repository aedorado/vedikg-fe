'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const SECTION_LABELS: Record<string, string> = {
  adi: 'Ādi-līlā',
  madhya: 'Madhya-līlā',
  antya: 'Antya-līlā',
}

const SECTION_ORDER = ['adi', 'madhya', 'antya']
const SECTION_CHAPTER_COUNTS: Record<string, number> = {
  adi: 17,
  madhya: 25,
  antya: 20,
}

interface Verse {
  id: number
  full_reference: string
  verse_slug: string
  translation: string
  devanagari?: string
  transliteration?: string
  synonyms_raw?: string
  purports?: Array<{ author: string; body_text: string }>
}

interface ChapterData {
  section: string
  section_label: string
  chapter_number: number
  title: string
  summary: string
  verses: Verse[]
}

type ViewMode = 'compact' | 'detailed'

export default async function CCChapterPage({
  params,
}: {
  params: Promise<{ section: string; chapter: string }>
}) {
  const { section: sectionParam, chapter: chapterParam } = await params
  return <CCChapterContent section={sectionParam} chapter={chapterParam} />
}

function CCChapterContent({ section: sectionParam, chapter: chapterParam }: { section: string; chapter: string }) {
  const [data, setData] = useState<ChapterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('compact')

  const section = sectionParam.toLowerCase()
  const chapterNum = parseInt(chapterParam)
  
  const maxChapters = SECTION_CHAPTER_COUNTS[section] || 0
  const sectionIndex = SECTION_ORDER.indexOf(section)
  
  // Calculate prev/next links with section wrapping
  let prevHref: string | null = null
  let nextHref: string | null = null
  
  if (chapterNum > 1) {
    prevHref = `/cc/${section}/${chapterNum - 1}`
  } else if (sectionIndex > 0) {
    const prevSection = SECTION_ORDER[sectionIndex - 1]
    const prevSectionChapters = SECTION_CHAPTER_COUNTS[prevSection] || 1
    prevHref = `/cc/${prevSection}/${prevSectionChapters}`
  }
  
  if (chapterNum < maxChapters) {
    nextHref = `/cc/${section}/${chapterNum + 1}`
  } else if (sectionIndex < SECTION_ORDER.length - 1) {
    const nextSection = SECTION_ORDER[sectionIndex + 1]
    nextHref = `/cc/${nextSection}/1`
  }

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/verses/cc/${section}/${chapterNum}`)
        if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`)
        const json = await res.json()
        setData(json)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading chapter')
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchChapter()
  }, [section, chapterNum])

  if (loading) {
    return (
      <main style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="min-h-screen">
        
        <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center h-64">
          <p style={{ color: 'var(--text-muted)' }}>Loading verses...</p>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="min-h-screen">
        
        <div className="max-w-4xl mx-auto px-4 py-12">
          <p style={{ color: 'var(--text-primary)' }}>{error || 'Chapter not found'}</p>
          <Link href="/cc" className="text-sm mt-4 inline-block" style={{ color: 'var(--gold)' }}>
            ← Back to CC
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="min-h-screen">
      
      <section className="max-w-5xl mx-auto px-4 py-12">
        {/* Header with Nav */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/cc/${section}`} className="text-xs" style={{ color: 'var(--gold)' }}>
              ← {data.section_label}
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
          <h1 className="heading-serif text-3xl mb-2">{data.title}</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {data.verses.length} verses
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
              {data.verses.map((verse) => {
                const verseNum = verse.verse_slug?.split('/').pop() || '1'
                return (
                <tr
                  key={verse.id}
                  className="hover:opacity-75 transition-opacity cursor-pointer border-b"
                  style={{ borderColor: 'var(--border-gold)', opacity: 0.9 }}
                  onClick={() => {
                    window.location.href = `/cc/${section}/${chapterNum}/${verseNum}`
                  }}
                >
                  {viewMode === 'compact' ? (
                    <>
                      <td
                        className="py-3 px-4 font-mono"
                        style={{ color: 'var(--gold)', width: '80px' }}
                      >
                        {verseNum}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                        {verse.translation}
                      </td>
                    </>
                  ) : (
                    <td colSpan={2} className="py-6 px-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs mb-1" style={{ color: 'var(--gold)' }}>
                            {verse.full_reference}
                          </p>
                        </div>
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
                        {verse.purports && verse.purports.length > 0 && (
                          <div>
                            <p className="text-xs mb-1" style={{ color: 'var(--gold)' }}>
                              Purport — {verse.purports[0].author}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {verse.purports[0].body_text.substring(0, 200)}...
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
