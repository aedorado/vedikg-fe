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
          className="heading-serif mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Bhagavatam Knowledge Graph
        </motion.h1>
        <motion.p
          className="text-parchment text-lg mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Explore the sacred stories, characters, and relationships of the Śrīmad-Bhāgavatam
        </motion.p>
        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
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
