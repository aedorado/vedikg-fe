'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useRouter } from 'next/navigation'

interface Node { id: string; label: string; type?: string }
interface Edge { source: string; target: string; label: string }

const REL_COLORS: Record<string, string> = {
  'father of': '#d4af37', 'mother of': '#e07b5a',
  'son of': '#c4820d',    'daughter of': '#e09a5a',
  'brother of': '#7ec8b0','sister of': '#7eafc8',
  'spouse of': '#b0b0ff', 'devotee of': '#88c87e',
}
const DEF_CLR = '#888'

export default function RelationshipGraph({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!svgRef.current) return
    const el = svgRef.current
    const W = el.clientWidth || 600
    const H = el.clientHeight || 380
    d3.select(el).selectAll('*').remove()

    if (!nodes.length) return

    const svg = d3.select(el)
    const g = svg.append('g')
    svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 4]).on('zoom', e => g.attr('transform', e.transform)))

    const ns = nodes.map(n => ({ ...n }))
    const es = edges.map(e => ({ ...e }))

    // Arrow markers per colour
    const usedColors = [...new Set(es.map((e: any) => REL_COLORS[e.label] || DEF_CLR))]
    const defs = svg.append('defs')
    usedColors.forEach(c => {
      defs.append('marker').attr('id', `a${c.slice(1)}`).attr('viewBox', '0 -5 10 10')
        .attr('refX', 22).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', c)
    })

    const sim = d3.forceSimulation(ns as any)
      .force('link', d3.forceLink(es as any).id((d: any) => d.id).distance(110).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collide', d3.forceCollide(38))

    const link = g.append('g').selectAll('line').data(es).join('line')
      .attr('stroke', (d: any) => REL_COLORS[d.label] || DEF_CLR)
      .attr('stroke-width', 1.5).attr('stroke-opacity', 0.7)
      .attr('marker-end', (d: any) => `url(#a${(REL_COLORS[d.label] || DEF_CLR).slice(1)})`)

    const lbl = g.append('g').selectAll('text').data(es).join('text')
      .attr('font-size', 8).attr('text-anchor', 'middle').attr('opacity', 0.85)
      .attr('fill', (d: any) => REL_COLORS[d.label] || DEF_CLR)
      .text((d: any) => d.label)

    const node = g.append('g').selectAll('g').data(ns).join('g').attr('cursor', 'pointer')
      .call((d3.drag<SVGGElement, any>()
        .on('start', (e: any, d: any) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag',  (e: any, d: any) => { d.fx = e.x; d.fy = e.y })
        .on('end',   (e: any, d: any) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      ) as any)
      .on('click', (_e, d: any) => router.push(`/characters/${d.id}`))

    node.append('circle').attr('r', 18)
      .attr('fill', (d: any) => d.type === 'primary' ? 'var(--bg-card,#1a1510)' : 'var(--bg-primary,#0f0d0a)')
      .attr('stroke', (d: any) => d.type === 'primary' ? '#d4af37' : '#666')
      .attr('stroke-width', (d: any) => d.type === 'primary' ? 2.5 : 1.5)

    node.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('font-size', 9)
      .attr('fill', (d: any) => d.type === 'primary' ? '#d4af37' : '#f4e8d8')
      .attr('pointer-events', 'none')
      .text((d: any) => d.label.length > 13 ? d.label.slice(0, 12) + '…' : d.label)

    sim.on('tick', () => {
      link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
      lbl.attr('x', (d: any) => (d.source.x + d.target.x) / 2)
         .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 4)
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })
    return () => { sim.stop() }
  }, [nodes, edges, router])

  return <svg ref={svgRef} className="w-full h-full" />
}
