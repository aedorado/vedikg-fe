'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import SiteNav from '../components/SiteNav'
import type { Entity } from '@/lib/api-types'
import { safeApiCall, safeArray } from '@/lib/api-safe'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const TYPE_ICON: Record<string, string> = {
  place: '🏛️',
  river: '🌊',
}

const TYPE_LABEL: Record<string, string> = {
  place: 'Place',
  river: 'River',
}

export default function PlacesPage() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'count'>('name')
  const [typeFilter, setTypeFilter] = useState('')
  const [cantoFilter, setCantoFilter] = useState<number | null>(null)
  const [bookFilter, setBookFilter] = useState('sb')

  useEffect(() => {
    setLoading(true)
    const query = new URLSearchParams()
    query.append('type', 'place,river')
    if (bookFilter) query.append('book', bookFilter)
    
    safeApiCall<Entity[]>(
      `${API_BASE}/api/entities?${query.toString()}`,
      []
    ).then(data => {
      setEntities(safeArray(data))
      setLoading(false)
    })
  }, [bookFilter])

  const allCantos = useMemo(() => {
    const s = new Set<number>()
    entities.forEach(e => e.cantos?.forEach((c: number) => s.add(c)))
    return Array.from(s).sort((a, b) => a - b)
  }, [entities])

  const filtered = useMemo(() => {
    const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    let list = entities
    if (search.trim()) list = list.filter(e => norm(e.name).includes(norm(search)))
    if (typeFilter) list = list.filter(e => e.entity_type === typeFilter)
    if (cantoFilter !== null) list = list.filter(e => e.cantos?.includes(cantoFilter))
    if (sortBy === 'count') list = [...list].sort((a, b) => (b.verse_count || 0) - (a.verse_count || 0))
    return list
  }, [entities, search, typeFilter, sortBy, cantoFilter])

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <SiteNav />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="heading-serif mb-2">Sacred Places</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          {entities.length} places & rivers mentioned in the Bhāgavatam verses
        </p>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="text-sm px-3 py-1.5 rounded border outline-none"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-primary)', minWidth: 160 }}
          />
          <div className="flex rounded overflow-hidden border text-xs" style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)' }}>
            {(['name', 'count'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className="px-3 py-1.5 transition"
                style={{ backgroundColor: sortBy === s ? 'color-mix(in srgb, var(--border-gold) 25%, transparent)' : 'var(--bg-card)', color: sortBy === s ? 'var(--gold)' : 'var(--text-muted)' }}>
                {s === 'name' ? 'A–Z' : 'Most verses'}
              </button>
            ))}
          </div>
          <select
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded border outline-none"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-primary)' }}
          >
            <option value="">All types</option>
            <option value="place">Places</option>
            <option value="river">Rivers</option>
          </select>
          <select
            value={bookFilter} onChange={e => setBookFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded border outline-none"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-primary)' }}
          >
            <option value="sb">Bhāgavatam</option>
            <option value="cc">Caitanya-caritāmṛta</option>
            <option value="">All books</option>
          </select>
          {allCantos.length > 0 && (
            <select
              value={cantoFilter ?? ''}
              onChange={e => setCantoFilter(e.target.value === '' ? null : Number(e.target.value))}
              className="text-sm px-3 py-1.5 rounded border outline-none"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-primary)' }}
            >
              <option value="">All cantos</option>
              {allCantos.map(c => <option key={c} value={c}>Canto {c}</option>)}
            </select>
          )}
          {(search || typeFilter || cantoFilter !== null) && (
            <button onClick={() => { setSearch(''); setTypeFilter(''); setCantoFilter(null); setBookFilter('sb') }}
              className="text-xs px-3 py-1.5 rounded border"
              style={{ borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)', color: 'var(--text-muted)' }}>
              Clear
            </button>
          )}
          <span className="text-xs self-center ml-auto" style={{ color: 'var(--text-muted)' }}>{filtered.length} shown</span>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading places…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No places found. Scrape more chapters to populate.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(entity => (
              <motion.div key={entity.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.03 }}>
                <Link href={`/characters/${entity.id}`}>
                  <div className="verse-card cursor-pointer text-center p-4">
                    <div className="text-2xl mb-2">{TYPE_ICON[entity.entity_type] ?? '📍'}</div>
                    <p className="font-serif text-sm mb-1" style={{ color: 'var(--text-parchment)' }}>{entity.name}</p>
                    <p className="text-xs mb-1" style={{ color: 'var(--gold)' }}>{TYPE_LABEL[entity.entity_type] ?? entity.entity_type}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {entity.verse_count} verse{entity.verse_count !== 1 ? 's' : ''}
                      {entity.cantos && entity.cantos.length > 0 && ` · C${entity.cantos.join(',')}`}
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
