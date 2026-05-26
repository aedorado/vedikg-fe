'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import SiteNav from '../components/SiteNav'

export default function VersesPage() {
  return (
    <main className="min-h-screen bg-temple-dark text-white">
      <SiteNav />

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="heading-serif mb-8">Verses</h1>
        <p className="text-parchment">Verse reader coming soon...</p>
      </section>
    </main>
  )
}
