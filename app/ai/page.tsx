'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import SiteNav from '../components/SiteNav'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const TYPE_COLORS: Record<string, string> = {
  person:   '#d4af37',
  deva:     '#7ec8b0',
  demon:    '#e07b5a',
  sage:     '#b0c4de',
  place:    '#90ee90',
  river:    '#4dd',
  mountain: '#aaa',
  kingdom:  '#c87ec8',
  dynasty:  '#e09a5a',
  concept:  '#888',
  object:   '#ccc',
  text:     '#f0e68c',
  animal:   '#cd853f',
}
const DEFAULT_COLOR = '#888'

// ─── small badge helper ────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? DEFAULT_COLOR
  return (
    <span
      style={{
        backgroundColor: color + '30',
        border: `1px solid ${color}`,
        color,
        fontSize: '0.65rem',
        padding: '1px 6px',
        borderRadius: 4,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {type}
    </span>
  )
}

// ─── tabs ──────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'entities' | 'relationships' | 'graph'

export default function AIInsightsPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [progress, setProgress] = useState<any>(null)
  const [entities, setEntities] = useState<any[]>([])
  const [relationships, setRelationships] = useState<any[]>([])
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // ── data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/api/ai/progress`)
      .then(r => r.json())
      .then(setProgress)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (tab === 'entities' && entities.length === 0) {
      setLoading(true)
      fetch(`${API_BASE}/api/ai/entities`)
        .then(r => r.json())
        .then(d => { setEntities(d); setLoading(false) })
        .catch(() => setLoading(false))
    }
    if (tab === 'relationships' && relationships.length === 0) {
      setLoading(true)
      fetch(`${API_BASE}/api/ai/relationships`)
        .then(r => r.json())
        .then(d => { setRelationships(d); setLoading(false) })
        .catch(() => setLoading(false))
    }
    if (tab === 'graph' && !graphData) {
      setLoading(true)
      fetch(`${API_BASE}/api/ai/graph`)
        .then(r => r.json())
        .then(d => { setGraphData(d); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [tab])

  // ── entity detail on click ────────────────────────────────────────────────
  function openEntity(id: number) {
    fetch(`${API_BASE}/api/ai/entities/${id}`)
      .then(r => r.json())
      .then(setSelectedEntity)
  }

  // ── filtered lists ────────────────────────────────────────────────────────
  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const filteredEntities = useMemo(() => {
    let list = entities
    if (search.trim()) list = list.filter(e => norm(e.name).includes(norm(search)))
    if (typeFilter)    list = list.filter(e => e.type === typeFilter)
    return list
  }, [entities, search, typeFilter])

  const filteredRels = useMemo(() => {
    if (!search.trim()) return relationships
    return relationships.filter(
      r => norm(r.source).includes(norm(search)) || norm(r.target).includes(norm(search))
    )
  }, [relationships, search])

  const entityTypes = useMemo(() =>
    [...new Set(entities.map(e => e.type).filter(Boolean))].sort()
  , [entities])

  // ── D3 graph ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tab !== 'graph' || !graphData || !svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const W = svgRef.current.clientWidth || 800
    const H = svgRef.current.clientHeight || 600

    const g = svg.append('g')
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 5])
        .on('zoom', e => g.attr('transform', e.transform))
    )

    const nodes = graphData.nodes.map(n => ({ ...n }))
    const edges = graphData.edges.map(e => ({ ...e }))

    const sim = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(edges as any).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(18))

    const link = g.append('g').selectAll('line')
      .data(edges).enter().append('line')
      .attr('stroke', '#555').attr('stroke-width', 1).attr('stroke-opacity', 0.5)

    const node = g.append('g').selectAll('circle')
      .data(nodes).enter().append('circle')
      .attr('r', (d: any) => Math.max(6, Math.min(20, 4 + (d.verse_count || 0) * 0.5)))
      .attr('fill', (d: any) => TYPE_COLORS[d.type] ?? DEFAULT_COLOR)
      .attr('stroke', '#fff').attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('click', (_e, d: any) => openEntity(d.id))
      .call(
        d3.drag<SVGCircleElement, any>()
          .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
          .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y })
          .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )

    const label = g.append('g').selectAll('text')
      .data(nodes.filter((d: any) => (d.verse_count || 0) >= 2))
      .enter().append('text')
      .text((d: any) => d.name)
      .attr('font-size', 9)
      .attr('fill', 'var(--text-primary)')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => -Math.max(8, Math.min(22, 4 + (d.verse_count || 0) * 0.5)) - 2)

    sim.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
      label.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y)
    })

    return () => { sim.stop() }
  }, [tab, graphData])

  // ── styles ────────────────────────────────────────────────────────────────
  const tabStyle = (active: boolean) => ({
    padding: '6px 18px',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    backgroundColor: active ? 'var(--accent)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    border: 'none',
    fontSize: '0.85rem',
    transition: 'all 0.15s',
  } as React.CSSProperties)

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <SiteNav />

      <section className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <h1 className="heading-serif mb-1" style={{ fontSize: '2rem' }}>AI Insights</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
          Entities and relationships inferred by Gemini — kept separate from hand-scraped data.
        </p>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, padding: '4px', backgroundColor: 'var(--bg-secondary)', borderRadius: 6, width: 'fit-content' }}>
          {(['overview', 'entities', 'relationships', 'graph'] as Tab[]).map(t => (
            <button key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div>
            {!progress ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            ) : (
              <>
                {/* KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                  {[
                    { label: 'AI Entities', value: progress.total_entities },
                    { label: 'Relationships', value: progress.total_relationships },
                    { label: 'Verses Covered', value: progress.verses_covered },
                  ].map(kpi => (
                    <div key={kpi.label} style={{ padding: 20, borderRadius: 8, backgroundColor: 'var(--bg-secondary)', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700 }}>{kpi.value?.toLocaleString()}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 4 }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>

                {/* Per-book progress */}
                {progress.by_book?.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Coverage by Text</h2>
                    {progress.by_book.map((b: any) => {
                      const pct = b.verses_total ? Math.round((b.verses_done / b.verses_total) * 100) : 0
                      return (
                        <div key={b.book} style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: '0.85rem' }}>{b.title} ({b.book})</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {b.verses_done.toLocaleString()} / {b.verses_total.toLocaleString()} verses ({pct}%)
                            </span>
                          </div>
                          <div style={{ height: 6, backgroundColor: 'var(--bg-secondary)', borderRadius: 3 }}>
                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent)', borderRadius: 3, transition: 'width 0.4s' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Entity type breakdown */}
                {progress.entities_by_type?.length > 0 && (
                  <div>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Entities by Type</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {progress.entities_by_type.map((r: any) => (
                        <div key={r.type} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 14px', borderRadius: 6,
                          backgroundColor: (TYPE_COLORS[r.type] ?? DEFAULT_COLOR) + '20',
                          border: `1px solid ${TYPE_COLORS[r.type] ?? DEFAULT_COLOR}40`,
                        }}>
                          <span style={{ color: TYPE_COLORS[r.type] ?? DEFAULT_COLOR, fontWeight: 600 }}>{r.count}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── ENTITIES ──────────────────────────────────────────────────── */}
        {tab === 'entities' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <input
                placeholder="Search entities…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', flex: '1 1 200px' }}
              />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <option value="">All types</option>
                {entityTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
            ) : filteredEntities.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No AI entities extracted yet. Run the extraction pipeline first.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {filteredEntities.map(e => (
                  <div
                    key={e.id}
                    onClick={() => openEntity(e.id)}
                    style={{
                      padding: 14, borderRadius: 8, cursor: 'pointer',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={el => (el.currentTarget.style.borderColor = 'var(--accent)')}
                    onMouseLeave={el => (el.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{e.name}</span>
                      <TypeBadge type={e.type} />
                    </div>
                    {e.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {e.description}
                      </p>
                    )}
                    <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {e.verse_count} verse{e.verse_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RELATIONSHIPS ──────────────────────────────────────────────── */}
        {tab === 'relationships' && (
          <div>
            <input
              placeholder="Filter by name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '100%', maxWidth: 360, marginBottom: 18 }}
            />

            {loading ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
            ) : filteredRels.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No relationships extracted yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '6px 10px' }}>Source</th>
                    <th style={{ padding: '6px 10px' }}>Relationship</th>
                    <th style={{ padding: '6px 10px' }}>Target</th>
                    <th style={{ padding: '6px 10px', maxWidth: 280 }}>Context</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRels.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <TypeBadge type={r.source_type} />
                          {r.source}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                        {r.type.replace(/_/g, ' ')}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <TypeBadge type={r.target_type} />
                          {r.target}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.context}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── GRAPH ─────────────────────────────────────────────────────── */}
        {tab === 'graph' && (
          <div>
            {loading ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading graph…</p>
            ) : !graphData || graphData.nodes.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No graph data yet. Run the extraction pipeline to populate AI entities.</p>
            ) : (
              <div style={{ position: 'relative' }}>
                <svg
                  ref={svgRef}
                  style={{ width: '100%', height: 600, borderRadius: 8, backgroundColor: 'var(--bg-secondary)' }}
                />
                <p style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Scroll to zoom · drag nodes · click to view entity detail
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Entity Detail Drawer ─────────────────────────────────────────── */}
      {selectedEntity && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
          }}
          onClick={() => setSelectedEntity(null)}
        >
          <div
            style={{
              width: '100%', maxWidth: 460, height: '90vh',
              backgroundColor: 'var(--bg-primary)', borderRadius: '12px 0 0 12px',
              padding: 24, overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', marginBottom: 6 }}>{selectedEntity.name}</h2>
                <TypeBadge type={selectedEntity.type} />
              </div>
              <button onClick={() => setSelectedEntity(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>✕</button>
            </div>

            {selectedEntity.description && (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                {selectedEntity.description}
              </p>
            )}

            {(selectedEntity.relationships_out?.length > 0 || selectedEntity.relationships_in?.length > 0) && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: 8 }}>Relationships</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedEntity.relationships_out.map((r: any, i: number) => (
                    <div key={`out-${i}`} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', minWidth: 120 }}>{r.type.replace(/_/g, ' ')}</span>
                      <span>{r.target}</span>
                    </div>
                  ))}
                  {selectedEntity.relationships_in.map((r: any, i: number) => (
                    <div key={`in-${i}`} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--text-secondary)', minWidth: 120 }}>{r.type.replace(/_/g, ' ')} ← </span>
                      <span>{r.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedEntity.verses?.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.9rem', marginBottom: 8 }}>Appears in {selectedEntity.verses.length} verse{selectedEntity.verses.length !== 1 ? 's' : ''}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedEntity.verses.map((v: any, i: number) => (
                    <div key={i} style={{ padding: '6px 10px', borderRadius: 6, backgroundColor: 'var(--bg-secondary)', fontSize: '0.82rem' }}>
                      <div style={{ color: 'var(--accent)', marginBottom: 2 }}>{v.reference}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{v.roman || v.devanagari}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
