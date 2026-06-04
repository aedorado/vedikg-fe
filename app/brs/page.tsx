'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const SECTIONS = [
  {
    key: 'eastern',
    label: 'Eastern Section',
    sublabel: 'Pūrva-vibhāga',
    waves: 4,
    desc: 'Types of Bhakti — Sāmānya, Sādhana, Bhāva, Prema',
    color: 'var(--saffron)',
    bg: 'rgba(224,123,34,0.07)',
    border: 'rgba(224,123,34,0.20)',
  },
  {
    key: 'southern',
    label: 'Southern Section',
    sublabel: 'Dakṣiṇa-vibhāga',
    waves: 5,
    desc: 'Components of Rasa — Vibhāva, Anubhāva, Sāttvika, Vyabhicāri, Sthāyi',
    color: 'var(--gold)',
    bg: 'rgba(184,134,11,0.07)',
    border: 'rgba(184,134,11,0.20)',
  },
  {
    key: 'western',
    label: 'Western Section',
    sublabel: 'Paścima-vibhāga',
    waves: 5,
    desc: 'Primary Bhakti Rasas — Śānta, Dāsya, Sakhya, Vātsalya, Mādhurya',
    color: 'var(--lotus)',
    bg: 'rgba(194,84,122,0.07)',
    border: 'rgba(194,84,122,0.20)',
  },
  {
    key: 'northern',
    label: 'Northern Section',
    sublabel: 'Uttara-vibhāga',
    waves: 9,
    desc: 'Secondary Bhakti Rasas — Hāsya, Adbhuta, Vīra, Karuṇa & more',
    color: 'var(--temple-sage)',
    bg: 'rgba(107,142,35,0.07)',
    border: 'rgba(107,142,35,0.20)',
  },
]

export default function BRSPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div
        className="relative overflow-hidden py-14 text-center"
        style={{
          background: 'linear-gradient(160deg, var(--hero-bg-start) 0%, var(--hero-bg-end) 100%)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div aria-hidden="true" style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          fontSize: '16rem', fontFamily: 'Noto Serif Devanagari, serif',
          color: 'var(--saffron)', opacity: 0.07, lineHeight: 1, userSelect: 'none',
        }}>भ</div>

        <div className="relative max-w-3xl mx-auto px-4">
          <div className="section-label mb-3">4 Sections · 23 Waves</div>
          <h1
            className="font-serif mb-3"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}
          >
            Bhakti-rasāmṛta-sindhu
          </h1>
          <p
            className="font-serif text-lg italic mb-1"
            style={{ color: 'var(--gold)' }}
          >
            The Ocean of the Nectar of Devotion
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)', fontFamily: '"Crimson Text", Georgia, serif' }}
          >
            By Śrīla Rūpa Gosvāmī · Translated by Bhānu Swāmī · Commentaries by Jīva Gosvāmī &amp; Viśvanātha Cakravartī Ṭhākura
          </p>
        </div>
      </div>

      {/* Sections grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SECTIONS.map((sec, idx) => (
            <motion.div
              key={sec.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Link href={`/brs/${sec.key}`} style={{ textDecoration: 'none' }}>
                <div
                  className="canto-card h-full"
                  style={{
                    background: `linear-gradient(135deg, ${sec.bg} 0%, var(--bg-card) 100%)`,
                    borderColor: sec.border,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="section-label" style={{ color: sec.color }}>
                        Section {idx + 1}
                      </span>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: sec.border, color: sec.color }}
                    >
                      {sec.waves} waves
                    </span>
                  </div>

                  <h2
                    className="font-serif text-xl font-semibold mb-1"
                    style={{ color: 'var(--text-primary)', lineHeight: 1.3 }}
                  >
                    {sec.label}
                  </h2>
                  <p
                    className="text-sm italic mb-3"
                    style={{ color: sec.color, opacity: 0.8 }}
                  >
                    {sec.sublabel}
                  </p>

                  <p
                    className="text-sm mb-4"
                    style={{ color: 'var(--text-muted)', lineHeight: 1.65 }}
                  >
                    {sec.desc}
                  </p>

                  <div className="flex items-center justify-end">
                    <span className="text-sm font-semibold" style={{ color: sec.color }}>
                      Read →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div
        className="text-center pb-12"
        style={{ color: 'var(--text-muted)', fontFamily: '"Crimson Text", Georgia, serif', fontSize: '0.9375rem' }}
      >
        <span style={{ color: 'var(--gold)', opacity: 0.7 }}>✦</span>
        {' '}bhakti-rasāmṛta-sindhu — the nectar ocean of devotional mellows{' '}
        <span style={{ color: 'var(--gold)', opacity: 0.7 }}>✦</span>
      </div>
    </div>
  )
}
