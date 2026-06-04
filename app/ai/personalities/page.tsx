'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PAGE_SIZE = 50

const TYPE_COLORS: Record<string, string> = {
  person: '#d4af37', deva: '#7ec8b0', demon: '#e07b5a', sage: '#b0c4de',
  place: '#90ee90', river: '#4dd0e1', mountain: '#9e9e9e', kingdom: '#c87ec8',
  dynasty: '#e09a5a', concept: '#888', object: '#bbb', text: '#f0e68c', animal: '#cd853f',
}
const TYPE_ICONS: Record<string, string> = {
  person: '👤', deva: '✨', demon: '👹', sage: '🧘', place: '🏛️',
  river: '🌊', mountain: '⛰️', kingdom: '👑', dynasty: '🏰',
  concept: '💡', object: '🪔', text: '📜', animal: '🦁',
}

function EntityCard({ entity, onClick }: { entity: any; onClick: () => void }) {
  const c = TYPE_COLORS[entity.entity_type] ?? '#888'
  const icon = TYPE_ICONS[entity.entity_type] ?? '•'
  return (
    <div onClick={onClick} style={{
      borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
      border: `1px solid ${c}28`, backgroundColor: 'var(--bg-secondary)',
      transition: 'transform 0.18s, box-shadow 0.18s', display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${c}30` }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${c}, ${c}88)` }} />
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{icon}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', backgroundColor: c + '14', padding: '2px 8px', borderRadius: 10 }}>
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
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {entity.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default function PersonalitiesPage() {
  const router = useRouter()

  // Refs that survive strict-mode double-invoke (never reset between runs)
  const cacheUsedRef = useRef(false)
  const prevTypeFilterRef = useRef('')   // tracks actual previous value of typeFilter
  const prevDebSearchRef = useRef('')    // tracks actual previous value of debouncedSearch

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [entities, setEntities] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Debounce search — only update debouncedSearch, do NOT clear entities here
  useEffect(() => {
    const t = setTimeout(() => {
      if (search) cacheUsedRef.current = false // user is searching → invalidate cache guard
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  // Main data effect — single source of truth for fetching
  useEffect(() => {
    const searchChanged = debouncedSearch !== prevDebSearchRef.current
    const filterChanged = typeFilter !== prevTypeFilterRef.current
    prevDebSearchRef.current = debouncedSearch
    prevTypeFilterRef.current = typeFilter

    // If cache was used and nothing actually changed, just stop loading and bail
    if (cacheUsedRef.current && !debouncedSearch && !typeFilter && !searchChanged && !filterChanged) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Clear entities when search or filter actually changed (not on first-ever mount)
    if (searchChanged || filterChanged) {
      setEntities([])
      setOffset(0)
    }

    // On first load with no filters, try sessionStorage cache
    if (!cacheUsedRef.current && !debouncedSearch && !typeFilter) {
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('ai_initial_entities') : null
      if (raw) {
        try {
          const cached = JSON.parse(raw)
          const items = Array.isArray(cached) ? cached : cached.items
          const tot = Array.isArray(cached) ? cached.length + 10 : cached.total
          setEntities(items)
          setTotal(tot)
          setLoading(false)
          cacheUsedRef.current = true
          sessionStorage.removeItem('ai_initial_entities')
          return
        } catch (e) {}
      }
    }

    // Regular API fetch
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: '0' })
    if (debouncedSearch) params.append('search', debouncedSearch)
    if (typeFilter) params.append('type', typeFilter)
    fetch(`${API_BASE}/api/ai/personalities?${params}`)
      .then(r => r.json())
      .then(d => { setEntities(d.items ?? []); setTotal(d.total ?? 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [debouncedSearch, typeFilter])

  const loadMore = useCallback(() => {
    const nextOffset = offset + PAGE_SIZE
    setLoadingMore(true)
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(nextOffset) })
    if (debouncedSearch) params.append('search', debouncedSearch)
    if (typeFilter) params.append('type', typeFilter)
    fetch(`${API_BASE}/api/ai/personalities?${params}`)
      .then(r => r.json())
      .then(d => { setEntities(prev => [...prev, ...(d.items ?? [])]); setOffset(nextOffset); setLoadingMore(false) })
      .catch(() => setLoadingMore(false))
  }, [offset, debouncedSearch, typeFilter])

  const hasMore = entities.length < total
  const entityTypes = ['person', 'deva', 'sage', 'demon', 'place', 'kingdom', 'text', 'concept', 'object', 'animal']

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ background: 'linear-gradient(160deg, var(--accent)14 0%, transparent 50%)', borderBottom: '1px solid var(--border)40', padding: '44px 0 36px' }}>
        <section className="max-w-5xl mx-auto px-4">
          <Link href="/ai" style={{ color: 'var(--accent)', opacity: 0.75, fontSize: '0.8rem', textDecoration: 'none' }}>← Knowledge Graph</Link>
          <h1 className="heading-serif" style={{ fontSize: '2.4rem', marginTop: 12, marginBottom: 10, lineHeight: 1.1 }}>
            Personalities
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
            {total.toLocaleString()} personalities across the scriptures
          </p>
          <div style={{ position: 'relative', maxWidth: 480 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input
              autoFocus
              placeholder="Search Krishna, Arjuna, Vyasa…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 40px', borderRadius: 12, fontSize: '0.95rem',
                border: '2px solid var(--accent)40', backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--accent)40')}
            />
          </div>
        </section>
      </div>

      <section className="max-w-5xl mx-auto px-4 py-8">
        {/* Type filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setTypeFilter('')} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: '0.78rem', cursor: 'pointer',
            border: `1px solid ${!typeFilter ? 'var(--accent)' : 'var(--border)'}`,
            backgroundColor: !typeFilter ? 'var(--accent)' : 'var(--bg-secondary)',
            color: !typeFilter ? '#fff' : 'var(--text-secondary)', fontWeight: !typeFilter ? 700 : 400,
          }}>All</button>
          {entityTypes.map(t => {
            const c = TYPE_COLORS[t] ?? '#888'
            const active = typeFilter === t
            return (
              <button key={t} onClick={() => setTypeFilter(active ? '' : t)} style={{
                padding: '5px 14px', borderRadius: 20, fontSize: '0.78rem', cursor: 'pointer',
                border: `1px solid ${active ? c : c + '50'}`,
                backgroundColor: active ? c + '28' : 'var(--bg-secondary)',
                color: active ? c : 'var(--text-secondary)', fontWeight: active ? 700 : 400,
              }}>{TYPE_ICONS[t]} {t}</button>
            )
          })}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 14, height: 140, backgroundColor: 'var(--bg-secondary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : entities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔍</div>
            <p>No personalities found{search ? ` for "${search}"` : ''}.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {entities.map(e => (
                <EntityCard key={e.id} entity={e} onClick={() => router.push(`/ai/entities/${e.id}`)} />
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button onClick={loadMore} disabled={loadingMore} style={{
                  padding: '10px 28px', borderRadius: 24, cursor: loadingMore ? 'default' : 'pointer',
                  border: '1px solid var(--accent)50', backgroundColor: 'transparent',
                  color: 'var(--accent)', fontSize: '0.88rem', fontWeight: 600, opacity: loadingMore ? 0.6 : 1,
                }}>
                  {loadingMore ? 'Loading…' : `Load more (${total - entities.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </main>
  )
}
