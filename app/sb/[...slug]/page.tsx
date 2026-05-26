'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import SiteNav from '../../components/SiteNav'

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
      .then((r) => r.json())
      .then((data) => {
        setVerse(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [slugPath])

  if (loading) return <div className="min-h-screen bg-temple-dark text-white flex items-center justify-center">Loading...</div>
  if (!verse || verse.error) return <div className="min-h-screen bg-temple-dark text-white flex items-center justify-center">Verse not found</div>

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <SiteNav />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-lg uppercase tracking-widest" style={{ color: 'var(--gold)' }}>{verse.full_reference}</h1>
              {verse.chanda && (
                <button
                  onClick={() => setChandaOpen(o => !o)}
                  className="text-xs px-2 py-0.5 rounded-full border transition-colors"
                  style={{
                    color: 'var(--gold)',
                    borderColor: 'color-mix(in srgb, var(--border-gold) 35%, transparent)',
                    cursor: 'pointer',
                  }}
                  title="Click to see meter analysis"
                >
                  {verse.chanda} {chandaOpen ? '▲' : '▼'}
                </button>
              )}
            </div>
            <div className="flex gap-3 text-sm">
              {verse.prev_slug && (
                <Link
                  href={`/sb/${verse.prev_slug}`}
                  className="flex items-center gap-1 transition"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  title={verse.prev_reference}
                >
                  <span>←</span>
                  <span className="hidden sm:inline">{verse.prev_reference}</span>
                </Link>
              )}
              {verse.next_slug && (
                <Link
                  href={`/sb/${verse.next_slug}`}
                  className="flex items-center gap-1 transition"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  title={verse.next_reference}
                >
                  <span className="hidden sm:inline">{verse.next_reference}</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>

          {/* Chanda detail panel */}
          {chandaOpen && verse.chanda_detail && (
            <div className="verse-card mb-6 text-sm" style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 40%, transparent)' }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-serif text-base" style={{ color: 'var(--gold)' }}>{verse.chanda_detail.name}</span>
                {verse.chanda_detail.jaati && verse.chanda_detail.jaati !== verse.chanda_detail.name && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>jāti: {verse.chanda_detail.jaati}</span>
                )}
              </div>
              <div className="space-y-2">
                {verse.chanda_detail.lines?.filter((l: any) => l.line).map((l: any, i: number) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-baseline text-xs">
                    <span className="italic" style={{ color: 'var(--text-parchment)' }}>{l.line}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{l.syllables}syl</span>
                    <span style={{ color: 'var(--gold)', fontFamily: 'serif' }}>{l.chanda || l.jaati || '—'}</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{l.gana}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Devanagari */}
          {verse.devanagari && (
            <div className="verse-card mb-6 text-center">
              <div className="text-2xl leading-loose whitespace-pre-line" style={{ fontFamily: 'serif' }}>
                {verse.devanagari}
              </div>
            </div>
          )}

          {/* IAST Transliteration — line-by-line, italic, centered */}
          {verse.transliteration && (
            <div className="verse-card mb-8 text-center">
              {verse.transliteration.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                <p key={i} className="text-parchment italic leading-8">{line}</p>
              ))}
            </div>
          )}

          {/* Synonyms — word part is clickable → /words/[word] */}
          {verse.synonyms_raw && (
            <div className="verse-card mb-8">
              <h2 className="subheading-serif mb-4">Synonyms</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-parchment text-sm">
                {verse.synonyms_raw
                  .replace(/^Synonyms\s*/i, '')
                  .split(' ; ')
                  .filter((s: string) => s.trim())
                  .map((entry: string, i: number) => {
                    const [wordPart, ...rest] = entry.trim().split(' — ')
                    const meaning = rest.join(' — ')
                    return (
                      <p key={i} className="leading-relaxed">
                        <Link
                          href={`/words/${encodeURIComponent(wordPart.trim())}`}
                          className="hover:underline"
                          style={{ color: 'var(--gold)' }}
                        >
                          {wordPart.trim()}
                        </Link>
                        {meaning ? ` — ${meaning}` : ''}
                      </p>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Translation */}
          {verse.translation && (
            <div className="verse-card mb-8">
              <h2 className="subheading-serif mb-4">Translation</h2>
              <p className="text-parchment leading-relaxed">{verse.translation}</p>
            </div>
          )}

          {/* Purport */}
          {verse.purports && verse.purports.length > 0 ? (
            <div className="verse-card mb-8">
              {verse.purports.map((p: any, i: number) => (
                <div key={i} className={i > 0 ? 'mt-6 pt-6 border-t' : ''} style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 20%, transparent)' }}>
                  <h2 className="subheading-serif mb-1">Purport</h2>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>— {p.author}</p>
                  {p.body_html ? (
                    <div className="purport-html text-parchment leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: p.body_html }} />
                  ) : (
                    <div className="text-parchment leading-relaxed whitespace-pre-wrap">{p.body_text}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (verse.purport_html || verse.purport_text) && (
            <div className="verse-card mb-8">
              <h2 className="subheading-serif mb-4">Purport</h2>
              {verse.purport_html ? (
                <div className="purport-html text-parchment leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: verse.purport_html }} />
              ) : (
                <div className="text-parchment leading-relaxed whitespace-pre-wrap">{verse.purport_text}</div>
              )}
            </div>
          )}

          {/* Entities mentioned — clickable to character pages */}
          {verse.entities && verse.entities.length > 0 && (
            <div className="verse-card">
              <h2 className="subheading-serif mb-4">Personalities Mentioned</h2>
              <div className="flex flex-wrap gap-2">
                {verse.entities.map((e: any, i: number) => (
                  <Link
                    key={i}
                    href={`/characters/${e.id}`}
                    className="text-xs px-3 py-1 rounded-full border transition"
                    style={{
                      borderColor: 'color-mix(in srgb, var(--border-gold) 40%, transparent)',
                      color: 'var(--gold)',
                    }}
                    title={e.mention_location}
                  >
                    {e.name}
                    {e.mention_location === 'purport_text' && (
                      <span className="ml-1 opacity-50">(purport)</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom prev/next navigation */}
          {(verse.prev_slug || verse.next_slug) && (
            <div className="flex items-center justify-between mt-12 pt-8 border-t" style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 20%, transparent)' }}>
              {verse.prev_slug ? (
                <Link href={`/sb/${verse.prev_slug}`} className="flex items-center gap-2 transition group" style={{ color: 'var(--text-muted)' }}>
                  <span className="text-xl">←</span>
                  <div className="text-left">
                    <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Previous</div>
                    <div className="text-sm" style={{ color: 'var(--gold)' }}>{verse.prev_reference}</div>
                  </div>
                </Link>
              ) : <div />}
              {verse.next_slug ? (
                <Link href={`/sb/${verse.next_slug}`} className="flex items-center gap-2 transition group" style={{ color: 'var(--text-muted)' }}>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Next</div>
                    <div className="text-sm" style={{ color: 'var(--gold)' }}>{verse.next_reference}</div>
                  </div>
                  <span className="text-xl">→</span>
                </Link>
              ) : <div />}
            </div>
          )}
        </motion.div>
      </section>
    </main>
  )
}
