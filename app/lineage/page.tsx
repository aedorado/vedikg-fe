'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import SiteNav from '../components/SiteNav'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const REL_LABEL: Record<string, string> = {
  father_of: 'is father of',
  mother_of: 'is mother of',
  son_of: 'is son of',
  daughter_of: 'is daughter of',
  brother_of: 'is brother of',
  sister_of: 'is sister of',
  spouse_of: 'is spouse of',
  devotee_of: 'is devotee of',
  resident_of: 'is resident of',
  interacted_with: 'interacted with',
}

const REL_COLORS: Record<string, string> = {
  father_of: '#d4af37', mother_of: '#e07b5a',
  son_of: '#c4820d', daughter_of: '#e09a5a',
  brother_of: '#7ec8b0', sister_of: '#7eafc8',
  spouse_of: '#b0b0ff', devotee_of: '#88c87e',
  resident_of: '#c888c8', interacted_with: '#888',
}

export default function LineagePage() {
  const [rels, setRels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState<'source' | 'type'>('source')

  useEffect(() => {
    fetch(`${API_BASE}/api/entities/relationships/all`)
      .then(r => r.json())
      .then(d => { setRels(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const allTypes = useMemo(() => [...new Set(rels.map(r => r.type))].sort(), [rels])

  const filtered = useMemo(() => {
    const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    let list = rels
    if (search.trim()) {
      const q = norm(search)
      list = list.filter(r => norm(r.source).includes(q) || norm(r.target).includes(q))
    }
    if (typeFilter) list = list.filter(r => r.type === typeFilter)
    if (sortBy === 'source') list = [...list].sort((a, b) => a.source.localeCompare(b.source))
    if (sortBy === 'type') list = [...list].sort((a, b) => a.type.localeCompare(b.type) || a.source.localeCompare(b.source))
    return list
  }, [rels, search, typeFilter, sortBy])

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <SiteNav />

      <section className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="heading-serif mb-2">Lineage & Relationships</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {rels.length} relationships extracted from the Bhāgavatam
        </p>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search character…"
            className="text-sm px-3 py-1.5 rounded border outline-none"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-primary)', minWidth: 180 }}
          />
          <select
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded border outline-none"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-primary)' }}
          >
            <option value="">All types</option>
            {allTypes.map(t => <option key={t} value={t}>{REL_LABEL[t] ?? t.replace(/_/g, ' ')}</option>)}
          </select>
          <div className="flex rounded overflow-hidden border text-xs" style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)' }}>
            {(['source', 'type'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className="px-3 py-1.5 transition"
                style={{ backgroundColor: sortBy === s ? 'color-mix(in srgb, var(--border-gold) 25%, transparent)' : 'var(--bg-card)', color: sortBy === s ? 'var(--gold)' : 'var(--text-muted)' }}>
                {s === 'source' ? 'By name' : 'By type'}
              </button>
            ))}
          </div>
          <span className="text-xs self-center ml-auto" style={{ color: 'var(--text-muted)' }}>{filtered.length} shown</span>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No relationships found. Scrape some chapters first.
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map(r => (
              <div key={r.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded text-sm"
                style={{ backgroundColor: 'var(--bg-card)', borderLeft: `3px solid ${REL_COLORS[r.type] ?? '#888'}` }}
              >
                <Link href={`/characters/${r.source_id}`}
                  className="font-serif min-w-[140px] hover:underline"
                  style={{ color: 'var(--text-parchment)' }}>
                  {r.source}
                </Link>
                <span className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${REL_COLORS[r.type] ?? '#888'} 18%, transparent)`, color: REL_COLORS[r.type] ?? 'var(--text-muted)' }}>
                  {REL_LABEL[r.type] ?? r.type.replace(/_/g, ' ')}
                </span>
                <Link href={`/characters/${r.target_id}`}
                  className="font-serif flex-1 hover:underline"
                  style={{ color: 'var(--text-parchment)' }}>
                  {r.target}
                </Link>
                {r.verse_ref && (
                  <Link href={`/sb/${r.verse_ref.replace('SB ', '').replace(/\./g, '/')}`}
                    className="text-xs shrink-0 hover:underline"
                    style={{ color: 'var(--gold)' }}>
                    {r.verse_ref}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
