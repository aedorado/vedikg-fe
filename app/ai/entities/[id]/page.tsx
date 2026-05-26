'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import SiteNav from '../../../components/SiteNav'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const TYPE_COLORS: Record<string, string> = {
  person:   '#d4af37',
  deva:     '#7ec8b0',
  demon:    '#e07b5a',
  sage:     '#b0c4de',
  place:    '#90ee90',
  river:    '#4dd',
  mountain: '#aaa',
  kingdom:  '#c87ec8',
  dynasty:  '#e09a5a',
  concept:  '#888',
  object:   '#ccc',
  text:     '#f0e68c',
  animal:   '#cd853f',
}
const DEFAULT_COLOR = '#888'

// ─── Helper: Format relationship type ────────────────────────────────────
function formatRelationType(type: string): string {
  // Handle direction-flipped relationships
  const map: Record<string, string> = {
    'son_of': 'father/mother of',
    'daughter_of': 'parent of',
    'brother_of': 'sibling of',
    'sister_of': 'sibling of',
    'spouse_of': 'spouse of',
    'disciple_of': 'guru of',
    'guru_of': 'disciple of',
    'friend_of': 'friend of',
    'enemy_of': 'enemy of',
    'incarnation_of': 'incarnate form of',
    'expansion_of': 'expanded by',
    'devotee_of': 'worshipped by',
    'resident_of': 'inhabited by',
    'king_of': 'ruled by',
    'killed_by': 'kills',
    'blessed_by': 'blesses',
    'cursed_by': 'curses',
  }
  return map[type] || type.replace(/_/g, ' ')
}

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? DEFAULT_COLOR
  return (
    <span
      style={{
        backgroundColor: color + '30',
        border: `1px solid ${color}`,
        color,
        fontSize: '0.65rem',
        padding: '1px 6px',
        borderRadius: 4,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {type}
    </span>
  )
}

export default function EntityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [entity, setEntity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const id = params?.id as string

  useEffect(() => {
    if (!id) return
    
    setLoading(true)
    fetch(`${API_BASE}/api/ai/entities/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(setEntity)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <SiteNav />
        <section className="max-w-4xl mx-auto px-4 py-10">
          <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        </section>
      </main>
    )
  }

  if (error || !entity) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <SiteNav />
        <section className="max-w-4xl mx-auto px-4 py-10">
          <p style={{ color: 'var(--text-secondary)' }}>Entity not found</p>
          <Link href="/ai" style={{ color: 'var(--accent)', textDecoration: 'underline', marginTop: 12, display: 'inline-block' }}>
            ← Back to AI Insights
          </Link>
        </section>
      </main>
    )
  }

  const color = TYPE_COLORS[entity.type] ?? DEFAULT_COLOR
  const aliases = typeof entity.aliases === 'string' ? JSON.parse(entity.aliases || '[]') : (entity.aliases || [])
  const displayName = entity.sanskrit_name || entity.name

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <SiteNav />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: `3px solid ${color}`, background: `linear-gradient(135deg, ${color}18 0%, transparent 60%)`, padding: '40px 0 32px' }}>
        <section className="max-w-4xl mx-auto px-4">
          <Link href="/ai" style={{ color, textDecoration: 'none', fontSize: '0.8rem', opacity: 0.8 }}>← AI Insights</Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginTop: 16 }}>
            {/* color block */}
            <div style={{ width: 6, minHeight: 80, borderRadius: 4, backgroundColor: color, flexShrink: 0, marginTop: 4 }} />
            <div style={{ flex: 1 }}>
              <h1 className="heading-serif" style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: 10, color }}>{displayName}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 12px', borderRadius: 20, backgroundColor: color + '25', border: `1px solid ${color}60`, color, fontSize: '0.78rem', textTransform: 'capitalize' }}>{entity.type}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{entity.mention_count} mentions · {entity.verses?.length || 0} verses</span>
              </div>
              {entity.description && (
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: '75ch' }}>{entity.description}</p>
              )}
              {aliases.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                  {aliases.map((a: string, i: number) => (
                    <span key={i} style={{ padding: '2px 10px', borderRadius: 12, backgroundColor: color + '15', border: `1px solid ${color}30`, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="max-w-4xl mx-auto px-4 py-10">

        {/* ── Relationships ────────────────────────────────────────────── */}
        {(entity.relationships_out?.length > 0 || entity.relationships_in?.length > 0) && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 16 }}>Relationships</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entity.relationships_out?.map((r: any, i: number) => (
                <div key={`o${i}`} style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 8, overflow: 'hidden', border: `1px solid ${color}25` }}>
                  <div style={{ backgroundColor: color + '20', padding: '10px 14px', fontSize: '0.78rem', fontWeight: 700, color, minWidth: 130, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {r.type.replace(/_/g, ' ')}
                  </div>
                  <div style={{ padding: '10px 14px', flex: 1, backgroundColor: 'var(--bg-secondary)' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.target}</span>
                    {r.context && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 10 }}>— {r.context}</span>}
                  </div>
                </div>
              ))}
              {entity.relationships_in?.map((r: any, i: number) => (
                <div key={`i${i}`} style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid #ffffff15' }}>
                  <div style={{ backgroundColor: '#ffffff08', padding: '10px 14px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', minWidth: 130, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {r.type.replace(/_/g, ' ')}
                  </div>
                  <div style={{ padding: '10px 14px', flex: 1, backgroundColor: 'var(--bg-secondary)' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.source}</span>
                    {r.context && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 10 }}>— {r.context}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Verses ──────────────────────────────────────────────────── */}
        {entity.verses?.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Appears in {entity.verses.length} verse{entity.verses.length !== 1 ? 's' : ''}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {entity.verses.map((v: any, i: number) => {
                const parts = v.reference?.split(' ')[1]?.split('.') || []
                const href = parts.length === 3 ? `/sb/${parts[0]}/${parts[1]}/${parts[2]}` : '/ai'
                const isPurport = v.mention_source === 'purport'
                return (
                  <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${color}20` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', backgroundColor: color + '15', borderBottom: `1px solid ${color}20` }}>
                      <Link href={href} style={{ color, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>{v.reference} →</Link>
                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 10, backgroundColor: isPurport ? '#c87ec825' : '#7ec8b025', color: isPurport ? '#c87ec8' : '#7ec8b0', border: `1px solid ${isPurport ? '#c87ec840' : '#7ec8b040'}` }}>
                        {isPurport ? 'Purport' : 'Verse'}
                      </span>
                    </div>
                    <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      {v.translation}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!entity.relationships_out?.length && !entity.relationships_in?.length && !entity.verses?.length && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>No data extracted yet for this entity.</p>
        )}
      </section>
    </main>
  )
}
