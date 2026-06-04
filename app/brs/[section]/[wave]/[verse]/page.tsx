'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const SECTION_META: Record<string, { label: string; color: string }> = {
  eastern:  { label: 'Eastern Section', color: 'var(--saffron)' },
  southern: { label: 'Southern Section', color: 'var(--gold)' },
  western:  { label: 'Western Section',  color: 'var(--lotus)' },
  northern: { label: 'Northern Section', color: 'var(--temple-sage)' },
}

/** Reusable clickable footnote superscript with popover */
function FootnoteRef({ num, text }: { num: string; text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block">
      <sup
        onClick={() => setOpen(o => !o)}
        style={{
          color: 'var(--gold)',
          cursor: 'pointer',
          fontSize: '0.65em',
          fontWeight: 600,
          borderBottom: '1px dotted var(--gold)',
        }}
        title="Click to toggle footnote"
      >
        [{num}]
      </sup>
      {open && (
        <span
          className="absolute z-20 rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{
            bottom: '1.6em',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--gold)',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            fontStyle: 'normal',
            fontFamily: 'inherit',
          }}
        >
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>[{num}]</span>{' '}{text}
        </span>
      )}
    </span>
  )
}

/** Render a paragraph that may contain [n] footnote markers as superscript popovers */
function CommentaryParagraph({
  text,
  footnotes,
}: {
  text: string
  footnotes: Record<string, string>
}) {
  return (
    <p className="text-sm mb-3 last:mb-0 text-justify" style={{ color: 'var(--text-secondary)', lineHeight: '1.85' }}>
      {text.split(/(\[\d+\])/).map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/)
        if (!m) return <span key={i}>{part}</span>
        const num = m[1]
        const noteText = footnotes[num]
        if (!noteText) return <sup key={i} style={{ color: 'var(--text-muted)', fontSize: '0.65em' }}>{part}</sup>
        return <FootnoteRef key={i} num={num} text={noteText} />
      })}
    </p>
  )
}

function CommentaryBlock({
  author,
  text,
  footnotes,
}: {
  author: string
  text: string
  footnotes: Record<string, string>
}) {
  const [open, setOpen] = useState(true)
  const isJiva = author.includes('Jīva')

  return (
    <div className="rounded-lg overflow-hidden mb-4" style={{ border: '1px solid var(--border-light)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 text-left"
        style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'pointer' }}
      >
        <span className="text-sm font-semibold" style={{ color: isJiva ? 'var(--saffron)' : 'var(--lotus)' }}>
          {author}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-5 py-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          {text.split('\n\n').filter(p => p.trim()).map((para, i) => (
            <CommentaryParagraph key={i} text={para.trim()} footnotes={footnotes} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function BRSVersePage({
  params,
}: {
  params: Promise<{ section: string; wave: string; verse: string }>
}) {
  const [section, setSection] = useState('')
  const [wave, setWave] = useState('')
  const [verseNum, setVerseNum] = useState('')
  const [verse, setVerse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ section: s, wave: w, verse: v }) => {
      const sec = s.toLowerCase()
      setSection(sec); setWave(w); setVerseNum(v)
      fetch(`${API_BASE}/api/verses/brs/${sec}/${w}/${v}`)
        .then(r => r.json())
        .then(data => { setVerse(data); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, [params])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading…</div>
  )
  if (!verse || verse.detail) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Verse not found</div>
  )

  const meta = SECTION_META[section] ?? { label: section, color: 'var(--gold)' }
  const purports: any[] = verse.purports ?? []
  const footnotes: Record<string, string> = verse.footnotes ?? {}

  const prevNum = parseInt(verseNum) - 1
  const nextNum = parseInt(verseNum) + 1

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          <Link href="/brs" className="hover:underline">BRS</Link>
          <span>›</span>
          <Link href={`/brs/${section}`} className="hover:underline">{meta.label}</Link>
          <span>›</span>
          <Link href={`/brs/${section}/${wave}`} className="hover:underline">Wave {wave}</Link>
          <span>›</span>
          <span style={{ color: meta.color }}>{verse.full_reference}</span>
        </div>

        {/* Reference header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg p-5 mb-6"
          style={{ backgroundColor: 'var(--bg-secondary)', borderLeft: `3px solid ${meta.color}` }}
        >
          <p className="text-xs mb-1" style={{ color: meta.color }}>Bhakti-rasāmṛta-sindhu</p>
          <h1 className="font-serif text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {verse.full_reference}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {meta.label} · Wave {wave}
          </p>
        </motion.div>

        {/* Sanskrit / transliteration */}
        {verse.transliteration && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="verse-card mb-6"
          >
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: meta.color }}
            >
              Sanskrit
            </p>
            <p
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'Georgia, serif',
                fontSize: '1.125rem',
                lineHeight: 2.2,
                fontStyle: 'italic',
              }}
            >
              {verse.transliteration.split('\n').map((line: string, li: number, arr: string[]) => (
                <span key={li}>
                  {line.split(/(\[\d+\])/).map((part: string, pi: number) => {
                    const m = part.match(/^\[(\d+)\]$/)
                    if (!m) return <span key={pi}>{part}</span>
                    const num = m[1]
                    const noteText = footnotes[num]
                    if (!noteText) return <sup key={pi} style={{ color: 'var(--text-muted)', fontSize: '0.6em' }}>{part}</sup>
                    return (
                      <FootnoteRef key={pi} num={num} text={noteText} />
                    )
                  })}
                  {li < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          </motion.div>
        )}

        {/* Translation */}
        {verse.translation && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="verse-card mb-6"
          >
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: meta.color }}>
              Translation
            </p>
            {verse.translation.split('\n\n').map((para: string, i: number) => (
              <p key={i} className="text-lg leading-relaxed mb-3 last:mb-0"
                style={{ color: 'var(--text-primary)', fontFamily: '"Crimson Text", Georgia, serif', lineHeight: 1.8 }}>
                {para.trim()}
              </p>
            ))}
          </motion.div>
        )}

        {/* Commentaries */}
        {purports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: meta.color }}>
              Commentaries
            </p>
            {purports.map((p: any, i: number) => (
              <CommentaryBlock key={i} author={p.author} text={p.body_text ?? ''} footnotes={footnotes} />
            ))}
          </motion.div>
        )}

        {/* Prev / Next nav */}
        <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
          {prevNum >= 1 ? (
            <Link
              href={`/brs/${section}/${wave}/${prevNum}`}
              className="px-4 py-2 rounded text-sm transition"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              ← {wave}.{prevNum}
            </Link>
          ) : (
            <div />
          )}
          <Link
            href={`/brs/${section}/${wave}`}
            className="text-sm hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            Wave {wave}
          </Link>
          <Link
            href={`/brs/${section}/${wave}/${nextNum}`}
            className="px-4 py-2 rounded text-sm transition"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            {wave}.{nextNum} →
          </Link>
        </div>
      </div>
    </div>
  )
}
