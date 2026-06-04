'use client'

import { useEffect, useRef, useState, useMemo, Suspense } from 'react'
import * as d3 from 'd3'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const TYPE_COLORS: Record<string, string> = {
  person: '#d4af37', deva: '#7ec8b0', demon: '#e07b5a', sage: '#b0c4de',
  place: '#90ee90', river: '#4dd0e1', mountain: '#9e9e9e', kingdom: '#c87ec8',
  dynasty: '#e09a5a', concept: '#888', object: '#bbb', text: '#f0e68c',
  animal: '#cd853f',
}
const DEFAULT_COLOR = '#888'

const TYPE_ICONS: Record<string, string> = {
  person: '👤', deva: '✨', demon: '👹', sage: '🧘',
  place: '🏛️', river: '🌊', mountain: '⛰️', kingdom: '👑',
  dynasty: '🏰', concept: '💡', object: '🪔', text: '📜', animal: '🦁',
}

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable components
// ─────────────────────────────────────────────────────────────────────────────

function Skeleton({ w = '100%', h = 18, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--border) 50%, var(--bg-secondary) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

function StatCard({ label, value, accent }: { label: string; value: number | undefined; accent?: string }) {
  return (
    <div style={{
      padding: '18px 22px', borderRadius: 12,
      backgroundColor: 'var(--bg-secondary)',
      border: `1px solid ${accent || 'var(--border)'}30`,
      textAlign: 'center', flex: '1 1 130px',
    }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: accent || 'var(--text-primary)', lineHeight: 1 }}>
        {value?.toLocaleString() ?? '—'}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
    </div>
  )
}

// Entity card
function EntityCard({ entity, onClick }: { entity: any; onClick: () => void }) {
  const c = TYPE_COLORS[entity.entity_type] ?? DEFAULT_COLOR
  const icon = TYPE_ICONS[entity.entity_type] ?? '•'
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        border: `1px solid ${c}28`,
        backgroundColor: 'var(--bg-secondary)',
        transition: 'transform 0.18s, box-shadow 0.18s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 12px 32px ${c}30`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${c}, ${c}88)` }} />
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1rem' }}>{icon}</span>
          <span style={{
            fontSize: '0.65rem', color: 'var(--text-secondary)',
            backgroundColor: c + '14', padding: '2px 8px', borderRadius: 10,
          }}>
            {entity.verse_count} verse{entity.verse_count !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.25, color: 'var(--text-primary)' }}>
          {entity.sanskrit_name || entity.name}
        </div>
        {entity.name !== entity.sanskrit_name && entity.sanskrit_name && (
          <div style={{ fontSize: '0.75rem', color: c, fontWeight: 500 }}>{entity.name}</div>
        )}
        {entity.description && (
          <p style={{
            margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            flex: 1,
          }}>
            {entity.description}
          </p>
        )}
      </div>
    </div>
  )
}

const CONCEPT_COLOR = '#b0c4de'

// Concept grid card — mirrors EntityCard style
function ConceptCard({ concept, onClick }: { concept: any; onClick: () => void }) {
  const c = CONCEPT_COLOR
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        border: `1px solid ${c}28`,
        backgroundColor: 'var(--bg-secondary)',
        transition: 'transform 0.18s, box-shadow 0.18s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 12px 32px ${c}30`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${c}, ${c}88)` }} />
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1rem' }}>💡</span>
          <span style={{
            fontSize: '0.65rem', color: 'var(--text-secondary)',
            backgroundColor: c + '14', padding: '2px 8px', borderRadius: 10,
          }}>
            {concept.verse_count} verse{concept.verse_count !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.25, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
          {concept.concept}
        </div>
        {concept.description ? (
          <p style={{
            margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            flex: 1,
          }}>
            {concept.description}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.5, flex: 1 }}>
            Mentioned across {concept.verse_count} verse{concept.verse_count !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  )
}

// Section heading
function SectionTitle({ children, count, action }: { children: React.ReactNode; count?: number; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
      <h2 className="heading-serif" style={{ fontSize: '1.5rem', margin: 0 }}>
        {children}
        {count !== undefined && (
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400, marginLeft: 8 }}>
            ({count.toLocaleString()})
          </span>
        )}
      </h2>
      {action}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

function AIPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '')
  const [bookFilter, setBookFilter] = useState(searchParams.get('book') || '')
  const [cantoFilter, setCantoFilter] = useState(searchParams.get('canto') || '')
  const [chapterFilter, setChapterFilter] = useState(searchParams.get('chapter') || '')

  // Data
  const [progress, setProgress] = useState<any>(null)
  const [entities, setEntities] = useState<any[]>([])
  const [entityTotal, setEntityTotal] = useState(0)
  const [concepts, setConcepts] = useState<any[]>([])
  const [conceptTotal, setConceptTotal] = useState(0)
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] } | null>(null)

  // Loading states
  const [loadingEntities, setLoadingEntities] = useState(true)
  const [loadingConcepts, setLoadingConcepts] = useState(true)
  const [loadingGraph, setLoadingGraph] = useState(false)

  // UI state
  const [showGraph, setShowGraph] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const GRID_LIMIT = 25

  useEffect(() => {
    fetch(`${API_BASE}/api/ai/progress`).then(r => r.json()).then(setProgress).catch(() => {})

    const params = new URLSearchParams()
    if (bookFilter) params.append('book', bookFilter)
    if (cantoFilter) params.append('canto', cantoFilter)
    if (chapterFilter) params.append('chapter', chapterFilter)
    params.append('limit', String(GRID_LIMIT))

    fetch(`${API_BASE}/api/ai/personalities?${params}`)
      .then(r => r.json()).then(d => { setEntities(d.items ?? d); setEntityTotal(d.total ?? 0); setLoadingEntities(false) })
      .catch(() => setLoadingEntities(false))
    fetch(`${API_BASE}/api/ai/concepts?limit=${GRID_LIMIT}`)
      .then(r => r.json()).then(d => { setConcepts(d.items ?? d); setConceptTotal(d.total ?? 0); setLoadingConcepts(false) })
      .catch(() => setLoadingConcepts(false))
  }, [bookFilter, cantoFilter, chapterFilter])

  useEffect(() => {
    if (!showGraph || graphData) return
    setLoadingGraph(true)
    fetch(`${API_BASE}/api/ai/graph`)
      .then(r => r.json()).then(d => { setGraphData(d); setLoadingGraph(false) })
      .catch(() => setLoadingGraph(false))
  }, [showGraph])

  // Normalization helper
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

  // Client-side filter on the already-fetched page
  const filteredEntities = useMemo(() => {
    let list = entities
    if (typeFilter) list = list.filter(e => e.entity_type === typeFilter)
    if (query.trim()) {
      const q = norm(query)
      list = list.filter(e =>
        norm(e.name).includes(q) ||
        norm(e.sanskrit_name || '').includes(q) ||
        (Array.isArray(e.aliases) ? e.aliases : []).some((a: string) => norm(a).includes(q))
      )
    }
    return list
  }, [entities, query, typeFilter])

  const filteredConcepts = useMemo(() => {
    if (!query.trim()) return concepts
    const q = query.toLowerCase()
    return concepts.filter(c => c.concept.toLowerCase().includes(q))
  }, [concepts, query])

  const entityTypes = useMemo(() =>
    [...new Set(entities.map(e => e.entity_type).filter(Boolean))].sort()
  , [entities])

  const isSearching = query.trim().length > 0

  // D3 graph
  useEffect(() => {
    if (!showGraph || !graphData || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const W = svgRef.current.clientWidth || 900
    const H = 600
    const g = svg.append('g')
    svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.1, 6]).on('zoom', e => g.attr('transform', e.transform)))

    const nodes = graphData.nodes.map(n => ({ ...n }))
    const edges = graphData.edges.map(e => ({ ...e }))

    const sim = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(edges as any).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-250))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(22))

    const link = g.append('g').selectAll('line').data(edges).enter().append('line')
      .attr('stroke', '#555').attr('stroke-width', 1.2).attr('stroke-opacity', 0.45)

    const node = g.append('g').selectAll('circle').data(nodes).enter().append('circle')
      .attr('r', (d: any) => Math.max(6, Math.min(24, 5 + (d.verse_count || 0) * 0.5)))
      .attr('fill', (d: any) => TYPE_COLORS[d.type] ?? DEFAULT_COLOR)
      .attr('stroke', '#fff').attr('stroke-width', 0.8).style('cursor', 'pointer')
      .on('click', (_e, d: any) => router.push(`/ai/entities/${d.id}`))
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
        .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )

    const label = g.append('g').selectAll('text')
      .data(nodes.filter((d: any) => (d.verse_count || 0) >= 3)).enter()
      .append('text').text((d: any) => d.name)
      .attr('font-size', 9).attr('fill', 'var(--text-primary)')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => -Math.max(9, Math.min(26, 5 + (d.verse_count || 0) * 0.5)) - 2)
      .style('pointer-events', 'none')

    sim.on('tick', () => {
      link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
      label.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y)
    })
    return () => { sim.stop() }
  }, [showGraph, graphData])

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--accent)14 0%, transparent 50%)',
        borderBottom: '1px solid var(--border)40',
        padding: '52px 0 44px',
      }}>
        <section className="max-w-5xl mx-auto px-4">
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 10, fontWeight: 700 }}>
            Knowledge Graph
          </p>
          <h1 className="heading-serif" style={{ fontSize: '2.8rem', marginBottom: 10, lineHeight: 1.1 }}>
            Personalities &amp; Concepts
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 30, fontSize: '1rem', maxWidth: '55ch' }}>
            Search any character, place, or concept across the Śrīmad-Bhāgavatam, Caitanya-caritāmṛta, and beyond.
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 560 }}>
            <span style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              fontSize: '1.1rem', pointerEvents: 'none', opacity: 0.5,
            }}>🔍</span>
            <input
              autoFocus
              placeholder="Search Krishna, bhakti, Vrindavan, tapasya…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px 14px 44px',
                borderRadius: 14, fontSize: '1rem',
                border: '2px solid var(--accent)40',
                backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--accent)40')}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1,
                }}
              >×</button>
            )}
          </div>

          {/* Stats row */}
          {progress && (
            <>
              <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                <StatCard label="Personalities" value={progress.total_entities} accent="var(--accent)" />
                <StatCard label="Relationships" value={progress.total_relationships} accent="#7ec8b0" />
                <StatCard label="Concepts" value={progress.total_concepts} accent="#b0c4de" />
                <StatCard label="Verses covered" value={progress.verses_covered} accent="#e09a5a" />
              </div>

              {/* By Book Progress */}
              {progress.by_book && progress.by_book.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600 }}>
                    Progress by Text
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
                    {progress.by_book.map((book: any) => {
                      const percentage = book.verses_total > 0 ? Math.round((book.verses_done / book.verses_total) * 100) : 0
                      return (
                        <div key={book.book} style={{
                          padding: '14px 16px', borderRadius: 12,
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border)40',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                              {book.book}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>
                              {percentage}%
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                            {book.title}
                          </div>
                          <div style={{
                            width: '100%', height: 6, borderRadius: 3,
                            backgroundColor: 'var(--border)',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', width: `${percentage}%`,
                              background: 'linear-gradient(90deg, var(--accent), var(--accent)88)',
                              transition: 'width 0.3s ease',
                            }} />
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                            {book.verses_done.toLocaleString()} / {book.verses_total.toLocaleString()} verses
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>

          {/* ── Personalities ──────────────────────────────────────────── */}
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <SectionTitle>
                {isSearching ? `Personalities matching "${query}"` : 'Personalities'}
              </SectionTitle>
              {!isSearching && entityTotal > GRID_LIMIT && (
                <button onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('ai_initial_entities', JSON.stringify({ items: entities, total: entityTotal }))
                    router.push('/ai/personalities')
                  }
                }} style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  See all {entityTotal.toLocaleString()} →
                </button>
              )}
            </div>

            {/* Type filter chips */}
            {entityTypes.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                <button onClick={() => setTypeFilter('')} style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: '0.78rem', cursor: 'pointer',
                  border: `1px solid ${!typeFilter ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: !typeFilter ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: !typeFilter ? '#fff' : 'var(--text-secondary)',
                  fontWeight: !typeFilter ? 700 : 400,
                }}>All</button>
                {entityTypes.filter(t => t !== 'concept').map(t => {
                  const c = TYPE_COLORS[t] ?? DEFAULT_COLOR
                  const active = typeFilter === t
                  return (
                    <button key={t} onClick={() => setTypeFilter(t)} style={{
                      padding: '5px 14px', borderRadius: 20, fontSize: '0.78rem', cursor: 'pointer',
                      border: `1px solid ${active ? c : c + '50'}`,
                      backgroundColor: active ? c + '28' : 'var(--bg-secondary)',
                      color: active ? c : 'var(--text-secondary)',
                      fontWeight: active ? 700 : 400,
                    }}>{TYPE_ICONS[t]} {t}</button>
                  )
                })}
              </div>
            )}

            {loadingEntities ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', padding: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <Skeleton w={40} h={16} /><Skeleton w="70%" h={20} /><Skeleton h={13} /><Skeleton w="85%" h={13} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEntities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔍</div>
                <p>No personalities found for "{query}"</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {filteredEntities.map(e => (
                  <EntityCard key={e.id} entity={e} onClick={() => router.push(`/ai/entities/${e.id}`)} />
                ))}
              </div>
            )}
          </div>

          {/* ── Divider ────────────────────────────────────────────────── */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />

          {/* ── Concepts ───────────────────────────────────────────────── */}
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <SectionTitle count={isSearching ? filteredConcepts.length : conceptTotal}>
                {isSearching ? `Concepts matching "${query}"` : 'Concepts & Teachings'}
              </SectionTitle>
              {!isSearching && conceptTotal > GRID_LIMIT && (
                <button onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('ai_initial_concepts', JSON.stringify({ items: concepts, total: conceptTotal }))
                    router.push('/ai/concepts')
                  }
                }} style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  See all {conceptTotal.toLocaleString()} →
                </button>
              )}
            </div>

            {loadingConcepts ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', padding: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <Skeleton w={40} h={16} /><Skeleton w="70%" h={20} /><Skeleton h={13} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConcepts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>💡</div>
                <p>No concepts found for "{query}"</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {filteredConcepts.map((c: any, i: number) => (
                  <ConceptCard
                    key={i}
                    concept={c}
                    onClick={() => c.entity_id
                      ? router.push(`/ai/entities/${c.entity_id}`)
                      : router.push(`/ai/concepts/${encodeURIComponent(c.concept)}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Divider ────────────────────────────────────────────────── */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />

          {/* ── Relationship Graph ──────────────────────────────────────── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <SectionTitle>Family Relationship Graph</SectionTitle>
              <button
                onClick={() => setShowGraph(x => !x)}
                style={{
                  padding: '8px 20px', borderRadius: 24, cursor: 'pointer',
                  border: '1px solid var(--accent)50',
                  backgroundColor: showGraph ? 'var(--accent)' : 'transparent',
                  color: showGraph ? '#fff' : 'var(--accent)',
                  fontSize: '0.82rem', fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {showGraph ? 'Hide graph' : 'Show graph'}
              </button>
            </div>

            {!showGraph && (
              <div style={{
                borderRadius: 14, border: '1px dashed var(--border)',
                padding: '32px 24px', textAlign: 'center',
                backgroundColor: 'var(--bg-secondary)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🕸️</div>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                  An interactive force graph of family relationships between personalities.
                </p>
                <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: '0.8rem' }}>
                  Click "Show graph" to load it. Zoom, drag, and click nodes to open profiles.
                </p>
              </div>
            )}

            {showGraph && (
              loadingGraph ? (
                <div style={{ height: 600, borderRadius: 14, backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>Loading graph…</p>
                </div>
              ) : !graphData || graphData.nodes.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No graph data yet — run the extraction pipeline first.</p>
              ) : (
                <div>
                  <svg ref={svgRef} style={{ width: '100%', height: 600, borderRadius: 14, backgroundColor: 'var(--bg-secondary)', display: 'block' }} />
                  <p style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Scroll to zoom · drag to reposition · click a node to open that personality's profile
                  </p>
                </div>
              )
            )}
          </div>

        </div>
      </section>
    </main>
  )
}

export default function AIPage() {
  return (
    <Suspense>
      <AIPageInner />
    </Suspense>
  )
}

