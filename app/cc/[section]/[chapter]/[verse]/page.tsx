'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import SiteNav from '../../../../components/SiteNav'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const SECTION_LABELS: Record<string, string> = {
  adi: 'Ādi-līlā',
  madhya: 'Madhya-līlā',
  antya: 'Antya-līlā',
}

export default async function CCVerseDetailPage({
  params,
}: {
  params: Promise<{ section: string; chapter: string; verse: string }>
}) {
  const { section, chapter, verse: verseNum } = await params
  return <CCVerseContent section={section} chapter={chapter} verseNum={verseNum} />
}

function CCVerseContent({
  section,
  chapter,
  verseNum,
}: {
  section: string
  chapter: string
  verseNum: string
}) {
  const [verse, setVerse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chandaOpen, setChandaOpen] = useState(false)

  const sectionLabel = SECTION_LABELS[section] ?? section

  useEffect(() => {
    fetch(`${API_BASE}/api/verses/cc/${section}/${chapter}/${verseNum}`)
      .then(r => r.json())
      .then(data => { setVerse(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [section, chapter, verseNum])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading…</div>
  )
  if (!verse || verse.detail) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Verse not found</div>
  )

  const isBengali = verse.language === 'bn'

  // Build nav slugs for CC
  const prevSlug = verse.prev_slug ? `/cc/${section}/${verse.prev_slug.split('/').slice(-2).join('/')}` : null
  const nextSlug = verse.next_slug ? `/cc/${section}/${verse.next_slug.split('/').slice(-2).join('/')}` : null

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <SiteNav />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Book badge */}
              <span className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: 'color-mix(in srgb, #7c6fa0 20%, transparent)', color: '#c4b5d9' }}>
                CC
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sectionLabel}</span>
              <h1 className="text-lg uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
                {verse.full_reference}
              </h1>
              {isBengali && (
                <span className="text-xs px-2 py-0.5 rounded-full border"
                  style={{ color: '#f0a848', borderColor: '#f0a84855' }}>
                  Bengali verse
                </span>
              )}
              {!isBengali && verse.chanda && (
                <button
                  onClick={() => setChandaOpen(o => !o)}
                  className="text-xs px-2 py-0.5 rounded-full border transition-colors"
                  style={{ color: 'var(--gold)', borderColor: 'color-mix(in srgb, var(--border-gold) 35%, transparent)', cursor: 'pointer' }}
                >
                  {verse.chanda} {chandaOpen ? '▲' : '▼'}
                </button>
              )}
            </div>
            <div className="flex gap-3 text-sm">
              {prevSlug && (
                <Link href={prevSlug} style={{ color: 'var(--text-muted)' }}>← Prev</Link>
              )}
              {nextSlug && (
                <Link href={nextSlug} style={{ color: 'var(--text-muted)' }}>Next →</Link>
              )}
            </div>
          </div>

          {/* Chandas detail */}
          {chandaOpen && verse.chanda_detail && (
            <div className="mb-6 p-4 rounded text-xs"
              style={{ backgroundColor: 'color-mix(in srgb, var(--border-gold) 8%, transparent)', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--gold)' }}>Meter analysis: </span>
              {JSON.stringify(verse.chanda_detail)}
            </div>
          )}

          {/* Original text (Bengali script) */}
          {verse.devanagari && (
            <div className="verse-card mb-6 text-center">
              <p className="font-serif text-xl leading-relaxed" style={{ color: 'var(--text-parchment)' }}>
                {verse.devanagari}
              </p>
            </div>
          )}

          {/* Transliteration */}
          {verse.transliteration && (
            <div className="verse-card mb-6">
              <p className="font-mono text-sm italic leading-relaxed whitespace-pre-line"
                style={{ color: 'var(--text-muted)' }}>
                {verse.transliteration}
              </p>
            </div>
          )}

          {/* Synonyms */}
          {verse.synonyms_raw && (
            <div className="verse-card mb-6">
              <h3 className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>Synonyms</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm" style={{ color: 'var(--text-parchment)' }}>
                {verse.synonyms_raw.split(' ; ').map((entry: string, i: number) => {
                  const [word, ...rest] = entry.split(' — ')
                  return (
                    <div key={i}>
                      <Link href={`/words/${encodeURIComponent(word.trim())}`}
                        className="hover:underline" style={{ color: 'var(--gold)' }}>
                        {word.trim()}
                      </Link>
                      {rest.length > 0 && <span> — {rest.join(' — ')}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Translation */}
          {verse.translation && (
            <div className="verse-card mb-6">
              <h3 className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>Translation</h3>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-parchment)' }}>
                {verse.translation}
              </p>
            </div>
          )}

          {/* Purports (multi-author aware) */}
          {verse.purports && verse.purports.length > 0 && (
            <div className="verse-card mb-6">
              {verse.purports.map((p: any, i: number) => (
                <div key={i} className={i > 0 ? 'mt-6 pt-6 border-t' : ''} style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 20%, transparent)' }}>
                  <h3 className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
                    Purport
                    <span className="ml-2 normal-case font-normal" style={{ color: 'var(--text-muted)' }}>
                      — {p.author}
                    </span>
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-parchment)' }}>
                    {p.body_text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Entities */}
          {verse.entities && verse.entities.length > 0 && (
            <div className="verse-card">
              <h3 className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>Characters Mentioned</h3>
              <div className="flex flex-wrap gap-2">
                {verse.entities.map((e: any) => (
                  <Link key={e.id} href={`/characters/${e.id}`}
                    className="text-xs px-2 py-1 rounded transition-colors hover:opacity-80"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--border-gold) 15%, transparent)', color: 'var(--text-parchment)' }}>
                    {e.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </section>
    </main>
  )
}
