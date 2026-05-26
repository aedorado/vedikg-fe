'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import SiteNav from './components/SiteNav'

export default function Home() {
  return (
    <main className="min-h-screen bg-temple-dark text-white">
      <SiteNav />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            marginBottom: '1rem',
            fontWeight: 700,
            fontSize: '2.25rem',
            lineHeight: '2.5rem'
          }}
        >
          Bhagavatam Knowledge Graph
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            color: 'var(--parchment, #f5e9da)',
            fontSize: '1.125rem',
            marginBottom: '2rem',
            lineHeight: '1.75rem'
          }}
        >
          Explore the sacred stories, characters, and relationships of the Śrīmad-Bhāgavatam
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
          }}
        >
          <Link
            href="/verses"
            className="verse-card px-6 py-3 border border-temple-gold text-temple-gold hover:bg-temple-gold hover:text-temple-dark transition"
          >
            Read Verses
          </Link>
          <Link
            href="/characters"
            className="verse-card px-6 py-3 border border-temple-gold text-temple-gold hover:bg-temple-gold hover:text-temple-dark transition"
          >
            Explore Characters
          </Link>
        </motion.div>
      </section>

      {/* Featured Verses */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="subheading-serif mb-8">Featured Verses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="verse-card">
              <p className="text-sm text-temple-gold mb-2">SB 1.1.{i}</p>
              <p className="font-serif text-lg mb-3">Loading verses...</p>
              <p className="text-sm text-parchment opacity-70">Featured teaching from the Bhagavatam</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
