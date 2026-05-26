'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SiteNav from '../../../components/SiteNav'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type ViewMode = 'compact' | 'detailed'

const KHANDA_LABELS: Record<string, string> = {
  adi: 'Ādi-khaṇḍa',
  madhya: 'Madhya-khaṇḍa',
  antya: 'Antya-khaṇḍa',
}

export default function CBChapterPage({
  params,
}: {
  params: Promise<{ khanda: string; chapter: string }>
}) {
  const [khanda, setKhanda] = useState<string>('')
  const [chapter, setChapter] = useState<number>(0)
  const [chapterData, setChapterData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('compact')

  useEffect(() => {
    params.then(({ khanda: k, chapter: ch }) => {
      const kLower = k.toLowerCase()
      const chNum = parseInt(ch)
      setKhanda(kLower)
      setChapter(chNum)
      fetch(`${API_BASE}/api/verses/cb/${kLower}/${chNum}`)
        .then(r => r.json())
        .then(data => { setChapterData(data); setLoading(false) })
        .catch(() => { setChapterData(null); setLoading(false) })
    })
  }, [params])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading…</div>
  )
  if (!chapterData || chapterData.error || chapterData.detail) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Chapter not found</div>
  )

  const khandaLabel = KHANDA_LABELS[khanda] ?? khanda
  const verses = chapterData.verses || []

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <SiteNav />
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href={`/cb/${khanda}`} className="text-sm mb-6 inline-block hover:opacity-70 transition"
            style={{ color: 'var(--text-secondary)' }}>
            ← Back to {khandaLabel}
          </Link>
          
          <h1 className="heading-serif text-3xl mb-2">Chapter {chapter}</h1>
          {chapterData.title && <h2 className="text-xl mb-4 font-semibold">{chapterData.title}</h2>}
          {chapterData.summary && (
            <div className="mb-6 mt-4 border-l-2 pl-4" style={{ borderColor: 'var(--gold)' }}>
              {chapterData.summary.split('\n\n').map((para: string, i: number) => (
                <p key={i} className="text-sm mb-3 last:mb-0" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  {para}
                </p>
              ))}
            </div>
          )}
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {verses.length} verses
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
              {verses.map((v: any) => (
                <tr
                  key={v.id}
                  className="hover:opacity-75 transition-opacity cursor-pointer border-b"
                  style={{ borderColor: 'var(--border-gold)', opacity: 0.9 }}
                  onClick={() => {
                    const verseNum = v.reference?.split('.').pop() || v.id
                    window.location.href = `/cb/${khanda}/${chapter}/${verseNum}`
                  }}
                >
                  {viewMode === 'compact' ? (
                    <>
                      <td
                        className="py-3 px-4 font-mono"
                        style={{ color: 'var(--gold)', width: '100px' }}
                      >
                        {v.reference?.split('.').pop() || v.id}
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                        {v.translation?.substring(0, 150)}
                        {v.translation?.length > 150 ? '...' : ''}
                      </td>
                    </>
                  ) : (
                    <td colSpan={2} className="py-6 px-4">
                      <div className="space-y-3">
                        <p className="text-xs mb-1" style={{ color: 'var(--gold)' }}>
                          Verse {v.reference?.split('.').pop() || v.id}
                        </p>
                        {v.devanagari && (
                          <p className="font-devanagari text-lg" style={{ color: 'var(--text-primary)' }}>
                            {v.devanagari.substring(0, 200)}
                            {v.devanagari.length > 200 ? '...' : ''}
                          </p>
                        )}
                        {v.translation && (
                          <p style={{ color: 'var(--text-primary)' }}>
                            {v.translation}
                          </p>
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
