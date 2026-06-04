'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const TYPE_COLORS: Record<string, string> = {
  person: '#d4af37', deva: '#7ec8b0', demon: '#e07b5a', sage: '#b0c4de',
  place: '#90ee90', river: '#4dd0e1', mountain: '#aaa', kingdom: '#c87ec8',
  dynasty: '#e09a5a', concept: '#888', object: '#ccc', text: '#f0e68c',
  animal: '#cd853f',
}
const DEFAULT_COLOR = '#888'

const FAMILY_REL_LABELS: Record<string, string> = {
  father_of: 'Father of', mother_of: 'Mother of',
  son_of: 'Son of', daughter_of: 'Daughter of',
  brother_of: 'Brother of', sister_of: 'Sister of',
  spouse_of: 'Spouse of', uncle_of: 'Uncle of',
  nephew_of: 'Nephew of', cousin_of: 'Cousin of',
  grandfather_of: 'Grandfather of', grandson_of: 'Grandson of',
}

const OTHER_REL_LABELS: Record<string, string> = {
  guru_of: 'Guru of', disciple_of: 'Disciple of',
  devotee_of: 'Devotee of', friend_of: 'Friend of',
  enemy_of: 'Enemy of', incarnation_of: 'Incarnation of',
  expansion_of: 'Expansion of', king_of: 'King of',
  resident_of: 'Resident of', kills: 'Kills',
  blesses: 'Blesses', curses: 'Curses',
  commander_of: 'Commander of',
}

function relLabel(type: string): string {
  return FAMILY_REL_LABELS[type] || OTHER_REL_LABELS[type] || type.replace(/_/g, ' ')
}

// Invert a relationship label when it's incoming (other entity → this entity)
const INVERT_LABELS: Record<string, string> = {
  father_of: 'Child of', mother_of: 'Child of',
  son_of: 'Parent of', daughter_of: 'Parent of',
  guru_of: 'Disciple of', disciple_of: 'Guru of',
  kills: 'Killed by', blesses: 'Blessed by', curses: 'Cursed by',
  devotee_of: 'Object of devotion for', friend_of: 'Friend of',
  enemy_of: 'Enemy of', king_of: 'Ruled by',
  incarnation_of: 'Has incarnation', expansion_of: 'Expanded as',
}

function incomingLabel(type: string): string {
  return INVERT_LABELS[type] || `← ${relLabel(type)}`
}

// ── Skeleton loader
function Skeleton({ w = '100%', h = 18, r = 6 }: { w?: string | number, h?: number, r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      backgroundColor: 'var(--bg-secondary)',
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

// ── Verse card — expandable to show purport
function VerseCard({ verse, color }: { verse: any, color: string }) {
  const [expanded, setExpanded] = useState(false)
  const isPurport = verse.mention_source === 'purport'

  const ref = verse.reference || ''
  const parts = ref.split(' ')
  const bookCode = parts[0]?.toLowerCase()
  const nums = parts[1]?.split('.') || []

  let href = '/ai'
  if (bookCode === 'sb' && nums.length >= 3) href = `/sb/${nums[0]}/${nums[1]}/${nums[2]}`
  else if (bookCode === 'cc' && nums.length >= 3) href = `/cc/${nums[0]}/${nums[1]}/${nums[2]}`
  else if (bookCode === 'cb' && nums.length >= 3) href = `/cb/${nums[0]}/${nums[1]}/${nums[2]}`
  else if (bookCode === 'brs' && nums.length >= 3) href = `/brs/${nums[0]}/${nums[1]}/${nums[2]}`

  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden',
      border: `1px solid ${color}22`,
      backgroundColor: 'var(--bg-secondary)',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        backgroundColor: color + '12',
        borderBottom: `1px solid ${color}20`,
        gap: 8,
      }}>
        <Link href={href} style={{ color, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', flexShrink: 0 }}>
          {verse.reference} →
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.65rem', padding: '2px 8px', borderRadius: 10,
            backgroundColor: isPurport ? '#c87ec820' : '#7ec8b020',
            color: isPurport ? '#c87ec8' : '#7ec8b0',
            border: `1px solid ${isPurport ? '#c87ec840' : '#7ec8b040'}`,
            whiteSpace: 'nowrap',
          }}>
            {isPurport ? 'Purport' : 'Verse'}
          </span>
          {verse.purport_excerpt && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                fontSize: '0.68rem', padding: '2px 8px', borderRadius: 10,
                backgroundColor: 'transparent', border: `1px solid ${color}40`,
                color: color, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {expanded ? 'Hide purport' : 'Show purport'}
            </button>
          )}
        </div>
      </div>

      {/* Translation */}
      <div style={{
        padding: '12px 14px',
        fontSize: '0.87rem', lineHeight: 1.75,
        color: 'var(--text-secondary)', fontStyle: 'italic',
      }}>
        {verse.translation}
      </div>

      {/* Purport excerpt */}
      {expanded && verse.purport_excerpt && (
        <div style={{
          padding: '10px 14px 14px',
          fontSize: '0.82rem', lineHeight: 1.75,
          color: 'var(--text-secondary)',
          borderTop: `1px solid ${color}18`,
          backgroundColor: color + '06',
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color, display: 'block', marginBottom: 6 }}>
            Purport excerpt
          </span>
          {verse.purport_excerpt}
          {verse.purport_excerpt.length >= 800 && (
            <Link href={href} style={{ color, marginLeft: 6, fontSize: '0.78rem' }}>read full →</Link>
          )}
        </div>
      )}
    </div>
  )
}

// ── Relationship pill
function RelPill({ rel, isIncoming, color }: { rel: any, isIncoming: boolean, color: string }) {
  const label = isIncoming ? incomingLabel(rel.type) : relLabel(rel.type)
  const relColor = TYPE_COLORS[rel.entity_type] ?? DEFAULT_COLOR
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      borderRadius: 8, overflow: 'hidden',
      border: `1px solid ${color}22`,
      fontSize: '0.84rem',
    }}>
      <div style={{
        backgroundColor: color + '18', padding: '9px 12px',
        fontSize: '0.72rem', fontWeight: 700,
        color, textTransform: 'uppercase', letterSpacing: '0.06em',
        minWidth: 120, display: 'flex', alignItems: 'center',
        borderRight: `1px solid ${color}20`,
      }}>
        {label}
      </div>
      <div style={{
        padding: '9px 14px', flex: 1,
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Link
          href={`/ai/entities/${rel.entity_id}`}
          style={{ fontWeight: 600, color: relColor, textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
        >
          {rel.sanskrit_name || rel.name}
        </Link>
        {rel.context && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            — {rel.context}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Section heading
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.72rem', fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: 'var(--text-secondary)', marginBottom: 14,
    }}>
      {children}
    </h2>
  )
}

// ── Main page
export default function EntityDetailPage() {
  const params = useParams()
  const [entity, setEntity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verseFilter, setVerseFilter] = useState<'all' | 'verse' | 'purport'>('all')
  const [conceptSearch, setConceptSearch] = useState('')
  const [verseSearch, setVerseSearch] = useState('')

  const id = params?.id as string

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`${API_BASE}/api/ai/entities/${id}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json() })
      .then(d => { setEntity(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [id])

  const filteredVerses = useMemo(() => {
    if (!entity) return []
    let v = entity.verses || []
    if (verseFilter !== 'all') v = v.filter((x: any) => x.mention_source === verseFilter)
    if (verseSearch.trim()) {
      const q = verseSearch.toLowerCase()
      v = v.filter((x: any) =>
        x.reference?.toLowerCase().includes(q) ||
        x.translation?.toLowerCase().includes(q) ||
        x.purport_excerpt?.toLowerCase().includes(q)
      )
    }
    return v
  }, [entity, verseFilter, verseSearch])

  const filteredConcepts = useMemo(() => {
    if (!entity) return []
    const q = conceptSearch.toLowerCase()
    return (entity.concepts || []).filter((c: any) =>
      !q || c.concept.toLowerCase().includes(q)
    )
  }, [entity, conceptSearch])

  if (loading) return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton w={120} h={14} />
          <Skeleton w="60%" h={48} />
          <Skeleton w="40%" h={20} />
          <Skeleton w="80%" h={16} />
          <Skeleton w="75%" h={16} />
        </div>
      </section>
    </main>
  )

  if (error || !entity) return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <section className="max-w-4xl mx-auto px-4 py-10">
        <p style={{ color: 'var(--text-secondary)' }}>Entity not found.</p>
        <Link href="/ai" style={{ color: 'var(--accent)', textDecoration: 'underline', marginTop: 12, display: 'inline-block' }}>
          ← Back to AI Insights
        </Link>
      </section>
    </main>
  )

  const color = TYPE_COLORS[entity.entity_type] ?? DEFAULT_COLOR
  const displayName = entity.sanskrit_name || entity.name
  const aliases = Array.isArray(entity.aliases) ? entity.aliases : []
  const familyRels = entity.family_relationships || []
  const otherRels = entity.other_relationships || []
  const verseCount = (entity.verses || []).length
  const verseOnlyCount = (entity.verses || []).filter((v: any) => v.mention_source === 'verse').length
  const purportOnlyCount = (entity.verses || []).filter((v: any) => v.mention_source === 'purport').length

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* ── Hero ── */}
      <div style={{
        borderBottom: `3px solid ${color}`,
        background: `linear-gradient(135deg, ${color}16 0%, transparent 65%)`,
        padding: '40px 0 32px',
      }}>
        <section className="max-w-4xl mx-auto px-4">
          <Link href="/ai" style={{ color, opacity: 0.75, fontSize: '0.8rem', textDecoration: 'none' }}>
            ← AI Insights
          </Link>
          <div style={{ display: 'flex', gap: 20, marginTop: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 6, minHeight: 80, borderRadius: 4, backgroundColor: color, flexShrink: 0, marginTop: 6 }} />
            <div style={{ flex: 1 }}>
              <h1 className="heading-serif" style={{ fontSize: '2.6rem', lineHeight: 1.1, color, marginBottom: 10 }}>
                {displayName}
              </h1>
              {entity.name !== displayName && (
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{entity.name}</div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 14 }}>
                <span style={{
                  padding: '3px 12px', borderRadius: 20,
                  backgroundColor: color + '22', border: `1px solid ${color}55`,
                  color, fontSize: '0.75rem', textTransform: 'capitalize',
                }}>
                  {entity.entity_type}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {verseCount} verse{verseCount !== 1 ? 's' : ''} · {entity.mention_count} mention{entity.mention_count !== 1 ? 's' : ''}
                </span>
                {familyRels.length > 0 && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    · {familyRels.length} family relation{familyRels.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {entity.description && (
                <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--text-secondary)', maxWidth: '72ch', margin: 0 }}>
                  {entity.description}
                </p>
              )}
              {aliases.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: 4 }}>
                    Also known as:
                  </span>
                  {aliases.map((a: string, i: number) => (
                    <span key={i} style={{
                      padding: '2px 10px', borderRadius: 12,
                      backgroundColor: color + '12', border: `1px solid ${color}28`,
                      fontSize: '0.78rem', color: 'var(--text-secondary)',
                    }}>
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>

          {/* ── Family Relationships ── */}
          {familyRels.length > 0 && (
            <div>
              <SectionHeading>Family &amp; Lineage</SectionHeading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {familyRels.map((r: any, i: number) => (
                  <RelPill key={i} rel={r} isIncoming={r.direction === 'in'} color={color} />
                ))}
              </div>
            </div>
          )}

          {/* ── Other Relationships ── */}
          {otherRels.length > 0 && (
            <div>
              <SectionHeading>Relationships</SectionHeading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {otherRels.map((r: any, i: number) => (
                  <RelPill key={i} rel={r} isIncoming={r.direction === 'in'} color={color} />
                ))}
              </div>
            </div>
          )}

          {/* ── Concepts ── */}
          {filteredConcepts.length > 0 && (
            <div>
              <SectionHeading>Themes &amp; Concepts ({entity.concepts?.length})</SectionHeading>
              <input
                placeholder="Search concepts…"
                value={conceptSearch}
                onChange={e => setConceptSearch(e.target.value)}
                style={{
                  padding: '7px 12px', borderRadius: 8,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  fontSize: '0.85rem', marginBottom: 14, width: '100%', maxWidth: 320,
                }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {filteredConcepts.map((c: any, i: number) => (
                  <Link
                    key={i}
                    href={`/ai?tab=concepts&q=${encodeURIComponent(c.concept)}`}
                    style={{
                      padding: '4px 12px', borderRadius: 20,
                      backgroundColor: color + '12', border: `1px solid ${color}28`,
                      fontSize: '0.8rem', color: 'var(--text-secondary)',
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {c.concept}
                    <span style={{ fontSize: '0.65rem', color, fontWeight: 700 }}>{c.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Verses ── */}
          {verseCount > 0 && (
            <div>
              <SectionHeading>
                Appears in {verseCount} verse{verseCount !== 1 ? 's' : ''}
              </SectionHeading>

              {/* Filter bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {([['all', `All (${verseCount})`], ['verse', `Verse (${verseOnlyCount})`], ['purport', `Purport (${purportOnlyCount})`]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setVerseFilter(val as any)}
                      style={{
                        padding: '5px 12px', fontSize: '0.78rem', cursor: 'pointer',
                        border: 'none', backgroundColor: verseFilter === val ? color : 'var(--bg-secondary)',
                        color: verseFilter === val ? '#fff' : 'var(--text-secondary)',
                        fontWeight: verseFilter === val ? 700 : 400,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  placeholder="Search verses…"
                  value={verseSearch}
                  onChange={e => setVerseSearch(e.target.value)}
                  style={{
                    padding: '5px 12px', borderRadius: 6,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
                    fontSize: '0.82rem', flex: '1 1 160px', maxWidth: 280,
                  }}
                />
              </div>

              {filteredVerses.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No verses match this filter.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredVerses.map((v: any, i: number) => (
                    <VerseCard key={v.id || i} verse={v} color={color} />
                  ))}
                </div>
              )}
            </div>
          )}

          {familyRels.length === 0 && otherRels.length === 0 && verseCount === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 48 }}>
              No data extracted yet for this entity.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
