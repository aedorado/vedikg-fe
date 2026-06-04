'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const KHANDA_LABELS: Record<string, string> = {
  adi: 'Ādi-khaṇḍa',
  madhya: 'Madhya-khaṇḍa',
  antya: 'Antya-khaṇḍa',
}

export default function CBKhandaPage({
  params,
}: {
  params: Promise<{ khanda: string }>
}) {
  const [khanda, setKhanda] = useState<string>('')
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ khanda }) => {
      setKhanda(khanda.toLowerCase())
      fetch(`${API_BASE}/api/verses/cb/${khanda.toLowerCase()}`)
        .then(r => r.json())
        .then(data => { setChapters(Array.isArray(data) ? data : []); setLoading(false) })
        .catch(() => { setChapters([]); setLoading(false) })
    })
  }, [params])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading…</div>
  )

  const khandaLabel = KHANDA_LABELS[khanda] ?? khanda

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      
      <section className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/cb" className="text-sm mb-6 inline-block hover:opacity-70 transition"
            style={{ color: 'var(--text-secondary)' }}>
            ← Back to CB
          </Link>
          <h1 className="heading-serif text-4xl mb-4">{khandaLabel}</h1>
          <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
            {chapters.length > 0 ? `${chapters.length} chapters` : 'No chapters available'}
          </p>

          <div className="grid gap-4">
            {chapters.map((ch, i) => (
              <motion.div key={ch.chapter_number} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Link href={`/cb/${khanda}/${ch.chapter_number}`}
                  className="block p-6 rounded-lg hover:opacity-90 transition"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="heading-serif text-xl">Chapter {ch.chapter_number}</h2>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {ch.verse_count} verses
                    </span>
                  </div>
                  {ch.title && <h3 className="mb-2 font-semibold">{ch.title}</h3>}
                  {ch.summary && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {ch.summary.slice(0, 200)}...
                  </p>}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  )
}
