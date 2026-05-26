'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import SiteNav from '../components/SiteNav'

const KHANDAS = [
  { key: 'adi', label: 'Ādi-khaṇḍa', desc: 'The Beginning' },
  { key: 'madhya', label: 'Madhya-khaṇḍa', desc: 'The Middle Pastimes' },
  { key: 'antya', label: 'Antya-khaṇḍa', desc: 'The Later Pastimes' },
]

export default function CBPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <SiteNav />
      <section className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs px-2 py-0.5 rounded font-medium"
              style={{ backgroundColor: 'color-mix(in srgb, #7c6fa0 20%, transparent)', color: '#c4b5d9' }}>
              CB
            </span>
            <h1 className="heading-serif">Caitanya Bhāgavata</h1>
          </div>
          <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
            Śrīla Vṛndāvana dāsa Ṭhākura · translated by Bhūmipati Dāsa · Commentary by Bhaktisiddhānta Sarasvatī
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {KHANDAS.map((k, i) => (
              <motion.div key={k.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}>
                <Link href={`/cb/${k.key}`} className="block verse-card hover:opacity-90 transition-opacity">
                  <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--gold)' }}>
                    Part {i + 1}
                  </div>
                  <div className="heading-serif text-xl mb-1">{k.label}</div>
                  <div className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{k.desc}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  )
}
