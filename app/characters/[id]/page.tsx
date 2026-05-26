'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import RelationshipGraph from '@/components/RelationshipGraph'
import SiteNav from '../../components/SiteNav'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const INVERSE_REL: Record<string, string> = {
  son_of: 'father_of', daughter_of: 'father_of',
  father_of: 'son_of', mother_of: 'son_of',
  child_of: 'parent_of', parent_of: 'child_of',
  brother_of: 'brother_of', sister_of: 'sister_of',
  husband_of: 'wife_of', wife_of: 'husband_of',
}

function effectiveLabel(rel: any): string {
  const raw = rel.relationship as string
  if (rel.direction === 'incoming') return (INVERSE_REL[raw] ?? raw).replace(/_/g, ' ')
  return raw.replace(/_/g, ' ')
}

function dedupeRels(rels: any[], currentId: number): any[] {
  const seen = new Set<string>()
  return rels.filter(rel => {
    const otherId = rel.target_id ?? rel.source_id
    if (otherId === currentId) return false   // drop self-references
    const key = `${otherId}:${effectiveLabel(rel)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return <CharacterDetailWrapper params={params} />
}

function CharacterDetailWrapper({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setId(id)
    })
  }, [params])

  return id ? <CharacterDetailContent id={id} /> : <div>Loading…</div>
}

function CharacterDetailContent({ id: idParam }: { id: string }) {
  const [entity, setEntity]         = useState<any>(null)
  const [mentions, setMentions]     = useState<any>(null)
  const [relationships, setRelationships] = useState<any>(null)
  const [graphData, setGraphData]   = useState<any>(null)
  const [depth, setDepth]           = useState(1)
  const [loading, setLoading]       = useState(true)

  // Mentions filters
  const [mSearch,   setMSearch]     = useState('')
  const [mLoc,      setMLoc]        = useState('')      // ''|'verse_text'|'purport_text'|'both'
  const [mCantos,   setMCantos]     = useState<Set<number>>(new Set())  // Multi-select
  const [mChapter,  setMChapter]    = useState<number|null>(null)

  const id = parseInt(idParam)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`${API_BASE}/api/entities/${id}`).then(r => r.json()),
      fetch(`${API_BASE}/api/entities/${id}/mentions`).then(r => r.json()),
      fetch(`${API_BASE}/api/entities/${id}/relationships`).then(r => r.json()),
    ]).then(([e, m, r]) => {
      console.log('Fetched entity data:', { e, m, r })
      setEntity(e); setMentions(m); setRelationships(r)
      setLoading(false)
    }).catch((err) => {
      console.error('Failed to fetch character data:', err)
      setLoading(false)
    })
  }, [id])

  // Re-fetch graph on depth change
  useEffect(() => {
    fetch(`${API_BASE}/api/entities/${id}/graph?depth=${depth}`)
      .then(r => r.json()).then(setGraphData).catch(() => {})
  }, [id, depth])

  // Derived: all cantos and chapters from mentions
  const allCantos = useMemo(() => {
    if (!mentions?.verses) return []
    const s = new Set<number>()
    mentions.verses.forEach((v: any) => {
      const m = v.reference?.match(/SB\s+(\d+)\./)
      if (m) s.add(Number(m[1]))
    })
    return Array.from(s).sort((a, b) => a - b)
  }, [mentions])

  const allChapters = useMemo(() => {
    if (!mentions?.verses) return []
    const s = new Set<number>()
    mentions.verses.forEach((v: any) => {
      const m = v.reference?.match(/SB\s+\d+\.(\d+)\./)
      const vCanto = Number(v.reference.match(/SB\s+(\d+)\./)?.[1])
      if (m && (mCantos.size === 0 || mCantos.has(vCanto))) {
        s.add(Number(m[1]))
      }
    })
    return Array.from(s).sort((a, b) => a - b)
  }, [mentions, mCantos])

  const filteredMentions = useMemo(() => {
    if (!mentions?.verses) return []
    const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const filtered = mentions.verses.filter((v: any) => {
      if (mLoc && v.mention_location !== mLoc) return false
      if (mCantos.size > 0) {
        const m = v.reference?.match(/SB\s+(\d+)\./)
        if (!m || !mCantos.has(Number(m[1]))) return false
      }
      if (mChapter !== null) {
        const m = v.reference?.match(/SB\s+\d+\.(\d+)\./)
        if (!m || Number(m[1]) !== mChapter) return false
      }
      if (mSearch.trim() && !norm(v.translation || '').includes(norm(mSearch))) return false
      return true
    })
    // Sort by canto, then chapter, then verse number
    return filtered.sort((a: any, b: any) => {
      const aMatch = a.reference?.match(/SB\s+(\d+)\.(\d+)\.(\d+)/)
      const bMatch = b.reference?.match(/SB\s+(\d+)\.(\d+)\.(\d+)/)
      if (!aMatch || !bMatch) return 0
      const aCanto = Number(aMatch[1]), aChap = Number(aMatch[2]), aVerse = Number(aMatch[3])
      const bCanto = Number(bMatch[1]), bChap = Number(bMatch[2]), bVerse = Number(bMatch[3])
      if (aCanto !== bCanto) return aCanto - bCanto
      if (aChap !== bChap) return aChap - bChap
      return aVerse - bVerse
    })
  }, [mentions, mLoc, mCantos, mChapter, mSearch])

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading…</div>
  if (!entity)  return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Not found</div>

  const LOC_LABEL: Record<string, string> = { verse_text: 'verse', purport_text: 'purport', both: 'verse + purport' }
  const LOC_STYLE: Record<string, string> = { verse_text: 'var(--gold)', purport_text: 'var(--text-muted)', both: 'var(--text-parchment)' }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <SiteNav />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="heading-serif mb-1">{entity.name}</h1>
          <p className="text-sm uppercase tracking-widest" style={{ color: 'var(--gold)' }}>{entity.type}</p>
          {entity.description && <p className="mt-3 text-sm" style={{ color: 'var(--text-parchment)' }}>{entity.description}</p>}
        </div>

        {/* Family & Relationships */}
        {relationships && (relationships.relationships.family.length > 0 || relationships.relationships.other.length > 0) && (
          <div className="mb-10">
            <h2 className="subheading-serif mb-4">Family & Relationships</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relationships.relationships.family.length > 0 && (
                <div className="verse-card">
                  <h3 className="font-serif text-sm mb-3" style={{ color: 'var(--gold)' }}>Family</h3>
                  <div className="space-y-2">
                    {dedupeRels(relationships.relationships.family, id).map((rel: any, i: number) => {
                      const name = rel.target_name || rel.source_name
                      const targetId = rel.target_id || rel.source_id
                      return (
                        <div key={i} className="text-sm">
                          <Link href={`/characters/${targetId}`} className="hover:underline" style={{ color: 'var(--text-parchment)' }}>{name}</Link>
                          <span className="text-xs ml-2" style={{ color: 'var(--gold)' }}>{effectiveLabel(rel)}</span>
                          {rel.verse_ref && (
                            <Link href={`/sb/${rel.verse_ref.replace('SB ', '').replace(/\./g, '/')}`}>
                              <span className="text-xs ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--border-gold) 15%, transparent)', color: 'var(--text-muted)' }}>
                                {rel.verse_ref}
                              </span>
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {relationships.relationships.other.length > 0 && (
                <div className="verse-card">
                  <h3 className="font-serif text-sm mb-3" style={{ color: 'var(--gold)' }}>Interactions</h3>
                  <div className="space-y-2">
                    {dedupeRels(relationships.relationships.other, id).map((rel: any, i: number) => {
                      const name = rel.target_name || rel.source_name
                      const targetId = rel.target_id || rel.source_id
                      return (
                        <div key={i} className="text-sm">
                          <Link href={`/characters/${targetId}`} className="hover:underline" style={{ color: 'var(--text-parchment)' }}>{name}</Link>
                          <span className="text-xs ml-2" style={{ color: 'var(--gold)' }}>{effectiveLabel(rel)}</span>
                          {rel.verse_ref && (
                            <Link href={`/sb/${rel.verse_ref.replace('SB ', '').replace(/\./g, '/')}`}>
                              <span className="text-xs ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--border-gold) 15%, transparent)', color: 'var(--text-muted)' }}>
                                {rel.verse_ref}
                              </span>
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Relationship Network Graph */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="subheading-serif">Relationship Network</h2>
            <div className="flex items-center gap-2 text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Depth:</span>
              <div className="flex rounded overflow-hidden border" style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)' }}>
                {[1, 2, 3, 4, 5].map(d => (
                  <button key={d} onClick={() => setDepth(d)}
                    className="w-7 py-1 text-center transition"
                    style={{
                      backgroundColor: depth === d ? 'color-mix(in srgb, var(--border-gold) 25%, transparent)' : 'var(--bg-card)',
                      color: depth === d ? 'var(--gold)' : 'var(--text-muted)',
                    }}>
                    {d}
                  </button>
                ))}
              </div>
              {graphData && <span style={{ color: 'var(--text-muted)' }}>{graphData.nodes.length - 1} connected</span>}
            </div>
          </div>
          <div className="verse-card" style={{ height: 380 }}>
            {graphData && graphData.nodes.length > 0
              ? <RelationshipGraph nodes={graphData.nodes} edges={graphData.edges} />
              : <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>No relationship data yet</div>
            }
          </div>
        </div>

        {/* All Mentions */}
        {mentions && (
        <div>
            <h2 className="subheading-serif mb-3">All Mentions ({mentions.total_mentions})</h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <input value={mSearch} onChange={e => setMSearch(e.target.value)}
                placeholder="Search translation…"
                className="text-sm px-3 py-1.5 rounded border outline-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-primary)', minWidth: 180 }}
              />
              <select value={mLoc} onChange={e => setMLoc(e.target.value)}
                className="text-sm px-3 py-1.5 rounded border outline-none"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-primary)' }}
              >
                <option value="">All locations</option>
                <option value="verse_text">Verse only</option>
                <option value="purport_text">Purport only</option>
                <option value="both">Verse + Purport</option>
              </select>
              {allCantos.length > 1 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Cantos:</span>
                  <div className="flex flex-wrap gap-1">
                    {allCantos.map(c => (
                      <button key={c} onClick={() => {
                        const newCantos = new Set(mCantos)
                        if (newCantos.has(c)) newCantos.delete(c)
                        else newCantos.add(c)
                        setMCantos(newCantos)
                        setMChapter(null)
                      }}
                        className="text-xs px-2 py-1 rounded border transition"
                        style={{
                          backgroundColor: mCantos.has(c) ? 'color-mix(in srgb, var(--border-gold) 25%, transparent)' : 'var(--bg-card)',
                          borderColor: mCantos.has(c) ? 'var(--border-gold)' : 'color-mix(in srgb, var(--border-gold) 30%, transparent)',
                          color: mCantos.has(c) ? 'var(--gold)' : 'var(--text-muted)',
                        }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {mCantos.size > 0 && allChapters.length > 1 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Chapters:</span>
                  <select value={mChapter ?? ''} onChange={e => setMChapter(e.target.value === '' ? null : Number(e.target.value))}
                    className="text-sm px-3 py-1.5 rounded border outline-none"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-primary)' }}
                  >
                    <option value="">All chapters</option>
                    {allChapters.map(c => <option key={c} value={c}>Chapter {c}</option>)}
                  </select>
                </div>
              )}
              {(mSearch || mLoc || mCantos.size > 0) && (
                <button onClick={() => { setMSearch(''); setMLoc(''); setMCantos(new Set()); setMChapter(null) }}
                  className="text-xs px-3 py-1.5 rounded border"
                  style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-muted)' }}>
                  Clear
                </button>
              )}
              <span className="text-xs self-center ml-auto" style={{ color: 'var(--text-muted)' }}>{filteredMentions.length} shown</span>
            </div>

            <div className="space-y-3">
              {filteredMentions.map((v: any) => (
                <Link key={v.id} href={`/sb/${v.verse_slug || v.reference?.replace('SB ', '').replace(/\./g, '/')}`}>
                  <div className="verse-card cursor-pointer transition" style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 20%, transparent)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-gold)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--border-gold) 20%, transparent)')}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-serif" style={{ color: 'var(--gold)' }}>{v.reference}</span>
                      {v.mention_location && (
                        <span className="text-xs px-2 py-0.5 rounded-full border"
                          style={{ color: LOC_STYLE[v.mention_location] || 'var(--text-muted)', borderColor: 'color-mix(in srgb, currentColor 30%, transparent)' }}>
                          {LOC_LABEL[v.mention_location] || v.mention_location}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-parchment)' }}>{v.translation}</p>
                  </div>
                </Link>
              ))}
            </div>
        </div>
        )}
      </section>
    </main>
  )
}

