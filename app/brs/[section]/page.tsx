'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const SECTION_META: Record<string, { label: string; sublabel: string; color: string }> = {
  eastern:  { label: 'Eastern Section', sublabel: 'Types of Bhakti',            color: 'var(--saffron)' },
  southern: { label: 'Southern Section', sublabel: 'Components of Rasa',         color: 'var(--gold)' },
  western:  { label: 'Western Section',  sublabel: 'Primary Bhakti Rasas',       color: 'var(--lotus)' },
  northern: { label: 'Northern Section', sublabel: 'Secondary Bhakti Rasas',     color: 'var(--temple-sage)' },
}

export default function BRSSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const [section, setSection] = useState('')
  const [waves, setWaves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ section: s }) => {
      const sec = s.toLowerCase()
      setSection(sec)
      fetch(`${API_BASE}/api/verses/brs/${sec}`)
        .then(r => r.json())
        .then(data => { setWaves(Array.isArray(data) ? data : []); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, [params])

  const meta = SECTION_META[section] ?? { label: section, sublabel: '', color: 'var(--gold)' }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <section className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            <Link href="/brs" className="hover:underline">BRS</Link>
            <span>›</span>
            <span>{meta.label}</span>
          </div>

          <h1 className="heading-serif mb-1">{meta.label}</h1>
          <p className="text-base italic mb-8" style={{ color: meta.color }}>{meta.sublabel}</p>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
          ) : waves.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No waves scraped yet for this section.</p>
          ) : (
            <div className="grid gap-3">
              {waves.map((wave, i) => (
                <motion.div
                  key={wave.wave_number}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/brs/${section}/${wave.wave_number}`} style={{ textDecoration: 'none' }}>
                    <div className="flex items-center gap-4 verse-card hover:opacity-90 transition-opacity">
                      <span
                        className="text-2xl font-mono w-8 shrink-0 text-right"
                        style={{ color: meta.color, opacity: 0.7 }}
                      >
                        {wave.wave_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium" style={{ color: 'var(--text-parchment)' }}>
                          {wave.title}
                        </div>
                      </div>
                      <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {wave.verse_count} verses
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </main>
  )
}
