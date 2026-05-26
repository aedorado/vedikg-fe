'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import SiteNav from '../components/SiteNav'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function CharactersPage() {
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'count' | 'name' | 'name-desc'>('count')
  const [mCantos, setMCantos] = useState<Set<number>>(new Set())
  const [book, setBook] = useState<'all' | 'SB' | 'CC'>('all')

  useEffect(() => {
    const url = book === 'all' ? `${API_BASE}/api/entities?type=person` : `${API_BASE}/api/entities?type=person&book=${book}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => { setEntities(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const allCantos = useMemo(() => {
    const s = new Set<number>()
    entities.forEach(e => e.cantos?.forEach((c: number) => s.add(c)))
    return Array.from(s).sort((a, b) => a - b)
  }, [entities])

  const filtered = useMemo(() => {
    const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    let list = entities
    if (search.trim()) list = list.filter(e => norm(e.name).includes(norm(search)))
    if (mCantos.size > 0) list = list.filter(e => e.cantos?.some((c: number) => mCantos.has(c)))
    
    if (sortBy === 'count') list = [...list].sort((a, b) => (b.verse_count || 0) - (a.verse_count || 0))
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    else if (sortBy === 'name-desc') list = [...list].sort((a, b) => b.name.localeCompare(a.name))
    
    return list
  }, [entities, search, sortBy, mCantos])

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <SiteNav />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="heading-serif mb-2">Characters</h1>
        <div className="flex items-center gap-3 mb-6">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{entities.length} characters</p>
          <div className="flex rounded overflow-hidden border text-xs ml-auto" style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)' }}>
            {(['all', 'SB', 'CC'] as const).map(b => (
              <button key={b} onClick={() => setBook(b)}
                className="px-3 py-1.5 transition"
                style={{ backgroundColor: book === b ? 'color-mix(in srgb, var(--border-gold) 25%, transparent)' : 'var(--bg-card)', color: book === b ? 'var(--gold)' : 'var(--text-muted)' }}>
                {b === 'all' ? 'All' : b}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search + Sort */}
          <div className="flex flex-wrap gap-3">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="text-sm px-3 py-1.5 rounded border outline-none"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-primary)', minWidth: 160 }}
            />
            <div className="flex rounded overflow-hidden border text-xs" style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)' }}>
              {(['count', 'name', 'name-desc'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className="px-3 py-1.5 transition"
                  style={{ backgroundColor: sortBy === s ? 'color-mix(in srgb, var(--border-gold) 25%, transparent)' : 'var(--bg-card)', color: sortBy === s ? 'var(--gold)' : 'var(--text-muted)' }}>
                  {s === 'count' ? 'Most verses' : s === 'name' ? 'A–Z' : 'Z–A'}
                </button>
              ))}
            </div>
            {(search || mCantos.size > 0) && (
              <button onClick={() => { setSearch(''); setMCantos(new Set()) }}
                className="text-xs px-3 py-1.5 rounded border"
                style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-muted)' }}>
                Clear
              </button>
            )}
            <span className="text-xs self-center ml-auto" style={{ color: 'var(--text-muted)' }}>{filtered.length} shown</span>
          </div>

          {/* Multi-select Cantos */}
          {allCantos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allCantos.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    const newSet = new Set(mCantos)
                    if (newSet.has(c)) newSet.delete(c)
                    else newSet.add(c)
                    setMCantos(newSet)
                  }}
                  className="text-xs px-2 py-1 rounded border transition"
                  style={{
                    backgroundColor: mCantos.has(c) ? 'color-mix(in srgb, var(--border-gold) 25%, transparent)' : 'var(--bg-card)',
                    borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)',
                    color: mCantos.has(c) ? 'var(--gold)' : 'var(--text-muted)'
                  }}>
                  C{c}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading characters…</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((entity) => (
              <motion.div key={entity.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.03 }}>
                <Link href={`/characters/${entity.id}`}>
                  <div className="verse-card cursor-pointer text-center p-4">
                    <div className="text-2xl mb-2">👤</div>
                    <p className="font-serif text-sm mb-1" style={{ color: 'var(--text-parchment)' }}>{entity.name}</p>
                    <p className="text-xs mb-1" style={{ color: 'var(--gold)' }}>{entity.entity_type}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {entity.verse_count} verse{entity.verse_count !== 1 ? 's' : ''}
                      {entity.cantos?.length > 0 && ` · C${entity.cantos.join(',')}`}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
