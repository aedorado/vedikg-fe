'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

import type { Chanda, ChandasListResponse } from '@/lib/api-types'
import { safeApiCall, safeArray } from '@/lib/api-safe'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ChandasPage() {
  const [chandas, setChandas] = useState<Chanda[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'count' | 'name' | 'name-desc'>('count')
  const [bookFilter, setBookFilter] = useState('sb')

  useEffect(() => {
    setLoading(true)
    const query = new URLSearchParams()
    query.append('limit', '1000')
    if (bookFilter) query.append('book', bookFilter)
    
    safeApiCall<ChandasListResponse>(
      `${API_BASE}/api/chandas?${query.toString()}`,
      { total: 0, skip: 0, limit: 1000, chandas: [] }
    ).then((data) => {
      setChandas(safeArray(data.chandas ?? []))
      setLoading(false)
    })
  }, [bookFilter])

  const filtered = useMemo(() => {
    const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    let list = chandas
    if (search.trim()) list = list.filter(c => norm(c.name).includes(norm(search)))

    if (sortBy === 'count') list = [...list].sort((a, b) => (b.verse_count || 0) - (a.verse_count || 0))
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    else if (sortBy === 'name-desc') list = [...list].sort((a, b) => b.name.localeCompare(a.name))

    return list
  }, [chandas, search, sortBy])

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      

      <section style={{ maxWidth: '64rem', margin: '0 auto', padding: '3rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'serif', marginBottom: '0.5rem', color: 'var(--gold)' }}>Sanskrit Meters</h1>
        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          {chandas.length} meters found
        </p>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {/* Search + Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meters…"
              style={{
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid',
                borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none',
                minWidth: '160px'
              }}
            />
            <div style={{ display: 'flex', borderRadius: '0.375rem', overflow: 'hidden', border: '1px solid color-mix(in srgb, var(--border-gold) 30%, transparent)', fontSize: '0.75rem' }}>
              {(['count', 'name', 'name-desc'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: sortBy === s ? 'color-mix(in srgb, var(--border-gold) 25%, transparent)' : 'var(--bg-card)',
                    color: sortBy === s ? 'var(--gold)' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {s === 'count' ? 'Most verses' : s === 'name' ? 'A–Z' : 'Z–A'}
                </button>
              ))}
            </div>
            <select
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              style={{
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid color-mix(in srgb, var(--border-gold) 30%, transparent)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              <option value="sb">Bhāgavatam</option>
              <option value="cc">Caitanya-caritāmṛta</option>
              <option value="">All books</option>
            </select>
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid color-mix(in srgb, var(--border-gold) 30%, transparent)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
            <span style={{ fontSize: '0.75rem', marginLeft: 'auto', color: 'var(--text-muted)' }}>
              {filtered.length} shown
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>Loading meters...</div>
        ) : (
          <motion.div style={{ display: 'grid', gap: '1rem' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.05 }}>
            {filtered.map((chanda, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Link href={`/chandas/${encodeURIComponent(chanda.name)}`}>
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '0.375rem',
                      border: '1px solid',
                      borderColor: 'color-mix(in srgb, var(--border-gold) 20%, transparent)',
                      backgroundColor: 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'color-mix(in srgb, var(--border-gold) 50%, transparent)'
                      el.style.backgroundColor = 'color-mix(in srgb, var(--bg-card) 50%, var(--border-gold))'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'color-mix(in srgb, var(--border-gold) 20%, transparent)'
                      el.style.backgroundColor = 'var(--bg-card)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: 'var(--gold)', fontSize: '1.1em', fontWeight: 500, marginBottom: '0.25rem' }}>
                        {chanda.name}
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
                        {chanda.verse_count} verse{chanda.verse_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--border-gold) 15%, transparent)',
                        color: 'var(--gold)',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.9em',
                        fontWeight: 500
                      }}
                    >
                      {chanda.verse_count}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </main>
  )
}
