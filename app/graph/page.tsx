'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import SiteNav from '../components/SiteNav'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const REL_COLORS: Record<string, string> = {
  father_of: '#d4af37',
  son_of:    '#c4820d',
  mother_of: '#e07b5a',
  daughter_of: '#e09a5a',
  brother_of: '#7ec8b0',
  sister_of:  '#7eafc8',
  wife_of:    '#c87ec8',
  husband_of: '#7ec87e',
  spouse_of:  '#b0b0ff',
}
const DEFAULT_COLOR = '#888'

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] } | null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState<'verse' | 'all'>('verse')

  useEffect(() => {
    setLoading(true)
    setGraphData(null)
    fetch(`${API_BASE}/api/entities/graph/all?source=${source}`)
      .then(r => r.json())
      .then(d => { setGraphData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [source])

  useEffect(() => {
    if (!graphData || !svgRef.current) return
    const el = svgRef.current
    const W = el.clientWidth || 900
    const H = el.clientHeight || 650

    d3.select(el).selectAll('*').remove()

    const svg = d3.select(el)
    const g = svg.append('g')

    // Zoom + pan
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 4])
        .on('zoom', (e) => g.attr('transform', e.transform))
    )

    // Arrow markers per relationship type
    const types = [...new Set(graphData.edges.map((e: any) => e.type))]
    const defs = svg.append('defs')
    types.forEach(t => {
      defs.append('marker')
        .attr('id', `arrow-${t}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 22)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', REL_COLORS[t as string] || DEFAULT_COLOR)
    })

    const nodes = graphData.nodes.map(n => ({ ...n }))
    const edges = graphData.edges.map(e => ({ ...e }))

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d: any) => d.id).distance(120).strength(0.4))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(35))

    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', (d: any) => REL_COLORS[d.type] || DEFAULT_COLOR)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.7)
      .attr('marker-end', (d: any) => `url(#arrow-${d.type})`)

    const linkLabel = g.append('g')
      .selectAll('text')
      .data(edges)
      .join('text')
      .attr('font-size', 9)
      .attr('fill', (d: any) => REL_COLORS[d.type] || DEFAULT_COLOR)
      .attr('opacity', 0.8)
      .attr('text-anchor', 'middle')
      .text((d: any) => d.type.replace(/_/g, ' '))

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        (d3.drag<SVGGElement, any>()
          .on('start', (e: any, d: any) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
          .on('drag',  (e: any, d: any) => { d.fx = e.x; d.fy = e.y })
          .on('end',   (e: any, d: any) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
        ) as any
      )
      .on('click', (_e, d) => setSelected(d))

    node.append('circle')
      .attr('class', 'node-circle')
      .attr('r', 16)
      .attr('fill', '#1a1510')
      .attr('stroke', '#d4af37')
      .attr('stroke-width', 1.5)

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', 10)
      .attr('fill', '#f4e8d8')
      .text((d: any) => d.name.length > 12 ? d.name.slice(0, 11) + '…' : d.name)

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)
      linkLabel
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2)
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    return () => { simulation.stop() }
  }, [graphData])

  // Highlight selected node
  useEffect(() => {
    if (!svgRef.current) return
    d3.select(svgRef.current).selectAll<SVGCircleElement, any>('.node-circle')
      .attr('stroke', (d: any) => selected && d.id === selected.id ? '#ffffff' : 'var(--border-gold, #d4af37)')
      .attr('stroke-width', (d: any) => selected && d.id === selected.id ? 3 : 1.5)
  }, [selected, graphData])

  const filteredNodes = search.trim() && graphData
    ? graphData.nodes.filter(n => {
        const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        return norm(n.name).includes(norm(search))
      })
    : []

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <SiteNav />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r p-4 flex flex-col gap-4 overflow-y-auto" style={{
          borderColor: 'color-mix(in srgb, var(--border-gold) 20%, transparent)',
          backgroundColor: 'var(--bg-card)',
        }}>
          <h2 className="subheading-serif text-base">Relationship Graph</h2>
          <div className="flex rounded overflow-hidden border text-xs" style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)' }}>
            {(['verse', 'all'] as const).map(s => (
              <button key={s} onClick={() => setSource(s)}
                className="flex-1 py-1 px-2 transition"
                style={{
                  backgroundColor: source === s ? 'color-mix(in srgb, var(--border-gold) 25%, transparent)' : 'transparent',
                  color: source === s ? 'var(--gold)' : 'var(--text-muted)',
                }}>
                {s === 'verse' ? 'Verses only' : 'All mentions'}
              </button>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {graphData ? `${graphData.nodes.length} characters · ${graphData.edges.length} relationships` : 'Loading…'}
          </p>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search character…"
            className="text-sm px-3 py-1.5 rounded border outline-none w-full"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)',
              color: 'var(--text-primary)',
            }}
          />

          {filteredNodes.length > 0 && (
            <div className="space-y-0.5 max-h-48 overflow-y-auto -mt-2">
              {filteredNodes.map((n: any) => (
                <button
                  key={n.id}
                  onClick={() => { setSelected(n); setSearch('') }}
                  className="w-full text-left text-xs px-2 py-1 rounded"
                  style={{
                    color: 'var(--text-parchment)',
                    backgroundColor: selected?.id === n.id
                      ? 'color-mix(in srgb, var(--border-gold) 20%, transparent)'
                      : 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--border-gold) 15%, transparent)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = selected?.id === n.id ? 'color-mix(in srgb, var(--border-gold) 20%, transparent)' : 'transparent')}
                >
                  {n.name}
                </button>
              ))}
            </div>
          )}

          {/* Legend */}
          <div>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Relationship types</p>
            <div className="space-y-1">
              {Object.entries(REL_COLORS).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-0.5 shrink-0 rounded" style={{ backgroundColor: v, display: 'inline-block' }} />
                  <span style={{ color: 'var(--text-parchment)' }}>{k.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected node panel */}
          {selected && (
            <div className="verse-card mt-auto">
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Selected</p>
              <p className="font-serif text-sm mb-2" style={{ color: 'var(--gold)' }}>{selected.name}</p>
              <Link
                href={`/characters/${selected.id}`}
                className="text-xs px-3 py-1 rounded border block text-center transition"
                style={{ borderColor: 'var(--border-gold)', color: 'var(--gold)' }}
              >
                View Profile →
              </Link>
            </div>
          )}
        </aside>

        {/* Graph canvas */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--gold)' }}>
              Loading graph…
            </div>
          )}
          {graphData && graphData.nodes.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No relationships found. Scrape some chapters first.
            </div>
          )}
          <svg ref={svgRef} className="w-full h-full" style={{ minHeight: '80vh' }} />
        </div>
      </div>
    </main>
  )
}
