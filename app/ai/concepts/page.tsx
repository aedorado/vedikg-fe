'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PAGE_SIZE = 50

function ConceptCard({ concept, onClick }: { concept: any; onClick: () => void }) {
  const c = '#b0c4de'
  return (
    <div onClick={onClick} style={{
      borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
      border: `1px solid ${c}28`, backgroundColor: 'var(--bg-secondary)',
      transition: 'transform 0.18s, box-shadow 0.18s',
      display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${c}30` }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ height: 4, background: `linear-gradient(90deg, ${c}, ${c}88)` }} />
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💡</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', backgroundColor: c + '14', padding: '2px 8px', borderRadius: 10 }}>
            {concept.verse_count} verse{concept.verse_count !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.25, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
          {concept.concept}
        </div>
        {concept.description ? (
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
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

export default function ConceptsPage() {
  const router = useRouter()

  // Refs that survive strict-mode double-invoke
  const cacheUsedRef = useRef(false)
  const prevDebSearchRef = useRef('')  // tracks actual previous value of debouncedSearch

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [concepts, setConcepts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Debounce search — only update debouncedSearch, do NOT clear concepts here
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
    prevDebSearchRef.current = debouncedSearch

    // If cache was used and nothing actually changed, just stop loading and bail
    if (cacheUsedRef.current && !debouncedSearch && !searchChanged) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Clear concepts when search actually changed (not on first-ever mount)
    if (searchChanged) {
      setConcepts([])
      setOffset(0)
    }

    // On first load with no search, try sessionStorage cache
    if (!cacheUsedRef.current && !debouncedSearch) {
      const raw = typeof window !== 'undefined' ? sessionStorage.getItem('ai_initial_concepts') : null
      if (raw) {
        try {
          const cached = JSON.parse(raw)
          const items = Array.isArray(cached) ? cached : cached.items
          const tot = Array.isArray(cached) ? cached.length + 5 : cached.total
          setConcepts(items)
          setTotal(tot)
          setLoading(false)
          cacheUsedRef.current = true
          sessionStorage.removeItem('ai_initial_concepts')
          return
        } catch (e) {}
      }
    }

    // Regular API fetch
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: '0' })
    if (debouncedSearch) params.append('search', debouncedSearch)
    fetch(`${API_BASE}/api/ai/concepts?${params}`)
      .then(r => r.json())
      .then(d => { setConcepts(d.items ?? []); setTotal(d.total ?? 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [debouncedSearch])

  const loadMore = useCallback(() => {
    const nextOffset = offset + PAGE_SIZE
    setLoadingMore(true)
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(nextOffset) })
    if (debouncedSearch) params.append('search', debouncedSearch)
    fetch(`${API_BASE}/api/ai/concepts?${params}`)
      .then(r => r.json())
      .then(d => { setConcepts(prev => [...prev, ...(d.items ?? [])]); setOffset(nextOffset); setLoadingMore(false) })
      .catch(() => setLoadingMore(false))
  }, [offset, debouncedSearch])

  const hasMore = concepts.length < total

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ background: 'linear-gradient(160deg, #b0c4de14 0%, transparent 50%)', borderBottom: '1px solid var(--border)40', padding: '44px 0 36px' }}>
        <section className="max-w-5xl mx-auto px-4">
          <Link href="/ai" style={{ color: '#b0c4de', opacity: 0.75, fontSize: '0.8rem', textDecoration: 'none' }}>← Knowledge Graph</Link>
          <h1 className="heading-serif" style={{ fontSize: '2.4rem', marginTop: 12, marginBottom: 10, lineHeight: 1.1 }}>
            Concepts &amp; Teachings
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
            {total.toLocaleString()} concepts extracted from the scriptures
          </p>
          <div style={{ position: 'relative', maxWidth: 480 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input
              autoFocus
              placeholder="Search bhakti, karma, moksha…"
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

      <section className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 14, height: 120, backgroundColor: 'var(--bg-secondary)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : concepts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>💡</div>
            <p>No concepts found{search ? ` for "${search}"` : ''}.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {concepts.map((c, i) => (
                <ConceptCard key={i} concept={c} onClick={() => c.entity_id
                  ? router.push(`/ai/entities/${c.entity_id}`)
                  : router.push(`/ai/concepts/${encodeURIComponent(c.concept)}`)} />
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button onClick={loadMore} disabled={loadingMore} style={{
                  padding: '10px 28px', borderRadius: 24, cursor: loadingMore ? 'default' : 'pointer',
                  border: '1px solid var(--accent)50', backgroundColor: 'transparent',
                  color: 'var(--accent)', fontSize: '0.88rem', fontWeight: 600, opacity: loadingMore ? 0.6 : 1,
                }}>
                  {loadingMore ? 'Loading…' : `Load more (${total - concepts.length} remaining)`}
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
