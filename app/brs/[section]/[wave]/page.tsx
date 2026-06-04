'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const SECTION_META: Record<string, { label: string; color: string }> = {
  eastern:  { label: 'Eastern Section', color: 'var(--saffron)' },
  southern: { label: 'Southern Section', color: 'var(--gold)' },
  western:  { label: 'Western Section',  color: 'var(--lotus)' },
  northern: { label: 'Northern Section', color: 'var(--temple-sage)' },
}

type ViewMode = 'compact' | 'detailed'

export default function BRSWavePage({
  params,
}: {
  params: Promise<{ section: string; wave: string }>
}) {
  const [section, setSection] = useState('')
  const [wave, setWave] = useState(0)
  const [waveData, setWaveData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('compact')

  useEffect(() => {
    params.then(({ section: s, wave: w }) => {
      const sec = s.toLowerCase()
      const wNum = parseInt(w)
      setSection(sec)
      setWave(wNum)
      fetch(`${API_BASE}/api/verses/brs/${sec}/${wNum}`)
        .then(r => r.json())
        .then(data => { setWaveData(data); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, [params])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading…</div>
  )
  if (!waveData || waveData.detail) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Wave not found</div>
  )

  const meta = SECTION_META[section] ?? { label: section, color: 'var(--gold)' }
  const verses = waveData.verses || []

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            <Link href="/brs" className="hover:underline">BRS</Link>
            <span>›</span>
            <Link href={`/brs/${section}`} className="hover:underline">{meta.label}</Link>
            <span>›</span>
            <span>Wave {wave}</span>
          </div>

          <h1 className="heading-serif text-3xl mb-1">{waveData.title}</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {verses.length} verses
          </p>

          {/* View toggle */}
          <div className="flex gap-2 mb-6">
            {(['compact', 'detailed'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-3 py-1 text-sm rounded transition-colors capitalize"
                style={{
                  backgroundColor: viewMode === mode ? meta.color : 'transparent',
                  color: viewMode === mode ? 'var(--bg-primary)' : 'var(--text-primary)',
                  border: `1px solid ${meta.color}`,
                  opacity: viewMode === mode ? 1 : 0.6,
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {verses.map((v: any) => {
                const verseNum = v.full_reference?.split('.').pop() ?? v.id
                return (
                  <tr
                    key={v.id}
                    className="hover:opacity-75 transition-opacity cursor-pointer border-b"
                    style={{ borderColor: 'var(--border-gold)', opacity: 0.9 }}
                    onClick={() => { window.location.href = `/brs/${section}/${wave}/${verseNum}` }}
                  >
                    {viewMode === 'compact' ? (
                      <>
                        <td className="py-3 px-4 font-mono w-24 shrink-0" style={{ color: meta.color }}>
                          {v.full_reference ?? verseNum}
                        </td>
                        <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>
                          {v.translation?.substring(0, 160)}{v.translation?.length > 160 ? '…' : ''}
                        </td>
                      </>
                    ) : (
                      <td colSpan={2} className="py-6 px-4">
                        <p className="text-xs mb-2 font-mono" style={{ color: meta.color }}>
                          {v.full_reference}
                        </p>
                        {v.transliteration && (
                          <p
                            className="italic mb-3 text-base leading-relaxed"
                            style={{ color: 'var(--text-primary)', fontFamily: 'Georgia, serif', whiteSpace: 'pre-line' }}
                          >
                            {v.transliteration.substring(0, 300)}{v.transliteration.length > 300 ? '…' : ''}
                          </p>
                        )}
                        {v.translation && (
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {v.translation}
                          </p>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
