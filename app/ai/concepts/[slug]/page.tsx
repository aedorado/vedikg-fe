'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function verseHref(ref: string): string {
  const parts = ref.split(' ')
  const book = parts[0]?.toLowerCase()
  const nums = parts[1]?.split('.') || []
  if (nums.length < 3) return ''
  if (book === 'sb') return `/sb/${nums[0]}/${nums[1]}/${nums[2]}`
  if (book === 'cc') return `/cc/${nums[0]}/${nums[1]}/${nums[2]}`
  if (book === 'cb') return `/cb/${nums[0]}/${nums[1]}/${nums[2]}`
  if (book === 'brs') return `/brs/${nums[0]}/${nums[1]}/${nums[2]}`
  return ''
}

export default function ConceptDetailPage() {
  const params = useParams()
  const slug = decodeURIComponent(params?.slug as string)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`${API_BASE}/api/ai/concepts/${encodeURIComponent(slug)}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <section className="max-w-4xl mx-auto px-4 py-10">
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      </section>
    </main>
  )

  if (!data) return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <section className="max-w-4xl mx-auto px-4 py-10">
        <p style={{ color: 'var(--text-secondary)' }}>Concept not found.</p>
        <Link href="/ai/concepts" style={{ color: 'var(--accent)', textDecoration: 'underline', marginTop: 12, display: 'inline-block' }}>
          ← All Concepts
        </Link>
      </section>
    </main>
  )

  const verseCount = data.verse_ids?.length ?? 0

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{
        borderBottom: '3px solid #b0c4de',
        background: 'linear-gradient(135deg, #b0c4de16 0%, transparent 65%)',
        padding: '40px 0 32px',
      }}>
        <section className="max-w-4xl mx-auto px-4">
          <Link href="/ai/concepts" style={{ color: '#b0c4de', opacity: 0.75, fontSize: '0.8rem', textDecoration: 'none' }}>
            ← Concepts
          </Link>
          <div style={{ display: 'flex', gap: 20, marginTop: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 6, minHeight: 60, borderRadius: 4, backgroundColor: '#b0c4de', flexShrink: 0, marginTop: 6 }} />
            <div>
              <h1 className="heading-serif" style={{ fontSize: '2.4rem', lineHeight: 1.1, color: '#b0c4de', marginBottom: 10, textTransform: 'capitalize' }}>
                {data.concept}
              </h1>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                💡 concept · {verseCount} verse{verseCount !== 1 ? 's' : ''}
              </div>
              {data.description && (
                <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--text-secondary)', maxWidth: '72ch', margin: 0 }}>
                  {data.description}
                </p>
              )}
              {data.entity_id && (
                <Link href={`/ai/entities/${data.entity_id}`} style={{
                  display: 'inline-block', marginTop: 14,
                  color: '#b0c4de', fontSize: '0.82rem', textDecoration: 'underline',
                }}>
                  View full personality profile →
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <h2 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 20 }}>
          Appears in {verseCount} verse{verseCount !== 1 ? 's' : ''}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {(data.verse_ids || []).map((vid: number, i: number) => {
            const ref = data.verse_titles?.[i] ?? ''
            const translation = data.translations?.[i] ?? ''
            const href = verseHref(ref)
            return (
              <div key={vid} style={{
                display: 'grid', gridTemplateColumns: '120px 1fr',
                gap: 16, padding: '14px 0',
                borderBottom: '1px solid var(--border)30',
                alignItems: 'start',
              }}>
                {href ? (
                  <Link href={href} style={{
                    color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem',
                    textDecoration: 'none', paddingTop: 2,
                  }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    {ref}
                  </Link>
                ) : (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingTop: 2 }}>{ref}</span>
                )}
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  {translation.length > 300 ? translation.slice(0, 300) + '…' : translation}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
