'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SiteNav from '../../components/SiteNav'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Group {
  meaning: string
  verses: { reference: string; slug: string }[]
}

interface WordData {
  word: string
  groups: Group[]
}

export default async function WordPage({
  params,
}: {
  params: Promise<{ word: string }>
}) {
  const { word: wordParam } = await params
  return <WordContent word={wordParam} />
}

function WordContent({ word: wordParam }: { word: string }) {
  const word = decodeURIComponent(wordParam)
  const [data, setData] = useState<WordData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/verses/word/${encodeURIComponent(word)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [word])

  const total = data?.groups.reduce((acc, g) => acc + g.verses.length, 0) ?? 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <SiteNav />
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Sanskrit word</p>
          <h1 className="heading-serif text-4xl mb-2">{word}</h1>
          {!loading && (
            <p style={{ color: 'var(--text-muted)' }} className="text-sm">
              {total} occurrence{total !== 1 ? 's' : ''} across {data!.groups.length} meaning{data!.groups.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {loading && (
          <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
        )}

        {!loading && data!.groups.length === 0 && (
          <div className="verse-card">
            <p style={{ color: 'var(--text-muted)' }}>No verses found for this word.</p>
          </div>
        )}

        {!loading && data!.groups.map((group, i) => (
          <div key={i} className="verse-card mb-6">
            {/* meaning heading */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-serif text-lg" style={{ color: 'var(--gold)' }}>{word}</span>
              <span style={{ color: 'var(--text-muted)' }}>—</span>
              <span className="font-serif text-lg" style={{ color: 'var(--text-parchment)' }}>{group.meaning}</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full border" style={{ color: 'var(--text-muted)', borderColor: 'color-mix(in srgb, var(--border-gold) 30%, transparent)' }}>
                {group.verses.length}
              </span>
            </div>

            {/* verse reference list */}
            <div className="flex flex-wrap gap-2">
              {group.verses.map((v, j) => (
                <Link
                  key={j}
                  href={`/sb/${v.slug}`}
                  className="text-sm px-3 py-1 rounded-full border transition-colors"
                  style={{
                    color: 'var(--gold)',
                    borderColor: 'color-mix(in srgb, var(--border-gold) 35%, transparent)',
                    backgroundColor: 'color-mix(in srgb, var(--border-gold) 8%, transparent)',
                  }}
                >
                  {v.reference}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
