'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import SiteNav from '../../../../components/SiteNav'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const KHANDA_LABELS: Record<string, string> = {
  adi: 'Ādi-khaṇḍa',
  madhya: 'Madhya-khaṇḍa',
  antya: 'Antya-khaṇḍa',
}

export default function CBVerseDetailPage({
  params,
}: {
  params: Promise<{ khanda: string; chapter: string; verse: string }>
}) {
  const [khanda, setKhanda] = useState<string>('')
  const [chapter, setChapter] = useState<string>('')
  const [verseNum, setVerseNum] = useState<string>('')
  const [verse, setVerse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ khanda: k, chapter: ch, verse: v }) => {
      const kLower = k.toLowerCase()
      setKhanda(kLower)
      setChapter(ch)
      setVerseNum(v)
      fetch(`${API_BASE}/api/verses/cb/${kLower}/${ch}/${v}`)
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

  const khandaLabel = KHANDA_LABELS[khanda] ?? khanda

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      <SiteNav />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header with book info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: 'var(--bg-secondary)', marginBottom: '32px', padding: '24px', borderRadius: '8px' }}
        >
          <h1 className="text-3xl font-bold mb-2">Caitanya Bhāgavata</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
            {khandaLabel} • Chapter {chapter} • Verse {verseNum}
          </p>
          <div className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Author: Śrīla Vṛndāvana dāsa Ṭhākura</p>
            <p>Translator: Bhūmipati Dāsa</p>
            <p>Commentary: Gauḍīya-bhāṣya by Bhaktisiddhānta Sarasvatī Gosvāmī Mahārāja</p>
          </div>
        </motion.div>

        {/* Verse Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Sanskrit/Bengali Text */}
          {verse.devanagari && (
            <div className="mb-12 p-8 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 style={{ color: 'var(--gold)' }} className="text-2xl font-bold uppercase tracking-wider mb-6">
                Sanskrit Text
              </h2>
              <p 
                style={{ 
                  color: 'var(--text-primary)', 
                  fontFamily: 'Georgia, serif',
                  lineHeight: '2.5',
                  whiteSpace: 'pre-wrap',
                  fontStyle: 'italic'
                }} 
                className="text-2xl"
              >
                {verse.devanagari}
              </p>
            </div>
          )}

          {/* Translation */}
          {verse.translation && (
            <div className="mb-12 p-8 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 style={{ color: 'var(--gold)' }} className="text-2xl font-bold uppercase tracking-wider mb-6">
                Translation
              </h2>
              <p 
                style={{ color: 'var(--text-primary)' }} 
                className="text-xl leading-relaxed"
              >
                {verse.translation}
              </p>
            </div>
          )}

          {/* Purport */}
          {verse.purport_text && (
            <div className="mb-12 p-8 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 style={{ color: 'var(--gold)' }} className="text-2xl font-bold uppercase tracking-wider mb-6">
                Purport
              </h2>
              <div style={{ color: 'var(--text-primary)' }} className="text-base leading-8 space-y-6">
                {verse.purport_text.split('\n\n').filter((p: string) => p.trim()).map((para: string, idx: number) => (
                  <p key={idx} className="text-justify">
                    {para.trim().split('\n').map((line: string, i: number, arr: string[]) => (
                      <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            href={`/cb/${khanda}/${chapter}/${Math.max(1, parseInt(verseNum) - 1)}`}
            className="px-4 py-2 rounded transition"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            ← Previous Verse
          </Link>
          
          <Link 
            href={`/`}
            className="px-4 py-2 rounded transition"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            Home
          </Link>

          <Link 
            href={`/cb/${khanda}/${chapter}/${parseInt(verseNum) + 1}`}
            className="px-4 py-2 rounded transition"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            Next Verse →
          </Link>
        </div>
      </div>
    </div>
  )
}
