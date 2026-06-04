'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default async function ChandaDetailPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  return <ChandaDetailContent name={name} />
}

function ChandaDetailContent({ name }: { name: string }) {
  const [chanda, setChanda] = useState<any>(null)
  const [verses, setVerses] = useState<any[]>([])
  const [cantoCounts, setCantoCounts] = useState<{ canto: number; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [cantoFilter, setCantoFilter] = useState<number | null>(null)
  const pageSize = 50

  useEffect(() => {
    setPage(0)
  }, [cantoFilter])

  useEffect(() => {
    const decodedName = decodeURIComponent(name)
    const cantoParam = cantoFilter != null ? `&canto=${cantoFilter}` : ''
    fetch(`${API_BASE}/api/chandas/${encodeURIComponent(decodedName)}?skip=${page * pageSize}&limit=${pageSize}${cantoParam}`)
      .then((res) => res.json())
      .then((data) => {
        setChanda({ name: data.chanda, total: data.total })
        setVerses(data.verses)
        if (data.canto_counts) setCantoCounts(data.canto_counts)
        setLoading(false)
      })
      .catch((err) => { console.error(err); setLoading(false) })
  }, [name, page, cantoFilter])

  const totalPages = chanda ? Math.ceil(chanda.total / pageSize) : 1

  const cardStyle = {
    padding: '1rem',
    borderRadius: '0.375rem',
    border: '1px solid',
    borderColor: 'color-mix(in srgb, var(--border-gold) 20%, transparent)',
    backgroundColor: 'var(--bg-card)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }

  if (loading) return (
    <main style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
    </main>
  )

  if (!chanda) return (
    <main style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Meter not found</div>
    </main>
  )

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      
      <section style={{ maxWidth: '56rem', margin: '0 auto', padding: '3rem 1rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <Link href="/chandas" style={{ color: 'var(--gold)', fontSize: '0.9em', display: 'inline-block', marginBottom: '1rem' }}>
            ← Back to Meters
          </Link>
          <h1 style={{ color: 'var(--gold)', fontSize: '2.5em', fontFamily: 'serif', marginBottom: '0.25rem' }}>
            {chanda.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {chanda.total} verse{chanda.total !== 1 ? 's' : ''}{cantoFilter != null ? ` in Canto ${cantoFilter}` : ''}
          </p>

          {/* Canto filter pills */}
          {cantoCounts.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setCantoFilter(null)}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  border: '1px solid color-mix(in srgb, var(--border-gold) 40%, transparent)',
                  backgroundColor: cantoFilter === null ? 'color-mix(in srgb, var(--border-gold) 30%, transparent)' : 'var(--bg-card)',
                  color: cantoFilter === null ? 'var(--gold)' : 'var(--text-muted)',
                  fontSize: '0.8em',
                  cursor: 'pointer',
                }}
              >
                All
              </button>
              {cantoCounts.map(({ canto, count }) => (
                <button
                  key={canto}
                  onClick={() => setCantoFilter(cantoFilter === canto ? null : canto)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    border: '1px solid color-mix(in srgb, var(--border-gold) 40%, transparent)',
                    backgroundColor: cantoFilter === canto ? 'color-mix(in srgb, var(--border-gold) 30%, transparent)' : 'var(--bg-card)',
                    color: cantoFilter === canto ? 'var(--gold)' : 'var(--text-muted)',
                    fontSize: '0.8em',
                    cursor: 'pointer',
                  }}
                >
                  Canto {canto} <span style={{ opacity: 0.6 }}>({count})</span>
                </button>
              ))}
            </div>
          )}

          {/* Verse list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {verses.map((verse, idx) => (
              <motion.div key={verse.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}>
                <Link href={`/sb/${verse.verse_slug}`}>
                  <div
                    style={cardStyle}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'color-mix(in srgb, var(--border-gold) 55%, transparent)'
                      el.style.backgroundColor = 'color-mix(in srgb, var(--bg-card) 60%, var(--bg-primary))'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'color-mix(in srgb, var(--border-gold) 20%, transparent)'
                      el.style.backgroundColor = 'var(--bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.95em' }}>{verse.reference}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75em', backgroundColor: 'color-mix(in srgb, var(--border-gold) 12%, transparent)', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                        Canto {verse.canto}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9em', lineHeight: 1.5, margin: 0 }}>
                      {verse.translation}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '2rem' }}>
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid color-mix(in srgb, var(--border-gold) 30%, transparent)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
              >← Previous</button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid color-mix(in srgb, var(--border-gold) 30%, transparent)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', opacity: page === totalPages - 1 ? 0.4 : 1, cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', fontSize: '0.875rem' }}
              >Next →</button>
            </div>
          )}

        </motion.div>
      </section>
    </main>
  )
}
