'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const SECTION_LABELS: Record<string, string> = {
  adi: 'Ādi-līlā', madhya: 'Madhya-līlā', antya: 'Antya-līlā',
}

export default async function CCSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  return <CCSectionContent section={section} />
}

function CCSectionContent({ section }: { section: string }) {
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const label = SECTION_LABELS[section] ?? section

  useEffect(() => {
    fetch(`${API_BASE}/api/verses/cc/${section}`)
      .then(r => r.json())
      .then(d => { setChapters(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [section])

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      
      <section className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            <Link href="/cc" className="hover:underline">CC</Link>
            <span>›</span>
            <span>{label}</span>
          </div>
          <h1 className="heading-serif mb-8">{label}</h1>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
          ) : chapters.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No chapters scraped yet.</p>
          ) : (
            <div className="grid gap-3">
              {chapters.map((ch, i) => (
                <motion.div key={ch.chapter_number} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}>
                  <Link href={`/cc/${section}/${ch.chapter_number}`}
                    className="flex items-start gap-4 verse-card hover:opacity-90 transition-opacity">
                    <span className="text-2xl font-mono w-8 shrink-0 text-right"
                      style={{ color: 'var(--gold)', opacity: 0.6 }}>
                      {ch.chapter_number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium" style={{ color: 'var(--text-parchment)' }}>{ch.title}</div>
                      {ch.summary && (
                        <div className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                          {ch.summary}
                        </div>
                      )}
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {ch.verse_count} verses
                    </span>
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
